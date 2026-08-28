---
description: Implement a feature following the full feature-development workflow — plan, build the smallest useful slice, test, update docs.
---

# /implement-feature

Usage: `/implement-feature <feature name or description>`

## What this does
Runs the full `.claude/skills/feature-development/SKILL.md` workflow,
including implementation.

## Steps
1. Everything in `/plan-feature` first (steps 1–5 there).
2. Implement the smallest useful vertical slice — not every category/
   metric/task-type at once.
3. Write tests per `.claude/skills/testing/SKILL.md`'s priority order.
4. Run the test suite and typecheck.
5. Self-review against `docs/architecture/architecture-review.md`'s
   checklist before calling it done.
6. Update the feature's doc in `docs/features/` if the implementation
   diverged from what was documented, and update
   `docs/architecture/feature-dependencies.md` if new dependency edges were
   introduced.

## Guardrails
- If a blocking dependency from an earlier implementation-roadmap phase
  doesn't exist yet, stop and say so rather than building around the gap.
- If the request implies an API route, check
  `docs/architecture/overview.md`'s three exceptions first — most requests
  for "an endpoint" should become a load function or action instead.
- If AI involvement is implied, check whether it's actually
  AI-appropriate per AGENTS.md's boundary list before building it as an AI
  call.
