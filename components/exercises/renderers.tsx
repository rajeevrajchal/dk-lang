"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type {
  ExerciseResponse,
  PublicExerciseContent,
  ReadingTask1Content,
  ReadingTask3Content,
  SpeakingContent,
  WritingContent,
} from "@/lib/exercises/types";
import { countWords } from "@/lib/exercises/grading";

export interface RendererProps {
  content: PublicExerciseContent;
  response: ExerciseResponse;
  setResponse: (next: ExerciseResponse) => void;
  disabled: boolean;
  dict: Dictionary;
}

const cardCls = "rounded-lg border border-slate-200 bg-white p-4";

// ---------------------------------------------------------------------------
// Læsning Opgave 1 — match people to adverts
// ---------------------------------------------------------------------------
function Task1({ content, response, setResponse, disabled, dict }: RendererProps) {
  const c = content as Omit<ReadingTask1Content, "answers" | "rationales">;
  const t = dict.exercises;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {t.example} (0) — {c.example.adId}
        </p>
        <p className="mt-1 text-sm text-slate-700">{c.example.personText}</p>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {t.people}
        </h3>
        <div className="space-y-3">
          {c.people.map((p) => (
            <div key={p.id} className={cardCls}>
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-slate-900 shrink-0">{p.id}.</span>
                <p className="text-sm text-slate-700 leading-relaxed">{p.text}</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-slate-500">{t.chooseAd}:</label>
                <select
                  disabled={disabled}
                  value={response[p.id] ?? ""}
                  onChange={(e) => setResponse({ ...response, [p.id]: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
                >
                  <option value="">–</option>
                  {c.ads
                    .filter((a) => a.id !== c.example.adId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {t.ads}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.ads.map((a) => (
            <div
              key={a.id}
              className={`${cardCls} ${a.id === c.example.adId ? "bg-slate-50" : ""}`}
            >
              <div className="flex gap-2 items-baseline">
                <span className="text-sm font-bold text-slate-900">{a.id}</span>
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Læsning Opgave 2 — the sentence that does not belong
// ---------------------------------------------------------------------------
function Task2({ content, response, setResponse, disabled, dict }: RendererProps) {
  const c = content as Extract<PublicExerciseContent, { kind: "reading_task_2_wrong_sentence" }>;
  const t = dict.exercises;

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">{t.chooseSentenceHint}</p>

      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {t.example} (0)
        </p>
        <p className="text-sm leading-relaxed">
          {c.example.sentences.map((s, i) => (
            <span
              key={i}
              className={i === c.example.wrongIndex ? "line-through text-red-600" : "text-slate-700"}
            >
              {s}{" "}
            </span>
          ))}
        </p>
      </div>

      {c.sections.map((section) => (
        <div key={section.id} className={cardCls}>
          <p className="text-xs font-semibold text-slate-400 mb-2">({section.id})</p>
          <div className="space-y-1">
            {section.sentences.map((s, i) => {
              const selected = response[section.id] === String(i);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => setResponse({ ...response, [section.id]: String(i) })}
                  className={`block w-full text-left text-sm leading-relaxed rounded px-2 py-1 transition ${
                    selected
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  } disabled:opacity-70`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Læsning Opgave 3 — missing words from a word bank
// ---------------------------------------------------------------------------
function Task3({ content, response, setResponse, disabled, dict }: RendererProps) {
  const c = content as Omit<ReadingTask3Content, "answers" | "rationales">;
  const t = dict.exercises;

  // Each bank word may be used once. A word already placed in another blank is
  // hidden from the remaining dropdowns, which is the paper test's "cross it
  // off the list" behaviour.
  const usedElsewhere = (blankIndex: number) =>
    new Set(
      Object.entries(response)
        .filter(([k, v]) => k !== String(blankIndex) && v)
        .map(([, v]) => v)
    );

  const blankCount = c.textSegments.length - 1;

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.example}</p>
        <p className="mt-1 text-sm text-slate-700">
          {c.exampleSentence.split("___")[0]}
          <span className="font-semibold underline underline-offset-2">{c.exampleWord}</span>
          {c.exampleSentence.split("___")[1] ?? ""}
        </p>
      </div>

      <div className={cardCls}>
        <p className="text-sm leading-loose text-slate-800">
          {c.textSegments.map((seg, i) => (
            <span key={i}>
              {seg}
              {i < blankCount && (
                <select
                  disabled={disabled}
                  value={response[String(i)] ?? ""}
                  onChange={(e) => setResponse({ ...response, [String(i)]: e.target.value })}
                  className="mx-1 rounded-md border border-slate-400 bg-white px-2 py-0.5 text-sm font-medium disabled:opacity-60"
                  aria-label={t.blankLabel(i + 1)}
                >
                  <option value="">— {i + 1} —</option>
                  {c.wordBank
                    .filter((w) => !usedElsewhere(i).has(w))
                    .map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                </select>
              )}
            </span>
          ))}
        </p>
      </div>

      <div className="rounded-lg border-2 border-slate-300 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
          {t.wordBank}
        </p>
        <p className="text-xs text-slate-500 mb-3">{t.wordBankNote}</p>
        <div className="flex flex-wrap gap-2">
          {c.wordBank.map((w) => {
            const used = Object.values(response).includes(w) || w === c.exampleWord;
            return (
              <span
                key={w}
                className={`text-sm px-2.5 py-1 rounded-md ${
                  used ? "text-slate-400 line-through" : "bg-slate-100 text-slate-800"
                }`}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Læsning Opgave 4 — which of the three people
// ---------------------------------------------------------------------------
function Task4({ content, response, setResponse, disabled }: RendererProps) {
  const c = content as Extract<PublicExerciseContent, { kind: "reading_task_4_people_matching" }>;

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-center">{c.heading}</h3>

      <div className="space-y-3">
        {c.people.map((p) => (
          <div key={p.id} className={cardCls}>
            <p className="text-sm font-semibold text-slate-900">
              {p.id}. {p.name}
            </p>
            <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 pr-4 font-medium text-slate-500"></th>
              {c.people.map((p) => (
                <th key={p.id} className="py-2 px-2 font-medium text-slate-700 text-center">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-slate-50">
              <td className="py-2.5 pr-4 text-slate-500">0. {c.example.question}</td>
              {c.people.map((p) => (
                <td key={p.id} className="py-2.5 px-2 text-center">
                  {p.id === c.example.personId ? (
                    <span className="font-bold text-slate-900">X</span>
                  ) : (
                    <span className="text-slate-300">–</span>
                  )}
                </td>
              ))}
            </tr>
            {c.questions.map((q, qi) => (
              <tr key={q.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-4 text-slate-800">
                  {qi + 1}. {q.question}
                </td>
                {c.people.map((p) => (
                  <td key={p.id} className="py-2.5 px-2 text-center">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={disabled}
                      checked={response[q.id] === p.id}
                      onChange={() => setResponse({ ...response, [q.id]: p.id })}
                      className="h-4 w-4 accent-slate-900"
                      aria-label={`${q.question} — ${p.name}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skrivning
// ---------------------------------------------------------------------------
function Writing({ content, response, setResponse, disabled, dict }: RendererProps) {
  const c = content as WritingContent;
  const t = dict.exercises;
  const text = response.text ?? "";
  const words = countWords(text);

  return (
    <div className="space-y-5">
      <div className={cardCls}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.situation}</p>
        <p className="mt-1 text-sm text-slate-700">{c.situation}</p>
        <p className="mt-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.task}</p>
        <p className="mt-1 text-sm text-slate-700">{c.task}</p>
      </div>

      {c.incomingEmail && (
        <div className="rounded-lg border-2 border-slate-300 p-4">
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {c.incomingEmail.body}
          </p>
          <ul className="mt-3 space-y-1">
            {c.incomingEmail.questions.map((q) => (
              <li key={q} className="text-sm font-medium text-slate-900 underline underline-offset-2">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border-2 border-slate-300 p-4">
        {c.answerHeader && (
          <div className="text-sm text-slate-500 mb-2 space-y-0.5">
            {c.answerHeader.to && <p>Til: {c.answerHeader.to}</p>}
            {c.answerHeader.subject && <p>Emne: {c.answerHeader.subject}</p>}
          </div>
        )}
        <textarea
          disabled={disabled}
          value={text}
          onChange={(e) => setResponse({ ...response, text: e.target.value })}
          placeholder={t.writingPlaceholder}
          rows={12}
          className="w-full rounded-md border border-slate-200 p-3 text-sm leading-relaxed disabled:opacity-70"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={words < c.minWords ? "text-amber-700" : "text-emerald-700"}>
            {t.wordCount(words)}
          </span>
          <span className="text-slate-400">{t.minWordsNote(c.minWords)}</span>
        </div>
      </div>

      <div className={cardCls}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {t.mustInclude}
        </p>
        <ul className="space-y-1.5">
          {c.mustInclude.map((m) => (
            <li key={m} className="text-sm text-slate-700 flex gap-2">
              <span aria-hidden>·</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tale
// ---------------------------------------------------------------------------
function Speaking({ content, dict }: RendererProps) {
  const c = content as SpeakingContent;
  const t = dict.exercises;

  return (
    <div className="space-y-5">
      {/* Only true for the original prompts. A staged opgave runs a typed
          conversation, so this line would contradict the UI below it. */}
      {!c.stages && <p className="text-sm text-slate-500">{t.speakingIntro}</p>}

      {/* Everything in this block is optional. An exercise from before the
          modultest task patterns existed has none of these fields and renders
          exactly as it always did, starting at the situation card below. */}

      {c.stages && c.stages.length > 1 && (
        <ol className="flex flex-wrap gap-2">
          {c.stages.map((s, i) => (
            <li
              key={s.type}
              className="flex-1 min-w-[45%] rounded-lg border border-slate-200 bg-white p-3"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {t.stageLabel(i + 1)} ·{" "}
                {s.role === "examiner"
                  ? t.roleExaminer
                  : s.role === "partner"
                    ? t.rolePartner
                    : t.roleSolo}
                {s.approxMinutes ? ` · ${t.approxMinutes(s.approxMinutes)}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-700">{s.instruction}</p>
            </li>
          ))}
        </ol>
      )}

      {/* Opgave 1: the keywords are speaking support, laid out around the
          topic rather than as a numbered list, so it does not read as a
          checklist to be worked through. */}
      {c.mindmap && (
        <div className="rounded-xl border-2 border-slate-300 bg-white p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">{c.mindmap.title}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {c.mindmap.categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
              >
                {cat}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">{t.mindmapHint}</p>
        </div>
      )}

      {/* Opgave 2: only the candidate's side is shown. Showing the partner's
          card too would remove the gap and there would be nothing to ask. */}
      {c.informationGap && (
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.sharedContext}
            </p>
            <p className="mt-1 text-sm text-slate-700">{c.informationGap.sharedContext}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={cardCls}>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                {t.youKnow}
              </p>
              <ul className="mt-2 space-y-1.5">
                {c.informationGap.candidate.holds.map((i) => (
                  <li key={i.label} className="text-sm text-slate-700">
                    <span className="text-slate-400">{i.label}: </span>
                    {i.value}
                  </li>
                ))}
              </ul>
            </div>
            <div className={cardCls}>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                {t.youMustAsk}
              </p>
              <ul className="mt-2 space-y-1.5">
                {c.informationGap.candidate.mustFindOut.map((label) => (
                  <li key={label} className="text-sm text-slate-700">
                    · {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modul 3 Opgave 1: two topics offered, one drawn. */}
      {c.preparedTopics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.preparedTopics.map((topic, i) => (
            <div key={topic.title} className={cardCls}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {t.topicOption(i + 1)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{topic.title}</p>
              <ul className="mt-2 space-y-1">
                {topic.prompts.map((p) => (
                  <li key={p} className="text-sm text-slate-600">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Modul 3 Opgave 2: four options to compare. */}
      {c.preferenceOptions && (
        <div>
          {c.preferenceTopic && (
            <p className="mb-3 text-sm font-semibold text-slate-900">{c.preferenceTopic}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.preferenceOptions.map((o) => (
              <div key={o.id} className={cardCls}>
                <p className="text-sm font-semibold text-slate-900">
                  {o.id}. {o.label}
                </p>
                <p className="mt-1 text-sm text-slate-600">{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {c.situation && (
        <div className={cardCls}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.situation}
          </p>
          <p className="mt-1 text-sm text-slate-700">{c.situation}</p>
        </div>
      )}

      <div className={cardCls}>
        <ol className="space-y-3">
          {c.questions.map((q, i) => (
            <li key={q} className="flex gap-3">
              <span className="text-sm font-semibold text-slate-400 shrink-0">{i + 1}.</span>
              <span className="text-sm text-slate-800">{q}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={cardCls}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          {t.followUps}
        </p>
        <ul className="space-y-1.5">
          {c.followUps.map((f) => (
            <li key={f} className="text-sm text-slate-600 flex gap-2">
              <span aria-hidden>·</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
          {t.usefulPhrases}
        </p>
        <ul className="space-y-2">
          {c.usefulPhrases.map((p) => (
            <li key={p.danish}>
              <p className="text-sm font-medium text-blue-900">{p.danish}</p>
              <p className="text-xs text-blue-700">{p.english}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ExerciseBody(props: RendererProps) {
  switch (props.content.kind) {
    case "reading_task_1_matching":
      return <Task1 {...props} />;
    case "reading_task_2_wrong_sentence":
      return <Task2 {...props} />;
    case "reading_task_3_missing_words":
      return <Task3 {...props} />;
    case "reading_task_4_people_matching":
      return <Task4 {...props} />;
    case "writing":
      return <Writing {...props} />;
    case "speaking":
      return <Speaking {...props} />;
    default:
      return null;
  }
}

/** How many answers this exercise still expects, for the submit gate. */
export function expectedAnswerKeys(content: PublicExerciseContent): string[] {
  switch (content.kind) {
    case "reading_task_1_matching":
      return content.people.map((p) => p.id);
    case "reading_task_2_wrong_sentence":
      return content.sections.map((s) => s.id);
    case "reading_task_3_missing_words":
      return content.textSegments.slice(0, -1).map((_, i) => String(i));
    case "reading_task_4_people_matching":
      return content.questions.map((q) => q.id);
    case "writing":
      return ["text"];
    default:
      return [];
  }
}
