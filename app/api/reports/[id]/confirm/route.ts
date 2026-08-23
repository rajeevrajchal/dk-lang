import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { progress, users } from "@/lib/repositories";
import { adminDb, unwrap } from "@/lib/supabase/db";
import { reconcileReportCard } from "@/lib/report-cards";
import { addOfficialTestResult } from "@/lib/level";

const ConfirmSchema = z.object({
  sprogcenter: z.string().min(1),
  module: z.number().int().min(1).max(5),
  date: z.string(), // ISO date
  results: z.record(z.string(), z.enum(["pass", "fail"])),
});

// The learner reviews/edits whatever lib/ocr.ts extracted (or fills it in
// entirely by hand if extraction was empty) and only this confirm step
// writes it to the record — no OCR output is ever saved silently.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const reportCard = await progress.findReportCard(session.user.id, id);
  if (!reportCard) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = ConfirmSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { sprogcenter, module, date, results } = parsed.data;

  unwrap(
    await adminDb()
      .from("ReportCard")
      .update({
        status: "CONFIRMED",
        confirmedAt: new Date().toISOString(),
        extractedSprogcenter: sprogcenter,
        extractedModule: module,
        extractedDate: new Date(date).toISOString(),
        extractedResultsJson: JSON.stringify(results),
      })
      .eq("id", id)
      .select("id"),
    "confirmReportCard"
  );

  const changes = await reconcileReportCard(session.user.id, id);

  // A confirmed certificate is an official test result, so it is recorded as
  // one rather than living only inside ModuleSkillStatus. The result counts as
  // passed when every discipline on the certificate passed — a partial pass is
  // not a pass, and is recorded as such rather than being rounded up.
  const disciplines = Object.values(results);
  const allPassed = disciplines.length > 0 && disciplines.every((r) => r === "pass");

  // Only create it once: re-confirming an already-confirmed card should not
  // stack up duplicate results.
  const existing = await users.findOfficialResultByReportCard(session.user.id, id);
  if (!existing) {
    await addOfficialTestResult(session.user.id, {
      testType: module === 5 ? "PD3" : "MODULTEST",
      module: module === 5 ? null : module,
      result: allPassed ? "PASSED" : "NOT_PASSED",
      takenAt: new Date(date),
      note: sprogcenter,
      source: "REPORT_CARD",
      reportCardId: id,
    });
  }

  return NextResponse.json({ ok: true, changes });
}
