# AI Architecture

## The rule

**AI is not the application engine.** Scoring, progress, unlocking, question
selection, and every dashboard number are deterministic code/SQL. AI is used
only where language intelligence is genuinely required. See
[AGENTS.md](../../AGENTS.md#ai-boundaries--read-this-twice) for the
non-negotiable version of this rule.

## Deterministic vs. AI services

| Deterministic (never AI) | AI (never deterministic) |
|---|---|
| `getDashboardMetrics()` | `explainSentence()` |
| `getNextTaskNumber()` | `explainWord()` |
| `gradeAnswers()` | `explainGrammarPoint()` |
| `computeUnlockStatus()` | `generateWritingFeedback()` |
| `resumeLessonPoint()` | `generateSpeakingFeedback()` |
| `recordAttempt()` | `generatePracticeContent()` (only when the authored pool for a slot is exhausted) |
| `assembleMockTest()` (picks which slots, not content) | one conversational turn from the speaking examiner |

## Module layout

```
src/lib/ai/
├── registry.ts              # provider/model/effort config — the only place
│                             # a model id or API key is referenced
├── generate.ts               # generateStructured<T>() — the one call site
│                             # every AI operation uses
├── explain-sentence.ts
├── explain-word.ts
├── grammar-feedback.ts
├── writing-feedback.ts
├── speaking-feedback.ts
├── speaking-turn.ts
└── exercise-generation/
    ├── reading-task1.ts … reading-task4.ts
    ├── writing.ts
    ├── speaking/
    │   ├── mindmap.ts, information-gap.ts,
    │   │   prepared-topic.ts, picture-preference.ts
    │   └── shared/
    │       ├── prompt-fragments.ts   # shared Danish pedagogy language
    │       ├── topics.ts             # rotation pools per task type
    │       └── slot-guidance.ts      # anti-duplication: sibling-title injection
    └── mapping.ts                    # raw model JSON → typed ExerciseVariant
                                       # (pure function, not a prompt — kept
                                       # separate on purpose, see below)
```

This splits what the old `lib/exercises/generator.ts` (770 lines) mixed
together: prompt text, Danish-pedagogy domain rules, and the response→domain
mapping. Each file above does exactly one of those three things. See
[ADR-003](../decisions/ADR-003-ai-boundaries.md).

## `registry.ts` — kept nearly verbatim from the old app

This was the cleanest subsystem in the audit and ports with only
import-path changes:

- `AI_PROVIDERS = ['anthropic', 'openai']`, a named `AI_TASKS` list, each with
  its own `effort`, `maxOutputTokens`, and per-provider model id.
- `defaultProvider()` — env-driven, falls back to whichever API key is set,
  never throws on a misconfigured value.
- `aiAvailable()` — every AI call site checks this first; **the app must
  fully function with zero AI keys configured**, falling back to authored
  content and baseline (non-AI) feedback. This is a tested invariant, not a
  nice-to-have.
- `resolveModel()` — translates the app's `effort` knob into
  provider-specific settings (Anthropic extended-thinking budget, OpenAI
  `reasoningEffort` + `strictJsonSchema: false` — OpenAI's strict mode
  rejects a Zod schema with any `.optional()` field, a real bug fixed once
  already; keep the workaround and the comment explaining it).

## `generate.ts` — the outcome-not-exception pattern

`generateStructured<S>()` wraps Vercel AI SDK's `generateObject()` and
**never throws** to its caller. It returns:

```ts
type Outcome<T> =
  | { ok: true; value: T; provider: Provider }
  | { ok: false; reason: 'no-api-key' | 'schema-mismatch' | 'provider-error'; retryable: boolean };
```

Every AI operation's caller branches on `ok`, not a try/catch. A
`schema-mismatch` failure feeds the validation errors back into a single
retry; exhaustion returns `ok: false` and the caller falls back to authored
content or a "try again" UI state. This is the one AI pattern worth porting
essentially unchanged.

## Per-operation contract

Every file under `src/lib/ai/` documents, in a header comment, exactly these
fields. Template (filled in for `explainSentence` as the example):

| field | value |
|---|---|
| Input | `{ sentence: string, level: 1-5, userQuestion?: string }` |
| Output | `{ explanation: string, highlightedWords: {word, note}[] }` (Zod schema) |
| Model / task key | `reading-explanation` (or `-deep` if `userQuestion` set) |
| Prompt responsibility | this file only — no shared mega-prompt |
| Validation | Zod schema, one retry on mismatch |
| Error handling | `Outcome` — caller shows cached/authored explanation or a retry button |
| Token considerations | capped by `TASK_CONFIG['reading-explanation'].maxOutputTokens` |
| Caching | `reading_explanations` table, keyed `(text_id, scope_kind, scope_id, level, depth)` — checked **before** calling the model |
| Persisted? | yes, shared across all learners (not per-user) |

Every other AI function gets the same table in its own file's header comment,
not duplicated into this doc.

## The three-tier cost rule (reading explanations, word lookups, translation)

Ported exactly from the old app because it's correct and cheap to keep:

```
1. Authored glossary (free, instant) — checked first, always
2. Shared cache (reading_explanations / translation_cache) — checked second
3. Model — only on a double-miss, result written back to tier 2
```

A regression test asserts low-level (1–2) reading texts gloss at least half
their longer words in tier 1, "because a beginner has no fallback." Keep
this test.

## Generation on serverless — the one thing that must change

The old Next.js app defers slow generation (68–152s, measured) past the HTTP
response using `after()`, and dedupes concurrent requests for the same slot
with an **in-process** `Map`/`Set`. Both files in the old code say outright
that the in-process cache is "never the source of truth" — the database's
unique constraint on `tasks` is what actually prevents a double-write.

On Vercel serverless, **"in-process" cannot be assumed to mean anything
beyond a single invocation** — concurrent requests can and do land on
different instances with no shared memory. The deferred-call mechanism
(`waitUntil` from `@vercel/functions`, the framework-agnostic equivalent of
Next's `after()`) is fine to keep. The in-process dedupe must be replaced
with a **database-backed claim**, not an in-memory guess:

```sql
-- claim a generation slot atomically; a second concurrent request gets 0 rows
-- and does not start its own generation call
update task_generation_claims
set claimed_at = now()
where slot_key = $1 and (claimed_at is null or claimed_at < now() - interval '3 minutes')
returning slot_key;
```

(Exact table/columns are an implementation detail for the Class feature doc
— the point to carry into the rewrite is: **the claim must be in Postgres**,
not a module-level `Set`, because "module-level" no longer means "this
process will see every request for this slot.")

The unique constraint on `tasks(module_id, category, task_type, task_number)`
remains the actual correctness backstop either way — a slot generated twice
across two workers still resolves correctly, it just costs one extra model
call. That property is worth keeping exactly as documented in the old code.

## Validation is mandatory, always

Every AI response is Zod-validated before it touches the database or the
client. Raw LLM output is never persisted or rendered directly. This applies
equally to structured exercise generation and free-text explanations (which
still have a schema — `{ explanation: string, ... }` — even though the
interesting field is prose).
