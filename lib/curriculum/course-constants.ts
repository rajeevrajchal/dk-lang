// The value side of the course curriculum: the progression stages, the
// exercise ladder and the orderings built on them.
//
// The unions derived from these arrays live in @/types/course, which imports
// them with `import type` so nothing here is pulled in at runtime by code that
// only needs the type. See the header of @/types for the rule.

import type { CourseStage, ExerciseKind } from "@/types";

// Difficulty is not "easy/medium/hard". It is what the learner is being asked
// to handle: single words, then sentences, then questions, then negation, and
// so on. A chapter declares the stage it lives at, which is what decides how
// much Danish the explanations use and how demanding the exercises get.
export const COURSE_STAGES = [
  "words", // single words in isolation
  "sentences", // simple statements
  "questions", // asking things
  "negation", // saying what is not
  "tenses", // past, future, modals
  "complex", // subordinate clauses, connectors
  "communication", // explain, compare, justify — PD3 territory
] as const;

export const STAGE_ORDER: Record<CourseStage, number> = {
  words: 1,
  sentences: 2,
  questions: 3,
  negation: 4,
  tenses: 5,
  complex: 6,
  communication: 7,
};

export const SUPPORT_LANGUAGE = ["english_led", "bilingual", "danish_led"] as const;

// The same seven rungs are reused by every lesson, which is what stops each
// chapter inventing its own exercise style. Early lessons stay near the top of
// the ladder; later ones push towards producing language rather than
// recognising it.
export const EXERCISE_KINDS = [
  "recognition", // point at the thing ("which word is the verb?")
  "selection", // choose the right form
  "matching", // pair things up
  "ordering", // build the sentence from scrambled words
  "controlled_production", // produce a specific answer
  "free_production", // write your own, no single right answer
  "communication", // say something about your own life
] as const;

export const EXERCISE_LADDER: Record<ExerciseKind, number> = {
  recognition: 1,
  selection: 2,
  matching: 3,
  ordering: 4,
  controlled_production: 5,
  free_production: 6,
  communication: 7,
};

/** Auto-checkable kinds. The rest are self-assessed — see gradeLessonExercise. */
export const isAutoCheckable = (kind: ExerciseKind): boolean => {
  return EXERCISE_LADDER[kind] <= EXERCISE_LADDER.controlled_production;
};

// Everything written before the lesson kinds existed is a grammar lesson, so
// that is the default and nothing has to be relabelled. The kind decides which
// sections a lesson renders — a reading lesson leads with its text, a writing
// lesson leads with a worked example and its structure — not what a lesson is
// allowed to contain. A grammar lesson can still carry a text, and usually
// should.
export const LESSON_KINDS = [
  "grammar", // a rule, explained and practised
  "reading", // a text, understood
  "writing", // a text type, taken apart and then produced
  "vocabulary", // words grouped by situation
  "review", // old grammar met again in new company
] as const;
