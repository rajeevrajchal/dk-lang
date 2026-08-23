// A Danish text the learner can actually work through, rather than a wall of
// string.
//
// The shape here is deliberately the shape the app already uses. Word
// explanations carry exactly the fields `WordGloss`
// (lib/content-gen/modul2-glossary.ts) and `Explanation.words`
// (lib/exercises/explain.ts) already carry; sentences carry the fields
// `SentenceBreakdown` and `Explanation.sentences` already carry. TypeScript is
// structural, so the authored Modul 2 glossaries and the LLM-generated
// explanations both satisfy these types without conversion — which is what
// lets one reading component serve authored lesson texts, authored passages
// and generated opgave breakdowns alike.
//
// The point of the structure is the four levels of understanding the learner
// can ask for: a word, a sentence, a paragraph, or the whole text. A plain
// string can only ever answer the last one.

// ---------------------------------------------------------------------------
// The pieces
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Text kinds
// ---------------------------------------------------------------------------

/**
 * What kind of text this is. A learner needs to read more than prose: the
 * Danish they meet in a week is mostly SMS, adverts, notices and emails, and
 * each has its own conventions.
 */
export const TEXT_GENRES = [
  "story", // a short narrative, written to be enjoyable
  "daily_life", // "my morning", "at the doctor" — routine described plainly
  "email",
  "sms",
  "message", // a note left for someone
  "advertisement",
  "notice", // opslag: something pinned to a board
  "invitation",
  "instructions",
  "article", // the closest to PD3 reading
] as const;
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

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Normalises a token for glossary lookup: strips surrounding punctuation and
 * lowercases. Same rule TranslatablePassage has always used, so a glossary
 * written for one renderer works in the other.
 */
export function lookupKey(token: string): string {
  return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "").toLowerCase();
}

/** Index a glossary by lookup key, first entry winning on duplicates. */
export function glossaryIndex(glosses: Gloss[]): Map<string, Gloss> {
  const map = new Map<string, Gloss>();
  for (const g of glosses) {
    const key = lookupKey(g.surface);
    if (!map.has(key)) map.set(key, g);
  }
  return map;
}

/** Every sentence in the text, flattened, in reading order. */
export function allSentences(text: LearningText): TextSentence[] {
  return text.paragraphs.flatMap((p) => p.sentences);
}

/** The Danish text as one plain string — for generation, or for copying. */
export function plainText(text: LearningText): string {
  return text.paragraphs.map((p) => p.sentences.map((s) => s.danish).join(" ")).join("\n\n");
}

/** Word count, for showing how long a text is before the learner starts. */
export function wordCount(text: LearningText): number {
  return plainText(text).split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// How much English to show
// ---------------------------------------------------------------------------

/**
 * How much support a text shows before the learner asks for more.
 *
 * The course moves from English-led to Danish immersion, and reading has to
 * move with it — a Chapter 2 learner needs the translation in front of them,
 * a Chapter 14 learner should be made to try first. This mirrors
 * SupportLanguage rather than inventing a second scale.
 */
export type ReadingSupport = "translation_shown" | "translation_available" | "danish_first";

export function supportForLevel(level: ReadingLevel): ReadingSupport {
  if (level <= 2) return "translation_shown";
  if (level <= 3) return "translation_available";
  return "danish_first";
}
