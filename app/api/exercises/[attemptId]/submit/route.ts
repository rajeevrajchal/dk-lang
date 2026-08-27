import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises, history, tasks as tasksRepo } from "@/lib/repositories";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { gradeExercise } from "@/lib/exercises/grading";
import { baselineFeedback, feedbackSummary } from "@/lib/exercises/feedback";
import { contextFor, questionKeyFor } from "@/lib/exercises/context";
import type { ExerciseVariant, RecordedAnswer } from "@/types";

const SubmitSchema = z.object({
  response: z.record(z.string(), z.string()),
});

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { attemptId } = await params;

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Scoped by userId inside the repository: an attempt id alone must not be
  // enough to read somebody else's answers.
  const attempt = await exercises.findAttempt(session.user.id, attemptId);
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generated exercises carry their own answer key on the attempt row;
  // authored ones are looked up in the registry.
  const variant: ExerciseVariant | undefined = attempt.variantJson
    ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
    : VARIANT_BY_ID.get(attempt.variantId);

  if (!variant) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 410 });
  }

  // Grading happens here, never on the client — the answer key lives only in
  // the variant on the server.
  const result = gradeExercise(variant, parsed.data.response);

  // English feedback on the answers this learner actually gave. Composed
  // offline so submitting stays instant; the richer generated version is
  // fetched separately by /feedback when the learner asks for it.
  const feedback = baselineFeedback(result, variant);

  // Already submitted: return the stored grading rather than re-scoring, so a
  // double submit can't overwrite the first result — or record the same
  // answers into the history twice.
  if (attempt.status === "COMPLETED") {
    const cached = attempt.feedbackJson ? JSON.parse(attempt.feedbackJson) : feedback;
    return NextResponse.json({ alreadySubmitted: true, ...result, feedback: cached });
  }

  await exercises.updateAttempt(session.user.id, attemptId, {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      responseJson: JSON.stringify(parsed.data.response),
      score: result.score,
      total: result.total,
      mistakes: result.mistakes,
      wordCount: result.wordCount ?? null,
    });

  // A sitting of a numbered task also updates that task's summary — the
  // "8/10, last attempted 26 Aug" the task list shows. The attempt row itself
  // is untouched by this and stays the record of what happened; the summary is
  // derived from it, which is why practising again can never erase a result.
  if (attempt.taskId) {
    try {
      await tasksRepo.recordCompletion(session.user.id, attempt.taskId, {
        score: result.score,
        total: result.total,
        mistakes: result.mistakes,
      });
    } catch (err) {
      // The grading is already saved and is what the learner is waiting for.
      console.warn("[exercises/submit] task progress not updated:", err);
    }
  }

  // Every graded answer becomes one row of learning history, whether it was
  // right or wrong. Recording only mistakes would make "have I got better at
  // this?" unanswerable, because there would be nothing to compare against.
  //
  // Writing and speaking produce no graded answers, so they record nothing
  // here — there is no correct answer to have got wrong.
  if (result.answers.length > 0) {
    const feedbackByKey = new Map(feedback.map((f) => [f.key, f]));
    const recorded: RecordedAnswer[] = result.answers.map((a) => {
      const ctx = contextFor(variant, a);
      const f = feedbackByKey.get(a.key);
      return {
        source: "EXERCISE",
        questionKey: questionKeyFor(variant, a.key),
        questionText: ctx.questionText,
        danishText: ctx.danishText,
        passageLabel: ctx.passageLabel,
        passageText: ctx.passageText,
        correctAnswer: a.expected,
        userAnswer: a.given,
        isCorrect: a.isCorrect,
        explanation: f ? feedbackSummary(f) : null,
        grammarTopic: f?.grammarTopic ?? null,
        attemptId,
        examSessionId: attempt.examSessionId,
        moduleId: attempt.moduleId,
        category: attempt.category,
        taskType: attempt.taskType,
        topic: attempt.topic,
      };
    });

    // A failure to record history must not lose the learner their result: the
    // grading is already saved, and the response below is what they are
    // waiting for.
    try {
      await history.recordAnswers(session.user.id, recorded);
    } catch (err) {
      console.warn("[exercises/submit] history not recorded:", err);
    }
  }

  // Inside a mock test the answers stay hidden until the whole test is handed
  // in — showing per-opgave feedback mid-test would let the learner recalibrate
  // on the next opgave, which the real modultest never allows.
  if (attempt.examSessionId) {
    const exam = await exercises.findExamSession(session.user.id, attempt.examSessionId);
    if (exam?.status === "IN_PROGRESS") {
      return NextResponse.json({ recorded: true });
    }
  }

  return NextResponse.json({ ...result, feedback });
};
