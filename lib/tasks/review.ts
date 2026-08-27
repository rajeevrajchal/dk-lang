import "server-only";

import { exercises, tasks as tasksRepo } from "@/lib/repositories";
import { gradeExercise } from "@/lib/exercises/grading";
import { baselineFeedback } from "@/lib/exercises/feedback";
import { extractExplainableText } from "@/lib/exercises/explainable";
import { variantOf } from "./service";
import type {
  AnswerFeedback,
  ExerciseResponse,
  ExerciseResult,
  ExerciseVariant,
  TaskRow,
} from "@/types";

// Re-reading a past sitting.
//
// The result is RE-DERIVED from the answers the learner gave and the task's
// own content, rather than stored as a rendered thing. Two reasons, and the
// second is why it is worth the recomputation:
//
//   1. grading is already a pure function of (variant, response), so storing
//      its output would be a second copy of something that cannot drift;
//   2. the feedback improves. A learner reviewing a task from last week gets
//      the explanation the app can write today, including the generated one if
//      it has since been paid for, rather than whatever was rendered at the
//      time.
//
// Scores are NOT recomputed — `ExerciseAttempt.score` is what was recorded and
// stays authoritative. This regenerates the explanation of a result, never the
// result.

export interface AttemptReview {
  attemptId: string;
  at: string;
  task: TaskRow;
  variantTitle: string;
  result: ExerciseResult;
  feedback: AnswerFeedback[];
  /**
   * The Danish the questions were asked about, labelled.
   *
   * Taken from the same extractor the explanation flow uses, so the review
   * shows exactly the text the task was built on rather than a second idea of
   * what "the passage" means. Empty for a task that hands the learner no
   * Danish to read — a speaking prompt, or a writing task with no email.
   */
  passages: { label: string; danish: string }[];
  /** What was actually recorded at the time, which is what the score means. */
  recorded: { score: number | null; total: number | null; mistakes: number | null };
}

export const reviewAttempt = async (
  userId: string,
  attemptId: string
): Promise<AttemptReview | null> => {
  const attempt = await exercises.findAttempt(userId, attemptId);
  if (!attempt || attempt.status !== "COMPLETED" || !attempt.taskId) return null;

  const task = await tasksRepo.findTaskById(attempt.taskId);
  if (!task) return null;

  const variant = variantOf(task);
  if (!variant) return null;

  const response = (attempt.responseJson ? JSON.parse(attempt.responseJson) : {}) as ExerciseResponse;
  const result = gradeExercise(variant, response);

  // The generated feedback if it was ever paid for, the offline baseline
  // otherwise — the same rule the result screen follows.
  const feedback: AnswerFeedback[] = attempt.feedbackJson
    ? (JSON.parse(attempt.feedbackJson) as AnswerFeedback[])
    : baselineFeedback(result, variant);

  return {
    attemptId: attempt.id,
    at: attempt.completedAt ?? attempt.startedAt,
    task,
    variantTitle: (variant as ExerciseVariant).title,
    result,
    feedback,
    passages: extractExplainableText(variant) ?? [],
    recorded: {
      score: attempt.score,
      total: attempt.total,
      mistakes: attempt.mistakes,
    },
  };
};
