# 01 — Product requirements

Status: **planned**. Combined Phase 0–1 local implementation is authorized; no release gate is complete. This document owns intended behavior and scope. Workflow and privacy belong to [AGENTS](../AGENTS.md).

## 1. Product and delivery

Gün Gün is a Turkish, single-user, Android-first personal planner. Start with an offline phone-first PWA: no account, server, analytics, advertising, or runtime network requests. Installation/update may download app files. User records stay on the device. Prefer quick actions, readable screens, and neutral language.

| Delivery | Scope |
| --- | --- |
| MVP, 0–3 | Foundation, local data, encrypted backup; events and tasks; habits, manual time, optional task focus and weekly reflection |
| 4–5 | Home workouts; recipes, meals, calculations from manually known nutrition values |
| 6 | Family time, memories, goals and optional task/habit links |
| 7–9 | Accounts, manual rates, income/expenses, recurring entries, cards, installments, savings, receipts |
| 10 | Statistics, budgets, financial goals, optional app lock |

This table defines approved scope. Phase 0–1 code is locally implemented with a pending acceptance gate; later capabilities remain **planned**. Phase dependencies and **decision required** items are owned by the [roadmap](06-ROADMAP.md). **Deferred** means no delivery commitment.

## 2. Daily plan and tasks — Phases 1–2

- Onboarding explains local-storage and backup risks. Routine preferences are optional and editable; never seed personal routines.
- Today shows the date, next timed event, short daily plan, separate tasks, habit progress, and separate time totals. Hide later-phase areas until available. Empty sections invite a first entry.
- Events have day/week/month views, timed or flexible scheduling, and one-off or recurring rules. Show conflicts; suggestions write nothing without confirmation. Event and task completion are separate.
- Repeat options in Phase 1: once, daily, selected ISO weekdays, or monthly from the start date. Monthly repeats clamp to month end without changing the original anchor day. No custom intervals/yearly repeats.
- Series edits take effect from the current local date (or their future start date), preserving earlier schedule versions and completed occurrence snapshots. No single-occurrence rescheduling override in this delivery.
- Timed events use positive integer-minute durations; flexible events do not generate time conflicts. Timed intervals are half-open: touching endpoints do not conflict; crossing midnight is supported. Suggestions require explicit confirmation.
- Preserve each completed recurring occurrence at its original scheduled date/time after recurrence edits.
- Tasks require title and due date. Time, description, checklist, and duration estimate are optional. A due date is not a reserved event block.
- Support one selected priority task for a day. Show it first in Tasks; order other tasks by due date. Use existing checklists for small starting steps; no second subtask system or fixed daily task limit.
- Let users review unfinished tasks together, select tasks, preview old/new dates, and explicitly confirm a date move. No automatic postponement or batch recurrence editing. Preserve completion history.
- Complete/reopen tasks with every completion cycle retained. Timed tasks support read-only `.ics` export. Do not imply that Gün Gün sends closed-app notifications.

## 3. Habits, time, and focus — Phase 3

- Habits have a name, user-defined unit, and optional daily target. Sum multiple dated entries; preserve values above target. Missing days are not zero or failure. No streak/repair requirement.
- Users enter one optional screen-time total per day and separate durations for chosen activities. Activity totals may exceed screen time. Never add the two totals; compare only days with data. No automatic phone screen-time access.
- Offer an optional focus timer linked to a task and retain session history. The user chooses the duration; no mandatory Pomodoro schedule.
- Allow only one active session, including a paused session. Exclude paused time. Persist timing information so leaving/reopening the app uses elapsed time rather than counting background ticks. Never credit time beyond the chosen target automatically.
- Ending a session does not complete its task. Focus is not automatically added to screen time or manual activities. No alarm or notification guarantee while closed.
- Offer a short optional weekly reflection: what helped, obstacles, next step. No score, streak penalty, or mandatory survey.

## 4. Exercise — Phase 4

- Start with bodyweight and resistance bands; gym support can follow. Support user exercises/images/programs and independent editable copies of a small, source-verified starter template set.
- Templates are not personalized health advice. Record dated sessions, movements, sets, repetitions or duration, resistance, and units.
- While recording, show the previous comparable workout. Compare only the same movement, measurement, and resistance definition. A previous result is a reference, not a new performed set.
- Later program/template/exercise edits must not rewrite old workouts or other copies.
- No calorie-burn estimate, automatic load increase, or health integration.

## 5. Recipes and nutrition — Phase 5

- Store recipes, ingredients, preparation steps, portion/yield information, and local images. Keep reusable recipes distinct from dated meals.
- Users enter known nutrition values per 100 g, per 100 ml, or per serving. Calculate only from entered values and compatible quantity units.
- Do not infer grams from spoons/cups, infer density, or assume cooked/raw equivalence. Serving calculations require an explicit compatible serving definition.
- Missing nutrients remain missing; show known sums as incomplete when inputs are missing or incompatible. An explicitly entered zero remains zero.
- Save consumed quantities, units, measurement bases, and values with each meal. Recipe edits cannot change past meal totals.
- No online food lookup, photo estimation, automatic diet advice, or health/weight-loss guarantee.

## 6. Family, goals, and money — Phases 6–10

- Family: planned time blocks, weekly choices, dated memories, and optional local images. Photos are not required to record family time.
- Goals: categories, status, dated notes, optional task/habit links from Phase 6. Pausing a goal preserves history.
- Money: TRY, USDT, gram-gold accounts; manual rates; income/expenses, salary catch-up, recurring expenses, cards, installments, statements, monthly savings, receipt images/search/monthly summaries.
- Transfers and card payments must not count as a second expense. Preserve original financial facts across later edits; exact arithmetic and history rules belong to the [data model](05-DATA-MODEL.md#5-money).
- Keep statistics, budgets, financial goals, and optional lock in Phase 10. A lock must have an explicit protection/recovery boundary; do not claim it encrypts local data by default.

## 7. Backup and shared requirements

- Encrypted `.gungun` backup is available from the first saved record. Preview validated contents before restore; overwrite requires explicit confirmation. No MVP merge. Any failed/cancelled restore leaves current data unchanged.
- Explain that forgotten passwords make backups unreadable and erased browser data without backup is lost. Offer a recovery backup before overwrite.
- Permanent clear-all is deferred; event deletion is recoverable. Confirmed backup overwrite remains available.
- Full backups include local photos when their phases arrive. Any photo-free option must identify omitted content. Do not promise file retention merely because download/share started.
- Turkish UI, Monday-start weeks, `Europe/Istanbul` time. UI wording follows [AGENTS](../AGENTS.md); data safety and calculation rules belong to [05](05-DATA-MODEL.md).
- Three visual themes, shared structure, and accessible controls follow [03](03-DESIGN.md). Offline, encryption, and restore protocols follow [04](04-ARCHITECTURE.md).
- The intended first-day path is plan/task, habit/time, and backup. Four-week retention and usability require future user observation; no result is established.

## 8. Deferred scope

No multi-user support, social features, bank integration, automatic screen-time access, AI planning/recipes, runtime cloud calls, or automatic nutrition estimates in MVP/v1. Reliable closed-app reminders, on-device receipt OCR, synchronization, and Android packaging require separate decisions. Capacitor is a later evaluation candidate; no backend is planned.
