# Scaling Strategy

Principle: **do not build the 100,000-user architecture before there are 100
users.** Each stage below lists what to introduce *at that stage*, not
before.

## 10 users (private beta / current reality)

- Single Supabase project, default connection pooling, no read replicas.
- No caching beyond what's already in the schema (`reading_explanations`,
  `translation_cache` — these exist for cost, not scale).
- No background job infra — `waitUntil`-deferred generation is enough.
- No observability beyond Vercel's default logs + Supabase's dashboard.

## 100 users

- Add the indexes in [docs/database/indexes.md](../database/indexes.md) if
  not already present (they should be, from day one — they're cheap and the
  queries are known).
- Start paginating the history/mistakes screens if not already done (should
  be done from day one per AGENTS.md's data-fetching rules, but this is the
  point at which skipping it would actually show up as lag).
- Watch Supabase connection count if traffic is bursty (class-start-of-month
  spikes are plausible for a language-course companion app).

## 1,000 users

- Introduce `pgbouncer`/Supabase's pooler in transaction mode if not already
  the default for your plan tier.
- Reconsider the AI generation claim mechanism (`task_generation_claims`,
  see `ai-architecture.md`) for lock contention — at this scale it's still
  almost certainly fine, but it's the first point worth actually checking
  rather than assuming.
- Start caching dashboard metrics **only if** a specific query shows up slow
  in Supabase's query performance view — not preemptively. Most dashboard
  numbers (lesson count, last activity) are cheap aggregates over a
  per-user-scoped table and should stay fully derived, not materialized,
  well past this point.

## 10,000 users

- Consider a materialized/aggregated table for any dashboard metric that a
  profiler has actually shown to be expensive (e.g. a cross-table weak-area
  computation), refreshed on write (same function that writes
  `question_events`) rather than on a cron — keeps the "derived, never
  drifts" property from `docs/database/relationships.md`.
- AI rate limiting: per-user and global caps on generation calls, visible in
  `src/lib/ai/registry.ts` as an explicit policy, not an afterthought.
- Start tracking AI cost per task-type in a lightweight log (even just
  structured logging, not a new table) to catch a runaway prompt before the
  bill does.

## 100,000+ users

- Read replicas for the heaviest read paths (history, mistakes) if Supabase's
  managed pooler isn't sufficient.
- Revisit whether `tasks` content generation needs a real queue (e.g. a
  dedicated worker/queue service) instead of `waitUntil` — at this volume,
  serverless function duration limits and concurrent-invocation costs start
  to matter in a way they don't below this point.
- Dedicated observability (structured tracing across the AI call path,
  Supabase slow-query alerting) rather than default logs.

## What never changes with scale

- RLS stays the authorization boundary at every stage — it doesn't get
  "optimized away" for performance. If RLS is ever found to be a bottleneck,
  the fix is a better policy/index, not removing RLS.
- AI never becomes the application engine, however large the user base gets.
  Scale pressure is not a reason to let a model decide something
  deterministic — if anything it's a reason to be more certain about cost
  and correctness, which deterministic code gives you and an LLM call doesn't.
