import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveSupabaseUser } from "@/lib/auth/identity";
import { classifyAuthError, type AuthErrorCode } from "@/lib/auth/errors";

// Where Google sends the learner back to.
//
// Supabase hands over a one-time code; exchanging it sets the session cookies.
// The application user is resolved here rather than lazily on the next request
// so that a first Google sign-in fails loudly at the moment it happens —
// finding out later, halfway through a lesson, would be much worse.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Only ever a path, never an absolute URL: taking an arbitrary `next` would
  // turn this into an open redirect.
  const requested = url.searchParams.get("next") ?? "/dashboard";
  const next = requested.startsWith("/") && !requested.startsWith("//")
    ? requested
    : "/dashboard";

  /** Only known codes reach the login page — never provider text from the URL. */
  const fail = (reason: AuthErrorCode) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, url.origin));

  // Supabase reports a refused or cancelled sign-in this way. The provider's
  // own wording is logged but never rendered: it is attacker-influencable, and
  // a login page that will display arbitrary text is a phishing surface.
  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) {
    console.warn("[auth/callback] provider returned an error:", providerError);
    return fail("oauth_failed");
  }

  if (!code) return fail("missing_code");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    console.warn("[auth/callback] code exchange failed:", error?.message);
    // An expired recovery or confirmation link is the common case here, and
    // the learner can act on it by asking for another.
    return fail(error ? classifyAuthError(error) : "oauth_failed");
  }

  try {
    // Links this Google identity to an existing account with the same email,
    // or creates one. Either way the learner keeps their cuid and everything
    // hanging off it — see lib/auth/identity.ts.
    await resolveSupabaseUser({
      id: data.user.id,
      email: data.user.email,
      name:
        (data.user.user_metadata?.full_name as string | undefined) ??
        (data.user.user_metadata?.name as string | undefined) ??
        null,
      emailVerified: !!data.user.email_confirmed_at || !!data.user.confirmed_at,
    });
  } catch (err) {
    console.error("[auth/callback] could not resolve user:", err);
    // Do not leave them holding a Supabase session with no application user —
    // every page would then fail in a confusing way.
    await supabase.auth.signOut();
    return fail("account_link_failed");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
