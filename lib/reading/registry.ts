import { ALL_LESSONS } from "@/lib/curriculum/course";
import type { LearningText, ReadingLevel } from "@/lib/learning/text";
import { LIBRARY_TEXTS } from "./texts";
import type { Phrase, ReadingText, ReadingTopic } from "./library";

// Everything the learner can read, in one list.
//
// Two sources, and the second is the point: the texts written for the grammar
// course are already `LearningText`s with full glossaries, and they are good
// reading. Surfacing them here rather than writing them twice means the
// library starts with real content and the course keeps its texts where the
// grammar needs them. A library entry that comes from a lesson carries
// `courseLessonSlug`, so the reader can offer "this is Chapter 9" instead of
// pretending it is unrelated.

const BY_ID = new Map(LIBRARY_TEXTS.map((t) => [t.id, t]));

function libraryText(id: string): LearningText {
  const text = BY_ID.get(id);
  if (!text) throw new Error(`reading: no library text "${id}"`);
  return text;
}

// ---------------------------------------------------------------------------
// Library-only texts, with the metadata the library needs
// ---------------------------------------------------------------------------

interface Meta {
  id: string;
  title: string;
  danishTitle: string;
  blurb: string;
  topics: ReadingTopic[];
  targetModules?: number[];
  phrases?: Phrase[];
}

