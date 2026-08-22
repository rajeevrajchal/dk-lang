import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { applyInAppExamResult, EXAM_PASS_THRESHOLD } from "@/lib/unlock";
import { VARIANT_BY_ID } from "@/lib/exercises/registry";
import { isExplainable } from "@/lib/exercises/explainable";
import { gradeExercise } from "@/lib/exercises/grading";
import { TASK_NUMBER } from "@/lib/exercises/types";
import type { ExerciseResponse, ExerciseVariant, TaskType } from "@/lib/exercises/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sessionId } = await params;

  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: { exerciseAttempts: { orderBy: { orderIndex: "asc" } } },
  });
  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parts = examSession.exerciseAttempts.map((attempt) => {
    const variant: ExerciseVariant | undefined = attempt.variantJson
      ? (JSON.parse(attempt.variantJson) as ExerciseVariant)
      : VARIANT_BY_ID.get(attempt.variantId);

    // Unanswered opgaver still count — leaving one blank in the real test
    // costs you those marks.
    const response: ExerciseResponse = attempt.responseJson
      ? (JSON.parse(attempt.responseJson) as ExerciseResponse)
      : {};

    const result = variant
      ? gradeExercise(variant, response)
      : { score: null, total: null, mistakes: null, answers: [] };

    return {
      attemptId: attempt.id,
      orderIndex: attempt.orderIndex ?? 0,
      category: attempt.category,
      taskType: attempt.taskType,
      taskNumber: TASK_NUMBER[attempt.taskType as TaskType] ?? null,
      topic: attempt.topic,
      title: variant?.title ?? attempt.topic,
      answered: attempt.status === "COMPLETED",
      explainable: variant ? isExplainable(variant) : false,
      ...result,
    };
  });

  const readingParts = parts.filter((p) => p.category === "READING" && p.total != null);
  const readingCorrect = readingParts.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const readingTotal = readingParts.reduce((sum, p) => sum + (p.total ?? 0), 0);
  const readingScore = readingTotal > 0 ? readingCorrect / readingTotal : 0;
  const readingPassed = readingTotal > 0 && readingScore >= EXAM_PASS_THRESHOLD;

  const writingPart = parts.find((p) => p.category === "WRITING");

  if (examSession.status !== "COMPLETED") {
    await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        scoresJson: JSON.stringify({ READING: readingScore }),
        passedJson: JSON.stringify({ READING: readingPassed }),
      },
    });

    // Reading is the only discipline this test can score objectively, so it is
    // the only in-app signal recorded. Writing is deliberately not turned into
    // a pass/fail — there is no examiner here, and the app never certifies a
    // result it did not actually assess (see lib/unlock.ts).
    await applyInAppExamResult(
      session.user.id,
      examSession.moduleId,
      "READING",
      readingScore,
      readingPassed
    );
  }

  return NextResponse.json({
    moduleId: examSession.moduleId,
    reading: {
      correct: readingCorrect,
      total: readingTotal,
      score: readingScore,
      passed: readingPassed,
      threshold: EXAM_PASS_THRESHOLD,
    },
    writing: writingPart
      ? {
          answered: writingPart.answered,
          wordCount: writingPart.wordCount ?? 0,
          minWords: writingPart.minWords ?? null,
        }
      : null,
    parts,
  });
}
