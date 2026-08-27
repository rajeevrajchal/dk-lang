import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { translateMany } from "@/lib/translation/service";
import {
  MAX_TRANSLATION_BATCH,
  MAX_TRANSLATION_CHARS,
  TRANSLATION_KINDS,
} from "@/lib/translation/constants";
import { getUserLevel } from "@/lib/level";

// Translating Danish, anywhere in the app.
//
// A batch endpoint rather than one-per-word: the caller's real unit is "this
// paragraph" or "this opgave", and the client cache (components/translation)
// collapses everything a screen asks for in one tick into a single request.
// That is what keeps clicking through a text from producing fifty round trips.

const TranslateSchema = z.object({
  items: z
    .array(
      z.object({
        danish: z.string().min(1).max(MAX_TRANSLATION_CHARS),
        kind: z.enum(TRANSLATION_KINDS),
        /** The sentence a clicked word sits in, so the sense is the one used here. */
        context: z.string().max(MAX_TRANSLATION_CHARS).optional(),
      })
    )
    .min(1)
    .max(MAX_TRANSLATION_BATCH),
});

// Generation is capped short by the task config, but a batch of sentences that
// all miss the cache still needs room.
export const maxDuration = 120;

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = TranslateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // The learner's own level decides how much grammar an explanation may
  // assume, and is part of the cache key for that reason.
  const level = await getUserLevel(session.user.id);
  const translations = await translateMany(parsed.data.items, level.currentModule ?? 2);

  return NextResponse.json({ translations });
};
