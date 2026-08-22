import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getLocale, getTranslateHelperDefault } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dansk Modultest Prep",
  description: "Danskuddannelse 3 (Modul 1-5) og PD3 eksamensforberedelse",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, translateHelperDefault] = await Promise.all([
    getLocale(),
    getTranslateHelperDefault(),
  ]);

  return (
    <html
      lang={locale}
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <LocaleProvider initialLocale={locale} initialTranslateHelperDefault={translateHelperDefault}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
