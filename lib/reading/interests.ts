import { READING_TOPICS } from "./library";
import type { ReadingTopic } from "@/types";

// The learner's reading interests, stored as JSON on UserProfile.
//
// Parsing is deliberately forgiving. A malformed or outdated value costs one
// recommendation, which is not worth failing a page render over — so anything
// unrecognised is dropped and the rest is kept.

export const parseInterests = (json: string | null | undefined): ReadingTopic[] => {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is ReadingTopic =>
      typeof t === "string" && (READING_TOPICS as readonly string[]).includes(t)
    );
  } catch {
    return [];
  }
};

export const serialiseInterests = (interests: ReadingTopic[]): string => {
  return JSON.stringify([...new Set(interests)]);
};
