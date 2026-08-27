# Translation, feedback, history and the verb collection

What was added, what it replaced, and the rules each part exists to protect.

Read this alongside `docs/product-architecture.md`, which maps the four
learning areas. This document covers the layer that runs underneath all of
them: what the learner is told after they answer, and what the app remembers
about it.

## 1. The problem this change set fixes

Three things were true of the app before, and all three worked against a
learner who cannot yet read Danish:

1. **The explanations were in Danish.** Every authored rationale and every
   generated `why` field was written in Danish, and shown to a learner who had
   just failed to understand Danish. The one thing they could not read was the
   explanation of the thing they got wrong.
2. **Mistakes disappeared.** A wrong answer was shown once on the result screen
   and never again. `ExerciseAttempt` recorded that six answers were given and
   two were wrong; it recorded nothing about *which* two, so no screen could
   ever show a learner what they keep getting wrong.
3. **Failure was invisible.** Client fetches were written as
   `if (res.ok) { … }` with nothing in the else branch. A failed submit looked
   exactly like a slow one, and `app/(app)/practice/reading` could enter a
   permanent "loading" state from a single failed request.

## 2. Translation

```
lib/translation/lexicon.ts    tier 1  the app's own content    free, instant
lib/repositories/translation  tier 2  the shared cache         one indexed read
lib/translation/service.ts    tier 3  the model                only on a miss
```

The rule, the same one `lib/reading/explain.ts` already enforced for the
reading library: **do not call the model when the app already knows the
answer.** The lexicon indexes the Modul 2 glossaries, every sentence of every
library text, and all 500 verbs in every form — several thousand Danish→English
pairs that shipped with the repository and were previously only reachable from
the reading library.

`TranslationCache` is shared rather than per-user, for the same reason
`ReadingExplanation` is: what a sentence means is a fact about the sentence.
RLS grants every signed-in learner `select` on it and no `insert` — a poisoned
cache entry would be served to everybody, so only the server writes, through
the service role.

Word and sentence are separate kinds, separately cached and separately
prompted, because they answer different questions. A word gets its base form
and the form it is in; a sentence gets a natural rendering and, when it teaches
something, the literal one beside it.

On the client, `TranslationProvider` (mounted once, in `app/providers.tsx`)
holds the cache, coalesces everything requested in one tick into a single
batch, and tracks in-flight keys so the same word clicked twice is one request.
`DanishText` is the component: click a word for a popover, press **English**
for the sentence underneath. The Danish never moves and is never replaced.

## 3. English feedback

`lib/exercises/feedback.ts` produces, for every wrong answer:

- why the answer the learner **chose** does not work;
- why the correct answer is correct;
- the rule behind it, stated so it transfers to the next question.

Two levels, and the first is always available:

| level | where it comes from | when |
| --- | --- | --- |
| `baseline` | composed offline from the grading and the variant's own note | always, returned by `/submit` |
| `generated` | a model pass that can see what the learner picked | on request, cached on the attempt |

The baseline is not an error state. A learner is entitled to feedback whether
or not an API key is configured, which is why the authored rationales were
translated into English (`lib/exercises/reading-task{1..4}.ts`) rather than
left for a model to paraphrase at runtime. `lib/exercises/feedback.test.ts`
asserts that no Danish has crept back into any of them.

The generator's own prompts now ask for English rationales too. The Danish it
writes is still Danish — that is the learning content.

## 4. Learning history

```
ExerciseAttempt   one opgave          "which variants have I sat?"
QuestionEvent     one graded answer   "what did I answer, and was it right?"
MistakeRecord     one open mistake    "what am I still getting wrong?"
```

`QuestionEvent` is append-only and records **every** graded answer, right or
wrong — recording only mistakes would make "have I got better at this?"
unanswerable, because there would be nothing to compare against.

`MistakeRecord` is the aggregate, one row per question the learner has ever got
wrong. It is derived from the events but stored, because the review screen's
question is "what am I still getting wrong" and answering that by scanning
every event a learner has ever produced gets slower every week.

Both are written in exactly one place — `recordAnswers` in
`lib/repositories/learning-history.ts` — which is what stops the log and the
aggregate from disagreeing.

**A resolved mistake is kept, not deleted.** `resolvedAt` is set the first time
the learner answers it correctly afterwards, and cleared if they get it wrong
again. That is the only way the app can truthfully say "you have since answered
this correctly".

### Snapshots, and why they are not a normalisation error

`QuestionEvent` and `MistakeRecord` both carry `danishText`, `passageLabel` and
`passageText` copied from the exercise. This is deliberate duplication. A
generated opgave exists for one attempt and is never served again, so a history
row that pointed at it would be unreadable a week later. History that cannot be
read is not history.

`lib/exercises/context.ts` is what maps an answer key back to its Danish, and
is what preserves Test → Paragraph → Question:

