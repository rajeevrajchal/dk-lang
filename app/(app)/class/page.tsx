import Link from "next/link";
import { auth } from "@/lib/auth";
import { getModuleDashboardState, pickCurrentModuleId } from "@/lib/unlock";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ClassPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const moduleStates = await getModuleDashboardState(session!.user.id);
  const currentModuleId = pickCurrentModuleId(moduleStates);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{dict.class.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict.class.subtitle}</p>
      </div>

      <Link
        href="/class/course"
        className="block rounded-xl border-2 border-slate-900 bg-white p-5 hover:bg-slate-50"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-medium">{dict.course.title}</p>
            <p className="mt-1 text-sm text-slate-600">{dict.course.subtitle}</p>
          </div>
          <span className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5 whitespace-nowrap">
            {dict.course.startHere}
          </span>
        </div>
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {moduleStates.map((m) => {
          const copy = dict.moduleCopy[m.moduleId];
          const isCurrent = m.moduleId === currentModuleId;
          const clickable = m.practiceUnlocked;

          const statusLabel = m.isOralOnly
            ? dict.class.oralOnly
            : m.officiallyFullyPassed
              ? dict.class.officiallyPassed
              : m.inAppFullyPassed
                ? dict.class.appReady
                : m.practiceUnlocked
                  ? dict.class.unlockedForPractice
                  : dict.class.lockedStatus;

          const statusClass = m.isOralOnly
            ? "bg-slate-100 text-slate-500"
            : m.officiallyFullyPassed
              ? "bg-emerald-100 text-emerald-800"
              : m.inAppFullyPassed
                ? "bg-blue-100 text-blue-800"
                : m.practiceUnlocked
                  ? "bg-slate-100 text-slate-700"
                  : "bg-slate-50 text-slate-400";

          const body = (
            <div className="p-5 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{copy.name}</p>
                  {isCurrent && (
                    <span className="text-xs font-medium rounded-full bg-slate-900 text-white px-2 py-0.5">
                      {dict.class.continueBadge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{copy.cefrGoal}</p>
              </div>
              <span className={`text-xs font-medium rounded-full px-3 py-1 ${statusClass}`}>{statusLabel}</span>
            </div>
          );

          return clickable ? (
            <Link key={m.moduleId} href={`/class/${m.moduleId}`} className="block hover:bg-slate-50">
              {body}
            </Link>
          ) : (
            <div key={m.moduleId} className="opacity-50 cursor-not-allowed">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
