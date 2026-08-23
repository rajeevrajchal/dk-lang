import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { users } from "@/lib/repositories";

// Two ways in, one session shape.
//
// Google sign-in goes through Supabase Auth; email and password still go
// through NextAuth, so the accounts that existed before this migration keep
// working. Both end up behind the same `auth()` below, which returns the same
// `{ user: { id, email, name } }` it always did — that is what lets all
// forty-three call sites stay untouched.
//
// The id in that session is always the application cuid, never a Supabase
// UUID. See lib/auth/identity.ts for why, and for how the two are mapped.
export const {
  handlers,
  auth: nextAuthSession,
  signIn,
  signOut: nextAuthSignOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Admin client: there is no session yet, so nothing for RLS to check.
        const user = await users.findByEmailForAuth(email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});

// ---------------------------------------------------------------------------
// The session the application sees
// ---------------------------------------------------------------------------

import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { resolveSupabaseUser } from "./identity";

/**
 * Next.js signals "this route touched request state, so it cannot be static"
 * by throwing. That is control flow, not a failure, and swallowing it breaks
 * the framework's static/dynamic detection — so it has to be re-thrown rather
 * than caught along with genuine Supabase errors.
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

export interface AppSession {
  user: { id: string; email: string; name?: string | null };
}

/**
 * The current user, however they signed in.
 *
 * Supabase is checked first because a Google session is the newer of the two
 * and the one being migrated towards; NextAuth answers for everyone else.
 * Either way the caller gets the same shape, and `user.id` is always the
 * application cuid.
 *
 * Returns null rather than throwing when nobody is signed in — every caller
 * already handles that, and the proxy has usually redirected first anyway.
 */
export async function auth(): Promise<AppSession | null> {
  if (supabaseConfigured()) {
    try {
      const supabase = await createClient();
      // getUser() revalidates the token with Supabase rather than trusting
      // whatever the cookie claims. getSession() would not, and the cookie is
      // attacker-controllable.
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user?.email) {
        const user = await resolveSupabaseUser({
          id: data.user.id,
          email: data.user.email,
          name:
            (data.user.user_metadata?.full_name as string | undefined) ??
            (data.user.user_metadata?.name as string | undefined) ??
            null,
          // Supabase records this once the provider has confirmed the address.
          emailVerified: !!data.user.email_confirmed_at || !!data.user.confirmed_at,
        });
        return { user };
      }
    } catch (err) {
      if (isFrameworkControlFlow(err)) throw err;
      // A Supabase outage must not lock out somebody with a password. Fall
      // through and let NextAuth answer.
      console.warn("[auth] Supabase session lookup failed:", err);
    }
  }

  const session = await nextAuthSession();
  if (!session?.user?.id) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name,
    },
  };
}

/** Signs out of whichever session is active — possibly both. */
export async function signOut(opts?: { redirectTo?: string }) {
  if (supabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (err) {
      if (isFrameworkControlFlow(err)) throw err;
      console.warn("[auth] Supabase sign-out failed:", err);
    }
  }
  await nextAuthSignOut(opts);
}
