# Implementation Roadmap

The brief's default phase order (Auth → Onboarding → Dashboard → Lessons →
Class → Reading → Speaking → Writing → Mock Tests → Progress → AI →
Dashboard metrics → Testing → Hardening) is adjusted in two ways based on
the existing-project audit:

1. **Progress (the attempt-recording pipeline) moves earlier**, right after
   Dashboard's shell, because every graded feature after it — Class,
   Lessons' exercises, Mock Tests — writes through it. Building it last
   would mean building every feature twice (once without progress tracking,
   once wired up).
2. **Class/Tasks moves before Lessons**, because the audit found Class's
   task/slot engine to be the most mature, central subsystem — Mock Tests
   is just Class content reused, and Lessons' own exercises can reuse the
   same renderer/grading primitives Class establishes. Building Class first
   means Lessons and Mock Tests both have something real to build on.

## Phase 1 — Project foundation
- **Dependencies**: none.
- **Database changes**: none.
- **Files**: SvelteKit project skeleton, TS strict config, ESLint/Prettier,
  `AGENTS.md`/`PROJECT.md` already in place (this doc set).
- **Unlocks**: everything else.
- **Testing**: CI runs typecheck + lint on an empty app.
- **Definition of done**: `npm run dev` serves a blank `(auth)`/`(app)`
  route-group skeleton; CI green.

## Phase 2 — Supabase + database
- **Dependencies**: Phase 1.
- **Database changes**: all migrations in
  [docs/database/migrations.md](../database/migrations.md); RLS per
  [rls.md](../database/rls.md).
- **Files**: `supabase/migrations/*`, `src/lib/types/database.ts` (generated),
  `src/lib/server/db.ts`, `src/lib/server/admin.ts`.
- **Unlocks**: every subsequent phase.
- **Testing**: RLS policy tests per table (see `.claude/skills/database/SKILL.md`).
- **Definition of done**: schema matches `schema.md` exactly; every
  user-owned table has a passing RLS test for both allow and deny cases.

## Phase 3 — Authentication
- **Dependencies**: Phase 2.
- **Database changes**: signup trigger creating a blank `profiles` row.
- **Files**: `hooks.server.ts`, `(auth)/login/+page.svelte`,
  `(auth)/auth/callback/+server.ts`, `(app)/+layout.server.ts`.
- **Unlocks**: Onboarding, Dashboard, everything behind the session guard.
- **Testing**: session resolution, redirect-when-unauthenticated, dev-login
  unreachability in a production build.
- **Definition of done**: Google sign-in works end-to-end locally against a
  real Supabase project; dev test-login works in dev, 404s when
  `NODE_ENV=production`.

## Phase 4 — Onboarding
- **Dependencies**: Phase 3.
- **Database changes**: none beyond Phase 2 (`profiles`, `profile_interests`).
- **Files**: `(app)/onboarding/+page.svelte` + `+page.server.ts`.
- **Unlocks**: Dashboard's "has a real level" assumption.
- **Testing**: form action validation, `level_source` transition.
- **Definition of done**: a fresh sign-in is routed to Onboarding, completing
  it sets `current_module_id` + `level_source` and routes to Dashboard.

## Phase 5 — Dashboard foundation (shell)
- **Dependencies**: Phase 4.
- **Database changes**: none.
- **Files**: `(app)/dashboard/+page.svelte` + `+page.server.ts` reading only
  `profiles`/`modules` — activity metrics are stubbed until Phase 6.
- **Unlocks**: a landing page to build everything else against.
- **Testing**: renders for a profile with and without activity.
- **Definition of done**: dashboard shows level/module; activity section
  explicitly says "not yet tracked" rather than faking data.

## Phase 6 — Progress system (core pipeline, built early)
- **Dependencies**: Phase 5.
- **Database changes**: `exercise_attempts`, `question_events`,
  `mistake_records`, `user_task_progress`, and the Postgres function that
  writes all three atomically (see `docs/architecture/database-architecture.md#transactions`).
- **Files**: `src/lib/features/progress/record-attempt.ts` (the one function
  every grading path calls), `src/lib/features/progress/queries.ts`.
- **Unlocks**: Class, Lessons' exercises, Mock Tests — nothing grades
  anything until this exists.
- **Testing**: the atomic-write function, mistake resolution on a later
  correct answer, `best_score`/`last_score` independence.
