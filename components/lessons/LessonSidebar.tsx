"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { SidebarChapter } from "@/types";

// The course, always visible while you are in it.
//
// Chapters, their topics, what is done, and where you are right now. Every
// chapter is reachable from here at any time — the sidebar is a map, not a
// gate. Server components compute the state (progress.ts); this only draws
// it, so the rules live in one place and the sidebar cannot disagree with
// the pages.

const MARK: Record<SidebarChapter["status"], string> = {
  complete: "✓",
  in_progress: "→",
  available: "○",
};

export const LessonSidebar = ({
  chapters,
  completed,
  total,
  resumeHref,
  resumeLabel,
}: {
  chapters: SidebarChapter[];
  completed: number;
  total: number;
  resumeHref: string | null;
  resumeLabel: string;
}) => {
  const pathname = usePathname();
  const { dict } = useI18n();
  const t = dict.lessons;

  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <aside className="h-screen w-64 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <div className="p-5 border-b border-slate-100">
        <Link
          href="/lessons"
          className="text-sm font-semibold text-slate-900 hover:underline"
        >
          {t.courseTitle}
        </Link>
        <p className="mt-2 text-xs text-slate-500">
          {t.sidebarProgress(completed, total)}
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
        </div>
        {resumeHref && (
          <Link
            href={resumeHref}
            className="mt-3 block rounded-md bg-slate-900 text-white text-xs font-medium px-3 py-2 text-center"
          >
            {resumeLabel}
          </Link>
        )}
      </div>

      <nav className="p-3 space-y-1">
        {chapters.map((chapter) => {
          const chapterActive = pathname.startsWith(`/lessons/${chapter.id}`);
          const num = String(chapter.number).padStart(2, "0");

          return (
            <div key={chapter.id}>
              <Link
                href={`/lessons/${chapter.id}`}
                className={`flex items-start gap-2 rounded-md px-2.5 py-2 text-sm transition ${
                  chapterActive
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
                  aria-hidden
                  className={`w-4 shrink-0 text-center text-xs leading-5 ${
                    chapter.status === "complete"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                >
                  {MARK[chapter.status]}
                </span>
                <span className="truncate">
                  {num} {chapter.title}
                </span>
              </Link>

              {/* Topics only for the chapter you are in — the whole course
                  expanded at once is a wall, not a map. */}
              {chapterActive && (
                <ul className="mt-0.5 mb-1 ml-6 space-y-0.5 border-l border-slate-100 pl-3">
                  {chapter.topics.map((topic) => {
                    const href = `/lessons/${chapter.id}/${topic.lessonSlug}`;
                    const current = pathname === href;
                    return (
                      <li key={topic.lessonSlug}>
                        <Link
                          href={href}
                          className={`flex items-start gap-2 rounded px-2 py-1.5 text-xs transition ${
                            current
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`w-3 shrink-0 text-center leading-4 ${
                              current
                                ? "text-white"
                                : topic.done
                                  ? "text-emerald-600"
                                  : "text-slate-300"
                            }`}
                          >
                            {topic.done
                              ? "✓"
                              : current
                                ? "→"
                                : topic.started
                                  ? "→"
                                  : "○"}
                          </span>
                          <span>{topic.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
