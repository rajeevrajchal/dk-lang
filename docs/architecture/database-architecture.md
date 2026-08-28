# Database Architecture

Full schema in [docs/database/schema.md](../database/schema.md). This doc
covers access patterns and the Supabase client split — the "how code talks
to the database" layer, not the tables themselves.

## Two server-side clients, never more

```
src/lib/server/db.ts
  createSupabaseServerClient(event)   — user-JWT, RLS-scoped, the default

src/lib/server/admin.ts
  supabaseAdmin                       — service-role, bypasses RLS,
                                         used only for:
                                         - pre-session operations (none currently)
                                         - derived/authoritative writes
                                           (question_events, mistake_records,
                                           module_skill_status, tasks content
                                           generation — see rls.md)
```

Both are attached to `event.locals` in `hooks.server.ts` so every
`+page.server.ts` reaches them the same way:

```ts
// hooks.server.ts
event.locals.supabase = createSupabaseServerClient(event);
event.locals.supabaseAdmin = supabaseAdmin; // singleton, no per-request cost
```

A route reaching for `locals.supabaseAdmin` outside the whitelisted cases
above is a review flag, not a style choice — see AGENTS.md.

## Browser client

A separate, much smaller browser-side client exists only for Supabase
Storage direct-upload (report-card image upload progress) and Supabase Auth
UI helpers. It is never used to query user data directly — that always goes
through a server load/action. See `docs/features/settings.md` for the one
place this client is actually used.

## Generated types

`supabase gen types typescript --project-id <id> > src/lib/types/database.ts`,
regenerated and committed after every migration (see
[migrations.md](../database/migrations.md)). Feature code imports the
generated row types and narrows them with small domain types where the raw
generated shape is too wide (e.g. `content: Json` on `tasks` becomes a typed
`TaskContent` via a Zod schema at the read boundary, not a cast).

## Repository layer — deliberately thin, not absent

The old app's `lib/repositories/*` (Supabase-js wrappers per domain) is kept
as a *pattern*, not ported as a generic layer: each feature gets its own
`queries.ts`/`mutations.ts` under `src/lib/features/<domain>/`, calling
Supabase directly with no intermediate repository interface/abstract class.
Two call sites needing the same query is when it becomes a shared function
— not before. See AGENTS.md's "don't create generic utilities without two
real use cases."

## Where business logic lives relative to the database

Grading, scoring, unlock computation, and progress aggregation are plain
TypeScript functions that take already-fetched rows and return a result —
they do not themselves query Supabase. The `load`/action function fetches,
the feature function computes, the `load`/action function writes. This
split is what makes grading/unlock logic testable without a database
connection (see `docs/architecture/testing` expectations in
`.claude/skills/testing/SKILL.md`).

## Transactions

Supabase (Postgres via PostgREST/the JS client) does not give you an ad-hoc
multi-table client-side transaction the way a raw `pg` connection would. Where
multiple writes must be atomic (e.g. insert `exercise_attempt` +
`question_events` + upsert `user_task_progress`), use a Postgres function
(`plpgsql`, called via `.rpc()`) rather than sequential client-side inserts —
this is the one place a DB function is worth the extra indirection, because
"attempt recorded but progress not updated" is a real correctness bug, not a
cosmetic one. See `docs/features/progress.md` for the exact function.
