import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Supabase with the service-role key: bypasses Row Level Security entirely.
//
// `server-only` at the top is the guard that matters. Importing this from
// anything that reaches the browser is a build error rather than a leaked
// key — which is the failure mode worth engineering against, because the key
// grants full read and write over every user's data.
//
// Only for work no user session can do: administrative lookups, linking an
// OAuth identity to an existing account, backfills.

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase admin is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  if (!cached) {
    cached = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}

export function adminConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
