import type { LanguageModel } from "ai";
import type { z } from "zod";
import type { AI_PROVIDERS, AI_TASKS } from "@/lib/ai/registry";

export type AiProvider = (typeof AI_PROVIDERS)[number];
export type AiTask = (typeof AI_TASKS)[number];

/**
 * How much thinking a task deserves. Named rather than numeric so the two
 * providers can map it onto their own knobs — Anthropic has extended thinking
 * with a token budget, OpenAI has a reasoning effort enum, and they are not
 * the same thing.
 */
export type Effort = "low" | "medium" | "high";

export interface TaskConfig {
  effort: Effort;
  maxOutputTokens: number;
  /** Models per provider. Both must be able to do the job. */
  models: Record<AiProvider, string>;
}

export interface ResolvedModel {
  model: LanguageModel;
  provider: AiProvider;
  config: TaskConfig;
  /** Vendor-specific options, keyed the way the AI SDK expects. */
  providerOptions: Record<string, Record<string, unknown>>;
}

export interface GenerateOutcome<T> {
  object: T | null;
  /** Why there is no object. Absent on success. */
  reason?: string;
  /** Which vendor answered, for logging. */
  provider?: AiProvider;
  /**
   * Whether trying again could plausibly succeed.
   *
   * False for a missing key, a rejected key or a malformed request — none of
   * those fix themselves, and callers that retry (the exercise generator tries
   * twice) would otherwise burn their second attempt on a certainty. Vendor
   * error classes are read here so no caller has to know about them.
   */
  retryable: boolean;
}

export interface GenerateOptions<S extends z.ZodType<object>> {
  task: AiTask;
  schema: S;
  system: string;
  prompt: string;
  /** Force a vendor. Falls back to the default when it has no key. */
  provider?: AiProvider;
  /**
   * Stream the response instead of waiting for it whole.
   *
   * Only worth it for genuinely long output: a full sentence-and-word pass
   * over an opgave can run to tens of thousands of tokens, and a non-streaming
   * request risks the HTTP timeout before the first byte. The awaited result is
   * identical either way — this is about the connection staying alive, not
   * about showing partial output.
   */
  stream?: boolean;
  /** Milliseconds. Defaults by task size. */
  timeoutMs?: number;
}
