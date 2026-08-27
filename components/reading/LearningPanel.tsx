"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type {
  Focus,
  NoteRow,
  PanelTab,
  Phrase,
  ReadingExplanation,
  SavedWordRow,
} from "@/types";

// The teacher beside the text.
//
// Whatever the learner last selected, explained — with the actions that turn
// a moment of understanding into something kept: save the word, write a note,
// mark the sentence. The tabs exist so the panel is useful when nothing is
// selected too; a panel that is blank until you click something teaches the
// learner it is not worth looking at.

export const LearningPanel = ({
  focus,
  explanation,
  explaining,
  explainError,
  canGoDeeper,
  onExplain,
  onDeeper,
  onAsk,
  onSaveWord,
  onSavePhrase,
  onAddNote,
  onDeleteNote,
  onToggleLearned,
  onDeleteWord,
  words,
  notes,
  phrases,
  grammarLinks,
  tab,
  onTabChange,
}: {
  focus: Focus;
  explanation: ReadingExplanation | null;
  explaining: boolean;
  explainError: string | null;
  canGoDeeper: boolean;
  onExplain: () => void;
  onDeeper: () => void;
  onAsk: (question: string) => void;
  onSaveWord: () => void;
  onSavePhrase: (phrase: Phrase) => void;
  onAddNote: (body: string) => void;
  onDeleteNote: (id: string) => void;
  onToggleLearned: (id: string, learned: boolean) => void;
  onDeleteWord: (id: string) => void;
  words: SavedWordRow[];
  notes: NoteRow[];
  phrases: Phrase[];
  grammarLinks: { code: string; name: string; href: string | null }[];
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}) => {
  const { dict } = useI18n();
  const t = dict.reading;

  const [question, setQuestion] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  const savedKeys = new Set(words.map((w) => w.danish.toLowerCase()));

  const TABS: { id: PanelTab; label: string; count?: number }[] = [
    { id: "explain", label: t.tabExplain },
    { id: "vocabulary", label: t.tabVocabulary, count: words.length },
    { id: "notes", label: t.tabNotes, count: notes.length },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200">
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onTabChange(x.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition ${
              tab === x.id
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {x.label}
            {x.count ? <span className="ml-1 text-slate-400">{x.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === "explain" && (
          <>
            {!focus && (
              <div className="text-sm text-slate-500 space-y-2">
                <p>{t.panelIdle}</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>· {t.panelIdleWord}</li>
                  <li>· {t.panelIdleSentence}</li>
                  <li>· {t.panelIdleHighlight}</li>
                </ul>
              </div>
            )}

            {focus && (
              <>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {focus.kind === "word"
                      ? t.selectedWord
                      : focus.kind === "sentence"
                        ? t.sentenceLabel
                        : t.paragraphLabel}
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900 break-words">
                    {focus.kind === "word"
                      ? focus.token
                      : focus.kind === "sentence"
                        ? focus.sentence.danish
                        : t.paragraphLabel}
                  </p>
                </div>

                {explaining && (
                  <p className="text-sm text-slate-500">
                    <span className="inline-block animate-pulse">{t.thinking}</span>
                  </p>
                )}

                {explainError && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-900">{explainError}</p>
                  </div>
                )}

                {explanation && (
                  <div className="space-y-3">
                    {/* Short answer first. Everything else is folded away
                        until the learner asks — they clicked one word and
                        want to get back to reading. */}
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {explanation.summary}
                    </p>

                    {(explanation.baseForm || explanation.partOfSpeech) && (
                      <dl className="text-xs text-slate-600 space-y-0.5">
                        {explanation.baseForm && (
                          <div className="flex gap-2">
                            <dt className="text-slate-400">{t.baseForm}</dt>
                            <dd className="font-medium">{explanation.baseForm}</dd>
                          </div>
                        )}
                        {explanation.partOfSpeech && (
                          <div className="flex gap-2">
                            <dt className="text-slate-400">{t.partOfSpeech}</dt>
                            <dd>{explanation.partOfSpeech}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {explanation.literal && explanation.literal !== explanation.meaning && (
                      <div className="rounded-lg bg-slate-50 p-3 text-xs">
                        <p className="text-slate-500">
                          <span className="font-semibold">{t.literally}: </span>
                          {explanation.literal}
                        </p>
                        {explanation.meaning && (
                          <p className="mt-1 text-slate-700">
                            <span className="font-semibold">{t.naturally}: </span>
                            {explanation.meaning}
                          </p>
                        )}
                      </div>
                    )}

                    {(explanation.grammar || explanation.structure || explanation.examples) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowDetail((v) => !v)}
                          className="text-xs font-medium text-slate-600 hover:underline"
                        >
                          {showDetail ? t.lessDetail : t.moreGrammar}
                        </button>

                        {showDetail && (
                          <div className="space-y-3">
                            {explanation.grammar && (
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {explanation.grammar}
                              </p>
                            )}

                            {explanation.structure && explanation.structure.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                                  {t.howItIsBuilt}
                                </p>
                                <ol className="space-y-1">
                                  {explanation.structure.map((s, i) => (
                                    <li key={i} className="flex gap-2 text-xs">
                                      <span className="font-medium text-slate-900 min-w-0">
                                        {s.part}
                                      </span>
                                      <span className="text-slate-400">— {s.role}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {explanation.examples && explanation.examples.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                  {t.moreExamples}
                                </p>
                                <ul className="space-y-0.5">
                                  {explanation.examples.map((e) => (
                                    <li key={e} className="text-xs text-slate-700">
                                      {e}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Actions. "Explain" is separate from clicking, because a
                    click is a lookup and this is a question. */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {!explanation && !explaining && (
                    <button
                      type="button"
                      onClick={onExplain}
                      className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5"
                    >
                      {t.explain}
                    </button>
                  )}
                  {explanation && canGoDeeper && (
                    <button
                      type="button"
                      onClick={onDeeper}
                      className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                    >
                      {t.whyWritten}
                    </button>
                  )}
                  {focus.kind === "word" && (
                    <button
                      type="button"
                      onClick={onSaveWord}
                      disabled={savedKeys.has(focus.token.replace(/[^\p{L}]/gu, "").toLowerCase())}
                      className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {savedKeys.has(focus.token.replace(/[^\p{L}]/gu, "").toLowerCase())
                        ? t.saved
                        : t.saveWord}
                    </button>
                  )}
                </div>

                {/* Ask anything. This is the escape hatch for the question
                    nobody anticipated. */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!question.trim()) return;
                    onAsk(question.trim());
                    setQuestion("");
                  }}
                  className="pt-2 border-t border-slate-100"
                >
                  <label className="block text-xs text-slate-400 mb-1">{t.askLabel}</label>
                  <div className="flex gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t.askPlaceholder}
                      className="flex-1 min-w-0 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                    >
                      {t.ask}
                    </button>
                  </div>
                </form>

                {grammarLinks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      {t.grammarInThisText}
                    </p>
                    <div className="space-y-1">
                      {grammarLinks.map((g) =>
                        g.href ? (
                          <Link
                            key={g.code}
                            href={g.href}
                            className="block text-xs text-slate-600 hover:underline"
                          >
                            {g.name} →
                          </Link>
                        ) : (
                          <span key={g.code} className="block text-xs text-slate-500">
                            {g.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "vocabulary" && (
          <>
            {phrases.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  {t.phrasesInThisText}
                </p>
                <p className="text-xs text-slate-500 mb-2">{t.phrasesNote}</p>
                <ul className="space-y-2">
                  {phrases.map((p) => (
                    <li key={p.lemma} className="rounded-lg border border-slate-200 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{p.lemma}</p>
                          <p className="text-xs text-slate-600">{p.english}</p>
                          {p.note && <p className="mt-1 text-xs text-slate-400">{p.note}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onSavePhrase(p)}
                          disabled={savedKeys.has(p.lemma.toLowerCase())}
                          className="text-xs rounded border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                        >
                          {savedKeys.has(p.lemma.toLowerCase()) ? t.saved : t.save}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                {t.yourWords}
              </p>
              {words.length === 0 ? (
                <p className="text-xs text-slate-400">{t.noWordsYet}</p>
              ) : (
                <ul className="space-y-2">
                  {words.map((w) => (
                    <li key={w.id} className="rounded-lg border border-slate-200 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              w.learned ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {w.danish}
                          </p>
                          <p className="text-xs text-slate-600">{w.translation}</p>
                          {w.note && <p className="mt-1 text-xs text-blue-800">{w.note}</p>}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <button
                            type="button"
                            onClick={() => onToggleLearned(w.id, !w.learned)}
                            className="text-xs text-slate-500 hover:underline whitespace-nowrap"
                          >
                            {w.learned ? t.notLearned : t.markLearned}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteWord(w.id)}
                            className="text-xs text-slate-400 hover:text-red-600"
                          >
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "notes" && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noteDraft.trim()) return;
                onAddNote(noteDraft.trim());
                setNoteDraft("");
              }}
              className="space-y-2"
            >
              {focus && (
                <p className="text-xs text-slate-400">
                  {t.noteAbout}:{" "}
                  <span className="text-slate-700">
                    {focus.kind === "word"
                      ? focus.token
                      : focus.kind === "sentence"
                        ? focus.sentence.danish
                        : t.paragraphLabel}
                  </span>
                </p>
              )}
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder={t.notePlaceholder}
                className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs"
              />
              <button
                type="submit"
                className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5"
              >
                {t.addNote}
              </button>
            </form>

            {notes.length === 0 ? (
              <p className="text-xs text-slate-400">{t.noNotesYet}</p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-200 p-2.5">
                    {n.quote && (
                      <p className="text-xs text-slate-400 italic mb-1">&ldquo;{n.quote}&rdquo;</p>
                    )}
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.body}</p>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(n.id)}
                      className="mt-1 text-xs text-slate-400 hover:text-red-600"
                    >
                      {t.remove}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};
