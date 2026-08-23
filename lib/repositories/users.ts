import "server-only";

import { db, adminDb, unwrap, isNoRows } from "@/lib/supabase/db";
import type { Tables } from "@/types";

// Users, profiles and official test results.
//
// The split between "what the learner told us" (UserProfile, OfficialTestResult)
// and "what the app measured" (ModuleSkillStatus, attempts) is deliberate and
// is enforced here: nothing in this file takes a score.
//
// Account lookups during sign-in use the ADMIN client, because they happen
// before a session exists — there is no JWT for RLS to check yet. Everything
// after sign-in uses the learner's own client, so the database enforces the
// scoping rather than trusting this code to remember it.

export const findById = async (userId: string) => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("User")
    .select("id, email, name, authProvider, createdAt")
    .eq("id", userId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findById: ${error.message}`);
  return data ?? null;
};

// --- sign-in path: no session yet, so these use the admin client -----------

export const findByEmailForAuth = async (email: string): Promise<Tables<"User"> | null> => {
  const { data, error } = await adminDb().from("User").select("*").eq("email", email).single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findByEmailForAuth: ${error.message}`);
  return data ?? null;
};

export const findBySupabaseId = async (supabaseUserId: string): Promise<Tables<"User"> | null> => {
  const { data, error } = await adminDb()
    .from("User")
    .select("*")
    .eq("supabaseUserId", supabaseUserId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] findBySupabaseId: ${error.message}`);
  return data ?? null;
};

export const linkSupabaseIdentity = async (
  userId: string,
  supabaseUserId: string,
  name: string | null
): Promise<Tables<"User">> => {
  const rows = unwrap(
    await adminDb()
      .from("User")
      .update({ supabaseUserId, ...(name ? { name } : {}) })
      .eq("id", userId)
      .select(),
    "linkSupabaseIdentity"
  );
  return rows[0];
};

export const createUser = async (input: {
  email: string;
  name: string | null;
  passwordHash?: string | null;
  supabaseUserId?: string | null;
  authProvider?: string;
}): Promise<Tables<"User">> => {
  const rows = unwrap(
    await adminDb()
      .from("User")
      .insert({
        id: crypto.randomUUID(),
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash ?? null,
        supabaseUserId: input.supabaseUserId ?? null,
        authProvider: input.authProvider ?? "credentials",
        createdAt: new Date().toISOString(),
      })
      .select(),
    "createUser"
  );
  return rows[0];
};

// --- profile ---------------------------------------------------------------

export const getProfile = async (userId: string): Promise<Tables<"UserProfile"> | null> => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("userId", userId)
    .single();
  if (error && !isNoRows(error)) throw new Error(`[supabase] getProfile: ${error.message}`);
  return data ?? null;
};

/** Partial profile update, creating the row if it does not exist yet. */
export const upsertProfile = async (
  userId: string,
  data: Partial<Omit<Tables<"UserProfile">, "id" | "userId">>
): Promise<Tables<"UserProfile">> => {
  const supabase = await db();
  const existing = await getProfile(userId);

  const rows = unwrap(
    await supabase
      .from("UserProfile")
      .upsert(
        {
          // Merged with what is already stored, so a caller setting one field
          // does not silently null the rest — PostgREST's upsert writes the
          // whole row.
          ...(existing ?? {}),
          id: existing?.id ?? crypto.randomUUID(),
          userId,
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "userId", ignoreDuplicates: false }
      )
      .select(),
    "upsertProfile"
  );
  return rows[0];
};

export const getInterestsJson = async (userId: string): Promise<string | null> => {
  return (await getProfile(userId))?.interestsJson ?? null;
};

export const setInterestsJson = async (userId: string, interestsJson: string) => {
  return upsertProfile(userId, { interestsJson });
};

// --- official test results -------------------------------------------------

export const listOfficialResults = async (
  userId: string
): Promise<Tables<"OfficialTestResult">[]> => {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("OfficialTestResult")
      .select("*")
      .eq("userId", userId)
      .order("takenAt", { ascending: false, nullsFirst: false })
      .order("createdAt", { ascending: false }),
    "listOfficialResults"
  );
};

export const createOfficialResult = async (
  userId: string,
  data: Omit<Tables<"OfficialTestResult">, "id" | "userId" | "createdAt">
): Promise<Tables<"OfficialTestResult">> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("OfficialTestResult")
      .insert({ ...data, id: crypto.randomUUID(), userId, createdAt: new Date().toISOString() })
      .select(),
    "createOfficialResult"
  );
  return rows[0];
};

export const findOfficialResultByReportCard = async (userId: string, reportCardId: string) => {
  const supabase = await db();
  const { data, error } = await supabase
    .from("OfficialTestResult")
    .select("*")
    .eq("userId", userId)
    .eq("reportCardId", reportCardId)
    .single();
  if (error && !isNoRows(error)) {
    throw new Error(`[supabase] findOfficialResultByReportCard: ${error.message}`);
  }
  return data ?? null;
};

export const deleteOfficialResult = async (userId: string, id: string): Promise<boolean> => {
  const supabase = await db();
  const rows = unwrap(
    await supabase
      .from("OfficialTestResult")
      .delete()
      .eq("id", id)
      .eq("userId", userId)
      .select("id"),
    "deleteOfficialResult"
  );
  return rows.length > 0;
};
