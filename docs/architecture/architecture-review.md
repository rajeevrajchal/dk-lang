# Architecture Review

Self-review of this blueprint, looking for the failure modes listed in the
brief: over-engineering, duplicate services/tables, circular dependencies,
excessive API routes/abstractions, unnecessary AI usage, client-side
fetching that should be server-side, dashboard calculations that should be
SQL, bad normalization, missing indexes/RLS, over-coupled features, and
unnecessary global state.

## 1. Two parallel exercise engines in the old app — resolved by omission, not merge

**Problem**: the old app ran a legacy `Item`/`Construct`/`Tier`/adaptive-SRS
engine (reading-only, hand-authored 38 items, real spaced-repetition logic)
alongside the newer `Task`/numbered-ladder engine, with routes for both live
simultaneously.

**Why it's a problem**: two systems doing overlapping jobs is the single
clearest over-engineering signal in the old codebase — more surface area,
more places a bug can hide, no clear "the new one replaces the old one"
cutover.

**Recommended solution**: this blueprint does not port the legacy engine at
all (see `docs/database/schema.md`'s "explicitly not carried over" section).
The new `tasks` model covers the same ground for reading, writing, and
speaking.

**Trade-off**: the legacy engine's one real capability with no replacement
is per-construct spaced repetition (an SM-2-style "which grammar point is
this learner weak on, and when should they see it again" scheduler). The new
`mistake_records` table tracks *that a* mistake happened and whether it's
resolved, but not a scheduled review cadence. This is a genuine feature gap
versus the old app, accepted deliberately for v1. If real usage data later
shows learners want scheduled review (not just "your mistakes" review), it
should be designed fresh against the new schema — grafting the old SRS
columns onto `mistake_records` is exactly the kind of "denormalize because
it's familiar" move AGENTS.md asks for an ADR before doing.

## 2. Task-type-specific AI prompt files — more files, not less code

**Problem**: the old `lib/exercises/generator.ts` was one 770-line file
mixing prompts, Danish-pedagogy rules, and response mapping. This blueprint
splits it into ~15 per-task-type prompt files plus shared fragments/topics/
slot-guidance modules.

**Why it's a problem, potentially**: more files can look like more
abstraction for its own sake if the shared fragments end up under-used.

**Recommended solution**: kept as planned, because the underlying content is
genuinely per-task-type (each opgave format has real, distinct pedagogical
rules — "no person must be solvable by a single ad" only makes sense for one
specific reading task type). The split is separating *distinct content*,
not introducing an abstraction over *similar content*. The shared
`prompt-fragments.ts`/`topics.ts`/`slot-guidance.ts` files are justified by
the old code already proving every task type needs anti-duplication
guidance and a topic pool — two-plus real use cases, satisfying AGENTS.md's
bar.

**Trade-off**: if a future task type turns out to need none of the shared
fragments, that's a sign the fragments were never as shared as assumed —
revisit then, not preemptively.

## 3. In-memory generation dedupe does not survive serverless

**Problem**: already flagged in `ai-architecture.md` — the old app's
in-process `Map`/`Set` dedupe for concurrent generation requests assumes
shared memory across requests, which Vercel serverless does not guarantee.

**Why it's a problem**: left unaddressed, this silently degrades from "a
cost optimization" to "no optimization at all" on serverless — not a
correctness bug (the DB unique constraint still protects correctness) but a
quietly wasted assumption worth fixing explicitly rather than inheriting.

**Recommended solution**: database-backed claim table, specified in
`ai-architecture.md`.

**Trade-off**: one extra table and one extra round-trip per generation
attempt, in exchange for the dedupe actually working. Negligible cost next
to a 1–2 minute model call.

## 4. Dashboard must not accumulate feature-specific queries over time

**Problem risk, not yet present**: as Phases 8–12 land, there's a real
temptation for each feature to add "one more thing the dashboard shows"
directly against that feature's own tables, which would slowly recreate the
old pattern of scattered ad-hoc metrics.

**Why it's a problem**: this is exactly the tight-coupling failure mode the
brief asks to watch for — Dashboard reaching into Lessons/Class/Reading
tables individually instead of through Progress.

**Recommended solution**: `docs/architecture/feature-dependencies.md`
already states the invariant (Dashboard reads only from Progress) and this
review makes it explicit as a thing to check in every PR that touches
`dashboard metrics` — if a new metric needs a query against
`lesson_progress` directly rather than through a Progress-layer function,
that function should be added to Progress, not inlined into the dashboard
query file.

**Trade-off**: none — this is free to get right from the start and
expensive to unwind later, which is exactly why it's called out now rather
than after Phase 14.

## 5. RLS coverage must be verified, not assumed, for service-role-written tables

**Problem**: `module_skill_status`, `official_test_results`,
`question_events`, and `mistake_records` are written by the service-role
client, with the `select` policy scoped to the owning user. It's easy to
write the insert policy as "service-role only" and forget that Postgres
RLS, when enabled, denies by default — if the select policy is missed or
mis-scoped, the failure mode is either "nobody can read their own data" (
loud, caught immediately) or, worse, "everybody can read everybody's data"
if the policy is accidentally written with `using (true)`.

**Recommended solution**: the RLS test requirement in
`docs/database/rls.md` (cross-user select/insert/update denial tests) is
mandatory before any of these tables ship, not optional hardening added
later.

**Trade-off**: none — this is the cost of RLS being the actual
authorization boundary, which is the chosen design.

## 6. Normalization is good; watch `tasks.content` and `exercise_attempts.variant_json` as an exception, not a pattern

**Problem**: both columns are `jsonb` blobs (full exercise content including
answer keys), which looks like it could be read as "denormalize when
convenient."

**Why it's acceptable here, specifically**: exercise content shape varies
per task type (reading Task 1 vs. a speaking prompt have nothing structurally
in common), and it is never queried *by its contents* — only fetched whole
by id and validated against a per-task-type Zod schema at the read boundary.
A fully normalized relational shape for this would require a table per task
type with no query benefit, since nothing ever filters "give me all tasks
where `content.someField = X`." This is the correct use of `jsonb` —
document-shaped data that's read whole, not queried by field — not an
exception to normalization so much as the right tool for genuinely
document-shaped content. It should not be cited as precedent for putting
other, genuinely relational data into a JSON blob.

## 7. No circular dependencies found

Checked against `feature-dependencies.md`'s graph: Auth → Profile →
Onboarding → Dashboard is a strict chain; Class/Lessons/MockTests all feed
Progress and nothing feeds back from Progress into them except through
Unlock, which is a one-directional gate (Unlock reads Progress-derived
state, Class/MockTests read Unlock state, neither writes back to Unlock
directly — only a completed exam session or reconciled report card does,
both through Progress's own recording path). No cycle exists.

## 8. No unnecessary global state found

Two context-like needs (locale dictionary, translation cache) both have a
real multi-consumer justification already proven by the old app. No other
global store is planned. If a future feature proposes one, it should cite
which specific cross-route data it needs to share — a single route's own
data never qualifies.
