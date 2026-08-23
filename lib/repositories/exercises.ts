import "server-only";

import { db, unwrap, isNoRows } from "@/lib/supabase/db";
import type { Inserts, Tables, Updates } from "@/lib/supabase/database.types";

// Modultest exercises ("opgaver") and the mock-test sessions they belong to.
//
// An ExerciseAttempt with an examSessionId is part of a timed mock test; one
// without is Class practice. That single field is what distinguishes the two
// modes throughout the app — see lib/exercises/mode.ts — so it is never
// derived twice.

export interface HistoryFilter {
  moduleId?: number;
  category?: string;
}

type AttemptRow = Tables<"ExerciseAttempt">;

/** Completed attempts, for the selector's "don't repeat this" rotation. */
export async function completedHistory(
  userId: string,
  filter: HistoryFilter = {}
): Promise<Pick<AttemptRow, "variantId" | "taskType" | "topic" | "completedAt">[]> {
  const supabase = await db();
  let query = supabase
    .from("ExerciseAttempt")
    .select("variantId, taskType, topic, completedAt")
    .eq("userId", userId)
    .eq("status", "COMPLETED")
    .order("completedAt", { ascending: true });

  if (filter.moduleId) query = query.eq("moduleId", filter.moduleId);
  if (filter.category) query = query.eq("category", filter.category);

  return unwrap(await query, "completedHistory");
}

export async function recentCompleted(
  userId: string,
  filter: HistoryFilter = {},
  take = 30
): Promise<AttemptRow[]> {
  const supabase = await db();
  let query = supabase
    .from("ExerciseAttempt")
    .select("*")
    .eq("userId", userId)
    .eq("status", "COMPLETED")
    .order("completedAt", { ascending: false })
    .limit(take);

  if (filter.moduleId) query = query.eq("moduleId", filter.moduleId);
  if (filter.category) query = query.eq("category", filter.category);

  return unwrap(await query, "recentCompleted");
}

export async function findAttempt(userId: string, attemptId: string): Promise<AttemptRow | null> {
  const supabase = await db();
  // The userId filter is redundant under RLS and kept deliberately: an attempt
  // id alone must not be enough to read somebody else's answers, and saying so
  // here means the guarantee survives a policy being changed.
  const { data, error } = await supabase
    .from("ExerciseAttempt")
    .select("*")
    .eq("id", attemptId)
    .eq("userId", userId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findAttempt: ${error.message}`);
  return data ?? null;
}

export async function createAttempt(data: Inserts<"ExerciseAttempt">): Promise<AttemptRow> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExerciseAttempt")
      .insert({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), ...data })
      .select(),
    "createAttempt"
  );
  return rows[0];
}

export async function updateAttempt(
  userId: string,
  attemptId: string,
  data: Updates<"ExerciseAttempt">
): Promise<AttemptRow | null> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExerciseAttempt")
      .update(data)
      .eq("id", attemptId)
      .eq("userId", userId)
      .select(),
    "updateAttempt"
  );
  return rows[0] ?? null;
}

/** Class practice only — a mock attempt is a test, not practice. */
export async function practiceActivity(
  userId: string
): Promise<Pick<AttemptRow, "category" | "completedAt">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("ExerciseAttempt")
      .select("category, completedAt")
      .eq("userId", userId)
      .eq("status", "COMPLETED")
      .is("examSessionId", null),
    "practiceActivity"
  );
}

export async function completedReadingSince(
  userId: string,
  since: Date
): Promise<Pick<AttemptRow, "completedAt">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("ExerciseAttempt")
      .select("completedAt")
      .eq("userId", userId)
      .eq("category", "READING")
      .eq("status", "COMPLETED")
      .gte("completedAt", since.toISOString()),
    "completedReadingSince"
  );
}

// ---------------------------------------------------------------------------
// Mock test sessions
// ---------------------------------------------------------------------------

export interface ExamSessionWithAttempts extends Tables<"ExamSession"> {
  exerciseAttempts: AttemptRow[];
}

export async function findExamSession(
  userId: string,
  sessionId: string
): Promise<ExamSessionWithAttempts | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("ExamSession")
    .select("*")
    .eq("id", sessionId)
    .eq("userId", userId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findExamSession: ${error.message}`);
  if (!data) return null;

  // Fetched separately rather than as a PostgREST embed. The embed syntax
  // depends on the foreign key being named the way PostgREST expects, which
  // couples the query to a schema detail; two plain queries do not.
  const attempts = unwrap(
    await supabase
      .from("ExerciseAttempt")
      .select("*")
      .eq("examSessionId", sessionId)
      .order("orderIndex", { ascending: true }),
    "findExamSession(attempts)"
  );

  return { ...data, exerciseAttempts: attempts };
}

export async function createExamSession(
  data: Inserts<"ExamSession">
): Promise<Tables<"ExamSession">> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExamSession")
      .insert({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), ...data })
      .select(),
    "createExamSession"
  );
  return rows[0];
}

export async function completeExamSession(
  userId: string,
  sessionId: string,
  data: { scoresJson: string; passedJson: string }
): Promise<Tables<"ExamSession"> | null> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ExamSession")
      .update({ status: "COMPLETED", completedAt: new Date().toISOString(), ...data })
      .eq("id", sessionId)
      .eq("userId", userId)
      .select(),
    "completeExamSession"
  );
  return rows[0] ?? null;
}

export async function completedExamSessions(userId: string): Promise<Tables<"ExamSession">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("ExamSession")
      .select("*")
      .eq("userId", userId)
      .eq("status", "COMPLETED")
      .order("completedAt", { ascending: false }),
    "completedExamSessions"
  );
}
