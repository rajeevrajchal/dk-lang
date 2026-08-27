import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { users } from "@/lib/repositories";

// Ensures a fixed dev/test account exists, for the "Test login" button on
// /login. Not a real invite: this is the one account anybody running the app
// locally can get into without an admin running scripts/create-user.ts first.
//
// Blocked outright in production — both here and by the button itself being
// dead code once NODE_ENV is inlined at build time (see app/login/page.tsx)
// — because it creates an account with a known password on demand, and the
// admin client it needs bypasses Row Level Security entirely.

const TEST_EMAIL = "dev-test@dklang.local";
const TEST_PASSWORD = "dev-test-password-123";

export const POST = async () => {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  const existingUser = await users.findByEmailForAuth(TEST_EMAIL);
  if (existingUser?.supabaseUserId) {
    return NextResponse.json({ email: TEST_EMAIL, password: TEST_PASSWORD });
  }

  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  const existingIdentity = list.users.find(
    (u) => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase()
  );

  const supabaseUserId =
    existingIdentity?.id ??
    (
      await admin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Test User" },
      })
    ).data.user?.id;

  if (!supabaseUserId) {
    return NextResponse.json({ error: "Could not create test identity" }, { status: 500 });
  }

  // Reached only if the identity above pre-existed with no password we know,
  // or was just created — either way, `password` here is only correct for
  // the fresh-create branch. Force it so the button never signs in wrong.
  if (existingIdentity) {
    await admin.auth.admin.updateUserById(supabaseUserId, { password: TEST_PASSWORD });
  }

  if (existingUser) {
    await users.linkSupabaseIdentity(existingUser.id, supabaseUserId, existingUser.name);
  } else {
    await users.createUser({
      email: TEST_EMAIL,
      name: "Test User",
      supabaseUserId,
      authProvider: "credentials",
    });
  }

  return NextResponse.json({ email: TEST_EMAIL, password: TEST_PASSWORD });
};
