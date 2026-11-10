# Installed versions and verification limits

Recorded 2026-11-10 from installed workspace manifests/lockfile. These are measured installed versions, not claims about latest releases. Node 26.13.0 and pnpm 9.12.0 were available in this environment; engines require Node >=22.12.0. No system runtime was installed or replaced.

| Component | Pinned version |
| --- | --- |
| React / React DOM | 19.3.1 |
| TypeScript | 5.9.3 |
| Vite | 8.3.5 |
| Vitest | 5.1.0 |
| Dexie / reactive hooks | 4.4.7 / 4.4.0 |
| Zod / ULID / Temporal polyfill | 4.6.7 / 3.0.2 / 0.5.1 |
| React Router DOM | 6.30.6 |
| react-hook-form | 7.91.0 |
| Radix Dialog / Phosphor | 1.3.1 / 2.1.10 |
| Tailwind / Vite adapter | 4.3.4 |
| Biome / dependency-cruiser | 2.6.4 / 18.7.2 |
| Playwright / axe integration | 1.64.1 / 4.14.0 |
| Testing Library React / fake-indexeddb | 16.3.3 / 6.2.7 |

All direct versions are exact; pnpm-lock.yaml records transitive resolution. Installation succeeded offline with 158 cached packages. `enhanced-resolve` is pinned to cached compatible 5.26.0 instead of unavailable 5.26.1. The normal online registry DNS was unavailable. No vulnerability-audit result is claimed; run an actual audit when connectivity is available.

Primary API sources consulted: [React versions](https://react.dev/versions), [Vite guide](https://vite.dev/guide/), [Dexie transactions](https://dexie.org/docs/Dexie/Dexie.transaction()). Installed package manifests/types establish exact local APIs; online verification of every dependency release was unavailable.

Bundled unmodified Noto Sans/Serif regular/bold faces have local font metadata version 2.015 and embedded SIL OFL 1.1 notices. Included license follows the font's own metadata, not a conflicting distribution-level Apache notice. [UI/UX evidence](UI-UX-REVIEW.md) records glyph/contrast checks and the installed UI UX Pro Max skill hash.

Build warnings: a 500 kB chunk warning and Radix client-directive notices remain; actual Android startup is unmeasured. These warnings do not establish a security finding or a failed build. No Git, CI, tag or deployment was performed.
