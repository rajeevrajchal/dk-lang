// Learning history and mistake review.
//
// The learner-facing question these answer is not "what did I score" — that is
// what ExerciseAttempt records — but "what did I get wrong, why, and am I
// getting better at it".

import type { Tables } from "./database";
import type { HISTORY_SOURCES } from "@/lib/learning/history";

export type HistorySource = (typeof HISTORY_SOURCES)[number];

export type QuestionEventRow = Tables<"QuestionEvent">;
export type MistakeRow = Tables<"MistakeRecord">;
export type VerbProgressRow = Tables<"VerbProgress">;

/**
 * One graded answer, on its way into the history.
 *
 * The snapshot fields (`danishText`, `passageText`) are carried rather than
 * referenced because the exercise may have been generated for a single attempt
 * and will not exist to look up later. History that cannot be read is not
 * history.
 */
export interface RecordedAnswer {
  source: HistorySource;
  questionKey: string;
  questionText: string;
  correctAnswer: string;
  isCorrect: boolean;
  userAnswer?: string | null;
  explanation?: string | null;
  danishText?: string | null;
  passageLabel?: string | null;
  passageText?: string | null;
  attemptId?: string | null;
  examSessionId?: string | null;
  moduleId?: number | null;
  category?: string | null;
  taskType?: string | null;
  topic?: string | null;
  grammarTopic?: string | null;
}

export interface HistoryQuery {
  source?: HistorySource;
  category?: string;
  moduleId?: number;
  attemptId?: string;
  onlyWrong?: boolean;
  limit?: number;
}

export interface MistakeQuery {
  source?: HistorySource;
  category?: string;
  status?: "open" | "resolved" | "all";
  limit?: number;
}

/**
 * A reading test, its paragraphs, and the questions under each.
 *
 * The nesting is the point: a reading question without its paragraph is
 * unreviewable, so the history preserves Test → Paragraph → Question rather
 * than flattening to a list of questions.
 */
export interface HistoryQuestion {
  id: string;
  questionText: string;
  danishText: string | null;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  grammarTopic: string | null;
  attemptNumber: number;
  createdAt: string;
}

export interface HistoryPassage {
  label: string | null;
  text: string | null;
  questions: HistoryQuestion[];
}

export interface HistorySession {
  attemptId: string | null;
  source: HistorySource;
  title: string;
  category: string | null;
  taskType: string | null;
  moduleId: number | null;
  topic: string | null;
  at: string;
  correct: number;
  total: number;
  passages: HistoryPassage[];
}

/**
 * A pattern in the learner's own mistakes.
 *
 * Every field here is computed from QuestionEvent/MistakeRecord rows. Nothing
 * is hardcoded: the app says "you frequently make mistakes with word order"
 * only when the rows say so.
 */
export interface LearningInsight {
  kind: "topic" | "taskType" | "verb" | "streak";
  /** What the pattern is about, in the app's own vocabulary. */
  key: string;
  /** One sentence, in English, describing what the data shows. */
  message: string;
  /** How many mistakes support it — shown, so the claim is checkable. */
  evidence: number;
  /** Where to go and work on it. */
  href?: string;
}

/** Where one graded answer came from, in the Danish text. */
export interface AnswerContext {
  questionText: string;
  danishText: string | null;
  passageLabel: string | null;
  passageText: string | null;
}
