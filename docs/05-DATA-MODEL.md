# 05 — Data model and calculation rules

Status: Phase 0–1 schema 2 is implemented locally; later-domain structures remain planned and final browser/device acceptance is pending. This document owns representation and calculation/history invariants for [01](01-PRD.md). Add stores only in their roadmap phase. Every schema/Zod/Dexie change needs validation, migration, prior-fixture tests, and supported old-backup tests.

## 1. Shared representation

`Id`: ULID. `LocalDate`: `YYYY-MM-DD`; `LocalTime`: `HH:mm`; `WeekKey`: ISO week. Instants: UTC epoch milliseconds. User records have `id`, `createdAt`, `updatedAt`, optional `deletedAt`. Business dates go through `core/time`; Monday starts the week in `Europe/Istanbul`.

Manual durations are non-negative integer minutes. Focus also needs timestamp precision; its persisted elapsed representation is a Phase 3 decision. Money is safe integer minor units. Validate finite values and units at boundaries; never encode unknown values as zero.

Writes and multi-row actions are atomic. Soft deletion is undoable; parent deletion cannot silently erase media or history. Validate relationships even for hidden deleted records. Retention/purge policy remains undecided; no automatic purge.

## 2. Foundation — Phase 0

Only `settings` and `meta`, schema version 1:

| Store | Planned fields and rules |
| --- | --- |
| `settings` | Singleton `id=main`; `theme=cool|paper|balanced` (default `paper`), `appearance=light|dark|system` (default `system`), fixed `timeZone=Europe/Istanbul`, `createdAt`, `updatedAt`, nullable `lastBackupAt`; no personal defaults |
| `meta` | Local singleton: schema version, random ULID `installationId`, non-negative revision, `persistenceAttempted`; never exported |

Defaults stay in memory until explicit preference save or successful backup download/share records its timestamp. Timestamp reporting may create neutral settings even for an empty export; it does not prove the file was retained. Preference patches merge with the latest row transactionally.

