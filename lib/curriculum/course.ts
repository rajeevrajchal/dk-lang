import { THEORY_LESSONS, type TheoryLesson } from "@/lib/content-gen/theory";
import { FOUNDATION_LESSONS } from "./foundation-lessons";
import { READING_LESSONS } from "./reading-lessons";
import { WRITING_LESSONS } from "./writing-lessons";
import type { Course, CourseChapter } from "./course-types";

// The Danish course: chapters you can work through from the beginning.
//
// A chapter POINTS AT lessons by slug. It does not contain them. That is the
// whole migration strategy — the twelve lessons that existed before this file
// keep their slugs, their URLs and their content, and simply get assigned a
// place in the course. Nothing was deleted or rewritten to build this.
//
// The order is a grammar progression, not the module order: you cannot ask a
// question before you can build a statement, and you cannot handle a
// subordinate clause before you know where 'ikke' normally sits. PD3 modules
// hang off the side as milestones via `supportsModules`.

/**
 * Every lesson the course can reference.
 *
 * The grammar lessons come first because they are the spine; the reading and
 * writing lessons are added on the end rather than interleaved, because a
 * lesson's place in the course is decided by the chapter that references it,
 * not by its position in this array.
 */
export const ALL_LESSONS: TheoryLesson[] = [
  ...FOUNDATION_LESSONS,
  ...THEORY_LESSONS,
  ...READING_LESSONS,
  ...WRITING_LESSONS,
];

export const LESSON_BY_SLUG = new Map(ALL_LESSONS.map((l) => [l.slug, l]));

