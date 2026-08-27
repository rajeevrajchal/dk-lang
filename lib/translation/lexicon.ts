import { MODUL2_GLOSSARIES } from "@/lib/content-gen/modul2-glossary";
import { MODUL2_SENTENCES } from "@/lib/content-gen/modul2-sentences";
import { READING_LIBRARY } from "@/lib/reading/registry";
import { VERBS } from "@/lib/verbs/data";
import { lookupKey } from "@/lib/learning/text";
import type { Translation } from "@/types";

// The free tier of the translation service.
//
// The app already contains thousands of hand-written Danish→English pairs: the
// Modul 2 glossaries, every sentence of every library text, and the 500-verb
// collection. A learner clicking "arbejder" should never cost an API call to
// be told it means "works" — the answer has been sitting in the repository the
// whole time.
//
// The indexes are built once, lazily, and held for the life of the process.
// They are pure content, identical for every learner, so there is nothing to
// invalidate.

const normalise = (s: string): string => {
  return s.trim().replace(/\s+/g, " ");
};

/** Sentences compare ignoring case and trailing punctuation. */
const sentenceKey = (s: string): string => {
  return normalise(s)
    .toLowerCase()
    .replace(/[.!?…]+$/u, "");
};

let wordIndex: Map<string, Translation> | null = null;
let sentenceIndex: Map<string, Translation> | null = null;

const buildWordIndex = (): Map<string, Translation> => {
  const index = new Map<string, Translation>();

  const add = (t: Translation) => {
    const key = lookupKey(t.danish);
    // First writer wins: a gloss written for a specific passage is more
    // precise than a general one, and the passages are added first.
    if (key && !index.has(key)) index.set(key, t);
  };

  for (const glossary of MODUL2_GLOSSARIES) {
    for (const w of glossary.words) {
      add({
        kind: "WORD",
        danish: w.surface,
        english: w.englishGloss,
        baseForm: w.lemma,
        partOfSpeech: w.partOfSpeech,
        note: w.inflectionNote,
        source: "authored",
      });
    }
  }

  for (const entry of READING_LIBRARY) {
    for (const g of entry.text.glossary ?? []) {
      add({
        kind: "WORD",
        danish: g.surface,
        english: g.englishGloss,
        baseForm: g.lemma,
        partOfSpeech: g.partOfSpeech,
        note: g.inflectionNote,
        source: "authored",
      });
    }
    for (const v of entry.text.keyVocabulary ?? []) {
      add({ kind: "WORD", danish: v.danish, english: v.english, source: "authored" });
    }
  }

  // The verb collection covers every inflected form it knows, so a learner
  // clicking "købte" in an opgave is answered by the same data the verb
  // section teaches from — one vocabulary, not two.
  for (const verb of VERBS) {
    const forms: [string, string][] = [
      [verb.infinitive, `to ${verb.english}`],
      [verb.present, verb.english + "s"],
      [verb.past, `${verb.english} (past)`],
      [verb.perfect, `${verb.english} (perfect)`],
    ];
    for (const [form, english] of forms) {
      add({
        kind: "WORD",
        danish: form,
        english,
        baseForm: verb.infinitive,
        partOfSpeech: "verb",
        note: `at ${verb.infinitive} — ${verb.present} / ${verb.past} / har ${verb.perfect}.`,
        source: "authored",
      });
    }
  }

  return index;
};

const buildSentenceIndex = (): Map<string, Translation> => {
  const index = new Map<string, Translation>();

  const add = (danish: string, english: string, note?: string) => {
    const key = sentenceKey(danish);
    if (key && !index.has(key)) {
      index.set(key, { kind: "SENTENCE", danish, english, note, source: "authored" });
    }
  };

  for (const passage of MODUL2_SENTENCES) {
    for (const s of passage.sentences) add(s.danish, s.english, s.structureNote);
  }

  for (const entry of READING_LIBRARY) {
    for (const p of entry.text.paragraphs) {
      for (const s of p.sentences) add(s.danish, s.english, s.structureNote);
    }
  }

  for (const verb of VERBS) {
    add(verb.example, verb.exampleEnglish);
  }

  return index;
};

/**
 * Answers from the app's own content, or returns null.
 *
 * Returning null is the normal case for generated opgaver — nobody wrote a
 * glossary for a text the model produced ninety seconds ago — and the caller
 * falls through to the cache and then to generation.
 */
export const lookupAuthored = (danish: string, kind: string): Translation | null => {
  if (kind === "WORD") {
    wordIndex ??= buildWordIndex();
    const hit = wordIndex.get(lookupKey(danish));
    // Returned with the form the learner actually clicked, not the one the
    // glossary happened to be written against.
    return hit ? { ...hit, danish: normalise(danish) } : null;
  }

  sentenceIndex ??= buildSentenceIndex();
  const hit = sentenceIndex.get(sentenceKey(danish));
  return hit ? { ...hit, danish: normalise(danish) } : null;
};
