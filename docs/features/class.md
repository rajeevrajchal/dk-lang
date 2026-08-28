# Feature: Class / Practice

## Purpose
Let a learner practice a category (Reading, Writing, Speaking, Listening)
independent of the lesson sequence, via a numbered ladder of tasks per
module. This is the central exercise engine — Mock Tests reuse its content
directly, and Lessons' own exercises reuse its grading/rendering primitives.

## User Story
As a learner, I pick a category and a difficulty, and practice a specific
numbered task; reopening the same task number later shows the same content,
so I can track my improvement on it specifically.

## User Flow
1. `/class` → pick a category.
2. `/class/[category]` → see the numbered ladder (all N slots, materialized
   or not — the ladder never looks shorter than it is).
3. Open a task number → if content doesn't exist yet, a brief "preparing"
   state while it's generated, then the exercise renders.
4. Submit answers → graded immediately (deterministic) → result shown,
   attempt recorded via Progress.

## UI Responsibilities
Ladder list (difficulty badges, best/last score, "written for you" badge for
AI-generated content), the exercise renderer itself (per task-type
discriminated union — see `docs/architecture/ai-architecture.md`'s module
layout for where renderers live relative to content types), a polling UI for
the "preparing" state with capped backoff (2s → 8s, 5 minute timeout).

## Server Responsibilities
`src/lib/features/tasks/service.ts` — slot fill order:
1. In-flight generation claim check (DB-backed, see `ai-architecture.md`).
2. Existing `tasks` row.
3. Authored pool matching the slot's difficulty band.
4. AI generation (only if 1–3 all miss), guided by sibling task titles in
   the same ladder to avoid near-duplicates.

`(app)/class/[category]/[taskNumber]/+page.server.ts` calls the fast path
(existing row or authored pool only) synchronously; if it misses, returns a
"preparing" state and schedules generation via `waitUntil`, never blocking
the response on a 1–2 minute model call.

Grading (`src/lib/features/class/grading.ts`) is a pure function comparing
submitted answers to the stored answer key — no AI involved.

## Database Entities
`tasks`, `exercise_attempts`, `user_task_progress`.

## Data Flow
See [docs/architecture/application-flow.md](../architecture/application-flow.md)'s
sequence diagram — this is that diagram's source feature.

## API / Server Actions
- `(app)/class/[category]/[taskNumber]/+page.server.ts` `load()` + submit
  action.
- `api/tasks/[taskId]/status/+server.ts` — the one legitimate polling
  endpoint in this feature (generation status), per
  [overview.md](../architecture/overview.md#where-server-ts-endpoints-are-legitimate).

## AI Usage
Content generation only when the authored pool for a slot is exhausted —
see `docs/architecture/ai-architecture.md`'s exercise-generation section.
Never used for grading.

## State Management
Per-component runes state for the polling/exercise-in-progress UI; no
global store.

## Validation
Submitted answers validated for shape (right number of fields for the task
type) before grading; AI-generated content validated against the per-task-
type Zod schema before being written to `tasks`.

## Error Handling
Generation failure after retry → the slot stays unfilled, `load()` shows a
"try again" state rather than a hard error; a second learner opening the
same slot later just retries generation (the unique constraint on `tasks`
makes this safe even if two attempts race).

## Permissions
`tasks` content read requires authentication; the answer-bearing columns
(`content`) are never selected into any client-exposed response — the query
that serves a task to the browser selects an explicit public column list.

## Metrics
Feeds `user_task_progress` → Dashboard's category-progress metric.

## Dependencies
Depends on Progress (hard, for recording attempts) and the AI registry
(soft — only exercised when the authored pool is exhausted). Mock Tests and
Lessons' exercises depend on this feature's primitives.

## Feature Graph
`Unlock → Class → Progress`, `Class → MockTests` (shared content, not a
dependency in the graded sense — see
[feature-dependencies.md](../architecture/feature-dependencies.md)).

## Implementation Steps
See `docs/architecture/implementation-roadmap.md` Phase 7 (reading vertical
slice) through Phase 10 (speaking) — this feature is built incrementally,
one category at a time, on the same slot/grading primitives.

## Testing Strategy
- Slot permanence: reopening a materialized task returns identical content.
- Fast/full split: a slot with an authored match never triggers generation.
- Race safety: two concurrent "opens" of the same empty slot each still
  resolve to exactly one `tasks` row (unique constraint).
- Grading: answer-key comparison covers partial credit where the task type
  supports it.

## Future Improvements
- Listening: routes/catalogue entries can exist ahead of content (as
  "architecture readiness," matching the old app's stance) but no content
  or audio pipeline is built until it's actually prioritized.
