"use client";

import { useState } from "react";
import { GLOSSARY_BY_PASSAGE_ID } from "@/lib/content-gen/modul2-glossary";
import type { PassageSelection } from "@/types";

const tokenize = (paragraph: string): string[] => {
  // Keep whitespace as its own token so join-back preserves exact spacing.
  return paragraph.split(/(\s+)/).filter((t) => t.length > 0);
};

const lookupKey = (token: string): string => {
  return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "").toLowerCase();
};

const InfoPanel = ({ selection, onClose }: { selection: PassageSelection; onClose: () => void }) => {
  if (!selection) return null;
  return (
    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm relative">
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 text-xs"
      >
        ✕
      </button>
      {selection.kind === "word" ? (
        <div className="pr-5">
          <p className="font-semibold text-blue-900">
            {selection.gloss.lemma}{" "}
            <span className="font-normal text-blue-500">({selection.gloss.partOfSpeech})</span>
          </p>
          <p className="text-blue-800">{selection.gloss.englishGloss}</p>
          <p className="mt-1 text-xs text-blue-600">{selection.gloss.inflectionNote}</p>
        </div>
      ) : (
        <div className="pr-5">
          <p className="font-semibold text-blue-900">English meaning</p>
          <p className="text-blue-800">{selection.summary}</p>
        </div>
      )}
    </div>
  );
};

export const TranslatablePassage = ({
  passageText,
  passageId,
  defaultOn,
}: {
  passageText: string;
  passageId: string | null;
  defaultOn: boolean;
}) => {
  const [selection, setSelection] = useState<PassageSelection>(null);
  const glossary = passageId ? GLOSSARY_BY_PASSAGE_ID.get(passageId) : undefined;

  if (!glossary) {
    return <p className="mb-5 leading-relaxed text-slate-800 whitespace-pre-line">{passageText}</p>;
  }

  const wordByKey = new Map(glossary.words.map((w) => [w.surface.toLowerCase(), w]));
  const paragraphs = passageText.split("\n").filter((p) => p.trim().length > 0);

  return (
    <div className="mb-5">
      {paragraphs.map((paragraph, pIdx) => (
        <p
          key={pIdx}
          onClick={() => setSelection({ kind: "paragraph", summary: glossary.englishSummary })}
          className="leading-relaxed text-slate-800 cursor-pointer"
        >
          {tokenize(paragraph).map((token, tIdx) => {
            if (/^\s+$/.test(token)) return token;
            const gloss = wordByKey.get(lookupKey(token));
            if (!gloss) return <span key={tIdx}>{token}</span>;
            return (
              <button
                key={tIdx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelection({ kind: "word", gloss });
                }}
                className={
                  defaultOn
                    ? "underline decoration-dotted decoration-blue-400 underline-offset-2 hover:bg-blue-100 rounded-sm"
                    : "hover:bg-blue-100 rounded-sm"
                }
              >
                {token}
              </button>
            );
          })}
        </p>
      ))}
      <InfoPanel selection={selection} onClose={() => setSelection(null)} />
    </div>
  );
};
