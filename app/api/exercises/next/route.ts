import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { selectNextVariant, toPublicExercise } from "@/lib/exercises/registry";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/exercises/types";

const NextSchema = z.object({
  moduleId: z.number(),
  category: z.enum(EXERCISE_CATEGORIES),
});

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

  // History drives both rotations in selectNextVariant, so only completed
  // attempts count — an abandoned one shouldn't burn a variant.
  const history = await prisma.exerciseAttempt.findMany({
    where: { userId: session.user.id, moduleId, category, status: "COMPLETED" },
    select: { variantId: true, taskType: true, completedAt: true },
    orderBy: { completedAt: "asc" },
  });

  const picked = selectNextVariant(moduleId, category, history);
  if (!picked) {
    return NextResponse.json({ error: "No exercises available" }, { status: 404 });
  }

  const attempt = await prisma.exerciseAttempt.create({
    data: {
      userId: session.user.id,
      moduleId,
      category,
      taskType: picked.variant.taskType,
      variantId: picked.variant.variantId,
      topic: picked.variant.topic,
      status: "IN_PROGRESS",
    },
  });

  return NextResponse.json(
    toPublicExercise(picked.variant, attempt.id, picked.isNew)
  );
}
