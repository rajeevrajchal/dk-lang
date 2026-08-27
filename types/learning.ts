// Reading material, structured for study rather than for display.
//
// A LearningText is a Danish text taken apart far enough that a learner can
// work at whichever level they need — the whole text, a paragraph, a sentence,
// or a single word — without leaving the page.

import type { TEXT_GENRES } from "@/lib/learning/text";

/**
 * One word, explained in the context it appears in.
 *
 * `englishGloss` is what the word means HERE, not a dictionary dump of every
 * sense. A learner reading "Jeg står op klokken syv" needs "get up", not a
 * list containing "stand", "endure" and "be located".
 */
export interface Gloss {
  /** Exact form as it appears in the text; matched case-insensitively. */
  surface: string;
  /** Dictionary form. */
  lemma: string;
  /** What it means in this sentence. */
  englishGloss: string;
  partOfSpeech: string;
  /** How this form arises and what it does with the words around it. */
  inflectionNote: string;
}

/**
 * One sentence: what it says, and how it is built.
 *
 * `english` is the natural meaning, never a word-for-word rendering — "I get
 * up at seven", not "I stand up clock seven". The word-by-word view is what
 * `Gloss` is for, and it is a separate question from what the sentence means.
 */
export interface TextSentence {
  danish: string;
  english: string;
  /** Why the words sit where they do. Omitted for sentences with nothing to say. */
  structureNote?: string;
  /** Construct codes demonstrated here, for linking back to the grammar lesson. */
  constructCodes?: string[];
}

export interface TextParagraph {
  /** Natural meaning of the paragraph as a whole. */
  translation: string;
  sentences: TextSentence[];
}

export type TextGenre = (typeof TEXT_GENRES)[number];

/**
 * Reading difficulty, on the same "complexity, not vocabulary" principle as
 * CourseStage:
 *
 *   1  a handful of short main clauses
 *   2  connected sentences, og/men, one idea per sentence
 *   3  several paragraphs, past tense, subordinate clauses appear
 *   4  natural everyday Danish, opinions and reasons
 *   5  PD3 territory: abstract topics, argument, longer periods
 */
export type ReadingLevel = 1 | 2 | 3 | 4 | 5;

export interface LearningText {
  id: string;
  /** English title, for the learner to know what they are about to read. */
  title: string;
  /** The Danish heading as it appears above the text. */
  danishTitle: string;
  genre: TextGenre;
  level: ReadingLevel;
  /** What the whole text says, in plain English. The "full translation". */
  summary: string;
  paragraphs: TextParagraph[];
  /** Word explanations. Absent means the text falls back to generation. */
  glossary?: Gloss[];
  /**
   * Grammar this text deliberately exercises. This is what connects reading
   * back to the chapter that taught it — a present-tense chapter's text is
   * full of present-tense verbs on purpose (see docs/class-curriculum.md).
   */
  focusConstructs?: string[];
  /** Vocabulary worth taking away, beyond the per-word glosses. */
  keyVocabulary?: { danish: string; english: string }[];
}

/**
 * How much support a text shows before the learner asks for more.
 *
 * The course moves from English-led to Danish immersion, and reading has to
 * move with it — a Chapter 2 learner needs the translation in front of them,
 * a Chapter 14 learner should be made to try first. This mirrors
 * SupportLanguage rather than inventing a second scale.
 */
export type ReadingSupport = "translation_shown" | "translation_available" | "danish_first";

export interface Mistake {
  /** The learner's answer, rendered the way they would recognise it. */
  yours: string;
  /** The same thing, correct. */
  correct: string;
  /** What kind of difference this is, when it can be named cheaply. */
  hint?: string;
}