- **Definition of done**: a hand-written test harness can call
  `recordAttempt()` directly (no UI yet) and see all three tables update
  consistently.

## Phase 7 — Class / Tasks engine (reading vertical slice)
- **Dependencies**: Phase 6.
- **Database changes**: `tasks`, the generation-claim mechanism (see
  `ai-architecture.md`).
- **Files**: `src/lib/features/tasks/service.ts` (slot fill order),
  `src/lib/features/class/catalogue.ts`, `(app)/class/...` routes, one
  reading task-type renderer + grading function end to end.
- **Unlocks**: the pattern every other category/Mock Tests/Lessons-exercise
  follows.
- **Testing**: slot permanence, fast/full split, authored-pool fallback,
  race-safety on the unique constraint.
- **Definition of done**: one reading task type fully playable, graded
  through Phase 6's pipeline, with AI generation wired for when the authored
  pool is exhausted.

## Phase 8 — Reading (remaining task types + library)
- **Dependencies**: Phase 7.
- **Database changes**: `reading_progress`, `saved_words`, `reading_notes`,
  `reading_highlights`, `reading_explanations`.
- **Files**: remaining reading task-type renderers, `src/lib/ai/explain-*.ts`,
  reading library routes.
- **Testing**: three-tier explanation cost rule (glossary → cache → model),
  level 1–2 glossary coverage assertion.
- **Definition of done**: full reading category playable + library browsable.

## Phase 9 — Writing
- **Dependencies**: Phase 7.
- **Database changes**: none beyond Phase 7/8.
- **Files**: writing task-type renderer, `src/lib/ai/writing-feedback.ts`.
- **Definition of done**: writing task playable; AI feedback generated on
  submit, explicitly unscored (no auto-grading in v1, matching the product
  decision in `docs/features/writing.md`).

## Phase 10 — Speaking
- **Dependencies**: Phase 7.
- **Database changes**: `speaking_state_json` column usage on
  `exercise_attempts` (already in Phase 6/7 schema).
- **Files**: speaking task-type renderers, `src/lib/ai/speaking-turn.ts`,
  `src/lib/ai/speaking-feedback.ts`.
- **Definition of done**: one-turn-at-a-time conversation works, state
  persists across turns, feedback generated at the end.

## Phase 11 — Mock Tests
- **Dependencies**: Phases 7–10 (needs at least Reading + Writing to be a
  meaningful test; Speaking can follow).
- **Database changes**: `exam_sessions`.
- **Files**: `src/lib/features/mock-tests/assembly.ts` (numbered + rotating
  modes), mock-test routes, result summary.
- **Definition of done**: a full numbered mock test reuses existing task
  content (shares `task_id` with Class), produces a scored `exam_sessions`
  row, feeds `module_skill_status.in_app_passed`.

## Phase 12 — Lessons
- **Dependencies**: Phase 7 (reuses its exercise/grading primitives).
- **Database changes**: `lesson_progress`.
- **Files**: code-shipped chapter/lesson content, lesson routes, resume-point
  logic.
- **Definition of done**: full grammar course navigable, exercises graded
  through the same pipeline as Class, progress resumable by slug.

## Phase 13 — Remaining AI features + polish
- **Dependencies**: Phases 8–12.
- **Files**: any explanation/feedback surface not already covered (grammar
  point explanations from Lessons, for instance).
- **Definition of done**: every AI call site has a documented contract per
  `ai-architecture.md`'s per-operation table.

## Phase 14 — Dashboard metrics (full)
- **Dependencies**: Phases 6–12 (needs real data to aggregate).
- **Files**: real queries replacing Phase 5's stubs — level, lessons
  completed, category progress, mock history, weak areas, streak,
  recommended next action.
- **Definition of done**: every metric in `docs/features/dashboard.md`'s
  table is backed by a real, cited query.

## Phase 15 — Testing + performance
- Coverage pass against `.claude/skills/testing/SKILL.md`'s priority list;
  index verification against real query plans; pagination audit.

## Phase 16 — Production hardening
- Report cards/OCR reconciliation, Settings, Verbs, Listening scaffold
  (routes/catalogue entries only, per `docs/features/class.md` — no content),
  rate limiting on AI calls, observability.

## Out of scope for this roadmap (explicitly deferred)
- Porting the legacy `Item`/`Construct`/SRS adaptive engine — see
  [architecture-review.md](architecture-review.md).
- Writing auto-grading (rubric scoring) — a deliberate v2 decision, not v1.
