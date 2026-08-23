import { auth } from "@/lib/auth";
import { DANISH_COURSE } from "@/lib/curriculum/course";
import { loadLessonProgress } from "@/lib/curriculum/lesson-progress";
import {
  chapterStatus,
  courseProgress,
  lessonPassed,
  resumePoint,
} from "@/lib/curriculum/progress";
import { getServerDictionary } from "@/lib/i18n/server";
import { LessonSidebar, type SidebarChapter } from "@/components/lessons/LessonSidebar";

// The Lessons area wraps every lesson page in the course sidebar, so the
// learner can always see the shape of the course and where they are in it.
// The state is computed here, once, from the same pure functions the pages use.

export default async function LessonsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const dict = await getServerDictionary();
  const progress = await loadLessonProgress(session!.user.id);

  const chapters: SidebarChapter[] = DANISH_COURSE.chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    status: chapterStatus(chapter, progress),
    topics: chapter.topics.map((topic) => ({
      title: topic.title,
      lessonSlug: topic.lessonSlug,
      done: lessonPassed(progress[topic.lessonSlug]),
      started: !!progress[topic.lessonSlug],
    })),
  }));

  const course = courseProgress(progress);
  const resume = resumePoint(progress);

  return (
    <div className="flex flex-1 min-h-full">
      <LessonSidebar
        chapters={chapters}
        completed={course.completed}
        total={course.total}
        resumeHref={resume ? `/lessons/${resume.chapter.id}/${resume.lessonSlug}` : null}
        resumeLabel={resume?.resumed ? dict.lessons.resume : dict.lessons.resumeNew}
      />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
