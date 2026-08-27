import type { ItemResponse, ItemTypeCode } from "@/types";

// Response shapes sent from the client, keyed by item type:
// MULTIPLE_CHOICE / TRUE_FALSE / GAP_FILL -> string
// MATCHING -> string[] of "leftIndex:rightIndex" pairs
const normalize = (s: string): string => {
  return s.trim().toLowerCase();
};

export const gradeResponse = (
  type: ItemTypeCode,
  answerJson: string,
  response: ItemResponse
): boolean => {
  const answer: string[] = JSON.parse(answerJson);

  if (type === "MATCHING") {
    const responseArr = Array.isArray(response) ? response : [response];
    if (responseArr.length !== answer.length) return false;
    const a = new Set(answer.map(normalize));
    const b = new Set(responseArr.map(normalize));
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  // MULTIPLE_CHOICE, TRUE_FALSE, GAP_FILL: single string, accept any of the
  // accepted answers in `answer` (GAP_FILL may list synonyms).
  const responseStr = Array.isArray(response) ? response[0] ?? "" : response;
  return answer.some((a) => normalize(a) === normalize(responseStr));
};
