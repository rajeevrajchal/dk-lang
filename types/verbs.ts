// The 500 most common Danish verbs.
//
// Content, not learner data — so it lives in code (lib/verbs/data.ts) the same
// way the reading library and the curriculum do, and the database holds only
// what this learner has done with it (VerbProgress).

import type { VERB_GROUPS, VERB_PRACTICE_MODES, VERB_THEMES } from "@/lib/verbs/constants";

/**
 * Danish conjugation class. This is the single most useful thing to know about
 * a Danish verb: get the group right and every tense follows, which is why it
 * is a field rather than a note.
 *
 *   1  -ede / -et   at arbejde  → arbejdede, arbejdet   (the big regular class)
 *   2  -te / -t     at købe     → købte, købt           (the other regular one)
 *   3  strong/irregular — a vowel change, learned one at a time
 */
export type VerbGroup = (typeof VERB_GROUPS)[number];
export type VerbTheme = (typeof VERB_THEMES)[number];
export type VerbPracticeMode = (typeof VERB_PRACTICE_MODES)[number];

export interface DanishVerb {
  /** Infinitive without "at", e.g. "arbejde". The stable id. */
  infinitive: string;
  /** Primary English meaning, bare ("work", not "to work"). */
  english: string;
  present: string; // arbejder
  past: string; // arbejdede
  /** The form used after har/er. */
  perfect: string; // arbejdet
  /**
   * Which auxiliary the perfect takes. "er" for verbs of motion and change of
   * state — "jeg er gået", never "jeg har gået" — which is a mistake Danish
   * learners make constantly and no conjugation table on its own prevents.
   */
  auxiliary: "har" | "er";
  group: VerbGroup;
  /** Imperative, when it is worth knowing separately (kom!, gå!). */
  imperative?: string;
  example: string;
  exampleEnglish: string;
  themes: VerbTheme[];
  /** Frequency rank, 1 = most common. */
  rank: number;
  /** How it is actually used: the preposition it takes, the fixed expression. */
  usage?: string;
}

/** A verb plus this learner's history with it. */
export interface VerbWithProgress {
  verb: DanishVerb;
  learned: boolean;
  correctCount: number;
  wrongCount: number;
  streak: number;
  lastPracticedAt: string | null;
  /** Wrong more often than right, and practised at least twice. */
  struggling: boolean;
}

export interface VerbFilter {
  search?: string | null;
  theme?: VerbTheme | null;
  group?: VerbGroup | null;
  status?: "all" | "learned" | "unlearned" | "struggling";
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export interface VerbQuestion {
  /** Stable across sittings, so history and mistakes aggregate. */
  questionKey: string;
  verbId: string;
  mode: VerbPracticeMode;
  /** What the learner is asked, in English. */
  prompt: string;
  /** The Danish involved — a sentence with a gap, or the word to translate. */
  danish?: string;
  /** Four options for the choice modes; absent for the typed ones. */
  options?: string[];
  /** Checked case-insensitively, ignoring surrounding punctuation. */
  answer: string;
  /** Other spellings accepted as correct (e.g. "at arbejde" for "arbejde"). */
  alsoAccept?: string[];
  /** English explanation shown after answering, right or wrong. */
  explanation: string;
}

export interface VerbAnswerResult {
  questionKey: string;
  verbId: string;
  isCorrect: boolean;
  given: string;
  answer: string;
  explanation: string;
}

export interface VerbStats {
  total: number;
  learned: number;
  practised: number;
  struggling: number;
  dueNow: number;
}
