# Data Flow

## Standard read

```
User interaction (navigation)
      ↓
+page.server.ts  load()
      ↓
src/lib/features/<domain>/queries.ts  (one function, one purpose)
      ↓
event.locals.supabase  (RLS-scoped, user's own JWT)
      ↓
Supabase Postgres
      ↓
typed result (generated Supabase types, or a narrower domain type)
      ↓
returned from load(), available as `data` in +page.svelte
```

No intermediate cache, no client refetch. If two components on the same
route need the same data, the `load` function fetches it once and both read
it from `data`/`page.data` — never two separate queries for one render.

## Standard write (form action)

```
User submits a form
      ↓
+page.server.ts  action
      ↓
Zod-validate the form payload
      ↓
src/lib/features/<domain>/mutations.ts
      ↓
event.locals.supabase (user-scoped) for user-owned writes,
event.locals.supabaseAdmin for derived/authoritative writes
(question_events, mistake_records, module_skill_status — see rls.md)
      ↓
Supabase Postgres
      ↓
action returns { success: true, ... } or fail(400, { errors })
      ↓
SvelteKit re-runs the page's load() automatically, UI reflects new state
```

## AI-backed read (explanation)

```
User clicks "explain this sentence"
      ↓
form action (not a page load — this is demand-triggered, not render-triggered)
      ↓
check reading_explanations cache first (shared, keyed by text/scope/level/depth)
      ↓ cache miss
src/lib/ai/explain-sentence.ts
      ↓
src/lib/ai/registry.ts  (resolve provider/model/effort)
      ↓
Vercel AI SDK generateObject() with a Zod schema
      ↓
validate response
      ↓ success                              ↓ failure
write to reading_explanations cache     return typed failure, UI shows
      ↓                                  "couldn't generate an explanation,
return explanation to UI                 try again" — never a hard error
```

The cache-first order (authored glossary → shared cache → model) mirrors the
old app's reading-explanation tiering and is worth keeping exactly — see
[docs/features/reading.md](../features/reading.md).

## AI-backed, slow generation (new task content)

```
User opens an unmaterialized task slot
      ↓
+page.server.ts load() calls ensureTaskFast()
      ↓ found (existing row or authored pool) ─→ render immediately
      ↓ not found
load() returns a "preparing" state (not a 500 — this is an expected branch)
      ↓
server schedules generation via waitUntil() (Vercel) so the response
returns immediately without blocking on a 1-2 minute model call
      ↓
client polls GET /api/tasks/[id]/status every 2-8s (backoff), capped at 5min
      ↓
generation completes → task row inserted (unique constraint settles any
race between two concurrent generations for the same slot — the DB is the
correctness mechanism, any in-memory dedupe is a cost optimization only,
see ai-architecture.md)
      ↓
next poll returns ready → client loads the real content
```

## Grading (always deterministic)

```
User submits answers
      ↓
form action
      ↓
src/lib/features/class/grading.ts  — pure function, compares submitted
answers to the stored answer key, computes score/total
      ↓
insert exercise_attempt (score set), question_events (one per question),
upsert user_task_progress
```

AI is never in this path. Writing/speaking feedback (which *is* AI-generated)
is a separate, explicitly-labeled step the learner triggers after submission
— it never determines the score.
