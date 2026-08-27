"use client";

import type { ApiError } from "@/types";

// Loading, empty and error, in one place.
//
// These three states are the difference between an app that feels broken and
// one that feels slow, and before this every screen invented its own — or,
// more often, none at all. They are deliberately plain: a skeleton that
// matches the shape of what is coming, one sentence when there is nothing,
// and a reason plus a retry when something failed.

export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded bg-slate-200/70 ${className}`}
    />
  );
};

/** A card-shaped placeholder, for lists of rows that are still loading. */
export const SkeletonCard = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
};

export const SkeletonList = ({ rows = 3, lines = 2 }: { rows?: number; lines?: number }) => {
  return (
    <div className="space-y-3" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
};

/**
 * Something failed. Always says what, and always offers the way out — a state
 * the learner cannot leave is worse than the failure that caused it.
 */
export const ErrorState = ({
  error,
  onRetry,
  retryLabel = "Try again",
  title = "That did not work",
}: {
  error: ApiError | { message: string } | null;
  onRetry?: () => void;
  retryLabel?: string;
  title?: string;
}) => {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-sm font-medium text-amber-900">{title}</p>
      <p className="mt-1 text-sm text-amber-800">
        {error?.message ?? "Something went wrong."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const Spinner = ({ className = "" }: { className?: string }) => {
  return (
    <span
      aria-hidden
      className={`inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px] ${className}`}
    />
  );
};

/**
 * A button that cannot be pressed twice.
 *
 * `pending` disables it AND says so, because a button that only greys out
 * leaves the learner wondering whether their click registered.
 */
export const ActionButton = ({
  onClick,
  pending,
  disabled,
  pendingLabel,
  children,
  variant = "primary",
  className = "",
  type = "button",
}: {
  onClick?: () => void;
  pending?: boolean;
  disabled?: boolean;
  pendingLabel?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
}) => {
  const base =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${base} ${className}`}
    >
      {pending && <Spinner />}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
};
