import type { ApiError } from "@/types";

// One way to call this app's own API.
//
// Every route in app/api answers with JSON and reports failure as
// `{ error, reason? }` with a status. Each caller used to re-implement that
// contract — `if (res.ok)` and nothing at all in the else branch was the
// common shape, which is why a failed submit looked exactly like a slow one.
//
// Failures come back as a rejected promise carrying an ApiError, so the
// hooks in lib/hooks can render them without every call site writing a
// try/catch of its own.

const messageFor = (status: number, body: { error?: string; reason?: string } | null): string => {
  if (body?.error && body.error !== "unavailable") return body.error;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 404) return "Not found.";
  if (status === 409) return body?.error ?? "That could not be done yet.";
  if (status === 503) return "This needs the AI service, which is not available right now.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  if (status === 0) return "No connection. Check your network and try again.";
  return "That request could not be completed.";
};

export const apiFetch = async <T>(
  url: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> => {
  const { json, ...rest } = init ?? {};

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      ...(json === undefined
        ? {}
        : {
            method: rest.method ?? "POST",
            headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
            body: JSON.stringify(json),
          }),
    });
  } catch (err) {
    // An aborted request is the caller replacing it, not a failure to report.
    if ((err as Error)?.name === "AbortError") throw err;
    const error: ApiError = { status: 0, message: messageFor(0, null) };
    throw error;
  }

  const body = (await res.json().catch(() => null)) as
    | ({ error?: string; reason?: string } & T)
    | null;

  if (!res.ok) {
    const error: ApiError = {
      status: res.status,
      message: messageFor(res.status, body),
      reason: body?.reason,
    };
    throw error;
  }

  return body as T;
};

/** Type guard, so a catch block can tell an ApiError from an abort. */
export const isApiError = (err: unknown): err is ApiError => {
  return typeof err === "object" && err !== null && "status" in err && "message" in err;
};
