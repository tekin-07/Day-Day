# Gün Gün

**Status: Phase 0–1 local implementation, final gate pending.** The application, pinned workspace and local checks exist. Browser E2E and real Android verification have not passed in this restricted environment; do not treat the delivery as accepted or start later phases without closing its gate.

Gün Gün is a Turkish, single-user, Android-first personal planner: offline PWA first, device-local records, no account/server/runtime network. The planned product spans daily planning, habits/focus, exercise, meals, family/goals, and money.

## Read only what the task needs

Start with [AGENTS.md](AGENTS.md), then choose relevant sources. Product authority follows the numbered order; [07](docs/07-TEST-PLAN.md) defines verification.

| Document | Owns |
| --- | --- |
| [01 — Requirements](docs/01-PRD.md) | Purpose, behavior, included/deferred scope |
| [02 — Screens](docs/02-SCREENS.md) | Navigation, actions, empty/error/undo states |
| [03 — Design](docs/03-DESIGN.md) | Themes, typography, accessibility, missing mockups |
| [04 — Architecture](docs/04-ARCHITECTURE.md) | Target stack/layers, offline and backup protocols |
| [05 — Data model](docs/05-DATA-MODEL.md) | Planned entities, calculations, history |
| [06 — Roadmap](docs/06-ROADMAP.md) | Phase dependencies and decisions required |
| [07 — Test plan](docs/07-TEST-PLAN.md) | Future scenarios and requirement trace |
| [08 — Session starter](docs/08-MASTER-PROMPT.md) | Short working prompt |
| [09 — Sources](docs/09-KAYNAKLAR.md) | Research and primary-source access |

Research is supporting evidence, not an alternative specification. **Planned** is accepted intent; **decision required** is unresolved; **deferred** has no delivery commitment. Never read the private profile. The current Graphify graph indexes public project sources, excluding `araştırma/` and `ek.md` under `.graphifyignore`; use it for navigation and verify claims against source documents. Never reuse the old profile-derived graph/cache. Future paths shown in code formatting are not existing files. The requested [Turkish change report](ek.md) records this document-only revision.

## Local use and evidence

Install with `pnpm install --frozen-lockfile`, start with `pnpm dev`, and open the URL printed by Vite. `pnpm check` covers formatting/lint, strict types, unit/integration tests, architecture and production build. `pnpm test:e2e` runs browser/offline/mobile checks; `pnpm verify` runs both. The GitHub Actions workflow runs `pnpm check` and Chromium E2E on pushes and pull requests to `main`. This restricted agent environment cannot listen on local ports or launch Chromium, so browser results must come from a permitted local or CI runner.

See the [implementation and gate record](docs/10-FAZ-0-1-PLAN.md), [installed versions](docs/VERSIONS.md), [design gallery](docs/design-options/index.html), and [conditional Phase 2–3 handoff](docs/11-FAZ-2-3-START.md). Passing CI does not replace real Android checks or user acceptance.
