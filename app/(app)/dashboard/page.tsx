import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { describeActivity, getLearnerOverview } from "@/lib/dashboard";
import { moduleFor } from "@/lib/tasks/module";
import { ProgressPanel } from "@/components/tasks/ProgressPanel";
import { getServerDictionary } from "@/lib/i18n/server";

// The Dashboard answers three questions and no others: where am I, what have I
// done, and what should I do next. Everything else belongs in the area it
// comes from — detailed exercise history in Class, per-question review in
// Mock, the curriculum in Lessons.

const pct = (n: number | null | undefined) => {
  return n == null ? "—" : `${Math.round(n * 100)}%`;
};

const fmtDate = (d: Date | null | undefined) => {
  return d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DashboardPage = async () => {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.dashboard;
  const data = await getLearnerOverview(session!.user.id);

  // First run: ask for the level once, here, rather than interrupting the
  // learner with the question later. "Skip for now" on that screen sets
  // onboarded without a level, so this cannot become a loop.
  if (!data.level.onboarded) redirect("/onboarding");

  const continueTitle =
    data.continueCard.kind === "onboarding"
      ? t.continueOnboarding
      : data.continueCard.title ||
        (data.continueCard.category
          ? dict.exercises.categories[data.continueCard.category]
          : t.continueCourse);

  // No module label here any more: the learner's module is shown once, in the
  // level card, and repeating it on every card is what made the old dashboard
  // read as a module browser.
  const continueDetail = data.continueCard.detail ?? null;

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8">
      <h1 className="text-xl font-semibold">{t.title}</h1>

      {/* ---- Current level ------------------------------------------- */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t.yourLevel}
            </p>
            <p className="mt-1 text-2xl font-semibold">{data.levelLabel ?? t.levelNotSet}</p>
            {data.level.levelSource && (
              <p className="mt-1 text-xs text-slate-500">
                {data.level.levelSource === "ONBOARDING"
                  ? t.levelFromOnboarding
                  : t.levelFromOfficialResult}
              </p>
            )}
          </div>
          <Link
            href={data.level.unset ? "/onboarding" : "/settings"}
            className="text-sm text-slate-600 hover:underline whitespace-nowrap"
          >
            {data.level.unset ? t.levelSetIt : dict.level.change}
          </Link>
        </div>
        {/* The whole point of keeping level and performance apart, said out
            loud where the learner can see both. */}
        <p className="mt-3 text-xs text-slate-400">{t.levelNoteNotInferred}</p>
      </section>

      {/* ---- Continue where you left off ------------------------------ */}
      <section className="rounded-xl border border-slate-200 bg-slate-900 text-white p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {t.continueAreas[data.continueCard.kind]}
          </p>
          <p className="mt-1 text-lg font-medium">{continueTitle}</p>
          {continueDetail && <p className="text-sm text-slate-400">{continueDetail}</p>}
        </div>
        <Link
          href={data.continueCard.href}
          className="rounded-md bg-white text-slate-900 text-sm font-medium px-4 py-2 whitespace-nowrap"
        >
          {t.continueButton}
        </Link>
      </section>

      {/* ---- What you have practised, and what to do next ------------
          Replaces the module grid that used to be the Dashboard's main
          navigation. A learner asks "what should I work on?", not "which
          module am I allowed into?". */}
      <ProgressPanel userId={session!.user.id} moduleId={moduleFor(data.level.currentModule)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Lesson progress --------------------------------------- */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {t.lessonProgress}
            </h2>
            <Link href="/lessons" className="text-xs text-slate-500 hover:underline">
              {dict.nav.lessons} →
            </Link>
          </div>

          <p className="mt-3 text-sm text-slate-700">
            {t.lessonsCompleted(data.lessons.completed, data.lessons.total)}
          </p>
          {data.lessons.currentChapterTitle && (
            <p className="mt-1 text-xs text-slate-500">
              {t.currentChapter}: {data.lessons.currentChapterTitle}
            </p>
          )}

          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900"
              style={{ width: `${Math.round(data.lessons.ratio * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.chaptersCompleted(data.lessons.chaptersComplete, data.lessons.chaptersTotal)}
          </p>

          {data.lessons.resume && (
            <Link
              href={`/lessons/${data.lessons.resume.chapter.id}/${data.lessons.resume.lessonSlug}`}
              className="mt-4 inline-block rounded-md border border-slate-300 text-sm font-medium px-4 py-2"
            >
              {t.continueLearning}
            </Link>
          )}
        </section>

        {/* ---- Reading habit ----------------------------------------- */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {t.readingHabit}
            </h2>
            {data.readingHabit.currentStreak > 0 && (
              <span className="text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1">
                {t.readingHabitStreak(data.readingHabit.currentStreak)}
              </span>
            )}
          </div>

          {/* The last four weeks, one dot per day. Visible habit, not an
              analytics page. */}
          <div className="mt-4 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((label) => (
              <p key={label} className="text-[10px] text-slate-400 text-center">
                {label}
              </p>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {/* Pad so each column really is that weekday, rather than a grid
                that happens to be seven wide. */}
            {Array.from({ length: data.readingHabit.days[0]?.weekday ?? 0 }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {data.readingHabit.days.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · ${day.sessions}`}
                className={`aspect-square rounded ${
                  day.active
                    ? "bg-slate-900"
                    : day.isToday
                      ? "border border-slate-300 bg-white"
                      : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {data.readingHabit.totalSessions === 0
              ? t.readingHabitNone
              : t.readingHabitDays(data.readingHabit.activeDays)}
          </p>
          <Link
            href="/class/reading"
            className="mt-3 inline-block text-xs text-slate-500 hover:underline"
          >
            {dict.class2.skills.READING} →
          </Link>
        </section>

        {/* ---- Mock tests -------------------------------------------- */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {t.mockTests}
            </h2>
            <Link href="/mock" className="text-xs text-slate-500 hover:underline">
              {dict.nav.mock} →
            </Link>
          </div>

          {data.mock.completed === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{t.mockNone}</p>
          ) : (
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-slate-500">{t.mockCompleted}</dt>
              <dd className="text-right font-medium">{data.mock.completed}</dd>

              <dt className="text-slate-500">{t.mockLatest}</dt>
              <dd className="text-right">
                <span className="text-slate-400">{fmtDate(data.mock.latest?.completedAt)}</span>
              </dd>

              <dt className="text-slate-500">{t.mockBest}</dt>
              <dd className="text-right font-medium">{pct(data.mock.best?.readingScore)}</dd>

              <dt className="text-slate-500">{t.mockLast}</dt>
              <dd className="text-right font-medium">{pct(data.mock.latest?.readingScore)}</dd>
            </dl>
          )}
        </section>
      </div>

      {/* ---- Recent activity ------------------------------------------ */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.recentActivity}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {data.recent.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">{t.noActivity}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recent.map((entry) => (
                <li
                  key={entry.id}
                  className="p-3 px-5 flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 whitespace-nowrap">
                      {t.activityKinds[entry.kind]}
                    </span>
                    <span className="truncate">{describeActivity(entry, dict)}</span>
                  </span>
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    {entry.total != null && entry.score != null && (
                      <span className="text-slate-500">
                        {entry.score}/{entry.total}
                      </span>
                    )}
                    <span className="text-slate-400">{fmtDate(entry.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
