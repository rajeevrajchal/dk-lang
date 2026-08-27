import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { history, verbs as verbsRepo } from "@/lib/repositories";
import { isAnswerCorrect, questionFromKey } from "@/lib/verbs/practice";
import { VERB_BY_ID } from "@/lib/verbs";
import type { RecordedAnswer } from "@/types";

// Recording a verb answer.
//
// The question is rebuilt from its key rather than taken from the request, so
// what counts as correct is decided here and not by the browser. That also
// means one endpoint serves both the practice round and the "practise this
// mistake again" flow, because both send the same thing: a key and an answer.

const AnswerSchema = z.object({
  answers: z
    .array(
      z.object({
        questionKey: z.string().min(1).max(120),
        given: z.string().max(200),
      })
    )
    .min(1)
    .max(30),
});

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = AnswerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const results = [];
  const recorded: RecordedAnswer[] = [];

  for (const { questionKey, given } of parsed.data.answers) {
    const question = questionFromKey(questionKey);
    if (!question) continue;
    const verb = VERB_BY_ID.get(question.verbId);
    if (!verb) continue;

    const correct = isAnswerCorrect(question, given);
    results.push({
      questionKey,
      verbId: question.verbId,
      isCorrect: correct,
      given,
      answer: question.answer,
      explanation: question.explanation,
    });

    recorded.push({
      source: "VERB",
      questionKey,
      questionText: question.prompt,
      danishText: question.danish ?? `at ${verb.infinitive}`,
      correctAnswer: question.answer,
      userAnswer: given,
      isCorrect: correct,
      explanation: question.explanation,
      // The verb itself is the topic: that is what makes "you have struggled
      // with these 8 verbs" answerable from the same rows as everything else.
      grammarTopic: verb.infinitive,
      topic: verb.themes[0] ?? null,
      taskType: question.mode,
    });
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "No recognisable questions" }, { status: 400 });
  }

  // Progress and history are two different facts about the same answer, and
  // both are written before the response so the next round already knows.
  await Promise.all([
    history.recordAnswers(session.user.id, recorded),
    ...results.map((r) => verbsRepo.recordResult(session.user.id, r.verbId, r.isCorrect)),
  ]);

  return NextResponse.json({ results });
};
