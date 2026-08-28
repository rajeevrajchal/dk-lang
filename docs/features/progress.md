# Feature: Progress

## Purpose
The single coherent record of what a learner has done and how they're
doing — the shared sink every graded activity writes to, and the only
source Dashboard and Unlock read from. This feature is infrastructure more
than a "page"; it has no dedicated route of its own beyond Mistakes/History
screens.

## User Story
As a learner, when I review my mistakes or history, I see one consistent
picture regardless of whether I made the mistake in a Lesson, a Class
practice task, or a Mock Test.

## User Flow
1. Any graded submission (Lessons exercise, Class task, Mock Test part)
   calls the one `recordAttempt()` function.
2. Learner later visits `/mistakes` (unresolved mistakes, grouped by
   grammar topic) or `/history` (chronological timeline of graded answers).

## UI Responsibilities
`/mistakes`: list grouped by `grammar_topic`, link back into the relevant
Class category. `/history`: paginated timeline.

## Server Responsibilities
`src/lib/features/progress/record-attempt.ts` — the one function every
grading path calls, which atomically (via a Postgres function, see
`docs/architecture/database-architecture.md#transactions`):
1. Inserts `exercise_attempts` (already done by the caller — this function
   is called *with* the attempt id, not responsible for creating it itself,
   to avoid a chicken/egg ordering issue. See implementation note below.)
2. Inserts one `question_events` row per graded question in that attempt.
3. Upserts `mistake_records` (increment `miss_count` on a new miss, set
   `resolved_at` on a correct answer for a previously-missed
   `question_key`).
4. Upserts `user_task_progress` (`best_score = max(existing, new)`,
   `last_score = new`, `attempt_count += 1`) when the attempt has a `task_id`.

## Database Entities
`exercise_attempts`, `question_events`, `mistake_records`,
`user_task_progress`.

## Data Flow
See [docs/database/relationships.md](../database/relationships.md)'s
"attempt graph" section — this feature doc is the narrative version of
that diagram.

## API / Server Actions
No dedicated route for recording — it's called from inside each feature's
own submit action (Class/Lessons/Mock Tests). `/mistakes` and `/history`
each have a simple read-only `load()`.

## AI Usage
None. Grading that feeds this pipeline is deterministic (see
`docs/features/class.md`); AI-generated feedback text is stored alongside
an attempt (`feedback_json`) but never affects `question_events` or
`mistake_records`.

## State Management
None client-side.

## Validation
`record-attempt.ts` trusts its caller to have already graded the answer
server-side — it does not re-derive correctness from client input, because
by the time it's called, grading has already happened against the stored
answer key.

## Error Handling
The Postgres function call is the atomicity boundary — if any of the three
writes fails, all roll back together, and the caller sees a single error
rather than a partially-recorded attempt.

## Permissions
Writes go through the service-role client (see `docs/database/rls.md` — the
app itself, not the learner's browser, is the one claiming "this answer was
correct").

## Metrics
Feeds every Dashboard metric. See `docs/features/dashboard.md`'s table.

## Dependencies
Depends on nothing feature-specific (it's a leaf consumer of whatever
attempt data its callers provide). Everything graded depends on it.

## Feature Graph
`Class / Lessons / MockTests → Progress → Dashboard`, and
`Progress → Unlock → Class / MockTests`. See
[feature-dependencies.md](../architecture/feature-dependencies.md).

## Implementation Steps
1. Phase 6 (deliberately early — see `implementation-roadmap.md`): build
   and test `record-attempt.ts` against hand-constructed input, no UI yet.
2. Wire Class's submit action to call it (Phase 7).
3. Wire Lessons and Mock Tests to call it when those phases land.
4. Build `/mistakes` and `/history` UI once there's real data to show.

## Testing Strategy
- The atomic function: all three tables update together; a forced failure
  on one leaves none of them changed.
- Mistake resolution: a previously-missed `question_key` answered correctly
  later sets `resolved_at`, row is not deleted.
- `best_score`/`last_score` independence: a worse second attempt updates
  `last_score` but not `best_score`.

## Future Improvements
- A scheduled-review (spaced repetition) layer on top of `mistake_records`
  — the gap left by not porting the legacy SRS engine, see
  `docs/architecture/architecture-review.md` §1. Deliberately deferred, not
  forgotten.
