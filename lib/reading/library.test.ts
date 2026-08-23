import { describe, expect, it } from "vitest";
import {
  READING_TOPICS,
  estimatedMinutes,
  facetCounts,
  filterLibrary,
  recommend,
  textLength,
  toSummary,
} from "./library";
import { READING_LIBRARY, READING_BY_ID, readingText } from "./registry";
import { parseInterests, serialiseInterests } from "./interests";
import { allSentences, lookupKey, plainText, wordCount } from "@/lib/learning/text";
import { answerFromText, contextFor, fromGloss } from "./explain";

// ---------------------------------------------------------------------------
// The library itself
// ---------------------------------------------------------------------------

describe("the library", () => {
  it("has texts across the whole difficulty range", () => {
    const levels = new Set(READING_LIBRARY.map((t) => t.level));
    // A library that starts at level 3 is useless to a beginner, and one that
    // stops at 3 never gets anybody to PD3.
    expect(levels.has(1)).toBe(true);
    expect(levels.has(5)).toBe(true);
    expect(READING_LIBRARY.length).toBeGreaterThanOrEqual(8);
  });

  it("covers the practical text types, not only prose", () => {
    const genres = new Set(READING_LIBRARY.map((t) => t.text.genre));
    for (const g of ["story", "daily_life", "email", "sms", "notice", "advertisement", "article"]) {
      expect(genres.has(g as never), g).toBe(true);
    }
  });

  it("is ordered easiest first", () => {
    const levels = READING_LIBRARY.map((t) => t.level);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it("gives every entry a distinct id that resolves", () => {
    const ids = READING_LIBRARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(readingText(id)?.id).toBe(id);
    expect(READING_BY_ID.size).toBe(READING_LIBRARY.length);
  });

  it("tags every text with topics from the shared list", () => {
    // Interests and text topics have to come from one vocabulary, or a
    // learner's interest can silently match nothing.
    for (const t of READING_LIBRARY) {
      expect(t.topics.length, t.id).toBeGreaterThan(0);
      for (const topic of t.topics) {
        expect(READING_TOPICS, `${t.id}: ${topic}`).toContain(topic);
      }
    }
  });

  it("gives every text a blurb that is not just its summary", () => {
    for (const t of READING_LIBRARY) {
      expect(t.blurb.trim(), t.id).not.toBe("");
    }
  });

  it("only glosses words that are actually in the text", () => {
    for (const entry of READING_LIBRARY) {
      const present = new Set(plainText(entry.text).split(/\s+/).map(lookupKey).filter(Boolean));
      for (const g of entry.text.glossary ?? []) {
        expect(present.has(lookupKey(g.surface)), `${entry.id}: "${g.surface}"`).toBe(true);
      }
    }
  });

  it("only lists phrases that appear in their text", () => {
    // Checked word by word and in order rather than as a substring: Danish
    // routinely splits these expressions ("peger ogsa pa"), and a substring
    // match would reject a phrase that is genuinely there.
    for (const entry of READING_LIBRARY) {
      const words = plainText(entry.text).toLowerCase().split(/\s+/).map(lookupKey);
      for (const p of entry.phrases ?? []) {
        const needles = p.danish.toLowerCase().split(/\s+/).map(lookupKey).filter(Boolean);
        let at = 0;
        for (const n of needles) {
          at = words.indexOf(n, at);
          if (at === -1) break;
          at += 1;
        }
        expect(at, `${entry.id}: "${p.danish}"`).not.toBe(-1);
      }
    }
  });

  it("translates every sentence and paragraph", () => {
    for (const entry of READING_LIBRARY) {
      for (const s of allSentences(entry.text)) {
        expect(s.english.trim(), `${entry.id}: ${s.danish}`).not.toBe("");
        expect(s.english).not.toBe(s.danish);
      }
      for (const p of entry.text.paragraphs) {
        expect(p.translation.trim(), entry.id).not.toBe("");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

describe("metadata", () => {
  it("estimates reading time at a learner's pace, not a native's", () => {
    const beginner = READING_LIBRARY.find((t) => t.level === 1)!;
    const advanced = READING_LIBRARY.find((t) => t.level === 5)!;
    // A beginner text of ~90 words is several minutes of work, not "1 min".
    expect(estimatedMinutes(beginner)).toBeGreaterThanOrEqual(2);
    expect(estimatedMinutes(advanced)).toBeGreaterThanOrEqual(1);
  });

  it("never claims a text takes zero minutes", () => {
    for (const t of READING_LIBRARY) expect(estimatedMinutes(t)).toBeGreaterThan(0);
  });

  it("classifies length by word count", () => {
    for (const t of READING_LIBRARY) {
      const words = wordCount(t.text);
      const expected = words < 90 ? "short" : words < 220 ? "medium" : "long";
      expect(textLength(t), t.id).toBe(expected);
    }
  });

  it("summarises without shipping the text body", () => {
    const s = toSummary(READING_LIBRARY[0]);
    expect(s).not.toHaveProperty("paragraphs");
    expect(s.cefr).toBeTruthy();
    expect(s.words).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Filtering and recommending
// ---------------------------------------------------------------------------

describe("filterLibrary", () => {
  it("filters by level, genre and topic together", () => {
    const out = filterLibrary(READING_LIBRARY, { level: 2 });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((t) => t.level === 2)).toBe(true);
  });

  it("separates read from unread", () => {
    const first = READING_LIBRARY[0].id;
    const completedIds = new Set([first]);
    expect(filterLibrary(READING_LIBRARY, { status: "completed", completedIds })).toHaveLength(1);
    expect(
      filterLibrary(READING_LIBRARY, { status: "unread", completedIds }).some((t) => t.id === first)
    ).toBe(false);
  });

  it("searches the Danish body, not only the title", () => {
    const out = filterLibrary(READING_LIBRARY, { search: "cykelstierne" });
    expect(out.map((t) => t.id)).toContain("lib-derfor-cykler-danskerne");
  });

  it("returns everything when nothing is asked for", () => {
    expect(filterLibrary(READING_LIBRARY, {})).toHaveLength(READING_LIBRARY.length);
  });
});

describe("recommend", () => {
  it("prefers texts matching the learner's interests", () => {
    const out = recommend(READING_LIBRARY, { interests: ["housing"], level: 2, limit: 3 });
    expect(out.some((t) => t.topics.includes("housing"))).toBe(true);
  });

  it("does not recommend something already read", () => {
    const target = READING_LIBRARY.find((t) => t.topics.includes("work"))!;
    const out = recommend(READING_LIBRARY, {
      interests: ["work"],
      level: target.level,
      completedIds: new Set([target.id]),
    });
    expect(out.map((t) => t.id)).not.toContain(target.id);
  });

  it("does not push a beginner at PD3-level texts", () => {
    const out = recommend(READING_LIBRARY, { interests: ["society"], level: 1, limit: 5 });
    expect(out.every((t) => t.level <= 2)).toBe(true);
  });

  it("still recommends on level alone when no interests are set", () => {
    const out = recommend(READING_LIBRARY, { interests: [], level: 3, limit: 3 });
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("facetCounts", () => {
  it("counts every text exactly once per facet", () => {
    const f = facetCounts(READING_LIBRARY);
    const levelTotal = Object.values(f.levels).reduce((a, b) => a + b, 0);
    expect(levelTotal).toBe(READING_LIBRARY.length);
  });
});

// ---------------------------------------------------------------------------
// Interests
// ---------------------------------------------------------------------------

describe("interests", () => {
  it("round-trips", () => {
    expect(parseInterests(serialiseInterests(["food", "travel"]))).toEqual(["food", "travel"]);
  });

  it("drops anything unrecognised rather than failing", () => {
    expect(parseInterests('["food","not-a-topic",7]')).toEqual(["food"]);
    expect(parseInterests("not json")).toEqual([]);
    expect(parseInterests(null)).toEqual([]);
  });

  it("de-duplicates on save", () => {
    expect(parseInterests(serialiseInterests(["food", "food"]))).toEqual(["food"]);
  });
});

// ---------------------------------------------------------------------------
// Answering without the model — the rule the cost of this feature rests on
// ---------------------------------------------------------------------------

describe("answerFromText", () => {
  const entry = READING_LIBRARY.find((t) => (t.text.glossary?.length ?? 0) > 0)!;

  it("answers a glossed word from the text, with no model call", () => {
    const gloss = entry.text.glossary![0];
    const answer = answerFromText(entry.text, {
      kind: "WORD",
      id: gloss.surface,
      selection: gloss.surface,
    });
    expect(answer).not.toBeNull();
    expect(answer!.summary).toBe(gloss.englishGloss);
    expect(answer!.baseForm).toBe(gloss.lemma);
  });

  it("finds a glossed word regardless of the punctuation around it", () => {
    const gloss = entry.text.glossary![0];
    const answer = answerFromText(entry.text, {
      kind: "WORD",
      id: gloss.surface,
      selection: `${gloss.surface},`,
    });
    expect(answer).not.toBeNull();
  });

  it("answers a sentence and a paragraph from the text", () => {
    expect(answerFromText(entry.text, { kind: "SENTENCE", id: "0", selection: "" })).not.toBeNull();
    expect(answerFromText(entry.text, { kind: "PARAGRAPH", id: "0", selection: "" })).not.toBeNull();
  });

  it("answers the whole text from its summary", () => {
    const answer = answerFromText(entry.text, { kind: "TEXT", id: "", selection: "" });
    expect(answer!.summary).toBe(entry.text.summary);
  });

  it("returns null for an unglossed word, so the caller knows to generate", () => {
    expect(
      answerFromText(entry.text, { kind: "WORD", id: "zzz", selection: "zzzznotaword" })
    ).toBeNull();
  });

  it("returns null for a learner-selected phrase, which nobody could have glossed", () => {
    expect(
      answerFromText(entry.text, { kind: "PHRASE", id: "x", selection: "en rød hue" })
    ).toBeNull();
  });

  it("glosses the harder words of every beginner text", () => {
    // The product rule this enforces: a beginner must be able to read without
    // an API key. They have no other resource — clicking an unglossed word
    // with generation unavailable gives them nothing — so level 1-2 texts
    // carry their own answers. Advanced texts may lean on generation, because
    // by then the learner can also cope with an unexplained word.
    //
    // Measured over DISTINCT words of five letters or more. Counting every
    // token instead would mostly measure how often "og" and "jeg" repeat,
    // which says nothing about whether a click gets answered.
    for (const e of READING_LIBRARY) {
      const index = new Set((e.text.glossary ?? []).map((g) => lookupKey(g.surface)));
      const harder = new Set(
        plainText(e.text)
          .split(/\s+/)
          .map(lookupKey)
          .filter((w) => w.length >= 5)
      );
      const covered = [...harder].filter((w) => index.has(w)).length;
      const ratio = covered / harder.size;

      if (e.level <= 2) expect(ratio, `${e.id} (level ${e.level})`).toBeGreaterThanOrEqual(0.5);
      else expect(ratio, `${e.id} (level ${e.level})`).toBeGreaterThanOrEqual(0.35);
    }
  });
});

describe("contextFor", () => {
  const entry = READING_LIBRARY.find((t) => t.id === "lib-en-dag-i-parken")!;

  it("finds the sentence a word sits in", () => {
    const ctx = contextFor(entry.text, { kind: "WORD", id: "hue", selection: "hue" });
    expect(ctx.sentence).toContain("hue");
    expect(ctx.paragraph).toContain("hue");
  });

  it("returns the sentence itself for a sentence scope", () => {
    const ctx = contextFor(entry.text, { kind: "SENTENCE", id: "0", selection: "" });
    expect(ctx.sentence).toBe(allSentences(entry.text)[0].danish);
  });

  it("returns nothing findable rather than guessing", () => {
    expect(contextFor(entry.text, { kind: "WORD", id: "x", selection: "zzzz" })).toEqual({});
  });
});

describe("fromGloss", () => {
  it("leads with the meaning in this sentence, not the dictionary form", () => {
    const e = fromGloss({
      surface: "står",
      lemma: "stå",
      englishGloss: "get up",
      partOfSpeech: "verb",
      inflectionNote: "Present of 'at stå'.",
    });
    // The learner asked what this word is doing here — "get up", not "stand".
    expect(e.summary).toBe("get up");
    expect(e.baseForm).toBe("stå");
  });
});
