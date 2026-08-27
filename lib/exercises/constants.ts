// The value side of the exercise domain: the allowed task types and
// categories, the lookup tables built on them, and the one predicate that
// reads those tables.
//
// The unions derived from these arrays live in @/types/exercises, which
// imports them with `import type` so nothing here is pulled in at runtime by
// code that only needs the type. See the header of @/types for the rule.
//
// Content is original. The reference modultest was used for structure,
// instruction phrasing, task mechanics and difficulty only — never for text.

import type { ExerciseCategory, TaskType } from "@/types";

export const EXERCISE_CATEGORIES = ["READING", "WRITING", "SPEAKING", "LISTENING"] as const;

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

// The demand ladder is the difficulty axis that matters at this level: Modul 2
// asks what/where/when/who, Modul 3 asks why, for an example, for a preference
// and for a reason. Harder vocabulary is not what makes Modul 3 harder — the
// communication requirement is.
export const COMMUNICATION_DEMANDS = [
  "factual", // Hvad? Hvor? Hvornår? Hvem? Hvor ofte?
  "description", // Hvordan er...? Fortæl om...
  "elaboration", // Vil du fortælle lidt mere? Kan du give et eksempel?
  "preference", // Hvad kan du bedst lide? Hvilken vil du vælge?
  "reasoning", // Hvorfor? Hvad er grunden?
  "experience", // Hvad er din erfaring med...?
] as const;

export const SPEAKING_ROLES = ["examiner", "partner", "solo"] as const;

export const SPEAKING_STAGE_TYPES = [
  "presentation", // candidate speaks, uninterrupted
  "examiner_followup", // examiner questions about what was just said
  "information_exchange", // both sides ask to fill gaps in what they hold
  "pair_discussion", // candidate and partner compare and choose
  "examiner_interview", // examiner widens out after the pair work
] as const;

export const isAutoScored = (taskType: TaskType): boolean => {
  return taskType.startsWith("reading_") || taskType.startsWith("listening_");
};
