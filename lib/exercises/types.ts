// Modultest-style exercises ("opgaver").
//
// These are a different unit from `Item` in prisma/schema.prisma. An Item is
// ONE question feeding the adaptive/construct engine. An Exercise here is a
// whole opgave modelled on the real DU3 Modul 2 modultest — Læsning Opgave 1
// alone carries six people, eight adverts and six answers. Both exist side by
// side on purpose: Items drive the tier/construct drill, Exercises drive
// test-format rehearsal.
//
// Every exercise is a hand-authored VARIANT. Variants of the same task type
// share the mechanics and instruction wording but change the topic, so a
// learner can sit "Læsning Opgave 1" repeatedly and meet housing, then jobs,
// then activities. Nothing is generated at request time (same rule as
// lib/content-gen — see docs/content-validation.md); selection just picks a
// variant the learner hasn't done yet.
//
// Content is original. The reference modultest was used for structure,
// instruction phrasing, task mechanics and difficulty only — never for text.

export const EXERCISE_CATEGORIES = ["READING", "WRITING", "SPEAKING", "LISTENING"] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const TASK_TYPES = [
  // Læsning — the four tasks of the real modultest, in order.
  "reading_task_1_matching",
  "reading_task_2_wrong_sentence",
  "reading_task_3_missing_words",
  "reading_task_4_people_matching",
  // Skrivning
  "writing_email",
  "writing_message",
  "writing_short_text",
  // Tale / samtale
  "speaking_interview",
  "speaking_topic",
  "speaking_situation",
  // Lytning — declared so the architecture is ready; no variants exist yet
  // because there is no audio. Text pretending to be audio would not
  // rehearse listening, so none is authored.
  "listening_multiple_choice",
  "listening_matching",
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPES_BY_CATEGORY: Record<ExerciseCategory, TaskType[]> = {
  READING: [
    "reading_task_1_matching",
    "reading_task_2_wrong_sentence",
    "reading_task_3_missing_words",
    "reading_task_4_people_matching",
  ],
  WRITING: ["writing_email", "writing_message", "writing_short_text"],
  SPEAKING: ["speaking_interview", "speaking_topic", "speaking_situation"],
  LISTENING: ["listening_multiple_choice", "listening_matching"],
};

// Which opgave number this task type is in the real test, for labelling.
export const TASK_NUMBER: Partial<Record<TaskType, number>> = {
  reading_task_1_matching: 1,
  reading_task_2_wrong_sentence: 2,
  reading_task_3_missing_words: 3,
  reading_task_4_people_matching: 4,
};

// ---------------------------------------------------------------------------
// Content shapes, one per task type
// ---------------------------------------------------------------------------

/** Læsning Opgave 1 — match each person to the advert that fits them. */
export interface MatchingPerson {
  id: string; // "1".."5"
  text: string; // the person's situation, in Danish
}
export interface MatchingAd {
  id: string; // "A".."G"
  title: string;
  body: string;
}
export interface ReadingTask1Content {
  kind: "reading_task_1_matching";
  /** Worked example, shown solved like the "(0)" row in the real test. */
  example: { personText: string; adId: string };
  people: MatchingPerson[];
  ads: MatchingAd[];
  /** personId -> adId. Ads not appearing here are the deliberate distractors. */
  answers: Record<string, string>;
  /** personId -> why that advert is the only fit. */
  rationales: Record<string, string>;
}

/** Læsning Opgave 2 — one sentence per section does not belong. */
export interface WrongSentenceSection {
  id: string; // "1".."4"
  sentences: string[];
  wrongIndex: number;
  why: string;
}
export interface ReadingTask2Content {
  kind: "reading_task_2_wrong_sentence";
  textTitle: string;
  example: { sentences: string[]; wrongIndex: number; why: string };
  sections: WrongSentenceSection[];
}

/**
 * Læsning Opgave 3 — fill the gaps from a word bank, each word once, with
 * unused words left over. `segments` alternate text/blank when rendered in
 * order: segment i of text, then blank i, and so on.
 */
export interface ReadingTask3Content {
  kind: "reading_task_3_missing_words";
  textTitle: string;
  /** Text chunks around the blanks; length is always blanks.length + 1. */
  textSegments: string[];
  /** Correct word for each blank, in order. */
  answers: string[];
  /** Everything offered, shuffled: answers + distractors + the example word. */
  wordBank: string[];
  /** The word shown already filled in, as the real test does on line one. */
  exampleWord: string;
  exampleSentence: string;
  /** Blank index -> why that word and not another. */
  rationales: string[];
}

/** Læsning Opgave 4 — decide which of three people each question is about. */
export interface PersonProfile {
  id: string; // "A" | "B" | "C"
  name: string;
  text: string;
}
export interface PeopleQuestion {
  id: string;
  question: string;
  personId: string;
  why: string;
}
export interface ReadingTask4Content {
  kind: "reading_task_4_people_matching";
  heading: string;
  people: PersonProfile[];
  example: { question: string; personId: string };
  questions: PeopleQuestion[];
}

/** Skrivning — a situation plus what must be covered. Not auto-scored. */
export interface WritingContent {
  kind: "writing";
  situation: string;
  task: string;
  minWords: number;
  /** Present for email tasks: the message being replied to. */
  incomingEmail?: {
    from: string;
    subject: string;
    body: string;
    /** The questions the learner must answer — underlined in the real test. */
    questions: string[];
  };
  /** Prefilled header for the answer box, e.g. "Til: Ricki". */
  answerHeader?: { to?: string; subject?: string };
  /** Points that must appear; used for self-check, not machine grading. */
  mustInclude: string[];
}

/** Tale — questions to answer aloud. Not auto-scored. */
export interface SpeakingContent {
  kind: "speaking";
  situation?: string;
  questions: string[];
  /** Follow-ups an examiner would ask; shown after the main questions. */
  followUps: string[];
  /** Useful phrases at this level, to prepare with. */
  usefulPhrases: { danish: string; english: string }[];
}

export type ExerciseContent =
  | ReadingTask1Content
  | ReadingTask2Content
  | ReadingTask3Content
  | ReadingTask4Content
  | WritingContent
  | SpeakingContent;

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export interface ExerciseVariant {
  /** Stable id, e.g. "r1-bolig". Stored in history so it is never repeated. */
  variantId: string;
  category: ExerciseCategory;
  taskType: TaskType;
  moduleId: number;
  /** Learner-facing topic label, e.g. "Bolig", "Arbejde". */
  topic: string;
  title: string;
  /** Danish instruction text, phrased like the real test. */
  instruction: string[];
  difficulty: "easy" | "medium" | "hard";
  content: ExerciseContent;
}

/**
 * What the client is allowed to see while working. Answers, rationales and
 * `why` fields are stripped server-side and only returned after submission —
 * same rule the Item flow follows (answerJson never leaves the server until
 * /api/attempts grades it).
 */
export type PublicExerciseContent =
  | (Omit<ReadingTask1Content, "answers" | "rationales">)
  | (Omit<ReadingTask2Content, "sections" | "example"> & {
      example: { sentences: string[]; wrongIndex: number; why: string };
      sections: { id: string; sentences: string[] }[];
    })
  | (Omit<ReadingTask3Content, "answers" | "rationales">)
  | (Omit<ReadingTask4Content, "questions"> & {
      questions: { id: string; question: string }[];
    })
  | WritingContent
  | SpeakingContent;

export interface PublicExercise {
  /** ExerciseAttempt row id — what /submit is posted against. */
  attemptId: string;
  variantId: string;
  category: ExerciseCategory;
  taskType: TaskType;
  taskNumber?: number;
  topic: string;
  title: string;
  instruction: string[];
  difficulty: ExerciseVariant["difficulty"];
  /** True the first time this learner has seen this variant. */
  isNew: boolean;
  content: PublicExerciseContent;
}

// ---------------------------------------------------------------------------
// Responses + grading
// ---------------------------------------------------------------------------

/** personId/sectionId/questionId -> chosen value; task 3 is blank-index -> word. */
export type ExerciseResponse = Record<string, string>;

export interface GradedAnswer {
  key: string; // personId / sectionId / questionId / blank index
  label: string; // what the learner was answering, for the results list
  given: string | null;
  expected: string;
  isCorrect: boolean;
  why: string;
}

export interface ExerciseResult {
  /** Null for writing/speaking, which have no objectively correct answer. */
  score: number | null;
  total: number | null;
  mistakes: number | null;
  answers: GradedAnswer[];
  /** Word count for writing tasks, so the minimum can be checked. */
  wordCount?: number;
  minWords?: number;
}

export function isAutoScored(taskType: TaskType): boolean {
  return taskType.startsWith("reading_") || taskType.startsWith("listening_");
}
