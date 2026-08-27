import "server-only";

import { adminDb, db, isNoRows, unwrap } from "@/lib/supabase/db";
import type {
  ExerciseAttemptRow,
  TaskAttemptSummary,
  TaskRow,
  UserTaskProgressRow,
} from "@/types";

// Numbered tasks, and what each learner has done with them.
//
// Two halves with two different owners, and the split matters:
//
//   Task              shared content. Read by the learner's client, written
//                     only by the service role — the row carries the answer
//                     key, and a learner must not be able to write one.
//   UserTaskProgress  the learner's own row, subject to RLS like everything
//                     else with a userId.

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

/** The columns that are safe to hand to a list. Never contentJson. */
const LIST_COLUMNS = "id, moduleId, category, taskType, taskNumber, difficulty, title, topic, source, createdAt";

export const findTask = async (
  moduleId: number,
  category: string,
  taskType: string,
  taskNumber: number
): Promise<TaskRow | null> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("Task")
    .select("*")
    .eq("moduleId", moduleId)
    .eq("category", category)
    .eq("taskType", taskType)
    .eq("taskNumber", taskNumber)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findTask: ${error.message}`);
  return data ?? null;
};

export const findTaskById = async (taskId: string): Promise<TaskRow | null> => {
  const supabase = await db();
  const { data, error } = await supabase.from("Task").select("*").eq("id", taskId).single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findTaskById: ${error.message}`);
  return data ?? null;
};

/**
 * Every materialised slot for one practice type.
 *
 * Without `contentJson`, which is both a size and a safety decision: the task
 * list needs the number, the title and the difficulty, and the answer key has
 * no business travelling with them.
 */
export const listTasks = async (
  moduleId: number,
  category: string,
  taskType: string
): Promise<Omit<TaskRow, "contentJson" | "variantId">[]> => {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("Task")
      .select(LIST_COLUMNS)
      .eq("moduleId", moduleId)
      .eq("category", category)
      .eq("taskType", taskType)
      .order("taskNumber", { ascending: true }),
    "listTasks"
  );
};

/** Which content ids are already in use here, so materialisation cannot repeat one. */
export const usedVariantIds = async (
  moduleId: number,
  category: string,
  taskType: string
): Promise<Set<string>> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("Task")
      .select("variantId")
      .eq("moduleId", moduleId)
      .eq("category", category)
      .eq("taskType", taskType),
    "usedVariantIds"
  );
  return new Set(rows.map((r) => r.variantId));
};

/**
 * Writes a materialised slot.
 *
 * Through the service role, because RLS makes Task read-only to a learner —
 * the row holds the answer key. The unique index on the slot is what settles
 * a race: two learners opening Task 14 at the same moment both try to insert,
 * one wins, and the loser's conflict is not an error but the signal to re-read
 * the row the winner wrote. Both then see the same task, which is the whole
 * point of a numbered slot.
 */
