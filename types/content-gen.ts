// Shared types for the offline/batch content generator. Nothing in this
// directory runs at request time — items are generated ahead of time (by
// hand today, optionally LLM-assisted later, see docs/content-validation.md)
// and loaded into the DB by prisma/seed.ts. A practice request never
// triggers a live generation call.

import type { ItemTypeCode, Topic } from "./enums";
import type { LessonExercise, LessonKind, WritingModel } from "./course";
import type { Gloss, LearningText } from "./learning";

export type TierNumber = 1 | 2 | 3 | 4;

/** The four PD3 subject areas. Same set as `Topic`, under the seeder's name. */
export type TopicCode = Topic;

export interface ConstructDef {
  code: string; // e.g. "subordinate-clause:fordi"
  name: string;
  description: string;
  tier: TierNumber;
}

export interface GeneratedReadingItem {
  tier: TierNumber;
  topic: TopicCode;
  constructs: string[]; // construct codes, must exist in constructs.ts
  type: ItemTypeCode;
  // Stable key shared by every item built on the same passage — survives
  // reseeds, unlike the DB row's generated id. Used to look up the
  // word/paragraph translation glossary (see modul2-glossary.ts).
  passageId?: string;
  passageText: string;
  promptText: string;
  // MULTIPLE_CHOICE: full option list, answer = exact matching string.
  // TRUE_FALSE: options = ["Sandt", "Falsk"], answer = one of them.
  // GAP_FILL: options = optional word bank, answer = accepted word(s).
  // MATCHING: options = { left: string[]; right: string[] }, answer =
  //   array of "leftIndex:rightIndex" pairs.
  options?: string[] | { left: string[]; right: string[] };
  answer: string[];
  explanation: string;
}

// ---------------------------------------------------------------------------
// Theory lessons
// ---------------------------------------------------------------------------

export interface TheoryExample {
  danish: string;
  english: string;
  note?: string; // why this example is here / what to notice
}

export interface TheoryTable {
  headers: string[];
  rows: string[][];
}

export interface TheorySection {
  heading: string;
  body: string;
  examples?: TheoryExample[];
  table?: TheoryTable;
}

export interface TheoryLesson {
  slug: string;
  title: string; // English title
  danishName: string; // the Danish grammar term
  tier: number;
  constructCodes: string[]; // codes from CONSTRUCTS this lesson explains
  summary: string;
  sections: TheorySection[];
  pitfalls: string[]; // common mistakes, stated as the mistake + the fix

  // ---------------------------------------------------------------------
  // Course fields.
  //
  // All optional. The twelve lessons below were written before the course
  // existed and set none of them; they keep working untouched, both at their
  // own /theory/[slug] route and inside a chapter. A lesson gains objectives
  // and exercises by having them added here, not by being rewritten.
  // ---------------------------------------------------------------------

  /** "After this lesson you can ..." — stated before the teaching starts. */
  learningObjectives?: string[];
  /** The one-line takeaway, shown at the end as "what you should know". */
  canDo?: string;
  /**
   * A short plain-language opening for a reader who does not yet know the
   * grammar words. Rendered before `summary` when present.
   */
  primer?: string;
  /** Practice attached to the lesson, in ladder order. */
  exercises?: LessonExercise[];

  // ---------------------------------------------------------------------
  // Lesson kind and its content.
  //
  // Also all optional, for the same reason: a lesson without `kind` is a
  // grammar lesson, which is what all sixteen written before this were. A
  // grammar lesson that gains a `text` starts showing it; one that does not
  // renders exactly as it did.
  // ---------------------------------------------------------------------

  /** Defaults to "grammar" when absent — see LESSON_KINDS. */
  kind?: LessonKind;
  /**
   * Danish to read, structured for word/sentence/paragraph study. A grammar
   * lesson uses this to show the rule working in a real text; a reading lesson
   * IS this.
   */
  texts?: LearningText[];
  /** For writing lessons: the worked example, taken apart. */
  writingModel?: WritingModel;
  /**
   * Which PD3 modules this lesson prepares for. Readiness metadata, not
   * hierarchy — the course is ordered by grammar, not by module.
   */
  pd3Modules?: number[];
}

// ---------------------------------------------------------------------------
// Seeded passage annotations
// ---------------------------------------------------------------------------

export interface SentenceBreakdown {
  danish: string;
  english: string;
  structureNote: string;
  constructCodes: string[]; // codes from constructs.ts demonstrated here
}

export interface PassageSentences {
  passageId: string;
  sentences: SentenceBreakdown[];
}

/** One word of a seeded passage, explained. Same shape as a reader `Gloss`. */
export type WordGloss = Gloss;

export interface PassageGlossary {
  passageId: string;
  englishSummary: string;
  words: WordGloss[];
}
