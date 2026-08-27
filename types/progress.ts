// Where a learner is: through the course, and through the PD3 modules.

import type { LESSON_STATUSES } from "@/lib/curriculum/progress";
import type { CourseChapter } from "./course";
import type { Skill, Topic } from "./enums";

export type LessonStatus = (typeof LESSON_STATUSES)[number];

export interface LessonResult {
  lessonSlug: string;
  /** Correct out of the auto-checkable exercises. Null if none were checkable. */
  score: number | null;
  total: number | null;
  completedAt: string;
  status?: LessonStatus;
  /** When the learner last had this lesson open — what resuming is based on. */
  lastVisitedAt?: string | null;
}

export type ProgressMap = Record<string, LessonResult>;

/**
 * Every chapter is open, always.
 *
 * `prerequisites` still says what a chapter is built on — that is real, and
 * `missingPrerequisites` reports it — but it is a recommendation, not a gate.
 * A learner who wants to look ahead, or go back to Chapter 2 after finishing
 * Chapter 9, is doing something reasonable and should not be stopped.
 */
export type ChapterStatus = "available" | "in_progress" | "complete";

export interface ResumePoint {
  chapter: CourseChapter;
  lessonSlug: string;
  /** True when this is somewhere they left off rather than the next new thing. */
  resumed: boolean;
}

export interface ExerciseCheck {
  id: string;
  /** Null when the exercise has no single right answer — the learner judges. */
  correct: boolean | null;
  expected?: string;
  explanation?: string;
}

export interface TierDef {
  id: number;
  name: string;
  description: string;
}

export interface ModuleDef {
  id: number;
  slug: string;
  name: string;
  cefrGoal: string;
  description: string;
  isFinalExam: boolean;
  isOralOnly: boolean;
  order: number;
  topics: Topic[];
  tiersSpanned: number[];
}

export interface DisciplineStatus {
  skill: Skill;
  inAppPassed: boolean;
  inAppScore: number | null;
  officialPassed: boolean | null; // null = no verified record
  discrepancy: boolean;
  discrepancyNote: string | null;
}

export interface ModuleDashboardState {
  moduleId: number;
  name: string;
  isFinalExam: boolean;
  isOralOnly: boolean;
  practiceUnlocked: boolean;
  disciplines: DisciplineStatus[];
  inAppFullyPassed: boolean; // all required disciplines passed in-app
  officiallyFullyPassed: boolean | null; // null if not fully verified yet
}
