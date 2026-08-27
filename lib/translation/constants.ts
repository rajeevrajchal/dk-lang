// A word or a sentence, and nothing in between.
//
// The distinction is the product requirement, not an implementation detail: a
// learner needs to be able to see what one word means WITHOUT losing the
// sentence, and to see what the sentence means without having to assemble it
// from words. They are answered differently — a word gets a base form and an
// inflection note, a sentence gets a natural rendering and, when it helps, the
// literal one beside it — so they are cached and prompted separately.
export const TRANSLATION_KINDS = ["WORD", "SENTENCE"] as const;

/** Longer than this and it is a passage, which the explain flow handles. */
export const MAX_TRANSLATION_CHARS = 600;

/** How many pieces one batch request may carry. */
export const MAX_TRANSLATION_BATCH = 25;
