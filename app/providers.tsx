"use client";

// Client-side providers.
//
// Previously wrapped everything in NextAuth's SessionProvider. There is no
// equivalent now and none is needed: the session lives in cookies that the
// server reads on every request, and no client component asks for it — the
// pages that need the user are server components calling auth().
//
// Kept as a component rather than removed so app/layout.tsx does not need
// changing, and so there is an obvious place for the next client provider.
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
