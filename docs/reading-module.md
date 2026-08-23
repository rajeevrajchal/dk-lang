# The Reading module

A library of Danish texts with an interactive teacher beside them. Lives under
Class → Reading, alongside the modultest opgaver rather than replacing them.

## 1. Why it is a third thing

The app now has three ways of meeting a Danish text, and they are not
interchangeable:

| | Lessons | Class → opgaver | Class → Reading library |
| --- | --- | --- | --- |
| Question | how does this rule work? | can I do this task? | can I read this? |
| Text chosen for | the grammar it demonstrates | the format it rehearses | being worth reading |
| Feedback | immediate, with the rule | on submit, scored | on demand, never scored |
| Ends with | exercises | a mark | another text |

Extensive reading — a lot of Danish you can nearly understand, looking up what
you cannot — is the thing neither of the other two does, and it is the main
way reading actually gets easier.

## 2. Routes

```
/class/reading                      choose: library, or modultest opgaver
/class/reading/library              browse and filter
/class/reading/library/[textId]     read
/class/reading/[moduleId]           unchanged — the opgave practice
```

`library` is a static segment and `[moduleId]` a dynamic one; static wins in
Next.js routing, so the existing opgave routes are untouched.

## 3. Content model

Every library entry wraps a `LearningText` (`lib/learning/text.ts`) — the same
structured-Danish model the grammar course already used. That is what makes
the word/sentence/paragraph interaction work without a second content format,
and it is why **the texts written for the course lessons are library entries**
(`lib/reading/registry.ts` surfaces them with `courseLessonSlug` set).

```
ReadingText           id, blurb, level, topics, targetModules, phrases
  └── LearningText    summary, paragraphs, glossary, focusConstructs
        └── Paragraph translation
              └── Sentence   danish, english, structureNote, constructCodes
```

Twelve texts today, levels 1–5, spanning story · everyday · SMS · notice ·
advert · email · article.

## 4. The cost rule

**A click on a glossed word must never call a model.** Reading means clicking a
lot of words; billing a generation for each would be slow to use and expensive
to run. `app/api/reading/explain` therefore answers in three tiers:

```
1. answerFromText()      the text's own glossary / translations   instant, free
2. ReadingExplanation    shared cache, keyed by scope + level     one DB read
3. generateExplanation() the model                                only if 1 and 2 miss
```

Tier 3 is reached only by: a word nobody glossed, a phrase the learner selected
themselves, "why is it written like this?", and free-text questions. The cache
is **not per-user** — what a sentence means is a fact about the sentence, so one
learner paying for it benefits everyone.

A consequence worth stating: **with no `ANTHROPIC_API_KEY` the library still
works.** Glossed words, sentence structure, paragraph and full translations all
come from authored data. Only the deeper explanations are unavailable.

`lib/reading/library.test.ts` enforces the coverage this rests on: a level 1–2
text must gloss at least half of its longer words, because a beginner has no
fallback. Advanced texts may lean on generation, since by then the learner can
also cope with an unexplained word.

## 5. Explanations are short

`ExplanationSchema.summary` is one or two sentences and the only required
field. Everything else — grammar, structure, examples — is optional and stays
folded behind "More grammar". `max_tokens` is capped at 900 for the default
depth: a request that cannot run long cannot turn a word click into a lecture.

Context sent to the model: the text and what it is about, the paragraph, the
sentence, the selection, the learner's level and the course chapter they are
in. The level decides the vocabulary of the answer — a beginner is not told
about participles.

## 6. What the learner keeps

| | Model | Note |
| --- | --- | --- |
| Words and phrases | `SavedWord` | The learner's own vocabulary, with the sentence it came from. Links to a seeded `VocabItem` via `vocabItemId` when one matches, so the two stay one vocabulary. |
| Notes | `ReadingNote` | Anchored by content position (paragraph/sentence index, or the word), never a character offset — editing a text must not move every note in it. |
| Highlights | `ReadingHighlight` | Sentence-granular. Double-tap cycles yellow → blue → green → red → off. |
| Progress | `ReadingProgress` | Opened, completed, bookmarked, one mark, coarse seconds. |
| Interests | `UserProfile.interestsJson` | On the profile with the level, not in a table of its own. |

Phrases are first-class next to words (`SavedWord.kind`), because Danish is
learned in chunks — a learner who can only save single words ends up able to
translate a sentence they still cannot produce.

## 7. Recommendations do not hide anything

`recommend()` scores rather than filters: interest match counts most, then
being at or just below the learner's level, then not having read it. The level
comes from **how far through the grammar course they are**, not their official
module — what you can read follows from what you have been taught, and those
are separate facts (see `docs/product-architecture.md` §7).

Three recommendations sit above the full, browsable list. A library that only
shows three things is not a library.

## 8. Layout

Text left, panel right on desktop; the panel becomes a bottom sheet under
1024px, opened by selecting something. Reading stays the main thing: nothing
pops up, nothing is auto-translated, and the panel never steals focus.

## 9. Room left for later

The content model does not close off audio (`LearningText` is sentence-
addressable, so per-sentence audio has somewhere to hang), comprehension
quizzes (`ReadingText.comprehension` takes the course's exercise ladder), or
conversation about a text (the explain route already assembles the context a
chat would need). None of it is built.
