"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ReportCard {
  id: string;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
  status: "PENDING_EXTRACTION" | "PENDING_CONFIRMATION" | "CONFIRMED" | "REJECTED";
  extractedSprogcenter: string | null;
  extractedModule: number | null;
  extractedDate: string | null;
  extractedResultsJson: string | null;
  extractionConfidence: number | null;
}

function disciplinesForModule(moduleId: number): string[] {
  return moduleId === 5 ? ["skriftlig", "mundtlig"] : ["mundtlig", "laesning", "skrivning"];
}

function ConfirmForm({ card, dict, onDone }: { card: ReportCard; dict: Dictionary; onDone: () => void }) {
  const t = dict.reports.confirmForm;
  const [sprogcenter, setSprogcenter] = useState(card.extractedSprogcenter ?? "");
  const [moduleId, setModuleId] = useState(card.extractedModule ?? 2);
  const [date, setDate] = useState(
    card.extractedDate ? card.extractedDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [results, setResults] = useState<Record<string, "pass" | "fail">>(
    card.extractedResultsJson ? JSON.parse(card.extractedResultsJson) : {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disciplines = disciplinesForModule(moduleId);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${card.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprogcenter, module: moduleId, date, results }),
      });
      if (!res.ok) throw new Error((await res.json()).error || t.saveFailed);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        {card.extractionConfidence && card.extractionConfidence > 0
          ? t.autoExtracted(Math.round(card.extractionConfidence * 100))
          : t.noAutoExtraction}
      </p>

      <div>
        <label className="block text-xs font-medium text-slate-600">{t.sprogcenterLabel}</label>
        <input
          value={sprogcenter}
          onChange={(e) => setSprogcenter(e.target.value)}
          placeholder={t.sprogcenterPlaceholder}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">{t.modulLabel}</label>
          <select
            value={moduleId}
            onChange={(e) => {
              setModuleId(Number(e.target.value));
              setResults({});
            }}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            {[1, 2, 3, 4, 5].map((m) => (
              <option key={m} value={m}>
                {t.moduleOption(m)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">{t.dateLabel}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">{t.resultPerDiscipline}</p>
        <div className="space-y-2">
          {disciplines.map((d) => (
            <div key={d} className="flex items-center justify-between">
              <span className="text-sm">{dict.reports.disciplineLabels[d]}</span>
              <div className="flex gap-2">
                {(["pass", "fail"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setResults((r) => ({ ...r, [d]: v }))}
                    className={`rounded-md border px-3 py-1 text-xs ${
                      results[d] === v
                        ? v === "pass"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-red-600 bg-red-600 text-white"
                        : "border-slate-200"
                    }`}
                  >
                    {v === "pass" ? t.pass : t.fail}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={saving || !sprogcenter || Object.keys(results).length !== disciplines.length}
        onClick={submit}
        className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 disabled:opacity-40"
      >
        {saving ? t.saving : t.confirmAndSave}
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const { dict } = useI18n();
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reports");
    setCards(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/reports/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).error || dict.reports.confirmForm.uploadFailed);
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : dict.reports.confirmForm.uploadFailed);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{dict.reports.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict.reports.subtitle}</p>
      </div>

      <label className="block rounded-xl border-2 border-dashed border-slate-300 p-8 text-center cursor-pointer hover:border-slate-400">
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <span className="text-sm text-slate-600">
          {uploading ? dict.reports.uploadPromptUploading : dict.reports.uploadPromptIdle}
        </span>
      </label>
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">{dict.reports.loadingLabel}</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-400">{dict.reports.noReportsYet}</p>
      ) : (
        <ul className="space-y-4">
          {cards.map((card) => (
            <li key={card.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {new Date(card.uploadedAt).toLocaleDateString("en-GB")}
                </span>
                <span
                  className={`text-xs font-medium rounded-full px-3 py-1 ${
                    card.status === "CONFIRMED"
                      ? "bg-emerald-100 text-emerald-800"
                      : card.status === "PENDING_CONFIRMATION"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {dict.reports.statusLabels[card.status]}
                </span>
              </div>

              {card.status === "CONFIRMED" && (
                <p className="mt-2 text-sm text-slate-600">
                  {card.extractedSprogcenter} · {dict.reports.confirmForm.moduleOption(card.extractedModule ?? 0)} ·{" "}
                  {card.extractedDate && new Date(card.extractedDate).toLocaleDateString("en-GB")}
                </p>
              )}

              {card.status === "PENDING_CONFIRMATION" && (
                <ConfirmForm card={card} dict={dict} onDone={load} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
