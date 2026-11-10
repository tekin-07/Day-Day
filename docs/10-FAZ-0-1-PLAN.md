# Combined Phase 0–1 implementation plan

Goal: local-only offline daily planner with settings, encrypted backup and safe recurring-event history. The user approved continuous execution of both phases and explicitly deferred all Git/GitHub work.

## Constraints

Follow AGENTS and docs/01–07. Use only approved dependencies; no runtime network, personal defaults or future-domain tables. UI UX Pro Max is mandatory and project design remains authoritative. Never read the private profile or previous private graph/cache. No permanent clear-all.

## Task checklist and evidence

- [x] Read source contracts and record the combined/local-only authorization.
- [x] Pinned offline workspace and local checks installed (158 cached packages).
- [x] Core recurrence/time/conflict implementation and tests.
- [x] Transactional schema 1/2, fixture, encrypted backup/restore and failure tests.
- [x] UI UX Pro Max research, six palettes, licensed fonts, 12 mockups and form references.
- [x] React screen code, dirty-form guards, persistence and native worker integration. Runtime acceptance is not implied.
- [ ] Run check, browser tests, independent review and fix material findings.
- [ ] Update source status, versions, public graph and handoff prompt.

## Resolved behavior

Once/daily/weekly-selected-days/monthly recurrence; missing month day clamps while preserving anchor. Rule edits preserve earlier schedule versions/completion snapshots. Timed intervals are half-open and support midnight crossing; flexible events do not conflict. Suggestions never write before confirmation. Deletes are soft and undoable. Schema 1 contains settings/meta; schema 2 adds events/completions and onboarding preference. Backup schema 1 remains importable after schema 2.

## Interfaces and ownership

Pure core exports types, time helpers and occurrences/conflicts. Data exports its Dexie singleton, validated writes, backup preview and revision-guarded atomic restore. Web imports package entry points only; all Turkish UI strings live in its translation module. UI/UX evidence and tokens belong to the design source. No future tasks/habits/focus/money implementation.

## Environment and progress

- Git metadata is unavailable and left untouched; user confirmed no Git in this delivery.
- Shell DNS cannot resolve npm registry. Offline installation succeeded from cached packages; exact installed versions are recorded in VERSIONS. Online dependency audit is pending.
- Real Android checks and remote CI cannot be replaced by desktop automation; record them as pending.

## Resume

Inspect checked tasks and command evidence before doing work. Re-run only affected checks after fixes. Complete the combined final review before claiming readiness; never tag/merge/publish.

## Integration evidence — 2026-11-10

`pnpm check` passed: Biome, TypeScript, 41 tests in nine files, dependency-cruiser (55 modules / 132 dependencies), production build. Independent review found weekly-frequency cleanup, first-monthly-preview, scope-prefix isolation and midnight/resume issues; fixes have focused regression tests.

Browser E2E is **blocked**: preview fails `listen EPERM 127.0.0.1:4173`; independent Chromium launch also fails `sandbox_host_linux.cc` with `Operation not permitted`. No desktop screenshot/axe/offline browser result is claimed. Real Android installation, file handling, keyboard, storage, screen reader and startup remain unverified. The phase gate is **not accepted**.

Static design verification passed 90 contrast pairs, four font faces and 16 SVG references. Production build retains a large-chunk warning and Radix directive notices.

Ruling: local-only instruction governed the first gate attempt. The user later authorized this public GitHub repository for CI. Worker source remains one cohesive generated template exceeding the nominal function-line target; splitting it would obscure lifecycle ownership. Its output is tested as executable worker behavior.

## Next session

First rerun check and real browser scenarios in a permitted environment; fix failures and collect device evidence. Inspect current E2E selectors after UI changes. Do not start Phase 2–3 or mark the gate accepted solely because unit/build checks pass. The Phase 2–3 start prompt requires this audit first.

## Gate recheck — 2026-11-10

- `pnpm check` passed: Biome (one informational redundant-fragment note), TypeScript, 41 tests across nine files, dependency-cruiser (55 modules / 132 dependencies), and production build. Build still reports the existing large-chunk and Radix module-directive notices.
- `pnpm test:e2e` was run and blocked before browser tests: Playwright could not start its configured preview server. Reproduced the environment restriction with `pnpm dev --host 127.0.0.1`: `listen EPERM` on `127.0.0.1:5173`. This is not a browser pass.
- Graphify freshness checked: all 76 tracked source hashes match current files; no tracked source is missing. The graph has 545 nodes / 1,083 edges and its 2026-11-10 report identifies its corpus-check and token-cost limits. `.graphifyignore` excludes research, `ek.md`, private profile and generated output; neither the private profile nor research appears among indexed sources. No rebuild was needed.
- Gate remains **not accepted**. Real Android evidence and user acceptance remain pending; browser/offline E2E also remains blocked by this environment. Do not begin Phase 2–3 until these conditions are closed.

## User-run browser evidence — 2026-11-10

The user ran `pnpm test:e2e` on a browser-capable machine: 2 of 16 passed, 14 failed. Trace/error context showed three causes:

- Dirty-form test's add button locator matched both the Today action and empty-state action. Scope it to the first matching action, as the existing shared helper already does.
- Twelve theme cases used `getByLabel` against nested select labels; the trace snapshot showed the labelled comboboxes present. Use accessible combobox role/name locators.
- Offline reload failed at the root document. The generated worker's `ASSETS` list omitted `index.html`, so navigation fallback had no app shell. A new regression test failed before the fix; `workerSource` now always precaches the shell.

After fixes, `pnpm check` passed with 42 tests. GitHub Actions browser run is pending. The phase gate remains **not accepted** until CI browser/offline/mobile evidence, Android evidence, and user acceptance are complete.
