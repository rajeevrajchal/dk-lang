import { content, srs } from "@/lib/repositories";
import type { ConstructStat, PracticeItemRow, Skill, TierReason } from "@/types";

// --------------------------------------------------------------------------
// Adaptive difficulty engine.
//
// Design choices, spelled out because they encode the product requirements
// directly:
//
// - No stored "current tier" on the user. The current tier is *computed*
//   from ConstructAccuracy every time it's needed, so progress is always a
//   live reflection of accuracy rather than a checkpoint that can drift out
//   of sync. This is what makes "advance smoothly mid-module" possible: the
//   moment enough attempts land, the very next practice set reflects it.
//
// - Construct-level gating: a learner is not advanced past a tier while any
//   *introduced* construct in that tier is below the fail threshold with
//   enough attempts to be meaningful — even if the tier's overall accuracy
//   looks fine on average. This directly implements "don't advance a
//   learner past a construct they're failing."
//
// - Diagnostic entry point: a brand-new learner in Modul 2 with no attempt
//   history does not start at Tier 1. They already sat (and failed) the
//   real modultest, so Tier 1 (simple present-tense main clauses) is
//   assumed known; practice starts at Tier 2 and Tier 1 items only
//   resurface if Tier 2 performance suggests a real gap underneath.
// --------------------------------------------------------------------------

const MIN_ATTEMPTS_FOR_SIGNAL = 3;
const ADVANCE_THRESHOLD = 0.8;
const FAIL_THRESHOLD = 0.5;
const DEFAULT_STARTING_TIER = 2;
const MAX_TIER = 4;

export const getConstructStats = async (
  userId: string,
  skill: Skill,
  moduleId?: number
): Promise<ConstructStat[]> => {
  const constructs = await content.constructsWithAccuracy(userId, skill, moduleId);

  return constructs.map((c) => {
    const stat = c.constructAccura[0];
    const total = stat?.totalCount ?? 0;
    const correct = stat?.correctCount ?? 0;
    return {
      constructId: c.id,
      code: c.code,
      name: c.name,
      tierId: c.tierId,
      correctCount: correct,
      totalCount: total,
      accuracy: total > 0 ? correct / total : null,
    };
  });
};

// Reason a tier was chosen, as a key + params rather than a baked-in
// sentence, so callers can render it in whatever locale is active (see
// lib/i18n/format.ts's formatTierReason).
// The tier the learner should be practicing right now for this module/skill.
export const determineCurrentTier = async (
  userId: string,
  moduleId: number,
  skill: Skill
): Promise<{ tier: number; reason: TierReason }> => {
  const stats = await getConstructStats(userId, skill, moduleId);
  const hasAnyAttempts = stats.some((s) => s.totalCount > 0);

  if (!hasAnyAttempts) {
    return { tier: DEFAULT_STARTING_TIER, reason: { key: "noAttemptsStartTier2" } };
  }

  for (let tier = 1; tier <= MAX_TIER; tier++) {
    const tierStats = stats.filter((s) => s.tierId === tier);
    if (tierStats.length === 0) continue;

    const failing = tierStats.find(
      (s) => s.totalCount >= MIN_ATTEMPTS_FOR_SIGNAL && (s.accuracy ?? 1) < FAIL_THRESHOLD
    );
    if (failing) {
      return {
        tier,
        reason: {
          key: "heldAtTier",
          tier,
          construct: failing.name,
          pct: Math.round((failing.accuracy ?? 0) * 100),
        },
      };
    }

    const attempted = tierStats.filter((s) => s.totalCount >= MIN_ATTEMPTS_FOR_SIGNAL);

    if (attempted.length === 0) {
      // No signal at this tier yet. Below the diagnostic starting floor
      // that's expected (this learner skipped it deliberately, see the
      // !hasAnyAttempts branch above) — skip forward rather than treating
      // untouched Tier 1 as a reason to fall back to it. At or above the
      // floor, absence of data is itself the reason to be here.
      if (tier < DEFAULT_STARTING_TIER) continue;
      return { tier, reason: { key: "establishingData", tier } };
    }

    const solid = attempted.every((s) => (s.accuracy ?? 0) >= ADVANCE_THRESHOLD);
    if (!solid) {
      return {
        tier,
        reason: { key: "tierNotSolid", tier, threshold: Math.round(ADVANCE_THRESHOLD * 100) },
      };
    }
  }

  return { tier: MAX_TIER, reason: { key: "allTiersSolid" } };
};

