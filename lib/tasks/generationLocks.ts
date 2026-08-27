// In-process dedupe for background task generation.
//
// The open routes now defer a cold slot's generation to `after()` and answer
// the request immediately, so the client polls back until it is ready.
// Without this, every poll that still finds the slot empty would kick off its
// own AI call for the same slot — wasted model spend for work only one of
// them needs to do.
//
// Deliberately not persisted: it only has to survive the seconds between
// polls within one server process. A slot claimed twice across separate
// processes still resolves correctly — Task's own unique constraint in
// lib/repositories/tasks.ts settles that race the same way it always has —
// it just costs one extra model call in that rarer case, which is cheaper
// than a database migration for a lock table this app has no other need for.

const inFlight = new Set<string>();

const keyFor = (moduleId: number, category: string, taskType: string, taskNumber: number): string =>
  `${moduleId}:${category}:${taskType}:${taskNumber}`;

/** True if this call just claimed the slot and should do the work; false if another call already has it. */
export const claimGeneration = (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number
): boolean => {
  const key = keyFor(moduleId, category, taskType, taskNumber);
  if (inFlight.has(key)) return false;
  inFlight.add(key);
  return true;
};

/** Releases a slot claimed with claimGeneration. Always call this when the work finishes, success or not. */
export const releaseGeneration = (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number
): void => {
  inFlight.delete(keyFor(moduleId, category, taskType, taskNumber));
};
