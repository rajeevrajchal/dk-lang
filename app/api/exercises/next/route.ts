import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  pickAuthoredVariantOfType,
  selectNextVariant,
  selectNextTaskType,
  toPublicExercise,
} from "@/lib/exercises/registry";
import { moduleUsesTaskType } from "@/lib/exercises/module-tasks";
import { generateExercise, llmGenerationAvailable } from "@/lib/exercises/generator";
import { LEARNING_MODES } from "@/lib/exercises/mode";
import {
  EXERCISE_CATEGORIES,
  TASK_TYPES,
  type ExerciseCategory,
  type ExerciseVariant,
  type TaskType,
} from "@/lib/exercises/types";

const NextSchema = z.object({
  moduleId: z.number(),
  category: z.enum(EXERCISE_CATEGORIES),
  /**
   * Pin the exercise to one task type. Class uses this for "practise the
   * mindmap opgave"; omitted, the engine rotates through the module's task
   * types exactly as it always did.
   */
  taskType: z.enum(TASK_TYPES).optional(),
  /**
   * Which area asked. Accepted so the caller's intent is explicit and can be
   * logged; "mock" is refused here because a mock test is assembled by
   * /api/mock-test/start, which is what ties the attempts to an ExamSession.
   */
  mode: z.enum(LEARNING_MODES).optional(),
});

// Generation can take a while on a hard task; Next needs to allow for it.
export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = NextSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { moduleId, category, taskType: requestedTaskType, mode } = parsed.data as {
    moduleId: number;
    category: ExerciseCategory;
    taskType?: TaskType;
    mode?: string;
  };

  if (mode === "mock") {
    return NextResponse.json(
      { error: "Mock exercises are assembled by /api/mock-test/start" },
      { status: 400 }
    );
  }

  // A task type the module does not examine would produce an exercise that
  // rehearses the wrong thing, so it is refused rather than quietly ignored.
  if (requestedTaskType && !moduleUsesTaskType(moduleId, category, requestedTaskType)) {
    return NextResponse.json({ error: "Task type not used by this module" }, { status: 400 });
  }

  // Only completed attempts count as history — an abandoned one shouldn't burn
  // a task type or a topic.
  const history = await prisma.exerciseAttempt.findMany({
    where: { userId: session.user.id, moduleId, category, status: "COMPLETED" },
    select: { variantId: true, taskType: true, topic: true, completedAt: true },
    orderBy: { completedAt: "asc" },
  });

  let variant: ExerciseVariant | null = null;
  let generated = false;

  // Preferred path: generate something new. The task type still rotates
  // through the category (Opgave 1 → 2 → 3 → 4) — only the content is fresh.
  if (llmGenerationAvailable()) {
    const taskType = requestedTaskType ?? selectNextTaskType(moduleId, category, history);
    if (taskType) {
      // Topics this learner has already had for this task type, so the
      // generator can steer away from them.
      const usedTopics = history.filter((h) => h.taskType === taskType).map((h) => h.topic);
      const outcome = await generateExercise(taskType, category, moduleId, usedTopics);
      if (outcome.variant) {
        variant = outcome.variant;
        generated = true;
      } else {
        console.warn(`[exercises/next] generation unavailable for ${taskType}: ${outcome.reason}`);
      }
    }
  }

  // Fallback: the hand-authored pool. Keeps practice working with no API key,
  // and covers a failed or invalid generation.
  let isNew = true;
  if (!variant) {
    if (requestedTaskType) {
      // The learner asked for this format specifically, so the fallback has to
      // honour it rather than rotating to a different opgave.
      const authored = pickAuthoredVariantOfType(moduleId, requestedTaskType, history);
      if (!authored) {
        return NextResponse.json({ error: "No exercises available" }, { status: 404 });
      }
      variant = authored;
      isNew = !history.some((h) => h.variantId === authored.variantId);
    } else {
      const picked = selectNextVariant(moduleId, category, history);
      if (!picked) {
        return NextResponse.json({ error: "No exercises available" }, { status: 404 });
      }
      variant = picked.variant;
      isNew = picked.isNew;
    }
  }

  const attempt = await prisma.exerciseAttempt.create({
    data: {
      userId: session.user.id,
      moduleId,
      category,
      taskType: variant.taskType,
      variantId: variant.variantId,
      topic: variant.topic,
      status: "IN_PROGRESS",
      generated,
      // The answer key is stored server-side here and stripped from the
      // response below; it is only revealed once the learner submits.
      variantJson: generated ? JSON.stringify(variant) : null,
    },
  });

  return NextResponse.json({
    ...toPublicExercise(variant, attempt.id, generated ? true : isNew),
    generated,
  });
}
