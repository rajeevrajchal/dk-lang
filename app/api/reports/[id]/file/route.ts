import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Auth-gated file read — this is the only way to get bytes back for an
// uploaded report card. Never linked to directly; access control mirrors
// the account's auth rather than a guessable/public URL.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const reportCard = await prisma.reportCard.findUnique({ where: { id } });
  if (!reportCard || reportCard.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // filePath is always under storage/reportcards/<userId>/... (see
  // app/api/reports/upload/route.ts); the ignore comment just stops the
  // bundler from tracing the whole project as a dependency of this dynamic
  // read.
  const absolutePath = path.join(/* turbopackIgnore: true */ process.cwd(), reportCard.filePath);
  const bytes = await fs.readFile(absolutePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": reportCard.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
