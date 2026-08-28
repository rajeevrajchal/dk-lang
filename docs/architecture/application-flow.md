# Application Flow

## First-time user

```mermaid
graph LR
    A[Google sign-in] --> B{profile exists?}
    B -->|no, trigger creates blank profile| C[Onboarding]
    C --> D[Dashboard]
    B -->|yes, level_source set| D
```

`hooks.server.ts` resolves the Supabase session on every request and attaches
`locals.user`. The `(app)/+layout.server.ts` guard checks for a session and
redirects to `/login` if absent; it does **not** check onboarding status —
that's the `(app)/+layout.svelte`'s job via a lightweight `profile.level_source`
check, redirecting to `/onboarding` only when unset. Keeping these as two
separate, narrow checks (session vs. onboarding) avoids one layout guard
trying to encode every rule about who can see what.

## Returning user

```
Sign in → Dashboard (always the landing page post-auth)
  ↓ learner picks one of:
  Lessons        → work through next unfinished lesson
  Class          → pick category → pick/continue a task number
  Mock Tests     → pick module → sit full or partial test
  Progress       → review mistakes / history / unlock status
  Settings       → profile / level override
  ↓ (any graded activity)
  writes to exercise_attempts + question_events (+ mistake_records)
  ↓
  Dashboard reflects it on next visit (no cache to invalidate —
  dashboard metrics are computed fresh from the tables above each load)
```

## Class practice session (detailed)

```mermaid
sequenceDiagram
    participant U as Learner
    participant P as +page.server.ts
    participant S as src/lib/features/tasks/service.ts
    participant DB as Supabase

    U->>P: open Task 7 (Reading, Module 3)
    P->>S: ensureTaskFast(module, category, type, number)
    S->>DB: select task where unique slot key
    alt task exists
        DB-->>S: row
    else not found
        S->>S: try authored pool (in-code variant registry)
    end
    alt resolved synchronously
        S-->>P: task content (public shape, no answer key)
        P-->>U: render exercise
    else needs generation
        P-->>U: 202 "preparing" + render polling UI
        P->>S: schedule ensureTask() via waitUntil (off request path)
        S->>DB: insert task row once generated
        U->>P: poll /api/tasks/[id]/status (backoff 2s→8s, cap 5min)
        P->>DB: select task
        DB-->>P: row now exists
        P-->>U: 200 ready, render exercise
    end
    U->>P: submit answers (form action)
    P->>DB: insert exercise_attempt, question_events, upsert user_task_progress
    DB-->>P: ok
    P-->>U: result screen
```

## Mock test session

Same task-resolution machinery as Class (numbered mode), assembled for every
part of the test in parallel, wrapped in an `exam_sessions` row. See
[docs/features/mock-tests.md](../features/mock-tests.md) for the full flow,
including the rotating (non-numbered) assembly mode.

## Report card reconciliation

```
Upload (Storage) → OCR extraction → learner confirms/corrects
  → official_test_results rows created
  → module_skill_status.official_passed set (official always wins here)
  → if it disagrees with in_app_passed: discrepancy = true, noted, not auto-resolved
```
