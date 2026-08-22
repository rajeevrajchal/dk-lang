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
  // Tale / samtale.
  //
  // The first three are the original general-purpose prompts and are kept
  // exactly as they were. The four below them model the actual opgave formats
  // of the modultest, and are composed per module (see speaking-patterns.ts).
  //
  // Note what is NOT here: "presentation followup", "pair interaction" and
  // "examiner interview" are STAGES inside these tasks, not tasks of their
  // own — the source material shows them as phases of Opgave 1 and Opgave 2.
  // Modelling them as task types would have made a two-phase opgave look like
  // two unrelated exercises.
  "speaking_interview",
  "speaking_topic",
  "speaking_situation",
  "speaking_mindmap",
  "speaking_information_gap",
  "speaking_prepared_topic",
  "speaking_picture_preference",
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
  // Every speaking task type the app knows. Which of them a given module
  // actually uses is decided per module in speaking-patterns.ts — a module is
  // composed FROM task types rather than being one. This stays the full list
  // so anything iterating categories (the registry fallback, the authored
  // pool) keeps behaving as before.
  SPEAKING: [
    "speaking_interview",
    "speaking_topic",
    "speaking_situation",
    "speaking_mindmap",
    "speaking_information_gap",
    "speaking_prepared_topic",
    "speaking_picture_preference",
  ],
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

// ---------------------------------------------------------------------------
// Speaking task structure
//
// What the candidate is actually being asked to DO, which is what separates
// one opgave from another. The demand ladder is the difficulty axis that
// matters at this level: Modul 2 asks what/where/when/who, Modul 3 asks why,
// for an example, for a preference and for a reason. Harder vocabulary is not
// what makes Modul 3 harder — the communication requirement is.
// ---------------------------------------------------------------------------

export const COMMUNICATION_DEMANDS = [
  "factual", // Hvad? Hvor? Hvornår? Hvem? Hvor ofte?
  "description", // Hvordan er...? Fortæl om...
  "elaboration", // Vil du fortælle lidt mere? Kan du give et eksempel?
  "preference", // Hvad kan du bedst lide? Hvilken vil du vælge?
  "reasoning", // Hvorfor? Hvad er grunden?
  "experience", // Hvad er din erfaring med...?
] as const;
export type CommunicationDemand = (typeof COMMUNICATION_DEMANDS)[number];

/**
 * Who the candidate is talking to in a stage. The examiner probes and moves
 * the conversation on; a partner exchanges information as an equal. Treating
 * them as the same role is what makes a pair task feel like an interview.
 */
export const SPEAKING_ROLES = ["examiner", "partner", "solo"] as const;
export type SpeakingRole = (typeof SPEAKING_ROLES)[number];

export const SPEAKING_STAGE_TYPES = [
  "presentation", // candidate speaks, uninterrupted
  "examiner_followup", // examiner questions about what was just said
  "information_exchange", // both sides ask to fill gaps in what they hold
  "pair_discussion", // candidate and partner compare and choose
  "examiner_interview", // examiner widens out after the pair work
] as const;
export type SpeakingStageType = (typeof SPEAKING_STAGE_TYPES)[number];

export interface SpeakingStage {
  type: SpeakingStageType;
  role: SpeakingRole;
  /** What the candidate has to be able to do to satisfy this stage. */
  communicationDemand: CommunicationDemand;
  /** Rough guidance shown to the learner; not enforced by a timer. */
  approxMinutes?: number;
  /** One line telling the learner what this stage asks of them. */
  instruction: string;
}

/** Opgave 1 (Modul 2): a topic plus the keyword categories to speak from. */
export interface SpeakingMindmap {
  title: string;
  /** ~6 short keyword prompts, e.g. "dage / tid", "transport til arbejde". */
  categories: string[];
}

export interface InformationItem {
  /** What this fact is about, e.g. "åbningstider" — used to score coverage. */
  label: string;
  /** The fact itself, in Danish. Only the side that holds it can see it. */
  value: string;
}

/**
 * Opgave 2 (Modul 2): the two sides deliberately hold DIFFERENT facts, so the
 * candidate has an actual reason to ask. If both sides held the same
 * information there would be no task.
 */
export interface InformationGapSpec {
  sharedContext: string;
  /** The side the learner plays. */
  candidate: { holds: InformationItem[]; mustFindOut: string[] };
  /** The side the app plays. */
  partner: { holds: InformationItem[]; mustFindOut: string[] };
  /** Questions the candidate has to get asked to complete the task. */
  requiredQuestions: string[];
}

/** Opgave 1 (Modul 3): two topics are offered and one is drawn. */
export interface PreparedTopic {
  title: string;
  /** Prompts to prepare from — the Modul 3 equivalent of the mindmap. */
  prompts: string[];
}

/** Opgave 2 (Modul 3): a topic and four options to compare and choose between. */
export interface PreferenceOption {
  id: string;
  label: string;
  /** Stands in for the picture in the paper test. */
  description: string;
}

/**
 * Tale — not auto-scored.
 *
 * Everything below `usefulPhrases` was added for the modultest task patterns
 * and is OPTIONAL on purpose: every speaking exercise authored or generated
 * before this existed still satisfies the type, still validates, and still
 * renders exactly as it did. A renderer shows an extra block only when the
 * corresponding field is present.
 */
export interface SpeakingContent {
  kind: "speaking";
  situation?: string;
  questions: string[];
  /** Follow-ups an examiner would ask; shown after the main questions. */
  followUps: string[];
  /** Useful phrases at this level, to prepare with. */
  usefulPhrases: { danish: string; english: string }[];

  /** The phases of the opgave. Absent on the original free-form prompts. */
  stages?: SpeakingStage[];
  mindmap?: SpeakingMindmap;
  informationGap?: InformationGapSpec;
  /** Two topics offered; the drawn one is chosen at run time. */
  preparedTopics?: PreparedTopic[];
  preferenceTopic?: string;
  preferenceOptions?: PreferenceOption[];
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
  /** True when this exercise was written by the model for this attempt. */
  generated?: boolean;
  /**
   * True when this exercise has Danish source text worth explaining. False for
   * speaking prompts and for writing tasks where the learner supplies the
   * text — the "explain this text" button is hidden in those cases.
   */
  explainable: boolean;
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
