import Link from "next/link";
import { auth } from "@/lib/auth";
import { DANISH_COURSE } from "@/lib/curriculum/course";
import { loadLessonProgress } from "@/lib/curriculum/lesson-progress";
import {
  chapterProgress,
  chapterStatus,
  moduleReadiness,
  resumePoint,
} from "@/lib/curriculum/progress";
import { getServerDictionary } from "@/lib/i18n/server";

// Lessons — the grammar course, moved here from /class/course unchanged in
// substance. The curriculum data, the ordering and the unlock rules are the
// ones that were already designed (lib/curriculum/*); what is new is that this
// is its own area with its own sidebar, rather than a card inside Class.

const STATUS_STYLES: Record<string, string> = {
  complete: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-blue-100 text-blue-800",
  available: "bg-slate-100 text-slate-700",
};

export default async function LessonsPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.course;
  const progress = await loadLessonProgress(session!.user.id);
  const resume = resumePoint(progress);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{dict.lessons.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{dict.lessons.subtitle}</p>
      </div>

      {/* Lessons answer "what should I learn next?" — so they say so outright
          rather than presenting a menu. */}
      {resume && (
        <Link
          href={`/lessons/${resume.chapter.id}/${resume.lessonSlug}`}
          className="block rounded-xl border border-slate-200 bg-slate-900 text-white p-6 hover:bg-slate-800"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {resume.resumed ? dict.lessons.resume : t.nextUp}
          </p>
          <p className="mt-1 text-lg font-medium">
            {t.chapterLabel(resume.chapter.number)} · {resume.chapter.title}
          </p>
        </Link>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.yourPath}
        </h2>
        <ol className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {DANISH_COURSE.chapters.map((chapter) => {
            const status = chapterStatus(chapter, progress);
            const { done, total } = chapterProgress(chapter, progress);

            const body = (
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {t.chapterLabel(chapter.number)}
                    </span>
                    <p className="font-medium">{chapter.title}</p>
                    <span className="text-xs text-slate-400">{chapter.danishTitle}</span>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_STYLES[status]}`}
                  >
                    {status === "complete"
                      ? t.statusComplete
                      : status === "in_progress"
                        ? t.statusInProgress
                        : t.statusAvailable}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{chapter.intro}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>{t.progressOf(done, total)}</span>
                  <span>{t.supportsModules(chapter.supportsModules.join(", "))}</span>
                </div>
              </div>
            );

            return (
              <li key={chapter.id}>
                <Link href={`/lessons/${chapter.id}`} className="block hover:bg-slate-50">
                  {body}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Milestones, deliberately below the grammar spine rather than being it. */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {dict.lessons.milestones}
        </h2>
        <p className="text-xs text-slate-500 mb-3">{dict.lessons.milestonesNote}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((m) => {
            const r = moduleReadiness(m, progress);
            return (
              <div key={m} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs font-semibold text-slate-500">Modul {m}</p>
                <p className="mt-1 text-lg font-semibold">{Math.round(r.ratio * 100)}%</p>
                <p className="text-xs text-slate-400">
                  {dict.lessons.moduleReadiness(r.complete, r.total)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
