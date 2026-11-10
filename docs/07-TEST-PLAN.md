# 07 — Test and quality plan

Status: verification contract with a runnable local suite. Phase 0–1 local checks passed; browser/device acceptance remains pending. Future-phase scenarios remain planned. This document owns acceptance identifiers and future proof requirements, not passed results.

## 1. Verification approach

When Phase 0 defines the tools, `pnpm check` must run Biome, TypeScript, Vitest, dependency-cruiser, and build. Use core tests for dates/recurrence/calculations; Vitest + `fake-indexeddb` for transactions/migrations/backup; Testing Library for labels/focus; Playwright for mobile/offline flows; axe with zero critical/serious findings. These commands are defined. Restricted-environment E2E failures are recorded as blocked, never passed.

Every data phase extends A7/A8 and migration fixtures. Every UI phase checks 360/412 px light/dark across themes, 130% text, focus, reduced motion, and a short critique under [03](03-DESIGN.md). Verify local font licenses/glyphs/loading when fonts are selected.

## 2. MVP scenarios

| ID | Future action | Required result | Phase |
| --- | --- | --- | --- |
| A1 | Onboard, add one-off/recurring event, view Today/Plan, decline/apply conflict suggestion | Matching date/time; distinct timed/flexible items; no recurrence duplicates; no suggestion write before confirmation | 1 |
| A2 | Complete occurrence, edit recurrence, inspect history, soft-delete event | Original scheduled date/time retained; other occurrences independently completable; history survives deletion | 1 |
| A3 | Create task, use checklist, complete/reopen/complete again, change due date | Required title/date; optional data retained; item does not complete parent; every completion cycle survives edits | 2 |
| A4 | Export timed task to calendar | Title/date/time/UID/time zone parse correctly; no state change; no timed alarm for untimed task or app-notification promise | 2 |
| A5 | Enter/correct habits and inspect absent day | 12+8 pages = 20; language 15 minutes; correction updates sum; above-target retained; absence differs from zero | 3 |
| A6 | Enter screen/activity durations and compare days | 130 screen minutes and 35 activity minutes remain separate; activities may exceed screen total; compare only recorded days | 3 |
| A7 | Export, tamper, cancel, restore, race another write, inject transaction failure | Generated crypto/header match architecture; invalid password/file/version/media, stale preview, cancellation, or failure leaves current data unchanged; valid confirmed restore is atomic | 0 and every data phase |
| A8 | Install/update, relaunch in airplane mode, use applicable flows | No runtime network; cached local assets/fonts work; failed install preserves old app; explicit update protects dirty forms/open older windows | Every phase |
| A9 | Add optional estimate, select/replace daily priority, inspect Today | Estimate independent of due time/event duration; at most one priority per day; priority first, other tasks ordered by due date; approved lifecycle tested | 2 |
| A10 | Review unfinished tasks, select subset, preview date changes, cancel/confirm | Cancel writes nothing; confirmed subset moves atomically; unselected tasks, recurring events, and completion history unchanged; stale preview handled | 2 |
| A11 | Start focus, attempt second from another tab, pause/resume, leave/reopen, pass target, end | One active/paused session; paused time excluded; persisted timing reconciles; automatic credit capped at target; history retained; task/manual time unaffected | 3 |
| A12 | Save/edit optional weekly reflection and skip a week | What helped/obstacles/next step retained under approved editing rule; no generated failure, score, or streak penalty | 3 |

