"use client";

import { useCallback, useRef, useState } from "react";
import { isApiError } from "@/lib/http/client";
import type { ApiError } from "@/types";

// Running one thing the learner asked for — submit an answer, mark a verb
// learned, load an explanation.
//
// The guard is the point. Every submit button in the app was `onClick={submit}`
// with a `submitting` flag set INSIDE the async function, which leaves a window
// where two clicks both get through; and a failed submit set the flag back to
// false without telling anyone why nothing happened. A ref checked before the
// await closes the window, and the error is returned rather than swallowed.

export const useAction = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>
): {
  run: (...args: A) => Promise<R | null>;
  pending: boolean;
  error: ApiError | null;
  reset: () => void;
} => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  // Checked and set synchronously: state updates are batched, so a second
  // click in the same tick would still see `pending === false`.
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: A): Promise<R | null> => {
      if (inFlight.current) return null;
      inFlight.current = true;
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return null;
        setError(
          isApiError(err) ? err : { status: 0, message: "That could not be completed." }
        );
        return null;
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [fn]
  );

  const reset = useCallback(() => setError(null), []);

  return { run, pending, error, reset };
};
