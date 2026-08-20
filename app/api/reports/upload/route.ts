import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractReportCard } from "@/lib/ocr";

// Stored outside /public and never served by a public URL — only
// app/api/reports/[id]/file/route.ts can read it back, and that route is
// auth-gated to the owning user. This is a personal document with PII, so
// it gets the same access control as the account's auth, not just "a file
// somewhere on disk".
const STORAGE_ROOT = path.join(process.cwd(), "storage", "reportcards");
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

  const userDir = path.join(STORAGE_ROOT, session.user.id);
  await fs.mkdir(userDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.${ext}`;
  const absolutePath = path.join(userDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, bytes);

  const reportCard = await prisma.reportCard.create({
    data: {
      userId: session.user.id,
      filePath: path.relative(process.cwd(), absolutePath),
      mimeType: file.type,
      status: "PENDING_EXTRACTION",
    },
  });

  const extracted = await extractReportCard(absolutePath, file.type);

  const updated = await prisma.reportCard.update({
    where: { id: reportCard.id },
    data: {
      status: "PENDING_CONFIRMATION",
      extractedSprogcenter: extracted.sprogcenter,
      extractedModule: extracted.module,
      extractedDate: extracted.date ? new Date(extracted.date) : null,
      extractedResultsJson: JSON.stringify(extracted.results),
      extractionConfidence: extracted.confidence,
      rawOcrText: extracted.rawText,
    },
  });

  return NextResponse.json(updated);
}
