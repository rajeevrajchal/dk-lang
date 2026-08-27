import "server-only";

import { db, isNoRows, unwrap } from "@/lib/supabase/db";
import type {
  HistoryQuery,
  MistakeQuery,
  MistakeRow,
  QuestionEventRow,
  RecordedAnswer,
} from "@/types";

// Learning history and mistake tracking.
//
// Two tables, one write path. `recordAnswers` below is the ONLY place either
// is written, which is what stops the log and the aggregate disagreeing — the
// classic failure of a "mistakes" table maintained alongside an events table
// by two different callers.

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/** How many times this learner has answered each of these questions before. */
const priorAttempts = async (
  userId: string,
  questionKeys: string[]
): Promise<Map<string, number>> => {
  if (questionKeys.length === 0) return new Map();
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("QuestionEvent")
      .select("questionKey")
      .eq("userId", userId)
      .in("questionKey", questionKeys),
    "priorAttempts"
  );
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.questionKey, (counts.get(r.questionKey) ?? 0) + 1);
  return counts;
};

/**
 * Records a batch of graded answers: appends the events, then brings the
 * mistake aggregate in line with them.
 *
 * Idempotency is the caller's job, not this function's — /submit refuses to
 * re-grade a completed attempt, so a double submit never reaches here. Writing
 * a guard in both places would mean two definitions of "already done".
 */
export const recordAnswers = async (
  userId: string,
  answers: RecordedAnswer[]
): Promise<void> => {
  if (answers.length === 0) return;
  const supabase = await db();
  const now = new Date().toISOString();

  const attemptCounts = await priorAttempts(
    userId,
    answers.map((a) => a.questionKey)
  );

  unwrap(
    await supabase
      .from("QuestionEvent")
      .insert(
        answers.map((a) => ({
          id: crypto.randomUUID(),
          userId,
          source: a.source,
          questionKey: a.questionKey,
          attemptId: a.attemptId ?? null,
          examSessionId: a.examSessionId ?? null,
          moduleId: a.moduleId ?? null,
          category: a.category ?? null,
          taskType: a.taskType ?? null,
          topic: a.topic ?? null,
          grammarTopic: a.grammarTopic ?? null,
          questionText: a.questionText,
          danishText: a.danishText ?? null,
          passageLabel: a.passageLabel ?? null,
          passageText: a.passageText ?? null,
          userAnswer: a.userAnswer ?? null,
          correctAnswer: a.correctAnswer,
          isCorrect: a.isCorrect,
          explanation: a.explanation ?? null,
          attemptNumber: (attemptCounts.get(a.questionKey) ?? 0) + 1,
          createdAt: now,
        }))
      )
      .select("id"),
    "recordAnswers(events)"
  );

  await Promise.all(answers.map((a) => upsertMistake(userId, a, now)));
};

/**
 * One answer's effect on the mistake aggregate.
 *
 * A wrong answer opens or reopens a mistake; a right one closes it but does not
 * delete it. Deleting would lose the fact that it was ever hard, which is the
 * only way the app can say "you used to get this wrong and now you don't".
 */
const upsertMistake = async (
  userId: string,
  a: RecordedAnswer,
  now: string
): Promise<void> => {
  const supabase = await db();
  const { data: existing, error } = await supabase
    .from("MistakeRecord")
    .select("*")
    .eq("userId", userId)
    .eq("questionKey", a.questionKey)
    .single();
  if (error && !isNoRows(error)) {
    throw new Error(`[supabase] upsertMistake: ${error.message}`);
  }

  if (!existing) {
    // A first-time correct answer is not a mistake and gets no row: the table
    // is a list of things to work on, not a second copy of the event log.
    if (a.isCorrect) return;
    unwrap(
      await supabase
        .from("MistakeRecord")
        .insert({
          id: crypto.randomUUID(),
          userId,
          questionKey: a.questionKey,
          source: a.source,
          moduleId: a.moduleId ?? null,
          category: a.category ?? null,
          taskType: a.taskType ?? null,
          topic: a.topic ?? null,
          grammarTopic: a.grammarTopic ?? null,
          questionText: a.questionText,
          danishText: a.danishText ?? null,
          passageLabel: a.passageLabel ?? null,
          passageText: a.passageText ?? null,
          lastWrongAnswer: a.userAnswer ?? null,
          correctAnswer: a.correctAnswer,
          explanation: a.explanation ?? null,
          attemptId: a.attemptId ?? null,
          timesWrong: 1,
          timesRight: 0,
          lastWrongAt: now,
          lastSeenAt: now,
          resolvedAt: null,
          updatedAt: now,
        })
        .select("id"),
      "upsertMistake(insert)"
    );
    return;
  }

  unwrap(
    await supabase
      .from("MistakeRecord")
      .update(
        a.isCorrect
          ? {
              timesRight: existing.timesRight + 1,
              lastSeenAt: now,
              // Only the FIRST correct answer since the mistake sets this, so
              // "when did it click" keeps meaning that.
              resolvedAt: existing.resolvedAt ?? now,
              updatedAt: now,
            }
          : {
              timesWrong: existing.timesWrong + 1,
              lastWrongAt: now,
              lastSeenAt: now,
              lastWrongAnswer: a.userAnswer ?? null,
              // Wrong again: it is open again.
              resolvedAt: null,
              explanation: a.explanation ?? existing.explanation,
              attemptId: a.attemptId ?? existing.attemptId,
              updatedAt: now,
            }
      )
      .eq("id", existing.id)
      .select("id"),
    "upsertMistake(update)"
  );
};

