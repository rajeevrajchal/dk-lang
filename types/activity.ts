// What the learner has actually been doing, rolled up for the dashboard.

import type { ExerciseCategory } from "./exercises";

export interface HabitDay {
  date: string; // YYYY-MM-DD
  /** 0 (Mon) .. 6 (Sun) — the week starts on Monday here, as in Denmark. */
  weekday: number;
  sessions: number;
  active: boolean;
  isToday: boolean;
}

export interface ReadingHabit {
  days: HabitDay[];
  /** Consecutive active days ending today (or yesterday, if today is young). */
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  activeDays: number;
}

export interface PracticeActivity {
  category: ExerciseCategory;
  sessions: number;
  lastAt: Date | null;
}

export interface MockTestSummary {
  id: string;
  moduleId: number;
  examType: string;
  completedAt: Date | null;
  /** Reading is the only discipline these tests score objectively. */
  readingScore: number | null;
  passed: boolean | null;
}

export interface MockHistory {
  completed: number;
  latest: MockTestSummary | null;
  best: MockTestSummary | null;
  recent: MockTestSummary[];
  threshold: number;
}

export interface ActivityEntry {
  id: string;
  kind: "lesson" | "practice" | "mock";
  at: Date;
  /** Filled in by the caller's dictionary; raw fields only here. */
  category?: string;
  moduleId?: number;
  taskType?: string;
  lessonSlug?: string;
  chapterId?: string | null;
  score?: number | null;
  total?: number | null;
}
