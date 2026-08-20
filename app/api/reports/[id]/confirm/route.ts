import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reconcileReportCard } from "@/lib/report-cards";

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

  const reportCard = await prisma.reportCard.findUnique({ where: { id } });
  if (!reportCard || reportCard.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = ConfirmSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { sprogcenter, module, date, results } = parsed.data;

  await prisma.reportCard.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      extractedSprogcenter: sprogcenter,
      extractedModule: module,
      extractedDate: new Date(date),
      extractedResultsJson: JSON.stringify(results),
    },
  });

  const changes = await reconcileReportCard(session.user.id, id);

  return NextResponse.json({ ok: true, changes });
}
