import "server-only";

import { adminDb } from "./db";

// Report-card files, in Supabase Storage.
//
// They used to be written to `storage/reportcards/` on local disk. That works
// in development and not at all on a serverless host, where the filesystem is
// ephemeral and per-instance — an upload would land on one machine and the
// download would ask another.
//
// The bucket is PRIVATE. These documents carry names, dates of birth and
// sometimes CPR-adjacent identifiers, so nothing here is ever a public URL:
// downloads go through the admin client, behind the same auth as the rest of
// the app, after checking the row belongs to the caller.

export const REPORT_CARD_BUCKET = "report-cards";

/** Object key for a learner's file. Namespaced so one listing cannot spill. */
export const reportCardKey = (userId: string, filename: string): string => {
  const safe = filename.replace(/[^\w.\-]/g, "_");
  return `${userId}/${Date.now()}-${safe}`;
};

export const uploadReportCard = async (
  key: string,
  bytes: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<void> => {
  const { error } = await adminDb()
    .storage.from(REPORT_CARD_BUCKET)
    .upload(key, bytes, { contentType, upsert: false });
  if (error) throw new Error(`[storage] upload ${key}: ${error.message}`);
};

export const downloadReportCard = async (key: string): Promise<ArrayBuffer> => {
  const { data, error } = await adminDb().storage.from(REPORT_CARD_BUCKET).download(key);
  if (error || !data) throw new Error(`[storage] download ${key}: ${error?.message}`);
  return data.arrayBuffer();
};

export const removeReportCard = async (key: string): Promise<void> => {
  const { error } = await adminDb().storage.from(REPORT_CARD_BUCKET).remove([key]);
  if (error) throw new Error(`[storage] remove ${key}: ${error.message}`);
};
