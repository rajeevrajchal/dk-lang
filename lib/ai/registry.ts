import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { AiProvider, AiTask, Effort, ResolvedModel, TaskConfig } from "@/types";

// Which model runs which job.
//
// The app used to call the Anthropic SDK directly from four files, each with
// its own client, its own model string and its own idea of how hard to think.
// That made the provider a fact about the codebase rather than a setting. This
// module is the single place that knows about vendors; everything else asks
// for a TASK and gets back a model.
//
// The tasks are not interchangeable and neither are their budgets — writing a
// whole modultest opgave is a different job from glossing one Danish word, and
// the difference is worth an order of magnitude in tokens and latency.

export const AI_PROVIDERS = ["anthropic", "openai"] as const;
export const AI_TASKS = [
  "exercise-generation", // write a whole opgave, answer key included
  "exercise-explanation", // sentence-by-sentence pass over a long text
  "examiner-turn", // one spoken turn in a speaking exercise
  "reading-explanation", // gloss a word, sentence or paragraph on demand
  "reading-explanation-deep", // the same, after the learner asked for more
] as const;
export const TASK_CONFIG: Record<AiTask, TaskConfig> = {
  "exercise-generation": {
    effort: "medium",
    maxOutputTokens: 16000,
    models: { anthropic: "claude-opus-5", openai: "gpt-5" },
  },
  "exercise-explanation": {
    // A full sentence-and-word pass over a long opgave. This is the one that
    // streams — see lib/ai/generate.ts.
    effort: "high",
    maxOutputTokens: 64000,
    models: { anthropic: "claude-opus-5", openai: "gpt-5" },
  },
  "examiner-turn": {
    effort: "medium",
    maxOutputTokens: 2000,
    models: { anthropic: "claude-opus-5", openai: "gpt-5" },
  },
  "reading-explanation": {
    // Capped hard on purpose: the learner clicked one word and wants to get
    // back to reading. A request that cannot run long cannot lecture.
    effort: "low",
    maxOutputTokens: 900,
    models: { anthropic: "claude-opus-5", openai: "gpt-5-mini" },
  },
  "reading-explanation-deep": {
    // The learner read the short answer and asked for more, so the cap that
    // stops a word click becoming a lecture no longer applies.
    effort: "medium",
    maxOutputTokens: 2000,
    models: { anthropic: "claude-opus-5", openai: "gpt-5" },
  },
};

// ---------------------------------------------------------------------------
// Which providers are usable
// ---------------------------------------------------------------------------

export const providerAvailable = (provider: AiProvider): boolean => {
  return provider === "anthropic"
    ? !!process.env.ANTHROPIC_API_KEY
    : !!process.env.OPENAI_API_KEY;
};

/** The configured default, falling back to whichever key actually exists. */
export const defaultProvider = (): AiProvider | null => {
  const configured = process.env.AI_PROVIDER as AiProvider | undefined;
  if (configured && AI_PROVIDERS.includes(configured) && providerAvailable(configured)) {
    return configured;
  }
  return AI_PROVIDERS.find(providerAvailable) ?? null;
};

/**
 * Whether any generated feature can run at all.
 *
 * Every caller checks this and degrades to its authored fallback rather than
 * failing — the app is fully usable with no AI keys at all, and that property
 * is load-bearing for the reading library in particular.
 */
export const aiAvailable = (): boolean => {
  return defaultProvider() !== null;
};

// ---------------------------------------------------------------------------
// Resolving a model
// ---------------------------------------------------------------------------

/**
 * Anthropic's extended thinking takes a token budget, and the budget has to
 * leave room for the answer itself — `maxOutputTokens` covers thinking AND
 * text, so a budget equal to the cap would leave nothing to answer with.
 * Anthropic requires at least 1024.
 */
const anthropicThinking = (effort: Effort, maxOutputTokens: number) => {
  if (effort === "low") return undefined; // not worth the latency on a word gloss
  const share = effort === "high" ? 0.6 : 0.4;
  const budget = Math.floor(maxOutputTokens * share);
  if (budget < 1024) return undefined;
  return { type: "enabled" as const, budgetTokens: budget };
};

export const resolveModel = (task: AiTask, preferred?: AiProvider): ResolvedModel | null => {
  const provider =
    (preferred && providerAvailable(preferred) ? preferred : null) ?? defaultProvider();
  if (!provider) return null;

  const config = TASK_CONFIG[task];
  const modelId = config.models[provider];

  if (provider === "anthropic") {
    const thinking = anthropicThinking(config.effort, config.maxOutputTokens);
    return {
      model: anthropic(modelId),
      provider,
      config,
      providerOptions: thinking ? { anthropic: { thinking } } : {},
    };
  }

  return {
    model: openai(modelId),
    provider,
    config,
    providerOptions: {
      openai: {
        // OpenAI has no equivalent of a thinking budget; it has a reasoning
        // effort. Mapping one onto the other is the closest honest
        // translation, not an equivalence.
        reasoningEffort: config.effort,
        // Every schema in this app with an optional field (translation, the
        // reading explanation, several more) fails outright under OpenAI's
        // default strict mode: it demands every property be listed in
        // `required`, which is not what Zod's `.optional()` means. The
        // failure is a 400 from OpenAI, non-retryable, and by the time it
        // reaches the learner it is just "unavailable" — indistinguishable
        // from no API key being configured at all. OpenAI ships the escape
        // hatch for exactly this; it is not something to route around at the
        // schema level.
        strictJsonSchema: false,
      },
    },
  };
};
