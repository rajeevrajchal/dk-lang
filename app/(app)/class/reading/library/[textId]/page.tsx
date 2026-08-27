import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";
import { readingText } from "@/lib/reading/registry";
import { allSentences } from "@/lib/learning/text";
import { CONSTRUCTS } from "@/lib/content-gen/constructs";
import { THEORY_BY_CONSTRUCT } from "@/lib/content-gen/theory";
import { chapterForLesson } from "@/lib/curriculum/course";
import { TextReader } from "@/components/reading/TextReader";

// One text, opened.
//
// Everything the reader needs is resolved here on the server: the grammar this
// text demonstrates (from the construct codes its sentences already carry),
// where that grammar is taught, and whether the learner has read it before.
// The client component then does nothing but read and record.

const ReadingTextPage = async ({
  params,
}: {
  params: Promise<{ textId: string }>;
}) => {
  const { textId } = await params;
  const entry = readingText(textId);
  if (!entry) notFound();

  const session = await auth();
  const progress = await reading.findProgress(session!.user.id, textId);

  // Grammar noticed in this text, from the codes the sentences carry — no
  // analysis, no model call, just what the content already says. Each links to
  // the lesson that teaches it, so "review this" is one click.
  const codes = [
    ...new Set([
      ...allSentences(entry.text).flatMap((s) => s.constructCodes ?? []),
      ...(entry.text.focusConstructs ?? []),
    ]),
  ];

  const grammarLinks = codes.map((code) => {
    const lesson = THEORY_BY_CONSTRUCT.get(code);
    const chapter = lesson ? chapterForLesson(lesson.slug) : undefined;
    return {
      code,
      name: CONSTRUCTS.find((c) => c.code === code)?.name ?? code,
      href: lesson && chapter ? `/lessons/${chapter.id}/${lesson.slug}` : null,
    };
  });

  const courseChapter = entry.courseLessonSlug
    ? chapterForLesson(entry.courseLessonSlug)
    : undefined;

  return (
    <TextReader
      textId={entry.id}
      text={entry.text}
      phrases={entry.phrases ?? []}
      grammarLinks={grammarLinks}
      courseHref={
        courseChapter && entry.courseLessonSlug
          ? `/lessons/${courseChapter.id}/${entry.courseLessonSlug}`
          : null
      }
      courseChapterName={
        courseChapter ? `${courseChapter.number}. ${courseChapter.title}` : null
      }
      initialCompleted={progress?.status === "COMPLETED"}
      initialBookmarked={progress?.bookmarked ?? false}
    />
  );
};

export default ReadingTextPage;
