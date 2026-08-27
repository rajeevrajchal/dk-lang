# Product architecture: Lessons · Class · Mock · Dashboard

What the app is made of after the restructure, what moved where, and which
rules the structure exists to protect.

This document is the map that section 30 of the restructure brief asked for.
Nothing here is aspirational — every row of the migration table names code
that exists.

## 1. The four areas

```
LESSONS   Learn Danish      grammar course, chapter → topic → lesson
VERBS     Build vocabulary  the 500 most common verbs, browse and practise
CLASS     Practise it       reading / speaking / writing, module-specific
MOCK      Simulate the test full mock test + individual sections, then results
DASHBOARD Understand where  level, lesson progress, habit, activity, history
          you are

MISTAKES  Fix what is wrong every question you got wrong, with the paragraph
HISTORY   Look back         every question you have answered, grouped by test

SETTINGS  Profile, current level, official test results
```

The learner's question decides the area:

| Question                      | Area      |
| ----------------------------- | --------- |
| What do I need to learn?      | Lessons   |
| What words do I not know yet? | Verbs     |
| Can I use what I learned?     | Class     |
| Am I ready for the real test? | Mock      |
| How am I doing?               | Dashboard |
| What do I keep getting wrong? | Mistakes  |
| What did I do last week?      | History   |
| What level am I?              | Settings  |

Verbs, Mistakes and History were added after the original four. They are
separate areas rather than tabs inside Class because they answer questions a
learner asks *between* practice sessions, not during one — see
`docs/learning-history.md`.

## 2. Route map (before → after)

Old URLs still work. Everything below either moved with a redirect stub left
behind or stayed exactly where it was.

| Existing route                            | New destination                          | How            |
| ----------------------------------------- | ---------------------------------------- | -------------- |
| `/class/course`                           | `/lessons`                               | redirect       |
| `/class/course/[chapterId]`               | `/lessons/[chapterId]`                   | redirect       |
| `/class/course/[chapterId]/[lessonSlug]`  | `/lessons/[chapterId]/[lessonSlug]`      | redirect       |
| `/class/[moduleId]/theory[/slug]`         | unchanged (reached from Lessons + Class) | kept           |
| `/class`                                  | `/class` — now a skill chooser            | rewritten      |
| `/opgaver/[moduleId]/[category]`          | `/class/{reading,speaking,writing}/[moduleId]` | redirect  |
| `/practice/reading/[moduleId]`            | unchanged (Class → Reading → drill)      | kept           |
| `/mock-test/[moduleId]`                   | `/mock/[moduleId]/full`                  | redirect       |
| `/exam/reading/[moduleId]`                | `/mock/[moduleId]/reading`               | redirect       |
| `/reports`                                | unchanged (linked from Settings)         | kept           |
| `/dashboard`, `/settings`                 | unchanged, extended                      | kept           |
| —                                         | `/onboarding` (new)                      | new            |
| —                                         | `/verbs`, `/verbs/practice` (new)        | new            |
| —                                         | `/mistakes`, `/history` (new)            | new            |

`/class/[moduleId]` survives as the per-module hub the exercise runners link
back to; it now presents the three skills rather than being the only way in.

Route folders under `/class` mix a dynamic `[moduleId]` segment with static
`reading` / `speaking` / `writing` / `course` segments. Static segments win in
Next.js routing, so the skill routes and the legacy module hub coexist without
a dynamic-segment name clash.

## 3. The core engine is shared, not duplicated

```
                      CORE ENGINE
  lib/exercises/{registry,generator,grading}.ts + types/exercises.ts
                           |
        +------------------+------------------+
        v                  v                  v
     LESSONS             CLASS               MOCK
   mode "lesson"      mode "class"        mode "mock"
```

Everything that happens AFTER an answer is shared too, and by the same rule —
one implementation, never one per area:

```
  grading.ts        was it right?          (the answer key)
  feedback.ts       why, in English?       (what the learner chose)
  context.ts        what text was it about? (the paragraph behind the answer)
  learning-history  what should be kept?    (QuestionEvent + MistakeRecord)
```

