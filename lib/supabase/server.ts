import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase on the server, reading the session from cookies.
//
// The cookie plumbing is the reason this file exists: Supabase refreshes
// access tokens by writing new cookies, and in a React Server Component that
// write is not allowed. Swallowing that specific failure is correct rather
// than lazy — the proxy refreshes the session on every request, so a
// server-rendered page can always read a valid one and never needs to write.

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe
          // to ignore: proxy.ts refreshes the session before the render, so
          // the cookies this would have written are already current.
        }
      },
    },
  });
}

export function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );
}
