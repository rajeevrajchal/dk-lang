/**
 * Creates a Supabase Auth identity for every existing application user and
 * links it back to their row.
 *
 *     npx tsx scripts/migrate-users-to-supabase-auth.ts
 *
 * Why this is needed: accounts created before the auth migration have a bcrypt
 * hash in `User.passwordHash` and no Supabase identity. Since authorization is
 * now enforced by Row Level Security, a request with no Supabase JWT is denied
 * everything — so those accounts could sign in and then reach no data.
 *
 * bcrypt hashes cannot be imported into Supabase Auth, so the password does
 * not come across. Each user is created WITHOUT one and gets in by:
 *
 *   * signing in with Google, if their email matches — lib/auth/identity.ts
 *     links it to the same row, so nothing is lost; or
 *   * a password-reset email, which this script can send with --invite.
 *
 * Their application row, and therefore every attempt, note and lesson hanging
 * off its id, is untouched either way.
 *
 * Idempotent: a user who already has `supabaseUserId` is skipped.
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const invite = process.argv.includes("--invite");

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function main() {
  const supabase = admin();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, supabaseUserId: true },
  });

  for (const user of users) {
    if (user.supabaseUserId) {
      console.log(`  skip    ${user.email} (already linked)`);
      continue;
    }

    // Supabase may already know this address — from a Google sign-in, or a
    // previous half-finished run of this script.
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

    let supabaseUserId = found?.id;

    if (!supabaseUserId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: user.name ? { full_name: user.name } : undefined,
      });
      if (error || !data.user) {
        console.error(`  FAILED  ${user.email}: ${error?.message}`);
        continue;
      }
      supabaseUserId = data.user.id;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        supabaseUserId,
        // The bcrypt hash is now dead weight: nothing reads it, and leaving it
        // implies a password that no longer works.
        passwordHash: null,
      },
    });

    console.log(`  linked  ${user.email} -> ${supabaseUserId}${found ? " (existing identity)" : ""}`);

    if (invite) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
      });
      console.log(error ? `          reset email FAILED: ${error.message}` : "          reset email sent");
    }
  }

  console.log(
    `\nDone. Users keep their ids, so every attempt, note and lesson is intact.` +
      (invite ? "" : "\nRun again with --invite to email password resets.")
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
