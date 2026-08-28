---
name: ai
description: Adding or modifying an AI-backed operation (explanation, feedback, content generation) under src/lib/ai/.
---

# AI

## When to use
Implementing or changing anything that calls an LLM: explanations, writing/
speaking feedback, practice-content generation.

## When NOT to use
Anything with a deterministic correct answer — scoring, completion status,
question selection, dashboard metrics. If you're here for one of those,
you're in the wrong skill; see `backend`'s conventions instead.

## Rules
- Provider/model/effort selection only through `src/lib/ai/registry.ts`.
- Generation only through `src/lib/ai/generate.ts`'s structured-output
  wrapper, returning a typed `Outcome`, never throwing.
- Every response Zod-validated before it touches the database or client.
- The app must work with zero AI keys configured — always have an authored/
  cached/fallback path.
- Three-tier cost rule for anything with an authored alternative: authored
  content → shared cache → model.
- Slow generation (task content) deferred via `waitUntil`, with a
  database-backed claim, not an in-memory `Map`/`Set` (see
  `docs/architecture/ai-architecture.md`'s serverless note).
- One small file per operation, with the full contract documented in a
  header comment (input, output, model/task key, validation, error
  handling, token considerations, caching, persistence).

## Workflow
1. Confirm the operation genuinely needs language understanding (re-check
   against AGENTS.md's boundary list).
2. Write the Zod schema for the output first.
3. Write the prompt in its own file (don't bundle multiple task types'
   prompts into one file — see ADR-003).
4. Wire it through `registry.ts` for model/effort selection.
5. Call via `generate.ts`'s structured wrapper.
6. Write the fallback path before the happy path.
7. Test that the fallback actually triggers when `aiAvailable()` is false.

## Examples
```ts
// src/lib/ai/explain-sentence.ts
// Input: { sentence, level, userQuestion? }
// Output: ExplanationSchema (Zod)
// Task key: reading-explanation | reading-explanation-deep
// Caching: reading_explanations, keyed (text_id, scope_kind, scope_id, level, depth)
// Persisted: yes, shared across learners
export async function explainSentence(input: ExplainInput): Promise<Outcome<Explanation>> {
  const cached = await lookupCache(input);
  if (cached) return { ok: true, value: cached, provider: 'cache' };
  if (!aiAvailable()) return { ok: false, reason: 'no-api-key', retryable: false };
  const result = await generateStructured(ExplanationSchema, buildPrompt(input), taskConfigFor('reading-explanation'));
  if (result.ok) await writeCache(input, result.value);
  return result;
}
```

## Common mistakes
- Hardcoding a model id in a feature file instead of going through the
  registry.
- Skipping the cache check and calling the model directly "since it's
  simpler for now."
- Letting a schema-validation failure throw instead of returning a typed
  failure outcome.
- Using AI to decide something the database already has a deterministic
  answer for (the single most important mistake to catch in review).