export const createTask = async (data: {
  moduleId: number;
  category: string;
  taskType: string;
  taskNumber: number;
  difficulty: string;
  variantId: string;
  contentJson: string;
  source: string;
  topic: string;
  title: string;
}): Promise<TaskRow> => {
  const supabase = adminDb();
  const { data: rows, error } = await supabase
    .from("Task")
    .insert({ id: crypto.randomUUID(), ...data })
    .select();

  if (error) {
    // 23505 is a unique violation: somebody else filled this slot first.
    const existing = await findTask(
      data.moduleId,
      data.category,
      data.taskType,
      data.taskNumber
    );
    if (existing) return existing;
    throw new Error(`[supabase] createTask: ${error.message}`);
  }
  return rows[0];
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export const listProgress = async (
  userId: string,
  taskIds: string[]
): Promise<UserTaskProgressRow[]> => {
  if (taskIds.length === 0) return [];
  const supabase = await db();
  return unwrap(
    await supabase
      .from("UserTaskProgress")
      .select("*")
      .eq("userId", userId)
      .in("taskId", taskIds),
    "listTaskProgress"
  );
};

export const findProgress = async (
  userId: string,
  taskId: string
): Promise<UserTaskProgressRow | null> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("UserTaskProgress")
    .select("*")
    .eq("userId", userId)
    .eq("taskId", taskId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findProgress: ${error.message}`);
  return data ?? null;
};

/** Every progress row this learner has, for the dashboard's per-category totals. */
export const allProgress = async (userId: string): Promise<UserTaskProgressRow[]> => {
  const supabase = await db();
  return unwrap(
    await supabase.from("UserTaskProgress").select("*").eq("userId", userId),
    "allTaskProgress"
  );
};

/**
 * Marks a task as opened.
 *
 * IN_PROGRESS only when there is nothing there yet: reopening a task that has
 * already been completed must not demote it, because a learner browsing their
 * own results would otherwise un-complete everything they looked at.
 */
export const markOpened = async (userId: string, taskId: string): Promise<void> => {
  const supabase = await db();
  const now = new Date().toISOString();
  const existing = await findProgress(userId, taskId);
  if (existing) return;

  unwrap(
    await supabase
      .from("UserTaskProgress")
      .upsert(
        {
          id: crypto.randomUUID(),
          userId,
          taskId,
          status: "IN_PROGRESS",
          attemptCount: 0,
          lastAttemptAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,taskId" }
      )
      .select("id"),
    "markOpened"
  );
};

/**
 * Records a completed sitting.
 *
 * `bestScore` and `lastScore` are both kept, and neither replaces the attempt
 * rows behind them. They answer different questions — "how well can I do
 * this?" and "how am I doing now?" — and a task list that showed only the best
 * would hide a learner getting worse.
 */
export const recordCompletion = async (
  userId: string,
  taskId: string,
  result: { score: number | null; total: number | null; mistakes: number | null }
): Promise<void> => {
  const supabase = await db();
  const now = new Date().toISOString();
  const existing = await findProgress(userId, taskId);

  const isBetter =
    result.score !== null &&
    (existing?.bestScore == null || result.score > existing.bestScore);

  unwrap(
    await supabase
      .from("UserTaskProgress")
      .upsert(
        {
          id: existing?.id ?? crypto.randomUUID(),
          userId,
          taskId,
          status: "COMPLETED",
          attemptCount: (existing?.attemptCount ?? 0) + 1,
          bestScore: isBetter ? result.score : (existing?.bestScore ?? result.score),
          bestTotal: isBetter ? result.total : (existing?.bestTotal ?? result.total),
          lastScore: result.score,
          lastTotal: result.total,
          lastMistakes: result.mistakes,
          firstCompletedAt: existing?.firstCompletedAt ?? now,
          lastAttemptAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,taskId" }
      )
      .select("id"),
    "recordCompletion"
  );
};

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

/** Every sitting of one task, newest first. Attempts are never overwritten. */
export const attemptsForTask = async (
  userId: string,
  taskId: string
): Promise<TaskAttemptSummary[]> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExerciseAttempt")
      .select("id, startedAt, completedAt, score, total, mistakes, status")
      .eq("userId", userId)
      .eq("taskId", taskId)
      .order("startedAt", { ascending: false }),
    "attemptsForTask"
  ) as Pick<
    ExerciseAttemptRow,
    "id" | "startedAt" | "completedAt" | "score" | "total" | "mistakes" | "status"
  >[];

  return rows.map((r) => ({
    attemptId: r.id,
    at: r.completedAt ?? r.startedAt,
    score: r.score,
    total: r.total,
    mistakes: r.mistakes,
    status: r.status,
  }));
};

/** The most recent completed sitting, which is what "previous result" shows. */
export const latestCompletedAttempt = async (
  userId: string,
  taskId: string
): Promise<ExerciseAttemptRow | null> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExerciseAttempt")
      .select("*")
      .eq("userId", userId)
      .eq("taskId", taskId)
      .eq("status", "COMPLETED")
      .order("completedAt", { ascending: false })
      .limit(1),
    "latestCompletedAttempt"
  );
  return rows[0] ?? null;
};
