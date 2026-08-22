import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { theoryForTiers } from "@/lib/content-gen/theory";
import { TIERS } from "@/lib/curriculum/tiers";
import { getServerDictionary } from "@/lib/i18n/server";

export default async function TheoryIndexPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);

  const mod = MODULE_BY_ID.get(moduleIdNum);
  const dict = await getServerDictionary();
  const copy = dict.moduleCopy[moduleIdNum];
  if (!mod || !copy) notFound();

  const lessons = theoryForTiers(mod.tiersSpanned);
  const tiers = mod.tiersSpanned.filter((t) => lessons.some((l) => l.tier === t));

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <Link href={`/class/${moduleIdNum}`} className="text-sm text-slate-500 hover:underline">
        {dict.theory.backToModule}
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{dict.theory.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {copy.name} · {dict.theory.lessonsCount(lessons.length)}
        </p>
        <p className="mt-3 text-sm text-slate-600">{dict.theory.subtitle}</p>
      </div>

      {tiers.map((tier) => {
        const tierLessons = lessons.filter((l) => l.tier === tier);
        const tierDef = TIERS.find((t) => t.id === tier);
        return (
          <section key={tier}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                {dict.theory.tierLabel(tier)}
              </h2>
              {tierDef && <p className="mt-1 text-xs text-slate-400">{tierDef.description}</p>}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {tierLessons.map((lesson) => (
                <Link
                  key={lesson.slug}
                  href={`/class/${moduleIdNum}/theory/${lesson.slug}`}
                  className="block p-5 hover:bg-slate-50"
                >
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <p className="font-medium">{lesson.title}</p>
                    <span className="text-xs text-slate-400">{lesson.danishName}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{lesson.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
