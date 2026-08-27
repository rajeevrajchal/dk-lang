import { describe, expect, it } from "vitest";
import { baselineFeedback, feedbackSummary } from "./feedback";
import { contextFor, questionKeyFor } from "./context";
import { gradeExercise } from "./grading";
import { READING_TASK1_VARIANTS } from "./reading-task1";
import { READING_TASK3_VARIANTS } from "./reading-task3";
import { ALL_VARIANTS } from "./registry";

// The rule these tests protect: everything the learner reads after answering
// is in English, and every wrong answer is explained rather than merely
// marked.

const variant = READING_TASK1_VARIANTS[0];

describe("baseline feedback", () => {
  it("covers every graded answer", () => {
    const result = gradeExercise(variant, {});
    const feedback = baselineFeedback(result, variant);
    expect(feedback).toHaveLength(result.answers.length);
    expect(feedback.map((f) => f.key)).toEqual(result.answers.map((a) => a.key));
  });

  it("explains a wrong answer three ways", () => {
    const result = gradeExercise(variant, { "1": "Z" });
    const wrong = baselineFeedback(result, variant).find((f) => !f.isCorrect)!;
    expect(wrong.whyYoursWrong).toBeTruthy();
    expect(wrong.whyCorrect).toBeTruthy();
    expect(wrong.rule).toBeTruthy();
  });

  it("says so plainly when the question was left blank", () => {
    const result = gradeExercise(variant, {});
    const blank = baselineFeedback(result, variant)[0];
    expect(blank.whyYoursWrong).toContain("blank");
  });

  it("tags every answer with a topic the insights can group by", () => {
    const result = gradeExercise(variant, {});
    for (const f of baselineFeedback(result, variant)) {
      expect(f.grammarTopic).toBeTruthy();
    }
  });

  it("summarises into one line for the history", () => {
    const result = gradeExercise(variant, { "1": "Z" });
    const wrong = baselineFeedback(result, variant).find((f) => !f.isCorrect)!;
    expect(feedbackSummary(wrong).length).toBeGreaterThan(20);
  });
});

describe("authored explanations are in English", () => {
  // A handful of words that are Danish and cannot be English, checked against
  // every authored rationale. This catches a rationale written in Danish being
  // added back, which is what the whole feedback layer exists to prevent.
  const DANISH_ONLY = [
    " ikke ",
    " fordi ",
    " afsnittet ",
    " sætning",
    " hun skriver",
    " der står",
    " personen ",
  ];

  it("has no Danish left in any rationale or why field", () => {
    const offenders: string[] = [];

    for (const v of ALL_VARIANTS) {
      const c = v.content;
      const texts: string[] = [];
      if (c.kind === "reading_task_1_matching") texts.push(...Object.values(c.rationales));
      if (c.kind === "reading_task_2_wrong_sentence") {
        texts.push(c.example.why, ...c.sections.map((s) => s.why));
      }
      if (c.kind === "reading_task_3_missing_words") texts.push(...c.rationales);
      if (c.kind === "reading_task_4_people_matching") {
        texts.push(...c.questions.map((q) => q.why));
      }

      for (const text of texts) {
        const lower = ` ${text.toLowerCase()} `;
        if (DANISH_ONLY.some((w) => lower.includes(w))) {
          offenders.push(`${v.variantId}: ${text.slice(0, 60)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe("answer context", () => {
  it("gives a reading answer its paragraph back", () => {
    const result = gradeExercise(variant, {});
    const ctx = contextFor(variant, result.answers[0]);
    expect(ctx.questionText).toBeTruthy();
    expect(ctx.danishText).toBeTruthy();
    expect(ctx.passageText).toBeTruthy();
  });

  it("rebuilds the full text for a gap-fill, gaps filled in", () => {
    const gapVariant = READING_TASK3_VARIANTS[0];
    const result = gradeExercise(gapVariant, {});
    const ctx = contextFor(gapVariant, result.answers[0]);
    // The gap the question is about is still shown as a gap...
    expect(ctx.danishText).toContain("______");
    // ...but the passage behind it is the completed text.
    expect(ctx.passageText).not.toContain("______");
    if (gapVariant.content.kind === "reading_task_3_missing_words") {
      expect(ctx.passageText).toContain(gapVariant.content.answers[0]);
    }
  });

  it("keys a question so two sittings of it aggregate", () => {
    expect(questionKeyFor(variant, "1")).toBe(`exercise:${variant.variantId}:1`);
  });
});
