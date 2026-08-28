# Feature: Mock Tests

## Purpose
Let a learner sit a full or partial exam simulation, timed and scored like
the real thing, reusing exactly the same content Class practice uses — a
mock test is not a separate content system.

## User Story
As a learner close to a real exam, I want to sit a timed mock that feels
like the actual test and tells me, per skill, whether I'd pass today.

## User Flow
1. `/mock` → pick a module → pick full test or a single category.
2. **Numbered mode** (a specific test number): assembles one task per part
   from the same numbered ladder Class uses (Test 7 = Task 7 of every
   required part) — same fast/full split and "preparing" polling as Class.
3. **Rotating mode** (no test number): assembles fresh content per part in
   parallel, avoiding topics already in the learner's completed history.
4. Timed session; submit all parts; per-skill pass/fail against the pass
   threshold; strengths/weaknesses breakdown with deep links back into
   Class for weak task types.

## UI Responsibilities
Intro → preparing → running (countdown timer, referentially-stable submit
handler so the timer doesn't restart on every keystroke — a real bug in the
old app worth deliberately avoiding again) → result screen.

## Server Responsibilities
`src/lib/features/mock-tests/assembly.ts`: both assembly modes. Numbered
mode calls the exact same `ensureTaskFast`/`ensureTask` functions Class
uses. Submission grades each part (same deterministic grading as Class),
creates an `exam_sessions` row, computes per-skill pass/fail, calls
Progress's `recordAttempt()` once per part.

## Database Entities
`exam_sessions`, `exercise_attempts` (with `exam_session_id` +
`order_index` set — this presence, not a separate flag, is what marks an
attempt as a mock part), `tasks` (read, shared with Class).

## Data Flow
Numbered mode mirrors `docs/architecture/application-flow.md`'s Class
sequence diagram exactly, with an added `exam_sessions` row. Rotating mode
assembles all parts via `Promise.all` since there's no slot to reuse.

## API / Server Actions
`(app)/mock/[moduleId]/[testNumber]/+page.server.ts` (numbered) or
`(app)/mock/[moduleId]/+page.server.ts` (rotating) for assembly; a submit
action that grades all parts and completes the session.
`api/tasks/[taskId]/status` is reused from Class for the preparing-state
poll (no separate mock-specific status endpoint needed).

## AI Usage
Only indirectly, through the same Class generation path for numbered mode;
rotating mode generates fresh content per part directly, same registry/
validation rules as Class. Never used for scoring or pass/fail.

## State Management
Component-local runes state for timer/phase; mirrors of response state kept
stable across re-renders specifically so the countdown timer doesn't reset
on every keystroke.

## Validation
Every part's answers validated for shape before grading, same as Class.

## Error Handling
If a part fails to submit (network failure), the result screen must show
that explicitly (an "unsent part" state) rather than silently scoring it as
wrong — this was a deliberate fix in the old app worth keeping.

## Permissions
Requires a session; `exam_sessions` and its attempts are user-scoped via
RLS.

## Metrics
Feeds `module_skill_status.in_app_passed` (when a session completes above
threshold) and Dashboard's "mock tests completed" / "latest score" metrics.

## Dependencies
Depends on Class (shares its task/slot machinery) and Progress (records
every part). Feeds Unlock.

## Feature Graph
`Class --shares content--> MockTests → Progress → Unlock`.

## Implementation Steps
See `implementation-roadmap.md` Phase 11 — built after Reading and Writing
(at minimum) exist in Class, since a mock test needs real content to
assemble.

## Testing Strategy
- Numbered mode reuses the identical `task_id` Class would for the same
  slot (content parity test).
- Pass/fail threshold boundary (exactly at threshold passes).
- Unsent-part handling on a simulated submission failure.
- Timer-stability: rapid typing during the countdown does not reset it.

## Future Improvements
None identified beyond what's already covered by Class's own future work
(Listening content, writing auto-grading).
