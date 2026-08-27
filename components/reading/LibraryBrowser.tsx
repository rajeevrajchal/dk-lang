"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { LibraryEntryState, ReadingSummary, ReadingTopic } from "@/types";

// Browsing what there is to read.
//
// Filters are the whole point of a library: a learner who cannot find a text
// they can cope with will read nothing. Level and length matter most, so they
// come first — "can I manage this, and have I got time for it" is the question
// people actually ask. Recommendations sit above the list rather than
// replacing it, because a library that only shows three things is not one.

export const LibraryBrowser = ({
  texts,
  recommended,
  states,
  interests,
  topics,
  genres,
}: {
  texts: ReadingSummary[];
  recommended: ReadingSummary[];
  states: Record<string, LibraryEntryState>;
  interests: ReadingTopic[];
  topics: string[];
  genres: string[];
}) => {
  const { dict } = useI18n();
  const t = dict.reading;

  const [level, setLevel] = useState<number | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [length, setLength] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return texts.filter((x) => {
      if (level && x.level !== level) return false;
      if (genre && x.genre !== genre) return false;
      if (topic && !x.topics.includes(topic as ReadingTopic)) return false;
      if (length && x.length !== length) return false;
      if (status === "completed" && !states[x.id]?.completed) return false;
      if (status === "unread" && states[x.id]?.completed) return false;
      if (status === "saved" && !states[x.id]?.bookmarked) return false;
      if (q && !`${x.title} ${x.danishTitle} ${x.blurb}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [texts, level, genre, topic, length, status, search, states]);

  const anyFilter = level || genre || topic || length || status || search;

  return (
    <div className="space-y-6">
      {recommended.length > 0 && !anyFilter && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {t.recommended}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">{t.recommendedNote}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommended.map((x) => (
              <TextCard key={x.id} text={x} state={states[x.id]} compact />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <Select value={level} onChange={(v) => setLevel(v ? Number(v) : null)} label={t.allLevels}
            options={[...new Set(texts.map((x) => x.level))].sort().map((l) => ({
              value: String(l),
              label: `${t.levelLabel(l)} · ${texts.find((x) => x.level === l)?.cefr ?? ""}`,
            }))}
          />
          <Select value={genre} onChange={setGenre} label={t.allTypes}
            options={genres.map((g) => ({ value: g, label: t.textGenres[g] ?? g }))}
          />
          <Select value={topic} onChange={setTopic} label={t.allTopics}
            options={topics.map((x) => ({ value: x, label: t.topics[x] ?? x }))}
          />
          <Select value={length} onChange={setLength} label={t.anyLength}
            options={[
              { value: "short", label: t.lengthShort },
              { value: "medium", label: t.lengthMedium },
              { value: "long", label: t.lengthLong },
            ]}
          />
          <Select value={status} onChange={setStatus} label={t.statusAll}
            options={[
              { value: "unread", label: t.statusUnread },
              { value: "completed", label: t.statusCompleted },
              { value: "saved", label: t.statusSaved },
            ]}
          />
          {anyFilter && (
            <button
              type="button"
              onClick={() => {
                setLevel(null);
                setGenre(null);
                setTopic(null);
                setLength(null);
                setStatus(null);
                setSearch("");
              }}
              className="text-xs text-slate-500 hover:underline px-2"
            >
              {t.clearFilters}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400">{t.textsCount(filtered.length)}</p>
      </section>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          {t.nothingMatches}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((x) => (
            <TextCard key={x.id} text={x} state={states[x.id]} />
          ))}
        </div>
      )}

      {interests.length === 0 && (
        <p className="text-xs text-slate-400">
          <Link href="/settings" className="hover:underline">
            {t.yourInterests} →
          </Link>
        </p>
      )}
    </div>
  );
};

const Select = ({
  value,
  onChange,
  label,
  options,
}: {
  value: string | number | null;
  onChange: (v: string | null) => void;
  label: string;
  options: { value: string; label: string }[];
}) => {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={`rounded-md border px-2.5 py-1.5 text-xs ${
        value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"
      }`}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-slate-900 bg-white">
          {o.label}
        </option>
      ))}
    </select>
  );
};

const TextCard = ({
  text,
  state,
  compact,
}: {
  text: ReadingSummary;
  state?: LibraryEntryState;
  compact?: boolean;
}) => {
  const { dict } = useI18n();
  const t = dict.reading;

  return (
    <Link
      href={`/class/reading/library/${text.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50 transition"
    >
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="font-medium text-slate-900">{text.danishTitle}</p>
        <div className="flex items-center gap-1.5">
          {state?.bookmarked && (
            <span className="text-xs text-slate-400" title={t.bookmarked}>
              ★
            </span>
          )}
          {state?.completed && (
            <span className="text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
              {t.completedBadge}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400">{text.title}</p>

      {!compact && <p className="mt-2 text-sm text-slate-600">{text.blurb}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
        <span className="font-medium text-slate-600">{text.cefr}</span>
        <span>·</span>
        <span>{t.textGenres[text.genre] ?? text.genre}</span>
        <span>·</span>
        <span>{t.minutesLabel(text.minutes)}</span>
        {text.courseLessonSlug && (
          <>
            <span>·</span>
            <span>{t.fromCourse}</span>
          </>
        )}
      </div>
    </Link>
  );
};
