"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { InteractiveText } from "./InteractiveText";
import { LearningPanel } from "./LearningPanel";
import type {
  Focus,
  LearningText,
  NoteRow,
  PanelTab,
  Phrase,
  ReadingExplanation,
  SavedWordRow,
} from "@/types";

// The reading page: the text on the left, the teacher on the right.
//
// Reading stays the main thing. Explanations arrive when asked for and never
// interrupt — nothing pops up, nothing is auto-translated, and the panel does
// not steal focus. On a narrow screen the panel becomes a sheet at the bottom,
// because a 260px column beside a text is worse than no column at all.

const HIGHLIGHT_CYCLE = ["YELLOW", "BLUE", "GREEN", "RED", null] as const;

export const TextReader = ({
  textId,
  text,
  phrases,
  grammarLinks,
  courseHref,
  courseChapterName,
  initialCompleted,
  initialBookmarked,
}: {
  textId: string;
  text: LearningText;
  phrases: Phrase[];
  grammarLinks: { code: string; name: string; href: string | null }[];
  courseHref: string | null;
  courseChapterName: string | null;
  initialCompleted: boolean;
  initialBookmarked: boolean;
}) => {
  const { dict } = useI18n();
  const t = dict.reading;

  const [focus, setFocus] = useState<Focus>(null);
  const [tab, setTab] = useState<PanelTab>("explain");
  const [panelOpen, setPanelOpen] = useState(false);

  const [explanation, setExplanation] = useState<ReadingExplanation | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [deepened, setDeepened] = useState(false);

  const [words, setWords] = useState<SavedWordRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [highlights, setHighlights] = useState<Record<number, string>>({});

  const [completed, setCompleted] = useState(initialCompleted);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  // ---- loading and progress ---------------------------------------------

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [w, n, h] = await Promise.all([
        fetch(`/api/reading/words?textId=${textId}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/reading/notes?textId=${textId}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/reading/highlights?textId=${textId}`).then((r) => (r.ok ? r.json() : [])),
      ]);
      if (cancelled) return;
      setWords(w);
      setNotes(n);
      setHighlights(
        Object.fromEntries(
          (h as { sentenceIndex: number; color: string }[]).map((x) => [x.sentenceIndex, x.color])
        )
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [textId]);

  const post = useCallback(
    (path: string, body: unknown, method = "POST") =>
      fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    []
  );

  // Records that the text was opened, and how long it stayed open. Sent on
  // unmount rather than on a timer — a ticking request every few seconds to
  // record that somebody is reading would cost more than the number is worth.
  const openedAt = useRef(Date.now());
  useEffect(() => {
    post("/api/reading/progress", { textId, status: "OPENED" });
    const started = openedAt.current;
    return () => {
      const seconds = Math.round((Date.now() - started) / 1000);
      // Ignore a glance. Anything over an hour is a forgotten tab, not reading.
      if (seconds < 10 || seconds > 3600) return;
      const body = JSON.stringify({ textId, addSeconds: seconds });
      // keepalive so the request survives the page going away.
      fetch("/api/reading/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };
  }, [textId, post]);

  // ---- explaining --------------------------------------------------------

  const scopeFor = (f: Focus) => {
    if (!f) return null;
    if (f.kind === "word") {
      return { scopeKind: "WORD" as const, scopeId: f.token, selection: f.token };
    }
    if (f.kind === "sentence") {
      return {
        scopeKind: "SENTENCE" as const,
        scopeId: String(f.index),
        selection: f.sentence.danish,
      };
    }
    return {
      scopeKind: "PARAGRAPH" as const,
      scopeId: String(f.index),
      selection: String(f.index),
    };
  };

  const explainFocus = useCallback(
    async (f: Focus, opts: { depth?: "DEFAULT" | "DEEP"; question?: string } = {}) => {
      const scope = scopeFor(f);
      if (!scope) return;

      setExplaining(true);
      setExplainError(null);
      try {
        const res = await post("/api/reading/explain", {
          textId,
          ...scope,
          depth: opts.depth ?? "DEFAULT",
          ...(opts.question ? { question: opts.question } : {}),
        });
        const data = await res.json();
        if (!res.ok) {
          setExplainError(
            data.reason?.includes("ANTHROPIC_API_KEY") ? t.explainNoKey : t.explainFailed
          );
          return;
        }
        setExplanation(data as ReadingExplanation);
        if (opts.depth === "DEEP") setDeepened(true);
      } catch {
        setExplainError(t.explainFailed);
      } finally {
        setExplaining(false);
      }
    },
    [post, textId, t.explainNoKey, t.explainFailed]
  );

  // Selecting something clears the last answer, then answers immediately IF
  // the text already knows — a glossed word or a translated sentence costs
  // nothing, so making the learner press "Explain" for it would be busywork.
  // Anything else waits for them to ask.
  const onFocusChange = (next: Focus) => {
    setFocus(next);
    setExplanation(null);
    setExplainError(null);
    setDeepened(false);
    setTab("explain");
    setPanelOpen(true);

    if (!next) return;
    const answeredByText =
      (next.kind === "word" && next.gloss) ||
      next.kind === "sentence" ||
      next.kind === "paragraph";
    if (answeredByText) void explainFocus(next);
  };

  // ---- saving ------------------------------------------------------------

  const saveWord = async () => {
    if (focus?.kind !== "word") return;
    const clean = focus.token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
    const res = await post("/api/reading/words", {
      kind: "WORD",
      danish: clean,
      lemma: focus.gloss?.lemma ?? explanation?.baseForm,
      translation: focus.gloss?.englishGloss ?? explanation?.meaning ?? explanation?.summary ?? "",
      partOfSpeech: focus.gloss?.partOfSpeech ?? explanation?.partOfSpeech,
      grammarNote: focus.gloss?.inflectionNote ?? explanation?.grammar,
      contextSentence: focus.sentence?.danish,
      sourceTextId: textId,
    });
    if (!res.ok) return;
    const saved: SavedWordRow = await res.json();
    setWords((w) => [saved, ...w.filter((x) => x.id !== saved.id)]);
  };

  const savePhrase = async (phrase: Phrase) => {
    const res = await post("/api/reading/words", {
      kind: "PHRASE",
      danish: phrase.lemma,
      lemma: phrase.lemma,
      translation: phrase.english,
      grammarNote: phrase.note,
      sourceTextId: textId,
    });
    if (!res.ok) return;
    const saved: SavedWordRow = await res.json();
    setWords((w) => [saved, ...w.filter((x) => x.id !== saved.id)]);
  };

  const addNote = async (body: string) => {
    const anchor = focus
      ? focus.kind === "word"
        ? { anchorKind: "WORD", anchorId: focus.token, quote: focus.sentence?.danish }
        : focus.kind === "sentence"
          ? { anchorKind: "SENTENCE", anchorId: String(focus.index), quote: focus.sentence.danish }
          : { anchorKind: "PARAGRAPH", anchorId: String(focus.index), quote: null }
      : { anchorKind: "TEXT", anchorId: null, quote: null };

    const res = await post("/api/reading/notes", { textId, ...anchor, body });
    if (!res.ok) return;
    const saved: NoteRow = await res.json();
    setNotes((n) => [saved, ...n]);
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/reading/notes?id=${id}`, { method: "DELETE" });
    if (res.ok) setNotes((n) => n.filter((x) => x.id !== id));
  };

  const deleteWord = async (id: string) => {
    const res = await fetch(`/api/reading/words?id=${id}`, { method: "DELETE" });
    if (res.ok) setWords((w) => w.filter((x) => x.id !== id));
  };

  const toggleLearned = async (id: string, learned: boolean) => {
    const res = await post("/api/reading/words", { id, learned }, "PATCH");
    if (res.ok) setWords((w) => w.map((x) => (x.id === id ? { ...x, learned } : x)));
  };

  // Cycles through the colours and then off, so one repeated action both
  // makes and removes a highlight.
  const cycleHighlight = async (sentenceIndex: number) => {
    const current = highlights[sentenceIndex] ?? null;
    const idx = HIGHLIGHT_CYCLE.indexOf(current as (typeof HIGHLIGHT_CYCLE)[number]);
    const next = HIGHLIGHT_CYCLE[(idx + 1) % HIGHLIGHT_CYCLE.length];

    setHighlights((h) => {
      const copy = { ...h };
      if (next) copy[sentenceIndex] = next;
      else delete copy[sentenceIndex];
      return copy;
    });
    await post("/api/reading/highlights", { textId, sentenceIndex, color: next });
  };

  const toggleBookmark = async () => {
    const next = !bookmarked;
    setBookmarked(next);
    await post("/api/reading/progress", { textId, bookmarked: next });
  };

  const markComplete = async () => {
    setCompleted(true);
    await post("/api/reading/progress", { textId, status: "COMPLETED" });
  };

  const panel = (
    <LearningPanel
      focus={focus}
      explanation={explanation}
      explaining={explaining}
      explainError={explainError}
      canGoDeeper={!deepened}
      onExplain={() => focus && explainFocus(focus)}
      onDeeper={() => focus && explainFocus(focus, { depth: "DEEP" })}
      onAsk={(question) => focus && explainFocus(focus, { depth: "DEEP", question })}
      onSaveWord={saveWord}
      onSavePhrase={savePhrase}
      onAddNote={addNote}
      onDeleteNote={deleteNote}
      onToggleLearned={toggleLearned}
      onDeleteWord={deleteWord}
      words={words}
      notes={notes}
      phrases={phrases}
      grammarLinks={grammarLinks}
      tab={tab}
      onTabChange={setTab}
    />
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex-1 min-w-0 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link href="/class/reading/library" className="text-sm text-slate-500 hover:underline">
            {t.backToLibrary}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleBookmark}
              className={`text-xs font-medium rounded-md border px-3 py-1.5 ${
                bookmarked
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {bookmarked ? t.bookmarked : t.bookmark}
            </button>
            <button
              type="button"
              onClick={markComplete}
              disabled={completed}
              className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              {completed ? t.markedComplete : t.markComplete}
            </button>
          </div>
        </div>

        {courseHref && courseChapterName && (
          <p className="text-xs text-slate-400">
            {t.readInCourse}{" "}
            <Link href={courseHref} className="text-slate-600 hover:underline">
              {courseChapterName} →
            </Link>
          </p>
        )}

        <InteractiveText
          text={text}
          onFocusChange={onFocusChange}
          showOwnPanel={false}
          highlights={highlights}
          onHighlightClick={cycleHighlight}
        />

        <p className="text-xs text-slate-400">{t.highlightHint}</p>
      </div>

      {/* Desktop: a column beside the text. */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-6 rounded-xl border border-slate-200 bg-white h-[calc(100vh-6rem)] overflow-hidden">
          {panel}
        </div>
      </aside>

      {/* Mobile: a sheet from the bottom, opened by selecting something. */}
      {panelOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 max-h-[70vh] rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl flex flex-col">
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="w-full py-2 text-xs text-slate-400"
            aria-label="Close"
          >
            ▾
          </button>
          <div className="flex-1 overflow-hidden">{panel}</div>
        </div>
      )}
    </div>
  );
};
