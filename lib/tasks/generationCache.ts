import type { TaskRow } from "@/types";

// In-process cache for a just-generated task, bridging the gap between "the
// model answered" and "the write to Supabase committed."
//
// Without this, a poll landing in that gap sees neither an in-flight claim
// (generateExercise already returned) nor a database row (the insert has not
// finished) and reports "preparing" for one extra cycle it did not need to.
// The model call is what the learner is actually waiting 68-152s for; the
// Supabase round trip is a network hop on top of that wait, not part of it —
// so the task is put in front of the learner the moment it exists in memory,
// and the write to Supabase happens after, on its own time.
//
// Same lifetime and same non-guarantees as generationLocks.ts: process-local,
// cleared once the write settles either way, and never the source of truth —
// tasksRepo.findTask (Supabase) is. A slot generated twice across processes
// still resolves the same way it always has, through the unique index on the
// slot in lib/repositories/tasks.ts.

const cache = new Map<string, TaskRow>();

const keyFor = (moduleId: number, category: string, taskType: string, taskNumber: number): string =>
  `${moduleId}:${category}:${taskType}:${taskNumber}`;

/** Makes a freshly generated task visible to pollers before it has been written to Supabase. */
export const setGeneratedTask = (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number,
  task: TaskRow
): void => {
  cache.set(keyFor(moduleId, category, taskType, taskNumber), task);
};

/** The task for this slot if it was generated in this process and has not yet been evicted. */
export const getGeneratedTask = (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number
): TaskRow | undefined => cache.get(keyFor(moduleId, category, taskType, taskNumber));

/** Call once the write to Supabase has settled — success or failure, it stops being this cache's job. */
export const clearGeneratedTask = (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number
): void => {
  cache.delete(keyFor(moduleId, category, taskType, taskNumber));
};