const CHAPTERS: CourseChapter[] = [
  {
    id: "ch-sentence-basics",
    number: 1,
    title: "Sentence basics",
    danishTitle: "Sætningens dele",
    intro:
      "Start here. Before any rules, you need names for the pieces of a sentence: who does something, what they do, and what the rest is. Everything later in the course is built on these three.",
    stage: "words",
    supportLanguage: "english_led",
    prerequisites: [],
    supportsModules: [1, 2],
    topics: [
      {
        id: "tp-sentence-parts",
        title: "What a sentence is made of",
        lessonSlug: "what-is-a-sentence",
        canDo: "Point at the doer and the action in a simple Danish sentence.",
      },
    ],
  },

  {
    id: "ch-nouns",
    number: 2,
    title: "Nouns: en and et",
    danishTitle: "Substantiver",
    intro:
      "Every Danish noun is either an en-word or an et-word, and 'the' is glued onto the end of the word instead of standing in front of it. This is the first thing that looks genuinely different from English.",
    stage: "words",
    supportLanguage: "english_led",
    prerequisites: ["ch-sentence-basics"],
    supportsModules: [1, 2],
    topics: [
      {
        id: "tp-noun-gender",
        title: "en/et and the attached 'the'",
        lessonSlug: "nouns-gender-and-definite-forms",
        canDo: "Say a noun in its indefinite, definite and plural forms.",
      },
    ],
  },

  {
    id: "ch-pronouns",
    number: 3,
    title: "Pronouns",
    danishTitle: "Pronominer",
    intro:
      "Short words that stand in for names: I, you, he, she. You cannot say much without them, and they change shape depending on whether the person is doing something or having it done to them.",
    stage: "words",
    supportLanguage: "english_led",
    prerequisites: ["ch-sentence-basics"],
    supportsModules: [1, 2],
    topics: [
      {
        id: "tp-pronouns",
        title: "jeg, du, han, hun — and mig, dig, ham, hende",
        lessonSlug: "pronouns",
        canDo: "Talk about yourself and others without repeating names.",
      },
    ],
  },

  {
    id: "ch-present-tense",
    number: 4,
    title: "Verbs in the present",
    danishTitle: "Verber i nutid",
    intro:
      "The easiest tense in Danish: one form for everybody. No -s for he or she, and no separate 'is doing' form. This is where you start making real sentences about your own life.",
    stage: "sentences",
    supportLanguage: "english_led",
    prerequisites: ["ch-sentence-basics", "ch-pronouns"],
    supportsModules: [1, 2, 3],
    revisits: ["ch-sentence-basics", "ch-pronouns"],
    topics: [
      {
        id: "tp-present-tense",
        title: "Present tense",
        lessonSlug: "present-tense",
        canDo: "Say what you do, using any regular verb.",
      },
          {
        id: "tp-reading-anna",
        title: "Read: Jeg hedder Anna",
        lessonSlug: "reading-jeg-hedder-anna",
        canDo: "Read a short introduction and understand who the person is.",
      },
],
  },

  {
    id: "ch-questions",
    number: 5,
    title: "Questions",
    danishTitle: "Spørgsmål",
    intro:
      "Two kinds, both simpler than English. Yes/no questions swap the first two words. Everything else starts with a hv- word. No 'do' anywhere in sight.",
    stage: "questions",
    supportLanguage: "english_led",
    prerequisites: ["ch-present-tense"],
    supportsModules: [1, 2, 3],
    revisits: ["ch-present-tense", "ch-pronouns"],
    topics: [
      {
        id: "tp-questions",
        title: "Yes/no questions and question words",
        lessonSlug: "questions",
        canDo: "Ask where someone lives, what they do and when something happens.",
      },
          {
        id: "tp-reading-beskeder",
        title: "Read: messages, notices and adverts",
        lessonSlug: "reading-beskeder-og-opslag",
        canDo: "Get the practical facts out of an everyday Danish message.",
      },
      {
        id: "tp-writing-besked",
        title: "Write: a short message",
        lessonSlug: "writing-en-kort-besked",
        canDo: "Write a short message asking somebody for something.",
      },
],
  },

  {
    id: "ch-negation",
    number: 6,
    title: "Negation",
    danishTitle: "Negation",
    intro:
      "One word does the whole job: ikke. Where you put it matters, and the position you learn here comes back in Chapter 10 as the way to recognise a subordinate clause.",
    stage: "negation",
    supportLanguage: "english_led",
    prerequisites: ["ch-present-tense"],
    supportsModules: [1, 2, 3],
    revisits: ["ch-present-tense", "ch-questions"],
    topics: [
      {
        id: "tp-negation",
        title: "ikke, aldrig, ingen",
        lessonSlug: "negation",
        canDo: "Say that something is not the case, with 'ikke' in the right place.",
      },
    ],
  },

  {
    id: "ch-word-order",
    number: 7,
    title: "Word order",
    danishTitle: "Ordstilling",
    intro:
      "The rule that explains most of the sentences you have already seen: the verb is always the second element. Once this clicks, Danish stops looking scrambled.",
    stage: "sentences",
    supportLanguage: "bilingual",
    prerequisites: ["ch-questions", "ch-negation"],
    supportsModules: [2, 3, 4],
    revisits: ["ch-sentence-basics", "ch-questions", "ch-negation"],
    topics: [
      {
        id: "tp-v2",
        title: "The verb comes second",
        lessonSlug: "word-order",
        canDo: "Start a sentence with a time or place and still get the word order right.",
      },
          {
        id: "tp-reading-hverdag",
        title: "Read: Min hverdag",
        lessonSlug: "reading-min-hverdag",
        canDo: "Follow a description of a whole day, and see inversion working in it.",
      },
],
  },

  {
    id: "ch-adjectives",
    number: 8,
    title: "Adjectives",
    danishTitle: "Adjektiver",
    intro:
      "Describing words change their ending depending on what they describe. Three forms, and the en/et distinction from Chapter 2 is what decides which one you need.",
    stage: "sentences",
    supportLanguage: "bilingual",
    prerequisites: ["ch-nouns", "ch-present-tense"],
    supportsModules: [2, 3],
    revisits: ["ch-nouns"],
    topics: [
      {
        id: "tp-adjective-agreement",
        title: "Adjective endings",
        lessonSlug: "adjective-agreement",
        canDo: "Describe things with the right adjective ending.",
      },
    ],
  },

  {
    id: "ch-past-tense",
    number: 9,
    title: "The past",
    danishTitle: "Datid",
    intro:
      "Talking about what already happened. Two regular groups plus a set of common irregulars — and, as with the present, still only one form for every person.",
    stage: "tenses",
    supportLanguage: "bilingual",
    prerequisites: ["ch-present-tense", "ch-word-order"],
    supportsModules: [2, 3, 4],
    revisits: ["ch-present-tense"],
    topics: [
      {
        id: "tp-past-tense",
        title: "Past tense",
        lessonSlug: "past-tense",
        canDo: "Tell someone what you did yesterday or last year.",
      },
          {
        id: "tp-reading-weekend",
        title: "Read: Min weekend",
        lessonSlug: "reading-min-weekend",
        canDo: "Understand somebody telling you about their weekend.",
      },
],
  },

  {
    id: "ch-future-modals",
    number: 10,
    title: "The future and modal verbs",
    danishTitle: "Fremtid og modalverber",
    intro:
      "Danish has no future tense — it uses the present, or skal/vil. The same five helper verbs also cover can, must, may and ought to.",
    stage: "tenses",
    supportLanguage: "bilingual",
    prerequisites: ["ch-past-tense"],
    supportsModules: [2, 3, 4],
    revisits: ["ch-present-tense", "ch-past-tense"],
    topics: [
      {
        id: "tp-future",
        title: "Talking about the future",
        lessonSlug: "future-tense",
        canDo: "Say what you are going to do next week.",
      },
      {
        id: "tp-modals",
        title: "kan, skal, vil, må, bør",
        lessonSlug: "modal-verbs",
        canDo: "Say what you can, must and want to do.",
      },
          {
        id: "tp-writing-email",
        title: "Write: an email that changes an arrangement",
        lessonSlug: "writing-en-email",
        canDo: "Write an email cancelling something and proposing an alternative.",
      },
],
  },

  {
    id: "ch-joining",
    number: 11,
    title: "Joining sentences",
    danishTitle: "Sideordning",
    intro:
      "og, men, eller. The easy connectors — they join two complete sentences and change nothing about the word order. Worth doing before the ones that do.",
    stage: "complex",
    supportLanguage: "bilingual",
    prerequisites: ["ch-word-order"],
    supportsModules: [2, 3],
    revisits: ["ch-word-order"],
    topics: [
      {
        id: "tp-coordination",
        title: "og, men, eller",
        lessonSlug: "coordination",
        canDo: "Join two sentences and pick the right connector for the meaning.",
      },
    ],
  },

  {
    id: "ch-subordinate",
    number: 12,
    title: "Subordinate clauses",
    danishTitle: "Ledsætninger",
    intro:
      "fordi, når, at, hvis. These connectors DO change the word order — 'ikke' jumps in front of the verb, exactly the shift you were told to watch for in Chapter 6. This is the most-tested piece of grammar at Modul 2.",
    stage: "complex",
    supportLanguage: "danish_led",
    prerequisites: ["ch-joining", "ch-negation"],
    supportsModules: [2, 3, 4],
    revisits: ["ch-negation", "ch-word-order", "ch-joining"],
    topics: [
      {
        id: "tp-subordinate",
        title: "fordi, når, at, hvis",
        lessonSlug: "subordinate-clauses",
        canDo: "Give a reason with 'fordi' and get the word order right.",
      },
    ],
  },

  {
    id: "ch-connectors",
    number: 13,
    title: "Connectors",
    danishTitle: "Konnektorer",
    intro:
      "selvom, derfor, dog. These signal the logic between whole sentences — despite, therefore, however — and each behaves differently in the sentence.",
    stage: "complex",
    supportLanguage: "danish_led",
    prerequisites: ["ch-subordinate"],
    supportsModules: [3, 4],
    revisits: ["ch-subordinate", "ch-word-order"],
    topics: [
      {
        id: "tp-connectors",
        title: "selvom, derfor, dog",
        lessonSlug: "connectors",
        canDo: "Show cause and contrast between two sentences.",
      },
          {
        id: "tp-reading-danmark",
        title: "Read: Derfor blev jeg i Danmark",
        lessonSlug: "reading-derfor-blev-jeg-i-danmark",
        canDo: "Follow an argument that gives reasons and weighs two sides.",
      },
],
  },

  {
    id: "ch-passive",
    number: 14,
    title: "Passive voice",
    danishTitle: "Passiv",
    intro:
      "When the thing being acted on matters more than who did it. Rules, notices and official texts are full of it, which is why it shows up in Modul 3 reading.",
    stage: "complex",
    supportLanguage: "danish_led",
    prerequisites: ["ch-past-tense", "ch-subordinate"],
    supportsModules: [3, 4],
    revisits: ["ch-past-tense"],
    topics: [
      {
        id: "tp-passive",
        title: "bliver + participle, and the -s passive",
        lessonSlug: "passive-voice",
        canDo: "Understand a rule written in the passive, and say one yourself.",
      },
    ],
  },

  {
    id: "ch-complex-sentences",
    number: 15,
    title: "Longer sentences",
    danishTitle: "Flere ledsætninger",
    intro:
      "Nothing new grammatically — this is applying what you already know, several times in one sentence. The skill is unpacking, and it is what separates Modul 3 reading from Modul 2.",
    stage: "communication",
    supportLanguage: "danish_led",
    prerequisites: ["ch-connectors", "ch-passive"],
    supportsModules: [3, 4, 5],
    revisits: ["ch-subordinate", "ch-connectors", "ch-word-order"],
    topics: [
      {
        id: "tp-multi-clause",
        title: "Sentences with several clauses",
        lessonSlug: "multiple-subordinate-clauses",
        canDo: "Read a long Danish sentence and find the main clause.",
      },
    ],
  },
];

