import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";

// Notes the learner wrote while reading.
//
// Anchored by content position (paragraph index, sentence index, or the word
// itself) rather than a character offset, so correcting a typo in a text does
// not silently move every note attached to it. The quote is stored alongside
// so a note still makes sense in a list, away from its text.

const NoteSchema = z.object({
  textId: z.string(),
  anchorKind: z.enum(["TEXT", "PARAGRAPH", "SENTENCE", "WORD"]),
  anchorId: z.string().max(200).nullable().optional(),
  quote: z.string().max(500).nullable().optional(),
  body: z.string().min(1).max(2000),
});

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const textId = new URL(req.url).searchParams.get("textId");

  return NextResponse.json(await reading.listNotes(session.user.id, textId ?? undefined));
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = NoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  return NextResponse.json(
    await reading.createNote(session.user.id, {
      textId: d.textId,
      anchorKind: d.anchorKind,
      anchorId: d.anchorId ?? null,
      quote: d.quote ?? null,
      body: d.body,
    })
  );
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Scoped by userId inside the repository, so somebody else's note id simply
  // matches nothing rather than being deleted.
  const deleted = await reading.deleteNote(session.user.id, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
};
