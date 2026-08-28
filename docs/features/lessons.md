# Feature: Lessons

## Purpose
A structured grammar course (chapters → lessons → exercises) that teaches
Danish sequentially, distinct from Class's free-choice category practice.

## User Story
As a learner following a course, I want to work through chapters in order,
with reading/writing lessons placed inside the grammar chapter they exercise,
and be able to resume exactly where I left off.

## User Flow
1. `/lessons` → chapter list with progress.
2. `/lessons/[chapterId]` → lessons within the chapter (grammar + any
   embedded reading/writing lesson for that chapter's construct).
3. `/lessons/[chapterId]/[lessonSlug]` → explanation → examples → exercises
   (five-rung ladder: recognition → selection → ordering →
   controlled_production → free_production, never regressing within a
   lesson).
4. Completing the last exercise marks the lesson `COMPLETED`; `/lessons`
   shows the next unfinished one as the resume point.

## UI Responsibilities
Chapter/lesson navigation, explanation/example rendering (code-shipped
content, not fetched from a table), exercise rendering reusing Class's
renderer primitives per exercise shape.

## Server Responsibilities
`resumePoint()` — a pure function over a progress map, no DB coupling
(ported from the old app's `lib/curriculum/progress.ts`, a clean design).
Exercise submission reuses Class's grading functions where the exercise
shape matches an existing task-type renderer; lesson-specific exercise
shapes get their own small grading function following the same pattern.

## Database Entities
`lesson_progress` only — chapter/lesson content is code-shipped, not a
table (same decision as reading texts and verb lists).

## Data Flow
`load()` reads code-shipped chapter/lesson data + `lesson_progress` for the
signed-in user; exercise submission writes `lesson_progress` status and
calls Progress's `recordAttempt()`.

## API / Server Actions
`(app)/lessons/.../+page.server.ts` load + a "mark visited"/"submit
exercise" action. No `+server.ts`.

## AI Usage
Grammar-point explanation on demand (same pattern as Reading's sentence
explanation — cache-first, AI only on a genuine miss). Never for grading or
sequencing.

## State Management
None beyond the page's own load data.

## Validation
Exercise submissions validated for shape per the five-rung exercise type,
same validation approach as Class.

## Error Handling
Same as Class — deterministic grading never fails for AI reasons; AI
explanation failures show a retry state, not a blocked lesson.

## Permissions
Requires a session; `lesson_progress` is user-scoped via RLS.

## Metrics
Feeds Dashboard's "lessons completed" metric directly from
`lesson_progress`.

## Dependencies
Depends on Progress (for recording exercise attempts) and reuses Class's
rendering/grading primitives (a code dependency, not a data dependency —
Lessons does not read Class's `tasks` table).

## Feature Graph
`Dashboard → Lessons → Progress`.

## Implementation Steps
See `implementation-roadmap.md` Phase 12 — built after Class (Phase 7)
specifically so its exercises can reuse Class's established renderer/
grading pattern rather than inventing a second one.

## Testing Strategy
- `resumePoint()` pure-function tests (no DB) covering in-progress,
  completed, and never-started states.
- Five-rung ladder never regresses (a test asserting exercise difficulty
  order matches the course's own ordering — ported from the old app's
  `course.test.ts` idea).
- Lesson completion on last exercise sets `status = 'COMPLETED'`.

## Future Improvements
None identified beyond general content expansion (more chapters), which is
a content task, not an architecture one.
