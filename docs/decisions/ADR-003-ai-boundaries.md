# ADR-003: AI Boundaries — small single-purpose functions, registry kept, generator split

## Status
Accepted.

## Context
The old app's AI layer had two very different halves: `lib/ai/registry.ts` +
`lib/ai/generate.ts`, a clean, well-tested, framework-agnostic provider
abstraction with an outcome-not-exception error model; and
`lib/exercises/generator.ts`, a 770-line file mixing prompt text, Danish
pedagogy domain rules, topic rotation, anti-duplication guidance, and
response-to-domain mapping for every task type in one place.

## Decision
1. **Port `registry.ts` and `generate.ts` near-verbatim** (import paths only
   change) — see `docs/architecture/ai-architecture.md`. Specifically keep:
   the provider-availability fallback (`aiAvailable()`), the effort→model
   translation including the OpenAI `strictJsonSchema: false` workaround,
   and the `Outcome`-not-exception return shape.
2. **Split `generator.ts` by responsibility, not just by task type**: prompt
   text per task type, shared fragments/topics/slot-guidance as their own
   modules, and response mapping (`mapping.ts`) as a pure function separate
   from any prompt file.
3. **Enforce the AI-is-not-the-engine boundary structurally**: every
   deterministic operation (grading, unlock, dashboard metrics, question
   selection) lives outside `src/lib/ai/` entirely, and nothing under
   `src/lib/ai/` is called from a grading or unlock code path.

## Consequences
- The registry/generate split means adding a third provider later (if ever
  needed) touches one file, not every feature.
- Splitting the generator means a task-type-specific pedagogy bug (e.g. a
  wrong difficulty-calibration rule for one reading format) is fixable by
  editing one small file, not by finding the right 40 lines inside a
  770-line one.
- The structural separation (nothing in `src/lib/ai/` decides anything
  deterministic) makes the AI boundary reviewable by directory listing
  alone — a reviewer can check "does this PR add a call into `src/lib/ai/`
  from `src/lib/features/progress/`" without reading every line.

## Alternatives considered
- **Keep one generator file per category** (reading/writing/speaking each
  still one large file): rejected — still mixes at least 4 reading task
  types' worth of distinct pedagogy rules in one file; the audit's
  complaint was about mixing *concerns* (prompt vs. mapping vs. domain
  rules), which a per-category split doesn't fix, only a per-responsibility
  split does.
- **Templatize all prompts into one generic "build a prompt for task type X"
  function with a config object per type**: rejected for now — the old
  prompts are genuinely hand-tuned prose with task-type-specific anti-gaming
  rules; forcing them into one templated shape would either lose that
  specificity or just become a config object so large it's equivalent
  complexity with worse readability. Revisit only if a future task type
  proves the prompts really are mostly boilerplate with one varying field.
