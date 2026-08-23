import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminDb, unwrap } from "@/lib/supabase/db";
import { reportCardKey, uploadReportCard } from "@/lib/supabase/storage";
import { extractReportCard } from "@/lib/ocr";

// Files go to a PRIVATE Supabase Storage bucket, never a public URL — only
// app/api/reports/[id]/file/route.ts reads them back, and that route checks
// the row belongs to the caller first. These are personal documents with PII,
// so they get the same access control as the account itself.
//
// They used to be written to local disk, which works in development and not at
// all on a serverless host: the upload lands on one instance and the download
// asks another.
const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
};
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Ingen fil modtaget" }, { status: 400 });
  }
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Kun PDF, PNG eller JPEG er tilladt" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Filen er for stor (maks 15 MB)" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = reportCardKey(session.user.id, `report.${ext}`);
  await uploadReportCard(key, bytes, file.type);

  // Written through the admin client: the bucket and this row are handled
  // together, and the row is created before extraction so an OCR failure
  // leaves a recoverable record rather than an orphaned file.
  const created = unwrap(
    await adminDb()
      .from("ReportCard")
      .insert({
        id: crypto.randomUUID(),
        userId: session.user.id,
        filePath: key,
        mimeType: file.type,
        status: "PENDING_EXTRACTION",
        uploadedAt: new Date().toISOString(),
      })
      .select(),
    "uploadReportCard(create)"
  );
  const reportCard = created[0];

  const extracted = await extractReportCard(bytes, file.type);

  const updatedRows = unwrap(
    await adminDb()
      .from("ReportCard")
      .update({
        status: "PENDING_CONFIRMATION",
        extractedSprogcenter: extracted.sprogcenter,
        extractedModule: extracted.module,
        extractedDate: extracted.date ? new Date(extracted.date).toISOString() : null,
        extractedResultsJson: JSON.stringify(extracted.results),
        extractionConfidence: extracted.confidence,
        rawOcrText: extracted.rawText,
      })
      .eq("id", reportCard.id)
      .select(),
    "uploadReportCard(update)"
  );
  const updated = updatedRows[0];

  return NextResponse.json(updated);
}
