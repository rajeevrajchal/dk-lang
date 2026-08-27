/**
 * Creates a new invited user: a Supabase Auth identity with a password
 * already set, and the application's User row, linked, in one step.
 *
 *     npx tsx scripts/create-user.ts you@example.com 'a-password' 'Full Name'
 *
 * Why this exists: the app is invite-only — app/login/page.tsx has no
 * self-serve registration, so the only way in is an account an admin
 * provisioned ahead of time. This is that provisioning step. The learner
 * signs in immediately with the email and password given here; there is no
 * confirmation email to wait on since email_confirm is set directly.
 *
 * Refuses to run if either side already exists — use scripts/auth-link.ts to
 * set a password for an existing Supabase identity, or
 * scripts/migrate-users-to-supabase-auth.ts to link an existing User row to a
 * new one.
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const admin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const main = async () => {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.error(
      "usage:\n  npx tsx scripts/create-user.ts <email> <password> [name]\n\n" +
        "password must be at least 8 characters — Supabase Auth rejects shorter ones."
    );
    process.exit(1);
  }
  if (password.length < 8) {
    throw new Error("password must be at least 8 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(
      `${email} already has a User row (id ${existing.id}). ` +
        `Use scripts/auth-link.ts to set a password for them instead.`
    );
  }

  const supabase = admin();

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(`could not list Supabase users: ${listError.message}`);
  if (list.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    throw new Error(
      `${email} already has a Supabase Auth identity with no linked User row. ` +
        `Run scripts/migrate-users-to-supabase-auth.ts logic manually or use auth-link.ts.`
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });
  if (error || !data.user) {
    throw new Error(`could not create Supabase identity: ${error?.message}`);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      supabaseUserId: data.user.id,
      authProvider: "credentials",
    },
  });

  console.log(`Created ${email} (User ${user.id}, Supabase ${data.user.id}).`);
  console.log(`They can sign in now at /login with the password given above.`);
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
