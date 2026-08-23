import "server-only";

import { db, rpc, unwrap } from "@/lib/supabase/db";
import type { Tables } from "@/lib/supabase/database.types";
import type { LessonStatus, ProgressMap } from "@/lib/curriculum/progress";

// Progress through the grammar course.
//
// One row per learner per lesson slug, keyed by slug rather than an id so a
// lesson keeps its progress when the curriculum is reordered around it.

export async function loadProgress(userId: string): Promise<ProgressMap> {
  const supabase = await db();
  const rows = unwrap(
    await supabase.from("LessonProgress").select("*").eq("userId", userId),
    "loadProgress"
  );

  const map: ProgressMap = {};
  for (const r of rows) {
    map[r.lessonSlug] = {
      lessonSlug: r.lessonSlug,
      score: r.score,
      total: r.total,
      completedAt: r.completedAt,
      status: r.status as LessonStatus,
      lastVisitedAt: r.lastVisitedAt ?? null,
    };
  }
  return map;
}

/**
 * Records that a lesson is open.
 *
 * Writing the row on open is what makes resuming possible: without it an
 * abandoned lesson leaves no trace. A database function, because opening a
 * lesson already finished must bump lastVisitedAt without demoting its status
 * back to IN_PROGRESS — an upsert writing the same values on both paths would
 * undo the completion every time it was re-read.
 */
export async function recordVisit(
  userId: string,
  lessonSlug: string,
  chapterId: string | null
): Promise<Tables<"LessonProgress">> {
  const supabase = await db();
  const rows = await rpc(supabase, "lesson_progress_visit", {
    p_user_id: userId,
    p_lesson_slug: lessonSlug,
    p_chapter_id: chapterId,
  });
  return rows[0];
}

export async function recordCompletion(
  userId: string,
  lessonSlug: string,
  input: {
    chapterId: string | null;
    score: number | null;
    total: number | null;
    responsesJson: string;
  }
): Promise<Tables<"LessonProgress">> {
  const supabase = await db();
  const now = new Date().toISOString();

  // A plain upsert is right here: completion writes the same values whether
  // the row already existed or not.
  const rows = unwrap(
    await supabase
      .from("LessonProgress")
      .upsert(
        {
          id: crypto.randomUUID(),
          userId,
          lessonSlug,
          chapterId: input.chapterId,
          status: "COMPLETED",
          score: input.score,
          total: input.total,
          responsesJson: input.responsesJson,
          completedAt: now,
          updatedAt: now,
        },
        { onConflict: "userId,lessonSlug", ignoreDuplicates: false }
      )
      .select(),
    "recordCompletion"
  );
  return rows[0];
}

export async function listCompleted(
  userId: string,
  take = 12
): Promise<Tables<"LessonProgress">[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("LessonProgress")
      .select("*")
      .eq("userId", userId)
      .eq("status", "COMPLETED")
      .order("updatedAt", { ascending: false })
      .limit(take),
    "listCompleted"
  );
}
