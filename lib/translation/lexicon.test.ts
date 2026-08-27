import { describe, expect, it } from "vitest";
import { lookupAuthored } from "./lexicon";
import { notesFor } from "@/lib/notes/side-notes";

// The rule this file exists to protect: DO NOT CALL THE MODEL WHEN THE APP
// ALREADY KNOWS THE ANSWER. Every one of these lookups is free and instant,
// and a regression here would turn ordinary reading into an API bill.

describe("the authored lexicon", () => {
  it("knows the words in the Modul 2 glossaries", () => {
    const t = lookupAuthored("arbejder", "WORD");
    expect(t?.english).toBeTruthy();
    expect(t?.source).toBe("authored");
    expect(t?.baseForm).toBe("arbejde");
  });

  it("knows every form of a verb in the collection", () => {
    for (const form of ["vælge", "vælger", "valgte", "valgt"]) {
      const t = lookupAuthored(form, "WORD");
      expect(t, form).not.toBeNull();
      expect(t?.baseForm, form).toBe("vælge");
    }
  });

  it("ignores case and surrounding punctuation", () => {
    expect(lookupAuthored("Arbejder,", "WORD")?.baseForm).toBe("arbejde");
  });

  it("answers with the form that was actually clicked", () => {
    expect(lookupAuthored("Valgte", "WORD")?.danish).toBe("Valgte");
  });

  it("knows the sentences of the library texts and the verb examples", () => {
    const t = lookupAuthored("Jeg arbejder på et kontor i Aarhus.", "SENTENCE");
    expect(t?.english).toBe("I work in an office in Aarhus.");
    expect(t?.source).toBe("authored");
  });

  it("matches a sentence regardless of trailing punctuation", () => {
    expect(lookupAuthored("jeg arbejder på et kontor i aarhus", "SENTENCE")).not.toBeNull();
  });

  it("returns null for Danish nobody has written down", () => {
    expect(lookupAuthored("qwertyuiop", "WORD")).toBeNull();
    expect(lookupAuthored("Dette er en sætning ingen har skrevet ned.", "SENTENCE")).toBeNull();
  });
});

describe("side notes", () => {
  it("shows the exam tip for the opgave being practised", () => {
    const notes = notesFor({ taskType: "reading_task_1_matching" });
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0].kind).toBe("exam");
  });

  it("shows nothing when nothing is relevant", () => {
    expect(notesFor({ taskType: "no_such_task" })).toEqual([]);
  });

  it("never shows more than the cap", () => {
    expect(notesFor({ surface: "verbs" }, 2).length).toBeLessThanOrEqual(2);
  });

  it("matches on the grammar the learner is getting wrong", () => {
    const notes = notesFor({ topics: ["word-order"] });
    expect(notes.some((n) => n.id === "v2" || n.id === "ikke-position")).toBe(true);
  });
});
