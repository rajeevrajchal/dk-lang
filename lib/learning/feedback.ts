import type { LessonExercise, Mistake } from "@/types";

// Turning a wrong answer into a correction the learner can learn from.
//
// The grader already knows what was expected (gradeLessonExercise returns
// `expected` and the exercise's own `explanation`), but "✗ Not quite" throws
// that away. A teacher does not say "wrong" and move on — they show you what
// you wrote next to what it should have been, so the difference is visible.
//
// Pure and exercise-shaped rather than string-shaped, because the contrast is
// different for each rung of the ladder: a selection mistake is one word in a
// sentence, an ordering mistake is a whole word order, a recognition mistake
// is pointing at the wrong word.

/** Fills the ___ in a gapped sentence, or appends when there is no gap. */
const fillGap = (sentence: string, word: string): string => {
  return sentence.includes("___") ? sentence.replace("___", word) : `${sentence} ${word}`.trim();
};

/**
 * Builds the ❌ / ✅ contrast for one wrong answer, or null when there is
 * nothing useful to contrast — an unanswered exercise, or a rung with no
 * single right answer.
 */
export const buildMistake = (
  exercise: LessonExercise,
  response: string | undefined,
  expected: string | undefined
): Mistake | null => {
  const given = (response ?? "").trim();
  if (!given || !expected) return null;

  switch (exercise.kind) {
    case "recognition": {
      const words = exercise.sentence.split(/\s+/);
      const chosen = words[Number(given)];
      if (!chosen) return null;
      return { yours: chosen, correct: expected, hint: exercise.sentence };
    }

    case "selection":
      return {
        yours: fillGap(exercise.sentence, given),
        correct: fillGap(exercise.sentence, expected),
      };

    case "ordering":
      return {
        yours: given,
        correct: expected,
        // Same words, different order — worth saying, because the learner can
        // otherwise stare at two identical-looking lines.
        hint: sameWords(given, expected) ? "word-order" : undefined,
      };

    case "controlled_production":
      return { yours: given, correct: expected };

    case "matching":
      return { yours: given.split("|").join(", "), correct: expected };

    default:
      // Free production and communication have no single right answer, so
      // there is nothing honest to put in the ✅ line.
      return null;
  }
};

/** Whether two answers use the same words and differ only in order. */
export const sameWords = (a: string, b: string): boolean => {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:]/g, "")
      .split(/[\s|]+/)
      .filter(Boolean)
      .sort()
      .join(" ");
  return norm(a) === norm(b) && a.trim().toLowerCase() !== b.trim().toLowerCase();
};
