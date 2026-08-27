import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { verbs as verbsRepo } from "@/lib/repositories";
import { buildRound, selectVerbsForRound } from "@/lib/verbs/practice";
import { VERB_PRACTICE_MODES, VERB_ROUND_SIZE } from "@/lib/verbs/constants";
import { VERB_BY_ID } from "@/lib/verbs";
import type { VerbPracticeMode, VerbQuestion } from "@/types";

// A round of verb practice.
//
// The answers are sent to the browser with the questions, which is a departure
// from how opgaver work — there the key never leaves the server. It is safe
// and deliberate here: a verb round is a self-test, not a score that unlocks
// anything, and marking locally is what lets a learner answer ten questions
// without ten round trips. The result is still recorded server-side by
// /api/verbs/answer, which re-derives the correct answer from the question key
// rather than trusting what the browser says it was.

const PracticeSchema = z.object({
  modes: z.array(z.enum(VERB_PRACTICE_MODES)).optional(),
  count: z.number().int().min(1).max(30).optional(),
  /** Practise a specific set — "review the eight verbs I keep getting wrong". */
  verbIds: z.array(z.string()).max(30).optional(),
});

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = PracticeSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { modes, count = VERB_ROUND_SIZE, verbIds } = parsed.data;

  const progress = await verbsRepo.withProgress(session.user.id);

  const chosen = verbIds?.length
    ? verbIds.map((id) => VERB_BY_ID.get(id)).filter((v) => v !== undefined)
    : selectVerbsForRound(progress, count);

  if (chosen.length === 0) {
    return NextResponse.json({ error: "No verbs to practise" }, { status: 404 });
  }

  const questions: VerbQuestion[] = buildRound(
    chosen,
    modes as VerbPracticeMode[] | undefined
  );

  return NextResponse.json({ questions });
};
