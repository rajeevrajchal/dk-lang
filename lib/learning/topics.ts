// The vocabulary the app uses to say what a question was testing.
//
// A closed list, not free text from a model. Insights group by this field
// ("most of your open mistakes are word order"), and a grouping key invented
// fresh on every generation groups nothing — "word order", "ordstilling" and
// "V2 rule" would be three separate weaknesses describing one.
export const GRAMMAR_TOPICS = [
  "word-order",
  "verb-tense",
  "modal-verbs",
  "noun-gender",
  "definite-form",
  "plural-form",
  "adjective-agreement",
  "pronouns",
  "prepositions",
  "subordinate-clause",
  "question-form",
  "negation",
  "vocabulary",
  "fixed-expression",
  "reading-detail", // the answer is stated in the text and was missed
  "reading-inference", // the answer has to be worked out from the text
  "spelling",
  "numbers-and-time",
] as const;

export const TOPIC_LABELS: Record<(typeof GRAMMAR_TOPICS)[number], string> = {
  "word-order": "Danish word order",
  "verb-tense": "verb tenses",
  "modal-verbs": "modal verbs (kan, skal, vil, må)",
  "noun-gender": "en- and et-words",
  "definite-form": "the definite form (-en / -et / -ne)",
  "plural-form": "plurals",
  "adjective-agreement": "adjective endings",
  pronouns: "pronouns",
  prepositions: "prepositions",
  "subordinate-clause": "subordinate clauses",
  "question-form": "question forms",
  negation: "ikke and word order",
  vocabulary: "vocabulary",
  "fixed-expression": "fixed expressions",
  "reading-detail": "finding details in a text",
  "reading-inference": "working answers out from a text",
  spelling: "spelling",
  "numbers-and-time": "numbers, dates and times",
};
