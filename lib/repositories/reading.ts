import "server-only";

import { prisma } from "@/lib/db";

// The reading library's learner data: what has been read, saved, noted and
// highlighted, plus the shared explanation cache.

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function listProgress(userId: string) {
  return prisma.readingProgress.findMany({ where: { userId } });
}

export async function findProgress(userId: string, textId: string) {
  return prisma.readingProgress.findUnique({ where: { userId_textId: { userId, textId } } });
}

export async function upsertProgress(
  userId: string,
  textId: string,
  input: {
    status?: "OPENED" | "COMPLETED";
    bookmarked?: boolean;
    mark?: string | null;
    addSeconds?: number;
  }
) {
  const existing = await findProgress(userId, textId);

  return prisma.readingProgress.upsert({
    where: { userId_textId: { userId, textId } },
    update: {
      // A text already finished stays finished. OPENED arrives on every visit,
      // so treating it as an update would undo the completion each time.
      ...(input.status === "COMPLETED"
        ? { status: "COMPLETED", completedAt: existing?.completedAt ?? new Date() }
        : {}),
      ...(input.bookmarked !== undefined ? { bookmarked: input.bookmarked } : {}),
      ...(input.mark !== undefined ? { mark: input.mark } : {}),
      ...(input.addSeconds ? { readSeconds: { increment: input.addSeconds } } : {}),
    },
    create: {
      userId,
      textId,
      status: input.status ?? "OPENED",
      completedAt: input.status === "COMPLETED" ? new Date() : null,
      bookmarked: input.bookmarked ?? false,
      mark: input.mark ?? null,
      readSeconds: input.addSeconds ?? 0,
    },
  });
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function listNotes(userId: string, textId?: string) {
  return prisma.readingNote.findMany({
    where: { userId, ...(textId ? { textId } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNote(
  userId: string,
  data: { textId: string; anchorKind: string; anchorId: string | null; quote: string | null; body: string }
) {
  return prisma.readingNote.create({ data: { ...data, userId } });
}

export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.readingNote.deleteMany({ where: { id, userId } });
  return count > 0;
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export async function listHighlights(userId: string, textId?: string) {
  return prisma.readingHighlight.findMany({ where: { userId, ...(textId ? { textId } : {}) } });
}

/** A null colour removes the highlight — the same action that made it. */
export async function setHighlight(
  userId: string,
  textId: string,
  sentenceIndex: number,
  color: string | null
) {
  if (color === null) {
    await prisma.readingHighlight.deleteMany({ where: { userId, textId, sentenceIndex } });
    return null;
  }
  return prisma.readingHighlight.upsert({
    where: { userId_textId_sentenceIndex: { userId, textId, sentenceIndex } },
    update: { color },
    create: { userId, textId, sentenceIndex, color },
  });
}

// ---------------------------------------------------------------------------
// Explanation cache
//
// Not scoped by user, and that is the point: what a sentence means is a fact
// about the sentence, so one learner asking pays for it and everyone benefits.
// ---------------------------------------------------------------------------

export interface ExplanationKey {
  textId: string;
  scopeKind: string;
  scopeId: string;
  level: number;
  depth: string;
}

export async function findCachedExplanation(key: ExplanationKey) {
  return prisma.readingExplanation.findUnique({
    where: { textId_scopeKind_scopeId_level_depth: key },
  });
}

export async function cacheExplanation(key: ExplanationKey, json: string) {
  // Upsert rather than create: two learners can race on the same sentence.
  return prisma.readingExplanation.upsert({
    where: { textId_scopeKind_scopeId_level_depth: key },
    update: { json },
    create: { ...key, json },
  });
}
