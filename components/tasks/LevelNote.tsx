import Link from "next/link";
import { levelLabel } from "@/lib/level";
import { DEFAULT_MODULE } from "@/lib/tasks/module";
import type { UserLevel } from "@/types";

// The learner's level, as a footnote.
//
// This is what replaced the module picker. The module still decides which
// practice types appear and how hard the content is — it just says so quietly
// at the bottom of the page, with a link to change it, instead of standing
// between the learner and an exercise.

export const LevelNote = ({ level }: { level: UserLevel }) => {
  const label = levelLabel(level);

  return (
    <p className="text-xs text-slate-400">
      {label ? (
        <>
          Current level: <span className="font-medium text-slate-500">{label}</span>. Tasks are
          chosen and written for this level.
        </>
      ) : (
        <>
          You have not set your level yet, so tasks are written for Modul {DEFAULT_MODULE}.
        </>
      )}{" "}
      <Link href="/settings" className="underline hover:text-slate-600">
        Change it in Settings
      </Link>
      .
    </p>
  );
};
