---
description: Review an implemented feature (or diff) against dk-lang's architecture rules — complexity, AI boundaries, database design, coupling.
---

# /review-feature

Usage: `/review-feature <feature name, PR, or diff>`

## What this does
Runs the `.claude/agents/reviewer.md` checklist against the specified
change.

## Steps
1. Identify the diff/feature in question (read the changed files; if a PR
   number or branch is given, diff against `main`).
2. Check against every item in `.claude/agents/reviewer.md`'s checklist:
   over-engineering, duplicated logic, unnecessary AI usage, client-side
   fetching that should be server-side, dashboard calculations that should
   be SQL, bad normalization, missing indexes/RLS, over-coupled features,
   unnecessary global state.
3. Cross-check the feature's own `docs/features/<name>.md` — does the
   implementation match what's documented? If not, is the divergence
   explained anywhere?
4. Cross-check `docs/architecture/feature-dependencies.md` — any new edges,
   and are they the right direction?
5. Output findings: problem, why it matters (cite the rule), smallest fix.
   Don't rewrite the feature — point at the fix.

## Do not
- Approve a new `+server.ts` outside the three documented exceptions
  without flagging it.
- Approve an AI call on a deterministic decision, ever — this is a block,
  not a note.
