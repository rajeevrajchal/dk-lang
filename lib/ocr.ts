// Pluggable OCR/vision extraction for uploaded report cards.
//
// This never runs unattended: whatever it returns is shown to the learner
// as an editable draft and only written to the record after an explicit
// confirm step (see app/api/reports/[id]/confirm/route.ts and
// lib/report-cards.ts). That means a weak or absent extractor degrades
// gracefully to "manual entry with the file attached" rather than blocking
// the flow — see docs/content-validation.md for why extraction confidence
// is never trusted on its own.

import type { ExtractedReportCard } from "@/types";

const EMPTY_EXTRACTION: ExtractedReportCard = {
  sprogcenter: null,
  module: null,
  date: null,
  results: {},
  confidence: 0,
  rawText: null,
};

const extractWithAnthropicVision = async (
  _fileBytes: Uint8Array,
  _mimeType: string
): Promise<ExtractedReportCard> => {
  // Real implementation would send the file to a vision-capable model with
  // a strict extraction prompt (sprogcenter name, module number, date,
  // pass/fail per discipline) and parse a structured response. Left
  // unimplemented here — no ANTHROPIC_API_KEY is configured in this
  // environment — but the interface below is what app code depends on, so
  // wiring a real provider later is a drop-in change to this one function.
  throw new Error("Anthropic vision OCR provider is not configured.");
};

export const extractReportCard = async (
  // Bytes rather than a path: the file lives in Supabase Storage, so there is
  // no local path to read. Callers hand over what they already have in memory.
  fileBytes: Uint8Array,
  mimeType: string
): Promise<ExtractedReportCard> => {
  const provider = process.env.OCR_PROVIDER;

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    try {
      return await extractWithAnthropicVision(fileBytes, mimeType);
    } catch {
      // Fall through to the manual-entry stub rather than failing the
      // upload outright — the learner can always type the fields in by
      // hand and the original file is still stored either way.
      return EMPTY_EXTRACTION;
    }
  }

  return EMPTY_EXTRACTION;
};
