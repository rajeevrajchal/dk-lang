import "server-only";

import { db, unwrap } from "@/lib/supabase/db";
import { VERBS, VERB_BY_ID, isStruggling } from "@/lib/verbs";
import type { VerbProgressRow, VerbStats, VerbWithProgress } from "@/types";

// This learner's history with the verb collection.
//
// The verbs themselves are code (lib/verbs/data.ts); only progress is stored,
// keyed by the infinitive. So the join happens here, in memory, over 500 rows
// — which is cheaper than any query would be and means a learner who has
// practised nothing still gets a complete list.

export const listProgress = async (userId: string): Promise<VerbProgressRow[]> => {
  const supabase = await db();
  return unwrap(
    await supabase.from("VerbProgress").select("*").eq("userId", userId),
    "listVerbProgress"
  );
};

/** Every verb, joined to what this learner has done with it. */
export const withProgress = async (userId: string): Promise<VerbWithProgress[]> => {
  const rows = await listProgress(userId);
  const byId = new Map(rows.map((r) => [r.verbId, r]));

  return VERBS.map((verb) => {
    const p = byId.get(verb.infinitive);
    return {
      verb,
      learned: p?.learned ?? false,
      correctCount: p?.correctCount ?? 0,
      wrongCount: p?.wrongCount ?? 0,
      streak: p?.streak ?? 0,
      lastPracticedAt: p?.lastPracticedAt ?? null,
      struggling: isStruggling(p?.correctCount ?? 0, p?.wrongCount ?? 0),
    };
  });
};

export const stats = async (userId: string): Promise<VerbStats> => {
  const rows = await listProgress(userId);
  const now = Date.now();
  return {
    total: VERBS.length,
    learned: rows.filter((r) => r.learned).length,
    practised: rows.filter((r) => r.correctCount + r.wrongCount > 0).length,
    struggling: rows.filter((r) => isStruggling(r.correctCount, r.wrongCount)).length,
    dueNow: rows.filter((r) => r.dueAt !== null && new Date(r.dueAt).getTime() <= now).length,
  };
};

/** The learner's own "I know this" mark. Never set by the practice engine. */
export const setLearned = async (
  userId: string,
  verbId: string,
  learned: boolean
): Promise<void> => {
  if (!VERB_BY_ID.has(verbId)) throw new Error(`unknown verb: ${verbId}`);
  const supabase = await db();
  const now = new Date().toISOString();

  // The existing row is looked up first so its id can be reused.
  //
  // An upsert sets every column it is given, including `id` — so passing a
  // fresh uuid would rewrite the primary key of an existing row on every
  // click of "mark learned". `createdAt` is left out for the same reason:
  // the column has a default, so omitting it means the insert gets one and
  // the conflict path leaves the original alone.
  const existing = (
    await supabase
      .from("VerbProgress")
      .select("id")
      .eq("userId", userId)
      .eq("verbId", verbId)
      .limit(1)
  ).data?.[0];

  unwrap(
    await supabase
      .from("VerbProgress")
      .upsert(
        {
          id: existing?.id ?? crypto.randomUUID(),
          userId,
          verbId,
          learned,
          updatedAt: now,
        },
        { onConflict: "userId,verbId" }
      )
      .select("id"),
    "setLearned"
  );
};

/**
 * SM-2-shaped review scheduling, matching SrsState's fields so the two mean the
 * same thing. Deliberately gentle at the start: a verb answered correctly once
 * comes back tomorrow, not in six days, because one right answer on a
 * multiple-choice question is weak evidence.
 */
const nextInterval = (streak: number, easeFactor: number): number => {
  if (streak <= 1) return 1;
  if (streak === 2) return 3;
  return Math.min(Math.round((streak - 1) * easeFactor * 2), 120);
};

export const recordResult = async (
  userId: string,
  verbId: string,
  isCorrect: boolean
): Promise<void> => {
  if (!VERB_BY_ID.has(verbId)) return;
  const supabase = await db();
  const now = new Date();
  const nowIso = now.toISOString();

  const existing = (
    await supabase
      .from("VerbProgress")
      .select("*")
      .eq("userId", userId)
      .eq("verbId", verbId)
      .limit(1)
  ).data?.[0];

  const streak = isCorrect ? (existing?.streak ?? 0) + 1 : 0;
  const ease = Math.max(
    1.3,
    (existing?.easeFactor ?? 2.5) + (isCorrect ? 0.1 : -0.25)
  );
  const intervalDays = isCorrect ? nextInterval(streak, ease) : 0;
  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

  unwrap(
    await supabase
      .from("VerbProgress")
      .upsert(
        {
          id: existing?.id ?? crypto.randomUUID(),
          userId,
          verbId,
          learned: existing?.learned ?? false,
          correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
          wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
          streak,
          easeFactor: ease,
          intervalDays,
          dueAt,
          lastPracticedAt: nowIso,
          createdAt: existing?.createdAt ?? nowIso,
          updatedAt: nowIso,
        },
        { onConflict: "userId,verbId" }
      )
      .select("id"),
    "recordVerbResult"
  );
};
