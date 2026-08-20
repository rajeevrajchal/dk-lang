import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reportCards = await prisma.reportCard.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(reportCards);
}
