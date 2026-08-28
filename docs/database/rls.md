# Row-Level Security

RLS is the authorization boundary for this application — not application
code. Every table below has RLS enabled; app code must never rely on "the
query already filtered by user_id" as the only protection, because the
client-facing Supabase client is issued the user's own JWT and could, in
principle, be queried directly.

## Pattern

```sql
alter table <table> enable row level security;

create policy "<table>_select_own" on <table>
  for select using (auth.uid() = user_id);

create policy "<table>_insert_own" on <table>
  for insert with check (auth.uid() = user_id);

create policy "<table>_update_own" on <table>
  for update using (auth.uid() = user_id);
```

Delete policies are added only where the feature actually deletes rows
(e.g. `saved_words`, `reading_notes`, `reading_highlights`). Most tables are
insert/append-only or update-in-place and never deleted by the user.

## Per-table policies

| table | select | insert | update | delete |
|---|---|---|---|---|
| `profiles` | own | own (via trigger on signup, not client) | own | — |
| `profile_interests` | own | own | — | own |
| `exercise_attempts` | own | own | — (never edited after submit) | — |
| `user_task_progress` | own | own | own (upsert) | — |
| `exam_sessions` | own | own | own (status/scores transitions) | — |
| `module_skill_status` | own | service-role only | service-role only | — |
| `official_test_results` | own | service-role only | — | — |
| `report_cards` | own | own | own (status transitions up to `EXTRACTED`) | own (before confirmation only) |
| `lesson_progress` | own | own | own (upsert) | — |
| `reading_progress` | own | own | own (upsert) | — |
| `saved_words` | own | own | — | own |
| `reading_notes` | own | own | own | own |
| `reading_highlights` | own | own | — | own |
| `question_events` | own | service-role only | — (append-only) | — |
| `mistake_records` | own | service-role only | service-role only | — |
| `verb_progress` | own | own | own (upsert) | — |

**Why some inserts/updates are service-role-only, not "own":** `question_events`,
`mistake_records`, `module_skill_status`, and `official_test_results` are
derived/authoritative state written by server-side grading and reconciliation
logic, not a direct user action. A learner's browser should never be able to
insert a `question_events` row claiming an answer was correct — that would
let a client forge progress. These writes go through the admin/service-role
client from inside a server action, after the server itself has verified the
answer.

## Shared (non-user-owned) tables

| table | select | insert/update | delete |
|---|---|---|---|
| `modules` | **everyone** (including anon, if the marketing site ever needs it) | service-role only (migration/seed) | — |
| `tasks` | **authenticated users only** (content includes nothing secret per se, but no reason to expose it to anon) — and the app-level query must still strip the answer key before sending to the client; RLS does not know which *columns* the client asked for | service-role only (generation pipeline) | — |
| `reading_explanations` | authenticated | service-role only (written by the AI explain pipeline after validation) | — |
| `translation_cache` | authenticated | service-role only | — |

**Important column-level note**: RLS controls *rows*, not *columns*. The
`content` column on `tasks` and `variant_json` on `exercise_attempts` contain
answer keys. The public-facing query must always select an explicit column
list that excludes them (`toPublicExercise()`-equivalent in
`src/lib/features/class/`) — RLS alone does not prevent the client role from
reading the answer key if a careless `select *` reaches a client-exposed
endpoint. This is an application-code responsibility layered on top of RLS,
not a substitute for it.

## Testing RLS

Every new table gets at minimum:
- A test that user A cannot `select`/`insert`/`update` user B's row
  (connect as A's JWT, attempt the operation, expect 0 rows / permission
  denied).
- A test that the anon role is fully blocked on user-owned tables.
- For service-role-only tables, a test that the authenticated role's insert
  attempt is rejected.

See [.claude/skills/database/SKILL.md](../../.claude/skills/database/SKILL.md)
for how to write these against a local Supabase instance.
