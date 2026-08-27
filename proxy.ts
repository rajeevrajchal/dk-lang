import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Route guard, and the place the Supabase session gets refreshed.
//
// The refresh is not optional. Supabase access tokens are short-lived, and the
// only place a refreshed token can be written back as a cookie is here — a
// Server Component cannot set cookies. Skipping it means every session quietly
// expires an hour after sign-in.
//
// Deliberately does NOT touch the database. This runs on every request
// including static assets, and Prisma has no place at the edge; it checks only
// whether a credible session exists and leaves identity resolution to
// lib/auth, which runs where the database is.

// /auth/* covers the OAuth callback, the forgot-password form and the
// reset-password page. The last one is reached holding a recovery session, so
// it must not be treated as "already signed in" and bounced to the dashboard.
//
// /api/dev/test-login has to be reachable signed OUT — that is the only time
// the "Test login" button on /login is ever used — so it needs the same
// carve-out. It is still safe in production: the route itself refuses to run
// there, this just stops middleware bouncing the request before it can say
// so, and the check is repeated here (not left to the route alone) so the
// path never becomes reachable pre-auth in prod even if that route changes.
const PUBLIC_PATHS =
  process.env.NODE_ENV === "production" ? ["/login"] : ["/login", "/api/dev/test-login"];

function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/");

  // The response has to be created up front so Supabase can attach refreshed
  // cookies to it as it goes.
  let response = NextResponse.next({ request: req });
  let signedIn = false;

  if (supabaseConfigured()) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (toSet) => {
            for (const { name, value } of toSet) req.cookies.set(name, value);
            response = NextResponse.next({ request: req });
            for (const { name, value, options } of toSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    try {
      // getUser rather than getSession: it revalidates the token with Supabase
      // instead of trusting a cookie the browser could have edited, and it is
      // the call that triggers the refresh.
      const { data } = await supabase.auth.getUser();
      if (data.user) signedIn = true;
    } catch {
      // Supabase unreachable. Treated as signed out: there is no second
      // session system to fall back to any more, and letting the request
      // through unauthenticated would be worse than a redirect to /login.
    }
  }

  if (!signedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in learners have no business on the sign-in form. /auth/reset is
  // deliberately not included: arriving there WITH a session is the whole
  // point of the flow.
  if (signedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
