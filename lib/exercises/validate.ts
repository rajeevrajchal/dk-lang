import type { ExerciseVariant } from "./types";
import { gradeExercise } from "./grading";

// Semantic validation for generated exercises.
//
// The Zod schemas guarantee shape; these checks guarantee the exercise is
// actually solvable and correctly keyed. An LLM will happily return a
// structurally perfect Opgave 3 whose answer isn't in its own word bank, or an
// Opgave 1 where two people match the same advert — both parse fine and are
// broken as exercises.
//
// Every rule here is one a learner would hit as a bug. Anything that fails is
// regenerated (see generator.ts), never shown.

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateVariant(variant: ExerciseVariant): ValidationResult {
  const errors: string[] = [];
  const c = variant.content;

  switch (c.kind) {
    case "reading_task_1_matching": {
      const adIds = new Set(c.ads.map((a) => a.id));
      if (!adIds.has(c.example.adId)) {
        errors.push(`example advert ${c.example.adId} is not in the advert list`);
      }
      for (const p of c.people) {
        const ans = c.answers[p.id];
        if (!ans) errors.push(`person ${p.id} has no answer`);
        else if (!adIds.has(ans)) errors.push(`person ${p.id} keyed to advert ${ans}, which does not exist`);
        if (ans === c.example.adId) errors.push(`person ${p.id} reuses the worked example's advert`);
        if (!c.rationales[p.id]) errors.push(`person ${p.id} has no rationale`);
      }
      const used = Object.values(c.answers);
      if (new Set(used).size !== used.length) {
        errors.push("two people are keyed to the same advert");
      }
      if (Object.keys(c.answers).length !== c.people.length) {
        errors.push("answer count does not match people count");
      }
      // The distractors are the point of the format — without them the last
      // person can be answered by elimination.
      const unused = c.ads.length - used.length - 1;
      if (unused < 2) errors.push(`expected 2 unused adverts, got ${unused}`);
      break;
    }

    case "reading_task_2_wrong_sentence": {
      if (c.example.wrongIndex < 0 || c.example.wrongIndex >= c.example.sentences.length) {
        errors.push("example wrongIndex is out of range");
      }
      const ids = new Set<string>();
      for (const s of c.sections) {
        if (ids.has(s.id)) errors.push(`duplicate section id ${s.id}`);
        ids.add(s.id);
        if (s.wrongIndex < 0 || s.wrongIndex >= s.sentences.length) {
          errors.push(`section ${s.id}: wrongIndex out of range`);
        }
        if (s.sentences.length < 4) errors.push(`section ${s.id}: fewer than 4 sentences`);
        if (!s.why?.trim()) errors.push(`section ${s.id}: missing explanation`);
      }
      break;
    }

    case "reading_task_3_missing_words": {
      if (c.textSegments.length !== c.answers.length + 1) {
        errors.push(
          `textSegments (${c.textSegments.length}) must be answers (${c.answers.length}) + 1`
        );
      }
      if (c.rationales.length !== c.answers.length) {
        errors.push("rationale count does not match answer count");
      }
      // Each bank word may be used once, so a repeated answer makes the
      // exercise unsolvable as stated in its own instructions.
      if (new Set(c.answers).size !== c.answers.length) {
        errors.push("the same word is the answer to more than one gap");
      }
      for (const a of c.answers) {
        if (!c.wordBank.includes(a)) errors.push(`answer "${a}" is missing from the word bank`);
      }
      if (!c.wordBank.includes(c.exampleWord)) {
        errors.push(`example word "${c.exampleWord}" is missing from the word bank`);
      }
      if (new Set(c.wordBank).size !== c.wordBank.length) {
        errors.push("the word bank contains duplicates");
      }
      const unused = c.wordBank.length - c.answers.length - 1;
      if (unused !== 4) errors.push(`expected exactly 4 unused words, got ${unused}`);
      if (!c.exampleSentence.includes("___")) {
        errors.push("exampleSentence must contain ___ where the example word goes");
      }
      break;
    }

    case "reading_task_4_people_matching": {
      const ids = new Set(c.people.map((p) => p.id));
      if (!ids.has(c.example.personId)) errors.push("example points at a person who does not exist");
      const qIds = new Set<string>();
      for (const q of c.questions) {
        if (qIds.has(q.id)) errors.push(`duplicate question id ${q.id}`);
        qIds.add(q.id);
        if (!ids.has(q.personId)) errors.push(`question ${q.id} points at an unknown person`);
        if (!q.why?.trim()) errors.push(`question ${q.id} has no explanation`);
      }
      // If every question resolves to one person the task tests nothing.
      const distinct = new Set(c.questions.map((q) => q.personId));
      if (distinct.size < 2) {
        errors.push("all questions resolve to the same person");
      }
      break;
    }

    case "writing": {
      if (c.minWords < 40) errors.push("minWords is below the Modul 2 range");
      if (c.mustInclude.length < 4) errors.push("checklist is too short");
      if (variant.taskType === "writing_email" && !c.incomingEmail) {
        errors.push("an email task needs an incoming email to reply to");
      }
      break;
    }

    case "speaking": {
      if (c.questions.length < 4) errors.push("fewer than 4 speaking questions");
      if (c.usefulPhrases.length < 4) errors.push("fewer than 4 useful phrases");
      break;
    }
  }

  // Last gate for auto-scored tasks: feed the exercise its own answer key back
  // through the real grader. If that doesn't come out full marks, the key and
  // the content disagree somewhere the rules above didn't catch, and the
  // learner would be marked wrong for a correct answer.
  if (errors.length === 0) {
    const selfCheck = selfGrade(variant);
    if (selfCheck !== null && !selfCheck) {
      errors.push("the answer key does not self-grade to full marks");
    }
  }

  return { ok: errors.length === 0, errors };
}

/** true = key self-grades clean, false = it doesn't, null = not auto-scored. */
function selfGrade(variant: ExerciseVariant): boolean | null {
  const c = variant.content;
  let response: Record<string, string>;

  switch (c.kind) {
    case "reading_task_1_matching":
      response = { ...c.answers };
      break;
    case "reading_task_2_wrong_sentence":
      response = Object.fromEntries(c.sections.map((s) => [s.id, String(s.wrongIndex)]));
      break;
    case "reading_task_3_missing_words":
      response = Object.fromEntries(c.answers.map((a, i) => [String(i), a]));
      break;
    case "reading_task_4_people_matching":
      response = Object.fromEntries(c.questions.map((q) => [q.id, q.personId]));
      break;
    default:
      return null;
  }

  const result = gradeExercise(variant, response);
  if (result.total == null) return null;
  return result.score === result.total;
}
