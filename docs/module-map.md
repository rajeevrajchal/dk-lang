# Module map & what's next

The full five-module map (CEFR goal, disciplines, tiers spanned, topics) is
defined in `lib/curriculum/modules.ts` and seeded into the `Module` table by
`prisma/seed.ts`. This doc is the build-order companion to that file: what's
live today and what the next slice should be.

| Module | Disciplines tested | Reading tiers | Status |
|---|---|---|---|
| Modul 1 | none (oral-only) | Tier 1 | Map only — no modultest exists at this level, out of scope by design |
| **Modul 2** | mundtlig, læsning, skrivning | **Tier 1–3** | **Reading: built.** 38 items, adaptive engine, mock exam. Listening/writing/speaking: not started |
| Modul 3 | mundtlig, læsning, skrivning | Tier 2–3 | Schema/unlock logic ready, no content |
| Modul 4 | mundtlig, læsning, skrivning | Tier 3–4 | Schema/unlock logic ready, no content |
| Modul 5 (PD3) | skriftlig, mundtlig | Tier 4 | Schema/unlock logic ready (`isFinalExam` branches the exam type to `PD3` and the required-skills list to skriftlig+mundtlig), no content |

## Recommended build order for the next slice

Following the same "one full vertical slice before breadth" approach used
for Modul 2 reading:

1. **Modul 2 listening.** Reuses the same `Item`/`Construct`/tier
   infrastructure; the only new work is `audioUrl` generation (batch TTS,
   see the README's stack table) and a listening-specific practice UI
   (audio player + comprehension questions, no passage text shown). The
   adaptive engine (`lib/adaptive/engine.ts`) is skill-parameterized
   already — `selectPracticeSet(userId, moduleId, "LISTENING", count)` works
   today, it just has no items to return yet.
2. **Modul 2 writing.** Needs a new `Item.rubricJson` shape (a fixed
   per-tier rubric, not a free-text prompt — see the brief's "guided writing
   tasks with rubric-based feedback, not free writing") and a rubric-scoring
   function parallel to `lib/grading.ts`, since writing responses aren't a
   single correct-answer check.
3. **Modul 2 speaking.** Structured interview-style prompts with
   self-recording; needs browser audio capture and storage (same
   access-control pattern as `storage/reportcards/`), no auto-grading —
   scored qualitatively against a rubric shown to the learner, similar to
   writing.
4. **Modul 2 mock exam, full three-discipline version.** Today's
   `/exam/reading/[moduleId]` only runs the reading discipline. Once writing
   exists, extend `app/api/exam/start/route.ts` to a multi-discipline
   session (or keep them as separate timed sessions per discipline, which
   is arguably closer to how the real modultest is structured — worth
   deciding once writing/speaking are real).
5. **Modul 3, then 4, then 5 (PD3) content**, each following the same
   pattern: populate `lib/content-gen/modul{N}-{skill}.ts`, extend
   `lib/dashboard.ts`'s `CONTENT_READY` list, seed, done. Modul 5 additionally
   needs its own higher-stakes exam-simulation UI per the brief (distinct
   framing from the Modul 2–4 mock modultest, not just a relabeled version) —
   `ExamSession.examType: "PD3"` already exists in the schema for this.
