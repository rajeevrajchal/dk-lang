import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { progress } from "@/lib/repositories";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reportCards = await progress.listReportCards(session.user.id);
  return NextResponse.json(reportCards);
}
