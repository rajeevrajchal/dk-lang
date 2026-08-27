"use client";

import { useState } from "react";
import { useTranslations } from "./TranslationProvider";
import { Spinner } from "@/components/ui/states";
import type { Translation } from "@/types";

// Danish that can be translated without being replaced.
//
// The requirement behind this component is that word-level and sentence-level
// translation are DIFFERENT ACTIONS with different affordances, and that
// neither disturbs the Danish:
//
//   · click a word     → what that word means here, in a small popover
//   · press "English"  → the whole sentence, added UNDER the Danish
//
// The Danish never moves and is never replaced. A learner who is reading has
// to keep seeing the thing they are reading; a component that swapped the
// Danish for English would be a translator, not a learning aid.

const tokenize = (text: string): string[] => {
  // Whitespace is kept as its own token so the text rejoins exactly.
  return text.split(/(\s+)/).filter((t) => t.length > 0);
};

const isWord = (token: string): boolean => /\p{L}/u.test(token);

const WordPopover = ({
  token,
  translation,
  pending,
  onClose,
}: {
  token: string;
  translation: Translation | null;
  pending: boolean;
  onClose: () => void;
}) => {
  return (
    <span className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-blue-200 bg-white p-3 text-left shadow-lg">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-1.5 text-xs text-blue-400 hover:text-blue-700"
      >
        ✕
      </button>
      <span className="block pr-4 text-sm font-semibold text-blue-950">{token}</span>
      {pending && !translation && (
        <span className="mt-1 block text-xs text-blue-600">
          <Spinner className="mr-1" />
          Looking it up…
        </span>
      )}
      {translation && (
        <>
          <span className="mt-0.5 block text-sm text-blue-900">{translation.english}</span>
          {translation.baseForm && translation.baseForm.toLowerCase() !== token.toLowerCase() && (
            <span className="mt-1 block text-xs text-blue-700">
              Dictionary form: <span className="font-medium">{translation.baseForm}</span>
              {translation.partOfSpeech ? ` · ${translation.partOfSpeech}` : ""}
            </span>
          )}
          {translation.note && (
            <span className="mt-1 block text-xs text-blue-700">{translation.note}</span>
          )}
        </>
      )}
      {!pending && !translation && (
        <span className="mt-1 block text-xs text-amber-700">
          No translation available for this word right now.
        </span>
      )}
    </span>
  );
};

/**
 * A block of Danish.
 *
 * `sentence` is what the sentence button translates and what a clicked word is
 * given as context — the same string by default, but a caller can pass the
 * surrounding sentence when the visible text is only part of one.
 */
export const DanishText = ({
  text,
  sentence,
  className = "",
  /** Set false for a label or a heading, where a whole-text button is noise. */
  showSentenceButton = true,
  as: Wrapper = "p",
}: {
  text: string;
  sentence?: string;
  className?: string;
  showSentenceButton?: boolean;
  as?: "p" | "span" | "div";
}) => {
  const { get, isPending, request } = useTranslations();
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [showSentence, setShowSentence] = useState(false);

  const context = sentence ?? text;
  const sentenceTranslation = get(text, "SENTENCE");
  const sentencePending = isPending(text, "SENTENCE");

  const onWordClick = (raw: string) => {
    // Strip the punctuation the learner did not click on.
    const word = raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
    if (!word) return;
    setOpenWord((current) => (current === word ? null : word));
    void request([{ danish: word, kind: "WORD", context }]);
  };

  const onSentenceClick = () => {
    setShowSentence((v) => !v);
    if (!sentenceTranslation) void request([{ danish: text, kind: "SENTENCE" }]);
  };

  return (
    <Wrapper className={className}>
      <span className="leading-relaxed">
        {tokenize(text).map((token, i) => {
          if (!isWord(token)) return <span key={i}>{token}</span>;
          const word = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
          const open = openWord === word;
          return (
            <span key={i} className="relative inline-block">
              <button
                type="button"
                onClick={() => onWordClick(token)}
                title={`Translate “${word}”`}
                className={`rounded-sm transition ${
                  open ? "bg-blue-200" : "hover:bg-blue-100 focus:bg-blue-100"
                }`}
              >
                {token}
              </button>
              {open && (
                <WordPopover
                  token={word}
                  translation={get(word, "WORD")}
                  pending={isPending(word, "WORD")}
                  onClose={() => setOpenWord(null)}
                />
              )}
            </span>
          );
        })}
      </span>

      {showSentenceButton && (
        <>
          {" "}
          <button
            type="button"
            onClick={onSentenceClick}
            aria-expanded={showSentence}
            className="whitespace-nowrap rounded border border-slate-300 bg-white px-1.5 py-0.5 align-middle text-[11px] font-medium text-slate-500 hover:bg-slate-50"
          >
            {showSentence ? "Hide English" : "English"}
          </button>
        </>
      )}

      {showSentence && (
        <span className="mt-1.5 block rounded-md border-l-2 border-blue-300 bg-blue-50/60 px-3 py-2 text-sm">
          {sentencePending && !sentenceTranslation ? (
            <span className="text-blue-700">
              <Spinner className="mr-1" />
              Translating…
            </span>
          ) : sentenceTranslation ? (
            <>
              <span className="block text-blue-900">{sentenceTranslation.english}</span>
              {sentenceTranslation.literal && (
                <span className="mt-1 block text-xs text-blue-700">
                  Word for word: {sentenceTranslation.literal}
                </span>
              )}
              {sentenceTranslation.note && (
                <span className="mt-1 block text-xs text-blue-700">
                  {sentenceTranslation.note}
                </span>
              )}
            </>
          ) : (
            <span className="text-amber-700">
              The translation service is not available right now.
            </span>
          )}
        </span>
      )}
    </Wrapper>
  );
};

/**
 * Several lines of Danish that belong together — a paragraph, an advert, a
 * person's description. Each line gets its own sentence translation, because
 * "translate the paragraph" is a different question from "translate this
 * sentence" and the smaller one is almost always the one being asked.
 */
export const DanishBlock = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={className}>
      {sentences.map((s, i) => (
        <DanishText key={i} as="span" text={s} className="mr-1 inline" />
      ))}
    </div>
  );
};
