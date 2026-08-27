import "server-only";

import { db, rpc, unwrap } from "@/lib/supabase/db";
import type { SaveWordInput, Tables } from "@/types";

// The learner's own vocabulary — words and expressions kept while reading.
//
// Distinct from the seeded VocabItem bank, which is module-scoped course
// content. `vocabItemId` links the two where they correspond, so this stays
// one vocabulary with two sources rather than two vocabularies.

export const listSavedWords = async (
  userId: string,
  sourceTextId?: string
): Promise<Tables<"SavedWord">[]> => {
  const supabase = await db();
  let query = supabase
    .from("SavedWord")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });
  if (sourceTextId) query = query.eq("sourceTextId", sourceTextId);
  return unwrap(await query, "listSavedWords");
};

/**
 * Saves a word or phrase.
 *
 * Goes through a database function because insert and update differ: saving
 * the same word again from another text refreshes its translation but must
 * never wipe a note the learner wrote. PostgREST's upsert writes the same
 * values on both paths and could not express that.
 */
export const saveWord = async (
  userId: string,
  input: SaveWordInput
): Promise<Tables<"SavedWord">> => {
  const supabase = await db();
  const rows = await rpc(supabase, "saved_word_upsert", {
    p_user_id: userId,
    p_kind: input.kind,
    p_danish: input.danish,
    p_translation: input.translation,
    p_lemma: input.lemma ?? null,
    p_part_of_speech: input.partOfSpeech ?? null,
    p_context_sentence: input.contextSentence ?? null,
    p_grammar_note: input.grammarNote ?? null,
    p_source_text_id: input.sourceTextId ?? null,
    p_note: input.note ?? null,
  });
  return rows[0];
};

export const updateSavedWord = async (
  userId: string,
  id: string,
  data: { note?: string | null; learned?: boolean }
): Promise<Tables<"SavedWord"> | null> => {
  if (Object.keys(data).length === 0) return null;

  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("SavedWord")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .eq("userId", userId)
      .select(),
    "updateSavedWord"
  );
  // Empty rather than an error when the id belongs to someone else: RLS and
  // the userId filter both make it match nothing.
  return rows[0] ?? null;
};

export const deleteSavedWord = async (userId: string, id: string): Promise<boolean> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase.from("SavedWord").delete().eq("id", id).eq("userId", userId).select("id"),
    "deleteSavedWord"
  );
  return rows.length > 0;
};
