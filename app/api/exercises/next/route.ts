import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { selectNextVariant, selectNextTaskType, toPublicExercise } from "@/lib/exercises/registry";
import { generateExercise, llmGenerationAvailable } from "@/lib/exercises/generator";
import { EXERCISE_CATEGORIES, type ExerciseCategory, type ExerciseVariant } from "@/lib/exercises/types";

const NextSchema = z.object({
  moduleId: z.number(),
  category: z.enum(EXERCISE_CATEGORIES),
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
  const { moduleId, category } = parsed.data as {
    moduleId: number;
    category: ExerciseCategory;
  };

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
    const taskType = selectNextTaskType(moduleId, category, history);
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
    const picked = selectNextVariant(moduleId, category, history);
    if (!picked) {
      return NextResponse.json({ error: "No exercises available" }, { status: 404 });
    }
    variant = picked.variant;
    isNew = picked.isNew;
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
