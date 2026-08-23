import "server-only";

import { db, unwrap, isNoRows } from "@/lib/supabase/db";
import type { Tables } from "@/lib/supabase/database.types";

// Spaced repetition and running per-construct accuracy.
//
// Both are learner-owned and go through the learner's own client, so Row Level
// Security filters them in the database.

export async function dueStates(userId: string, take: number): Promise<Tables<"SrsState">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("SrsState")
      .select("*")
      .eq("userId", userId)
      .lte("dueAt", new Date().toISOString())
      .order("dueAt", { ascending: true })
      .limit(take),
    "dueStates"
  );
}

export async function findState(
  userId: string,
  constructId: string
): Promise<Tables<"SrsState"> | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("SrsState")
    .select("*")
    .eq("userId", userId)
    .eq("constructId", constructId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findState: ${error.message}`);
  return data ?? null;
}

export async function upsertState(
  userId: string,
  constructId: string,
  state: {
    easeFactor: number;
    intervalDays: number;
    repetitions: number;
    dueAt: string;
    lastReviewedAt: string;
  }
): Promise<Tables<"SrsState">> {
  const supabase = await db();
  const existing = await findState(userId, constructId);

  const rows = unwrap(
    await supabase
      .from("SrsState")
      .upsert(
        { id: existing?.id ?? crypto.randomUUID(), userId, constructId, ...state },
        { onConflict: "userId,constructId", ignoreDuplicates: false }
      )
      .select(),
    "upsertState"
  );
  return rows[0];
}

/**
 * Adds one answer to the running accuracy for a construct and skill.
 *
 * Read-then-write rather than an atomic increment, and that is a deliberate
 * trade: this is a running average used to pick the next exercise, so losing
 * one count in a rare double-submit changes nothing a learner would notice.
 * The results that matter — attempts, scores, module status — are all written
 * atomically.
 */
export async function recordAccuracy(
  userId: string,
  constructId: string,
  skill: string,
  isCorrect: boolean
): Promise<void> {
  const supabase = await db();

  const { data: existing, error } = await supabase
    .from("ConstructAccuracy")
    .select("*")
    .eq("userId", userId)
    .eq("constructId", constructId)
    .eq("skill", skill)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] recordAccuracy: ${error.message}`);

  const now = new Date().toISOString();
  unwrap(
    await supabase
      .from("ConstructAccuracy")
      .upsert(
        {
          id: existing?.id ?? crypto.randomUUID(),
          userId,
          constructId,
          skill,
          correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
          totalCount: (existing?.totalCount ?? 0) + 1,
          lastAttemptAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,constructId,skill", ignoreDuplicates: false }
      )
      .select("id"),
    "recordAccuracy(write)"
  );
}

// ---------------------------------------------------------------------------
// Item attempts
// ---------------------------------------------------------------------------

export async function createAttempt(data: {
  userId: string;
  itemId: string;
  examSessionId: string | null;
  responseJson: string;
  isCorrect: boolean;
  timeMs: number | null;
}): Promise<Tables<"Attempt">> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("Attempt")
      .insert({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data })
      .select(),
    "createAttempt"
  );
  return rows[0];
}

export async function attemptsForExamSession(
  userId: string,
  examSessionId: string
): Promise<Tables<"Attempt">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("Attempt")
      .select("*")
      .eq("userId", userId)
      .eq("examSessionId", examSessionId),
    "attemptsForExamSession"
  );
}