```
Reading test (ExerciseAttempt)
  Annoncerne (passage)
    Which advert fits person 1?  — incorrect
    Which advert fits person 2?  — correct
```

### Question keys

`exercise:<variantId>:<answerKey>` for opgaver, `verb:<infinitive>:<mode>` for
verbs. Authored variants have a stable id, so the same question met twice
shares a key and aggregates. Generated variants get a fresh id per generation,
so their questions are unique by construction — which is correct: a generated
opgave is never served twice, and claiming the learner had "answered it
correctly since" would be a lie.

### Insights

`deriveInsights` groups open mistakes by `grammarTopic` and `taskType` and
reports what it finds, with the number of mistakes supporting each claim. Three
mistakes minimum (`MIN_EVIDENCE`), so the app never announces a weakness on the
strength of one slip. With no data there are no insights — the honest answer,
rather than a generic tip.

`grammarTopic` comes from a closed list (`lib/learning/topics.ts`). A grouping
key invented fresh on each generation groups nothing: "word order",
"ordstilling" and "the V2 rule" would be three separate weaknesses describing
one.

## 5. The verb collection

500 verbs in `lib/verbs/data.ts`, as code — the same decision the reading
library and the curriculum already made. Content that ships with the app and is
identical for every learner gains nothing from a table, and typechecking
catches a missing conjugation at build time.

Each verb carries four forms, its auxiliary (`er` for motion and change of
state — the mistake no conjugation table prevents), its conjugation group, one
real example with its English, and the preposition or fixed expression it lives
in.

The builders (`r1`, `r2`, `irr`) let regular verbs state only what varies, so a
typo in a predictable form is impossible; irregulars spell every form out.
`lib/verbs/verbs.test.ts` checks the invariants across all 500 — no duplicates,
four forms each, group consistent with the past-tense ending, and an answerable
question in every practice mode.

`VerbProgress` holds what the learner has done. `learned` is the learner's own
claim and is never set by the practice engine; the accuracy counts are what the
app measured. Keeping both means the app can notice when they disagree.

Practice (`lib/verbs/practice.ts`) is deterministic and offline: a round costs
no API call and starts instantly. Selection is weighted — repair first, then
review, then coverage — because a learner who keeps meeting "at vælge" until it
sticks learns more than one who meets five hundred verbs once each. Answers are
marked locally for instant feedback and re-derived server-side from the question
key, so nothing is trusted from the browser.

## 6. Loading, error and empty states

`lib/http/client.ts` turns this app's `{ error, reason }` convention into a
rejected promise carrying an `ApiError`. `useAsyncData` adds cancellation (a
reply to a request the learner has moved on from cannot overwrite the current
one) and a real error state. `useAction` guards double submission with a ref
checked *synchronously* — a `submitting` flag set inside the async function
leaves a window in which two clicks both get through.

`components/ui/states.tsx` holds the three states so they look and behave the
same everywhere: a skeleton shaped like what is coming, one sentence when there
is nothing, and a reason plus a retry when something failed.

## 7. Side notes

`lib/notes/side-notes.ts` — short tips matched to a context rather than to a
page, so the same note appears beside the opgave that exercises it, the verb
that demonstrates it, and the mistake that shows it has not landed. Authored,
because these are the things a teacher says twice a week and a model asked for
them on demand would produce a different one each time.

They render **closed** and are capped at two. A tip that is open by default is
not a side note, it is more page.

## 8. Migration

`prisma/migrations/20260826000000_learning_history_verbs_translation` adds
`TranslationCache`, `QuestionEvent`, `MistakeRecord`, `VerbProgress` and
`ExerciseAttempt.feedbackJson`. Nothing existing is altered or dropped, so no
progress is lost.

Applying it takes three steps, and skipping any one of them looks like a bug
in the application rather than an unfinished migration:

```bash
npx prisma migrate deploy            # or: npx tsx scripts/run-sql.ts <migration.sql>
npx tsx scripts/run-sql.ts supabase/rls.sql
npm run db:reload-schema
```

1. **The migration.** `prisma migrate deploy` needs `DIRECT_URL` (port 5432).
   Where only the pooler is reachable, `scripts/run-sql.ts` applies the same
   file through it — record the migration in `_prisma_migrations` afterwards so
   a later `deploy` does not try to create the tables a second time.

2. **RLS.** Section 3 generates an owner policy for every table with a `userId`
   column (the three new learner-owned tables); section 5 lists
   `TranslationCache` as shared read-only content. A new table starts with RLS
   *off*, so this is a security step, not a formality.

3. **The PostgREST schema cache.** Supabase serves the REST API through
   PostgREST, which holds the schema in memory. Tables created after that cache
   was built are invisible to it and every query fails with

   > Could not find the table 'public.QuestionEvent' in the schema cache

   which reads like a missing table and sends you looking for a migration that
   has already been applied. `npm run db:reload-schema` fixes it.
