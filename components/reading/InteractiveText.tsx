"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  glossaryIndex,
  lookupKey,
  type Gloss,
  type LearningText,
  type ReadingSupport,
  type TextSentence,
} from "@/lib/learning/text";

// Reading Danish at four levels of magnification: a word, a sentence, a
// paragraph, or the whole text.
//
// These are not four translations of the same thing — they answer different
// questions. A word asks "what is this form doing?", a sentence asks "why are
// the words in this order?", a paragraph asks "what is being said here?", and
// the full text asks "what is this about?". The controls are laid out so the
// learner reaches for the smallest one that answers their question, and so
// "translate everything" is available but never the first thing they see.

export type Focus =
  | { kind: "word"; gloss: Gloss | null; token: string; sentence: TextSentence | null }
  | { kind: "sentence"; sentence: TextSentence; index: number }
  | { kind: "paragraph"; index: number }
  | null;

/** Sentence highlight colours. Meaning is the learner's; these are just paint. */
const HIGHLIGHT_CLASS: Record<string, string> = {
  YELLOW: "bg-amber-100",
  BLUE: "bg-blue-100",
  GREEN: "bg-emerald-100",
  RED: "bg-red-100",
};

function tokenize(sentence: string): string[] {
  // Whitespace is kept as its own token so the sentence rejoins exactly.
  return sentence.split(/(\s+)/).filter((t) => t.length > 0);
}

