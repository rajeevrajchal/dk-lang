import type { LessonExercise } from "@/lib/curriculum/course-types";
import { plainText, wordCount, type LearningText, type ReadingLevel } from "@/lib/learning/text";

// The reading library: Danish texts to read for their own sake.
//
// This is a third thing, next to the two that already exist. The grammar
// course teaches a rule and shows a text demonstrating it; Class practice
// rehearses modultest opgaver against the clock. Neither is extensive reading
// — reading a lot of Danish you can nearly understand, looking up what you
// cannot, and getting better at it. That is what this is for, and it is why
// the library is browsable by interest and length rather than by module.
//
// Every entry wraps a `LearningText`, the model the app already uses for
// structured Danish (lib/learning/text.ts). That is deliberate: it means the
// texts written for the course lessons ARE library entries, the word/sentence/
// paragraph interaction already works on them, and nothing here needs a second
// content format.

// ---------------------------------------------------------------------------
// What a text is about
//
// These double as the learner's interests. Keeping one list for both means a
// learner who ticks "travel" is choosing from the same vocabulary the texts
// are tagged with, so recommendations cannot silently miss.
// ---------------------------------------------------------------------------

export const READING_TOPICS = [
  "daily_life",
  "work",
  "education",
  "family",
  "food",
  "travel",
  "housing",
  "health",
  "nature",
  "sport",
  "technology",
  "culture",
  "society",
  "history",
  "film",
] as const;
export type ReadingTopic = (typeof READING_TOPICS)[number];

/**
 * A rough CEFR band, shown because it is the vocabulary learners already have
 * from their sprogskole. It is a label on top of `level`, not a second scale.
 */
export const CEFR_FOR_LEVEL: Record<ReadingLevel, string> = {
  1: "A1",
  2: "A1–A2",
  3: "A2",
  4: "A2–B1",
  5: "B1–B2",
};

// ---------------------------------------------------------------------------
// Phrases
//
// Natural Danish is learned in chunks as much as in words: 'tage bussen',
// 'stå op', 'glæde sig til'. A learner who saves only single words ends up
// able to translate every word of a sentence they still cannot produce.
// ---------------------------------------------------------------------------

export interface Phrase {
  /** The expression as it appears, e.g. "tager bussen". */
  danish: string;
  /** Its dictionary shape, e.g. "tage bussen". */
  lemma: string;
  english: string;
  /** Why it is worth learning whole rather than word by word. */
  note?: string;
}

// ---------------------------------------------------------------------------
// A library entry
// ---------------------------------------------------------------------------

export interface ReadingText {
  /** Stable id, used in URLs and in saved progress. */
  id: string;
  title: string;
  danishTitle: string;
  /** One line, in English: what this is about and why you might read it. */
  blurb: string;
  level: ReadingLevel;
  topics: ReadingTopic[];
  /** PD3 modules this is roughly appropriate for. Optional on purpose. */
  targetModules?: number[];
  /** The Danish, structured for word/sentence/paragraph work. */
  text: LearningText;
  /** Multi-word expressions worth saving whole. */
  phrases?: Phrase[];
  /**
   * Optional comprehension work, using the course's exercise ladder. Not every
   * text has any — a library where every text ends in five questions is a
   * test bank, not a library.
   */
  comprehension?: LessonExercise[];
  /**
   * Set when this text is also a lesson in the grammar course, so the reader
   * can offer "this is taught in Chapter 9" instead of duplicating it.
   */
  courseLessonSlug?: string;
}

// ---------------------------------------------------------------------------
// Derived metadata
// ---------------------------------------------------------------------------

/**
 * How long this will actually take THIS learner — not how long a Dane would
 * need.
 *
 * A native reads 200+ words a minute. Somebody reading their fourth language
 * and stopping to click words does nothing like that, and a library that
 * promises "1 min" for every text is telling them nothing. The rates below are
 * deliberately slow and get faster as the level rises, because by level 5 the
 * learner is no longer stopping at every other word.
 */
const WORDS_PER_MINUTE: Record<ReadingLevel, number> = {
  1: 30,
  2: 40,
  3: 55,
  4: 70,
  5: 85,
};

export function estimatedMinutes(entry: ReadingText): number {
  return Math.max(1, Math.round(wordCount(entry.text) / WORDS_PER_MINUTE[entry.level]));
}

