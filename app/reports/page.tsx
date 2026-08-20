"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_LABEL: Record<ReportCard["status"], string> = {
  PENDING_EXTRACTION: "Behandler...",
  PENDING_CONFIRMATION: "Afventer din bekræftelse",
  CONFIRMED: "Bekræftet",
  REJECTED: "Afvist",
};

function disciplinesForModule(moduleId: number): string[] {
  return moduleId === 5 ? ["skriftlig", "mundtlig"] : ["mundtlig", "laesning", "skrivning"];
}

const DISCIPLINE_LABEL: Record<string, string> = {
  mundtlig: "Mundtlig",
  laesning: "Læsning",
  skrivning: "Skrivning",
  skriftlig: "Skriftlig",
};

function ConfirmForm({ card, onDone }: { card: ReportCard; onDone: () => void }) {
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
      if (!res.ok) throw new Error((await res.json()).error || "Kunne ikke gemme");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fejl");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        {card.extractionConfidence && card.extractionConfidence > 0
          ? `Automatisk udtrukket felter (tillid: ${Math.round(card.extractionConfidence * 100)}%). Ret dem, hvis noget er forkert.`
          : "Ingen automatisk genkendelse tilgængelig — udfyld felterne ud fra dit resultatbevis."}
      </p>

      <div>
        <label className="block text-xs font-medium text-slate-600">Sprogcenter</label>
        <input
          value={sprogcenter}
          onChange={(e) => setSprogcenter(e.target.value)}
          placeholder="fx A2B, Clavis, Praxis"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Modul</label>
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
                Modul {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Dato</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">Resultat pr. disciplin</p>
        <div className="space-y-2">
          {disciplines.map((d) => (
            <div key={d} className="flex items-center justify-between">
              <span className="text-sm">{DISCIPLINE_LABEL[d]}</span>
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
                    {v === "pass" ? "Bestået" : "Ikke bestået"}
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
        {saving ? "Gemmer..." : "Bekræft og gem"}
      </button>
    </div>
  );
}

export default function ReportsPage() {
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
      if (!res.ok) throw new Error((await res.json()).error || "Upload fejlede");
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload fejlede");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
        &larr; Dashboard
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Verificerede resultater</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload et resultatbevis eller diplom fra dit sprogcenter (A2B, Clavis, Praxis m.fl.), efter du
          har taget den rigtige modultest eller PD3. Appen udtrækker felterne til gennemsyn — intet
          gemmes, før du har bekræftet det. Appen udsteder eller certificerer aldrig en bestået prøve;
          den registrerer kun, hvad dit dokument siger.
        </p>
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
          {uploading ? "Uploader..." : "Klik for at uploade PDF, PNG eller JPEG (maks 15 MB)"}
        </span>
      </label>
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Indlæser...</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-400">Ingen resultatbeviser uploadet endnu.</p>
      ) : (
        <ul className="space-y-4">
          {cards.map((card) => (
            <li key={card.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {new Date(card.uploadedAt).toLocaleDateString("da-DK")}
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
                  {STATUS_LABEL[card.status]}
                </span>
              </div>

              {card.status === "CONFIRMED" && (
                <p className="mt-2 text-sm text-slate-600">
                  {card.extractedSprogcenter} &middot; Modul {card.extractedModule} &middot;{" "}
                  {card.extractedDate && new Date(card.extractedDate).toLocaleDateString("da-DK")}
                </p>
              )}

              {card.status === "PENDING_CONFIRMATION" && (
                <ConfirmForm card={card} onDone={load} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
