import Link from "next/link";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";
import { READING_LIBRARY } from "@/lib/reading/registry";
import { SkillModules } from "@/components/class/SkillModules";
import { getServerDictionary } from "@/lib/i18n/server";

// Class → Reading now has two halves, and they answer different questions.
//
// The library is extensive reading: read a lot of Danish you can nearly
// understand, look up what you cannot. The opgaver are the modultest formats
// against the clock. A learner needs both, and conflating them is how reading
// practice turns into exam practice by accident — so the choice is made
// explicit here rather than hidden in a tab.

export default async function ReadingPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.reading;

  const progress = await reading.listProgress(session!.user.id);
  const readCount = progress.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href="/class" className="text-sm text-slate-500 hover:underline">
        {dict.class2.backToClass}
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{dict.class2.skills.READING}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict.class2.skillDescriptions.READING}</p>
      </div>

      <Link
        href="/class/reading/library"
        className="block rounded-xl border-2 border-slate-900 bg-white p-6 hover:bg-slate-50"
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="font-medium">{t.libraryTitle}</p>
            <p className="mt-1 text-sm text-slate-600">{t.librarySubtitle}</p>
            <p className="mt-2 text-xs text-slate-400">
              {t.textsCount(READING_LIBRARY.length)}
              {readCount > 0 && ` · ${readCount} ${t.completedBadge.toLowerCase()}`}
            </p>
          </div>
          <span className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5 whitespace-nowrap">
            {t.openLibrary}
          </span>
        </div>
      </Link>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {dict.exercises.sectionTitle}
        </h2>
        <p className="text-xs text-slate-500 mb-3">{dict.exercises.sectionDesc}</p>
        <SkillModules category="READING" skill="reading" embedded />
      </div>
    </div>
  );
}
