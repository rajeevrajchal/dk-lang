"use client";

import { useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Sign in with Google, via Supabase.
//
// Renders nothing when Supabase is not configured, so a checkout with no
// environment set up shows the email/password form on its own rather than a
// button that throws when pressed.

export const GoogleSignIn = ({
  callbackUrl = "/dashboard",
  /**
   * The "or" divider separates this from the password form below. With no form
   * to separate from it is a rule under a lone button, so the caller turns it
   * off rather than this component guessing.
   */
  showDivider = true,
}: {
  callbackUrl?: string;
  showDivider?: boolean;
}) => {
  const { dict } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabaseConfigured()) return null;

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Supabase sends the learner here with a one-time code; the route
          // exchanges it and links the account. `next` is carried through so
          // they land where they were trying to go.
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
        },
      });
      if (error) throw error;
      // On success the browser is redirected to Google, so nothing after this
      // runs — no need to clear the loading state.
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.login.errorGeneric);
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <GoogleMark />
        {loading ? dict.login.submitting : dict.login.google}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {showDivider && (
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-wide text-slate-400">{dict.login.or}</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}
    </div>
  );
};

/** Google's mark, inline so the page makes no third-party request for it. */
const GoogleMark = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
};
