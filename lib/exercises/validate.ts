import { gradeExercise } from "./grading";
import { stagesForTaskType } from "./speaking-patterns";
import type { ExerciseVariant, ValidationResult } from "@/types";

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

export const validateVariant = (variant: ExerciseVariant): ValidationResult => {
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

      // Everything below only applies to the modultest opgave formats. The
      // original free-form prompts carry none of these fields and are checked
      // by the two rules above exactly as before.
      const expectedStages = stagesForTaskType(variant.taskType);
      if (expectedStages && !c.stages?.length) {
        errors.push(`${variant.taskType} must carry its stages`);
      }
      if (expectedStages && c.stages && c.stages.length !== expectedStages.length) {
        errors.push(
          `${variant.taskType} expects ${expectedStages.length} stage(s), got ${c.stages.length}`
        );
      }
      // A two-phase opgave that does not distinguish its phases is the failure
      // the source material is clearest about: presenting and being questioned
      // are different things.
      if (expectedStages && expectedStages.length > 1 && c.stages) {
        const types = new Set(c.stages.map((s) => s.type));
        if (types.size < c.stages.length) {
          errors.push("stages do not distinguish presentation from follow-up");
        }
      }

      if (variant.taskType === "speaking_mindmap") {
        if (!c.mindmap) errors.push("mindmap task has no mindmap");
        else {
          if (!c.mindmap.title?.trim()) errors.push("mindmap has no topic title");
          if (c.mindmap.categories.length < 4) {
            errors.push(`mindmap needs at least 4 keyword categories, got ${c.mindmap.categories.length}`);
          }
          if (new Set(c.mindmap.categories).size !== c.mindmap.categories.length) {
            errors.push("mindmap repeats a keyword category");
          }
        }
      }

      if (variant.taskType === "speaking_information_gap") {
        const g = c.informationGap;
        if (!g) errors.push("information gap task has no information gap");
        else {
          if (!g.sharedContext?.trim()) errors.push("information gap has no shared context");
          if (g.candidate.holds.length === 0) errors.push("candidate holds no information");
          if (g.partner.holds.length === 0) errors.push("partner holds no information");
          if (g.candidate.mustFindOut.length === 0) {
            errors.push("candidate has nothing to find out — there is no gap");
          }
          if (g.partner.mustFindOut.length === 0) {
            errors.push("partner has nothing to find out — the exchange is one-way");
          }
          // The whole point of the format: if both sides know the same things
          // the candidate has no reason to ask anything.
          const candidateLabels = new Set(g.candidate.holds.map((i) => i.label.toLowerCase()));
          const partnerLabels = new Set(g.partner.holds.map((i) => i.label.toLowerCase()));
          const shared = [...candidateLabels].filter((l) => partnerLabels.has(l));
          if (shared.length === candidateLabels.size && shared.length === partnerLabels.size) {
            errors.push("both sides hold identical information — there is no gap to close");
          }
          // What the candidate must find out has to actually be held by the
          // partner, or the task is unanswerable.
          const missingFromPartner = g.candidate.mustFindOut.filter(
            (label) => !partnerLabels.has(label.toLowerCase())
          );
          if (missingFromPartner.length > 0) {
            errors.push(
              `candidate is asked to find out something the partner does not hold: ${missingFromPartner.join(", ")}`
            );
          }
          if (g.requiredQuestions.length === 0) errors.push("no required questions");
        }
      }

      if (variant.taskType === "speaking_prepared_topic") {
        if (!c.preparedTopics || c.preparedTopics.length !== 2) {
          errors.push(
            `prepared topic task offers ${c.preparedTopics?.length ?? 0} topics, expected 2 to draw from`
          );
        } else if (c.preparedTopics.some((t) => t.prompts.length < 3)) {
          errors.push("a prepared topic has fewer than 3 prompts to prepare from");
        }
      }

      if (variant.taskType === "speaking_picture_preference") {
        if (!c.preferenceTopic?.trim()) errors.push("preference task has no topic");
        if (!c.preferenceOptions || c.preferenceOptions.length !== 4) {
          errors.push(
            `preference task has ${c.preferenceOptions?.length ?? 0} options, expected exactly 4`
          );
        } else if (new Set(c.preferenceOptions.map((o) => o.id)).size !== 4) {
          errors.push("preference options have duplicate ids");
        }
      }
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
};

/** true = key self-grades clean, false = it doesn't, null = not auto-scored. */
const selfGrade = (variant: ExerciseVariant): boolean | null => {
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
};
