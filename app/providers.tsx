"use client";

import { TranslationProvider } from "@/components/translation/TranslationProvider";

// Client-side providers.
//
// The session is NOT one of them: it lives in cookies the server reads on every
// request, and the pages that need the user are server components calling
// auth().
//
// TranslationProvider is here rather than around each screen because its whole
// value is being shared — one cache and one in-flight request per session, so
// the same Danish word clicked in an opgave, in a verb example and in the
// reading library is fetched once. Scoped per page it would be three caches.
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <TranslationProvider>{children}</TranslationProvider>;
};
