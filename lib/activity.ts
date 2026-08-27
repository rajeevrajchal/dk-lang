import { exercises, lessons, progress as progressRepo } from "@/lib/repositories";
import { EXAM_PASS_THRESHOLD } from "@/lib/unlock";
import type {
  ActivityEntry,
  ExerciseCategory,
  HabitDay,
  MockHistory,
  MockTestSummary,
  PracticeActivity,
  ReadingHabit,
} from "@/types";

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
const dayKey = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const buildHabit = (dates: Date[], windowDays: number): ReadingHabit => {
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
};

/**
 * Reading practice, day by day. Counts both kinds of reading work the app
 * records: modultest opgaver and the item-based adaptive drill.
 */
export const getReadingHabit = async (userId: string, windowDays = 28): Promise<ReadingHabit> => {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  since.setHours(0, 0, 0, 0);

  const [opgaver, items] = await Promise.all([
    exercises.completedReadingSince(userId, since),
    progressRepo.readingAttemptsSince(userId, since),
  ]);

  // Item attempts are single questions, so a drill session would otherwise
  // count as a dozen "sessions". One reading session per day from the drill is
  // the honest unit here; the opgave attempts are already whole exercises.
  // Timestamps arrive from PostgREST as ISO strings.
  const itemDays = new Map<string, Date>();
  for (const a of items) {
    const at = new Date(a.createdAt);
    itemDays.set(dayKey(at), at);
  }

  const dates = [
    ...opgaver.filter((a) => a.completedAt).map((a) => new Date(a.completedAt!)),
    ...itemDays.values(),
  ];

  return buildHabit(dates, windowDays);
};

// ---------------------------------------------------------------------------
// Practice activity
// ---------------------------------------------------------------------------

/**
 * How much practice the learner has done per skill. Class only — attempts that
 * belong to a mock session are a test, not practice, and are reported
 * separately.
 */
export const getPracticeActivity = async (userId: string): Promise<PracticeActivity[]> => {
  const rows = await exercises.practiceActivity(userId);

  const byCategory = new Map<string, { sessions: number; lastAt: Date | null }>();
  for (const r of rows) {
    const entry = byCategory.get(r.category) ?? { sessions: 0, lastAt: null };
    entry.sessions++;
    const at = r.completedAt ? new Date(r.completedAt) : null;
    if (at && (!entry.lastAt || at > entry.lastAt)) entry.lastAt = at;
    byCategory.set(r.category, entry);
  }

  const categories: ExerciseCategory[] = ["READING", "SPEAKING", "WRITING"];
  return categories.map((category) => ({
    category,
    sessions: byCategory.get(category)?.sessions ?? 0,
    lastAt: byCategory.get(category)?.lastAt ?? null,
  }));
};

// ---------------------------------------------------------------------------
// Mock history
// ---------------------------------------------------------------------------

const parseScores = (json: string | null): number | null => {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Record<string, number>;
    const value = parsed.READING;
    return typeof value === "number" ? value : null;
  } catch {
    return null;
  }
};

const parsePassed = (json: string | null): boolean | null => {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Record<string, boolean>;
    return typeof parsed.READING === "boolean" ? parsed.READING : null;
  } catch {
    return null;
  }
};

export const getMockHistory = async (userId: string): Promise<MockHistory> => {
  const sessions = await exercises.completedExamSessions(userId);

  const summaries: MockTestSummary[] = sessions.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    examType: s.examType,
    completedAt: s.completedAt ? new Date(s.completedAt) : null,
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
};

// ---------------------------------------------------------------------------
// Recent activity, across all three areas
// ---------------------------------------------------------------------------

export const getRecentActivity = async (userId: string, take = 12): Promise<ActivityEntry[]> => {
  const [lessonRows, practice, mocks] = await Promise.all([
    lessons.listCompleted(userId, take),
    exercises.recentCompleted(userId, {}, take),
    exercises.completedExamSessions(userId),
  ]);

  const entries: ActivityEntry[] = [
    ...lessonRows.map((l) => ({
      id: `lesson-${l.id}`,
      kind: "lesson" as const,
      at: new Date(l.updatedAt),
      lessonSlug: l.lessonSlug,
      chapterId: l.chapterId,
      score: l.score,
      total: l.total,
    })),
    ...practice.map((p) => ({
      id: `practice-${p.id}`,
      kind: "practice" as const,
      at: new Date(p.completedAt ?? p.startedAt),
      category: p.category,
      moduleId: p.moduleId,
      taskType: p.taskType,
      score: p.score,
      total: p.total,
    })),
    ...mocks.slice(0, take).map((m) => ({
      id: `mock-${m.id}`,
      kind: "mock" as const,
      at: new Date(m.completedAt ?? m.startedAt),
      moduleId: m.moduleId,
      score: null,
      total: null,
    })),
  ];

  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take);
};
