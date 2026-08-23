import { describe, expect, it } from "vitest";
import { AUTH_ERROR_CODES, classifyAuthError, isAuthErrorCode } from "./errors";

// Auth errors, classified without touching the network — which matters,
// because Supabase's built-in SMTP is rate-limited and exercising these
// against the real service burns that quota in a handful of runs.
//
// The codes below are the ones Supabase actually returned during live
// testing, not invented examples.

describe("classifyAuthError", () => {
  it("recognises a wrong password", () => {
    expect(classifyAuthError({ code: "invalid_credentials" })).toBe("invalid_credentials");
    expect(classifyAuthError({ message: "Invalid login credentials" })).toBe("invalid_credentials");
  });

  it("recognises a password Supabase rejects as weak", () => {
    expect(classifyAuthError({ code: "weak_password" })).toBe("weak_password");
    expect(classifyAuthError({ message: "Password should be at least 6 characters." })).toBe(
      "weak_password"
    );
  });

  it("recognises every rate-limit variant", () => {
    // The first version matched only over_request_rate_limit and missed the
    // email one, which is the limit a learner is most likely to hit.
    for (const code of [
      "over_request_rate_limit",
      "over_email_send_rate_limit",
      "over_sms_send_rate_limit",
    ]) {
      expect(classifyAuthError({ code }), code).toBe("rate_limited");
    }
    expect(classifyAuthError({ message: "For security purposes, you can only request this after 58 seconds" })).toBe("rate_limited");
    expect(classifyAuthError({ message: "email rate limit exceeded" })).toBe("rate_limited");
  });

  it("recognises an unconfirmed address", () => {
    expect(classifyAuthError({ code: "email_not_confirmed" })).toBe("email_not_confirmed");
  });

  it("recognises an expired reset or confirmation link", () => {
    expect(classifyAuthError({ message: "Email link is invalid or has expired" })).toBe("expired_link");
  });

  it("recognises an address already in use", () => {
    expect(classifyAuthError({ message: "User already registered" })).toBe("user_already_exists");
  });

  it("falls back to unknown rather than throwing", () => {
    expect(classifyAuthError(null)).toBe("unknown");
    expect(classifyAuthError({})).toBe("unknown");
    expect(classifyAuthError({ message: "something nobody anticipated" })).toBe("unknown");
  });

  it("is case-insensitive, since the wording is not a contract", () => {
    expect(classifyAuthError({ message: "INVALID LOGIN CREDENTIALS" })).toBe("invalid_credentials");
  });
});

describe("isAuthErrorCode", () => {
  it("accepts only known codes", () => {
    // The login page renders `?error=` from the URL. Anything unrecognised has
    // to be rejected, or that query parameter becomes a way to display
    // arbitrary text on a page that looks like the real sign-in screen.
    for (const code of AUTH_ERROR_CODES) expect(isAuthErrorCode(code)).toBe(true);
    expect(isAuthErrorCode("Your account is suspended, call 555-0100")).toBe(false);
    expect(isAuthErrorCode("")).toBe(false);
    expect(isAuthErrorCode(undefined)).toBe(false);
    expect(isAuthErrorCode(42)).toBe(false);
  });
});

describe("copy coverage", () => {
  it("has a message for every code", async () => {
    // A code with no entry renders as blank, which reads as "nothing went
    // wrong" at exactly the moment something did.
    const { en } = await import("@/lib/i18n/dictionaries/en");
    const { da } = await import("@/lib/i18n/dictionaries/da");
    for (const code of AUTH_ERROR_CODES) {
      expect(en.login.errors[code], `en: ${code}`).toBeTruthy();
      expect(da.login.errors[code], `da: ${code}`).toBeTruthy();
    }
  });
});
