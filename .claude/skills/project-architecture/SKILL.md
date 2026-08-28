---
name: project-architecture
description: Orient in the dk-lang architecture before making a structural change — new feature, new table, new module boundary.
---

# Project Architecture

## When to use
Before adding a feature, a new `src/lib/` module, a new route group, or a
new table — anything that changes the shape of the system rather than just
its content.

## When NOT to use
For a bug fix within an existing feature's established pattern, or a pure
content change (new lesson text, new reading passage). Those don't need an
architecture pass — just follow the existing pattern in that feature's doc.

## Rules
- `AGENTS.md` is the binding instruction set. `docs/architecture/*` is the
  detail behind it. If they ever conflict, `AGENTS.md` wins and the
  architecture doc should be fixed.
- A feature doesn't exist until it has a `docs/features/*.md` file. Write
  the doc (or update it) before or alongside the code, not after.
- Every new feature must be placed correctly in
  `docs/architecture/feature-dependencies.md` — no cycles, Dashboard/Progress
  invariants preserved (see that doc).

## Workflow
1. Read `AGENTS.md` fully if this is a new session.
2. Read `PROJECT.md` for product context.
3. Read `docs/architecture/overview.md` and `project-graph.md`.
4. Read the specific `docs/features/*.md` for the feature in question.
5. Check `feature-dependencies.md` for what this feature may/may not depend
   on.
6. Proceed to implementation (see `.claude/skills/feature-development/SKILL.md`).

## Examples
- "Add a Listening category" → read `docs/features/class.md` (Listening is
  already scaffolded there as architecture-readiness), confirm no schema
  change is needed beyond what's already planned, implement content +
  renderer only.
- "Dashboard should show a new metric" → read `docs/features/dashboard.md`'s
  metrics table, add a row, implement the query in the Progress layer (not
  directly in the dashboard file), cite the source table.

## Common mistakes
- Jumping straight to code for a multi-feature request ("build the
  dashboard") instead of planning which phase/feature docs apply first.
- Adding a new table without checking whether the data belongs in an
  existing one (most new "progress" concepts belong in the existing
  attempt/event pipeline, not a new table — see `architecture-review.md`).
- Treating the old Next.js code as a literal spec — it's reference material
  for what to keep/rebuild/remove, not a port target.
