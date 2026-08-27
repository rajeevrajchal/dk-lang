"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, passwordAuthEnabled } from "@/lib/supabase/client";
import { classifyAuthError, isAuthErrorCode } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n/LocaleProvider";
// Google sign-in is disabled while the app is invite-only — accounts are
// created by an admin (scripts/create-user.ts), not by whoever lands on this
// page. Re-enable by restoring this import and the <GoogleSignIn /> below.
// import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/components/auth/AuthCard";
import type { AuthErrorCode } from "@/types";

// Sign in. Invite-only: there is no self-serve registration.
//
// Talks to Supabase Auth from the browser, which is what sets the session
// cookies the server reads. That matters more than it looks: without a
// Supabase JWT, every Row Level Security policy denies the request, so an
// account that cannot get one is an account that can see nothing.
//
// Accounts are provisioned out of band by an admin running
// scripts/create-user.ts, which creates both the Supabase Auth identity and
// the application's User row with a password already set. There is nothing
// for this page to create.

const AuthForm = () => {
  const { dict } = useI18n();
  const t = dict.login;
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  // /auth/callback redirects here with ?error=<code> on a failed OAuth round
  // trip. Only known codes are rendered — see lib/auth/errors.ts for why.
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(
    isAuthErrorCode(urlError) ? urlError : urlError ? "unknown" : null
  );
  const [loading, setLoading] = useState(false);

  // With passwords off there is no way in at all while Google is disabled —
  // that combination is a misconfiguration, not a supported state.
  const showPassword = passwordAuthEnabled();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode(null);

    if (password.length < 8) {
      setErrorCode("weak_password");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorCode(classifyAuthError(error));
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorCode("unknown");
    } finally {
      setLoading(false);
    }
  };

  // Dev-only shortcut: no admin has to run scripts/create-user.ts before
  // anybody running the app locally can sign in. `NODE_ENV` is inlined at
  // build time, so this branch — and the fetch to /api/dev/test-login it
  // guards — is dead code in a production bundle, not just hidden by CSS.
  // The route itself refuses the request in production too, in case this
  // ever gets copy-pasted somewhere without the build-time strip.
  const handleTestLogin = async () => {
    setErrorCode(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dev/test-login", { method: "POST" });
      if (!res.ok) {
        setErrorCode("unknown");
        return;
      }
      const { email: testEmail, password: testPassword } = await res.json();

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (error) {
        setErrorCode(classifyAuthError(error));
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorCode("unknown");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {errorCode && <div className="mt-4"><ErrorNote>{t.errors[errorCode]}</ErrorNote></div>}

      {/* <GoogleSignIn callbackUrl={callbackUrl} showDivider={showPassword} /> */}

      {!showPassword ? null : (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label={t.emailLabel}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <Field
            label={t.passwordLabel}
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link
            href="/auth/forgot"
            className="mt-1.5 inline-block text-xs text-slate-500 hover:underline"
          >
            {t.forgotLink}
          </Link>
        </div>

        <SubmitButton loading={loading}>{t.submitLogin}</SubmitButton>
      </form>
      )}

      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          onClick={handleTestLogin}
          disabled={loading}
          className="mt-4 w-full rounded-md border border-dashed border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
        >
          Test login (dev only)
        </button>
      )}
    </AuthCard>
  );
};

const LoginPage = () => {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
};

export default LoginPage;
