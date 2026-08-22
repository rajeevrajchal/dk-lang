import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { getServerDictionary } from "@/lib/i18n/server";

function fmtPct(n: number | null) {
  return n == null ? "—" : `${Math.round(n * 100)}%`;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const dict = await getServerDictionary();
  const data = await getDashboardData(userId, dict);

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8">
      <h1 className="text-xl font-semibold">{dict.dashboard.title}</h1>

      {/* Next recommended action */}
      <section className="rounded-xl border border-slate-200 bg-slate-900 text-white p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{dict.dashboard.nextActionEyebrow}</p>
          <p className="mt-1 text-lg font-medium">{data.nextAction.label}</p>
        </div>
        <Link
          href={data.nextAction.href}
          className="rounded-md bg-white text-slate-900 text-sm font-medium px-4 py-2 whitespace-nowrap"
        >
          {dict.dashboard.startNow}
        </Link>
      </section>

      {/* Per-skill status */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {dict.dashboard.statusPerSkill}
          </h2>
          <Link href="/class" className="text-sm text-slate-600 hover:underline">
            {dict.dashboard.viewClassOverview}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.skillStatuses.map((s) => (
            <div key={s.skill} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold">{s.label}</p>
              {!s.hasContent ? (
                <p className="mt-2 text-xs text-slate-400">{dict.dashboard.contentComingSoon}</p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold">{fmtPct(s.accuracy)}</p>
                  <p className="text-xs text-slate-500">
                    {dict.dashboard.attemptsTier(s.attemptCount, s.currentTier ?? 1)}
                  </p>
                  {s.weakestConstruct && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                      {dict.dashboard.weakestPoint(
                        s.weakestConstruct.name,
                        Math.round(s.weakestConstruct.accuracy * 100)
                      )}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {dict.dashboard.recentActivity}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {data.recentActivity.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">{dict.dashboard.noAttempts}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="p-3 px-5 flex items-center justify-between text-sm">
                  <span>
                    {dict.dashboard.activityRow(a.moduleId, dict.enums.skills[a.skill] ?? a.skill, a.tierId)}
                    {a.examSessionId && <span className="ml-2 text-xs text-slate-400">{dict.dashboard.mockTestTag}</span>}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={a.isCorrect ? "text-emerald-600" : "text-red-500"}>
                      {a.isCorrect ? dict.common.correct : dict.common.incorrect}
                    </span>
                    <span className="text-slate-400">{fmtDate(a.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Verified records */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {dict.dashboard.verifiedResults}
          </h2>
          <Link href="/reports" className="text-sm text-slate-600 hover:underline">
            {data.verifiedReportCards.length > 0 ? dict.dashboard.viewAll : dict.dashboard.uploadProof}
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {data.verifiedReportCards.length === 0 ? (
            <p className="text-sm text-slate-400">{dict.dashboard.noVerifiedResults}</p>
          ) : (
            <p className="text-sm text-slate-600">
              {dict.dashboard.verifiedResultsCount(data.verifiedReportCards.length)}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
