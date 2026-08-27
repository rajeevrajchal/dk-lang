// Row shapes the repositories return: generated table rows, plus the joins
// the app actually asks for.

import type { Tables } from "./database";

export type ItemRow = Tables<"Item">;
export type ConstructRow = Tables<"Construct">;
export type ExerciseAttemptRow = Tables<"ExerciseAttempt">;

export interface ItemWithConstructs extends ItemRow {
  itemConstructs: { constructId: string; construct: ConstructRow }[];
}

export interface ConstructWithAccuracy extends ConstructRow {
  constructAccura: Tables<"ConstructAccuracy">[];
}

export interface AttemptWithItem extends Tables<"Attempt"> {
  item: ItemRow;
}

export interface ExamSessionWithAttempts extends Tables<"ExamSession"> {
  exerciseAttempts: ExerciseAttemptRow[];
}

/** Narrows an exercise-history query. */
export interface HistoryFilter {
  moduleId?: number;
  category?: string;
}

export interface SaveWordInput {
  kind: string;
  danish: string;
  lemma?: string;
  translation: string;
  partOfSpeech?: string;
  contextSentence?: string;
  grammarNote?: string;
  sourceTextId?: string;
  note?: string;
}
