"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

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

export function createClient() {
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
}

/** Whether Supabase auth can be used at all, for hiding the Google button. */
export function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );
}
