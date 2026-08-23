"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Level and official results, in Settings, where a fact about the learner
// belongs — not scattered through the learning areas.
//
// The two are deliberately adjacent and deliberately distinct: the level is
// what the learner says they are, the results are the tests they actually sat.
// Nothing on this screen reads a practice score.

export interface OfficialResultRow {
  id: string;
  testType: string;
  education: string | null;
  module: number | null;
  result: string | null;
  takenAt: string | null;
  source: string;
  note: string | null;
}

export function LevelSection({
  education,
  currentModule,
  levelSource,
  results,
}: {
  education: string | null;
  currentModule: number | null;
  levelSource: string | null;
  results: OfficialResultRow[];
}) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.level;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftEducation, setDraftEducation] = useState(education);
  const [draftModule, setDraftModule] = useState(currentModule);

  const [adding, setAdding] = useState(false);
  const [testType, setTestType] = useState("MODULTEST");
  const [resultModule, setResultModule] = useState<number | null>(currentModule);
  const [outcome, setOutcome] = useState<string | null>("PASSED");
  const [takenAt, setTakenAt] = useState("");

  async function saveLevel() {
    setSaving(true);
    await fetch("/api/profile/level", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ education: draftEducation, currentModule: draftModule }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function addResult() {
    setSaving(true);
    await fetch("/api/profile/official-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testType,
        education: draftEducation ?? education,
        module: testType === "PD3" ? null : resultModule,
        result: outcome,
        takenAt: takenAt || null,
      }),
    });
    setSaving(false);
    setAdding(false);
    router.refresh();
  }

  async function removeResult(id: string) {
    await fetch(`/api/profile/official-results?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const levelText =
    education || currentModule
      ? [education === "DU3" ? "PD3" : education, currentModule ? `Modul ${currentModule}` : null]
          .filter(Boolean)
          .join(" · ")
      : t.notSet;

  return (
    <>
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.title}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          {!editing ? (
            <>
              <p className="text-lg font-semibold">{levelText}</p>
              {levelSource && (
                <p className="text-xs text-slate-500">
                  {t.source}:{" "}
                  {levelSource === "ONBOARDING" ? t.sourceOnboarding : t.sourceOfficialResult}
                </p>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm text-slate-600 hover:underline"
              >
                {t.change}
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">{t.education}</p>
                <div className="flex gap-2">
                  {(["DU2", "DU3"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDraftEducation(option)}
                      className={`rounded-md border px-4 py-1.5 text-sm ${
                        draftEducation === option
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1.5">{t.module}</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraftModule(n)}
                      className={`rounded-md border px-3.5 py-1.5 text-sm ${
                        draftModule === n
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{t.changeNote}</p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveLevel}
                  className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
                >
                  {saving ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-sm text-slate-500 hover:underline"
                >
                  {t.cancel}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {t.officialTitle}
        </h2>
        <p className="text-xs text-slate-500 mb-3">{t.officialSubtitle}</p>

        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {results.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">{t.officialEmpty}</p>
          ) : (
            results.map((r) => (
              <div key={r.id} className="p-5 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium">
                    {r.testType === "PD3" ? t.testTypePD3 : t.testTypeModultest}
                    {r.module ? ` · Modul ${r.module}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {r.result === "PASSED"
                      ? t.resultPassed
                      : r.result === "NOT_PASSED"
                        ? t.resultNotPassed
                        : "—"}
                    {r.takenAt &&
                      ` · ${new Date(r.takenAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {r.source === "REPORT_CARD" ? t.sourceReportCard : t.sourceSelfReported}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeResult(r.id)}
                  className="text-xs text-slate-400 hover:text-red-600 hover:underline"
                >
                  {t.remove}
                </button>
              </div>
            ))
          )}

          {adding ? (
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">{t.testTypeLabel}</p>
                <div className="flex gap-2">
                  {(["MODULTEST", "PD3"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTestType(option)}
                      className={`rounded-md border px-4 py-1.5 text-sm ${
                        testType === option
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {option === "PD3" ? t.testTypePD3 : t.testTypeModultest}
                    </button>
                  ))}
                </div>
              </div>

              {testType === "MODULTEST" && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">{t.module}</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setResultModule(n)}
                        className={`rounded-md border px-3.5 py-1.5 text-sm ${
                          resultModule === n
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 text-slate-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 mb-1.5">{t.resultLabel}</p>
                <div className="flex gap-2">
                  {(["PASSED", "NOT_PASSED"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setOutcome(option)}
                      className={`rounded-md border px-4 py-1.5 text-sm ${
                        outcome === option
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-700"
                      }`}
                    >
                      {option === "PASSED" ? t.resultPassed : t.resultNotPassed}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">{t.dateLabel}</label>
                <input
                  type="date"
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={addResult}
                  className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
                >
                  {saving ? t.saving : t.save}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-sm text-slate-500 hover:underline"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="rounded-md border border-slate-300 text-sm font-medium px-4 py-2"
              >
                {t.addResult}
              </button>
              {/* The OCR route, for a learner who has the certificate to hand. */}
              <Link href="/reports" className="text-xs text-slate-500 hover:underline">
                {t.uploadCertificate}
              </Link>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">{t.practiceVsOfficial}</p>
      </section>
    </>
  );
}
