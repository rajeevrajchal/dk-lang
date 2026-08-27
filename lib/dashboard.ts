import { progress as progressRepo } from "@/lib/repositories";
import { getConstructStats, getWeakestConstruct, determineCurrentTier } from "@/lib/adaptive/engine";
import { getModuleDashboardState, pickCurrentModuleId } from "@/lib/unlock";
import { SKILLS } from "@/lib/constants";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { CHAPTER_BY_ID, LESSON_BY_SLUG } from "@/lib/curriculum/course";
import { loadLessonProgress } from "@/lib/curriculum/lesson-progress";
import { courseProgress, resumePoint } from "@/lib/curriculum/progress";
import { getUserLevel, levelLabel } from "@/lib/level";
import { getMockHistory, getPracticeActivity, getReadingHabit, getRecentActivity } from "@/lib/activity";
import type {
  ActivityEntry,
  ContinueCard,
  DashboardData,
  Dictionary,
  LearnerOverview,
  Skill,
  SkillStatus,
} from "@/types";

// Only Modul 2 reading has a generated item bank today; every other
// skill/module combination is schema-ready but content is future work (see
// docs/module-map.md).
const CONTENT_READY: { moduleId: number; skill: Skill }[] = [{ moduleId: 2, skill: "READING" }];

export const hasContent = (moduleId: number, skill: Skill) => {
  return CONTENT_READY.some((c) => c.moduleId === moduleId && c.skill === skill);
};

const getVerifiedReportCards = async (userId: string) => {
  return progressRepo.listReportCards(userId, "CONFIRMED");
};

export const getSkillStatusesForModule = async (
  userId: string,
  moduleId: number,
  dict: Dictionary
): Promise<SkillStatus[]> => {
  return Promise.all(
    SKILLS.map(async (skill): Promise<SkillStatus> => {
      const ready = hasContent(moduleId, skill);
      if (!ready) {
        return {
          skill,
          label: dict.enums.skills[skill],
          hasContent: false,
          accuracy: null,
          attemptCount: 0,
          currentTier: null,
          weakestConstruct: null,
        };
      }

      const stats = await getConstructStats(userId, skill, moduleId);
      const attempted = stats.filter((s) => s.totalCount > 0);
      const totalCorrect = attempted.reduce((sum, s) => sum + s.correctCount, 0);
      const totalCount = attempted.reduce((sum, s) => sum + s.totalCount, 0);

      const weakest = await getWeakestConstruct(userId, skill, moduleId);
      const { tier } = await determineCurrentTier(userId, moduleId, skill);

      return {
        skill,
        label: dict.enums.skills[skill],
        hasContent: true,
        accuracy: totalCount > 0 ? totalCorrect / totalCount : null,
        attemptCount: totalCount,
        currentTier: tier,
        weakestConstruct: weakest
          ? { name: weakest.name, accuracy: weakest.accuracy ?? 0 }
          : null,
      };
    })
  );
};

