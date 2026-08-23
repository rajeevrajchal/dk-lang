import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// The learner's own vocabulary.
//
// Distinct from the seeded VocabItem bank, which is module-scoped course
// content. This is what THIS learner kept while reading, with the sentence it
// came from — a saved word without its context is a flashcard, and flashcards
// are what people give up on. `vocabItemId` links to a bank entry when one
// matches, so the two remain one vocabulary rather than two.

const SaveSchema = z.object({
  kind: z.enum(["WORD", "PHRASE"]).default("WORD"),
  danish: z.string().min(1).max(120),
  lemma: z.string().max(120).optional(),
  translation: z.string().min(1).max(300),
  partOfSpeech: z.string().max(40).optional(),
  contextSentence: z.string().max(500).optional(),
  grammarNote: z.string().max(1000).optional(),
  sourceTextId: z.string().max(120).optional(),
  note: z.string().max(1000).optional(),
});

const PatchSchema = z.object({
  id: z.string(),
  note: z.string().max(1000).nullable().optional(),
  learned: z.boolean().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sourceTextId = new URL(req.url).searchParams.get("textId");

  return NextResponse.json(
    await prisma.savedWord.findMany({
      where: { userId: session.user.id, ...(sourceTextId ? { sourceTextId } : {}) },
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = SaveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const userId = session.user.id;

  // If this word is also in the seeded bank, point at it rather than letting
  // the two drift apart.
  const bankEntry = await prisma.vocabItem.findFirst({
    where: { danish: data.lemma ?? data.danish },
    select: { id: true },
  });

  const word = await prisma.savedWord.upsert({
    where: { userId_danish: { userId, danish: data.danish } },
    // Saving the same word again from a different text refreshes what we know
    // about it, but never wipes a note the learner wrote.
    update: {
      translation: data.translation,
      lemma: data.lemma ?? undefined,
      partOfSpeech: data.partOfSpeech ?? undefined,
      contextSentence: data.contextSentence ?? undefined,
      grammarNote: data.grammarNote ?? undefined,
      ...(data.note ? { note: data.note } : {}),
    },
    create: {
      userId,
      kind: data.kind,
      danish: data.danish,
      lemma: data.lemma ?? null,
      translation: data.translation,
      partOfSpeech: data.partOfSpeech ?? null,
      contextSentence: data.contextSentence ?? null,
      grammarNote: data.grammarNote ?? null,
      sourceTextId: data.sourceTextId ?? null,
      note: data.note ?? null,
      vocabItemId: bankEntry?.id ?? null,
    },
  });

  return NextResponse.json(word);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { id, note, learned } = parsed.data;

  const existing = await prisma.savedWord.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    await prisma.savedWord.update({
      where: { id },
      data: {
        ...(note !== undefined ? { note } : {}),
        ...(learned !== undefined ? { learned } : {}),
      },
    })
  );
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.savedWord.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.savedWord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
