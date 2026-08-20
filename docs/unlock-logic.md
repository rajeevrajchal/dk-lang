# Module/level unlock logic

Two signals, tracked per `(user, module, skill)` in `ModuleSkillStatus`
(`prisma/schema.prisma`), and never merged:

- **`inAppPassed`** — the learner cleared this app's own timed mock
  modultest for that discipline (`ExamSession`, `examType: MODULTEST` or
  `PD3`). Set only by `lib/unlock.ts#applyInAppExamResult`, which is called
  from `app/api/exam/[sessionId]/complete/route.ts` when a mock exam
  finishes. This is a readiness signal, not a certification.
- **`officialPassed`** — what a confirmed, uploaded report card says. Set
  only by `lib/report-cards.ts#reconcileReportCard`, which runs after the
  learner confirms extracted fields
  (`app/api/reports/[id]/confirm/route.ts`). This is the ground-truth
  record of what SIRI/the sprogcenter actually decided.

## The unlock rule

`lib/unlock.ts#getModuleDashboardState` computes, per module in order:

```
practiceUnlocked(module N) = practiceUnlocked(module N-1) is irrelevant if
  module N-1 is oral-only (Modul 1), otherwise:
practiceUnlocked(module N) = inAppFullyPassed(module N-1)
```

`inAppFullyPassed` requires every required discipline for that module
(`mundtlig`/`læsning`/`skrivning` for Modul 2–4, `skriftlig`/`mundtlig` for
PD3) to have `inAppPassed: true`. An **in-app mock pass alone is enough** to
unlock the next module's practice content — the app never blocks practice
on a verified result, since the whole point is to let the learner prepare
ahead of the next real modultest.

## Reconciliation: the report card always wins

When a report card is confirmed, `reconcileReportCard` sets
`officialPassed` and, if it disagrees with the existing `inAppPassed` value,
sets `discrepancy: true` with a note explaining the mismatch — e.g. the app
thought reading was solid but the real exam said otherwise, or vice versa.
It **never edits `inAppPassed`**: that field stays a faithful record of what
the mock exam actually showed, so the discrepancy itself stays visible
instead of being quietly resolved away. The dashboard
(`app/dashboard/page.tsx`) renders both fields side by side per discipline
(`app − / officiel ✓/✗/–`) plus a `⚠ uoverensstemmelse` marker, so the
learner sees the disagreement rather than a silently overwritten status.

## What's intentionally not automatic

`practiceUnlocked` is driven only by `inAppPassed`, never by
`officialPassed`, on the theory that a learner who's already verified as
having passed a module obviously doesn't need that module's practice
content gated — but this isn't wired up as an alternate unlock path today.
If a verified pass should also open the next module's practice
unconditionally (in case the in-app mock was never taken), that's a
one-line change to `getModuleDashboardState`'s `previousModulePassed`
calculation — left out for now because it wasn't clear that's the desired
behavior versus always wanting the in-app mock cleared for practice-mode
calibration reasons too.