export function textLength(entry: ReadingText): "short" | "medium" | "long" {
  const words = wordCount(entry.text);
  if (words < 90) return "short";
  if (words < 220) return "medium";
  return "long";
}

/** Everything the library list needs, without shipping the whole text. */
export interface ReadingSummary {
  id: string;
  title: string;
  danishTitle: string;
  blurb: string;
  level: ReadingLevel;
  cefr: string;
  genre: string;
  topics: ReadingTopic[];
  targetModules: number[];
  minutes: number;
  words: number;
  length: "short" | "medium" | "long";
  courseLessonSlug?: string;
}

export function toSummary(entry: ReadingText): ReadingSummary {
  return {
    id: entry.id,
    title: entry.title,
    danishTitle: entry.danishTitle,
    blurb: entry.blurb,
    level: entry.level,
    cefr: CEFR_FOR_LEVEL[entry.level],
    genre: entry.text.genre,
    topics: entry.topics,
    targetModules: entry.targetModules ?? [],
    minutes: estimatedMinutes(entry),
    words: wordCount(entry.text),
    length: textLength(entry),
    courseLessonSlug: entry.courseLessonSlug,
  };
}

// ---------------------------------------------------------------------------
// Filtering and recommending
// ---------------------------------------------------------------------------

export interface LibraryFilter {
  level?: ReadingLevel | null;
  genre?: string | null;
  topic?: ReadingTopic | null;
  length?: "short" | "medium" | "long" | null;
  targetModule?: number | null;
  /** Text ids the learner has finished / saved, supplied by the caller. */
  completedIds?: Set<string>;
  savedIds?: Set<string>;
  status?: "completed" | "unread" | "saved" | null;
  search?: string | null;
}

export function filterLibrary(
  entries: ReadingText[],
  filter: LibraryFilter
): ReadingText[] {
  const q = filter.search?.trim().toLowerCase();

  return entries.filter((e) => {
    if (filter.level && e.level !== filter.level) return false;
    if (filter.genre && e.text.genre !== filter.genre) return false;
    if (filter.topic && !e.topics.includes(filter.topic)) return false;
    if (filter.length && textLength(e) !== filter.length) return false;
    if (filter.targetModule && !(e.targetModules ?? []).includes(filter.targetModule)) {
      return false;
    }
    if (filter.status === "completed" && !filter.completedIds?.has(e.id)) return false;
    if (filter.status === "unread" && filter.completedIds?.has(e.id)) return false;
    if (filter.status === "saved" && !filter.savedIds?.has(e.id)) return false;
    if (q) {
      const haystack = `${e.title} ${e.danishTitle} ${e.blurb} ${plainText(e.text)}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Texts to put in front of this learner.
 *
 * Scored, not filtered — a recommendation that hides everything else would
 * make the library smaller rather than more useful, and the learner can always
 * browse the whole thing. Interest match counts most, then being at or just
 * below the level they are working at, then not having read it yet.
 */
export function recommend(
  entries: ReadingText[],
  opts: {
    interests: ReadingTopic[];
    /** Where the learner is in the course, 1-5. */
    level?: ReadingLevel | null;
    completedIds?: Set<string>;
    limit?: number;
  }
): ReadingText[] {
  const { interests, level, completedIds, limit = 3 } = opts;

  const scored = entries
    .filter((e) => !completedIds?.has(e.id))
    .map((e) => {
      let score = 0;
      score += e.topics.filter((t) => interests.includes(t)).length * 3;
      if (level) {
        const gap = e.level - level;
        // Right at their level is best; one below is still useful reading;
        // anything harder than one above is discouraging rather than helpful.
        if (gap === 0) score += 4;
        else if (gap === -1) score += 2;
        else if (gap === 1) score += 1;
        else score -= 2;
      }
      return { entry: e, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}

/** Counts per facet, so the filter UI can show what is actually there. */
export function facetCounts(entries: ReadingText[]): {
  levels: Record<number, number>;
  genres: Record<string, number>;
  topics: Record<string, number>;
} {
  const levels: Record<number, number> = {};
  const genres: Record<string, number> = {};
  const topics: Record<string, number> = {};

  for (const e of entries) {
    levels[e.level] = (levels[e.level] ?? 0) + 1;
    genres[e.text.genre] = (genres[e.text.genre] ?? 0) + 1;
    for (const t of e.topics) topics[t] = (topics[t] ?? 0) + 1;
  }
  return { levels, genres, topics };
}
