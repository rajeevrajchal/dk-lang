import { describe, expect, it } from "vitest";
import { buildMistake, sameWords } from "./feedback";
import type { LessonExercise } from "@/types";

// The correction a learner sees when they get something wrong. "✗" teaches
// nothing; "❌ Jeg arbejde ✅ Jeg arbejder" teaches the rule in one glance.

describe("buildMistake", () => {
  it("puts a wrong choice back into its sentence", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "selection",
      instruction: "",
      sentence: "Jeg ___ i Aarhus.",
      options: ["arbejder", "arbejde"],
      answer: "arbejder",
    };
    expect(buildMistake(ex, "arbejde", "arbejder")).toEqual({
      yours: "Jeg arbejde i Aarhus.",
      correct: "Jeg arbejder i Aarhus.",
    });
  });

  it("names the word that was pointed at, not its index", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "recognition",
      instruction: "",
      sentence: "Peter arbejder på et hospital",
      answerIndex: 1,
    };
    const m = buildMistake(ex, "0", "arbejder");
    expect(m?.yours).toBe("Peter");
    expect(m?.correct).toBe("arbejder");
  });

  it("flags a word-order mistake as one, when the words are the same", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "ordering",
      instruction: "",
      scrambled: [],
      answer: ["Om", "aftenen", "går", "jeg"],
    };
    const m = buildMistake(ex, "Om aftenen jeg går", "Om aftenen går jeg");
    expect(m?.hint).toBe("word-order");
  });

  it("does not flag word order when the words themselves are wrong", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "ordering",
      instruction: "",
      scrambled: [],
      answer: ["Jeg", "arbejder"],
    };
    expect(buildMistake(ex, "Jeg spiser", "Jeg arbejder")?.hint).toBeUndefined();
  });

  it("returns nothing for an open answer, rather than inventing a correct one", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "free_production",
      instruction: "",
      prompt: "Skriv om din weekend.",
      checklist: [],
    };
    expect(buildMistake(ex, "Jeg var hjemme.", undefined)).toBeNull();
  });

  it("returns nothing when the learner did not answer", () => {
    const ex: LessonExercise = {
      id: "e",
      kind: "selection",
      instruction: "",
      sentence: "Jeg ___ i Aarhus.",
      options: ["arbejder"],
      answer: "arbejder",
    };
    expect(buildMistake(ex, "", "arbejder")).toBeNull();
    expect(buildMistake(ex, "   ", "arbejder")).toBeNull();
  });
});

describe("sameWords", () => {
  it("is true for the same words in a different order", () => {
    expect(sameWords("jeg går nu", "nu går jeg")).toBe(true);
  });

  it("ignores punctuation and case", () => {
    expect(sameWords("Jeg går nu.", "nu går jeg")).toBe(true);
  });

  it("is false when the answer is identical", () => {
    expect(sameWords("jeg går nu", "jeg går nu")).toBe(false);
  });

  it("is false when a word differs", () => {
    expect(sameWords("jeg går nu", "jeg kommer nu")).toBe(false);
  });
});
