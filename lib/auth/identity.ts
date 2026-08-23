import "server-only";

import { prisma } from "@/lib/db";

// Turning a Supabase Auth identity into an application user.
//
// The two identity systems have different ids and neither can be made to
// budge: Supabase issues UUIDs in auth.users, while User.id is a cuid that
// fifteen foreign keys and every attempt, note and lesson row already point
// at. So they are mapped rather than merged.
//
// Matching on email is what lets somebody who has been signing in with a
// password switch to Google and keep everything they have done. It is safe
// here only because Supabase issues a Google identity after Google has
// verified the address — linking on an unverified address would be an account
// takeover, so this refuses one.

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

/**
 * Finds, links or creates the application user behind a Supabase identity.
 *
 * Three cases, in order:
 *   1. already linked      — return them
 *   2. same email, no link — link and return them, keeping all their data
 *   3. nobody              — create a new user
 */
export async function resolveSupabaseUser(identity: SupabaseIdentity): Promise<AppUser> {
  if (!identity.emailVerified) {
    throw new Error("Supabase identity has an unverified email address");
  }

  const linked = await prisma.user.findUnique({
    where: { supabaseUserId: identity.id },
    select: { id: true, email: true, name: true },
  });
  if (linked) return linked;

  const byEmail = await prisma.user.findUnique({
    where: { email: identity.email },
    select: { id: true, email: true, name: true },
  });

  if (byEmail) {
    // Existing account, first Google sign-in. Keep the cuid — that is the
    // whole point — and record that this identity now also opens it. The
    // password hash is deliberately left alone so both routes keep working.
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        supabaseUserId: identity.id,
        name: byEmail.name ?? identity.name ?? null,
      },
      select: { id: true, email: true, name: true },
    });
  }

  return prisma.user.create({
    data: {
      email: identity.email,
      name: identity.name ?? null,
      supabaseUserId: identity.id,
      authProvider: "google",
      // No passwordHash: this account has no password, and the credentials
      // provider already refuses a user without one.
    },
    select: { id: true, email: true, name: true },
  });
}
