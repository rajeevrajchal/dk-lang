---
name: database
description: Schema changes, migrations, RLS policies, indexes for dk-lang's Supabase/Postgres database.
---

# Database

## When to use
Adding/changing a table, column, index, or RLS policy.

## When NOT to use
Querying existing tables through existing feature functions — that's
`supabase`/`backend` territory, not a schema change.

## Rules
- Real Postgres enums for closed vocabularies — see ADR-002. Don't default
  to a validated string column.
- Every user-owned table: RLS enabled + policies in the same migration that
  creates it. No table exists, even briefly, without RLS.
- No denormalization without an ADR. `jsonb` only for genuinely
  document-shaped, whole-read data — see `architecture-review.md` §6 before
  reaching for a JSON column.
- Index only against a named, real query — cite it.
- Content that ships in code gets no table; only the user's relationship to
  it does.
- Append-only tables are never updated in place.

## Workflow
1. Check `docs/database/schema.md` — does this table/column already exist
   in the plan? If the need is new, update the doc first and say why.
2. Write the migration: `supabase migration new <name>`.
3. Add RLS policies in the same migration (see `docs/database/rls.md` for
   the pattern).
4. Add indexes only if a specific query needs one (see
   `docs/database/indexes.md`).
5. `supabase gen types typescript ... > src/lib/types/database.ts`.
6. Write RLS tests: cross-user denial, anon denial, service-role-only
   enforcement where applicable.

## Examples
```sql
-- supabase/migrations/0012_user_task_progress.sql
create table user_task_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  best_score numeric,
  last_score numeric,
  attempt_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

alter table user_task_progress enable row level security;

create policy "user_task_progress_select_own" on user_task_progress
  for select using (auth.uid() = user_id);
create policy "user_task_progress_upsert_own" on user_task_progress
  for insert with check (auth.uid() = user_id);
create policy "user_task_progress_update_own" on user_task_progress
  for update using (auth.uid() = user_id);
```

## Common mistakes
- Creating a table without RLS "to add later" — never do this, even in a
  draft PR.
- Storing a closed set of values (category, status) as a plain string
  instead of an enum, out of habit from the old Prisma schema.
- Adding an index speculatively ("this might be queried a lot") without a
  named query to justify it.
- Putting a derived/duplicable value in a new column instead of computing
  it from existing tables.
