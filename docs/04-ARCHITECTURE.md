# 04 — Architecture and technology

Status: Phase 0–1 architecture implemented locally; final browser/device gate pending. Installed versions and limitations are in [VERSIONS](VERSIONS.md). No vulnerability-remediation or clean-audit claim is established. Product behavior belongs to [01](01-PRD.md).

## 1. Structure and approved stack

| Planned layer | Responsibility |
| --- | --- |
| `packages/core` | Pure domain rules: date/time, recurrence/conflicts, task/history, habit/time/focus totals, later calculations |
| `packages/data` | Dexie schema, validated transactions, migrations, media, encrypted backup/restore |
| `apps/web` | React screens/forms, accessibility, Turkish strings, PWA integration |

Device IndexedDB is the data store. No server/account/telemetry/CDN; no `apps/server`. GitHub Pages may host static files. Never create empty future-domain tables.

Approved dependencies: pnpm workspace; strict TypeScript; Vite + React; React Router hash routing; Tailwind semantic tokens; Radix primitives; `@phosphor-icons/react`; react-hook-form + Zod; Dexie + `dexie-react-hooks`; Temporal polyfill restricted to `core/time`; `ulid`; native Service Worker + Vite build manifest; Vitest, Testing Library, `fake-indexeddb`, Playwright, `@axe-core/playwright`, Biome, dependency-cruiser. Install only what the current phase needs. Dependencies outside this list require approval under [AGENTS](../AGENTS.md).

UI UX Pro Max is advisory tooling, not an installed app dependency. Capacitor is a later Android evaluation outside this stack; its plugins/storage/distribution need separate approval. A wrapper does not require a backend. Platform comparisons and explicit PWA-to-APK transfer are in [research](../araştırma/04-platform.md).

## 2. Boundaries and writes

- `core` imports no DOM, React, Dexie, or network APIs. Pass `now` into rules; date/time business logic belongs to `core/time`.
- `data` depends only on `core`; `web` uses package entry points. Enforce boundaries with dependency-cruiser.
- Form/import boundaries use Zod, then core rules, then one Dexie transaction. Multi-row actions, deletes, and restores cannot partially commit.
- Recoverable deletion uses `deletedAt`. Preserve owner/media/history relationships; no automatic purge before retention is defined.
- Merge preference patches with the latest row inside the transaction. Check concurrency invariants inside transactions, including one active focus session across tabs.
- On open/resume, do only required period reconciliation. Future salary/expense catch-up uses unique period keys. Focus uses persisted timestamps; do not depend on continuous background execution or network time.
- Money uses the exact arithmetic contract in [05](05-DATA-MODEL.md#5-money). No financial data in logs.

## 3. Offline installation and updates

Use native browser Service Worker/Cache APIs with a small typed Vite build hook; no PWA plugin or Workbox is specified. This is a planned choice, not an executed dependency-security fix.

- Precache actual HTML, scripts, styles, manifest, 192/512 icons, and local fonts/assets at install/update. Content hashes plus worker source determine a versioned worker/cache.
- Fill a separate cache before activation; failed installation preserves the prior working version. Runtime requests use cached app files; navigation falls back to the cached shell. No runtime network fetches or page connections.
- Explicitly prompt to activate updates; never force reload with unfinished forms, including dirty backup forms.
- Namespace caches by encoded full registration scope plus a delimiter, preventing root/nested-scope collisions. Preserve assets used by open windows; when three versions are retained, probe client build IDs and reclaim only confirmed unused versions. Unknown clients or three in-use versions defer installation. Without windows, obsolete caches can be removed at activation. Never clear IndexedDB in worker lifecycle code.
- Each scope retains at most three complete versions. Failed new installation removes its partial cache; it preserves prior working caches. Activation probes all clients and requires clean-state acknowledgements; dirty/unknown clients block activation. Real-browser update tests remain required.
- Support Pages paths through `VITE_BASE`. Request `navigator.storage.persist()` after the first meaningful save; show current `estimate()`/persistence status in Settings. Denial is not durable-storage success.

## 4. Calendar and media

Timed task `.ics` export uses VEVENT, UID, local date/time, time zone, and optional VALARM. It is read-only; untimed tasks have no timed alarm. Device-calendar import/notification behavior is not a Gün Gün delivery guarantee.

Media begins with exercise in Phase 4, then recipes/meals, family memories, and receipts. Ask camera/gallery access only on selection. Resize locally; store blobs with validated owner, MIME, and size in IndexedDB. No external image URLs. Full backup includes actual bytes and metadata. Missing/corrupt media aborts restore. Quota failures leave old data intact; revise settings-only resource limits before media ships.

## 5. Security and backup protocol

Render user text as text; no `dangerouslySetInnerHTML`. CSP permits app files and local `blob:` previews while forbidding page network connections. Keep secrets, backups, and personal records outside Git. Device lock protects local access; backup encryption is a separate boundary.

Planned Phase 0 `.gungun` envelope: strict JSON `{header, ciphertext}` with canonical base64 ciphertext. Header keys in authenticated serialization order:

`formatVersion`, `schemaVersion`, `kdf`, `iterations`, `cipher`, `salt`, `iv`, `exportedAt`, `mediaCount`.

| Field/parameter | Phase 0 contract |
| --- | --- |
| Versions | `formatVersion=1`, `schemaVersion=1` |
| KDF | `PBKDF2-SHA256` (HMAC-SHA256), generated with 600,000 iterations |
| Salt / IV | Cryptographically random 16-byte salt / 12-byte IV per export |
| Cipher | AES-256-GCM, 128-bit tag |
| AAD | `JSON.stringify` of the validated header in the exact order above |
| Time/media | Epoch-millisecond `exportedAt`; `mediaCount=0` until media migration |
| Plaintext | `{schemaVersion:1, settings:[...]}`; exclude local metadata |
| Input bounds | 5 MiB settings-only file; accepted KDF iterations 600,000–2,000,000 |

Validate versions, unknown fields, canonical base64, byte lengths, singleton count, enum values, and audit times before applying data. Bound untrusted memory/KDF work. Future backup/schema versions must define compatible resource limits and migrations; the initial bound is not a photo-backup design.

Password minimum: 10 characters. Do not store passwords in IndexedDB/localStorage; clear them on completion, cancellation, or leaving the form. Forgotten passwords are unrecoverable. Native download/Web Share can deliver a file, but cannot prove user retention.

## 6. Restore contract

1. Bound/parse, decrypt/authenticate, validate schema and relationships, and migrate supported versions in memory.
2. Preview counts and size; capture local revision. Offer a recovery backup of current data. The optional recovery file uses the opened backup's password and does not update current records.
3. Obtain explicit overwrite confirmation. Reject stale previews after concurrent writes; revalidate and replace exported user data in one transaction, preserving local installation/persistence metadata.
4. Roll back all clears/inserts/revision changes on failure. Password, corruption, unsupported version, missing media, and cancellation cannot alter current data. No MVP merge.

Record which schemas are supported before coding each migration. Domain snapshot contents belong to [05](05-DATA-MODEL.md); verification belongs to [07](07-TEST-PLAN.md). Approximate three-second startup on mid-range Android is a future measured target, not a current result.

## Current schema-2 backup

Phase 1 export keeps envelope format 1 but sets header/payload schemaVersion to 2 and includes settings, events and completions (including soft-deleted history). Media remains zero. Schema-1 files are authenticated with their own original header, migrated in memory to schema 2 and previewed before a revision-guarded atomic restore. The local tests exercise both forms; runtime browser/file handling still requires its acceptance gate.