Query storage permissions/estimates from the current device; restore cannot grant persistence. Schema 1 creates stores from an uninitialized database; no earlier released schema exists. The fabricated `packages/data/fixtures/schema-1.json` exists; schema-1 database migration and encrypted old-backup import are exercised by the local test suite. Restore revision/atomicity and exact backup payload are owned by [04](04-ARCHITECTURE.md#6-restore-contract).

## 3. Events and tasks — Phases 1–2

Phase 1 schedule representation: each event holds `versions`, including its current schedule, with stable `effectiveFrom` dates. Creation starts at `startDate`; editing applies from the current local date or a future start date. Earlier versions and completion snapshots remain intact. This prevents deletion/undo audit timestamps from changing historical schedules. Conflict previews check the first applicable proposed date; Today/Plan report conflicts on viewed dates, including adjacent-day overlap. They do not claim infinite-series collision auditing.

Phase 1 extends `settings` with optional onboarding/routine preferences. Define only fields needed by the approved flow; keep blanks editable and never seed personal routines.

| Store | Planned fields | Invariants |
| --- | --- | --- |
| `events` | Title, one-off date or recurrence rule, optional time, duration, category, lifecycle status, note | One-off/recurring distinct; lifecycle is not occurrence completion; suggestions do not write |
| `eventOccurrenceCompletions` | `eventId`, scheduled local date/time (time nullable), completion instant, audit fields | Unique event/date; original schedule snapshot survives recurrence edits and parent soft deletion; no future uncompleted rows |
| `tasks` | Title, due date, optional time/description/`estimatedMinutes`, status, current `completedAt` | Title/date required; positive integer estimate when entered; complete/reopen atomic with history |
| `taskCompletionHistory` | `taskId`, `completedAt`, optional `reopenedAt`, audit fields | One row per completion cycle, unique task/completion instant; never erase on date edits |
| `taskItems` | `taskId`, text, order, completion state | Existing checklist owns small steps; does not auto-complete parent; soft-delete with parent atomically |
| `dailyPriorities` | Local date, `taskId`, audit fields | Unique active selection per day; separate dated relation avoids turning priority into a permanent task rank |

An open task past its due date is overdue. Completion updates task state and appends history together. Reopening clears current `completedAt` and sets `reopenedAt` on the matching history row, without deleting it. Recurrence edits retain historical occurrence date/time.

Selected-task date moves update only selected tasks after a before/after preview and confirmation, in one transaction. Keep completion rows intact. No recurrence batch edits. Priority replacement/completion/deletion behavior, same-date ordering, move-time handling, and preview concurrency details must be settled before Phase 2; no extra rescheduling-history entity is assumed.

Calendar export derives title/date/time/UID/zone without writes; [04](04-ARCHITECTURE.md#4-calendar-and-media) owns its protocol.

## 4. Habits, manual time, focus, reflection — Phase 3

| Store | Planned fields | Invariants |
| --- | --- | --- |
| `habits` | Name, unit, optional daily target, archive state | Unit immutable after first entry; use a new habit for a new unit |
| `habitEntries` | `habitId`, date, positive quantity | Sum active entries per date; no row means no entry; preserve over-target amounts |
| `timeDays` | Date, optional screen-time minutes | Unique date; absent is not zero |
| `timeActivities` | Date, user label, minutes | Independent from screen time; total per label/date |
| `focusSessions` | `taskId`, chosen target, state, start/end instants, accumulated active duration, running-segment start when applicable | One active/paused session globally; persist transitions transactionally; retain history |
| `weeklyReflections` | `weekKey`, what helped, obstacles, next step, audit fields | Optional weekly content; no generated entries for missed weeks |

Habit display: without target show quantity; with target show total/target without capping stored values. Compare time only when both dates have data; never combine screen, activity, and focus totals automatically.

Focus credit is the smaller of target duration and accumulated active time plus a current running segment. Paused intervals contribute zero; reopening uses persisted timestamps. Ending does not mutate task completion. Segment precision, clock changes, target-reached lifecycle, early-end behavior, task deletion, and reflection editing/cardinality are Phase 3 prerequisites.

## 5. Money

Planned stores, Phases 7–9: `accounts`, `rates`, `transactions`, `incomeSources`, `fixedExpenses`, `creditCards`, `installmentPlans`, `savingsMonths`, `receipts`, `snapshots`.

- Positive safe integer amounts; transaction type determines direction. Currency scales: TRY 2, USDT 6, XAU_G 3.
- Exchange uses `BigInt` and half-up rounding at the target scale. Fabricated vector: 125.5 USDT × 41.35 TRY = 5,189.43 TRY.
- Transfers and card payments are balance movements, not a second expense. Preserve original transaction facts; never retroactively apply a changed rate to them.
- Installments: `base=floor(total/n)`; remainder only in final installment. TRY 1,000.00 / 6 = 5 × 166.66 + 166.70; TRY 12,999.00 / 6 = 6 × 2,166.50.
- Salary/recurring-expense catch-up on open uses unique period keys; retrying cannot duplicate a period. Statement/due days clamp to month end.
- Rate-snapshot selection, recurring-rule edit policy, undo/balance effects, card accounting dates, and monthly savings semantics remain phase prerequisites. Do not infer issuer interest/fees.

## 6. Exercise — Phase 4

| Entity | Planned representation |
| --- | --- |
| `exercise` | Name, type (`bodyweight`, `band`, later `gym`), image ID, archived state |
| `workoutTemplate` | Title, verified source URL/access date, non-personalized-advice notice, ordered movements |
| `program` | Independent copy of template/program content |
| `workoutSession` / `exerciseSet` | Date/program reference plus performed movement/measurement/resistance snapshots, ordered sets, reps or duration, units |

Snapshots are the smallest way to keep past workouts stable when programs/exercises change. Compare only the same movement, measurement, and resistance definition; different band colors/manufacturers are not an assumed common load. Define exact identity/version and rep-vs-duration representation before Phase 4. Previous comparable entries are read-only references until the user records a new result.

## 7. Recipes and meals — Phase 5

| Entity | Planned representation |
| --- | --- |
| `recipe` | Name, ingredients/quantities/units, ordered preparation steps, explicit portion/yield information, image ID |
| Nutrition value set | Optional known nutrients, explicit basis (`per100g`, `per100ml`, `perServing`), compatible serving definition when used |
| `meal` / `mealItem` | Date/name, optional recipe reference, consumed quantity/unit, snapshot of used basis/values/serving definition and recipe data needed to interpret the meal |

For compatible units, scale each known nutrient by consumed quantity / basis quantity. A 100 g or 100 ml basis uses 100 in that same unit; a serving uses an explicit compatible serving quantity. Never infer mass/volume/density or spoon/cup conversion. Incompatible or missing input cannot produce a complete total. Track completeness per nutrient, preserving explicit zero. Recipe edits do not rewrite meal snapshots.

Nutrient list, decimal representation/precision/rounding, serving/yield scaling, and validation details are Phase 5 prerequisites. Do not invent a nutrient catalog or silently use floating-point money rules for nutrition.

## 8. Family, goals, and media — Phase 6 onward

- `familyBlocks`, `familyNotes`, `weekChoices`: dated time blocks, dated memories/images, weekly selection. Define weekly-choice meaning before choosing its detailed fields.
- `goals`, `goalLogs`, `categories`: status/category and dated notes. Add optional `goalId` to tasks/habits only in Phase 6; no MVP placeholder fields. Pausing preserves notes, links, and historical records. Cardinality and unlink/delete behavior require a Phase 6 decision.
- `media`: owner type/id, MIME, size, blob, audit fields; introduced in Phase 4 and extended per owner phase. Owner/blob changes are transactional. Backup includes active and required soft-deleted history and applicable media.

Protocol/restore behavior is defined once in [04](04-ARCHITECTURE.md#5-security-and-backup-protocol). Use fabricated fixtures only; never read the private profile for defaults or examples.