export const getDashboardData = async (userId: string, dict: Dictionary): Promise<DashboardData> => {
  const moduleStates = await getModuleDashboardState(userId);
  const currentModuleId = pickCurrentModuleId(moduleStates);

  const skillStatuses = await getSkillStatusesForModule(userId, currentModuleId, dict);

  const recentAttempts = await progressRepo.recentAttempts(userId, 10);

  const readingStatus = skillStatuses.find((s) => s.skill === "READING");
  let nextAction: DashboardData["nextAction"];
  if (readingStatus?.hasContent) {
    if (readingStatus.weakestConstruct && readingStatus.weakestConstruct.accuracy < 0.6) {
      nextAction = {
        label: dict.dashboard.nextAction.focusOn(
          readingStatus.weakestConstruct.name,
          Math.round(readingStatus.weakestConstruct.accuracy * 100)
        ),
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if (readingStatus.attemptCount < 8) {
      nextAction = {
        label: dict.dashboard.nextAction.establishBaseline,
        href: `/practice/reading/${currentModuleId}`,
      };
    } else if ((readingStatus.currentTier ?? 1) >= 3 && (readingStatus.accuracy ?? 0) >= 0.75) {
      nextAction = {
        label: dict.dashboard.nextAction.readyForMockTest(currentModuleId),
        href: `/exam/reading/${currentModuleId}`,
      };
    } else {
      nextAction = {
        label: dict.dashboard.nextAction.continueTier(readingStatus.currentTier ?? 1),
        href: `/practice/reading/${currentModuleId}`,
      };
    }
  } else {
    nextAction = {
      label: dict.dashboard.nextAction.continueModul2,
      href: `/practice/reading/2`,
    };
  }

  return {
    currentModuleId,
    moduleStates,
    skillStatuses,
    recentActivity: recentAttempts.map((a) => ({
      id: a.id,
      // PostgREST returns timestamps as ISO strings.
      createdAt: new Date(a.createdAt),
      isCorrect: a.isCorrect,
      skill: a.item.skill,
      moduleId: a.item.moduleId,
      tierId: a.item.tierId,
      examSessionId: a.examSessionId,
    })),
    nextAction,
    verifiedReportCards: await getVerifiedReportCards(userId),
  };
};

export { MODULE_BY_ID };

// ---------------------------------------------------------------------------
// The learner overview — what the restructured Dashboard renders.
//
// Composed from the area-specific modules rather than querying afresh: lesson
// progress from lib/curriculum, activity from lib/activity, level from
// lib/level. The Dashboard reports; it does not own any of these facts.
// ---------------------------------------------------------------------------

export const getLearnerOverview = async (userId: string): Promise<LearnerOverview> => {
  const [level, progress, readingHabit, practice, mock, recent] = await Promise.all([
    getUserLevel(userId),
    loadLessonProgress(userId),
    getReadingHabit(userId),
    getPracticeActivity(userId),
    getMockHistory(userId),
    getRecentActivity(userId),
  ]);

  const course = courseProgress(progress);
  const resume = resumePoint(progress);
  const resumeDetail = resume
    ? {
        ...resume,
        lessonTitle: LESSON_BY_SLUG.get(resume.lessonSlug)?.title ?? resume.lessonSlug,
        chapterTitle: resume.chapter.title,
      }
    : null;

  // What to put in front of the learner. Order of preference: finish setting
  // up, then carry on with the lesson they left, then whichever practice they
  // touched most recently, then start the course.
  let continueCard: ContinueCard;
  const lastPractice = [...practice]
    .filter((p) => p.lastAt)
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0))[0];

  if (level.unset) {
    continueCard = { kind: "onboarding", title: "", href: "/onboarding" };
  } else if (resumeDetail && resumeDetail.resumed) {
    continueCard = {
      kind: "lesson",
      title: resumeDetail.lessonTitle,
      detail: resumeDetail.chapterTitle,
      href: `/lessons/${resumeDetail.chapter.id}/${resumeDetail.lessonSlug}`,
    };
  } else if (lastPractice) {
    // Points at the category landing page, not a module-scoped URL: the
    // learner's module comes from their profile wherever it is used, and no
    // route in Class takes it as a path segment any more (see
    // docs/task-architecture.md). "Continue" reopens the category they were
    // last in; which practice type and task within it follows the same
    // not-started → in-progress → completed rule every task list uses.
    continueCard = {
      kind: "practice",
      title: "",
      category: lastPractice.category,
      href: `/class/${lastPractice.category.toLowerCase()}`,
    };
  } else if (resumeDetail) {
    continueCard = {
      kind: "lesson",
      title: resumeDetail.lessonTitle,
      detail: resumeDetail.chapterTitle,
      href: `/lessons/${resumeDetail.chapter.id}/${resumeDetail.lessonSlug}`,
    };
  } else {
    continueCard = { kind: "lesson", title: "", href: "/lessons" };
  }

  return {
    level,
    levelLabel: levelLabel(level),
    lessons: {
      completed: course.completed,
      total: course.total,
      ratio: course.ratio,
      chaptersComplete: course.chaptersComplete,
      chaptersTotal: course.chaptersTotal,
      currentChapterTitle: course.currentChapter
        ? `${course.currentChapter.number}. ${course.currentChapter.title}`
        : null,
      resume: resumeDetail,
    },
    readingHabit,
    practice,
    mock,
    recent,
    continueCard,
  };
};

/** Human label for one recent-activity row. Kept out of the page's JSX. */
export const describeActivity = (entry: ActivityEntry, dict: Dictionary): string => {
  switch (entry.kind) {
    case "lesson": {
      const lesson = entry.lessonSlug ? LESSON_BY_SLUG.get(entry.lessonSlug) : undefined;
      const chapter = entry.chapterId ? CHAPTER_BY_ID.get(entry.chapterId) : undefined;
      const title = lesson?.title ?? entry.lessonSlug ?? "";
      return chapter ? `${chapter.title} · ${title}` : title;
    }
    case "practice":
      return `${dict.exercises.categories[entry.category ?? ""] ?? entry.category} · Modul ${entry.moduleId}`;
    case "mock":
      return `${dict.mock.mockLabel} · Modul ${entry.moduleId}`;
  }
};