export function InteractiveText({
  text,
  support,
  /** Rendered under the text — comprehension work, links to the grammar. */
  children,
  onFocusChange,
  showOwnPanel = true,
  showControls = true,
  highlights,
  onHighlightClick,
}: {
  text: LearningText;
  /** Overrides the default derived from the text's level. */
  support?: ReadingSupport;
  children?: React.ReactNode;
  /**
   * Told what the learner just selected. The reading library uses this to
   * drive its own side panel; lessons leave it unset and keep the inline one.
   */
  onFocusChange?: (focus: Focus) => void;
  /** Set false when the caller renders the explanation somewhere else. */
  showOwnPanel?: boolean;
  showControls?: boolean;
  /** Sentence index -> colour, for sentences the learner has highlighted. */
  highlights?: Record<number, string>;
  /** Called when a highlighted sentence's marker is clicked. */
  onHighlightClick?: (sentenceIndex: number) => void;
}) {
  const { dict } = useI18n();
  const t = dict.reading;

  const mode: ReadingSupport =
    support ?? (text.level <= 2 ? "translation_shown" : text.level <= 3 ? "translation_available" : "danish_first");

  const [focus, setFocusState] = useState<Focus>(null);

  // One place to set focus, so the caller is always told — a second copy of
  // this in each click handler is how the two get out of step.
  const setFocus = (next: Focus) => {
    setFocusState(next);
    onFocusChange?.(next);
  };
  // Danish-first texts make the learner try before the English appears.
  const [showAllEnglish, setShowAllEnglish] = useState(mode === "translation_shown");
  const [showFullTranslation, setShowFullTranslation] = useState(false);

  const glossary = useMemo(
    () => glossaryIndex(text.glossary ?? []),
    [text.glossary]
  );

  // Where each paragraph's sentences start in a numbering that runs across the
  // whole text, so "sentence 7" means the same thing wherever it is referred
  // to. Computed up front rather than counted during render — a counter
  // mutated while rendering breaks as soon as React reorders or replays the
  // work.
  const paragraphStart = useMemo(() => {
    const starts: number[] = [];
    let n = 0;
    for (const p of text.paragraphs) {
      starts.push(n);
      n += p.sentences.length;
    }
    return starts;
  }, [text.paragraphs]);

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">{text.danishTitle}</h3>
          <p className="text-sm text-slate-500">{text.title}</p>
        </div>
        <span className="text-xs font-medium rounded-full bg-slate-100 text-slate-600 px-2.5 py-1">
          {t.levelLabel(text.level)}
        </span>
      </header>

      {/* The text itself. Every word is clickable where a gloss exists; every
          sentence is clickable regardless. */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        {text.paragraphs.map((paragraph, pIdx) => (
          <div key={pIdx} className="group">
            <p className="leading-loose text-slate-800">
              {paragraph.sentences.map((sentence, i) => {
                const sIdx = paragraphStart[pIdx] + i;
                const isFocused = focus?.kind === "sentence" && focus.index === sIdx;

                return (
                  <span
                    key={sIdx}
                    className={`rounded px-0.5 transition ${
                      isFocused ? "ring-1 ring-blue-300" : ""
                    } ${HIGHLIGHT_CLASS[highlights?.[sIdx] ?? ""] ?? ""}`}
                    onDoubleClick={() => onHighlightClick?.(sIdx)}
                  >
                    {tokenize(sentence.danish).map((token, tIdx) => {
                      if (/^\s+$/.test(token)) return token;
                      const gloss = glossary.get(lookupKey(token)) ?? null;
                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocus({ kind: "word", gloss, token, sentence });
                          }}
                          // Glossed words are marked so the learner can see at
                          // a glance which ones have an answer waiting. The
                          // rest are still clickable — that is what the
                          // "explain" path is for.
                          className={
                            gloss
                              ? "underline decoration-dotted decoration-blue-300 underline-offset-4 hover:bg-blue-100 rounded-sm"
                              : "hover:bg-slate-100 rounded-sm cursor-pointer"
                          }
                        >
                          {token}
                        </button>
                      );
                    })}{" "}
                  </span>
                );
              })}
            </p>

            {/* Sentence-level English, inline, when the level calls for it. */}
            {showAllEnglish && (
              <p className="mt-1 text-sm text-slate-500 italic">{paragraph.translation}</p>
            )}

            <button
              type="button"
              onClick={() => setFocus({ kind: "paragraph", index: pIdx })}
              className="mt-1 text-xs text-slate-400 hover:text-slate-700 hover:underline"
            >
              {t.explainParagraph}
            </button>
          </div>
        ))}
      </div>

      {showOwnPanel && (
        <FocusPanel focus={focus} text={text} onClose={() => setFocus(null)} />
      )}

      {/* Controls, smallest-first. "Full translation" is last on purpose: it
          is the one that lets the learner skip the learning. */}
      {showControls && (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAllEnglish((v) => !v)}
          className="text-xs font-medium rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          {showAllEnglish ? t.hideSentenceEnglish : t.showSentenceEnglish}
        </button>
        <button
          type="button"
          onClick={() => setShowFullTranslation((v) => !v)}
          className="text-xs font-medium rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          {showFullTranslation ? t.hideFullTranslation : t.showFullTranslation}
        </button>
        <span className="text-xs text-slate-400">{t.clickHint}</span>
      </div>
      )}

      {showFullTranslation && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.fullTranslation}
          </h4>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{text.summary}</p>
        </div>
      )}

      {text.keyVocabulary && text.keyVocabulary.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {t.usefulWords}
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {text.keyVocabulary.map((v) => (
              <div key={v.danish} className="flex items-baseline gap-2 text-sm">
                <dt className="font-medium text-slate-900">{v.danish}</dt>
                <dd className="text-slate-500">— {v.english}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {children}
    </div>
  );
}

/** Whatever the learner last clicked, explained. */
function FocusPanel({
  focus,
  text,
  onClose,
}: {
  focus: Focus;
  text: LearningText;
  onClose: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.reading;
  if (!focus) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 relative">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 text-blue-400 hover:text-blue-800 text-sm"
      >
        ✕
      </button>

      {focus.kind === "word" &&
        (focus.gloss ? (
          <WordCard gloss={focus.gloss} />
        ) : (
          // No gloss written for this word. Inside a lesson there is nowhere
          // to go from here, so say so plainly rather than showing an empty
          // card; the reading library wires this up to "Explain".
          <p className="pr-6 text-sm text-blue-900">
            <span className="font-semibold">{focus.token}</span> — {t.noGloss}
          </p>
        ))}

      {focus.kind === "sentence" && (
        <div className="pr-6 space-y-2">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
            {t.sentenceLabel}
          </p>
          <p className="text-base font-medium text-blue-950">{focus.sentence.danish}</p>
          <p className="text-sm text-blue-900">{focus.sentence.english}</p>
          {focus.sentence.structureNote && (
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{t.structureLabel}: </span>
              {focus.sentence.structureNote}
            </p>
          )}
        </div>
      )}

      {focus.kind === "paragraph" && (
        <div className="pr-6 space-y-2">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
            {t.paragraphLabel}
          </p>
          <p className="text-sm text-blue-900">{text.paragraphs[focus.index]?.translation}</p>
          <ol className="mt-2 space-y-2">
            {text.paragraphs[focus.index]?.sentences.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-blue-950">{s.danish}</span>
                <span className="text-blue-700"> — {s.english}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * One word. Shows the meaning HERE first and the dictionary form second —
 * a learner mid-sentence wants to know what this form is doing, not to be
 * handed a paradigm.
 */
function WordCard({ gloss }: { gloss: Gloss }) {
  const { dict } = useI18n();
  const t = dict.reading;

  return (
    <div className="pr-6 space-y-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="text-lg font-semibold text-blue-950">{gloss.surface}</p>
        <span className="text-xs rounded-full bg-white text-blue-600 px-2 py-0.5 border border-blue-200">
          {gloss.partOfSpeech}
        </span>
      </div>
      <p className="text-sm text-blue-900">
        <span className="font-semibold">{t.meaningHere}: </span>
        {gloss.englishGloss}
      </p>
      {gloss.lemma.toLowerCase() !== gloss.surface.toLowerCase() && (
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{t.baseForm}: </span>
          {gloss.lemma}
        </p>
      )}
      <p className="text-sm text-blue-800">{gloss.inflectionNote}</p>
    </div>
  );
}
