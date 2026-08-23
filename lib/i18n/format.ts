import type { Dictionary, TierReason } from "@/types";

export const formatTierReason = (dict: Dictionary, reason: TierReason): string => {
  const t = dict.practice.tierReasons;
  switch (reason.key) {
    case "noAttemptsStartTier2":
      return t.noAttemptsStartTier2();
    case "heldAtTier":
      return t.heldAtTier(reason.tier, reason.construct, reason.pct);
    case "establishingData":
      return t.establishingData(reason.tier);
    case "tierNotSolid":
      return t.tierNotSolid(reason.tier, reason.threshold);
    case "allTiersSolid":
      return t.allTiersSolid();
  }
};
