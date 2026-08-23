import Link from "next/link";
import { notFound } from "next/navigation";
import { CHAPTER_BY_ID, LESSON_BY_SLUG } from "@/lib/curriculum/course";
import { lessonKind } from "@/lib/content-gen/theory";
import { LessonExercises } from "@/components/course/LessonExercises";
import { LessonVisit } from "@/components/lessons/LessonVisit";
import { InteractiveText } from "@/components/reading/InteractiveText";
import { WritingModelPanel } from "@/components/writing/WritingModelPanel";
import { getServerDictionary } from "@/lib/i18n/server";

// A course lesson.
//
// Deliberately renders the same TheoryLesson the older /theory/[slug] route
// renders — the teaching content is one thing, shown in two places. What this
// page adds around it is the course scaffolding: what you will learn, what you
// should know afterwards, and the exercises.
//
// Opening the page records a visit (LessonVisit), which is what lets the
// learner leave and be brought back here later.

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ chapterId: string; lessonSlug: string }>;
}) {
  const { chapterId, lessonSlug } = await params;
  const chapter = CHAPTER_BY_ID.get(chapterId);
  const lesson = LESSON_BY_SLUG.get(lessonSlug);
  if (!chapter || !lesson) notFound();

  const dict = await getServerDictionary();
  const t = dict.course;
  const topic = chapter.topics.find((x) => x.lessonSlug === lessonSlug);
  const kind = lessonKind(lesson);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <LessonVisit lessonSlug={lesson.slug} chapterId={chapter.id} />

      <Link href={`/lessons/${chapter.id}`} className="text-sm text-slate-500 hover:underline">
        {t.backToChapter}
      </Link>

      <header>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {t.chapterLabel(chapter.number)} · {chapter.title}
        </p>
        <div className="mt-1 flex items-baseline gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          {kind !== "grammar" && (
            <span className="text-xs font-medium rounded-full bg-slate-900 text-white px-2.5 py-1">
              {dict.course.lessonKinds[kind]}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400">{lesson.danishName}</p>
      </header>

      {/* Stated up front: the learner should always know what they are here for. */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.whatYouWillLearn}
          </h2>
          <ul className="mt-2 space-y-1">
            {lesson.learningObjectives.map((o) => (
              <li key={o} className="text-sm text-slate-700 flex gap-2">
                <span aria-hidden className="text-slate-400">
                  ·
                </span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The plain-language opening, for a reader who does not yet know the
          grammar words. Only the foundation lessons carry one. */}
      {lesson.primer && (
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
            {t.beforeYouStart}
          </h2>
          <p className="mt-2 text-sm text-blue-900 leading-relaxed">{lesson.primer}</p>
        </section>
      )}

      <p className="text-slate-600">{lesson.summary}</p>

      {lesson.sections.map((section, i) => (
        <section key={i} className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">{section.heading}</h2>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{section.body}</p>

          {section.table && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    {section.table.headers.map((h) => (
                      <th
                        key={h}
                        className="text-left font-medium text-slate-500 py-2 pr-4 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-100 last:border-0">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`py-2 pr-4 align-top ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.examples && section.examples.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {dict.theory.examples}
              </p>
              {section.examples.map((ex, ei) => (
                <div key={ei} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{ex.danish}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{ex.english}</p>
                  {ex.note && <p className="mt-1 text-xs text-blue-700">{ex.note}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {lesson.pitfalls.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">{dict.theory.watchOut}</h2>
          <ul className="mt-3 space-y-2">
            {lesson.pitfalls.map((p) => (
              <li key={p} className="text-sm text-amber-900 flex gap-2">
                <span aria-hidden>·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The Danish itself. A reading lesson IS this; a grammar lesson uses it
          to show the rule working in a real text an hour after teaching it. */}
      {lesson.texts?.map((text) => (
        <section key={text.id} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {dict.reading.title}
            </h2>
            <span className="text-xs text-slate-400">
              {dict.reading.textGenres[text.genre] ?? text.genre}
            </span>
          </div>
          <InteractiveText text={text} />
        </section>
      ))}

      {/* For a writing lesson: the worked example, taken apart, before any
          writing is asked for. */}
      {lesson.writingModel && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            {dict.writing.title}
          </h2>
          <WritingModelPanel model={lesson.writingModel} />
        </section>
      )}

      {lesson.exercises && lesson.exercises.length > 0 ? (
        <LessonExercises lessonSlug={lesson.slug} exercises={lesson.exercises} />
      ) : (
        <MarkDoneOnly lessonSlug={lesson.slug} label={t.noExercisesYet} />
      )}

      {(lesson.canDo || topic?.canDo) && (
        <section className="rounded-xl border-2 border-slate-900 bg-white p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.whatYouShouldKnow}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-900">{lesson.canDo ?? topic?.canDo}</p>
        </section>
      )}
    </div>
  );
}

/** For lessons that have no exercises yet — reading it through still counts. */
function MarkDoneOnly({ lessonSlug, label }: { lessonSlug: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <LessonExercises lessonSlug={lessonSlug} exercises={[]} />
    </div>
  );
}
