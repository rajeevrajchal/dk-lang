# Database Relationships

Every user-owned table carries a `user_id uuid references auth.users(id)`
foreign key (shown below by group rather than repeated per table). This doc
covers the relationships *between* feature tables, which is the part worth
reading carefully.

## Ownership fan-out from `auth.users`

```
auth.users (Supabase-managed)
 └── profiles (1:1, cascade delete)
      └── profile_interests (1:N, cascade delete)
 └── tasks: none directly — tasks are global content, not user-owned
 └── exercise_attempts (1:N)
 └── user_task_progress (1:N)
 └── exam_sessions (1:N)
 └── module_skill_status (1:N)
 └── official_test_results (1:N)
 └── report_cards (1:N)
 └── lesson_progress (1:N)
 └── reading_progress / saved_words / reading_notes / reading_highlights (1:N each)
 └── question_events (1:N)
 └── mistake_records (1:N)
 └── verb_progress (1:N)
```

Deleting a Supabase auth user cascades to every one of these — a full
account deletion is a single `auth.users` delete plus a Storage cleanup for
uploaded report-card files (Storage objects are not foreign-keyed and must
be removed explicitly; see `docs/features/settings.md`).

## Content relationships (not user-owned)

```
modules (1) ──< tasks (N)
modules (1) ──< exam_sessions (N)
modules (1) ──< module_skill_status (N)
modules (1) ──< official_test_results (N)
profiles (1) ──> modules (1)   [current_module_id, nullable until onboarding]
```

`tasks` and `modules` are the only tables with no `user_id` — they are shared
content, read by every learner, written only by the generation pipeline
(service-role) or migrations.

## The attempt graph — how one answer becomes three things

This is the relationship most worth understanding before touching any of
these tables:

```
exercise_attempts (one sitting of one task)
      │
      ├──> question_events (append-only, one row per graded question
      │     within that sitting — a reading task with 5 questions writes
      │     5 events from 1 attempt)
      │
      └──> user_task_progress (upserted: best_score = max(existing, new),
            last_score = new, attempt_count += 1)

question_events ──> mistake_records (upserted by question_key: miss_count
      increments on a new miss, resolved_at is set — never deleted — on a
      correct answer for a previously-missed question_key)
```

All three writes happen from **one function** (the attempt-recording path —
see `docs/features/progress.md`), so they cannot drift out of sync. No other
code path is allowed to write to `question_events`, `mistake_records`, or
`user_task_progress` directly.

## Mock tests reuse Class content

```
tasks (task_number 7, category READING) ──┐
                                           ├── referenced by both:
exercise_attempts (Class sitting) ────────┤
exercise_attempts (Mock sitting, same task_id,
   exam_session_id set) ───────────────────┘
```

A mock test's numbered parts are `exercise_attempts` rows with `task_id`
pointing at the *same* `tasks` row a Class practice session would use, plus
`exam_session_id` set. There is no separate "mock content" table. Rotating
(non-numbered) mock assembly produces `exercise_attempts` with `task_id null`
— ephemeral content that is never written back into `tasks`.

## Unlock state depends on two independent sources

```
exam_sessions (completed, scores ≥ threshold)
      └──> module_skill_status.in_app_passed = true

report_cards (confirmed)
      └──> official_test_results (one row per module/skill)
             └──> module_skill_status.official_passed = true
                  (official result always wins for this column;
                   in_app_passed is never edited by this path —
                   a mismatch sets discrepancy = true instead)
```

## Why there is no foreign key from `tasks.module_id` + `category` + `task_type` to a "task type" table

Task types are a closed list *per category*, defined in application code
(`src/lib/features/class/catalogue.ts`), not a database table. The set is
small, changes only with a code deploy (new task type = new prompt/renderer,
not new data), and a DB-level FK would add a migration for something that's
really a code constant. See `docs/features/class.md`.
