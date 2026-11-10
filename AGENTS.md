# AGENTS.md — Gün Gün project instructions

Read this file at the start of each session. It governs workflow, privacy, and safety. Start from the [README](README.md) map and read only the source sections needed for the task.

Current state: Phase 0–1 is locally implemented; its final gate remains pending browser/device evidence and user review. The user explicitly chose local-only development without Git; repository creation and GitHub transfer are later work.

## 1. User and communication

- The user is new to software development. Reply in concise, plain Turkish; explain unavoidable jargon once.
- The user chose Caveman style: keep communication short without omitting technical accuracy or safety details. Avoid code dumps. Say what changed, how it was checked, and what remains.
- Ask at most three concise questions at once. State a recommended assumption; decide low-impact details yourself.
- Give copy-ready terminal commands with a one-line explanation when the user must run one.

## 2. Sources of truth

Use [requirements](docs/01-PRD.md) for behavior, [screens](docs/02-SCREENS.md) for flows, [design](docs/03-DESIGN.md) for visuals, [architecture](docs/04-ARCHITECTURE.md) for protocols, [data](docs/05-DATA-MODEL.md) for representation, [roadmap](docs/06-ROADMAP.md) for phases/decisions, and [tests](docs/07-TEST-PLAN.md) for proof. Do not load every document by default.

Never open `docs/PROFIL.local.md`. The user authorized rebuilding Graphify from public project sources only. `graphify-out/` is a derived navigation aid, not product authority; confirm answers against current source documents. Follow `.graphifyignore`: exclude `araştırma/`, `ek.md`, the private profile, secrets, and generated outputs. Never merge the old profile-derived graph/cache into the public graph or read its private contents. Preserve any private archive outside the public project.

[Research](araştırma/README.md) supports decisions; it does not override product sources. Status terms: **planned** = accepted intent, **decision required** = unresolved before its owning phase, **deferred** = no delivery commitment. Planned paths in code formatting are not evidence that artifacts exist.

Project-authored Markdown is written in English; the user-requested root `ek.md` is the Turkish handoff exception. Conversation with the user stays in Turkish. Product UI remains Turkish; its strings belong only in `apps/web/src/i18n/tr.ts`.

This file governs agent workflow, privacy, and safety. Product requirements follow `01-PRD` > `02-SCREENS` > `03-DESIGN` > `04-ARCHITECTURE` > `05-DATA-MODEL` > `06-ROADMAP`; `07-TEST-PLAN` defines verification. A lower-priority document must not contradict a higher-priority one. Stop and report unresolved security, data-loss, user-behavior, or scope conflicts.

Do not invent product behavior. For a requirement whose only missing part is its data representation, propose the smallest model that preserves the stated behavior and record the rationale in `docs/01-PRD.md` or `docs/05-DATA-MODEL.md`.

### Decision changes

Do not silently change an approved decision. Explain the reason, alternatives, and recommendation; get approval before changing product behavior. Update its source document before application code.

## 3. Workflow

1. Work within the approved combined Phase 0–1 delivery; complete foundation checks before daily-plan integration. Phases 2+ remain separate and excluded.
2. The combined Phase 0–1 plan is approved. Execute without another approval between these phases. New product scope still requires approval.
3. After each coding task, run `pnpm check` when the project defines it. Fix failures before continuing. Do not claim an unavailable check ran.
4. Prefer the smallest complete design. Avoid speculative abstractions and unrelated cleanup.
5. Make focused changes. Remove imports or variables made unused by your own change; report pre-existing dead code.
6. Show observable evidence for completion. Reproduce bugs before fixing them.
7. Show combined phase-gate evidence for user review. Do not initialize Git, commit, push, tag, merge, or publish in this local-only delivery.

## 4. Commands

The workspace defines `pnpm install`, `pnpm dev`, `pnpm check` (Biome, TypeScript, Vitest, dependency-cruiser, build), `pnpm test`, `pnpm test:e2e`, and `pnpm build`. The manifest and lockfile exist. A blocked browser command is not a passing check; see the implementation gate record.

