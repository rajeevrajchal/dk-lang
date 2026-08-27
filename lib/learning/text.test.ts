import { describe, expect, it } from "vitest";
import { allSentences, glossaryIndex, lookupKey, plainText, supportForLevel, wordCount } from "./text";
import { READING_LESSONS } from "@/lib/curriculum/reading-lessons";
import { WRITING_LESSONS } from "@/lib/curriculum/writing-lessons";
import { ALL_LESSONS, LESSON_BY_SLUG, courseLessonSlugs } from "@/lib/curriculum/course";
import { lessonKind } from "@/lib/content-gen/theory";
import type { LearningText } from "@/types";

const sample: LearningText = {
  id: "t",
  title: "Test",
  danishTitle: "Test",
  genre: "story",
  level: 1,
  summary: "A test.",
  paragraphs: [
    {
      translation: "First.",
      sentences: [
        { danish: "Jeg arbejder.", english: "I work." },
        { danish: "Jeg bor i Aarhus.", english: "I live in Aarhus." },
      ],
    },
    {
      translation: "Second.",
      sentences: [{ danish: "Det er godt.", english: "That is good." }],
    },
  ],
  glossary: [
    {
      surface: "arbejder",
      lemma: "arbejde",
      englishGloss: "work",
      partOfSpeech: "verb",
      inflectionNote: "Present tense.",
    },
  ],
};

describe("lookupKey", () => {
  it("strips surrounding punctuation and lowercases", () => {
    expect(lookupKey("Arbejder,")).toBe("arbejder");
    expect(lookupKey('"Hej!"')).toBe("hej");
    expect(lookupKey("7.500")).toBe("");
  });

  it("keeps Danish letters intact", () => {
    expect(lookupKey("Grøntsager.")).toBe("grøntsager");
    expect(lookupKey("hyggeligt!")).toBe("hyggeligt");
  });
});

describe("glossaryIndex", () => {
  it("finds a word regardless of how it is punctuated in the text", () => {
    const index = glossaryIndex(sample.glossary!);
    expect(index.get(lookupKey("arbejder."))?.lemma).toBe("arbejde");
    expect(index.get(lookupKey("Arbejder"))?.lemma).toBe("arbejde");
  });

  it("keeps the first entry when a surface form is listed twice", () => {
    const index = glossaryIndex([
      { surface: "er", lemma: "være", englishGloss: "is", partOfSpeech: "verb", inflectionNote: "a" },
      { surface: "er", lemma: "andet", englishGloss: "other", partOfSpeech: "verb", inflectionNote: "b" },
    ]);
    expect(index.get("er")?.lemma).toBe("være");
  });
});

describe("text helpers", () => {
  it("flattens sentences in reading order", () => {
    expect(allSentences(sample).map((s) => s.danish)).toEqual([
      "Jeg arbejder.",
      "Jeg bor i Aarhus.",
      "Det er godt.",
    ]);
  });

  it("renders plain text with paragraphs separated", () => {
    expect(plainText(sample)).toBe("Jeg arbejder. Jeg bor i Aarhus.\n\nDet er godt.");
  });

  it("counts words across the whole text", () => {
    // 2 + 4 + 3 across the three sentences.
    expect(wordCount(sample)).toBe(9);
  });
});

describe("reading support", () => {
  it("shows the English at beginner level and withholds it later", () => {
    expect(supportForLevel(1)).toBe("translation_shown");
    expect(supportForLevel(2)).toBe("translation_shown");
    expect(supportForLevel(3)).toBe("translation_available");
    expect(supportForLevel(5)).toBe("danish_first");
  });
});

// ---------------------------------------------------------------------------
// The authored content itself
// ---------------------------------------------------------------------------

const TEXTS = ALL_LESSONS.flatMap((l) => l.texts ?? []);

