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
