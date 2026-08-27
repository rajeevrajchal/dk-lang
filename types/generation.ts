// Model-generated exercise shapes.
//
// Each alias is inferred from the zod schema that constrains the model's
// output (lib/exercises/schemas.ts), so the schema stays the single source of
// truth and these can never drift from it.

import type { z } from "zod";
import type {
  ExaminerTurnSchema,
  InformationGapSchema,
  MindmapSchema,
  PicturePreferenceSchema,
  PreparedTopicSchema,
  SpeakingSchema,
  Task1Schema,
  Task2Schema,
  Task3Schema,
  Task4Schema,
  WritingSchema,
} from "@/lib/exercises/schemas";
import type { ExplanationSchema } from "@/lib/exercises/explain";
import type { ExerciseVariant } from "./exercises";

export type MindmapGenerated = z.infer<typeof MindmapSchema>;
export type InformationGapGenerated = z.infer<typeof InformationGapSchema>;
export type PreparedTopicGenerated = z.infer<typeof PreparedTopicSchema>;
export type PicturePreferenceGenerated = z.infer<typeof PicturePreferenceSchema>;
export type ExaminerTurnGenerated = z.infer<typeof ExaminerTurnSchema>;

export type Task1Generated = z.infer<typeof Task1Schema>;
export type Task2Generated = z.infer<typeof Task2Schema>;
export type Task3Generated = z.infer<typeof Task3Schema>;
export type Task4Generated = z.infer<typeof Task4Schema>;
export type WritingGenerated = z.infer<typeof WritingSchema>;
export type SpeakingGenerated = z.infer<typeof SpeakingSchema>;

/** The semantic checks a generated exercise has to pass before it is shown. */
export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface GenerationOutcome {
  variant: ExerciseVariant | null;
  /** Why generation didn't produce a usable exercise, for logging. */
  reason?: string;
}

/** A model-written walkthrough of the Danish in an opgave. */
export type Explanation = z.infer<typeof ExplanationSchema>;

export interface ExplanationOutcome {
  explanation: Explanation | null;
  reason?: string;
}

/**
 * The slot a generated exercise is being written for.
 *
 * Supplied when generation is filling a numbered task rather than serving a
 * one-off exercise. It carries the two things the model cannot work out for
 * itself: how hard this position on the ladder has to be, and which tasks it
 * must not resemble. Both are what make "generate with AI" a step inside the
 * category structure rather than a separate feature that happens to produce
 * exercises.
 */
export interface GenerationSlot {
  taskNumber: number;
  totalTasks: number;
  /** The band's own name, e.g. "medium_hard". */
  difficulty: string;
  /** What that band means in terms of Danish grammar and text complexity. */
  difficultyGuidance: string;
  /** Titles of the tasks already in this ladder, for de-duplication. */
  existingTitles: string[];
}