/**
 * Replaces the explanation on this attempt's recorded answers.
 *
 * Used when the generated English feedback arrives after the fact: the history
 * must show what the learner was actually told, not the placeholder it was
 * written with. Keyed by questionKey rather than by row id so the caller does
 * not have to know what rows were written.
 */
export const updateExplanations = async (
  userId: string,
  attemptId: string,
  byQuestionKey: Map<string, string>
): Promise<void> => {
  if (byQuestionKey.size === 0) return;
  const supabase = await db();
  await Promise.all(
    [...byQuestionKey].map(async ([questionKey, explanation]) => {
      const { error } = await supabase
        .from("QuestionEvent")
        .update({ explanation })
        .eq("userId", userId)
        .eq("attemptId", attemptId)
        .eq("questionKey", questionKey);
      if (error) console.warn(`[history] explanation update failed: ${error.message}`);
      const { error: mErr } = await supabase
        .from("MistakeRecord")
        .update({ explanation })
        .eq("userId", userId)
        .eq("questionKey", questionKey);
      if (mErr) console.warn(`[history] mistake explanation update failed: ${mErr.message}`);
    })
  );
};

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export const listEvents = async (
  userId: string,
  query: HistoryQuery = {}
): Promise<QuestionEventRow[]> => {
  const supabase = await db();
  let q = supabase
    .from("QuestionEvent")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(query.limit ?? 100);

  if (query.source) q = q.eq("source", query.source);
  if (query.category) q = q.eq("category", query.category);
  if (query.moduleId) q = q.eq("moduleId", query.moduleId);
  if (query.attemptId) q = q.eq("attemptId", query.attemptId);
  if (query.onlyWrong) q = q.eq("isCorrect", false);

  return unwrap(await q, "listEvents");
};

export const listMistakes = async (
  userId: string,
  query: MistakeQuery = {}
): Promise<MistakeRow[]> => {
  const supabase = await db();
  let q = supabase
    .from("MistakeRecord")
    .select("*")
    .eq("userId", userId)
    .order("lastWrongAt", { ascending: false })
    .limit(query.limit ?? 100);

  if (query.source) q = q.eq("source", query.source);
  if (query.category) q = q.eq("category", query.category);
  if (query.status === "open") q = q.is("resolvedAt", null);
  if (query.status === "resolved") q = q.not("resolvedAt", "is", null);

  return unwrap(await q, "listMistakes");
};

export const findMistake = async (
  userId: string,
  id: string
): Promise<MistakeRow | null> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("MistakeRecord")
    .select("*")
    .eq("id", id)
    .eq("userId", userId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findMistake: ${error.message}`);
  return data ?? null;
};

/** Every mistake row, for computing patterns. Small by nature — one per question. */
export const allMistakes = async (userId: string): Promise<MistakeRow[]> => {
  const supabase = await db();
  return unwrap(
    await supabase.from("MistakeRecord").select("*").eq("userId", userId),
    "allMistakes"
  );
};

export const countEvents = async (userId: string): Promise<number> => {
  const supabase = await db();
  const { count, error } = await supabase
    .from("QuestionEvent")
    .select("id", { count: "exact", head: true })
    .eq("userId", userId);
  if (error) throw new Error(`[supabase] countEvents: ${error.message}`);
  return count ?? 0;
};
