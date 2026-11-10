# 06 — Roadmap

Status: **implemented locally; combined gate pending**. The user approved combined Phase 0–1 local implementation without Git. No phase gate or release is complete; actual evidence belongs to the implementation plan. This document owns phase allocation and pending decisions. [AGENTS](../AGENTS.md) owns approval and Git workflow.

## 1. Planning gate and phase gates

- [x] Intended scope, flows, model invariants, and future acceptance paths documented.
- [x] Three visual themes approved; Kâğıt default; light/dark/system supported.
- [x] Semantic tokens, licensed production fonts, 12 Today mockups, Settings/form examples and static critique available.
- [x] Combined Phase 0–1 plan approved; local-only and recurrence/reset decisions recorded.
- [ ] Browser/mobile/offline E2E, actual Android checks and user acceptance completed.

A documentation checkbox is not an implemented application phase. Phases 0–1 form one approved delivery; foundation checks precede daily-plan integration without an intermediate approval pause. Other phases remain separate. Each coding gate requires observed `pnpm check` results when defined, applicable acceptance/offline tests, migration/old-backup/failure evidence for data changes, and mobile/accessibility critique for UI changes. Review 360/412 px light/dark, enlarged text, focus, and reduced motion. Real Android installation/file/storage/startup proof is required where applicable. Git and remote CI are deferred; separately authorized future transfer requires appropriate checks and user review before tag/merge/publication; no such action is authorized by this document.

## 2. MVP phases

| Phase | Planned delivery | Dependencies and proof |
| --- | --- | --- |
| 0 — Foundation and backup | Establish local private-file/backup protection (Git deferred); review exact advisory-tool sources/conflicts; pnpm/strict TS/local automated checks; native offline shell; theme/appearance, local schema, storage status, encrypted backup/restore | Resolve Phase 0 decisions. A7/A8; empty/settings backup, tampering, stale preview, atomic rollback, failed worker install, update/open-window safety; installed versions in `docs/VERSIONS.md` |
| 1 — Daily plan | Onboarding, Today, day/week/month events, one-off/recurrence, conflict suggestions, occurrence completion/history | Foundation gate; A1/A2/A7/A8; recurrence uniqueness, original scheduled history, migration |
| 2 — Tasks | Separate required-date tasks, optional estimate, checklist, one daily priority, unfinished-task review/preview/selected date moves, completion cycles/reopen, timed `.ics` | Daily plan gate; resolve priority/move decisions; A3/A4/A9/A10 plus A7/A8 and task/history migrations |
| 3 — Habits, time, focus | Unit habits/targets/history, separate manual screen/activity time, optional task focus with persisted session history, optional weekly reflection | Tasks gate; resolve session/review rules; A5/A6/A11/A12 plus A7/A8; concurrency and return-after-gap proof |

## 3. Later phases

| Phase | Planned delivery | Dependencies and proof |
| --- | --- | --- |
| 4 — Exercise | Bodyweight/band exercises/images; verified templates, independent programs, session/set snapshots, previous comparable workout | MVP gate; resolve exercise identity/units and media bounds; S1/A7/A8 |
| 5 — Nutrition | Recipes/ingredients/steps/yield/images; known values per 100 g/100 ml/serving; compatible scaling, incomplete totals, meal snapshots | Media foundation; nutrition representation decisions; N1/A7/A8 |
| 6 — Family and goals | Family blocks/weekly choice/memories/local photos; goals/categories/status/dated notes; optional task/habit links | Prior gates; define weekly choice and link lifecycle; F1/G1/A7/A8 |
| 7 — Money foundation | TRY/USDT/gram-gold accounts, manual rates, income/expenses/transfers, salary catch-up, recurring expenses | Resolve financial history/rates/undo; P1/A7/A8 |
| 8 — Cards and savings | Cards/purchases/installments/statements/payments, monthly savings | Money foundation; define accounting/savings semantics; P2/A7/A8 |
| 9 — Receipts and money polish | Local receipt images, search by entered data, monthly summaries, complete backups | Transactions/media; size/retention proof; P3/A7/A8 |
| 10 — Advanced | Statistics, budgets, financial goals, optional app lock | Reliable underlying records; each feature approved separately; I1/A7/A8 |

## 4. Decisions required before the owning phase

These choices are unresolved; the selected capabilities above remain planned. Resolve behavior in [01](01-PRD.md) before detailed screen/model/code changes. Do not treat an open choice as permission to invent behavior.

| Phase | Decision required / start condition |
| --- | --- |
| 0 | Local implementation exists; Git is deferred. Remaining gate: browser/offline/update/axe and actual Android evidence, connected dependency audit, user review. |
| 1 | Recurrence/edit/conflict/history rules implemented and tested locally; application browser/device acceptance remains pending. |
| 2 | Which tasks can be selected for each day's priority; replacement/complete/reopen/delete lifecycle; ordering ties; date-move time retention, stale-preview handling, and due-date validation. No automatic postponement. |
| 3 | Focus precision, clock changes, target-reached/early-end/cancel lifecycle, task deletion and multi-tab transitions; weekly reflection editing/cardinality. Preserve target cap, paused-time exclusion, and separate totals. |
| 4 | Rep-vs-duration sets; movement/measurement/resistance comparison identity; rename/archive snapshots; licensed starter content; media bounds/format migration before photos ship. |
| 5 | Nutrient fields and numeric precision/rounding; serving definitions/yield scaling; compatibility validation and snapshot details. Accepted bases/steps/yield are already product decisions. |
| 6 | Meaning of weekly choice; goal-link cardinality/unlink/delete handling; family-photo relationship and retention details. |
| 7 | Rate snapshot/date and valuation policy; recurring-rule edits versus generated history; transaction undo/balance effects. |
| 8 | Purchase/installment/payment accounting dates; statement rules; monthly savings as plan versus actual movement; undo and duplicate-payment rules. |
| 9 | Search fields/monthly-summary definitions; measured image/resource limits and backup omissions before delivery. |
| 10 | Useful metrics/denominators, budgets/financial-goal behavior, accessible chart choices, lock threat/recovery boundary. |

## 5. Deferred proposals

Reliable closed-app reminders, on-device receipt OCR, automatic synchronization, and Android distribution have no assigned phase. Evaluate Capacitor only after PWA install/offline/file/persistence evidence; preserve explicit encrypted-file transfer and source data. No server need is established. Other excluded capabilities remain in [PRD](01-PRD.md#8-deferred-scope).

Next action: close the combined Phase 0–1 gate before Phase 2–3. The conditional handoff must not turn missing browser/device evidence into a passing result. No Git setup, tag, merge or publication is authorized.

## Combined local implementation

Follow [the approved task plan](10-FAZ-0-1-PLAN.md). Git, remote CI, tags and publication are deferred by the user. Future repository transfer is separately authorized work; local checks remain mandatory. Recurrence and permanent-reset decisions are resolved in the PRD. UI UX Pro Max is mandatory for applicable UI/UX work.
