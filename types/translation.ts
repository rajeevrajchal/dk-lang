// Translation — the learner asking what a piece of Danish means.
//
// Deliberately NOT the same thing as `ReadingExplanation`. An explanation
// answers "why is it written like this?" and is a paragraph of teaching; a
// translation answers "what does this say?" and has to be instant, because a
// learner reading a text clicks a lot of words. The two share a cache
// philosophy (a fact about the Danish, not about the learner) and nothing else.

import type { TRANSLATION_KINDS } from "@/lib/translation/constants";

export type TranslationKind = (typeof TRANSLATION_KINDS)[number];

/** One word inside a sentence translation, so the two can be lined up. */
export interface TranslatedWord {
  danish: string;
  english: string;
}

export interface Translation {
  kind: TranslationKind;
  /** The Danish that was translated, as it was asked about. */
  danish: string;
  /** Natural English. Never word-for-word — that is what `literal` is for. */
  english: string;
  /**
   * Word-for-word rendering, present only when the difference teaches
   * something: "I stand up clock seven" next to "I get up at seven" shows how
   * the Danish is built.
   */
  literal?: string;
  /** Dictionary form, for a word. */
  baseForm?: string;
  partOfSpeech?: string;
  /**
   * The learning bit: one line on how this form arises, or on the expression
   * it belongs to. This is what makes the feature useful for learning rather
   * than a dictionary lookup.
   */
  note?: string;
  /** For a sentence: the words in order, so the mapping is visible. */
  words?: TranslatedWord[];
  /** Which tier answered — authored data, the shared cache, or the model. */
  source: "authored" | "cache" | "generated";
}

export interface TranslationRequestItem {
  danish: string;
  kind: TranslationKind;
  /** The sentence a clicked word sits in, so the answer is the sense used HERE. */
  context?: string;
}

export interface TranslationOutcome {
  translation: Translation | null;
  reason?: string;
}

/** Identifies a cached translation row. */
export interface TranslationKey {
  kind: TranslationKind;
  level: number;
  danish: string;
}
