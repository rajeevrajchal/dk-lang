# PROJECT.md — Product Overview

## Product purpose

dk-lang helps adult learners prepare for Danish language modules (Modul 1–5)
and the PD3 exam (Prøve i Dansk 3) by combining a structured grammar course
with exam-format practice (reading, writing, speaking, listening) and mock
tests that mirror the real exam's structure and scoring.

## Target users

Adults learning Danish as a second language, most commonly enrolled in a
municipal Danish course (on the DU2 or DU3 track), preparing to sit an
official module test or PD3. They already have a classroom teacher and
curriculum — this app is supplementary practice and self-assessment, not a
replacement for instruction.

## Main user journey

1. **Sign in** with Google (invite-only — accounts are provisioned for
   enrolled learners, not self-registered).
2. **Onboarding**: state current module/level, either from self-assessment
   or an official result, so the app knows where to start.
3. **Dashboard**: see current level, recent activity, weak areas, and a
   recommended next action.
4. **Lessons**: work through the grammar course chapter by chapter.
5. **Class / Practice**: practice a category (reading, writing, speaking,
   listening) independent of the lesson sequence, at a chosen difficulty.
6. **Mock tests**: sit a full or single-category mock test under exam
   conditions (timed, scored like the real thing).
7. **Progress**: review mistakes, history, and module-unlock status; upload
   an official report card to reconcile in-app results with the real exam.
8. Loop back to Dashboard, which routes the learner to whichever of the
   above needs attention next.

## Core modules

- **Lessons** — the grammar course (chapters → lessons → exercises).
- **Class** — category-based practice (reading/writing/speaking/listening),
  organized as a numbered ladder of tasks per module and category.
- **Mock Tests** — full or partial exam simulations reusing the same task
  content as Class practice, scored under exam rules.
- **Progress** — cross-cutting: mistake review, history, module/skill unlock
  state, official-result reconciliation.
- **Dashboard** — the entry point; surfaces metrics computed from the above,
  never invents its own data.
- **Settings** — profile, level override, account.

## Product hierarchy

```
Authentication
    ↓
Onboarding (first run only)
    ↓
Dashboard
    ↓
┌───────────┬───────────┬─────────────┬────────────┐
Lessons     Class       Mock Tests    Progress     Settings
│           │                             │
Grammar     Reading                   Mistakes
Examples    Writing                   History
Exercises   Speaking                  Unlock status
            Listening (scaffolded,    Official results
             no content yet)
```

## Feature relationships (short version — full graph in
[docs/architecture/project-graph.md](docs/architecture/project-graph.md))

- Class and Mock Tests **share task content**: a mock test's "Task 7" is the
  same database row as Class practice's "Task 7." They are not separate
  content systems — a mock sitting is distinguished by the presence of an
  exam session, not by different questions.
- Every graded attempt, regardless of where it happened (Lessons, Class,
  Mock Tests), writes to one shared history/mistake pipeline. Progress is
  read from that history, not maintained as a parallel counter.
- Module/skill unlock state tracks two signals that are deliberately never
  merged: an in-app mock pass, and an officially-confirmed result from an
  uploaded report card. A learner can have one without the other; the app
  surfaces the discrepancy rather than resolving it automatically.

## Future expansion possibilities

- **Listening** category: route/catalogue slots already exist in the
  architecture; audio content and a transcription/playback pipeline are net
  new work, not a port of anything.
- **Writing auto-grading**: currently writing is reviewed by AI-generated
  feedback but not auto-scored; a rubric-based scoring function is a
  plausible v2 addition, designed deliberately rather than inherited.
- **Spaced repetition for grammar constructs**: the old system had a
  construct-accuracy/SRS model with no direct equivalent in the new task
  architecture. Worth reconsidering once there's real usage data — see
  `docs/architecture/architecture-review.md`.
- Additional modules/languages are explicitly out of scope for v1 but the
  module/category/task-type structure does not assume Danish specifically
  at the schema level, so it is not precluded.