// Names the single weakest construct with enough data to be meaningful —
// this is what powers "you drop to 40% on sentences using 'selvom'" rather
// than a generic "reading is weak".
export const getWeakestConstruct = async (
  userId: string,
  skill: Skill,
  moduleId?: number
): Promise<ConstructStat | null> => {
  const stats = await getConstructStats(userId, skill, moduleId);
  const withSignal = stats.filter((s) => s.totalCount >= MIN_ATTEMPTS_FOR_SIGNAL);
  if (withSignal.length === 0) return null;

  return withSignal.reduce((worst, s) =>
    (s.accuracy ?? 1) < (worst.accuracy ?? 1) ? s : worst
  );
};

// Builds a practice set: mostly the current growing-edge tier, with a slice
// of spaced-repetition review pulled from constructs whose SRS state is due,
// so earlier material keeps resurfacing instead of the learner plateauing.
export const selectPracticeSet = async (
  userId: string,
  moduleId: number,
  skill: Skill,
  count = 8
): Promise<{ items: PracticeItemRow[]; currentTier: number; tierReason: TierReason }> => {
  const { tier: currentTier, reason: tierReason } = await determineCurrentTier(
    userId,
    moduleId,
    skill
  );

  const reviewSlots = Math.min(3, Math.floor(count * 0.3));
  const newSlots = count - reviewSlots;

  const recentAttemptItemIds = await content.recentlyAnsweredItemIds(
    userId,
    moduleId,
    skill,
    30
  );

  const currentTierItems = await content.itemsAtTier(
    moduleId,
    skill,
    currentTier,
    recentAttemptItemIds,
    newSlots * 3
  );

  const dueSrs = await srs.dueStates(userId, reviewSlots * 3);
  const dueConstructIds = dueSrs.map((s) => s.constructId);

  const reviewItems = await content.reviewItems(
    moduleId,
    skill,
    currentTier,
    dueConstructIds,
    reviewSlots * 2
  );

  const shuffle = <T>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const picked = [
    ...shuffle(currentTierItems).slice(0, newSlots),
    ...shuffle(reviewItems).slice(0, reviewSlots),
  ];

  // Pad with any items from the module/skill if we came up short (e.g. very
  // early in the item bank, or the learner has already seen almost
  // everything at this tier recently).
  if (picked.length < count) {
    const fallback = await content.itemsForModuleSkill(moduleId, skill, count * 2);
    for (const item of shuffle(fallback)) {
      if (picked.length >= count) break;
      if (!picked.find((p) => p.id === item.id)) picked.push(item);
    }
  }

  return {
    items: shuffle(picked)
      .slice(0, count)
      .map((item) => ({
        id: item.id,
        tierId: item.tierId,
        type: item.type,
        topic: item.topic,
        passageText: item.passageText,
        passageId: item.passageId,
        promptText: item.promptText,
        optionsJson: item.optionsJson,
        constructs: item.itemConstructs.map((ic) => ({
          id: ic.construct.id,
          code: ic.construct.code,
          name: ic.construct.name,
        })),
      })),
    currentTier,
    tierReason,
  };
};

// SM-2-ish spaced repetition update, applied per construct touched by the
// attempt.
const nextSrsState = (
  prev: { easeFactor: number; intervalDays: number; repetitions: number },
  correct: boolean
) => {
  if (!correct) {
    return { easeFactor: Math.max(1.3, prev.easeFactor - 0.2), intervalDays: 0, repetitions: 0 };
  }
  const repetitions = prev.repetitions + 1;
  const easeFactor = Math.min(2.8, prev.easeFactor + 0.1);
  let intervalDays: number;
  if (repetitions === 1) intervalDays = 1;
  else if (repetitions === 2) intervalDays = 3;
  else intervalDays = Math.round(prev.intervalDays * easeFactor);
  return { easeFactor, intervalDays, repetitions };
};

export const recordAttemptEffects = async (
  userId: string,
  itemId: string,
  skill: Skill,
  isCorrect: boolean
) => {
  const item = await content.findItem(itemId);
  if (!item) throw new Error(`item ${itemId} not found`);

  for (const ic of item.itemConstructs) {
    await srs.recordAccuracy(userId, ic.constructId, skill, isCorrect);

    const existingSrs = await srs.findState(userId, ic.constructId);
    const next = nextSrsState(
      existingSrs ?? { easeFactor: 2.5, intervalDays: 0, repetitions: 0 },
      isCorrect
    );
    const dueAt = new Date(Date.now() + next.intervalDays * 24 * 60 * 60 * 1000);

    await srs.upsertState(userId, ic.constructId, {
      ...next,
      dueAt: dueAt.toISOString(),
      lastReviewedAt: new Date().toISOString(),
    });
  }
};
