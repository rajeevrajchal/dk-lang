"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

// Supabase in the browser.
//
// Carries the publishable (anon) key, which is safe to ship to the client —
// it identifies the project, not the caller, and every table it can reach is
// governed by Row Level Security. The service-role key must never appear here;
// see lib/supabase/admin.ts.
//
// Used only for AUTH: starting the Google OAuth redirect and reading the
// current session. Application data goes through the server, never straight
// from the browser to PostgREST — see docs/supabase-migration.md.

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase renamed the anon key to "publishable" for new projects. Accept
  // either so a project of any age works without editing this file.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return createBrowserClient<Database>(url, key);
};

/** Whether Supabase auth can be used at all, for hiding the Google button. */
export const supabaseConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );
};

/**
 * Whether to offer email and password alongside Google.
 *
 * Off hides the password form, the create-account tab, the "or" divider and
 * the forgot-password link, leaving Google as the only way in. That is a
 * reasonable end state — it removes password resets, confirmation emails and
 * Supabase's SMTP rate limit from the product entirely.
 *
 * It is a one-way door while it is off, though: with no password route and
 * Google not enabled on the project, nobody can sign in at all. So it defaults
 * to ON and has to be turned off deliberately, once Google is known to work.
 */
export const passwordAuthEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_AUTH_PASSWORD !== "off";
};
