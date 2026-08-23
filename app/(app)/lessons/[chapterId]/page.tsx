import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { CHAPTER_BY_ID, LESSON_BY_SLUG } from "@/lib/curriculum/course";
import { loadLessonProgress } from "@/lib/curriculum/lesson-progress";
import { lessonInProgress, lessonPassed } from "@/lib/curriculum/progress";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = CHAPTER_BY_ID.get(chapterId);
  if (!chapter) notFound();

  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.course;
  const progress = await loadLessonProgress(session!.user.id);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href="/lessons" className="text-sm text-slate-500 hover:underline">
        {dict.lessons.backToLessons}
      </Link>

      <header>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {t.chapterLabel(chapter.number)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{chapter.title}</h1>
        <p className="text-sm text-slate-400">{chapter.danishTitle}</p>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{chapter.intro}</p>
      </header>

      {/* The spiral made visible: what this chapter picks up again. */}
      {chapter.revisits && chapter.revisits.length > 0 && (
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t.revisits}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chapter.revisits.map((id) => {
              const c = CHAPTER_BY_ID.get(id);
              if (!c) return null;
              return (
                <Link
                  key={id}
                  href={`/lessons/${id}`}
                  className="text-xs rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                >
                  {t.chapterLabel(c.number)} · {c.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ol className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {chapter.topics.map((topic, i) => {
          const lesson = LESSON_BY_SLUG.get(topic.lessonSlug);
          const result = progress[topic.lessonSlug];
          const done = lessonPassed(result);
          const started = lessonInProgress(result);
          return (
            <li key={topic.id}>
              <Link
                href={`/lessons/${chapter.id}/${topic.lessonSlug}`}
                className="block p-5 hover:bg-slate-50"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className="font-medium">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    {topic.title}
                  </p>
                  {done ? (
                    <span className="text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1">
                      {t.statusComplete}
                    </span>
                  ) : started ? (
                    <span className="text-xs font-medium rounded-full bg-blue-100 text-blue-800 px-2.5 py-1">
                      {t.statusInProgress}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{topic.canDo}</p>
                {lesson?.exercises && (
                  <p className="mt-1 text-xs text-slate-400">
                    {lesson.exercises.length} {t.practice.toLowerCase()}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      {/* The bridge to Class: same grammar, but now you have to use it. */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-slate-600">{dict.class2.vsLessons}</p>
        <Link
          href="/class"
          className="text-xs font-medium rounded-md border border-slate-300 bg-white px-3 py-1.5 whitespace-nowrap"
        >
          {dict.lessons.practiseThis}
        </Link>
      </div>
    </div>
  );
}
