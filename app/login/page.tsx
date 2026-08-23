"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { classifyAuthError, isAuthErrorCode, type AuthErrorCode } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/components/auth/AuthCard";

// Sign in, or create an account.
//
// Both talk to Supabase Auth from the browser, which is what sets the session
// cookies the server reads. That matters more than it looks: without a
// Supabase JWT, every Row Level Security policy denies the request, so an
// account that cannot get one is an account that can see nothing.
//
// Registration used to POST to /api/register, which called the admin API with
// the service-role key. That route is gone. A public endpoint holding a key
// that bypasses RLS is a bad trade for what it bought — and `signUp` is
// rate-limited by Supabase, honours the project's email-confirmation setting,
// and returns a session directly instead of needing a second sign-in call.

type Mode = "login" | "register";

function AuthForm() {
  const { dict } = useI18n();
  const t = dict.login;
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  // /auth/callback redirects here with ?error=<code> on a failed OAuth round
  // trip. Only known codes are rendered — see lib/auth/errors.ts for why.
  const urlError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(
    isAuthErrorCode(urlError) ? urlError : urlError ? "unknown" : null
  );
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorCode(null);

    if (password.length < 8) {
      setErrorCode("weak_password");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: name ? { full_name: name } : undefined,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
          },
        });
        if (error) {
          setErrorCode(classifyAuthError(error));
          return;
        }
        // No session means the project requires email confirmation. Say so
        // rather than appearing to do nothing.
        if (!data.session) {
          setAwaitingConfirmation(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorCode(classifyAuthError(error));
          return;
        }
      }

      // The application row is created on the first authenticated request by
      // resolveSupabaseUser, so there is nothing to create here — one code
      // path whether the learner arrived via Google or a password.
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorCode("unknown");
    } finally {
      setLoading(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <AuthCard title={t.checkEmailTitle} subtitle={t.checkEmailNote} backHref="/login">
        <p className="mt-6 text-sm text-slate-700">
          {t.checkEmailBody} <span className="font-medium">{email}</span>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      {errorCode && <div className="mt-4"><ErrorNote>{t.errors[errorCode]}</ErrorNote></div>}

      <GoogleSignIn callbackUrl={callbackUrl} />

      <div className="mt-6 flex rounded-lg bg-slate-100 p-1 text-sm">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setErrorCode(null);
            }}
            className={`flex-1 rounded-md py-1.5 font-medium ${
              mode === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            {m === "login" ? t.loginTab : t.registerTab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <Field
            label={t.nameLabel}
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />
        )}

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
            // Tells a password manager whether to offer a saved password or
            // generate a new one.
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "login" && (
            <Link
              href="/auth/forgot"
              className="mt-1.5 inline-block text-xs text-slate-500 hover:underline"
            >
              {t.forgotLink}
            </Link>
          )}
        </div>

        <SubmitButton loading={loading}>
          {mode === "login" ? t.submitLogin : t.submitRegister}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
