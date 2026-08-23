import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { vocabulary } from "@/lib/repositories";

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
    await vocabulary.listSavedWords(session.user.id, sourceTextId ?? undefined)
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
  // Linking to the seeded VocabItem bank, and refreshing without wiping the
  // learner's own note, both live in the repository.
  const word = await vocabulary.saveWord(session.user.id, parsed.data);

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

  const updated = await vocabulary.updateSavedWord(session.user.id, id, {
    ...(note !== undefined ? { note } : {}),
    ...(learned !== undefined ? { learned } : {}),
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const deleted = await vocabulary.deleteSavedWord(session.user.id, id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
