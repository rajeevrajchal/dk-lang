import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises } from "@/lib/repositories";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { nextExaminerTurn, scriptedExaminerTurn, examinerAvailable } from "@/lib/exercises/examiner";
import {
  advanceStage,
  currentStage,
  initialSpeakingState,
  isStageComplete,
  isTaskComplete,
  recordCandidateTurn,
  recordExaminerTurn,
  stagesFor,
  uncoveredTargets,
  type SpeakingState,
} from "@/lib/exercises/speaking-state";
import type { ExerciseVariant } from "@/lib/exercises/types";

const TurnSchema = z.object({
  /** What the candidate said. Omitted on the very first turn. */
  answer: z.string().optional(),
  /** Move to the next stage instead of asking another question. */
  advance: z.boolean().optional(),
});

export const maxDuration = 120;

/**
 * Drives one turn of a speaking conversation.
 *
 * The app owns progression: it records the answer, updates coverage, decides
 * the goal for the next question, and decides when a stage is done. The model
 * is asked only to phrase the next question. Without an API key a scripted
 * turn is used instead, which still respects state — so the conversation
 * works, it just doesn't react to the exact wording.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { attemptId } = await params;

  const parsed = TurnSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Scoped by userId inside the repository: an attempt id alone must not be
  // enough to read somebody else's answers.
  const attempt = await exercises.findAttempt(session.user.id, attemptId);
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.category !== "SPEAKING") {
    return NextResponse.json({ error: "Not a speaking exercise" }, { status: 400 });
  }

  const variant: ExerciseVariant | undefined = attempt.variantJson
    ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
    : VARIANT_BY_ID.get(attempt.variantId);
  if (!variant) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 410 });
  }

  let state: SpeakingState = attempt.speakingStateJson
    ? (JSON.parse(attempt.speakingStateJson) as SpeakingState)
    : initialSpeakingState(variant);

  // Record what the candidate said before deciding what to ask next.
  if (parsed.data.answer?.trim()) {
    state = recordCandidateTurn(state, parsed.data.answer.trim());
  }

  // Stage progression is the app's call, not the model's.
  if (parsed.data.advance || isStageComplete(state)) {
    state = advanceStage(state);
  }

  if (isTaskComplete(state)) {
    await exercises.updateAttempt(session.user.id, attemptId, { speakingStateJson: JSON.stringify(state) });
    return NextResponse.json({ done: true, state, stages: stagesFor(state) });
  }

  const outcome = examinerAvailable()
    ? await nextExaminerTurn(variant, state, parsed.data.answer ?? null)
    : { turn: null as null, reason: "no ANTHROPIC_API_KEY set" };

  const turn = outcome.turn ?? scriptedExaminerTurn(variant, state);

  // Merge the model's coverage judgement into the app's record.
  if (turn.coveredByLastAnswer.length > 0) {
    const confirmed = turn.coveredByLastAnswer.filter((t) => state.allTargets.includes(t));
    state = { ...state, coveredTargets: [...new Set([...state.coveredTargets, ...confirmed])] };
  }
  state = recordExaminerTurn(state, turn.question, turn.target ?? undefined);

  await exercises.updateAttempt(session.user.id, attemptId, { speakingStateJson: JSON.stringify(state) });

  return NextResponse.json({
    done: false,
    question: turn.question,
    target: turn.target,
    stage: currentStage(state),
    stageIndex: state.stageIndex,
    stages: stagesFor(state),
    covered: state.coveredTargets,
    uncovered: uncoveredTargets(state),
    /** False when the scripted fallback was used, so the UI can say so. */
    adaptive: outcome.turn !== null,
    state,
  });
}
