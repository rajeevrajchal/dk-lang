import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";
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

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await reading.listProgress(session.user.id));
};

export const POST = async (req: Request) => {
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

  // The upsert rules — a completed text staying completed, seconds
  // accumulating rather than replacing — live in the repository, so any other
  // caller gets them too.
  const row = await reading.upsertProgress(session.user.id, textId, {
    status,
    bookmarked,
    mark,
    addSeconds,
  });

  return NextResponse.json(row);
};