export const DANISH_COURSE: Course = {
  id: "danish-du3",
  title: "Danish grammar course",
  description:
    "Work through Danish grammar from the beginning. Each chapter teaches one thing, practises it, and reuses it later. The PD3 modules sit alongside as milestones — the grammar is the spine.",
  chapters: CHAPTERS,
};

export const CHAPTER_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));

export function chapterByNumber(n: number): CourseChapter | undefined {
  return CHAPTERS.find((c) => c.number === n);
}

/** The chapter a lesson slug belongs to, for linking back from a lesson. */
export function chapterForLesson(slug: string): CourseChapter | undefined {
  return CHAPTERS.find((c) => c.topics.some((t) => t.lessonSlug === slug));
}

/** Chapters that contribute to a given PD3 module. */
export function chaptersForModule(moduleId: number): CourseChapter[] {
  return CHAPTERS.filter((c) => c.supportsModules.includes(moduleId));
}

/**
 * Every lesson slug in the course, in teaching order. Used to check that the
 * course references nothing that does not exist.
 */
export function courseLessonSlugs(): string[] {
  return CHAPTERS.flatMap((c) => c.topics.map((t) => t.lessonSlug));
}

/**
 * The lesson that comes after this one in teaching order, with the chapter it
 * belongs to — regardless of what the learner has finished.
 *
 * This is what "jump onwards" at the end of a lesson follows. Progress does
 * not come into it: the course order is the course order, and a learner who
 * goes back to an old lesson should still be offered the lesson that follows
 * it, not dropped somewhere else.
 */
export function nextLessonAfter(
  slug: string
): { chapter: CourseChapter; lessonSlug: string } | null {
  const sequence = CHAPTERS.flatMap((chapter) =>
    chapter.topics.map((topic) => ({ chapter, lessonSlug: topic.lessonSlug }))
  );
  const at = sequence.findIndex((step) => step.lessonSlug === slug);
  if (at === -1) return null;
  return sequence[at + 1] ?? null;
}
