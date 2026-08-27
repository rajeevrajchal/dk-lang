// The module a learner works at, in one place.
//
// Everything that used to ask "which module?" now asks here instead. The
// answer comes from onboarding or Settings and nowhere else — a screen may
// SHOW it as context, but no screen may make the learner choose it again to
// reach an exercise.

/**
 * What to use when the learner has not told us their level yet.
 *
 * Modul 2 because it is the only module with a complete hand-authored bank, so
 * a learner who skipped onboarding still gets real content rather than an
 * empty ladder. The moment they set a level in Settings, everything follows it.
 */
export const DEFAULT_MODULE = 2;

/** The learner's module, with the fallback applied. */
export const moduleFor = (currentModule: number | null | undefined): number => {
  return currentModule ?? DEFAULT_MODULE;
};
