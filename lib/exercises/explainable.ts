import type { ExerciseVariant } from "@/types";

// Pulling the Danish prose out of a variant, kept separate from explain.ts so
// it carries no Anthropic SDK import. The registry and the API responses need
// to know whether an exercise HAS explainable text (to decide whether to offer
// the button at all), and that question shouldn't drag the SDK along with it.

/**
 * The Danish text of an exercise, labelled so an explanation can follow the
 * order the learner read it in. Returns null when there is nothing to explain
 * — speaking prompts, and writing tasks where the learner supplies the text.
 */
export const extractExplainableText = (
  variant: ExerciseVariant
): { label: string; danish: string }[] | null => {
  const c = variant.content;

  switch (c.kind) {
    case "reading_task_1_matching":
      return [
        ...c.people.map((p) => ({ label: `Person ${p.id}`, danish: p.text })),
        ...c.ads.map((a) => ({ label: `Annonce ${a.id}`, danish: `${a.title}. ${a.body}` })),
      ];

    case "reading_task_2_wrong_sentence":
      return c.sections.map((s) => ({
        label: `Afsnit ${s.id}`,
        danish: s.sentences.join(" "),
      }));

    case "reading_task_3_missing_words": {
      // Rebuild the completed text — the version with the gaps filled in is
      // the one worth explaining.
      let text = "";
      c.textSegments.forEach((seg, i) => {
        text += seg;
        if (i < c.answers.length) text += c.answers[i];
      });
      return [{ label: c.textTitle, danish: text.trim() }];
    }

    case "reading_task_4_people_matching":
      return c.people.map((p) => ({ label: `${p.id}. ${p.name}`, danish: p.text }));

    case "writing":
      // Only an email task hands the learner Danish to read. A "write about
      // your town" task has no source text, so there is nothing to explain.
      return c.incomingEmail ? [{ label: "E-mail", danish: c.incomingEmail.body }] : null;

    default:
      return null;
  }
};

export const isExplainable = (variant: ExerciseVariant): boolean => {
  const blocks = extractExplainableText(variant);
  return !!blocks && blocks.length > 0;
};
