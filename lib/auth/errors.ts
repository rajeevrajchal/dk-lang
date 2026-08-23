// Turning Supabase auth errors into something a learner can act on.
//
// Two reasons this is not just `error.message`:
//
//  1. Supabase's messages are written for developers ("Invalid login
//     credentials", "For security purposes, you can only request this after
//     58 seconds"). Some are fine to show, some are noise.
//  2. The login page previously rendered whatever arrived in `?error=`
//     straight into the page. React escapes it, so it is not XSS — but it does
//     let anyone who can get a learner to click a link show them arbitrary
//     text on a page that looks like the real sign-in screen. Mapping to a
//     known set removes that.

import type { AuthErrorCode } from "@/types";

export const AUTH_ERROR_CODES = [
  "invalid_credentials",
  "email_not_confirmed",
  "user_already_exists",
  "weak_password",
  "rate_limited",
  "expired_link",
  "oauth_failed",
  "account_link_failed",
  "missing_code",
  "unknown",
] as const;
export const isAuthErrorCode = (value: unknown): value is AuthErrorCode => {
  return typeof value === "string" && (AUTH_ERROR_CODES as readonly string[]).includes(value);
};

/**
 * Classifies a Supabase auth error.
 *
 * Matches on Supabase's own `code` where it provides one and falls back to the
 * message text, because the codes are not populated for every failure and the
 * wording has been more stable than the coverage.
 */
export const classifyAuthError = (error: { message?: string; code?: string } | null): AuthErrorCode => {
  if (!error) return "unknown";

  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "invalid_credentials";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "user_already_exists";
  }
  if (code === "weak_password" || message.includes("password should be")) {
    return "weak_password";
  }
  // Supabase has several rate-limit codes — over_request_rate_limit,
  // over_email_send_rate_limit, over_sms_send_rate_limit. Matching the prefix
  // covers the ones that exist and the ones added later; the first version of
  // this checked one exact string and missed the email limit in testing.
  if (code.startsWith("over_") && code.includes("rate_limit")) return "rate_limited";
  if (message.includes("for security purposes") || message.includes("rate limit")) {
    return "rate_limited";
  }
  if (message.includes("expired") || message.includes("invalid or has expired")) {
    return "expired_link";
  }
  return "unknown";
};
