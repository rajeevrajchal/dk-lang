import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readingText } from "@/lib/reading/registry";

// What the learner has read, saved and marked.
//
// Deliberately thin: opened, completed, bookmarked, one mark, and a coarse
// count of seconds. Enough to answer "have I read this?", "where did I get
// to?" and "what should I be recommended next?" — and nothing beyond that,
// because reading analytics nobody looks at is just a privacy cost.

export const READING_MARKS = ["INTERESTING", "USEFUL", "DIFFICULT", "WANT_TO_LEARN"] as const;

const UpdateSchema = z.object({
  textId: z.string(),
  status: z.enum(["OPENED", "COMPLETED"]).optional(),
  bookmarked: z.boolean().optional(),
  mark: z.enum(READING_MARKS).nullable().optional(),
  /** Seconds to add to the running total, not the new total. */
  addSeconds: z.number().int().min(0).max(3600).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.readingProgress.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = UpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { textId, status, bookmarked, mark, addSeconds } = parsed.data;

  if (!readingText(textId)) {
    return NextResponse.json({ error: "Unknown text" }, { status: 404 });
  }

  const userId = session.user.id;
  const existing = await prisma.readingProgress.findUnique({
    where: { userId_textId: { userId, textId } },
  });

  const row = await prisma.readingProgress.upsert({
    where: { userId_textId: { userId, textId } },
    update: {
      // A text already finished stays finished — re-reading it is not undoing
      // it, and OPENED arrives on every visit.
      ...(status === "COMPLETED"
        ? { status: "COMPLETED", completedAt: existing?.completedAt ?? new Date() }
        : {}),
      ...(bookmarked !== undefined ? { bookmarked } : {}),
      ...(mark !== undefined ? { mark } : {}),
      ...(addSeconds ? { readSeconds: { increment: addSeconds } } : {}),
    },
    create: {
      userId,
      textId,
      status: status ?? "OPENED",
      completedAt: status === "COMPLETED" ? new Date() : null,
      bookmarked: bookmarked ?? false,
      mark: mark ?? null,
      readSeconds: addSeconds ?? 0,
    },
  });

  return NextResponse.json(row);
}
