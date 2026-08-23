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
 * Idempotent and SELF-HEALING: a user whose `supabaseUserId` points at an
 * identity that no longer exists is re-linked rather than skipped. Skipping on
 * the presence of the column alone left two accounts unable to sign in when
 * their identities were removed — the column was set, so the script declared
 * them done.
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

  // Fetched once rather than per user: listUsers is paginated and this is the
  // authority on which identities actually exist.
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(`could not list Supabase users: ${listError.message}`);
  const existingIds = new Set(list.users.map((u) => u.id));

  for (const user of users) {
    // A link is only real if the identity behind it still exists. Trusting the
    // column alone is how two accounts ended up locked out: the column was
    // set, the identity was gone, and the script skipped them.
    if (user.supabaseUserId && existingIds.has(user.supabaseUserId)) {
      console.log(`  skip    ${user.email} (already linked)`);
      continue;
    }
    if (user.supabaseUserId) {
      console.log(`  repair  ${user.email} (link pointed at a deleted identity)`);
    }

    const found = list.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

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
      data: { supabaseUserId },
      // The bcrypt hash is deliberately LEFT ALONE. Nothing reads it any more,
      // but clearing it destroys the only record of the account's original
      // credential in the same step that creates a replacement which can be
      // deleted independently — as happened here. Dead weight is cheaper than
      // an unrecoverable account. Clear it separately once sign-in is
      // confirmed working.
    });

    console.log(
      `  linked  ${user.email} -> ${supabaseUserId}${found ? " (existing identity)" : ""}`
    );
    if (!found) {
      // Worth saying out loud. The account exists and is confirmed, but has NO
      // password — bcrypt hashes cannot be imported into Supabase Auth, so the
      // one from the old database is gone. Trying it produces
      // "invalid_credentials", which reads as a wrong password rather than an
      // absent one.
      console.log(`          no password set — their old one does NOT carry over`);
    }

    if (invite) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`,
      });
      console.log(error ? `          reset email FAILED: ${error.message}` : "          reset email sent");
    }
  }

  console.log(`\nDone. Users keep their ids, so every attempt, note and lesson is intact.`);
  console.log(
    `\nNONE of them can sign in with their old password: bcrypt hashes cannot be\n` +
      `imported into Supabase Auth. Give each of them a way back in:\n\n` +
      `  npx tsx scripts/auth-link.ts password  <email> '<password>'   set one directly\n` +
      `  npx tsx scripts/auth-link.ts recovery  <email>                reset link, no email sent\n` +
      (invite
        ? ``
        : `  npx tsx scripts/migrate-users-to-supabase-auth.ts --invite    email reset links\n\n` +
          `The --invite route uses Supabase's built-in SMTP, which allows only a few\n` +
          `messages an hour; auth-link.ts never sends an email and is not limited.\n`)
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
