// Uploaded report cards (karakterblade) and what is read off them.

import type { ReportCardStatusCode, Skill } from "./enums";

export interface ExtractedReportCard {
  sprogcenter: string | null;
  module: number | null;
  date: string | null; // ISO date string
  // discipline key -> pass/fail. Keys are "mundtlig" | "laesning" |
  // "skrivning" for a Modul 2-4 modultest, or "skriftlig" | "mundtlig" for
  // PD3 (Modul 5).
  results: Record<string, "pass" | "fail">;
  confidence: number; // 0-1, always 0 for the manual fallback
  rawText: string | null;
}

/** What confirming a report card changes about the in-app record. */
export interface ReconciliationChange {
  discipline: string;
  skill: Skill;
  officialPassed: boolean;
  previousInAppPassed: boolean | null;
  discrepancy: boolean;
}

/** An uploaded report card row, as the reports screen lists it. */
export interface ReportCard {
  id: string;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
  status: ReportCardStatusCode;
  extractedSprogcenter: string | null;
  extractedModule: number | null;
  extractedDate: string | null;
  extractedResultsJson: string | null;
  extractionConfidence: number | null;
}
