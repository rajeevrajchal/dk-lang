import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { SKILL_LABELS_DA } from "@/lib/constants";

function fmtPct(n: number | null) {
  return n == null ? "—" : `${Math.round(n * 100)}%`;
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const data = await getDashboardData(userId);
  const currentModule = MODULE_BY_ID.get(data.currentModuleId)!;

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dansk Modultest Prep</h1>
          <p className="text-sm text-slate-500">{session?.user?.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-slate-500 hover:underline">Log ud</button>
        </form>
      </header>

      {/* Next recommended action */}
      <section className="rounded-xl border border-slate-200 bg-slate-900 text-white p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Næste anbefalede handling</p>
          <p className="mt-1 text-lg font-medium">{data.nextAction.label}</p>
        </div>
        <Link
          href={data.nextAction.href}
          className="rounded-md bg-white text-slate-900 text-sm font-medium px-4 py-2 whitespace-nowrap"
        >
          Start nu
        </Link>
      </section>

      {/* Current module */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Aktuelt modul
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold">
              {currentModule.name} {currentModule.isFinalExam && "(PD3)"}
            </h3>
            <span className="text-sm text-slate-500">{currentModule.cefrGoal}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{currentModule.description}</p>
        </div>
      </section>

      {/* Per-skill status */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Status pr. færdighed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.skillStatuses.map((s) => (
            <div key={s.skill} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold">{s.label}</p>
              {!s.hasContent ? (
                <p className="mt-2 text-xs text-slate-400">Indhold kommer snart</p>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-semibold">{fmtPct(s.accuracy)}</p>
                  <p className="text-xs text-slate-500">
                    {s.attemptCount} forsøg &middot; Tier {s.currentTier}
                  </p>
                  {s.weakestConstruct && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                      Svagt punkt: {s.weakestConstruct.name} ({Math.round(s.weakestConstruct.accuracy * 100)}%)
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Module map with unlock state */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Moduloversigt &amp; låst status
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {data.moduleStates.map((m) => (
            <div key={m.moduleId} className="p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">
                  {m.name} {m.isFinalExam && <span className="text-xs text-slate-400">(PD3)</span>}
                </p>
                {!m.isOralOnly && (
                  <div className="mt-1 flex gap-3 text-xs text-slate-500">
                    {m.disciplines.map((d) => (
                      <span key={d.skill}>
                        {SKILL_LABELS_DA[d.skill]}:{" "}
                        <span className={d.inAppPassed ? "text-emerald-700" : "text-slate-400"}>
                          app {d.inAppPassed ? "✓" : "–"}
                        </span>{" "}
                        <span
                          className={
                            d.officialPassed === true
                              ? "text-emerald-700"
                              : d.officialPassed === false
                                ? "text-red-600"
                                : "text-slate-400"
                          }
                        >
                          / officiel {d.officialPassed === null ? "–" : d.officialPassed ? "✓" : "✗"}
                        </span>
                        {d.discrepancy && <span className="ml-1 text-amber-600">⚠ uoverensstemmelse</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={`text-xs font-medium rounded-full px-3 py-1 ${
                  m.isOralOnly
                    ? "bg-slate-100 text-slate-500"
                    : m.officiallyFullyPassed
                      ? "bg-emerald-100 text-emerald-800"
                      : m.inAppFullyPassed
                        ? "bg-blue-100 text-blue-800"
                        : m.practiceUnlocked
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-50 text-slate-400"
                }`}
              >
                {m.isOralOnly
                  ? "Kun mundtlig"
                  : m.officiallyFullyPassed
                    ? "Officielt bestået"
                    : m.inAppFullyPassed
                      ? "Praksis-klar (app)"
                      : m.practiceUnlocked
                        ? "Låst op til øvelse"
                        : "Låst"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Seneste aktivitet
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white">
          {data.recentActivity.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">Ingen øvelser endnu.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="p-3 px-5 flex items-center justify-between text-sm">
                  <span>
                    Modul {a.moduleId} &middot; {SKILL_LABELS_DA[a.skill as keyof typeof SKILL_LABELS_DA] ?? a.skill}{" "}
                    &middot; Tier {a.tierId}
                    {a.examSessionId && <span className="ml-2 text-xs text-slate-400">(mock test)</span>}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={a.isCorrect ? "text-emerald-600" : "text-red-500"}>
                      {a.isCorrect ? "Rigtigt" : "Forkert"}
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
            Verificerede resultater (uploadet)
          </h2>
          <Link href="/reports" className="text-sm text-slate-600 hover:underline">
            Upload et resultatbevis &rarr;
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white">
          {data.verifiedReportCards.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">
              Ingen verificerede resultater endnu. Disse er adskilt fra app&apos;ens interne mock-resultater
              og kommer fra dit sprogcenters resultatbevis.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.verifiedReportCards.map((r) => (
                <li key={r.id} className="p-3 px-5 text-sm">
                  <span className="font-medium">{r.extractedSprogcenter}</span> &middot; Modul{" "}
                  {r.extractedModule} &middot;{" "}
                  {r.extractedDate ? fmtDate(r.extractedDate) : "ukendt dato"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
