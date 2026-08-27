import { describe, expect, it } from "vitest";
import { VERBS, VERB_BY_ID, conjugationLine, filterVerbs, isStruggling } from "./index";
import { buildQuestion, buildRound, isAnswerCorrect, questionFromKey, selectVerbsForRound } from "./practice";
import type { VerbWithProgress } from "@/types";

// These are invariants over the collection, not spot checks of individual
// verbs. A conjugation typo is a content bug and needs a human; a verb with no
// example sentence, a duplicate entry or a question that cannot be answered is
// a structural bug and a test catches it every time.

describe("the verb collection", () => {
  it("has 500 verbs", () => {
    expect(VERBS).toHaveLength(500);
  });

  it("has no duplicate infinitives", () => {
    const seen = new Set(VERBS.map((v) => v.infinitive));
    expect(seen.size).toBe(VERBS.length);
  });

  it("gives every verb four forms, an example and a translation", () => {
    for (const v of VERBS) {
      expect(v.infinitive, v.infinitive).not.toBe("");
      expect(v.present, v.infinitive).not.toBe("");
      expect(v.past, v.infinitive).not.toBe("");
      expect(v.perfect, v.infinitive).not.toBe("");
      expect(v.english, v.infinitive).not.toBe("");
      expect(v.example.length, v.infinitive).toBeGreaterThan(5);
      expect(v.exampleEnglish.length, v.infinitive).toBeGreaterThan(5);
      expect(v.themes.length, v.infinitive).toBeGreaterThan(0);
    }
  });

  it("keeps the group and the past-tense ending consistent", () => {
    for (const v of VERBS) {
      if (v.group === 1) expect(v.past.endsWith("ede"), `${v.infinitive}: ${v.past}`).toBe(true);
      if (v.group === 2) expect(v.past.endsWith("te"), `${v.infinitive}: ${v.past}`).toBe(true);
    }
  });

  it("ranks verbs uniquely from 1", () => {
    const ranks = VERBS.map((v) => v.rank);
    expect(Math.min(...ranks)).toBe(1);
    expect(new Set(ranks).size).toBe(VERBS.length);
  });

  it("writes the conjugation with its auxiliary", () => {
    expect(conjugationLine(VERB_BY_ID.get("arbejde")!)).toContain("har arbejdet");
    expect(conjugationLine(VERB_BY_ID.get("komme")!)).toContain("er kommet");
  });
});

const row = (id: string, over: Partial<VerbWithProgress> = {}): VerbWithProgress => ({
  verb: VERB_BY_ID.get(id)!,
  learned: false,
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  lastPracticedAt: null,
  struggling: false,
  ...over,
});

describe("choosing what to practise", () => {
  it("puts struggling verbs first", () => {
    const progress = [
      row("vælge", { struggling: true, wrongCount: 3, correctCount: 1, lastPracticedAt: "2026-01-01T00:00:00.000Z" }),
      row("arbejde", { correctCount: 5, lastPracticedAt: "2026-01-01T00:00:00.000Z" }),
    ];
    const picked = selectVerbsForRound(progress, 5, new Date("2026-02-01"), 42);
    expect(picked.map((v) => v.infinitive)).toContain("vælge");
  });

  it("falls back to the most common verbs for a learner with no history", () => {
    const picked = selectVerbsForRound([], 3, new Date(), 7);
    expect(picked).toHaveLength(3);
    expect(picked[0].rank).toBeLessThanOrEqual(3);
  });

  it("never repeats a verb inside one round", () => {
    const picked = selectVerbsForRound([], 10, new Date(), 3);
    expect(new Set(picked.map((v) => v.infinitive)).size).toBe(10);
  });
});

describe("questions", () => {
  const next = () => 0.5;

  it("builds an answerable question for every verb in every mode", () => {
    for (const v of VERBS) {
      for (const mode of ["DA_EN", "EN_DA", "FILL_BLANK", "CHOOSE_VERB", "CONJUGATE"] as const) {
        const q = buildQuestion(v, mode, next);
        expect(q.answer, `${v.infinitive}/${mode}`).not.toBe("");
        expect(q.explanation, `${v.infinitive}/${mode}`).not.toBe("");
        // A multiple-choice question whose options do not include the answer
        // is unanswerable, which is the failure this catches.
        if (q.options) expect(q.options, `${v.infinitive}/${mode}`).toContain(q.answer);
        expect(isAnswerCorrect(q, q.answer)).toBe(true);
      }
    }
  });

  it("marks leniently on case and punctuation, strictly on spelling", () => {
    const q = buildQuestion(VERB_BY_ID.get("arbejde")!, "EN_DA", next);
    expect(isAnswerCorrect(q, "  Arbejde. ")).toBe(true);
    expect(isAnswerCorrect(q, "at arbejde")).toBe(true);
    expect(isAnswerCorrect(q, "arbejd")).toBe(false);
    expect(isAnswerCorrect(q, "")).toBe(false);
  });

  it("rebuilds the same question from its key", () => {
    for (const mode of ["DA_EN", "EN_DA", "FILL_BLANK", "CHOOSE_VERB", "CONJUGATE"] as const) {
      const original = buildQuestion(VERB_BY_ID.get("vælge")!, mode, next);
      const rebuilt = questionFromKey(original.questionKey);
      expect(rebuilt?.answer, mode).toBe(original.answer);
      expect(rebuilt?.questionKey, mode).toBe(original.questionKey);
    }
  });

  it("mixes the modes across a round", () => {
    const round = buildRound(selectVerbsForRound([], 10, new Date(), 1), undefined, 1);
    expect(new Set(round.map((q) => q.mode)).size).toBeGreaterThan(1);
  });
});

describe("filtering", () => {
  it("finds verbs by Danish, English or example", () => {
    const rows = VERBS.map((v) => row(v.infinitive));
    expect(filterVerbs(rows, { search: "arbejd" }).length).toBeGreaterThan(0);
    expect(filterVerbs(rows, { search: "work" }).length).toBeGreaterThan(0);
    expect(filterVerbs(rows, { search: "zzzz" })).toHaveLength(0);
  });

  it("only calls a verb struggling once there is evidence", () => {
    expect(isStruggling(0, 1)).toBe(false);
    expect(isStruggling(1, 3)).toBe(true);
    expect(isStruggling(3, 1)).toBe(false);
  });
});
