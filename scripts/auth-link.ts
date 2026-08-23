/**
 * Produces a sign-in or password-reset link WITHOUT sending an email.
 *
 *     npx tsx scripts/auth-link.ts recovery you@example.com
 *     npx tsx scripts/auth-link.ts magiclink you@example.com
 *     npx tsx scripts/auth-link.ts password  you@example.com 'new-password'
 *
 * Why this exists: Supabase's built-in SMTP allows only a handful of messages
 * an hour and is explicitly for testing, so a few sign-up attempts and reset
 * requests exhaust it and everything afterwards fails with
 * over_email_send_rate_limit. `generateLink` asks the Auth API for the same
 * link the email would have contained and hands it back instead of posting it,
 * which never touches SMTP and so is never rate limited.
 *
 * Uses the service-role key, so it runs from a terminal only. The link it
 * prints signs somebody in — treat it like a password: do not paste it into a
 * chat, a ticket or a commit.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function env(): Record<string, string> {
  return Object.fromEntries(
    readFileSync(".env", "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const [k, ...rest] = l.split("=");
        return [k.trim(), rest.join("=").trim().replace(/^["']|["']$/g, "")];
      })
  );
}

async function main() {
  const [mode, email, password] = process.argv.slice(2);

  if (!mode || !email) {
    console.error(
      "usage:\n" +
        "  npx tsx scripts/auth-link.ts recovery  <email>              reset-password link\n" +
        "  npx tsx scripts/auth-link.ts magiclink <email>              one-click sign-in link\n" +
        "  npx tsx scripts/auth-link.ts password  <email> <password>   set a password directly"
    );
    process.exit(1);
  }

  const e = env();
  const url = e.NEXT_PUBLIC_SUPABASE_URL;
  const key = e.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

  const site = e.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  if (mode === "password") {
    if (!password) throw new Error("password mode needs a password as the third argument");

    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error(`no Supabase identity for ${email}`);

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      // Without this an unconfirmed account still cannot sign in, which looks
      // like the password not having been set.
      email_confirm: true,
    });
    if (error) throw new Error(error.message);

    console.log(`Password set for ${email}. Sign in at ${site}/login`);
    return;
  }

  if (mode !== "recovery" && mode !== "magiclink") {
    throw new Error(`unknown mode "${mode}" — use recovery, magiclink or password`);
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: mode,
    email,
    options: {
      // Routed through the app's callback so the one-time code is exchanged
      // for a session before the learner lands anywhere.
      redirectTo:
        mode === "recovery" ? `${site}/auth/callback?next=/auth/reset` : `${site}/auth/callback`,
    },
  });
  if (error) throw new Error(error.message);

  console.log(`\n${mode} link for ${email} — single use, expires in an hour:\n`);
  console.log(data.properties?.action_link);
  console.log("\nOpen it in the browser you want to be signed in. No email was sent.\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
