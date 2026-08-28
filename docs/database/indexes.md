# Indexes

Principle: index for the queries the app actually runs (listed per feature
doc), not speculatively. Every index here is justified by a named query.
Add new ones the same way — cite the query in the PR, don't guess.

## `tasks`
- `unique (module_id, category, task_type, task_number)` — the slot lookup,
  every Class/Mock open goes through this.
- `index (module_id, category, task_type)` — ladder listing ("all 50 slots
  for reading task_type X in module 3"), used even for unmaterialized slots.

## `exercise_attempts`
- `index (user_id, module_id, category)` — "this learner's attempts in this
  category," dashboard + mistakes review.
- `index (exam_session_id)` — assembling a mock session's parts.
- `index (user_id, task_id)` — "has this learner attempted this task before,"
  used by the task-open flow to decide whether to show a prior result.
- `index (created_at)` — history screen, most-recent-first, paginated.

## `user_task_progress`
- PK `(user_id, task_id)` already supports the only lookup this table needs
  (per-user, per-task). No secondary index.

## `exam_sessions`
- `index (user_id, status)` — "does this learner have an in-progress mock,"
  checked on mock entry to offer resume vs. new.

## `module_skill_status`
- PK `(user_id, module_id, skill)` covers the unlock check, the only read
  pattern. No secondary index.

## `question_events`
- `index (user_id, created_at desc)` — history timeline, paginated.
- `index (user_id, question_key)` — "has this exact question been seen
  before," used when writing a new event.
- `index (attempt_id)` — "all events from this attempt," used when an attempt
  is reopened/reviewed.

## `mistake_records`
- `index (user_id, resolved_at)` where `resolved_at is null` (partial index)
  — the mistakes-review screen only ever lists unresolved rows; a partial
  index keeps it small as history grows.

## `reading_explanations` / `translation_cache`
- Their unique constraints (`(text_id, scope_kind, scope_id, level, depth)`
  and `hash`) are also the only lookup key — no separate index needed.

## `verb_progress`
- `index (user_id, due_at)` — "which verbs are due for review," the one
  query the practice screen runs.

## Deliberately not indexed yet
- `report_cards`, `official_test_results`: low row count per user (single
  digits), sequential scan on the `user_id` FK is fine. Revisit only if a
  real slow-query log says otherwise (see `docs/architecture/scaling.md`).
