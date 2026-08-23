// What the dashboard shows: the learner's standing, per skill and overall.

import type {
  ActivityEntry,
  MockHistory,
  PracticeActivity,
  ReadingHabit,
} from "./activity";
import type { Tables } from "./database";
import type { Skill } from "./enums";
import type { UserLevel } from "./level";
import type { ModuleDashboardState, ResumePoint } from "./progress";

export interface SkillStatus {
  skill: Skill;
  label: string;
  hasContent: boolean;
  accuracy: number | null;
  attemptCount: number;
  currentTier: number | null;
  weakestConstruct: { name: string; accuracy: number } | null;
}

export interface RecentActivityRow {
  id: string;
  createdAt: Date;
  isCorrect: boolean;
  skill: string;
  moduleId: number;
  tierId: number;
  examSessionId: string | null;
}

export interface DashboardData {
  currentModuleId: number;
  moduleStates: ModuleDashboardState[];
  skillStatuses: SkillStatus[];
  recentActivity: RecentActivityRow[];
  nextAction: { label: string; href: string };
  verifiedReportCards: Tables<"ReportCard">[];
}

/**
 * What "Continue where you left off" should point at. Carries raw facts, not
 * sentences — the Dashboard turns `kind` and `category` into words with the
 * dictionary, so this stays locale-free.
 */
export interface ContinueCard {
  kind: "lesson" | "practice" | "mock" | "onboarding";
  /** Lesson title for a lesson; empty for cards the dictionary titles itself. */
  title: string;
  detail?: string;
  href: string;
  category?: string;
  moduleId?: number;
}

export interface LearnerOverview {
  level: UserLevel;
  levelLabel: string | null;
  lessons: {
    completed: number;
    total: number;
    ratio: number;
    chaptersComplete: number;
    chaptersTotal: number;
    currentChapterTitle: string | null;
    resume: (ResumePoint & { lessonTitle: string; chapterTitle: string }) | null;
  };
  readingHabit: ReadingHabit;
  practice: PracticeActivity[];
  mock: MockHistory;
  recent: ActivityEntry[];
  continueCard: ContinueCard;
}
