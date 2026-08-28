---
description: Write or run the test suite for a feature, following dk-lang's testing priority order.
---

# /test-feature

Usage: `/test-feature <feature name>`

## What this does
Runs `.claude/skills/testing/SKILL.md`'s workflow against the named feature:
identifies what's untested relative to its priority tiers, writes the
missing tests, and runs the suite.

## Steps
1. Read the feature's doc in `docs/features/<name>.md`, specifically its
   "Testing Strategy" section — if it's empty, write one before writing
   tests.
2. Check existing coverage against the priority order in
   `.claude/skills/testing/SKILL.md`: business logic/grading first, then
   progress recording, auth (if relevant), server actions, AI fallback
   behavior, then end-to-end flows.
3. Write missing tests at the highest-priority tier that's gapped — don't
   start with end-to-end tests if pure-function coverage is missing.
4. Run the suite; report pass/fail, not just "tests added."

## Do not
- Write a test for a purely presentational component with no branching.
- Write an end-to-end flow test to cover something a pure-function test
  would verify faster and more reliably.
