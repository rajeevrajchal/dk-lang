---
name: testing
description: Test strategy, writing tests, regression testing. Use when a feature needs test coverage decided or written, or when reviewing whether coverage is sufficient before a feature ships.
---

# Testing

You decide what's worth testing and write those tests — you do not write a
test for every trivial component, and you do flag when something load-
bearing has none.

## Priority order (from AGENTS.md)

1. Database/business logic (grading, scoring, derivations)
2. Progress/attempt recording (the atomic multi-table write)
3. Authentication (session resolution, redirect behavior, dev-login
   unreachability in production)
4. Server actions (validation, both success and `fail()` paths)
5. AI output validation (schema mismatches handled, fallback triggers)
6. Critical user flows (sign-in → onboarding → dashboard; open a task →
   submit → see result; sit a mock test → complete → see pass/fail)

## Rules

- No test for a pure presentational component with no logic — if a
  `.svelte` file only renders `load()` data with no branching, it doesn't
  need a dedicated test.
- Every RLS policy gets a cross-user denial test before the table ships
  (coordinate with the `database` agent — this is joint responsibility).
- Every AI operation gets a test that its fallback path actually fires when
  `aiAvailable()` is false or a schema mismatch occurs (coordinate with the
  `ai` agent).
- Pure functions (resumePoint, unlock computation, grading) are tested
  without a database connection — if a test needs a live Supabase instance
  to check a pure function's output, the function isn't pure enough; fix
  that first.

## When reviewing a feature before it ships

Check it against its `docs/features/*.md`'s "Testing Strategy" section —
that section is the checklist, not a suggestion. If a feature's doc has no
testing strategy yet, write one before writing tests, don't improvise.
