# Dansk Modultest / PD3 Prep

A prep app for Danskuddannelse 3 (DU3), Modul 1–5, ending at Prøve i Dansk 3
(PD3). Scope, ground rules, and non-goals are as specified in the build
brief — most importantly: **this app never sources, reproduces, or claims
equivalence to the real SIRI exam bank.** Every practice item is originally
written and tagged `generated: true` (see `docs/content-validation.md`).

## Product structure

Four learning areas plus profile, described in full in
`docs/product-architecture.md`:

| Area          | The learner's question        | Route      |
| ------------- | ----------------------------- | ---------- |
| **Lessons**   | What do I need to learn?      | `/lessons` |
| **Class**     | Can I use what I learned?     | `/class`   |
| **Mock**      | Am I ready for the real test? | `/mock`    |
| **Dashboard** | How am I doing?               | `/dashboard` |
| **Settings**  | What level am I?              | `/settings` |

One exercise engine serves all three learning areas
(`lib/exercises/`); the difference between them is the learning mode
(`lib/exercises/mode.ts`), not a separate implementation.

Two things that look alike and are kept strictly apart: the learner's
**official level** (told to us at onboarding or from a real test result) and
their **practice standing** (what the app measured). A mock score never moves
the official level — see `docs/product-architecture.md` §7.

## What's built vs. scaffolded

Built end-to-end, with real seeded content and a passing production build:

- Auth (email/password) + onboarding + the four-area app shell
- Grammar course (`/lessons`): 15 chapters, chapter/topic/lesson hierarchy,
  a course sidebar, per-lesson progress and resume-where-you-left-off
- Skill-first practice (`/class`): reading, speaking and writing, with the
  task types each module actually examines
- **Modul 2 reading**, tiers 1–3: 38 tagged items (constructs, topic,
  question type), adaptive tier/construct selection, spaced-repetition
  review, per-attempt tracking
- Timed mock modultest simulation for Modul 2 reading (12 questions, 12
  minutes, 70% pass threshold)
- Module/skill unlock state machine: in-app mock-pass vs. verified official
  result, tracked as genuinely separate fields, never merged
- Report card upload → (pluggable, currently stubbed) extraction → learner
  confirmation → reconciliation against the unlock state, with discrepancies
  surfaced rather than silently overwritten

