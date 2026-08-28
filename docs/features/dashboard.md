# Feature: Dashboard

## Purpose
The single landing page after sign-in; surfaces where the learner stands and
what to do next, computed entirely from data other features have already
written — it never computes or stores its own data.

## User Story
As a learner, when I sign in I immediately see my level, recent activity,
and a clear next action, without having to go hunt through Lessons/Class/
Mock Tests myself.

## User Flow
1. Land on `/dashboard` after sign-in (or navigate back to it any time).
2. See: current level/module, lesson progress, category progress, recent
   mock results, a weak-areas callout, a recommended next action, streak.
3. Click through to whichever feature the recommendation points at.

## UI Responsibilities
Pure presentation of server-computed metrics. No client-side computation of
any number shown — every metric arrives fully formed from `load()`.

## Server Responsibilities
`(app)/dashboard/+page.server.ts` `load()` calls one function per metric
group (below), all reading from Progress-layer tables only — never reaching
into `lesson_progress`/`exercise_attempts`/etc. directly from the dashboard
code itself (see `feature-dependencies.md`'s invariant).

## Database Entities
Reads (via Progress-layer functions, not directly): `profiles`,
`lesson_progress`, `user_task_progress`, `exam_sessions`, `mistake_records`,
`question_events`, `module_skill_status`.

## Metrics — one row per number shown

| Metric | Source table(s) | Calculation | Derived or persisted | Update frequency |
|---|---|---|---|---|
| Current level/module | `profiles.current_module_id` | direct read | persisted | on onboarding/settings change |
| Lessons completed | `lesson_progress` | `count(*) where status = 'COMPLETED'` | derived | every load |
| Category progress (per category) | `user_task_progress` joined to `tasks` | `count(attempted) / count(total slots)` per category | derived | every load |
| Mock tests completed | `exam_sessions` | `count(*) where status = 'COMPLETED'` | derived | every load |
| Latest mock score | `exam_sessions.scores` | most recent completed row | derived | every load |
| Average score (category) | `exercise_attempts` | `avg(score/total)` over recent window | derived | every load, windowed (e.g. last 20) |
| Daily activity / streak | `question_events.created_at` | distinct active days, consecutive-day count from today backward | derived | every load |
| Weak areas | `mistake_records` | `group by grammar_topic where resolved_at is null having count >= 3` (same evidence threshold as the old app) | derived | every load |
| Recommended next activity | combination of the above | deterministic rule (e.g. "an in-progress mock" > "a weak area's category" > "next unfinished lesson") | derived | every load |
| Last activity | `question_events` / `lesson_progress` / `exam_sessions` | most recent `created_at`/`completed_at` across all three | derived | every load |

No metric is AI-computed. Every one is a SQL aggregate or a small pure
function over already-fetched rows.

## Data Flow
`load()` → Progress-layer query functions (each wraps one or two indexed
queries) → plain objects → rendered. See
[docs/architecture/data-flow.md](../architecture/data-flow.md).

## API / Server Actions
None — read-only page, no actions. No `+server.ts`.

## AI Usage
None.

## State Management
None — everything comes from `load()`.

## Validation
N/A (no user input on this page).

## Error Handling
If a metric query fails, the page should still render with that section
showing a neutral "unavailable" state rather than failing the whole page —
partial degradation, not a hard error, since nothing here is critical-path.

## Permissions
Requires a session; every query is scoped to `locals.user.id` (RLS-backed).

## Dependencies
Depends on Progress (hard — reads nothing else), which depends on every
graded feature. Has no feature depending on it.

## Feature Graph
`Progress → Dashboard` (the only inbound edge, per
[feature-dependencies.md](../architecture/feature-dependencies.md)).

## Implementation Steps
1. Phase 5: shell with level/module only, explicit "not yet tracked" for
   activity.
2. Phase 14: replace each stub with the real query from the metrics table
   above, one at a time, each with its own test.
3. Recommended-next-activity rule last, once the other metrics are real.

## Testing Strategy
- One test per metric function, with a seeded set of rows, asserting the
  exact computed value.
- A profile with zero activity renders without error (all-empty state).
- The weak-areas evidence threshold (≥3) is tested at the boundary (2 vs 3
  occurrences).

## Future Improvements
- If any single metric query becomes measurably slow at scale, consider a
  materialized/aggregated table fed by the same write path that produces
  the underlying events — see `docs/architecture/scaling.md`. Not before
  there's a real profiler result showing it's needed.
