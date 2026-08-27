import type { AnswerContext, ExerciseVariant, GradedAnswer } from "@/types";

// The context a single answer belongs to.
//
// grading.ts knows whether an answer was right. It does not know which
// paragraph the question was about, and it should not: the results screen does
// not need that, and the history does. So the mapping from an answer key back
// to its Danish lives here, next to the variants it reads, and both the
// history writer and the mistake review use it.
//
// This is what preserves Test → Paragraph → Question. Without it a reading
// mistake is a question with no text, which is unreviewable — the learner
// cannot see what they misread.

/**
 * Stable identity of a question across sittings.
 *
 * Authored variants have a stable `variantId`, so the same question met twice
 * shares a key and the app can say "you have answered this correctly since".
 * Generated variants get a fresh id per generation, so their questions are
 * unique by construction — correct, because a generated opgave is never served
 * twice and claiming otherwise would be a lie about the learner's progress.
 */
export const questionKeyFor = (variant: ExerciseVariant, answerKey: string): string => {
  return `exercise:${variant.variantId}:${answerKey}`;
};

const trim = (s: string, n: number): string => {
  return s.length <= n ? s : `${s.slice(0, n).trimEnd()}…`;
};

export const contextFor = (
  variant: ExerciseVariant,
  answer: GradedAnswer
): AnswerContext => {
  const c = variant.content;

  switch (c.kind) {
    case "reading_task_1_matching": {
      const person = c.people.find((p) => p.id === answer.key);
      return {
        questionText: `Which advert fits person ${answer.key}?`,
        danishText: person?.text ?? null,
        // The adverts are the shared text every question in this opgave is
        // answered against, so they are the "paragraph" here.
        passageLabel: "Annoncerne",
        passageText: c.ads.map((a) => `${a.id}. ${a.title} — ${a.body}`).join("\n"),
      };
    }

    case "reading_task_2_wrong_sentence": {
      const section = c.sections.find((s) => s.id === answer.key);
      return {
        questionText: `Which sentence does not belong in section ${answer.key}?`,
        danishText: section?.sentences.join(" ") ?? null,
        passageLabel: `${c.textTitle} — afsnit ${answer.key}`,
        passageText: section?.sentences.join(" ") ?? null,
      };
    }

    case "reading_task_3_missing_words": {
      const i = Number(answer.key);
      const before = c.textSegments[i] ?? "";
      const after = c.textSegments[i + 1] ?? "";
      // Just enough either side to make the gap readable on its own.
      const around = `…${before.slice(-90)}______${after.slice(0, 90)}…`;
      let full = "";
      c.textSegments.forEach((seg, n) => {
        full += seg;
        if (n < c.answers.length) full += c.answers[n];
      });
      return {
        questionText: `Which word goes in gap ${i + 1}?`,
        danishText: around.replace(/\s+/g, " ").trim(),
        passageLabel: c.textTitle,
        passageText: full.trim(),
      };
    }

    case "reading_task_4_people_matching": {
      const q = c.questions.find((x) => x.id === answer.key);
      const person = c.people.find((p) => p.id === q?.personId);
      return {
        questionText: q?.question ?? answer.label,
        danishText: person ? trim(person.text, 400) : null,
        passageLabel: c.heading,
        passageText: c.people.map((p) => `${p.id}. ${p.name}: ${p.text}`).join("\n"),
      };
    }

    default:
      // Writing and speaking are not auto-scored, so they produce no graded
      // answers and never reach here.
      return {
        questionText: answer.label,
        danishText: null,
        passageLabel: null,
        passageText: null,
      };
  }
};
