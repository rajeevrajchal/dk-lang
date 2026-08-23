import "server-only";

import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { resolveSupabaseUser } from "./identity";

// One way in, one session.
//
// Google and email/password both go through Supabase Auth, so every request
// carries a Supabase JWT and the Row Level Security policies in
// supabase/rls.sql apply to every query the app makes.
//
// This used to run NextAuth alongside for email/password, which did not work:
// a NextAuth-authenticated user had no Supabase JWT, so `app_user_id()`
// returned NULL and RLS denied everything — writes failed with 42501 and reads
// silently returned nothing. Two session systems and database-enforced
// authorization are not compatible.
//
// The session shape is unchanged, so the forty-three call sites that read
// `session.user.id` did not have to change. `user.id` is always the
// application id, never a Supabase UUID — see lib/auth/identity.ts.

export interface AppSession {
  user: { id: string; email: string; name?: string | null };
}

/**
 * Next.js signals "this route touched request state" by throwing. That is
 * control flow, not a failure, and swallowing it breaks the framework's
 * static/dynamic detection — so it is re-thrown rather than caught along with
 * genuine Supabase errors.
 */
function isFrameworkControlFlow(err: unknown): boolean {
  const digest = (err as { digest?: unknown })?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" ||
      digest.startsWith("NEXT_REDIRECT") ||
      digest.startsWith("NEXT_NOT_FOUND"))
  );
}

/**
 * The current user, or null when nobody is signed in.
 *
 * Returns null rather than throwing — every caller already handles it, and the
 * proxy has usually redirected first anyway.
 */
export async function auth(): Promise<AppSession | null> {
  if (!supabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    // getUser() revalidates the token with Supabase rather than trusting
    // whatever the cookie claims. getSession() would not, and the cookie is
    // attacker-controllable.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;

    const user = await resolveSupabaseUser({
      id: data.user.id,
      email: data.user.email,
      name:
        (data.user.user_metadata?.full_name as string | undefined) ??
        (data.user.user_metadata?.name as string | undefined) ??
        null,
      // Google verifies the address before Supabase issues the identity;
      // email/password sign-ups are confirmed by Supabase itself.
      emailVerified: !!data.user.email_confirmed_at || !!data.user.confirmed_at,
    });
    return { user };
  } catch (err) {
    if (isFrameworkControlFlow(err)) throw err;
    console.warn("[auth] session lookup failed:", err);
    return null;
  }
}

export async function signOut() {
  if (!supabaseConfigured()) return;
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    if (isFrameworkControlFlow(err)) throw err;
    console.warn("[auth] sign-out failed:", err);
  }
}
