import { NextResponse, after } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { exercises } from "@/lib/repositories";
import { MODULES } from "@/lib/curriculum/modules";
import { pickAuthoredVariantOfType, toPublicExercise } from "@/lib/exercises/registry";
import { generateExercise, llmGenerationAvailable } from "@/lib/exercises/generator";
import { ensureTask, ensureTaskFast, variantOf } from "@/lib/tasks/service";
import { claimGeneration, releaseGeneration } from "@/lib/tasks/generationLocks";
import { TASKS_PER_TYPE } from "@/lib/tasks/catalogue";
import { getUserLevel } from "@/lib/level";
import { moduleFor } from "@/lib/tasks/module";
import { EXERCISE_CATEGORIES } from "@/lib/exercises/constants";
import type { ExerciseCategory, ExerciseVariant, MaterialiseOutcome, TaskType } from "@/types";

// Starting a mock test.
//
// THE MODULE IS NOT A PARAMETER any more. It comes from the learner's profile,
// like everywhere else — a mock test is a simulation of the test they are
// actually preparing for, and asking which one to simulate was the same
// redundant question Class used to ask.
//
// Two ways to assemble a test, and the numbered one is the reason this route
// changed:
//
//   numbered   Test 7 is Task 7 of each part, taken from the same ladders
//              Class practises against. It is the SAME test every time, so a
//              second sitting is comparable with the first, and it uses the
//              task architecture rather than a private copy of it.
//   rotating   the original behaviour: assemble something fresh. Kept for the
//              full test with no number, which is what "just give me a test"
//              means.

const StartSchema = z.object({
  /**
   * Which numbered test. Omitted, a fresh test is assembled the way it always
   * was.
   */
  testNumber: z.number().int().min(1).max(TASKS_PER_TYPE).optional(),
  /**
   * Limits the test to one section. Omitted, the test is the full plan below —
   * every reading opgave and then the writing task.
   */
  category: z.enum(EXERCISE_CATEGORIES).optional(),
});

// Assembling five exercises can mean five generation calls; they run in
// parallel, but the route still needs room. Matches the 480s in
// app/api/tasks/open/route.ts for the same measured reason (68-152s per
// generation, retried once on validation failure). The next-test prefetch
// below runs after the response and is best-effort — a host that cuts it off
// at its own limit loses nothing, the slot just generates normally later.
export const maxDuration = 480;

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

