// Props and view state shared by the client components.

import type { Dictionary } from "./i18n";
import type { Explanation } from "./generation";
import type { ExerciseResponse, GradedAnswer, PublicExerciseContent } from "./exercises";
import type { ChapterStatus } from "./progress";
import type { Gloss, TextSentence } from "./learning";
import type { WordGloss } from "./content-gen";

// --- Reading -----------------------------------------------------------------

/** What the reader currently has selected in an interactive text. */
export type Focus =
  | { kind: "word"; gloss: Gloss | null; token: string; sentence: TextSentence | null }
  | { kind: "sentence"; sentence: TextSentence; index: number }
  | { kind: "paragraph"; index: number }
  | null;

/** The selection inside a seeded passage, which glosses whole paragraphs too. */
export type PassageSelection =
  | { kind: "word"; gloss: WordGloss }
  | { kind: "paragraph"; summary: string }
  | null;

export type PanelTab = "explain" | "vocabulary" | "notes";

export interface SavedWordRow {
  id: string;
  kind: string;
  danish: string;
  translation: string;
  note: string | null;
  learned: boolean;
}

export interface NoteRow {
  id: string;
  anchorKind: string;
  quote: string | null;
  body: string;
}

export interface LibraryEntryState {
  completed: boolean;
  bookmarked: boolean;
}

// --- Lessons -----------------------------------------------------------------

export interface SidebarTopic {
  title: string;
  lessonSlug: string;
  done: boolean;
  started: boolean;
}

export interface SidebarChapter {
  id: string;
  number: number;
  title: string;
  status: ChapterStatus;
  topics: SidebarTopic[];
}

/** Where the lesson leads once it is checked. Null at the end of the course. */
export interface NextStep {
  href: string;
  /** False when the next lesson is another topic inside this same chapter. */
  newChapter: boolean;
}

// --- Exercises ---------------------------------------------------------------

export interface RendererProps {
  content: PublicExerciseContent;
  response: ExerciseResponse;
  setResponse: (next: ExerciseResponse) => void;
  disabled: boolean;
  dict: Dictionary;
}

/** One past opgave, as the history list renders it. */
export interface HistoryRow {
  id: string;
  category: string;
  taskType: string;
  taskNumber: number | null;
  topic: string;
  title: string;
  score: number | null;
  total: number | null;
  mistakes: number | null;
  completedAt: string | null;
}

export type OpgaveExplainState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; explanation: Explanation }
  | { kind: "error"; noKey: boolean };

// --- Mock test ---------------------------------------------------------------

export type MockPhase = "intro" | "preparing" | "running" | "result";

export interface MockPartResult {
  attemptId: string;
  orderIndex: number;
  category: string;
  taskType: string;
  taskNumber: number | null;
  topic: string;
  title: string;
  answered: boolean;
  explainable: boolean;
  score: number | null;
  total: number | null;
  mistakes: number | null;
  answers: GradedAnswer[];
  wordCount?: number;
  minWords?: number;
}

export interface MockResult {
  reading: {
    correct: number;
    total: number;
    score: number;
    passed: boolean;
    threshold: number;
  };
  writing: { answered: boolean; wordCount: number; minWords: number | null } | null;
  parts: MockPartResult[];
}
