"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const LINKS = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/class", key: "class" as const },
  { href: "/reports", key: "reports" as const },
  { href: "/settings", key: "settings" as const },
];

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const { dict } = useI18n();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-5">
        <p className="text-sm font-semibold text-slate-900">{dict.appName}</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {dict.nav[link.key]}
            </Link>
          );
        })}
      </nav>

      {userEmail && (
        <div className="p-5 border-t border-slate-100">
          <p className="text-xs text-slate-400 truncate">{userEmail}</p>
        </div>
      )}
    </aside>
  );
}
