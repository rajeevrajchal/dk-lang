"use client";

import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// The frame every auth screen sits in.
//
// Extracted so sign-in, register, forgot-password and reset-password look like
// one flow rather than four pages that happen to be nearby.

export const AuthCard = ({
  title,
  subtitle,
  children,
  backHref,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
}) => {
  const { dict } = useI18n();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900">{title ?? dict.appName}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle ?? dict.login.subtitle}</p>

        {children}

        {backHref && (
          <Link
            href={backHref}
            className="mt-6 block text-center text-sm text-slate-500 hover:underline"
          >
            {dict.login.backToLogin}
          </Link>
        )}
      </div>
    </div>
  );
};

/** Field label + input, so the four forms cannot drift apart visually. */
export const Field = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
      />
    </div>
  );
};

export const ErrorNote = ({ children }: { children: React.ReactNode }) => {
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
};

export const SubmitButton = ({
  loading,
  children,
  disabled,
}: {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const { dict } = useI18n();
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
    >
      {loading ? dict.login.submitting : children}
    </button>
  );
};
