import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { progress } from "@/lib/repositories";
import { downloadReportCard } from "@/lib/supabase/storage";

// Auth-gated file read — this is the only way to get bytes back for an
// uploaded report card. Never linked to directly; access control mirrors
// the account's auth rather than a guessable/public URL.
export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  // Scoped by userId in the repository: an id alone must not fetch somebody
  // else's document.
  const reportCard = await progress.findReportCard(session.user.id, id);
  if (!reportCard) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // filePath is the object key in the private report-cards bucket, always
  // namespaced under the owning user's id (see app/api/reports/upload).
  const bytes = await downloadReportCard(reportCard.filePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": reportCard.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
    },
  });
};
