import { prisma } from "@/lib/db";
import { EXAM_PASS_THRESHOLD } from "@/lib/unlock";
import type { ExerciseCategory } from "@/lib/exercises/types";

// Activity and habit, read from the tables that already record it.
//
// No new tracking architecture: a reading session is an ExerciseAttempt with
// category READING (or an item-based Attempt on a READING item), a mock test
// is an ExamSession, and a lesson is a LessonProgress row. Everything below is
// aggregation over those, so nothing has to be double-written and no counter
// can drift away from the events it counts.

// ---------------------------------------------------------------------------
// Daily habit
// ---------------------------------------------------------------------------

/** Local-time YYYY-MM-DD, so "today" means the learner's today. */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

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

function buildHabit(dates: Date[], windowDays: number): ReadingHabit {
  const counts = new Map<string, number>();
  for (const d of dates) counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);

  const today = new Date();
  const todayKey = dayKey(today);

  const days: HabitDay[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    const sessions = counts.get(key) ?? 0;
    days.push({
      date: key,
      weekday: (d.getDay() + 6) % 7,
      sessions,
      active: sessions > 0,
      isToday: key === todayKey,
    });
  }

  // Streaks are computed over the window that was asked for. A day with no
  // session breaks it; today not being done yet does not, because the day is
  // not over.
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.active ? run + 1 : 0;
    if (run > longest) longest = run;
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i];
    if (d.active) current++;
    else if (d.isToday) continue; // today is still open
    else break;
  }

  return {
    days,
    currentStreak: current,
    longestStreak: longest,
    totalSessions: dates.length,
    activeDays: [...counts.values()].filter((n) => n > 0).length,
  };
}

/**
 * Reading practice, day by day. Counts both kinds of reading work the app
 * records: modultest opgaver and the item-based adaptive drill.
 */
export async function getReadingHabit(userId: string, windowDays = 28): Promise<ReadingHabit> {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  since.setHours(0, 0, 0, 0);

  const [opgaver, items] = await Promise.all([
    prisma.exerciseAttempt.findMany({
      where: {
        userId,
        category: "READING",
        status: "COMPLETED",
        completedAt: { gte: since },
      },
      select: { completedAt: true },
    }),
    prisma.attempt.findMany({
      where: { userId, createdAt: { gte: since }, item: { skill: "READING" } },
      select: { createdAt: true },
    }),
  ]);

  // Item attempts are single questions, so a drill session would otherwise
  // count as a dozen "sessions". One reading session per day from the drill is
  // the honest unit here; the opgave attempts are already whole exercises.
  const itemDays = new Map<string, Date>();
  for (const a of items) itemDays.set(dayKey(a.createdAt), a.createdAt);

  const dates = [
    ...opgaver.map((a) => a.completedAt!).filter(Boolean),
    ...itemDays.values(),
  ];

  return buildHabit(dates, windowDays);
}

// ---------------------------------------------------------------------------
// Practice activity
// ---------------------------------------------------------------------------

export interface PracticeActivity {
  category: ExerciseCategory;
  sessions: number;
  lastAt: Date | null;
}

/**
 * How much practice the learner has done per skill. Class only — attempts that
 * belong to a mock session are a test, not practice, and are reported
 * separately.
 */
export async function getPracticeActivity(userId: string): Promise<PracticeActivity[]> {
  const rows = await prisma.exerciseAttempt.findMany({
    where: { userId, status: "COMPLETED", examSessionId: null },
    select: { category: true, completedAt: true },
  });

  const byCategory = new Map<string, { sessions: number; lastAt: Date | null }>();
  for (const r of rows) {
    const entry = byCategory.get(r.category) ?? { sessions: 0, lastAt: null };
    entry.sessions++;
    if (r.completedAt && (!entry.lastAt || r.completedAt > entry.lastAt)) {
      entry.lastAt = r.completedAt;
    }
    byCategory.set(r.category, entry);
  }

  const categories: ExerciseCategory[] = ["READING", "SPEAKING", "WRITING"];
  return categories.map((category) => ({
    category,
    sessions: byCategory.get(category)?.sessions ?? 0,
    lastAt: byCategory.get(category)?.lastAt ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Mock history
// ---------------------------------------------------------------------------

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

function parseScores(json: string | null): number | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Record<string, number>;
    const value = parsed.READING;
    return typeof value === "number" ? value : null;
  } catch {
    return null;
  }
}

function parsePassed(json: string | null): boolean | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Record<string, boolean>;
    return typeof parsed.READING === "boolean" ? parsed.READING : null;
  } catch {
    return null;
  }
}

export async function getMockHistory(userId: string): Promise<MockHistory> {
  const sessions = await prisma.examSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
  });

  const summaries: MockTestSummary[] = sessions.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    examType: s.examType,
    completedAt: s.completedAt,
    readingScore: parseScores(s.scoresJson),
    passed: parsePassed(s.passedJson),
  }));

  const scored = summaries.filter((s) => s.readingScore != null);
  const best = scored.length
    ? scored.reduce((b, s) => ((s.readingScore ?? 0) > (b.readingScore ?? 0) ? s : b))
    : null;

  return {
    completed: summaries.length,
    latest: summaries[0] ?? null,
    best,
    recent: summaries.slice(0, 5),
    threshold: EXAM_PASS_THRESHOLD,
  };
}

// ---------------------------------------------------------------------------
// Recent activity, across all three areas
// ---------------------------------------------------------------------------

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

export async function getRecentActivity(userId: string, take = 12): Promise<ActivityEntry[]> {
  const [lessons, practice, mocks] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take,
    }),
    prisma.exerciseAttempt.findMany({
      where: { userId, status: "COMPLETED", examSessionId: null },
      orderBy: { completedAt: "desc" },
      take,
    }),
    prisma.examSession.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take,
    }),
  ]);

  const entries: ActivityEntry[] = [
    ...lessons.map((l) => ({
      id: `lesson-${l.id}`,
      kind: "lesson" as const,
      at: l.updatedAt,
      lessonSlug: l.lessonSlug,
      chapterId: l.chapterId,
      score: l.score,
      total: l.total,
    })),
    ...practice.map((p) => ({
      id: `practice-${p.id}`,
      kind: "practice" as const,
      at: p.completedAt ?? p.startedAt,
      category: p.category,
      moduleId: p.moduleId,
      taskType: p.taskType,
      score: p.score,
      total: p.total,
    })),
    ...mocks.map((m) => ({
      id: `mock-${m.id}`,
      kind: "mock" as const,
      at: m.completedAt ?? m.startedAt,
      moduleId: m.moduleId,
      score: null,
      total: null,
    })),
  ];

  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take);
}
