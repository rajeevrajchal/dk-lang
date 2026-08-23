import "server-only";

import { users } from "@/lib/repositories";
import type { AppUser, SupabaseIdentity } from "@/types";

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

/**
 * Finds, links or creates the application user behind a Supabase identity.
 *
 * Three cases, in order:
 *   1. already linked      — return them
 *   2. same email, no link — link and return them, keeping all their data
 *   3. nobody              — create a new user
 */
export const resolveSupabaseUser = async (identity: SupabaseIdentity): Promise<AppUser> => {
  if (!identity.emailVerified) {
    throw new Error("Supabase identity has an unverified email address");
  }

  // These run before a session exists, so they go through the admin client —
  // there is no JWT for Row Level Security to check yet.
  const linked = await users.findBySupabaseId(identity.id);
  if (linked) return { id: linked.id, email: linked.email, name: linked.name };

  const byEmail = await users.findByEmailForAuth(identity.email);

  if (byEmail) {
    // Existing account, first Google sign-in. Keep the id — that is the whole
    // point — and record that this identity now also opens it. The password
    // hash is deliberately left alone so both routes keep working.
    const updated = await users.linkSupabaseIdentity(
      byEmail.id,
      identity.id,
      byEmail.name ?? identity.name ?? null
    );
    return { id: updated.id, email: updated.email, name: updated.name };
  }

  const created = await users.createUser({
    email: identity.email,
    name: identity.name ?? null,
    supabaseUserId: identity.id,
    authProvider: "google",
    // No passwordHash: this account has no password, and the credentials
    // provider already refuses a user without one.
  });
  return { id: created.id, email: created.email, name: created.name };
};
