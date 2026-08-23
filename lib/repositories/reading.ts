import "server-only";

import { db, adminDb, rpc, unwrap, isNoRows } from "@/lib/supabase/db";
import type { Tables } from "@/lib/supabase/database.types";

// The reading library's learner data: what has been read, saved, noted and
// highlighted, plus the shared explanation cache.
//
// Queries go through the signed-in learner's client, so Row Level Security
// filters them in the database. The `userId` filters below are therefore
// belt-and-braces rather than the only thing standing between two learners —
// they are kept because a query that says what it wants is easier to read, and
// because they make the intent obvious if a policy is ever dropped.

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function listProgress(userId: string): Promise<Tables<"ReadingProgress">[]> {
  const supabase = await db();
  return unwrap(
    await supabase.from("ReadingProgress").select("*").eq("userId", userId),
    "listProgress"
  );
}

export async function findProgress(
  userId: string,
  textId: string
): Promise<Tables<"ReadingProgress"> | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("ReadingProgress")
    .select("*")
    .eq("userId", userId)
    .eq("textId", textId)
    .single();

  // Not found is an expected answer here, not a failure.
  if (error && !isNoRows(error)) throw new Error(`[supabase] findProgress: ${error.message}`);
  return data ?? null;
}

/**
 * Records opening, finishing, bookmarking or reading time.
 *
 * Goes through a database function rather than PostgREST's upsert because the
 * insert and the update genuinely differ: seconds accumulate on update but are
 * set on insert, and a finished text must stay finished when it is opened
 * again. Doing that as read-then-write from here would lose reading time when
 * two tabs are open on the same text.
 */
export async function upsertProgress(
  userId: string,
  textId: string,
  input: {
    status?: "OPENED" | "COMPLETED";
    bookmarked?: boolean;
    mark?: string | null;
    addSeconds?: number;
  }
): Promise<Tables<"ReadingProgress">> {
  const supabase = await db();
  const rows = await rpc(supabase, "reading_progress_upsert", {
    p_user_id: userId,
    p_text_id: textId,
    p_status: input.status ?? null,
    p_bookmarked: input.bookmarked ?? null,
    p_mark: input.mark ?? null,
    p_add_seconds: input.addSeconds ?? null,
  });
  return rows[0];
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function listNotes(
  userId: string,
  textId?: string
): Promise<Tables<"ReadingNote">[]> {
  const supabase = await db();
  let query = supabase
    .from("ReadingNote")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });
  if (textId) query = query.eq("textId", textId);
  return unwrap(await query, "listNotes");
}

export async function createNote(
  userId: string,
  data: {
    textId: string;
    anchorKind: string;
    anchorId: string | null;
    quote: string | null;
    body: string;
  }
): Promise<Tables<"ReadingNote">> {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("ReadingNote")
      .insert({ ...data, userId, id: crypto.randomUUID() })
      .select(),
    "createNote"
  );
  return rows[0];
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const supabase = await db();
  const rows = unwrap(
    // Scoped by userId as well as id, and `select()` reports what was actually
    // removed — so somebody else's id deletes nothing and says so.
    await supabase.from("ReadingNote").delete().eq("id", id).eq("userId", userId).select("id"),
    "deleteNote"
  );
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export async function listHighlights(
  userId: string,
  textId?: string
): Promise<Tables<"ReadingHighlight">[]> {
  const supabase = await db();
  let query = supabase.from("ReadingHighlight").select("*").eq("userId", userId);
  if (textId) query = query.eq("textId", textId);
  return unwrap(await query, "listHighlights");
}

/** A null colour removes the highlight — the same action that made it. */
export async function setHighlight(
  userId: string,
  textId: string,
  sentenceIndex: number,
  color: string | null
): Promise<Tables<"ReadingHighlight"> | null> {
  const supabase = await db();

  if (color === null) {
    unwrap(
      await supabase
        .from("ReadingHighlight")
        .delete()
        .eq("userId", userId)
        .eq("textId", textId)
        .eq("sentenceIndex", sentenceIndex)
        .select("id"),
      "setHighlight(delete)"
    );
    return null;
  }

  // Plain upsert is correct here: insert and update write the same value.
  const rows = unwrap(
    await supabase
      .from("ReadingHighlight")
      .upsert(
        { id: crypto.randomUUID(), userId, textId, sentenceIndex, color },
        { onConflict: "userId,textId,sentenceIndex", ignoreDuplicates: false }
      )
      .select(),
    "setHighlight"
  );
  return rows[0];
}

// ---------------------------------------------------------------------------
// Explanation cache
//
// Not scoped by user, and that is the point: what a sentence means is a fact
// about the sentence, so one learner asking pays for it and everyone benefits.
// Read through the user client (a policy allows any signed-in learner to read
// it); written through the admin client, since it belongs to nobody.
// ---------------------------------------------------------------------------

export interface ExplanationKey {
  textId: string;
  scopeKind: string;
  scopeId: string;
  level: number;
  depth: string;
}

export async function findCachedExplanation(
  key: ExplanationKey
): Promise<Tables<"ReadingExplanation"> | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("ReadingExplanation")
    .select("*")
    .eq("textId", key.textId)
    .eq("scopeKind", key.scopeKind)
    .eq("scopeId", key.scopeId)
    .eq("level", key.level)
    .eq("depth", key.depth)
    .single();

  if (error && !isNoRows(error)) {
    throw new Error(`[supabase] findCachedExplanation: ${error.message}`);
  }
  return data ?? null;
}

export async function cacheExplanation(key: ExplanationKey, json: string): Promise<void> {
  // Upsert rather than insert: two learners can race on the same sentence.
  unwrap(
    await adminDb()
      .from("ReadingExplanation")
      .upsert(
        { id: crypto.randomUUID(), ...key, json },
        { onConflict: "textId,scopeKind,scopeId,level,depth", ignoreDuplicates: false }
      )
      .select("id"),
    "cacheExplanation"
  );
}
