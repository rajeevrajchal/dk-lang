"use client";

import { createContext, useContext, useRef, useState } from "react";
import { apiFetch } from "@/lib/http/client";
import { MAX_TRANSLATION_BATCH } from "@/lib/translation/constants";
import type { Translation, TranslationKind, TranslationRequestItem } from "@/types";

// One translation cache for the whole session, and one request for everything
// a screen asks for at once.
//
// The requirement this exists to satisfy is "avoid unnecessary API calls when
// the same word or sentence has already been translated". Three things make
// that true, and all of them have to live above the components:
//
//   1. a cache keyed by the Danish itself, so the same word clicked in two
//      different exercises is fetched once per session;
//   2. coalescing — everything requested inside one tick goes up as a single
//      batch, so opening a paragraph's translations is one request, not twelve;
//   3. in-flight tracking, so clicking the same word twice quickly does not
//      fire the identical call twice.
//
// Nothing here is memoized by hand. The React Compiler is enabled in this
// project (see eslint.config.mjs) and does it better than a dependency array
// written around refs would.

const cacheKey = (danish: string, kind: TranslationKind): string => {
  return `${kind}:${danish.trim().replace(/\s+/g, " ").toLowerCase()}`;
};

interface TranslationContextValue {
  /** Cached translation, if we already have it. */
  get: (danish: string, kind: TranslationKind) => Translation | null;
  /** Whether a request covering this piece is in flight. */
  isPending: (danish: string, kind: TranslationKind) => boolean;
  /** Ask for one or more pieces; resolves once they have all been tried. */
  request: (items: TranslationRequestItem[]) => Promise<void>;
  /** Last failure, so a component can say why nothing appeared. */
  error: string | null;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  // The cache lives in a ref and drives re-renders through `version`. In state
  // it would have to be copied on every insert, and a batch of twenty inserts
  // would copy it twenty times.
  const cache = useRef(new Map<string, Translation>());
  // key -> the promise that will settle when the batch carrying it comes back.
  const pending = useRef(new Map<string, Promise<void>>());
  const queue = useRef<TranslationRequestItem[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const flush = async () => {
    const items = queue.current.splice(0, MAX_TRANSLATION_BATCH);
    flushTimer.current = null;
    if (items.length === 0) return;

    try {
      const { translations } = await apiFetch<{ translations: (Translation | null)[] }>(
        "/api/translate",
        { json: { items } }
      );
      translations.forEach((t, i) => {
        if (t) cache.current.set(cacheKey(items[i].danish, items[i].kind), t);
      });
      setError(null);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Translation is unavailable.");
    } finally {
      for (const item of items) pending.current.delete(cacheKey(item.danish, item.kind));
      setVersion((v) => v + 1);
      // Anything queued while this batch was in flight goes next.
      if (queue.current.length > 0 && flushTimer.current === null) {
        flushTimer.current = setTimeout(() => void flush(), 0);
      }
    }
  };

  const request = async (items: TranslationRequestItem[]): Promise<void> => {
    const waits: Promise<void>[] = [];
    const fresh: TranslationRequestItem[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      const key = cacheKey(item.danish, item.kind);
      if (cache.current.has(key) || seen.has(key)) continue;
      seen.add(key);
      const inFlight = pending.current.get(key);
      if (inFlight) {
        waits.push(inFlight);
        continue;
      }
      fresh.push(item);
    }

    if (fresh.length > 0) {
      queue.current.push(...fresh);

      // One promise for the whole batch, resolved by the flush that carries
      // it. Every key in the batch is registered against it, so a second
      // request for any of them waits rather than starting a new call.
      let settle!: () => void;
      const batch = new Promise<void>((resolve) => {
        settle = resolve;
      });
      for (const item of fresh) pending.current.set(cacheKey(item.danish, item.kind), batch);
      waits.push(batch);

      if (flushTimer.current === null) {
        // A zero-delay timer rather than a microtask: it lets every component
        // that renders in this tick join the same batch.
        flushTimer.current = setTimeout(() => void flush().finally(settle), 0);
      } else {
        // A flush is already scheduled and will pick these up; settle when it
        // has cleared them.
        const wait = setInterval(() => {
          if (fresh.every((i) => !pending.current.has(cacheKey(i.danish, i.kind)))) {
            clearInterval(wait);
            settle();
          }
        }, 40);
      }
    }

    await Promise.all(waits);
  };

  const value: TranslationContextValue = {
    // `version` is read here so this object — and so every consumer — is
    // rebuilt when the cache changes.
    get: (danish, kind) => {
      void version;
      return cache.current.get(cacheKey(danish, kind)) ?? null;
    },
    isPending: (danish, kind) => pending.current.has(cacheKey(danish, kind)),
    request,
    error,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslations = (): TranslationContextValue => {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within a TranslationProvider");
  }
  return ctx;
};

/**
 * Several sentences at once — a section, an advert, a list of questions.
 *
 * Keyed by the Danish itself rather than by index, so a caller that re-renders
 * in a different order still lines them up. Requesting them together is what
 * turns "translate this section" into one request instead of one per line.
 */
export const useSentenceTranslations = (
  texts: string[]
): {
  english: Map<string, string>;
  pending: boolean;
  load: () => Promise<void>;
} => {
  const { get, isPending, request } = useTranslations();

  const english = new Map<string, string>();
  for (const text of texts) {
    const t = get(text, "SENTENCE");
    if (t) english.set(text, t.english);
  }

  return {
    english,
    pending: texts.some((t) => isPending(t, "SENTENCE")),
    load: () => request(texts.map((danish) => ({ danish, kind: "SENTENCE" as const }))),
  };
};
