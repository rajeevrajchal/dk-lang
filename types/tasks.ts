// Numbered practice tasks.
//
// Six concepts, deliberately kept apart (see docs/task-architecture.md):
//
//   Category            Reading, Writing, Speaking, Listening
//   PracticeType        "Fill in the blanks" — a category's kind of exercise
//   Task                one numbered slot and the content in it
//   UserTaskProgress    what THIS learner has done with that task, summarised
//   Attempt             one sitting of it, never overwritten
//   Result              the grading of one attempt
//
// Mixing task content with user progress is the mistake this shape exists to
// prevent: it is what makes an attempt history impossible to add later.

import type { TASK_DIFFICULTIES } from "@/lib/tasks/catalogue";
import type { Tables } from "./database";
import type { ExerciseCategory } from "./exercises";

export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];

export type TaskRow = Tables<"Task">;
export type UserTaskProgressRow = Tables<"UserTaskProgress">;

export interface PracticeType {
  /** The engine's identifier — matches TASK_TYPES in lib/exercises/constants. */
  taskType: string;
  category: ExerciseCategory;
  /** URL segment, written the way a learner would describe the exercise. */
  slug: string;
  label: string;
  description: string;
  /** Which opgave this is in the real modultest, where it maps to one. */
  opgaveNumber?: number;
}

export type TaskStatus = "not_started" | "in_progress" | "completed";

/** One row of a task list: the slot, and what this learner has done with it. */
export interface TaskListEntry {
  taskNumber: number;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  /** Present once the slot has been materialised. */
  taskId: string | null;
  title: string | null;
  topic: string | null;
  /** Null for writing and speaking, which have no objectively correct answer. */
  bestScore: number | null;
  bestTotal: number | null;
  lastScore: number | null;
  lastTotal: number | null;
  lastMistakes: number | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  firstCompletedAt: string | null;
}

export interface TaskListSummary {
  category: ExerciseCategory;
  practiceType: PracticeType;
  moduleId: number;
  total: number;
  completed: number;
  inProgress: number;
  entries: TaskListEntry[];
  /** The lowest-numbered task that is not completed — what "continue" opens. */
  nextTaskNumber: number | null;
}

/** One past sitting of a task, for the attempt history. */
export interface TaskAttemptSummary {
  attemptId: string;
  at: string;
  score: number | null;
  total: number | null;
  mistakes: number | null;
  status: string;
}

/** Progress for one practice type, for the dashboard. */
export interface PracticeTypeProgress {
  category: ExerciseCategory;
  practiceType: PracticeType;
  completed: number;
  total: number;
  /** Share of answers correct across completed tasks; null when unscored. */
  accuracy: number | null;
}

export interface MaterialiseOutcome {
  task: TaskRow | null;
  /** Why the slot could not be filled, when it could not. */
  reason?: string;
}

/** One category's ladders, rolled up for the dashboard. */
export interface CategoryProgress {
  category: ExerciseCategory;
  label: string;
  icon: string;
  slug: string;
  types: PracticeTypeProgress[];
  completed: number;
  total: number;
}

/**
 * What the app suggests next, and the reason it is suggesting it.
 *
 * The reason is part of the type on purpose: a recommendation a learner cannot
 * interrogate is indistinguishable from a random link, and this one is always
 * derived from their own scores.
 */
export interface RecommendedTask {
  practiceType: PracticeType;
  category: ExerciseCategory;
  href: string;
  reason: string;
}