const LIBRARY_META: Meta[] = [
  {
    id: "lib-en-dag-i-parken",
    title: "A day in the park",
    danishTitle: "En dag i parken",
    blurb:
      "A dog, a lost hat and a good Sunday. Sixteen short sentences — the first Danish story you can read from beginning to end.",
    topics: ["daily_life", "family", "nature"],
    targetModules: [1, 2],
    phrases: [
      { danish: "løber efter", lemma: "løbe efter", english: "to run after, chase", note: "The 'efter' is what makes it chasing rather than just running." },
      { danish: "leder efter", lemma: "lede efter", english: "to look for", note: "'lede' alone means to lead. Only with 'efter' does it mean search." },
      { danish: "sætter sig ned", lemma: "sætte sig ned", english: "to sit down", note: "You seat yourself — the 'sig' cannot be dropped." },
    ],
  },
  {
    id: "lib-i-supermarkedet",
    title: "At the supermarket",
    danishTitle: "I supermarkedet",
    blurb:
      "The vocabulary of an ordinary errand: a list, a forgotten carton of milk, and a card in the wrong pocket.",
    topics: ["daily_life", "food"],
    targetModules: [1, 2],
    phrases: [
      { danish: "handler", lemma: "at handle", english: "to do the shopping", note: "'købe ind' means the same. Both are more common than 'shoppe'." },
      { danish: "hele vejen tilbage", lemma: "hele vejen tilbage", english: "all the way back" },
      { danish: "ved kassen", lemma: "ved kassen", english: "at the till" },
      { danish: "hele tiden", lemma: "hele tiden", english: "all the time" },
      { danish: "på nettet", lemma: "på nettet", english: "online", note: "Danish says 'on the net' where English says 'online'." },
    ],
  },
  {
    id: "lib-hjemmearbejde",
    title: "Working from home in Denmark",
    danishTitle: "Sådan arbejder mange danskere hjemmefra",
    blurb:
      "How working from home went from unusual to ordinary in a few years — what employers found, and what got lost.",
    topics: ["work", "technology", "society"],
    targetModules: [2, 3],
    phrases: [
      { danish: "for få år siden", lemma: "for ... siden", english: "... ago", note: "The time goes in the middle: for tre år siden, for en uge siden." },
      { danish: "om ugen", lemma: "om ugen", english: "per week", note: "'om' does this job for all repeating periods: om dagen, om ugen, om året." },
      { danish: "frem og tilbage", lemma: "frem og tilbage", english: "back and forth" },
      { danish: "peger også på", lemma: "pege på", english: "to point out", note: "An adverb can drop in between the verb and its 'på' — 'peger også på'." },
    ],
  },
  {
    id: "lib-derfor-cykler-danskerne",
    title: "Why Danes cycle",
    danishTitle: "Derfor cykler danskerne",
    blurb:
      "An argument, not a description: the writer thinks everyone explains Danish cycling wrongly, and says what actually made it work.",
    topics: ["society", "culture", "travel", "health"],
    targetModules: [3, 4],
    phrases: [
      { danish: "undrer sig over", lemma: "undre sig over", english: "to be surprised at", note: "Reflexive — the 'sig' is part of the verb." },
      { danish: "handler om", lemma: "handle om", english: "to be about" },
      { danish: "som regel", lemma: "som regel", english: "as a rule, usually" },
      { danish: "kommer hurtigere frem", lemma: "komme frem", english: "to get there, arrive" },
      { danish: "tager ... på", lemma: "tage tøj på", english: "to put clothes on", note: "The 'på' can be separated from the verb by what you are putting on." },
      { danish: "til gengæld", lemma: "til gengæld", english: "on the other hand" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Course texts, surfaced
// ---------------------------------------------------------------------------

/** Topics for the texts that live inside the grammar course. */
const COURSE_TEXT_TOPICS: Record<string, ReadingTopic[]> = {
  "rt-jeg-hedder-anna": ["daily_life", "family", "work"],
  "rt-min-hverdag": ["daily_life", "work", "family"],
  "rt-sms-kollega": ["work"],
  "rt-opslag-vaskeri": ["housing", "daily_life"],
  "rt-boligannonce": ["housing"],
  "rt-email-sprogskolen": ["education"],
  "rt-min-weekend": ["daily_life", "food", "family"],
  "rt-derfor-blev-jeg": ["society", "work", "family", "culture"],
};

const COURSE_TEXT_BLURBS: Record<string, string> = {
  "rt-jeg-hedder-anna": "Eight sentences of self-introduction. Where to start if you have never read Danish.",
  "rt-min-hverdag": "A whole day, from getting up to going to bed, and the times of day that keep flipping the word order.",
  "rt-sms-kollega": "A colleague texts to say she is ill. Four lines of the Danish you will actually receive.",
  "rt-opslag-vaskeri": "A notice in a laundry room — and what Danish notices leave out on purpose.",
  "rt-boligannonce": "A flat for rent, in the abbreviations Danish housing adverts are written in.",
  "rt-email-sprogskolen": "The language school cancels a class. A short, ordinary Danish email.",
  "rt-min-weekend": "Somebody's weekend, told in the past tense, with the first reasons and 'fordi' clauses.",
  "rt-derfor-blev-jeg": "Eleven years in Denmark, and why he stayed. An argument with two sides to it.",
};

function courseEntries(): ReadingText[] {
  const entries: ReadingText[] = [];

  for (const lesson of ALL_LESSONS) {
    for (const text of lesson.texts ?? []) {
      // Only surface a text we have actually catalogued. An unlisted text is
      // a signal that a lesson was written and the library was not updated —
      // better to leave it out than to guess at what it is about.
      const topics = COURSE_TEXT_TOPICS[text.id];
      if (!topics) continue;

      entries.push({
        id: text.id,
        title: text.title,
        danishTitle: text.danishTitle,
        blurb: COURSE_TEXT_BLURBS[text.id] ?? text.summary,
        level: text.level,
        topics,
        targetModules: lesson.pd3Modules,
        text,
        courseLessonSlug: lesson.slug,
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// The library
// ---------------------------------------------------------------------------

export const READING_LIBRARY: ReadingText[] = [
  ...LIBRARY_META.map((meta): ReadingText => {
    const text = libraryText(meta.id);
    return {
      id: meta.id,
      title: meta.title,
      danishTitle: meta.danishTitle,
      blurb: meta.blurb,
      level: text.level,
      topics: meta.topics,
      targetModules: meta.targetModules,
      text,
      phrases: meta.phrases,
    };
  }),
  ...courseEntries(),
  // Easiest first: a library sorted by anything else asks a beginner to
  // decide which of eleven unfamiliar texts they can cope with.
].sort((a, b) => a.level - b.level || a.title.localeCompare(b.title));

export const READING_BY_ID = new Map(READING_LIBRARY.map((t) => [t.id, t]));

export function readingText(id: string): ReadingText | undefined {
  return READING_BY_ID.get(id);
}

/** Levels that actually have texts, for the filter UI. */
export function availableLevels(): ReadingLevel[] {
  return [...new Set(READING_LIBRARY.map((t) => t.level))].sort() as ReadingLevel[];
}
