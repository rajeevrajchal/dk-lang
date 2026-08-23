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

// ---------------------------------------------------------------------------
// Text kinds
// ---------------------------------------------------------------------------

import type {
  Gloss,
  LearningText,
  ReadingLevel,
  ReadingSupport,
  TextSentence,
} from "@/types";

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
// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Normalises a token for glossary lookup: strips surrounding punctuation and
 * lowercases. Same rule TranslatablePassage has always used, so a glossary
 * written for one renderer works in the other.
 */
export const lookupKey = (token: string): string => {
  return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "").toLowerCase();
};

/** Index a glossary by lookup key, first entry winning on duplicates. */
export const glossaryIndex = (glosses: Gloss[]): Map<string, Gloss> => {
  const map = new Map<string, Gloss>();
  for (const g of glosses) {
    const key = lookupKey(g.surface);
    if (!map.has(key)) map.set(key, g);
  }
  return map;
};

/** Every sentence in the text, flattened, in reading order. */
export const allSentences = (text: LearningText): TextSentence[] => {
  return text.paragraphs.flatMap((p) => p.sentences);
};

/** The Danish text as one plain string — for generation, or for copying. */
export const plainText = (text: LearningText): string => {
  return text.paragraphs.map((p) => p.sentences.map((s) => s.danish).join(" ")).join("\n\n");
};

/** Word count, for showing how long a text is before the learner starts. */
export const wordCount = (text: LearningText): number => {
  return plainText(text).split(/\s+/).filter(Boolean).length;
};

// ---------------------------------------------------------------------------
// How much English to show
// ---------------------------------------------------------------------------

export const supportForLevel = (level: ReadingLevel): ReadingSupport => {
  if (level <= 2) return "translation_shown";
  if (level <= 3) return "translation_available";
  return "danish_first";
};
