---
description: Plan a feature before implementing it — reads the architecture/feature docs, produces an implementation plan, does not write code.
---

# /plan-feature

Usage: `/plan-feature <feature name or description>`

## What this does
Runs the planning half of `.claude/skills/feature-development/SKILL.md`
(steps 1–5) and stops before implementation, producing a plan for review.

## Steps
1. Read `AGENTS.md`.
2. Read `docs/architecture/overview.md` and
   `docs/architecture/feature-dependencies.md`.
3. Read `docs/features/<feature>.md` if it exists; if not, draft one
   (don't write code yet — the draft itself is the output).
4. Check `docs/architecture/implementation-roadmap.md` for where this
   feature falls and what it depends on.
5. Identify: database changes needed, server changes, UI changes, AI
   involvement (if any), and a testing plan.
6. Output a short implementation plan: the files expected to change, the
   order to build them in, and anything blocking (an unbuilt dependency
   from an earlier phase).

## Do not
- Write or edit any source file.
- Skip reading the feature doc even if the request seems simple.
