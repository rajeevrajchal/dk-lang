"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { classifyAuthError, type AuthErrorCode } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/components/auth/AuthCard";

// Choosing a new password.
//
// Reached only from a reset email: /auth/callback exchanges the one-time code
// for a session and forwards here, so by the time this renders the learner is
// already signed in — briefly, and only long enough to set a password. The
// session check below is what stops the form appearing to someone who simply
// typed the URL, who would otherwise fill it in and get an error on submit.

export default function ResetPasswordPage() {
  const { dict } = useI18n();
  const t = dict.login;
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);
  const [mismatch, setMismatch] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setHasSession(!!data.user);
      setChecking(false);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorCode(null);
    setMismatch(null);

    if (password.length < 8) {
      setMismatch(t.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setMismatch(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorCode(classifyAuthError(error));
        return;
      }
      setDone(true);
      // The recovery session becomes an ordinary one, so there is no second
      // sign-in step.
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorCode("unknown");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <AuthCard title={t.resetTitle}>
        <p className="mt-6 text-sm text-slate-500">{dict.common.loading}</p>
      </AuthCard>
    );
  }

  if (!hasSession) {
    return (
      <AuthCard title={t.resetTitle} backHref="/login">
        <div className="mt-6">
          <ErrorNote>{t.resetNoSession}</ErrorNote>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t.resetTitle} subtitle={done ? t.resetDone : t.resetSubtitle}>
      {!done && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorCode && <ErrorNote>{t.errors[errorCode]}</ErrorNote>}
          {mismatch && <ErrorNote>{mismatch}</ErrorNote>}

          <Field
            label={t.newPasswordLabel}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field
            label={t.confirmPasswordLabel}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <SubmitButton loading={loading}>{t.resetSubmit}</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