describe("authored reading texts", () => {
  it("has texts to check", () => {
    expect(TEXTS.length).toBeGreaterThan(0);
  });

  it("gives every sentence a natural English meaning", () => {
    for (const text of TEXTS) {
      for (const s of allSentences(text)) {
        expect(s.english.trim(), `${text.id}: ${s.danish}`).not.toBe("");
        // A translation identical to the Danish means it was never written.
        expect(s.english).not.toBe(s.danish);
      }
    }
  });

  it("translates every paragraph and the whole text", () => {
    for (const text of TEXTS) {
      expect(text.summary.trim(), text.id).not.toBe("");
      for (const p of text.paragraphs) {
        expect(p.translation.trim(), text.id).not.toBe("");
      }
    }
  });

  it("only glosses words that actually appear in the text", () => {
    // A gloss for a word that is not there can never be reached, and usually
    // means the text was edited and the glossary was not.
    for (const text of TEXTS) {
      const present = new Set(plainText(text).split(/\s+/).map(lookupKey).filter(Boolean));
      for (const g of text.glossary ?? []) {
        expect(present.has(lookupKey(g.surface)), `${text.id}: "${g.surface}"`).toBe(true);
      }
    }
  });

  it("gives every gloss a meaning in context and a note on the form", () => {
    for (const text of TEXTS) {
      for (const g of text.glossary ?? []) {
        expect(g.englishGloss.trim(), `${text.id}: ${g.surface}`).not.toBe("");
        expect(g.inflectionNote.trim(), `${text.id}: ${g.surface}`).not.toBe("");
        expect(g.lemma.trim(), `${text.id}: ${g.surface}`).not.toBe("");
      }
    }
  });

  it("does not repeat a text id", () => {
    const ids = TEXTS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gets harder as the course goes on", () => {
    // Level 1 texts must be short; a PD3-level text must not be.
    for (const text of TEXTS) {
      if (text.level === 1) expect(wordCount(text), text.id).toBeLessThan(120);
      if (text.level >= 4) expect(wordCount(text), text.id).toBeGreaterThan(80);
    }
  });
});

describe("reading and writing lessons", () => {
  it("labels its lessons with the right kind", () => {
    for (const l of READING_LESSONS) expect(lessonKind(l)).toBe("reading");
    for (const l of WRITING_LESSONS) expect(lessonKind(l)).toBe("writing");
  });

  it("gives every reading lesson something to read", () => {
    for (const l of READING_LESSONS) {
      expect(l.texts?.length, l.slug).toBeGreaterThan(0);
    }
  });

  it("gives every writing lesson a worked example taken apart", () => {
    for (const l of WRITING_LESSONS) {
      expect(l.writingModel, l.slug).toBeDefined();
      expect(l.writingModel!.parts.length, l.slug).toBeGreaterThan(2);
      expect(l.writingModel!.checklist.length, l.slug).toBeGreaterThan(0);
      // Every part must quote text that is actually in the example, or the
      // "here is how it is built" claim is false.
      for (const part of l.writingModel!.parts) {
        const firstLine = part.danish.split("\n")[0];
        expect(l.writingModel!.example, `${l.slug}: ${part.label}`).toContain(firstLine);
      }
    }
  });

  it("reaches every new lesson from a chapter", () => {
    // A lesson no chapter references is unreachable in the course.
    const referenced = new Set(courseLessonSlugs());
    for (const l of [...READING_LESSONS, ...WRITING_LESSONS]) {
      expect(referenced.has(l.slug), l.slug).toBe(true);
      expect(LESSON_BY_SLUG.get(l.slug), l.slug).toBeDefined();
    }
  });

  it("ends each lesson with production, not recognition", () => {
    // Reading and writing lessons exist to get the learner producing Danish.
    for (const l of [...READING_LESSONS, ...WRITING_LESSONS]) {
      const last = l.exercises?.[l.exercises.length - 1];
      expect(last, l.slug).toBeDefined();
      expect(
        ["free_production", "communication", "controlled_production"],
        l.slug
      ).toContain(last!.kind);
    }
  });
});
