import "server-only";

import { prisma } from "@/lib/db";

// The learner's own vocabulary — words and expressions kept while reading.
//
// Distinct from the seeded VocabItem bank, which is module-scoped course
// content. `vocabItemId` links the two where they correspond, so this stays
// one vocabulary with two sources rather than two vocabularies.

export async function listSavedWords(userId: string, sourceTextId?: string) {
  return prisma.savedWord.findMany({
    where: { userId, ...(sourceTextId ? { sourceTextId } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export interface SaveWordInput {
  kind: string;
  danish: string;
  lemma?: string;
  translation: string;
  partOfSpeech?: string;
  contextSentence?: string;
  grammarNote?: string;
  sourceTextId?: string;
  note?: string;
}

export async function saveWord(userId: string, input: SaveWordInput) {
  // Link to the seeded bank when this word is also in it.
  const bankEntry = await prisma.vocabItem.findFirst({
    where: { danish: input.lemma ?? input.danish },
    select: { id: true },
  });

  return prisma.savedWord.upsert({
    where: { userId_danish: { userId, danish: input.danish } },
    // Saving the same word again from another text refreshes what we know
    // about it but never wipes a note the learner wrote.
    update: {
      translation: input.translation,
      lemma: input.lemma ?? undefined,
      partOfSpeech: input.partOfSpeech ?? undefined,
      contextSentence: input.contextSentence ?? undefined,
      grammarNote: input.grammarNote ?? undefined,
      ...(input.note ? { note: input.note } : {}),
    },
    create: {
      userId,
      kind: input.kind,
      danish: input.danish,
      lemma: input.lemma ?? null,
      translation: input.translation,
      partOfSpeech: input.partOfSpeech ?? null,
      contextSentence: input.contextSentence ?? null,
      grammarNote: input.grammarNote ?? null,
      sourceTextId: input.sourceTextId ?? null,
      note: input.note ?? null,
      vocabItemId: bankEntry?.id ?? null,
    },
  });
}

export async function updateSavedWord(
  userId: string,
  id: string,
  data: { note?: string | null; learned?: boolean }
) {
  // updateMany rather than update: it scopes by userId, so somebody else's id
  // simply matches nothing instead of editing their row.
  const { count } = await prisma.savedWord.updateMany({ where: { id, userId }, data });
  if (count === 0) return null;
  return prisma.savedWord.findUnique({ where: { id } });
}

export async function deleteSavedWord(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.savedWord.deleteMany({ where: { id, userId } });
  return count > 0;
}
