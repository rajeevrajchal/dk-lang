import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exercises, history } from "@/lib/repositories";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { gradeExercise } from "@/lib/exercises/grading";
import { feedbackSummary, generateFeedback } from "@/lib/exercises/feedback";
import { questionKeyFor } from "@/lib/exercises/context";
import type { ExerciseResponse, ExerciseVariant } from "@/types";

// "Why was I wrong?" — the deeper English explanation of this learner's own
// answers.
//
// Separate from /submit rather than part of it, and that split is the whole
// design: submitting has to be instant, and a model call is not. Submitting
// returns the offline baseline immediately; this route replaces it with the
// generated version when the learner asks, caches it on the attempt, and
// updates the history rows so the mistake review shows the same explanation
// the learner read at the time.

export const maxDuration = 180;

export const POST = async (
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { attemptId } = await params;

  const attempt = await exercises.findAttempt(session.user.id, attemptId);
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Feedback names the right answers, so it is available only once the learner
  // has answered — and, inside a mock test, once the test is handed in.
  if (attempt.status !== "COMPLETED") {
    return NextResponse.json({ error: "Answer the exercise first" }, { status: 409 });
  }
  if (attempt.examSessionId) {
    const exam = await exercises.findExamSession(session.user.id, attempt.examSessionId);
    if (exam?.status !== "COMPLETED") {
      return NextResponse.json({ error: "Finish the test first" }, { status: 409 });
    }
  }

  if (attempt.feedbackJson) {
    return NextResponse.json({ cached: true, feedback: JSON.parse(attempt.feedbackJson) });
  }

  const variant: ExerciseVariant | undefined = attempt.variantJson
    ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
    : VARIANT_BY_ID.get(attempt.variantId);
  if (!variant) return NextResponse.json({ error: "Unknown exercise" }, { status: 410 });

  const response = (attempt.responseJson ? JSON.parse(attempt.responseJson) : {}) as ExerciseResponse;
  const result = gradeExercise(variant, response);

  const { feedback, reason } = await generateFeedback(result, variant);

  // Cached only when the model actually answered: caching the offline baseline
  // would mean the learner could never get the real explanation afterwards.
  const generated = feedback.some((f) => f.source === "generated");
  if (generated) {
    await exercises.updateAttempt(session.user.id, attemptId, {
      feedbackJson: JSON.stringify(feedback),
    });
    // The history keeps the explanation the learner was actually shown.
    await history.updateExplanations(
      session.user.id,
      attemptId,
      new Map(
        feedback
          .filter((f) => !f.isCorrect)
          .map((f) => [questionKeyFor(variant, f.key), feedbackSummary(f)])
      )
    );
  }

  return NextResponse.json({ cached: false, generated, feedback, reason });
};
