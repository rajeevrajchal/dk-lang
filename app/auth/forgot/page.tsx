"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { classifyAuthError, type AuthErrorCode } from "@/lib/auth/errors";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { AuthCard, ErrorNote, Field, SubmitButton } from "@/components/auth/AuthCard";

// Requesting a password reset.
//
// The confirmation is deliberately the same whether or not an account exists:
// "if an account exists for that address, a link is on its way". Saying "no
// such account" would turn this form into a way of checking which email
// addresses are registered.

export default function ForgotPasswordPage() {
  const { dict } = useI18n();
  const t = dict.login;

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorCode(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Supabase sends a one-time code; /auth/callback exchanges it for a
        // session and then forwards to the page that sets the new password.
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
      });

      // Rate limiting is worth surfacing — the learner can act on it by
      // waiting. Everything else is folded into the neutral confirmation.
      if (error && classifyAuthError(error) === "rate_limited") {
        setErrorCode("rate_limited");
        return;
      }
      setSent(true);
    } catch {
      setErrorCode("unknown");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title={t.forgotTitle} subtitle={t.forgotSent} backHref="/login">
        <p className="mt-6 text-sm text-slate-500">{t.forgotSentNote}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t.forgotTitle} subtitle={t.forgotSubtitle} backHref="/login">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {errorCode && <ErrorNote>{t.errors[errorCode]}</ErrorNote>}
        <Field
          label={t.emailLabel}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SubmitButton loading={loading}>{t.forgotSubmit}</SubmitButton>
      </form>
    </AuthCard>
  );
}
