---
name: feature-development
description: The mandatory workflow for building or modifying any feature in dk-lang — read docs, plan, implement the smallest useful version, test, update docs.
---

# Feature Development

## When to use
Any feature-level task — "build X," "add Y," "change how Z works." This is
the default workflow for substantive work in this repo.

## When NOT to use
A one-line bug fix with no design implications, or a pure content edit
(new lesson text). Go straight to the fix.

## Rules
Never jump from a high-level request ("build the dashboard") straight to
writing many files. Always go through the steps below first, even briefly.

## Workflow

1. **Read `AGENTS.md`** if this is a new session or it's been a while.
2. **Read the relevant `docs/architecture/*.md`** — at minimum `overview.md`
   and `feature-dependencies.md` for where this feature sits.
3. **Read the feature's doc** in `docs/features/` — if none exists yet,
   this step is "write one," using the existing docs as a template, before
   any code.
4. **Inspect existing code** for the feature area (if it already has a
   partial implementation) — don't duplicate what's there.
5. **Plan**: identify database changes (→ `database` agent/skill), server
   changes (→ `backend`), UI changes (→ `frontend`), AI involvement if any
   (→ `ai`), and tests (→ `testing`).
6. **Implement the smallest useful version** — one vertical slice (e.g. one
   reading task type, not all four) before expanding.
7. **Run tests.**
8. **Review** against `docs/architecture/architecture-review.md`'s
   checklist and the `reviewer` agent's list.
9. **Update documentation** — the feature doc, `feature-dependencies.md` if
   the dependency graph changed, and the implementation roadmap's status if
   relevant.

## Examples
"Build the Dashboard feature" →
1. Read `AGENTS.md`, `docs/architecture/overview.md`,
   `feature-dependencies.md`.
2. Read `docs/features/dashboard.md` (already written — this blueprint
   includes it).
3. Check: does Progress (Phase 6) already exist? If not, that's a
   blocking dependency — flag it rather than building dashboard queries
   against tables that don't have data flowing into them yet.
4. Implement Phase 5's shell first if nothing exists yet, not all 10
   metrics at once.
5. Test each metric function independently.
6. Update `docs/features/dashboard.md` only if the actual implementation
   diverges from what's documented (and explain why in the PR).

## Common mistakes
- Skipping straight to code because "the docs already say what to build" —
  reading them again per-task catches drift between what was planned and
  what's actually needed now.
- Building every metric/task-type/category in one PR instead of one
  vertical slice.
- Forgetting step 9 — docs drift is exactly what made the old codebase's
  `README.md`/`docs/content-validation.md` wrong about how generation
  actually worked (see the audit that informed this blueprint).
