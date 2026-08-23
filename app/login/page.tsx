"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

function LoginForm() {
  const { dict } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  // /auth/callback redirects here with ?error=... when Google sign-in fails.
  const oauthError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || dict.login.errorCreateAccount);
        }
      }

      // Signs in against Supabase Auth, which sets the session cookies the
      // server reads. This is what gives the request a JWT — without one,
      // every Row Level Security policy denies the query.
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result?.error) {
        throw new Error(dict.login.errorInvalid);
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.login.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900">{dict.appName}</h1>
        <p className="mt-1 text-sm text-slate-500">{dict.login.subtitle}</p>

        {oauthError && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {oauthError}
          </p>
        )}

        <GoogleSignIn callbackUrl={callbackUrl} />

        <div className="mt-6 flex rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 font-medium ${
              mode === "login" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
            onClick={() => setMode("login")}
          >
            {dict.login.loginTab}
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 font-medium ${
              mode === "register" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
            onClick={() => setMode("register")}
          >
            {dict.login.registerTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-slate-700">{dict.login.nameLabel}</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">{dict.login.emailLabel}</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{dict.login.passwordLabel}</label>
            <input
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? dict.login.submitting : mode === "login" ? dict.login.submitLogin : dict.login.submitRegister}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
