# Migrations

## Tooling

Supabase CLI migrations (`supabase migration new <name>`), plain SQL files
under `supabase/migrations/`. No ORM migration tool (no Prisma in the new
stack — see ADR-002) — SQL is the source of truth, and
`supabase gen types typescript` produces the TypeScript types from it after
every migration.

## Rules

- One migration per logical schema change. Don't bundle an unrelated index
  add into a feature's table-create migration.
- Every migration that creates a user-owned table **also** enables RLS and
  adds its policies in the same file — a table must never exist, even
  briefly, without RLS. See [rls.md](rls.md).
- Seed data (the 5 `modules` rows) ships as a migration, not a runtime seed
  script — it's schema-adjacent reference data, not environment-specific.
- Never edit a migration that has been applied to any shared environment
  (staging/prod). Write a new one, even to fix a typo.
- Regenerate and commit `src/lib/types/database.ts` (or equivalent generated
  types path) in the same PR as the migration. A migration PR without a
  types diff is almost always wrong.

## Initial migration set (for the rewrite)

1. `enable_extensions` — `pgcrypto` or equivalent for `gen_random_uuid()`.
2. `enums` — all enum types from `schema.md`.
3. `modules` — table + seed rows.
4. `profiles` + `profile_interests` + signup trigger (creates a `profiles`
   row when a new `auth.users` row appears).
5. `tasks`.
6. `exercise_attempts`.
7. `user_task_progress`.
8. `exam_sessions`.
9. `module_skill_status` + `official_test_results` + `report_cards`.
10. `lesson_progress`.
11. `reading_progress` + `saved_words` + `reading_notes` + `reading_highlights`
    + `reading_explanations`.
12. `translation_cache`.
13. `question_events` + `mistake_records`.
14. `verb_progress`.
15. Indexes from [indexes.md](indexes.md) not already inline in a create-table
    migration.

Each numbered step above should land as its own migration file and its own
PR where practical, following the implementation roadmap's phase order —
see [implementation-roadmap.md](../architecture/implementation-roadmap.md).
