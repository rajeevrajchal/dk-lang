import { TASK_TYPES_BY_CATEGORY, EXERCISE_CATEGORIES } from "@/lib/exercises/constants";
import { tasksForModule } from "@/lib/exercises/module-tasks";
import type { ExerciseCategory, PracticeType, TaskDifficulty } from "@/types";

// The catalogue: what a learner can practise, and how it is named in a URL.
//
// This is the file that removes the module from the navigation. The module is
// still what decides WHICH task types a category offers and how hard the
// content is — it just comes from the learner's profile rather than from a
// screen asking them to pick it again. Everything here takes `moduleId` as an
// argument and nothing here asks the learner for it.
//
// One catalogue for every category, so Reading, Writing, Speaking and
// Listening are the same shape of thing and the same components render all
// four. Adding a practice type means adding a row, not a page.

/** How many numbered tasks a practice type offers. */
export const TASKS_PER_TYPE = 50;

/**
 * The difficulty ladder's rungs, in order.
 *
 * Declared as its own array rather than being inferred from the band table
 * below, so the type and the table cannot reference each other in a circle —
 * and so the ordering is stated once, which is what "is this harder than
 * that?" needs.
 */
export const TASK_DIFFICULTIES = [
  "easy",
  "easy_medium",
  "medium",
  "medium_hard",
  "hard",
] as const;

/**
 * The difficulty ladder across the fifty.
 *
 * Difficulty is a property of the SLOT, not of what happens to be generated
 * into it — so task 47 is hard for every learner and stays hard, and the
 * generator is told which band it is writing for. The bands are wider in the
 * middle because that is where most practice happens.
 */
export const DIFFICULTY_BANDS: { upTo: number; difficulty: TaskDifficulty }[] = [
  { upTo: 10, difficulty: "easy" },
  { upTo: 20, difficulty: "easy_medium" },
  { upTo: 35, difficulty: "medium" },
  { upTo: 45, difficulty: "medium_hard" },
  { upTo: 50, difficulty: "hard" },
];

export const difficultyForTask = (taskNumber: number): TaskDifficulty => {
  return (
    DIFFICULTY_BANDS.find((b) => taskNumber <= b.upTo)?.difficulty ?? "hard"
  );
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: "Easy",
  easy_medium: "Easy–medium",
  medium: "Medium",
  medium_hard: "Medium–hard",
  hard: "Hard",
};

/**
 * What each band actually asks for, in the terms that make a Danish text
 * harder rather than merely longer. Handed to the generator verbatim, which is
 * what stops "hard" meaning "the same exercise with rarer nouns".
 */
export const DIFFICULTY_GUIDANCE: Record<TaskDifficulty, string> = {
  easy: "Short main clauses in the present tense, everyday vocabulary, one idea per sentence. No subordinate clauses. Word order stays subject–verb–object.",
  easy_medium:
    "Connected sentences joined with og, men and fordi. Past tense appears. Sentences start with a time or place phrase sometimes, so the learner meets inverted word order (V2). Still concrete, everyday topics.",
  medium:
    "Several paragraphs. Subordinate clauses with at, hvis, når and som. Perfect tense. Modal verbs. Some negation inside subordinate clauses, where 'ikke' moves in front of the verb. Topics reach beyond the household: work, appointments, the kommune.",
  medium_hard:
    "Opinions and reasons, not just facts. Longer periods with more than one clause. Passive forms with blive. Comparatives. Distractors that are plausible on a quick read and only fail on one concrete detail. Some idiomatic expressions.",
  hard: "PD3 territory. Abstract topics, argument and counter-argument, longer sentences with embedded clauses. Idiomatic and fixed expressions used naturally. The answer requires holding two parts of the text against each other rather than finding one stated fact.",
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface CategoryDefinition {
  key: ExerciseCategory;
  /** URL segment. Matches the folders that already exist under /class. */
  slug: string;
  label: string;
  description: string;
  icon: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    key: "READING",
    slug: "reading",
    label: "Reading",
    description: "Read Danish and find the answer in it.",
    icon: "📖",
  },
  {
    key: "WRITING",
    slug: "writing",
    label: "Writing",
    description: "Write emails, messages and short texts.",
    icon: "✍️",
  },
  {
    key: "SPEAKING",
    slug: "speaking",
    label: "Speaking",
    description: "Talk to the examiner and to a partner.",
    icon: "🎤",
  },
  {
    key: "LISTENING",
    slug: "listening",
    label: "Listening",
    description: "Listen and answer. Needs audio, which is not recorded yet.",
    icon: "🎧",
  },
];

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
export const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

export const categorySlug = (key: ExerciseCategory): string => {
  return CATEGORY_BY_KEY.get(key)?.slug ?? key.toLowerCase();
};

// ---------------------------------------------------------------------------
// Practice types
// ---------------------------------------------------------------------------

/**
 * The learner-facing name and URL slug of every task type.
 *
 * The slug is what appears in the address bar, so it is written the way the
 * learner would describe the exercise — "fill-in-the-blanks", not
 * "reading_task_3_missing_words". The two are kept in one table so the mapping
 * cannot drift.
 */