/** A section on its own gets proportionally less time than the whole test. */
const secondsFor = (parts: number) => Math.round((MOCK_TEST_SECONDS / TEST_PLAN.length) * parts);

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = StartSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { testNumber, category } = parsed.data;

  const level = await getUserLevel(userId);
  const moduleId = moduleFor(level.currentModule);
  const mod = MODULES.find((m) => m.id === moduleId);
  if (!mod) return NextResponse.json({ error: "Unknown module" }, { status: 404 });

  const plan = category ? TEST_PLAN.filter((p) => p.category === category) : TEST_PLAN;
  if (plan.length === 0) {
    return NextResponse.json({ error: "No test of that kind" }, { status: 404 });
  }

  // --- assemble -----------------------------------------------------------
  let variants: (ExerciseVariant | null)[];
  // Set for a numbered test, so each part's attempt is linked to the task it
  // is a sitting of — which is what keeps a mock sitting in the same history
  // as practising that task.
  let taskIds: (string | null)[] = plan.map(() => null);

  if (testNumber != null) {
    // Existing rows or the authored pool only — never a model call, so this
    // settles in a couple of DB round trips per part. A part that comes back
    // null needs generation, which is what can turn "start the test" into a
    // multi-minute wait if made to block on it.
    const fastResults = await Promise.all(
      plan.map(({ taskType, category: partCategory }) =>
        ensureTaskFast(moduleId, partCategory, taskType, testNumber)
      )
    );
    const notReady = plan.filter((_, i) => fastResults[i] === null);

    if (notReady.length > 0) {
      // Defer every missing part to after the response is sent, same pattern
      // as /api/tasks/open: the learner gets an instant answer and the client
      // polls this same route until every part is ready. claimGeneration
      // stops a re-poll for a part still generating from starting a second,
      // redundant model call for it.
      for (const { taskType, category: partCategory } of notReady) {
        if (claimGeneration(moduleId, partCategory, taskType, testNumber)) {
          after(async () => {
            try {
              await ensureTask(moduleId, partCategory, taskType, testNumber);
            } catch (err) {
              console.warn(
                `[mock-test] background generation of ${taskType} test ${testNumber} failed:`,
                err instanceof Error ? err.message : err
              );
            } finally {
              releaseGeneration(moduleId, partCategory, taskType, testNumber);
            }
          });
        }
      }
      return NextResponse.json({ ready: false, status: "preparing" }, { status: 202 });
    }

    const built = fastResults as MaterialiseOutcome[];
    variants = built.map((b) => (b.task ? variantOf(b.task) : null));
    taskIds = built.map((b) => b.task?.id ?? null);

    const missing = built.find((b) => !b.task);
    if (missing) {
      return NextResponse.json(
        {
          error: "unavailable",
          reason: missing.reason ?? "This test could not be assembled.",
        },
        { status: 503 }
      );
    }

    // Warm every part of the next numbered test, same bet as the single-task
    // prefetch in /api/tasks/open: whoever just sat Test N is the likeliest
    // person to sit Test N+1 next. Runs after the response is sent, and each
    // ensureTask is already a no-op read for a part that is filled, so this is
    // free on every start after the first that reaches a given slot.
    if (testNumber < TASKS_PER_TYPE) {
      const nextTestNumber = testNumber + 1;
      after(async () => {
        const outcomes = await Promise.allSettled(
          plan.map(({ taskType, category: partCategory }) =>
            ensureTask(moduleId, partCategory, taskType, nextTestNumber)
          )
        );
        for (const [i, outcome] of outcomes.entries()) {
          if (outcome.status === "rejected") {
            console.warn(
              `[mock-test] prefetch of ${plan[i].taskType} for test ${nextTestNumber} failed:`,
              outcome.reason instanceof Error ? outcome.reason.message : outcome.reason
            );
          }
        }
      });
    }
  } else {
    const history = (await exercises.completedHistory(userId, { moduleId })).map((h) => ({
      ...h,
      completedAt: h.completedAt ? new Date(h.completedAt) : null,
    }));

    // Build all of them in parallel — serially this would be minutes of
    // waiting. Each slot degrades on its own: a failed generation falls back
    // to the authored pool rather than failing the whole test.
    variants = await Promise.all(
      plan.map(async ({ taskType, category: partCategory }): Promise<ExerciseVariant | null> => {
        if (llmGenerationAvailable()) {
          const usedTopics = history.filter((h) => h.taskType === taskType).map((h) => h.topic);
          const outcome = await generateExercise(taskType, partCategory, moduleId, usedTopics);
          if (outcome.variant) return outcome.variant;
          console.warn(`[mock-test] generation failed for ${taskType}: ${outcome.reason}`);
        }
        return pickAuthoredVariantOfType(moduleId, taskType, history);
      })
    );
  }

  if (variants.some((v) => v === null)) {
    return NextResponse.json(
      { error: "Could not assemble a full test at your level" },
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
      // A numbered test always carries its content, because the task's copy is
      // the authority for what Test 7 IS — the registry could not answer that.
      variantJson: taskIds[i] || generated ? JSON.stringify(variant) : null,
      examSessionId: examSession.id,
      orderIndex: i,
      taskId: taskIds[i],
    });
    built.push({ ...toPublicExercise(variant, attempt.id, true), generated });
  }

  return NextResponse.json({
    ready: true,
    sessionId: examSession.id,
    timeLimitSeconds: secondsFor(plan.length),
    exercises: built,
  });
};
