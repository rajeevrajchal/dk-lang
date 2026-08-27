import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AI_TASKS,
  TASK_CONFIG,
  aiAvailable,
  defaultProvider,
  providerAvailable,
  resolveModel,
} from "./registry";

// The provider abstraction. What matters is that the app is not tied to one
// vendor and degrades cleanly when no vendor is configured — the second half
// is load-bearing: with no keys at all, every AI feature falls back to
// authored content and the app stays fully usable.

const ORIGINAL = { ...process.env };

beforeEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.AI_PROVIDER;
});
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("provider availability", () => {
  it("reports nothing available with no keys", () => {
    expect(providerAvailable("anthropic")).toBe(false);
    expect(providerAvailable("openai")).toBe(false);
    expect(defaultProvider()).toBeNull();
    expect(aiAvailable()).toBe(false);
  });

  it("uses whichever provider has a key", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    expect(defaultProvider()).toBe("openai");
    expect(aiAvailable()).toBe(true);
  });

  it("honours AI_PROVIDER when that provider has a key", () => {
    process.env.ANTHROPIC_API_KEY = "sk-a";
    process.env.OPENAI_API_KEY = "sk-o";
    process.env.AI_PROVIDER = "openai";
    expect(defaultProvider()).toBe("openai");
  });

  it("falls back rather than failing when AI_PROVIDER has no key", () => {
    // Naming a provider you have not configured should not take the app down.
    process.env.AI_PROVIDER = "openai";
    process.env.ANTHROPIC_API_KEY = "sk-a";
    expect(defaultProvider()).toBe("anthropic");
  });

  it("ignores an AI_PROVIDER value that is not a provider", () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.ANTHROPIC_API_KEY = "sk-a";
    expect(defaultProvider()).toBe("anthropic");
  });
});

describe("resolveModel", () => {
  it("returns nothing when no provider is configured", () => {
    expect(resolveModel("exercise-generation")).toBeNull();
  });

  it("resolves every task on every provider", () => {
    // A task with no model for a provider would fail only at request time.
    process.env.ANTHROPIC_API_KEY = "sk-a";
    process.env.OPENAI_API_KEY = "sk-o";
    for (const task of AI_TASKS) {
      for (const provider of ["anthropic", "openai"] as const) {
        const resolved = resolveModel(task, provider);
        expect(resolved, `${task}/${provider}`).not.toBeNull();
        expect(resolved!.provider).toBe(provider);
        expect(TASK_CONFIG[task].models[provider]).toBeTruthy();
      }
    }
  });

  it("falls back when the preferred provider has no key", () => {
    process.env.ANTHROPIC_API_KEY = "sk-a";
    expect(resolveModel("examiner-turn", "openai")?.provider).toBe("anthropic");
  });

  it("gives Anthropic a thinking budget that leaves room to answer", () => {
    process.env.ANTHROPIC_API_KEY = "sk-a";
    const resolved = resolveModel("exercise-generation", "anthropic")!;
    const thinking = resolved.providerOptions.anthropic?.thinking as
      | { budgetTokens: number }
      | undefined;
    expect(thinking).toBeDefined();
    // The budget covers thinking AND text, so spending all of it on thinking
    // would leave nothing to answer with.
    expect(thinking!.budgetTokens).toBeLessThan(TASK_CONFIG["exercise-generation"].maxOutputTokens);
    // Anthropic rejects a budget below 1024.
    expect(thinking!.budgetTokens).toBeGreaterThanOrEqual(1024);
  });

  it("does not make a word gloss think", () => {
    // Extended thinking on a 900-token gloss is latency the learner pays for
    // and gets nothing back from.
    process.env.ANTHROPIC_API_KEY = "sk-a";
    const resolved = resolveModel("reading-explanation", "anthropic")!;
    expect(resolved.providerOptions.anthropic).toBeUndefined();
  });

  it("translates effort onto OpenAI's own knob rather than sending Anthropic's", () => {
    process.env.OPENAI_API_KEY = "sk-o";
    // exercise-explanation rather than exercise-generation: this is testing the
    // high -> reasoningEffort translation mechanism, not any one task's tuning,
    // and exercise-generation's effort has already been tuned down once
    // (lib/exercises/generator.ts) for measured latency reasons.
    const resolved = resolveModel("exercise-explanation", "openai")!;
    expect(resolved.providerOptions.openai?.reasoningEffort).toBe("high");
    expect(resolved.providerOptions.anthropic).toBeUndefined();
  });
});

describe("task budgets", () => {
  it("gives the deep reading explanation more room than the default one", () => {
    // The default cap is what stops a word click becoming a lecture; asking
    // for more has to lift it or the button does nothing.
    expect(TASK_CONFIG["reading-explanation-deep"].maxOutputTokens).toBeGreaterThan(
      TASK_CONFIG["reading-explanation"].maxOutputTokens
    );
  });

  it("gives the long sentence-and-word pass the largest budget", () => {
    const explanation = TASK_CONFIG["exercise-explanation"].maxOutputTokens;
    for (const task of AI_TASKS) {
      if (task === "exercise-explanation") continue;
      expect(TASK_CONFIG[task].maxOutputTokens).toBeLessThanOrEqual(explanation);
    }
  });

  it("keeps every budget positive and every task configured", () => {
    for (const task of AI_TASKS) {
      expect(TASK_CONFIG[task], task).toBeDefined();
      expect(TASK_CONFIG[task].maxOutputTokens, task).toBeGreaterThan(0);
    }
  });
});
