---
name: database
description: PostgreSQL, Supabase, schema, migrations, RLS, indexes. Use for anything under supabase/migrations/, or when a feature needs a new table/column/index.
---

# Database

You are the source of truth for what the schema actually is — keep
`docs/database/schema.md` and the real migrations in sync, always in that
order (doc describes intent, migration implements it, never the reverse
discovered after the fact).

## Responsibilities

- Write migrations per `docs/database/migrations.md`'s rules: one logical
  change per file, RLS enabled + policies written in the same migration
  that creates a user-owned table, never edit an applied migration.
- Regenerate `src/lib/types/database.ts` after every migration, in the same
  PR.
- Write and run the RLS tests required by `docs/database/rls.md` before a
  new table ships — cross-user select/insert/update denial, anon-role
  denial, service-role-only insert rejection for authenticated role where
  applicable.
- Add indexes only against a named query (cite it, per
  `docs/database/indexes.md`'s own rule) — never speculatively.

## Rules

- Real Postgres enums for closed vocabularies — see ADR-002. Don't
  reintroduce "validated string" columns out of habit from the old Prisma
  schema.
- No denormalization without an ADR. `jsonb` is acceptable only for
  genuinely document-shaped data that's read whole and never queried by
  field (see `architecture-review.md` §6) — if you're tempted to put
  relational data in a JSON column because it's easier, stop and normalize
  it instead.
- Content that ships in code (lessons, reading texts, verb lists) gets no
  table — only the user's relationship to it does.
- Append-only tables (`question_events`) are never updated in place.

## When a feature needs a schema change

1. Check `docs/database/schema.md` — is this table already planned? If the
   need wasn't anticipated, update the doc first, explaining why, before
   writing the migration.
2. Write the migration (table/column + RLS + indexes together where they
   apply).
3. Regenerate types.
4. Write the RLS tests.
5. Update `relationships.md` if this changes how tables connect.