Verb practice joins the same pipeline at `learning-history`, which is why a
struggling verb and a misread paragraph show up in one review list rather than
two. See `docs/learning-history.md`.

`lib/exercises/mode.ts` names the three modes and what each one does about
feedback, guidance, retries and timing. The mode is *derived*, never a second
copy of state:

- an `ExerciseAttempt` with an `examSessionId` is **mock**;
- an `ExerciseAttempt` without one is **class**;
- `LessonProgress` rows are **lesson** — a different table for a different
  question ("was I taught this?" vs "can I perform it?").

That derivation is why no migration was needed to add the abstraction.

Task selection is one function for every area:
`lib/exercises/module-tasks.ts` answers "which task types does module N use for
category C?", and `registry.selectNextTaskType` / `selectNextVariant` consult
it. Speaking already worked this way (`speaking-patterns.ts`); reading and
writing now do too, which is what makes Class reading module-shaped rather
than a generic "read this and answer" drill.

## 4. Lessons

- Curriculum data: `lib/curriculum/course.ts` (chapters) pointing at lessons in
  `lib/content-gen/theory.ts` + `lib/curriculum/foundation-lessons.ts`. A
  chapter references lessons by slug; it does not contain them.
- Progression rules: `lib/curriculum/progress.ts` — pure functions over a
  `ProgressMap`, no database.
- Persistence: `LessonProgress`, one row per learner per lesson slug, now
  carrying `status` (`IN_PROGRESS` | `COMPLETED`), `startedAt` and
  `lastVisitedAt` so a lesson can be resumed.
- Sidebar: `components/lessons/LessonSidebar.tsx` — chapters, topics, current
  lesson, completion, locked state, overall progress.

Resume: `resumePoint(progress)` prefers the most recently visited unfinished
lesson and falls back to `nextUp()`. Leaving and coming back lands you where
you were.

## 5. Class

```
/class                    choose a skill
/class/reading            choose a module
/class/reading/2          practise (ExerciseRunner, category READING)
/class/speaking/2         same, and optionally a specific task type
/class/writing/2          same
```

Practice is powered by the same `ExerciseRunner` + `/api/exercises/next` that
`/opgaver` used. What changed is the way in and the task selection: the module
decides the pattern, so Modul 2 reading rehearses Opgave 1–4 of the real test
rather than a generic paragraph-and-question.

## 6. Mock

```
/mock                     pick a test
/mock/[moduleId]          full mock test, or an individual section
/mock/[moduleId]/full     MockTestRunner (opgave format, timed, deferred feedback)
/mock/[moduleId]/reading  item-based timed reading test
```

Mock behaviour is the existing behaviour: feedback is withheld until the whole
session is handed in (`/api/exercises/[attemptId]/submit` checks
`examSessionId`), and scoring is `lib/exercises/grading.ts` +
`EXAM_PASS_THRESHOLD` in `lib/unlock.ts`. No new pass/fail rules were invented.

Results show per-skill scores, then strengths and weak areas computed from the
per-opgave breakdown that `/api/mock-test/[sessionId]/complete` already
returns.

## 7. Level: two separate concepts

```
OfficialTestResult          practice / mock results
  what SIRI or the           what this app measured
  sprogcenter decided
        |                           |
        v                           v
  UserProfile.currentModule    ModuleSkillStatus.inApp*
  (set at onboarding or from   (never touches official*)
   an official result)
```

- `UserProfile` holds the learner's stated level and where it came from
  (`ONBOARDING` or `OFFICIAL_RESULT`).
- `OfficialTestResult` records a real test the learner sat. A confirmed
  `ReportCard` upload is one source of these; a self-reported entry in Settings
  is the other.
- `applyInAppExamResult` in `lib/unlock.ts` writes only `inAppPassed` /
  `inAppScore`. Nothing in the codebase writes an official field from a
  practice score, and `lib/level.ts` is the only writer of `UserProfile`
  level fields.

The app may *say* "your recent practice looks strong for Modul 3". It never
changes the official level to match.

## 8. Where the learner is asked for their level

Twice, and only twice:

1. `/onboarding`, once, on first run.
2. Settings → "I have taken an official test", whenever they have a new result.

No other screen asks.
