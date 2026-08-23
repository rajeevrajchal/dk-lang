"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// The four learning areas, then settings. The order is the learner's journey:
// see where you are, learn, practise, test yourself.
const PRIMARY = [
  { href: "/dashboard", key: "dashboard" as const, icon: "🏠" },
  { href: "/lessons", key: "lessons" as const, icon: "📖" },
  { href: "/class", key: "class" as const, icon: "🎓" },
  { href: "/mock", key: "mock" as const, icon: "📝" },
];

const SECONDARY = [{ href: "/settings", key: "settings" as const, icon: "⚙" }];

export const Sidebar = ({ userEmail }: { userEmail?: string | null }) => {
  const pathname = usePathname();
  const { dict } = useI18n();

  // The routes that moved keep their old URLs working, so the nav has to
  // highlight the right area for both. /class/course is Lessons; the timed
  // exam and mock-test routes are Mock.
  const isActive = (href: string): boolean => {
    const aliases: Record<string, string[]> = {
      "/lessons": ["/class/course"],
      "/mock": ["/mock-test", "/exam"],
      "/class": ["/opgaver", "/practice"],
      "/settings": ["/reports"],
    };
    const prefixes = [href, ...(aliases[href] ?? [])];
    return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  };

  // /class/course is a Lessons URL, so Class must not also claim it.
  const lessonsActive = isActive("/lessons");

  const renderLink = (link: { href: string; key: "dashboard" | "lessons" | "class" | "mock" | "settings"; icon: string }) => {
    const active = link.href === "/class" ? isActive("/class") && !lessonsActive : isActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition ${
          active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <span aria-hidden className="text-base leading-none">
          {link.icon}
        </span>
        <span>{dict.nav[link.key]}</span>
      </Link>
    );
  };

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-5">
        <p className="text-sm font-semibold text-slate-900">{dict.appName}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {PRIMARY.map(renderLink)}
        <div className="pt-2 mt-2 border-t border-slate-100" />
        {SECONDARY.map(renderLink)}
      </nav>

      {userEmail && (
        <div className="p-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 truncate">{userEmail}</p>
        </div>
      )}
    </aside>
  );
};
