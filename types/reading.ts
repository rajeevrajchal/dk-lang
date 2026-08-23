// The reading library: texts to read, and the on-demand explanations the
// reader builds around them.

import type {
  EXPLANATION_DEPTHS,
  EXPLANATION_SCOPES,
  ExplanationSchema,
} from "@/lib/reading/explain";
import type { READING_TOPICS } from "@/lib/reading/library";
import type { z } from "zod";
import type { LearningText, ReadingLevel } from "./learning";
import type { LessonExercise } from "./course";

export type ExplanationScope = (typeof EXPLANATION_SCOPES)[number];
export type ExplanationDepth = (typeof EXPLANATION_DEPTHS)[number];
export type ReadingTopic = (typeof READING_TOPICS)[number];

export type ReadingExplanation = z.infer<typeof ExplanationSchema>;

export interface TextScope {
  kind: ExplanationScope;
  /** Sentence index, paragraph index, or the selected string. */
  id: string;
  /** The Danish that was selected. */
  selection: string;
}

export interface ExplainRequest {
  text: LearningText;
  scope: TextScope;
  depth: ExplanationDepth;
  /** The learner's own question, when they asked one ("why is it er and not var?"). */
  question?: string;
  /** Where the learner is in the course, for pitching the answer. */
  courseChapter?: string;
  /** Official level, when they have told us. */
  learnerLevel?: string;
}

export interface ExplainOutcome {
  explanation: ReadingExplanation | null;
  reason?: string;
}

/** Identifies a cached explanation row. */
export interface ExplanationKey {
  textId: string;
  scopeKind: string;
  scopeId: string;
  level: number;
  depth: string;
}

export interface Phrase {
  /** The expression as it appears, e.g. "tager bussen". */
  danish: string;
  /** Its dictionary shape, e.g. "tage bussen". */
  lemma: string;
  english: string;
  /** Why it is worth learning whole rather than word by word. */
  note?: string;
}

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

/** The library-facing description of a text, before its body is written. */
export interface ReadingTextMeta {
  id: string;
  title: string;
  danishTitle: string;
  blurb: string;
  topics: ReadingTopic[];
  targetModules?: number[];
  phrases?: Phrase[];
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