const PRACTICE_TYPES: PracticeType[] = [
  {
    taskType: "reading_task_1_matching",
    category: "READING",
    slug: "match-the-advert",
    label: "Match the advert",
    description: "Five people, seven adverts. Find the one that fits each person.",
    opgaveNumber: 1,
  },
  {
    taskType: "reading_task_2_wrong_sentence",
    category: "READING",
    slug: "odd-one-out",
    label: "Odd one out",
    description: "One sentence in each paragraph contradicts the rest. Find it.",
    opgaveNumber: 2,
  },
  {
    taskType: "reading_task_3_missing_words",
    category: "READING",
    slug: "fill-in-the-blanks",
    label: "Fill in the blanks",
    description: "Put the missing words back into the text, each word once.",
    opgaveNumber: 3,
  },
  {
    taskType: "reading_task_4_people_matching",
    category: "READING",
    slug: "who-is-it-about",
    label: "Who is it about?",
    description: "Three people, five questions. Decide who each one is about.",
    opgaveNumber: 4,
  },
  {
    taskType: "writing_email",
    category: "WRITING",
    slug: "email",
    label: "Email",
    description: "Reply to an email, answering every question it asks.",
  },
  {
    taskType: "writing_message",
    category: "WRITING",
    slug: "short-message",
    label: "Short message",
    description: "A short written message — a note, an SMS, a message to a school.",
  },
  {
    taskType: "writing_short_text",
    category: "WRITING",
    slug: "short-text",
    label: "Short text",
    description: "A connected text about a situation, with points you must cover.",
  },
  {
    taskType: "speaking_mindmap",
    category: "SPEAKING",
    slug: "mindmap-presentation",
    label: "Mindmap presentation",
    description: "Speak from a mindmap, then answer the examiner's follow-ups.",
  },
  {
    taskType: "speaking_information_gap",
    category: "SPEAKING",
    slug: "information-gap",
    label: "Information gap",
    description: "You each hold half the facts. Ask for what you are missing.",
  },
  {
    taskType: "speaking_prepared_topic",
    category: "SPEAKING",
    slug: "prepared-topic",
    label: "Prepared topic",
    description: "Prepare a topic, present it, then take questions on it.",
  },
  {
    taskType: "speaking_picture_preference",
    category: "SPEAKING",
    slug: "preference-discussion",
    label: "Preference discussion",
    description: "Compare four options, choose one and say why.",
  },
  {
    taskType: "speaking_interview",
    category: "SPEAKING",
    slug: "interview",
    label: "Interview",
    description: "Answer the examiner's questions about yourself and your life.",
  },
  {
    taskType: "speaking_topic",
    category: "SPEAKING",
    slug: "talk-about-a-topic",
    label: "Talk about a topic",
    description: "Speak at length about one subject.",
  },
  {
    taskType: "speaking_situation",
    category: "SPEAKING",
    slug: "situation",
    label: "Situation",
    description: "Handle a everyday situation in Danish — a shop, a doctor, a school.",
  },
  {
    taskType: "listening_multiple_choice",
    category: "LISTENING",
    slug: "listen-and-choose",
    label: "Listen and choose",
    description: "Listen, then choose the right answer.",
  },
  {
    taskType: "listening_matching",
    category: "LISTENING",
    slug: "listen-and-match",
    label: "Listen and match",
    description: "Listen, then match what you heard.",
  },
];

export const PRACTICE_TYPE_BY_TASK_TYPE = new Map(
  PRACTICE_TYPES.map((p) => [p.taskType, p])
);
export const PRACTICE_TYPE_BY_SLUG = new Map(
  PRACTICE_TYPES.map((p) => [`${p.category}:${p.slug}`, p])
);

export const practiceType = (taskType: string): PracticeType | undefined => {
  return PRACTICE_TYPE_BY_TASK_TYPE.get(taskType);
};

export const practiceTypeBySlug = (
  category: ExerciseCategory,
  slug: string
): PracticeType | undefined => {
  return PRACTICE_TYPE_BY_SLUG.get(`${category}:${slug}`);
};

/**
 * The practice types a learner at this module sees under a category.
 *
 * The module composition decides it — Modul 2 reading is Opgave 1–4, Modul 2
 * speaking is the mindmap and the information gap — which is exactly what the
 * old "choose a module, then choose a task" flow computed. The only thing that
 * changed is where the module comes from.
 */
export const practiceTypesFor = (
  moduleId: number,
  category: ExerciseCategory
): PracticeType[] => {
  const taskTypes = tasksForModule(moduleId, category) ?? TASK_TYPES_BY_CATEGORY[category];
  return taskTypes
    .map((t) => PRACTICE_TYPE_BY_TASK_TYPE.get(t))
    .filter((p): p is PracticeType => p !== undefined);
};

/** Every (category, practice type) pair this learner has, in display order. */
export const allPracticeTypesFor = (
  moduleId: number
): { category: CategoryDefinition; types: PracticeType[] }[] => {
  return CATEGORIES.map((category) => ({
    category,
    types: practiceTypesFor(moduleId, category.key),
  }));
};

export { EXERCISE_CATEGORIES };
