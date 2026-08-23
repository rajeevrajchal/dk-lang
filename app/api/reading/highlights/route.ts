import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Highlighted sentences.
//
// Sentence-granular rather than character ranges: the learner's actual need is
// "mark this bit", the sentence is already an addressable unit in the content
// model, and a range would have to survive every edit to the text. Colours
// carry meaning — yellow vocabulary, blue grammar, green useful phrase, red
// did not understand — but nothing enforces that, because the learner's own
// system is the one that will stick.

export const HIGHLIGHT_COLORS = ["YELLOW", "BLUE", "GREEN", "RED"] as const;

const HighlightSchema = z.object({
  textId: z.string(),
  sentenceIndex: z.number().int().min(0).max(2000),
  /** null removes the highlight — the same tap that made it takes it away. */
  color: z.enum(HIGHLIGHT_COLORS).nullable(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const textId = new URL(req.url).searchParams.get("textId");

  return NextResponse.json(
    await prisma.readingHighlight.findMany({
      where: { userId: session.user.id, ...(textId ? { textId } : {}) },
    })
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = HighlightSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { textId, sentenceIndex, color } = parsed.data;
  const userId = session.user.id;
  const where = { userId_textId_sentenceIndex: { userId, textId, sentenceIndex } };

  if (color === null) {
    await prisma.readingHighlight.deleteMany({ where: { userId, textId, sentenceIndex } });
    return NextResponse.json({ ok: true, removed: true });
  }

  return NextResponse.json(
    await prisma.readingHighlight.upsert({
      where,
      update: { color },
      create: { userId, textId, sentenceIndex, color },
    })
  );
}
