# 02 — Screens and flows

Status: Phase 0–1 screens implemented locally; browser/device acceptance remains pending. Later-phase screens are planned. [01](01-PRD.md) owns behavior, [03](03-DESIGN.md) owns visuals, and [07](07-TEST-PLAN.md) owns acceptance IDs.

## 1. Navigation and common states

MVP bottom destinations: Today, Plan, Records, More. Records contains Habits and Time; task focus/history and weekly reflection arrive in Phase 3. Later areas appear only in their owning phase. These English labels describe destinations; actual Turkish UI strings belong only in the future `apps/web/src/i18n/tr.ts`.

Today > Add offers event, task, habit-progress, and time entry when their phases are available. Back returns to the previous screen; leaving a dirty form requires discard confirmation.

Every flow needs an empty invitation, validation/error state preserving input, successful-save feedback, and recoverable deletion/undo where applicable. Cancelled previews and suggestions write nothing. Hidden swipe gestures cannot be the only way to act. Storage failures must explain backup/storage options without discarding records.

## 2. Foundation — Phase 0

Only Today and More are planned to function initially; Plan and Records reserve disabled navigation positions. Today explains local data and links to Settings. More contains Settings, Backup/Restore, storage status, and About.

- Settings saves theme and appearance separately, shows the fixed time zone and current device storage/persistence status.
- Backup asks for a password twice, explains password loss and strength, then offers native file download/share. Show last-backup information and ask the user to verify the file in Files.
- Restore selects a file, checks/decrypts it, previews record/media counts and size, offers a recovery download, and requires explicit overwrite confirmation. Report success only after commit.
- Wrong password, corruption, unsupported version, stale preview, transaction failure, or cancellation leaves current data unchanged. Permanent clear-all is deferred and must not appear in this delivery.

## 3. Today, Plan, and tasks — Phases 1–2

| Screen/action | Content and result |
| --- | --- |
| Onboarding | Explain local-data risks; optional editable routine preferences; open Today |
| Today | Date, next timed event, short chronological plan, separate Tasks section, habits, separate time totals |
| Plan: day/week/month | Day separates timed events, flexible events, and due tasks; week is seven vertical days; month shows density and opens a day |
| Event form/detail | One-off or recurrence, date, time/flexible, duration, category, note; conflict identifies both events and requires confirmation before a move |
| Event history | Complete/review one occurrence; preserve its original schedule after recurrence edits |
| Task form/detail | Required title/due date; optional time, estimate, description, ordered checklist; save, edit, complete/reopen, history, timed calendar export |
| Daily priority | Choose one task for the day; show first in Tasks, followed by other tasks ordered by due date |
| Unfinished-task review | List unfinished tasks; select items and target date; preview each old/new date; confirm or cancel together |

Checklist completion does not complete the parent task. Completed tasks remain findable in history even if omitted from Today. Date changes preserve completion history and do not batch-edit recurring events. Priority lifecycle and move-field details are [Phase 2 prerequisites](06-ROADMAP.md#4-decisions-required-before-the-owning-phase).

## 4. Records — Phase 3

- Habits: name/unit/optional target, today's sum, dated entries/history, add/edit/delete. Show missing days separately from numeric zero.
- Time: date, optional screen-time total, user-labeled activity durations, separate totals and comparisons where both dates have data.
- Task detail > Focus: choose duration, start/pause/resume/end, show remaining/credited time and session history. If another session is active/paused, identify it rather than starting a second one. On return, reconcile persisted timing before displaying the session.
- Focus ending leaves task state unchanged. Keep focus totals separate from manually entered time. No closed-app alarm promise.
- Records > Weekly reflection: optional dated weekly entry for what helped, obstacles, and next step; editable history without score or missed-week penalty.

## 5. Later screens — Phases 4–10

| Area | Entry/detail | Today/Plan relationship |
| --- | --- | --- |
| Exercise, 4 | Records > Exercise; source template or independent program copy; image; session sets/reps/duration/resistance; previous comparable session beside entry; history | Optional workout event; upcoming session |
| Nutrition, 5 | Records > Nutrition; recipe ingredients/steps/yield/image; known values with basis; consumed quantity/unit; incomplete-total indicators; dated meal snapshot | Entered daily totals; optional meal event |
| Family, 6 | Plan > family block; dated memory/image/history; weekly choice | Timed block; memory/note access |
| Goals, 6 | Records > Goals; category/status/dated notes; optional task/habit link control in their details | Optional short note prompt |
| Money, 7 | Accounts, manual rates, transaction type/amount/date; income/expense and recurring history | Upcoming payment; due date on Plan |
| Cards/savings, 8 | Purchase, installment schedule, statement, payment, monthly saving; transparent breakdown | Upcoming obligations |
| Receipts, 9 | Local transaction image, search by entered data, monthly summary | Existing money entry points |
| Advanced, 10 | Statistics/budgets/financial goals; charts with text equivalents; optional lock with protection/recovery explanation | Final entry points require Phase 10 design |

Image selection requests access only when needed; cancellation preserves form text. Deletion is recoverable; full-backup preview counts image bytes, not external links. Detailed money, weekly-choice, and lock interactions remain phase prerequisites.

## 6. Acceptance navigation

Canonical scenarios live only in [07](07-TEST-PLAN.md#2-mvp-scenarios): A1 events; A2 recurring history; A3 tasks; A4 calendar; A5 habits; A6 time; A7 backup; A8 offline; A9 priority/estimates; A10 unfinished-task moves; A11 focus; A12 weekly reflection. Later scenarios S1–I1 are in the [same plan](07-TEST-PLAN.md#3-later-scenarios).
