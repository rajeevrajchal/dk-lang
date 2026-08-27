import { NextResponse, after } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises, tasks as tasksRepo } from "@/lib/repositories";
import { ensureTask, ensureTaskFast, variantOf } from "@/lib/tasks/service";
import { claimGeneration, releaseGeneration } from "@/lib/tasks/generationLocks";
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

// Generation itself now happens in `after()`, past the point where this
// route's own response is sent — but on a host that enforces maxDuration,
// that background work still shares this invocation's budget. Measured
// directly against the real prompt, one exercise-generation call takes
// 68-152s; ensureTask retries once on validation failure, so two full
// attempts (each timed out at 220s in lib/exercises/generator.ts) still needs
// real headroom even though the client is never the one waiting on it.
export const maxDuration = 480;

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

  // Existing row or hand-authored pool only — never a model call, so this
  // always settles in a couple of DB round trips. `null` means the slot needs
  // generation, which is the one part of opening a task that can take minutes
  // rather than milliseconds — too long to hold this request open for.
  const fast = await ensureTaskFast(moduleId, category, taskType, taskNumber);

  if (!fast) {
    // Defer the model call to after the response is sent, so the learner gets
    // an answer immediately instead of a connection held open for however
    // long generation takes. claimGeneration stops a second poll for the same
    // slot from starting its own redundant AI call while this one is still
    // running.
    if (claimGeneration(moduleId, category, taskType, taskNumber)) {
      after(async () => {
        try {
          await ensureTask(moduleId, category, taskType, taskNumber);
        } catch (err) {
          console.warn(
            `[tasks/open] background generation of ${taskType} #${taskNumber} failed:`,
            err instanceof Error ? err.message : err
          );
        } finally {
          releaseGeneration(moduleId, category, taskType, taskNumber);
        }
      });
    }
    return NextResponse.json({ ready: false, status: "preparing" }, { status: 202 });
  }

  const { task, reason } = fast;
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

  // Warm the next slot in the ladder. Runs after the response is sent, so it
  // never adds to what this learner waits for — it is a bet that whoever just
  // opened Task N is heading for Task N+1 next, which is how practice
  // actually goes for anyone working through a category in order. ensureTask
  // is already a no-op read when the slot is filled, so this costs nothing on
  // every open after the first that reaches it, and a failure here is
  // invisible: the slot just generates the normal way whenever it is next
  // opened for real.
  if (taskNumber < TASKS_PER_TYPE) {
    after(async () => {
      try {
        await ensureTask(moduleId, category, taskType, taskNumber + 1);
      } catch (err) {
        console.warn(
          `[tasks/open] prefetch of ${taskType} #${taskNumber + 1} failed:`,
          err instanceof Error ? err.message : err
        );
      }
    });
  }

  return NextResponse.json({
    ...toPublicExercise(variant, attempt.id, true),
    ready: true,
    generated: task.source === "GENERATED",
    taskId: task.id,
    taskNumber: task.taskNumber,
    difficulty: task.difficulty,
  });
};
