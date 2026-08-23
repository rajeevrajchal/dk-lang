import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises } from "@/lib/repositories";
import { MODULES } from "@/lib/curriculum/modules";
import { pickAuthoredVariantOfType, toPublicExercise } from "@/lib/exercises/registry";
import { generateExercise, llmGenerationAvailable } from "@/lib/exercises/generator";
import type { ExerciseCategory, ExerciseVariant, TaskType } from "@/types";

const StartSchema = z.object({ moduleId: z.number() });

// Assembling five exercises can mean five generation calls; they run in
// parallel, but the route still needs room.
export const maxDuration = 300;

/**
 * The shape of the real Modul 2 modultest, shortened: all four Læsning
 * opgaver in order, then one Skrivning opgave. Same sequence as the paper
 * test, so sitting this rehearses the actual running order.
 */
const TEST_PLAN: { taskType: TaskType; category: ExerciseCategory }[] = [
  { taskType: "reading_task_1_matching", category: "READING" },
  { taskType: "reading_task_2_wrong_sentence", category: "READING" },
  { taskType: "reading_task_3_missing_words", category: "READING" },
  { taskType: "reading_task_4_people_matching", category: "READING" },
  { taskType: "writing_email", category: "WRITING" },
];

// Shortened from the real test (Læsning and Skrivning are ~45 minutes each);
// this covers roughly half the volume in one sitting.
export const MOCK_TEST_SECONDS = 40 * 60;

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = StartSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { moduleId } = parsed.data;

  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return NextResponse.json({ error: "Unknown module" }, { status: 404 });

  const history = (await exercises.completedHistory(userId, { moduleId })).map((h) => ({
    ...h,
    completedAt: h.completedAt ? new Date(h.completedAt) : null,
  }));

  // Build all five in parallel — serially this would be minutes of waiting.
  // Each slot degrades on its own: a failed generation falls back to the
  // authored pool rather than failing the whole test.
  const variants = await Promise.all(
    TEST_PLAN.map(async ({ taskType, category }): Promise<ExerciseVariant | null> => {
      if (llmGenerationAvailable()) {
        const usedTopics = history.filter((h) => h.taskType === taskType).map((h) => h.topic);
        const outcome = await generateExercise(taskType, category, moduleId, usedTopics);
        if (outcome.variant) return outcome.variant;
        console.warn(`[mock-test] generation failed for ${taskType}: ${outcome.reason}`);
      }
      return pickAuthoredVariantOfType(moduleId, taskType, history);
    })
  );

  if (variants.some((v) => v === null)) {
    return NextResponse.json(
      { error: "Could not assemble a full test for this module" },
      { status: 404 }
    );
  }

  const examSession = await exercises.createExamSession({
    userId,
    moduleId,
    examType: mod.isFinalExam ? "PD3" : "MODULTEST",
    status: "IN_PROGRESS",
  });

  // Named `built` rather than `exercises`: that name now belongs to the
  // repository import at the top of the file.
  const built = [];
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]!;
    const generated = variant.variantId.startsWith("gen-");
    const attempt = await exercises.createAttempt({
        userId,
        moduleId,
        category: variant.category,
        taskType: variant.taskType,
        variantId: variant.variantId,
        topic: variant.topic,
        status: "IN_PROGRESS",
        generated,
        variantJson: generated ? JSON.stringify(variant) : null,
        examSessionId: examSession.id,
        orderIndex: i,
    });
    built.push({ ...toPublicExercise(variant, attempt.id, true), generated });
  }

  return NextResponse.json({
    sessionId: examSession.id,
    timeLimitSeconds: MOCK_TEST_SECONDS,
    exercises: built,
  });
};
