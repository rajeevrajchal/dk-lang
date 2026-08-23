import "server-only";

import { createClient as createUserClient } from "./server";
import { createAdminClient } from "./admin";
import type { Database } from "./database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Db = SupabaseClient<Database>;

// Which Supabase client the repositories query through.
//
// This is the decision that makes Row Level Security real, so it is worth
// being explicit about.
//
// The USER client carries the signed-in learner's JWT, so every query it makes
// is filtered by the policies in supabase/rls.sql — the database itself
// refuses to return another learner's rows. That is a genuinely stronger
// guarantee than the previous arrangement, where the ORM connected as the
// table owner and the only thing standing between two learners was a WHERE
// clause the application remembered to write.
//
// The ADMIN client bypasses RLS entirely and is used for exactly two things:
// work that happens before a session exists (looking up an account during
// sign-in) and content every learner shares. Reaching for it anywhere else
// throws away the protection above, so `db()` is the default and `adminDb()`
// has to be asked for by name.

/** The signed-in learner's client. Every query is subject to RLS. */
export async function db(): Promise<Db> {
  return createUserClient();
}

/**
 * The service-role client. Bypasses RLS — use only when there is no session
 * to act on behalf of, or for content that belongs to nobody.
 */
export function adminDb(): Db {
  return createAdminClient();
}

/**
 * Turns a PostgREST error into a thrown Error.
 *
 * supabase-js reports failures in the result rather than throwing, which is
 * easy to forget to check — and a forgotten check reads as "no rows" rather
 * than "the query failed". Every repository funnels through this so a broken
 * query is loud.
 */
export function unwrap<T>(
  result: { data: T | null; error: { message: string; code?: string } | null },
  context: string
): T {
  if (result.error) {
    throw new Error(`[supabase] ${context}: ${result.error.message}`);
  }
  if (result.data === null) {
    // PostgREST nulls `data` alongside an error; reaching here without one
    // means something unexpected, and returning null would surface later as a
    // confusing "no rows" rather than a failed query.
    throw new Error(`[supabase] ${context}: no data returned`);
  }
  return result.data;
}

/** PostgREST's "no rows matched" from .single(), which is often expected. */
export function isNoRows(error: { code?: string } | null): boolean {
  return error?.code === "PGRST116";
}

type Fns = Database["public"]["Functions"];

/**
 * Calls one of the database functions in supabase/functions.sql.
 *
 * A helper rather than calling `.rpc()` directly because its `Args` type
 * parameter defaults to `never` and TypeScript will not infer it from the
 * argument position — without this every call site would have to spell the
 * generics out. Here the function name alone is enough to type both the
 * arguments and the result.
 */
export async function rpc<K extends keyof Fns & string>(
  client: Db,
  fn: K,
  args: Fns[K]["Args"]
): Promise<Fns[K]["Returns"]> {
  // supabase-js resolves an RPC's return type by exact-matching the argument
  // object against every overload of that function name. Inside a generic
  // helper `K` is not yet concrete, so that match cannot be made and the
  // result type collapses. The cast is confined to these two lines; the
  // helper's own signature stays exact, so call sites get real types.
  const { data, error } = await client.rpc(fn, args as never);
  if (error) throw new Error(`[supabase] rpc ${fn}: ${error.message}`);
  return data as unknown as Fns[K]["Returns"];
}
