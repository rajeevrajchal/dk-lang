import { describe, expect, it } from "vitest";
import { practiceHrefFor, summariseMock } from "./mock-summary";

describe("summariseMock", () => {
  const parts = [
    { taskType: "reading_task_1_matching", category: "READING", score: 5, total: 5 },
    { taskType: "reading_task_2_wrong_sentence", category: "READING", score: 2, total: 4 },
    { taskType: "reading_task_3_missing_words", category: "READING", score: 6, total: 8 },
    // Writing is never auto-scored, so it must not appear at all.
    { taskType: "writing_email", category: "WRITING", score: null, total: null },
  ];

  it("splits strong and weak task types", () => {
    const summary = summariseMock(parts);
    expect(summary.strengths.map((e) => e.taskType)).toEqual(["reading_task_1_matching"]);
    expect(summary.needsPractice.map((e) => e.taskType)).toEqual([
      "reading_task_2_wrong_sentence",
    ]);
  });

  it("leaves unscored parts out rather than guessing at them", () => {
    expect(summariseMock(parts).all.some((e) => e.taskType === "writing_email")).toBe(false);
  });

  it("computes overall from the scored answers only", () => {
    // 13 of 17 across the three reading opgaver.
    expect(summariseMock(parts).overall).toBeCloseTo(13 / 17);
  });

  it("returns nothing to report when no part could be scored", () => {
    const summary = summariseMock([
      { taskType: "writing_email", category: "WRITING", score: null, total: null },
    ]);
    expect(summary.all).toEqual([]);
    expect(summary.overall).toBeNull();
  });

  it("links a weak task type to that exact Class practice", () => {
    const [weak] = summariseMock(parts).needsPractice;
    expect(practiceHrefFor(weak, 2)).toBe("/class/reading/2/reading_task_2_wrong_sentence");
  });
});
