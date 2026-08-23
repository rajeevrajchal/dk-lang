import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { READING_LIBRARY } from "@/lib/reading/registry";
import { facetCounts, recommend, toSummary } from "@/lib/reading/library";
import { parseInterests } from "@/lib/reading/interests";
import { getUserLevel } from "@/lib/level";
import { loadLessonProgress } from "@/lib/curriculum/lesson-progress";
import { courseProgress } from "@/lib/curriculum/progress";
import { LibraryBrowser, type LibraryEntryState } from "@/components/reading/LibraryBrowser";
import { getServerDictionary } from "@/lib/i18n/server";
import type { ReadingLevel } from "@/lib/learning/text";

// The library.
//
// Everything is browsable; recommendations sit on top rather than replacing
// the list. The level used for recommending comes from how far through the
// grammar course the learner actually is, not from their official module —
// the two are different facts (see docs/product-architecture.md §7), and what
// you can read follows from what you have been taught.

export default async function ReadingLibraryPage() {
  const session = await auth();
  const userId = session!.user.id;
  const dict = await getServerDictionary();
  const t = dict.reading;

  const [progressRows, profile, level, lessons] = await Promise.all([
    prisma.readingProgress.findMany({ where: { userId } }),
    prisma.userProfile.findUnique({ where: { userId }, select: { interestsJson: true } }),
    getUserLevel(userId),
    loadLessonProgress(userId),
  ]);

  const states: Record<string, LibraryEntryState> = {};
  const completedIds = new Set<string>();
  for (const row of progressRows) {
    states[row.textId] = {
      completed: row.status === "COMPLETED",
      bookmarked: row.bookmarked,
    };
    if (row.status === "COMPLETED") completedIds.add(row.textId);
  }

  const interests = parseInterests(profile?.interestsJson);

  // How far through the course they are, mapped onto the 1-5 reading scale.
  // A learner three chapters in should be offered level 1-2, not level 4.
  const course = courseProgress(lessons);
  const chapterRatio = course.chaptersTotal ? course.chaptersComplete / course.chaptersTotal : 0;
  const readingLevel = Math.min(
    5,
    Math.max(1, Math.round(chapterRatio * 4) + 1)
  ) as ReadingLevel;

  const recommended = recommend(READING_LIBRARY, {
    interests,
    level: readingLevel,
    completedIds,
    limit: 3,
  });

  const facets = facetCounts(READING_LIBRARY);

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href="/class/reading" className="text-sm text-slate-500 hover:underline">
        {dict.class2.backToSkill}
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{t.libraryTitle}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.librarySubtitle}</p>
        {level.currentModule && (
          <p className="mt-1 text-xs text-slate-400">
            {dict.dashboard.yourLevel}: {level.education === "DU3" ? "PD3" : level.education} ·{" "}
            {dict.class2.moduleLabel(level.currentModule)}
          </p>
        )}
      </div>

      <LibraryBrowser
        texts={READING_LIBRARY.map(toSummary)}
        recommended={recommended.map(toSummary)}
        states={states}
        interests={interests}
        topics={Object.keys(facets.topics).sort()}
        genres={Object.keys(facets.genres)}
      />
    </div>
  );
}