## 5. Code and accessibility

- TypeScript strict; avoid `any`. Use type assertions only at validated boundaries and explain why.
- Architecture boundaries are in `docs/04-ARCHITECTURE.md`: `core` stays pure; no DOM, Dexie, or React there; import package entry points only.
- Money uses integer minor units; never decimal `number` arithmetic. Use `BigInt` for exchange calculations. Route date/time rules through `core/time`, not raw `Date` business logic.
- Each write is transactional. Deletes are recoverable soft deletes. Every schema, Zod, or Dexie change needs a migration and tests.
- User-facing strings stay in `apps/web/src/i18n/tr.ts`. Code, paths, and variables use English; comments are short and explain why.
- Keep files at or below 300 lines and functions at or below 50 lines unless splitting would make ownership worse; explain exceptions.
- No committed `console.log`; never log financial data.
- Ask before adding a dependency absent from `docs/04-ARCHITECTURE.md`; state why, alternatives, size, and maintenance cost.
- No unlabeled icon buttons. Touch targets are at least 48 dp; focus is visible; support reduced motion and enlarged text.

## 6. Design

The approved design direction and three themes are defined in [03-DESIGN](docs/03-DESIGN.md). The semantic token handoff and 360/412 px reference gallery exist in `docs/design-options/`; implementation/browser/device checks are separate evidence. Keep screen structure, information order, and controls identical across Serin, Kâğıt, and Dengeli. Kâğıt is the default visual theme. Each supports light, dark, and system appearance.

No emoji, gradients, glass effects, purple/indigo, Inter/Roboto headings, equal-card grids, one radius everywhere, or copied brands. Use semantic color tokens. For UI work, inspect 360/412 px light/dark mockups and document a short critique. UI UX Pro Max is mandatory for every applicable UI/UX design, implementation and review. Its installed skill is `/home/cropsre/.agents/skills/ui-ux-pro-max/SKILL.md`; read it and run relevant mobile/React/web searches. Record rules and conflicts; do not generate a competing design authority. Project decisions prevail; Radix remains approved.

## 7. Security and privacy

- MVP and v1 make no runtime network requests: no analytics, CDN, remote font, or third-party script.
- Never commit API keys/secrets; `.env*` stays out of Git.
- No `dangerouslySetInnerHTML`; user text remains text.
- Backup files (`*.gungun`) and personal data stay out of Git. Any deletion or overwrite of user data requires explicit confirmation.

## 8. Personal data and public repository

The repository is intended to be public. `docs/PROFIL.local.md` and any profile-derived Graphify archive must stay private and outside public commits. The current public-document graph must contain only allowed sources. The user chose local development without Git. Ignore rules are future-transfer protection, not verified Git enforcement. Never initialize Git or alter existing `.git` metadata during this delivery.
- Before any commit, verify `git check-ignore -v docs/PROFIL.local.md`; do not commit if it is not ignored.
- Never copy personal values, names, or family details from that file into code, tests, fixtures, screenshots, commit messages, or documents. Use fabricated demo values.
- The user enters personal values at runtime, not as defaults in the repository.

## 9. Git

Git is deferred by explicit user instruction. If separately authorized later, use the combined `faz-0-1-foundation-daily-plan` branch for this delivery; use one branch per later phase and small Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). Merge/push to `main` only after the phase gate, green CI, and user approval. Never force-push. Tag completed phases `faz-N`; do not leave broken commits on `main`.

## 10. Do not

Expand scope, silently diverge from documents, add unapproved dependencies, claim unverified success, migrate data destructively, include real personal data, or violate design/security rules. Verify changing versions and APIs with official primary sources; mark unverified facts as such.

## 11. Maintenance

Weekly grouped dependency-update PRs are separate maintenance work. Report high/critical `pnpm audit` findings plainly. Record installed versions in `docs/VERSIONS.md` during Phase 0 and update it when versions change.
