import { NextResponse } from "next/server";
import { z } from "zod";
import { adminConfigured, createAdminClient } from "@/lib/supabase/admin";
import { users } from "@/lib/repositories";

// Creating an account.
//
// The password lives in Supabase Auth, not in our User table — that is what
// gives the new account a Supabase session, and therefore a JWT for Row Level
// Security to check. Writing a bcrypt hash into `User.passwordHash` (as this
// used to) produced an account that could sign in and then reach no data at
// all, because RLS denies a request with no JWT.
//
// The admin client is used because there is no session yet; `email_confirm`
// is set so the learner can sign in immediately, which matches how the app
// behaved before. Turn that off and require confirmation if you would rather
// verify addresses.

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server" },
      { status: 503 }
    );
  }

  const parsed = RegisterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { email, password, name } = parsed.data;

  const existing = await users.findByEmailForAuth(email);
  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });

  if (error || !data.user) {
    // Supabase owns uniqueness on email, so a race lands here rather than
    // creating a second identity.
    const alreadyExists = error?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      { error: alreadyExists ? "Account already exists" : (error?.message ?? "Could not create account") },
      { status: alreadyExists ? 409 : 400 }
    );
  }

  // The matching application row, carrying the id every foreign key uses.
  const user = await users.createUser({
    email,
    name: name ?? null,
    supabaseUserId: data.user.id,
    authProvider: "password",
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
