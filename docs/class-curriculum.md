# The Class as a Danish course

How the Class teaches, and why it is built the way it is. The product-level
map of the four areas is in `docs/product-architecture.md`; this is about what
happens inside Lessons.

## 1. Grammar is the spine, everything else hangs off it

The course is ordered by grammar, from an absolute beginner forward:

```
1 Sentence basics   6 Negation     11 Joining sentences
2 Nouns             7 Word order   12 Subordinate clauses
3 Pronouns          8 Adjectives   13 Connectors
4 Present tense     9 The past     14 Passive voice
5 Questions        10 Future/modals 15 Longer sentences
```

Reading and writing lessons are **placed inside those chapters**, not kept in a
separate library. A reading text sits in the chapter whose grammar it
exercises, and it is written to be full of that grammar:

| Chapter | Reading / writing lesson | What the text is full of |
| --- | --- | --- |
| 4 Present tense | `reading-jeg-hedder-anna` | present-tense verbs, one clause each |
| 5 Questions | `reading-beskeder-og-opslag`, `writing-en-kort-besked` | yes/no questions, real message formats |
| 7 Word order | `reading-min-hverdag` | sentences starting with a time, so the subject keeps inverting |
| 9 The past | `reading-min-weekend` | regular and irregular past, first `fordi` clauses |
| 10 Future/modals | `writing-en-email` | `kan`/`skal`, proposing rather than instructing |
| 13 Connectors | `reading-derfor-blev-jeg-i-danmark` | `selvom`, `derfor`, `til gengæld` carrying an argument |

That placement is the mechanism behind "grammar → reading → understanding →
usage". The learner meets the rule working in real Danish within the same
chapter that taught it.

## 2. Difficulty is complexity, not vocabulary

Two scales, both already in the codebase, both about what the learner has to
handle rather than how obscure the words are:

- `CourseStage` (`types/course.ts`): words → sentences → questions → negation →
  tenses → complex → communication.
- `ReadingLevel` (`types/learning.ts`): 1 a handful of main clauses · 2
  connected sentences · 3 paragraphs, past tense, subordinate clauses appear ·
  4 natural everyday Danish with opinions · 5 PD3 argument.

A text never uses grammar from a chapter the learner has not reached. The past
tense does not appear before Chapter 9; subordinate clauses do not appear
before the chapter that introduces them.

## 3. English support fades

`SupportLanguage` moves english_led → bilingual → danish_led, and reading moves
with it (`supportForLevel`):

```
level 1-2   translation_shown       English visible under every paragraph
level 3     translation_available   English one click away
level 4-5   danish_first            read it in Danish, then check
```

Translation is a tool, not a crutch. "Full translation" exists but is the last
control on the row, on purpose.

## 4. Four levels of understanding a text

`LearningText` is structured rather than a string so the learner can ask four
different questions, which want four different answers:

| Click | Question | Answer |
| --- | --- | --- |
| a word | what is this form doing? | meaning **here**, base form, how the form arises |
| a sentence | why this word order? | natural meaning + `structureNote` |
| a paragraph | what is being said? | paragraph meaning + every sentence paired |
| full translation | what is this about? | whole-text summary |

Word glosses are **contextual**: `englishGloss` is the meaning in this sentence,
never a dictionary dump. `står op` glosses as "get up", not "stand". A test in
`lib/learning/text.test.ts` enforces that every gloss refers to a word actually
present in its text, so an edited text cannot leave a stale glossary behind.

## 5. One explanation shape, three sources

The field names in `Gloss` and `TextSentence` are deliberately the ones the app
already used, so the same renderer serves all three:

| Source | Words | Sentences |
| --- | --- | --- |
| Authored lesson texts | `LearningText.glossary` | `TextSentence` |
| Authored Modul 2 passages | `WordGloss` | `SentenceBreakdown` |
| LLM-generated opgave breakdowns | `Explanation.words` | `Explanation.sentences` |

TypeScript is structural, so no conversion layer was needed and no fourth
explanation format was invented.

## 6. Writing is taught, not set

A writing lesson is a `WritingModel`: the situation, a finished example, the
same example taken apart into labelled parts with alternatives, a skeleton, and
a checklist. The handover to independence uses the **existing** exercise ladder
rather than new machinery:

```
recognition            find the greeting in a finished text
selection              choose the phrase that does this job
ordering               put a scrambled email back in order
controlled_production  write one line into a skeleton
free_production        write the whole thing yourself
```

`course.test.ts` enforces that a lesson's exercises never move back down that
ladder — it caught three ordering mistakes in the new content when it was
written.

## 7. Classroom mode: a mistake is explained, not marked

`lib/learning/feedback.ts` turns a wrong answer into a contrast, per rung:

```
✗ Almost
❌ Jeg kan beklager ikke komme til mødet.
✅ Jeg kan desværre ikke komme til mødet.
'desværre' goes straight after the verb and does the whole apology.
```

Free production and communication return `null` rather than a fabricated
"correct" version — inventing a right answer to an open question would be a
lie. When the same words appear in the wrong order the panel says so, because
otherwise the two lines look identical.

## 8. Class is not the Practice Zone

| | Class (Lessons) | Class practice / Mock |
| --- | --- | --- |
| Question | how does Danish work? | can I perform it? |
| Feedback | immediate, with the rule | on submit / at the end |
| A wrong answer | explained and retried | scored |
| Text | glossed word by word | explained only after answering |

`lib/exercises/mode.ts` holds that as configuration (`lesson` / `class` /
`mock`). Lessons teach the concept; Class makes the learner use it; Mock finds
out whether it holds up under test conditions.

## 9. Adding content

A new reading lesson is a `TheoryLesson` with `kind: "reading"` and a `texts`
array, added to `reading-lessons.ts` and referenced as a topic from the chapter
whose grammar it exercises. Nothing else needs changing: no route, no renderer,
no progress table. The same is true of a writing lesson with a `writingModel`.

The tests will hold new content to the curriculum's own rules — glosses must
refer to words that are present, every sentence needs a real translation, the
exercise ladder must not go backwards, level 1 texts stay short, and every
lesson must be reachable from a chapter.
