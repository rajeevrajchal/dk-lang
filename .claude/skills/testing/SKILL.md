---
name: testing
description: What and how to test in dk-lang — priority order, pure-function-first, RLS and AI-fallback coverage.
---

# Testing

## When to use
Before marking any non-trivial feature done; when adding a new table
(RLS tests) or AI operation (fallback tests).

## When NOT to use
Don't write a test for a purely presentational `.svelte` component with no
branching logic — that's wasted effort per AGENTS.md's testing expectations.

## Rules — priority order
1. Database/business logic (grading, scoring, derivations) — pure functions,
   no DB connection needed.
2. Progress/attempt recording — the atomic multi-table write.
3. Authentication — session resolution, redirects, dev-login unreachability
   in production.
4. Server actions — validation success and `fail()` paths.
5. AI output validation — schema mismatch handling, fallback triggers.
6. Critical user flows — sign-in → onboarding → dashboard; task open →
   submit → result; mock test sit → complete → pass/fail.

## Workflow
1. Identify which priority tier the change falls into.
2. For pure functions: write the test with hand-constructed input, no
   database.
3. For RLS: connect as two different user JWTs, assert cross-user denial;
   connect as anon, assert denial on user-owned tables.
4. For AI operations: force `aiAvailable()` false (or mock a schema
   mismatch) and assert the fallback path is what actually renders/persists.
5. For flows: one end-to-end test per critical path listed above, not one
   per minor variation.

## Examples
```ts
// pure function, no DB
test('resumePoint prefers in-progress over not-started', () => {
  const progress = { 'lesson-1': 'COMPLETED', 'lesson-2': 'IN_PROGRESS' };
  expect(resumePoint(chapters, progress)).toBe('lesson-2');
});
```

```ts
// RLS denial
test('user A cannot read user B mistake_records', async () => {
  const asA = supabaseAsUser(userA.jwt);
  const { data, error } = await asA.from('mistake_records').select().eq('user_id', userB.id);
  expect(data).toEqual([]);
});
```

## Common mistakes
- Testing a pure function against a live database "to be safe" — if it
  needs a DB connection to test, it isn't pure; fix the function first.
- Skipping the anon-role denial test because "the app never queries as
  anon" — RLS needs to hold regardless of what the app currently does,
  since the anon/authenticated key is public by Supabase design.
- Writing one test per UI variant of a flow instead of one test per
  genuinely distinct path.
