import "server-only";

import { createHash } from "node:crypto";
import { adminDb, db, isNoRows, unwrap } from "@/lib/supabase/db";
import type { Translation, TranslationKey } from "@/types";

// The shared translation cache.
//
// Reads go through the learner's own client (RLS grants every signed-in user
// SELECT on this table); writes go through the service role. That asymmetry is
// deliberate and is written into supabase/rls.sql: a cache entry is served to
// everybody, so a learner must not be able to put one there. Only this file,
// after the server has generated the entry itself, can write.

/** The whole cache key in one indexed column. */
export const translationHash = (key: TranslationKey): string => {
  const normalised = key.danish.trim().replace(/\s+/g, " ").toLowerCase();
  return createHash("sha256")
    .update(`${key.kind}:${key.level}:${normalised}`)
    .digest("hex");
};

export const findCached = async (key: TranslationKey): Promise<Translation | null> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("TranslationCache")
    .select("json")
    .eq("hash", translationHash(key))
    .single();
  if (error && !isNoRows(error)) {
    throw new Error(`[supabase] findCached translation: ${error.message}`);
  }
  if (!data) return null;
  return { ...(JSON.parse(data.json) as Translation), source: "cache" };
};

/** Several at once — a whole opgave's sentences is one round trip, not thirty. */
export const findCachedMany = async (
  keys: TranslationKey[]
): Promise<Map<string, Translation>> => {
  if (keys.length === 0) return new Map();
  const supabase = await db();
  const hashes = keys.map(translationHash);
  const rows = unwrap(
    await supabase.from("TranslationCache").select("hash, json").in("hash", hashes),
    "findCachedMany"
  );
  return new Map(
    rows.map((r) => [r.hash, { ...(JSON.parse(r.json) as Translation), source: "cache" as const }])
  );
};

export const cache = async (key: TranslationKey, translation: Translation): Promise<void> => {
  const supabase = adminDb();
  const { error } = await supabase.from("TranslationCache").upsert(
    {
      id: crypto.randomUUID(),
      hash: translationHash(key),
      kind: key.kind,
      danish: key.danish.slice(0, 600),
      level: key.level,
      json: JSON.stringify(translation),
    },
    { onConflict: "hash", ignoreDuplicates: true }
  );
  // A cache write failing must never fail the request that produced the
  // translation — the learner has their answer either way.
  if (error) console.warn(`[translation] cache write failed: ${error.message}`);
};
