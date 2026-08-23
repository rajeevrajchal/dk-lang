import "server-only";

import { db, rpc, unwrap } from "@/lib/supabase/db";
import type { Tables } from "@/lib/supabase/database.types";
import type { Skill } from "@/lib/constants";

// Skill progress and module readiness — the item-level drill, and the
// in-app/official split the whole unlock model rests on.

// ---------------------------------------------------------------------------
// Item attempts (the adaptive reading drill)
// ---------------------------------------------------------------------------

export interface AttemptWithItem extends Tables<"Attempt"> {
  item: Tables<"Item">;
}

/**
 * Recent attempts with the item they answered.
 *
 * Two queries rather than a PostgREST embed: the embed syntax depends on
 * foreign-key naming, and joining in application code keeps the query honest
 * about what it costs.
 */
export async function recentAttempts(userId: string, take = 10): Promise<AttemptWithItem[]> {
  const supabase = await db();
  const attempts = unwrap(
    await supabase
      .from("Attempt")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(take),
    "recentAttempts"
  );
  if (attempts.length === 0) return [];

  const items = unwrap(
    await supabase
      .from("Item")
      .select("*")
      .in("id", [...new Set(attempts.map((a) => a.itemId))]),
    "recentAttempts(items)"
  );
  const byId = new Map(items.map((i) => [i.id, i]));

  return attempts
    .map((a) => {
      const item = byId.get(a.itemId);
      return item ? { ...a, item } : null;
    })
    .filter((a): a is AttemptWithItem => a !== null);
}

/** Reading attempts since a date — for the dashboard's reading habit. */
export async function readingAttemptsSince(
  userId: string,
  since: Date
): Promise<Pick<Tables<"Attempt">, "createdAt">[]> {
  const supabase = await db();
  const attempts = unwrap(
    await supabase
      .from("Attempt")
      .select("createdAt, itemId")
      .eq("userId", userId)
      .gte("createdAt", since.toISOString()),
    "readingAttemptsSince"
  );
  if (attempts.length === 0) return [];

  // Filtering by the related item's skill. PostgREST could express this as an
  // inner-join filter, but that couples the query to embed naming; fetching
  // the reading item ids once is clearer and no more expensive at this size.
  const readingItems = unwrap(
    await supabase
      .from("Item")
      .select("id")
      .eq("skill", "READING")
      .in("id", [...new Set(attempts.map((a) => a.itemId))]),
    "readingAttemptsSince(items)"
  );
  const readingIds = new Set(readingItems.map((i) => i.id));

  return attempts.filter((a) => readingIds.has(a.itemId)).map((a) => ({ createdAt: a.createdAt }));
}

// ---------------------------------------------------------------------------
// Module / skill status
//
// Two signals per (module, skill) that are never merged: what this app
// measured, and what a real examiner decided. See docs/unlock-logic.md.
// ---------------------------------------------------------------------------

export async function moduleSkillStatuses(
  userId: string
): Promise<Tables<"ModuleSkillStatus">[]> {
  const supabase = await db();
  return unwrap(
    await supabase.from("ModuleSkillStatus").select("*").eq("userId", userId),
    "moduleSkillStatuses"
  );
}

/**
 * Records what the app's own mock test showed.
 *
 * A database function, and deliberately one that takes no `official*`
 * argument: `officialPassed` is what an examiner decided and must never be
 * written from a practice score. The separation is enforced by the function's
 * shape rather than by remembering.
 */
export async function applyInAppResult(
  userId: string,
  moduleId: number,
  skill: Skill,
  score: number,
  passed: boolean
): Promise<Tables<"ModuleSkillStatus">> {
  const supabase = await db();
  const rows = await rpc(supabase, "module_skill_apply_in_app", {
    p_user_id: userId,
    p_module_id: moduleId,
    p_skill: skill,
    p_score: score,
    p_passed: passed,
  });
  return rows[0];
}

/** Records what a confirmed report card said. Never touches `inApp*`. */
export async function applyOfficialResult(
  userId: string,
  moduleId: number,
  skill: Skill,
  data: {
    officialPassed: boolean;
    officialSourceId: string;
    discrepancy: boolean;
    discrepancyNote: string | null;
  }
): Promise<Tables<"ModuleSkillStatus">> {
  const supabase = await db();
  const existing = unwrap(
    await supabase
      .from("ModuleSkillStatus")
      .select("*")
      .eq("userId", userId)
      .eq("moduleId", moduleId)
      .eq("skill", skill),
    "applyOfficialResult(existing)"
  );

  const rows = unwrap(
    await supabase
      .from("ModuleSkillStatus")
      .upsert(
        {
          // Merged with what is there, so writing the official verdict cannot
          // wipe the in-app one. PostgREST's upsert writes the whole row.
          ...(existing[0] ?? {}),
          id: existing[0]?.id ?? crypto.randomUUID(),
          userId,
          moduleId,
          skill,
          ...data,
          officialSetAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "userId,moduleId,skill", ignoreDuplicates: false }
      )
      .select(),
    "applyOfficialResult"
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// Report cards
// ---------------------------------------------------------------------------

export async function listReportCards(
  userId: string,
  status?: string
): Promise<Tables<"ReportCard">[]> {
  const supabase = await db();
  let query = supabase
    .from("ReportCard")
    .select("*")
    .eq("userId", userId)
    .order("uploadedAt", { ascending: false });
  if (status) query = query.eq("status", status);
  return unwrap(await query, "listReportCards");
}

export async function findReportCard(
  userId: string,
  id: string
): Promise<Tables<"ReportCard"> | null> {
  const supabase = await db();
  const rows = unwrap(
    await supabase.from("ReportCard").select("*").eq("id", id).eq("userId", userId),
    "findReportCard"
  );
  return rows[0] ?? null;
}