Schema-ready but not yet built out (see `lib/curriculum/modules.ts` for the
full five-module map and `docs/module-map.md` for what's next):

- Listening, writing, speaking item banks and practice UIs
- Modul 1, 3, 4, 5 content (schema, unlock logic, and the PD3 exam-type
  branch already exist; only the item banks are missing)
- Real OCR/vision extraction (`lib/ocr.ts` has the interface and currently
  falls back to manual entry — see that file for why)
- Pre-generated TTS audio for listening items (`Item.audioUrl` exists in the
  schema for this)

## Stack

Chosen for "boring and maintainable" over novel, since this is a
long-lived personal tool, not a one-off:

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | One deployable for UI + API routes; no separate backend to run/deploy. |
| Auth | NextAuth (Auth.js) v5, Credentials provider | Email/password is enough for a single-learner tool; the Prisma adapter tables are still modeled so a second learner is a config change, not a migration. |
| Database | SQLite via Prisma, dev; swap to Postgres for a real deploy | Zero-config locally — `npm install && npx prisma migrate dev` and you're running. Prisma's schema is nearly identical across both; the only casualty is native enums (see below). |
| File storage | Local disk under `storage/reportcards/`, outside `public/` | Report cards carry PII (name, sometimes CPR-adjacent identifiers). Access is gated by the same auth as everything else (`app/api/reports/[id]/file/route.ts`), never a public/guessable URL. Swap to S3-compatible storage behind the same route for a real deploy. |
| OCR/vision | Pluggable interface (`lib/ocr.ts`), currently a manual-entry fallback | No extraction provider is configured in this environment. The interface is provider-agnostic (see the `extractWithAnthropicVision` stub) so wiring a real one later is a one-function change — and the confirm-before-save flow means a weak extractor degrades gracefully instead of blocking uploads. |
| TTS (listening) | Not yet wired; `Item.audioUrl` reserved for pre-generated files | Per the brief, content generation is a batch/offline step, not live calls per request — so listening audio should be synthesized once per item during content generation and served as a static file, the same way the reading item bank is seeded. |
| Content generation | TypeScript data files under `lib/content-gen/`, loaded by `prisma/seed.ts` | Nothing in the request path generates content. Items are hand-authored (today) or could be LLM-assisted offline later, but always reviewed and committed as data before they're ever served. |

### Why SQLite's lack of enums matters here

Prisma enums aren't supported on SQLite. Fields that would be enums on
Postgres (`Item.skill`, `Item.type`, `Item.topic`, `ExamSession.examType`,
`ReportCard.status`, etc.) are plain `String` columns instead, validated at
the app layer against the literal unions in `lib/constants.ts`. Moving to
Postgres later can promote these to real enums without touching application
code — the app already treats them as closed unions via TypeScript.

## Data model

Full schema: `prisma/schema.prisma`. Summary by concern:

- **Auth**: `User`, `Account`, `Session`, `VerificationToken` — standard
  NextAuth Prisma-adapter shape.
- **Curriculum**: `Module` (1–5, with `isOralOnly`/`isFinalExam` flags),
  `Tier` (1–4, global complexity ladder), `Construct` (the specific
  grammar/lexical point, e.g. `subordinate-clause:fordi`, tagged to a tier),
  `VocabItem`.
- **Content**: `Item` (module + skill + tier + topic + type + the actual
  question/passage/answer/rubric, `generated: true` always set),
  `ItemConstruct` (join table — an item can exercise more than one
  construct).
- **Learner activity**: `Attempt` (one answer, correctness, optional link to
  an `ExamSession`), `ConstructAccuracy` (running correct/total per
  user+construct+skill — what the weak-area engine reads),
  `SrsState`/`VocabSrsState` (SM-2-style spaced repetition state).
- **Exam simulation**: `ExamSession` (timed mock modultest or PD3 run,
  scores/pass-fail per skill once completed).
- **Unlock state — kept deliberately split**: `ModuleSkillStatus` has both
  `inAppPassed` (set only by a completed `ExamSession`) and `officialPassed`
  (set only by a confirmed `ReportCard`), plus a `discrepancy` flag and note
  for when they disagree. Nothing ever collapses these into one field — see
  `docs/unlock-logic.md`.
- **Report cards**: `ReportCard` — raw file path (access-controlled, never
  public), OCR/manual-entry extracted fields, `status` through
  `PENDING_EXTRACTION → PENDING_CONFIRMATION → CONFIRMED`, and a
  `reconciliationJson` summary of what changed when it was confirmed.
- **Lessons**: `LessonProgress` — one row per learner per lesson slug, with a
  `status` (`IN_PROGRESS` once opened, `COMPLETED` once handed in), the score
  on its auto-checkable exercises, and `lastVisitedAt`, which is what
  "continue where you left off" reads.
- **Level — the other deliberate split**: `UserProfile` holds the level the
  learner *told* us (onboarding, or an official result), and
  `OfficialTestResult` records the real tests they sat. Neither is ever
  written from a practice or mock score; `lib/level.ts` is the only writer.

## Content validation

See `docs/content-validation.md` for the full note; short version: every
item is tagged with the specific construct(s) it exercises and the tier
that construct belongs to (`lib/content-gen/constructs.ts`), and each
passage is written to isolate 1–2 target constructs so per-construct
accuracy stays meaningful. Nothing is sourced from or modeled directly on
a real SIRI test — passages are original compositions written to the tier
definitions in `lib/curriculum/tiers.ts`.

## Getting started

```bash
cp .env.example .env        # SQLite by default, no further config needed
npm install
npx prisma migrate dev      # creates dev.db and runs prisma/seed.ts
npm run dev
```

Register an account at `/login`, and you land on the dashboard already
diagnosed into Modul 2 reading at Tier 2 (see `lib/adaptive/engine.ts` for
why it skips Tier 1 for a learner who's already sat the real exam).

Useful scripts:

- `npm run db:seed` — re-run the content seed (safe to re-run; it replaces
  generated Modul 2 reading items rather than duplicating them)
- `npm run build` / `npm run lint` — production build and lint, both clean
