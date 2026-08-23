import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULE_BY_ID } from "@/lib/curriculum/modules";
import { hasContent } from "@/lib/dashboard";
import { categoryHasContent } from "@/lib/exercises/registry";
import { llmGenerationAvailable } from "@/lib/exercises/generator";
import { getServerDictionary } from "@/lib/i18n/server";

// Choose what to sit: the whole thing, or one section.
//
// Both are simulations — the difference is length, not how much help you get.

const MockModulePage = async ({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) => {
  const { moduleId } = await params;
  const moduleIdNum = Number(moduleId);
  const mod = MODULE_BY_ID.get(moduleIdNum);
  if (!mod || mod.isOralOnly) notFound();

  const dict = await getServerDictionary();
  const t = dict.mock;
  const generation = llmGenerationAvailable();

  const fullAvailable =
    generation ||
    (categoryHasContent(moduleIdNum, "READING") && categoryHasContent(moduleIdNum, "WRITING"));
  // The item-based reading test draws on the generated Item bank, which is a
  // different content source from the opgave variants.
  const readingSectionAvailable = hasContent(moduleIdNum, "READING");

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <Link href="/mock" className="text-sm text-slate-500 hover:underline">
        {t.backToMock}
      </Link>

      <div>
        <h1 className="text-xl font-semibold">
          {t.moduleLabel(moduleIdNum)} {mod.isFinalExam && "(PD3)"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <section className="space-y-3">
        {fullAvailable ? (
          <Link
            href={`/mock/${moduleIdNum}/full`}
            className="block rounded-xl border-2 border-slate-900 bg-white p-6 hover:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{t.fullTest}</p>
                <p className="mt-1 text-sm text-slate-600">{t.fullTestDesc}</p>
              </div>
              <span className="text-xs font-medium rounded-md bg-slate-900 text-white px-3 py-1.5 whitespace-nowrap">
                {dict.mockTest.start}
              </span>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 opacity-60">
            <p className="font-medium">{t.fullTest}</p>
            <p className="mt-1 text-sm text-slate-600">{t.unavailable}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-6 mb-3">
            {t.sections}
          </h2>
          {readingSectionAvailable ? (
            <Link
              href={`/mock/${moduleIdNum}/reading`}
              className="block rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium">{t.readingSection}</p>
                  <p className="mt-1 text-xs text-slate-500">{t.readingSectionDesc}</p>
                </div>
                <span className="text-xs font-medium rounded-md border border-slate-300 px-3 py-1.5">
                  {dict.mockTest.start}
                </span>
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 opacity-60">
              <p className="text-sm font-medium">{t.readingSection}</p>
              <p className="mt-1 text-xs text-slate-500">{t.unavailable}</p>
            </div>
          )}
        </div>
      </section>

      <p className="text-xs text-slate-500">{t.notPractice}</p>
      <p className="text-xs text-slate-400">{dict.mockTest.disclaimer}</p>
    </div>
  );
};

export default MockModulePage;
