import type {
  ExerciseResponse,
  ExerciseResult,
  ExerciseVariant,
  GradedAnswer,
} from "./types";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Grades a submitted exercise. Runs server-side only — the answers live in the
 * variant, which is never sent to the client before submission.
 *
 * Writing and speaking return a null score rather than a fake one: there is no
 * objectively correct answer to compare against, so they are recorded as
 * completed and the learner self-checks against the task's checklist.
 */
export function gradeExercise(
  variant: ExerciseVariant,
  response: ExerciseResponse
): ExerciseResult {
  const content = variant.content;
  const answers: GradedAnswer[] = [];

  switch (content.kind) {
    case "reading_task_1_matching": {
      for (const person of content.people) {
        const expected = content.answers[person.id];
        const given = response[person.id] ?? null;
        answers.push({
          key: person.id,
          label: `Person ${person.id}`,
          given,
          expected,
          isCorrect: given === expected,
          why: content.rationales[person.id] ?? "",
        });
      }
      break;
    }

    case "reading_task_2_wrong_sentence": {
      for (const section of content.sections) {
        const expected = String(section.wrongIndex);
        const given = response[section.id] ?? null;
        answers.push({
          key: section.id,
          label: `Afsnit ${section.id}`,
          given:
            given === null ? null : (section.sentences[Number(given)] ?? given),
          expected: section.sentences[section.wrongIndex],
          isCorrect: given === expected,
          why: section.why,
        });
      }
      break;
    }

    case "reading_task_3_missing_words": {
      content.answers.forEach((expected, i) => {
        const given = response[String(i)] ?? null;
        answers.push({
          key: String(i),
          label: `Nr. ${i + 1}`,
          given,
          expected,
          isCorrect: given !== null && normalize(given) === normalize(expected),
          why: content.rationales[i] ?? "",
        });
      });
      break;
    }

    case "reading_task_4_people_matching": {
      for (const q of content.questions) {
        const given = response[q.id] ?? null;
        const nameOf = (id: string | null) =>
          id === null ? null : (content.people.find((p) => p.id === id)?.name ?? id);
        answers.push({
          key: q.id,
          label: q.question,
          given: nameOf(given),
          expected: nameOf(q.personId) ?? q.personId,
          isCorrect: given === q.personId,
          why: q.why,
        });
      }
      break;
    }

    case "writing": {
      const text = response.text ?? "";
      return {
        score: null,
        total: null,
        mistakes: null,
        answers: [],
        wordCount: countWords(text),
        minWords: content.minWords,
      };
    }

    case "speaking": {
      return { score: null, total: null, mistakes: null, answers: [] };
    }
  }

  const score = answers.filter((a) => a.isCorrect).length;
  return {
    score,
    total: answers.length,
    mistakes: answers.length - score,
    answers,
  };
}
