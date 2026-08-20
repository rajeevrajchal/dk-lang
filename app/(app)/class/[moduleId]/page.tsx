import Link from "next/link";
import { auth } from "@/lib/auth";
import { getModuleDashboardState, MODULTEST_SKILLS, PD3_SKILLS } from "@/lib/unlock";
import { getSkillStatusesForModule, hasContent } from "@/lib/dashboard";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { theoryForTiers } from "@/lib/content-gen/theory";
import { categoryHasContent } from "@/lib/exercises/registry";
import { EXERCISE_CATEGORIES } from "@/lib/exercises/types";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ClassModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);

  const session = await auth();
  const dict = await getServerDictionary();
  const moduleStates = await getModuleDashboardState(session!.user.id);
  const state = moduleStates.find((m) => m.moduleId === moduleIdNum);
  const copy = dict.moduleCopy[moduleIdNum];

  if (!state || !copy) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Link href="/class" className="text-sm text-slate-500 hover:underline">
          {dict.class.backToClass}
        </Link>
      </div>
    );
  }

  if (!state.practiceUnlocked && !state.isOralOnly) {
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-4">
        <Link href="/class" className="text-sm text-slate-500 hover:underline">
          {dict.class.backToClass}
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">{copy.name}</h1>
          <p className="mt-3 text-sm text-slate-600">{dict.class.lockedMessage}</p>
        </div>
      </div>
    );
  }

  const requiredSkills = state.isOralOnly ? [] : state.isFinalExam ? PD3_SKILLS : MODULTEST_SKILLS;
  const skillStatuses = await getSkillStatusesForModule(session!.user.id, moduleIdNum, dict);
  const lessonSkills = skillStatuses.filter((s) => requiredSkills.includes(s.skill));

  const mod = MODULE_BY_ID.get(moduleIdNum);
  const theoryLessons = mod ? theoryForTiers(mod.tiersSpanned) : [];

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <Link href="/class" className="text-sm text-slate-500 hover:underline">
        {dict.class.backToClass}
      </Link>

      <div>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-xl font-semibold">
            {copy.name} {state.isFinalExam && "(PD3)"}
          </h1>
          <span className="text-sm text-slate-500">{copy.cefrGoal}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{copy.description}</p>
        {state.isOralOnly && (
          <span className="mt-3 inline-block text-xs font-medium rounded-full bg-slate-100 text-slate-500 px-3 py-1">
            {dict.class.oralOnly}
          </span>
        )}
      </div>

      {!state.isOralOnly && (
        <>
          {theoryLessons.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                {dict.class.theorySection}
              </h2>
              <Link
                href={`/class/${moduleIdNum}/theory`}
                className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium">{dict.class.theorySectionDesc}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {dict.theory.lessonsCount(theoryLessons.length)}
                    </p>
                  </div>
                  <span className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5">
                    {dict.class.openTheory}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {theoryLessons.slice(0, 6).map((l) => (
                    <span
                      key={l.slug}
                      className="text-xs rounded-full bg-slate-100 text-slate-600 px-2.5 py-1"
                    >
                      {l.title}
                    </span>
                  ))}
                  {theoryLessons.length > 6 && (
                    <span className="text-xs text-slate-400 px-1 py-1">
                      +{theoryLessons.length - 6}
                    </span>
                  )}
                </div>
              </Link>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              {dict.exercises.sectionTitle}
            </h2>
            <p className="text-sm text-slate-500 mb-3">{dict.exercises.sectionDesc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXERCISE_CATEGORIES.map((cat) => {
                const available = categoryHasContent(moduleIdNum, cat);
                const body = (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{dict.exercises.categories[cat]}</p>
                      {available && (
                        <span className="text-xs font-medium rounded-md border border-slate-300 px-2.5 py-1">
                          {dict.exercises.open}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {dict.exercises.categorySubtitles[cat]}
                    </p>
                  </>
                );
                return available ? (
                  <Link
                    key={cat}
                    href={`/opgaver/${moduleIdNum}/${cat.toLowerCase()}`}
                    className="rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={cat} className="rounded-xl border border-slate-200 bg-white p-5 opacity-50">
                    {body}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {dict.class.lessonsAndPractice}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lessonSkills.map((s) => (
                <div key={s.skill} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{s.label}</p>
                    {s.hasContent && (
                      <Link
                        href={`/practice/reading/${moduleIdNum}`}
                        className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5"
                      >
                        {dict.class.practiceButton}
                      </Link>
                    )}
                  </div>
                  {s.hasContent ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {dict.dashboard.attemptsTier(s.attemptCount, s.currentTier ?? 1)}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">{dict.dashboard.contentComingSoon}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border-2 border-slate-900 bg-white p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {state.isFinalExam ? dict.class.pd3FinalExam : dict.class.moduleTest}
              </h2>
              {hasContent(moduleIdNum, "READING") && (
                <Link
                  href={`/exam/reading/${moduleIdNum}`}
                  className="text-sm font-medium rounded-md bg-slate-900 text-white px-4 py-2"
                >
                  {dict.class.startTest}
                </Link>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">{dict.class.passThresholdNote}</p>

            <div className="mt-4 space-y-2">
              {state.disciplines.map((d) => (
                <div key={d.skill} className="flex items-center justify-between text-sm">
                  <span>{dict.enums.skills[d.skill]}</span>
                  <span className="flex items-center gap-2 text-xs">
                    <span className={d.inAppPassed ? "text-emerald-700" : "text-slate-400"}>
                      {dict.class.appLabel} {d.inAppPassed ? "✓" : "–"}
                    </span>
                    <span
                      className={
                        d.officialPassed === true
                          ? "text-emerald-700"
                          : d.officialPassed === false
                            ? "text-red-600"
                            : "text-slate-400"
                      }
                    >
                      / {dict.class.officialLabel} {d.officialPassed === null ? "–" : d.officialPassed ? "✓" : "✗"}
                    </span>
                    {d.discrepancy && <span className="text-amber-600">{dict.class.discrepancy}</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
