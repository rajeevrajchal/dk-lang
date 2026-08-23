import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";
import { readingText } from "@/lib/reading/registry";
import {
  answerFromText,
  generateExplanation,
  generationAvailable,
  EXPLANATION_DEPTHS,
  EXPLANATION_SCOPES,
  type ExplanationDepth,
  type ExplanationScope,
} from "@/lib/reading/explain";
import { getUserLevel, levelLabel } from "@/lib/level";
import { chapterForLesson } from "@/lib/curriculum/course";

// Explaining part of a text.
//
// Three tiers, cheapest first — this ordering is the whole point of the route:
//
//   1. the text's own authored data      instant, free, no network
//   2. the shared cache                  one DB read
//   3. the model                         only when 1 and 2 both miss
//
// Clicking a glossed word never reaches tier 3. That matters: a learner reads
// by clicking a lot of words, and a design that billed a model call for each
// one would be both slow to use and expensive to run.

const ExplainSchema = z.object({
  textId: z.string(),
  scopeKind: z.enum(EXPLANATION_SCOPES),
  /** Sentence/paragraph index as a string, or the selected text. */
  scopeId: z.string(),
  /** The Danish the learner selected. */
  selection: z.string().min(1).max(600),
  depth: z.enum(EXPLANATION_DEPTHS).default("DEFAULT"),
  /** The learner's own question, when they asked one. */
  question: z.string().max(300).optional(),
});

// A short answer about one sentence; nothing here should take minutes.
export const maxDuration = 90;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ExplainSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { textId, scopeKind, scopeId, selection, depth, question } = parsed.data;

  const entry = readingText(textId);
  if (!entry) return NextResponse.json({ error: "Unknown text" }, { status: 404 });

  const scope = { kind: scopeKind as ExplanationScope, id: scopeId, selection };

  // --- Tier 1: the text already knows -------------------------------------
  //
  // Skipped when the learner asked a question or wanted more depth, because
  // then they have already read the authored answer and found it wanting.
  if (depth === "DEFAULT" && !question) {
    const authored = answerFromText(entry.text, scope);
    if (authored) {
      return NextResponse.json({ ...authored, source: "text" });
    }
  }

  // --- Tier 2: somebody has asked this before -----------------------------
  //
  // The cache is not per-user: what a sentence means is a fact about the
  // sentence. A free-text question is not cached, since the key would be the
  // question itself and no two learners phrase one the same way.
  const cacheKey = {
    textId,
    scopeKind,
    scopeId: scopeId.slice(0, 300),
    level: entry.level,
    depth,
  };

  if (!question) {
    const cached = await reading.findCachedExplanation(cacheKey);
    if (cached) {
      return NextResponse.json({ ...JSON.parse(cached.json), source: "cache" });
    }
  }

  // --- Tier 3: generate ---------------------------------------------------
  if (!generationAvailable()) {
    return NextResponse.json(
      { error: "unavailable", reason: "no ANTHROPIC_API_KEY set" },
      { status: 503 }
    );
  }

  // Context the model needs to pitch the answer: where the learner is in the
  // course, and what level they told us they are.
  const level = await getUserLevel(session.user.id);
  const chapter = entry.courseLessonSlug ? chapterForLesson(entry.courseLessonSlug) : undefined;

  const outcome = await generateExplanation({
    text: entry.text,
    scope,
    depth: depth as ExplanationDepth,
    question,
    courseChapter: chapter ? `Chapter ${chapter.number}: ${chapter.title}` : undefined,
    learnerLevel: levelLabel(level) ?? undefined,
  });

  if (!outcome.explanation) {
    return NextResponse.json({ error: "unavailable", reason: outcome.reason }, { status: 503 });
  }

  if (!question) {
    await reading.cacheExplanation(cacheKey, JSON.stringify(outcome.explanation));
  }

  return NextResponse.json({ ...outcome.explanation, source: "generated" });
}
