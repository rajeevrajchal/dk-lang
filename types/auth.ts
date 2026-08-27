import type { AUTH_ERROR_CODES } from "@/lib/auth/errors";

/** The session shape the app works with, independent of the auth provider. */
export interface AppSession {
  user: { id: string; email: string; name?: string | null };
}

/** A Supabase auth user, before it is matched to an app user row. */
export interface SupabaseIdentity {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
}

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/** Which half of the login screen is showing. */
export type AuthMode = "login" | "register";
