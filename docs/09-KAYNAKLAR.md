# 09 — Sources

Research snapshot: **2026-11-07**. Research supports the [product requirements](01-PRD.md), not a second specification. Source inspections below belong to the original research snapshot; this document rewrite did not rerun remote checks. Verify mutable APIs, versions, licenses, prices, and platform support before implementation.

## 1. Research access

| Report | Unique evidence |
| --- | --- |
| [Research guide](../araştırma/README.md) | Evidence labels, access limits, relation to current decisions |
| [Design helpers](../araştırma/01-design-helpers.md) | UI UX Pro Max, Sleek, skill discovery, Stitch conflicts; Radix and alternatives; source/license/version observations |
| [Behavior](../araştırma/02-behavior.md) | Starting, planning, progress; scientific findings separated from product examples/inferences |
| [Product/UI/UX](../araştırma/03-product-ui-ux.md) | Eight products, Android/web differences, backup exclusions, unverified visual details |
| [Platform](../araştırma/04-platform.md) | PWA/Android alternatives, explicit data transfer, deferred backend comparison |
| [Later modules](../araştırma/05-later-modules.md) | Exercise, nutrition, family/goals, money, receipts, advanced features; license/data limits |

## 2. Primary implementation references

- [Dexie React guide](https://dexie.org/docs/Tutorial/React): local reactive queries; no Cloud dependency required.
- [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): persistence is not a backup guarantee.
- [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility): library and application responsibilities.
- [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps): touch targets and platform checks.
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): supporting KDF guidance; the project's file-encryption contract is in [04](04-ARCHITECTURE.md#5-security-and-backup-protocol).
- [Capacitor storage](https://capacitorjs.com/docs/guides/storage) and [local notifications](https://capacitorjs.com/docs/apis/local-notifications): later evaluation only.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site): optional static hosting, not publication approval.

Installed versions and source/verification limits are recorded in [VERSIONS](VERSIONS.md). Verify changing APIs and future upgrades against official primary sources; cached installation is not an online vulnerability audit. Historical secondary version links and absent progress/comparison documents are not evidence.

Phosphor icon names, local font licenses/glyphs, and helper scripts also require implementation-stage inspection. No remote font or runtime research integration is approved.
