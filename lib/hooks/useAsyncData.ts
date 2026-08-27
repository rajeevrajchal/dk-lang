"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, isApiError } from "@/lib/http/client";
import type { ApiError, AsyncState } from "@/types";

// Fetching data for a screen, with the three things every fetch in this app
// needs and most of them were missing:
//
//   1. a real error state, rather than a permanent spinner;
//   2. cancellation, so a reply to a request the learner has already moved on
//      from cannot overwrite the current one;
//   3. no duplicate in-flight request for the same thing.
//
// `keepPreviousData` matters for the exercise runner: while the next opgave
// loads, the header should not flash empty.

export const useAsyncData = <T>(
  /** Null pauses the fetch — for a request that depends on something not chosen yet. */
  url: string | null,
  options?: { keepPreviousData?: boolean }
): AsyncState<T> & { reload: () => void } => {
  const [state, setState] = useState<AsyncState<T>>({
    status: url ? "loading" : "idle",
    data: null,
    error: null,
  });
  // Bumped to force a refetch without changing the url.
  const [nonce, setNonce] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({
      status: "loading",
      data: options?.keepPreviousData ? prev.data : null,
      error: null,
    }));

    apiFetch<T>(url, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
        const error: ApiError = isApiError(err)
          ? err
          : { status: 0, message: "That request could not be completed." };
        setState((prev) => ({ status: "error", data: prev.data, error }));
      });

    return () => controller.abort();
    // `options` is read once per fetch; including the object would refetch on
    // every render of a caller that builds it inline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, reload };
};
