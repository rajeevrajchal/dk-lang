import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureTask } from "@/lib/tasks/service";
import type { ExerciseCategory } from "@/types";

// One-off batch seeding: pre-fills a sample of reading task slots across the
// difficulty ladder so most opens hit the DB instead of a live AI generation
// call. Calls ensureTask exactly as a real open does — it skips a slot that
// already has a row and only calls the model when nothing else can fill it —
// so re-running this is always safe and cheap on a second pass.
//
// Temporary and dev-only. Not a general-purpose admin endpoint: the job list
// is fixed in code rather than accepted from the caller, and it is gone once
// the seeding this was written for is done.

const MODULE_ID = 2;
const CATEGORY: ExerciseCategory = "READING";

const TASK_TYPES = [
  "reading_task_1_matching",
  "reading_task_2_wrong_sentence",
  "reading_task_3_missing_words",
  "reading_task_4_people_matching",
] as const;

// 4 per band x 5 bands = 20 per type. Bands: easy 1-10, easy_medium 11-20,
// medium 21-35, medium_hard 36-45, hard 46-50 (lib/tasks/catalogue.ts).
const TASK_NUMBERS = [1, 4, 7, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40, 42, 44, 46, 48, 49, 50];

export const maxDuration = 1800;

type Job = { taskType: (typeof TASK_TYPES)[number]; taskNumber: number };

const runJob = async (job: Job) => {
  const start = Date.now();
  try {
    const { task, reason } = await ensureTask(MODULE_ID, CATEGORY, job.taskType, job.taskNumber);
    return {
      ...job,
      elapsedS: Math.round((Date.now() - start) / 100) / 10,
      ok: !!task,
      source: task?.source,
      title: task?.title,
      reason,
    };
  } catch (err) {
    return {
      ...job,
      elapsedS: Math.round((Date.now() - start) / 100) / 10,
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};

export const POST = async () => {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs: Job[] = [];
  for (const taskType of TASK_TYPES) {
    for (const taskNumber of TASK_NUMBERS) {
      jobs.push({ taskType, taskNumber });
    }
  }

  const CONCURRENCY = 3;
  const results: Awaited<ReturnType<typeof runJob>>[] = [];
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < jobs.length) {
      const i = cursor++;
      results.push(await runJob(jobs[i]));
    }
  });
  await Promise.all(workers);

  return NextResponse.json({
    total: jobs.length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
  });
};
