import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises, tasks as tasksRepo } from "@/lib/repositories";
import { ensureTask, variantOf } from "@/lib/tasks/service";
import { toPublicExercise } from "@/lib/exercises/registry";
import { practiceType, TASKS_PER_TYPE } from "@/lib/tasks/catalogue";
import { getUserLevel } from "@/lib/level";
import { EXERCISE_CATEGORIES } from "@/lib/exercises/constants";
import { DEFAULT_MODULE } from "@/lib/tasks/module";
import type { ExerciseCategory } from "@/types";

// Opening a numbered task.
//
// One route for every category, because a task is a task: Reading Task 14 and
// Writing Task 3 differ in their content, not in what "open task 14" means.
// That is what stops this becoming four near-identical endpoints.
//
// THE MODULE IS NOT A PARAMETER. It is read from the learner's profile, which
// is the point of the whole restructure — the learner told us their level at
// onboarding and must not be asked again to open an exercise. A request cannot
// ask for another module's content even by hand-editing it.

const OpenSchema = z.object({
  category: z.enum(EXERCISE_CATEGORIES),
  taskType: z.string().min(1).max(60),
  taskNumber: z.number().int().min(1).max(TASKS_PER_TYPE),
});

// Filling an empty slot may involve writing a whole opgave.
export const maxDuration = 300;

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = OpenSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { category, taskType, taskNumber } = parsed.data as {
    category: ExerciseCategory;
    taskType: string;
    taskNumber: number;
  };

  if (!practiceType(taskType)) {
    return NextResponse.json({ error: "Unknown practice type" }, { status: 404 });
  }

  const level = await getUserLevel(session.user.id);
  const moduleId = level.currentModule ?? DEFAULT_MODULE;

  const { task, reason } = await ensureTask(moduleId, category, taskType, taskNumber);
  if (!task) {
    return NextResponse.json(
      { error: "unavailable", reason: reason ?? "This task could not be prepared." },
      { status: 503 }
    );
  }

  const variant = variantOf(task);
  if (!variant) {
    return NextResponse.json({ error: "Task content is unreadable" }, { status: 500 });
  }

  // A fresh attempt every time, never an update of the last one. That is what
  // makes the attempt history a history: practising Task 14 a second time adds
  // a row rather than overwriting the 6/10 the learner is trying to beat.
  const attempt = await exercises.createAttempt({
    userId: session.user.id,
    moduleId,
    category,
    taskType,
    variantId: task.variantId,
    topic: task.topic,
    status: "IN_PROGRESS",
    generated: task.source === "GENERATED",
    // Kept on the attempt as well as on the task: grading reads it from here,
    // exactly as it did before numbered tasks existed, so /submit needed no
    // special case for them.
    variantJson: task.contentJson,
    taskId: task.id,
  });

  await tasksRepo.markOpened(session.user.id, task.id);

  return NextResponse.json({
    ...toPublicExercise(variant, attempt.id, true),
    generated: task.source === "GENERATED",
    taskId: task.id,
    taskNumber: task.taskNumber,
    difficulty: task.difficulty,
  });
};
