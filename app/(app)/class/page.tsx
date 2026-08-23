import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserLevel } from "@/lib/level";
import { getPracticeActivity } from "@/lib/activity";
import { getServerDictionary } from "@/lib/i18n/server";

// Class — the practice area.
//
// The first question is not "which module?" but "what would you like to
// practise?". Skill first, module second: a learner comes here wanting to work
// on their speaking, not wanting to browse Modul 3.

const SKILLS = [
  { key: "READING", href: "/class/reading", icon: "📖" },
  { key: "SPEAKING", href: "/class/speaking", icon: "🎤" },
  { key: "WRITING", href: "/class/writing", icon: "✍️" },
] as const;

export default async function ClassPage() {
  const session = await auth();
  const dict = await getServerDictionary();
  const t = dict.class2;

  const [level, activity] = await Promise.all([
    getUserLevel(session!.user.id),
    getPracticeActivity(session!.user.id),
  ]);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          {t.question}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SKILLS.map((skill) => {
            const sessions = activity.find((a) => a.category === skill.key)?.sessions ?? 0;
            return (
              <Link
                key={skill.key}
                href={skill.href}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
              >
                <span aria-hidden className="text-2xl">
                  {skill.icon}
                </span>
                <p className="mt-3 font-medium">{t.skills[skill.key]}</p>
                <p className="mt-1 text-xs text-slate-500">{t.skillDescriptions[skill.key]}</p>
                <p className="mt-3 text-xs text-slate-400">
                  {sessions > 0
                    ? dict.dashboard.practiceSessions(sessions)
                    : dict.dashboard.practiceNever}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Listening is declared but has no audio — saying so is better than
          hiding it and letting the learner wonder. */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 opacity-60">
        <p className="text-sm font-medium">{t.skills.LISTENING}</p>
        <p className="mt-1 text-xs text-slate-500">{t.skillDescriptions.LISTENING}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-slate-600">{t.vsLessons}</p>
        <Link
          href="/lessons"
          className="text-xs font-medium rounded-md border border-slate-300 bg-white px-3 py-1.5 whitespace-nowrap"
        >
          {dict.nav.lessons} →
        </Link>
      </div>

      {level.currentModule && (
        <p className="text-xs text-slate-400">
          {dict.dashboard.yourLevel}: {level.education === "DU3" ? "PD3" : level.education} ·{" "}
          {t.moduleLabel(level.currentModule)}
        </p>
      )}
    </div>
  );
}
