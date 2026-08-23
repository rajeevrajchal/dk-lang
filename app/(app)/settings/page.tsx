import { auth, signOut } from "@/lib/auth";
import { getServerDictionary } from "@/lib/i18n/server";
import { getUserLevel, listOfficialTestResults } from "@/lib/level";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { TranslateHelperToggle } from "@/components/TranslateHelperToggle";
import { LevelSection } from "@/components/profile/LevelSection";
import { InterestsPicker } from "@/components/reading/InterestsPicker";
import { parseInterests } from "@/lib/reading/interests";
import { users } from "@/lib/repositories";

// Settings is where facts about the learner live: who they are, what level
// they are at, and which real tests they have sat. The learning areas read
// those facts; none of them writes one.

export default async function SettingsPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const [level, officialResults, interestsJson] = await Promise.all([
    getUserLevel(session!.user.id),
    listOfficialTestResults(session!.user.id),
    users.getInterestsJson(session!.user.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-8">
      <h1 className="text-xl font-semibold">{dict.settings.title}</h1>

      <LevelSection
        education={level.education}
        currentModule={level.currentModule}
        levelSource={level.levelSource}
        results={officialResults.map((r) => ({
          id: r.id,
          testType: r.testType,
          education: r.education,
          module: r.module,
          result: r.result,
          takenAt: r.takenAt ?? null,
          source: r.source,
          note: r.note,
        }))}
      />

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {dict.reading.yourInterests}
        </h2>
        <InterestsPicker initial={parseInterests(interestsJson)} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {dict.settings.language}
        </h2>
        <LocaleSwitcher />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {dict.settings.account}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <p className="text-xs text-slate-400">{dict.settings.nameLabel}</p>
            <p className="text-sm text-slate-900">{session?.user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{dict.settings.emailLabel}</p>
            <p className="text-sm text-slate-900">{session?.user?.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-sm text-slate-600 hover:underline">{dict.settings.signOut}</button>
          </form>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {dict.settings.learningPrefs}
        </h2>
        <TranslateHelperToggle />
      </section>
    </div>
  );
}
