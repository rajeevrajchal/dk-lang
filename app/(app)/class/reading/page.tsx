import Link from "next/link";
import { auth } from "@/lib/auth";
import { reading } from "@/lib/repositories";
import { READING_LIBRARY } from "@/lib/reading/registry";
import { CategoryPage } from "@/components/tasks/CategoryPage";
import { getServerDictionary } from "@/lib/i18n/server";

// Reading has two halves, and they answer different questions.
//
// The library is extensive reading: read a lot of Danish you can nearly
// understand, look up what you cannot. The practice types are the modultest
// formats. A learner needs both, and conflating them is how reading practice
// turns into exam practice by accident — so the library keeps its own card
// above the ladders rather than becoming one of them.

const ReadingPage = async () => {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.reading;

  const progress = await reading.listProgress(session!.user.id);
  const readCount = progress.filter((p) => p.status === "COMPLETED").length;

  return (
    <CategoryPage category="READING">
      <Link
        href="/class/reading/library"
        className="block rounded-xl border-2 border-slate-900 bg-white p-6 hover:bg-slate-50"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{t.libraryTitle}</p>
            <p className="mt-1 text-sm text-slate-600">{t.librarySubtitle}</p>
            <p className="mt-2 text-xs text-slate-400">
              {t.textsCount(READING_LIBRARY.length)}
              {readCount > 0 && ` · ${readCount} ${t.completedBadge.toLowerCase()}`}
            </p>
          </div>
          <span className="whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
            {t.openLibrary}
          </span>
        </div>
      </Link>
    </CategoryPage>
  );
};

export default ReadingPage;