A11 also requires clock-change, early-end/cancel, target-reached lifecycle, and task-deletion cases after the [Phase 3 decisions](06-ROADMAP.md#4-decisions-required-before-the-owning-phase).

## 3. Later scenarios

| ID | Required result | Phase |
| --- | --- | --- |
| S1 | Source/license shown; program copy edits leave template/other copies/old workouts intact; previous matching session accessible; incompatible movement/unit/resistance not compared; image bytes restored | 4 |
| N1 | Steps/yield retained; known values scale per compatible 100 g/100 ml/serving quantities; no spoon/density inference; missing nutrient remains incomplete, explicit zero preserved; recipe edits do not alter meal snapshots; images restored | 5 |
| F1 | Family block can move to selected day/week; dated memories and optional photos persist/sort; picker cancellation keeps text; undo/restore preserves links; weekly choice follows approved definition | 6 |
| G1 | Goal notes sort; optional task/habit links persist; pause/resume preserves history; unlink/delete follows approved rule; older MVP records migrate without forced links | 6 |
| P1 | 125.5 USDT × TRY 41.35 = TRY 5,189.43; integer scales/rounding correct; transfers not spending; three-month catch-up produces one row per period even on retry; month-end valid; rate edits preserve facts | 7 |
| P2 | TRY 1,000 / 6 = 5 × 166.66 + 166.70; TRY 12,999 / 6 = 6 × 2,166.50; payments not second expense; leap/month-end dates, approved savings/undo/duplicate rules correct | 8 |
| P3 | Receipt/transaction links and actual image bytes restored; search/monthly totals trace to entered data; corrupt/missing media aborts; full-storage error leaves no half record | 9 |
| I1 | Statistics/budgets/financial goals trace to source rows with known denominators/units and missing-data markers; charts have text equivalents; lock limits/recovery explained and tested | 10 |

## 4. Cross-cutting failure and device proof

- Inject transaction failures during task/item, focus transition, meal/image, transaction, and restore writes; no partial state.
- Verify generated KDF/salt/IV/cipher/tag/AAD against [04](04-ARCHITECTURE.md#5-security-and-backup-protocol). Tamper with every authenticated header field/ciphertext; authentication/validation fails before overwrite. Bound hostile file size/KDF work.
- Test empty/settings/full backups, recovery download, unsupported versions, every supported migration/old backup, local metadata preservation, relationships, and media omissions/warnings when offered.
- Recover deletes and preserve task cycles/event schedules/meal and workout snapshots. Cover concurrent writes and stale previews.
- No unlabeled icon action, color-only status, invisible focus, target below 48 dp, clipped enlarged text, or essential animation.
- On real Android: install/relaunch offline; deny storage persistence; handle quota failure; verify Files save/share/reselect; `.ics` local time; keyboard/back/dirty form; TalkBack; startup measurement. Photo phases add camera/gallery and media counts. Use fabricated data; never clear real records.
- Observe first useful action, replanning after disruption, return after a gap, and eventually four-week retention/usability. These require future user sessions, not passing unit tests.

## 5. Requirement trace

Each row connects the owning PRD section to screen, model, phase, and scenario. Architecture supplies shared protocols; it does not redefine behavior.

| Feature | PRD | Screens | Data model | Phase | Proof |
| --- | --- | --- | --- | --- | --- |
| Offline shell/settings/themes/storage | §1, §7 | §2 | §2 | 0 | A7/A8, UI/device checks |
| Encryption/restore/recovery | §7 | §2 | §2, §8 | 0+ | A7 |
| Onboarding/events/conflicts/calendar views | §2 | §3 | §3 | 1 | A1 |
| Recurring completion history | §2 | §3 | §3 | 1 | A2 |
| Tasks/checklist/completion cycles | §2 | §3 | §3 | 2 | A3 |
| Timed export | §2 | §3 | §3 | 2 | A4 |
| Estimate/daily priority | §2 | §3 | §3 | 2 | A9 |
| Selected unfinished-task move | §2 | §3 | §3 | 2 | A10 |
| Habit quantities/targets/history | §3 | §4 | §4 | 3 | A5 |
| Separate manual time | §3 | §4 | §4 | 3 | A6 |
| Focus/session history | §3 | §4 | §4 | 3 | A11 |
| Weekly reflection | §3 | §4 | §4 | 3 | A12 |
| Exercise/copies/comparison/snapshots | §4 | §5 | §6 | 4 | S1 |
| Recipe steps/yield/nutrition/meal snapshots | §5 | §5 | §7 | 5 | N1 |
| Family time/choice/memories/photos | §6 | §5 | §8 | 6 | F1 |
| Goals/notes/action links | §6 | §5 | §8 | 6 | G1 |
| Accounts/rates/transfers/recurring money | §6 | §5 | §5 | 7 | P1 |
| Cards/installments/payments/savings | §6 | §5 | §5 | 8 | P2 |
| Receipts/search/monthly summary | §6 | §5 | §5, §8 | 9 | P3 |
| Statistics/budgets/financial goals/lock | §6 | §5 | §5, §8; detailed model pending | 10 | I1 |

Planning checks: no lost baseline scope; decisions/proposals/deferred items agree; local file/section links resolve; no implementation evidence is invented; the private profile and previous private Graphify archive remain untouched. Current document-review results belong in the requested [Turkish handoff](../ek.md), not in application test counts.
