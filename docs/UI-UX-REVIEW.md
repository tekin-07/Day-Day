# UI/UX preparation and reference review

Scope: local Phase 0–1 mobile PWA; 2026-11-07. Product authority remains [03 — Design](03-DESIGN.md).
This records design preparation and static inspection, not runtime accessibility or completed phase gates.

## Installed helper and provenance

Read `/home/cropsre/.agents/skills/ui-ux-pro-max/SKILL.md` locally; Python 3 CLI works without network or installation.
Skill SHA-256: `e5baf9400d4347e5ed3eb1f6b99cd0b9ba545b8b0e507aabb2b87397bbf73ea1`.
Search script SHA-256: `8373e2dd2d560d9853ec116140de0e0d5bee45a6abe5e041173c84e1c36a7f87`.
Local datasets used:

| Source under the installed skill | SHA-256 |
| --- | --- |
| `data/ux-guidelines.csv` | `ff81ec613f70ba9fc3fcce52dbe4ae35d44b2079dbe6dc066d2d6e38c28facd5` |
| `data/app-interface.csv` | `331e7cf2c0b222d80c566c5f255c63cb339f65bfd02e471a720f28e4864a9f08` |
| `data/react-performance.csv` | `3d925802539abac5afeb63ae8aa1960b7229ad271b3a47caed40ab2d97ad0734` |
| `data/stacks/react.csv` | `2d2b9c198e875106a30f7ee68341a9ee0033cad60a7e130cf23152783e08aeda` |

Run focused queries with `python3 /home/cropsre/.agents/skills/ui-ux-pro-max/scripts/search.py '<query>' --domain <domain> --max-results 2 --json`.
For the stack row use `--stack react` instead of `--domain`.
Queries contained only generic design concerns; no personal project data was sent or read.

## Search results checked for scope

| Query / domain | Verified result identity | Applied interpretation |
| --- | --- | --- |
| `touch-target-size` / ux | Touch: Touch Target Size; Accessibility: Target Size (Minimum) | Distinguish iOS pt, Android dp and CSS px. Use project's stronger target. |
| `safe area fixed navigation` / ux | Navigation: Sticky Navigation; Layout: Fixed Positioning | Keep layout space for navigation and safe insets. |
| `bottom navigation back` / ux | Navigation: Back Button; Sticky Navigation | Preserve browser back/history; four top-level destinations. |
| `form inline validation` / ux | Forms: Inline Validation; Forms/Accessibility: Focusable Error Summary | Keep input and inline errors; focus linked summary on failed submission. |
| `focus not obscured` / ux | Accessibility: Focus Not Obscured (Enhanced/Minimum) | Separate AA partial visibility from AAA full visibility; aim for full control visibility. |
| `reduced motion` / ux | Animation: Reduced Motion; Excessive Motion | No decorative motion; reduced-motion sets duration tokens to zero. |
| `text scaling wrapping` / ux | Off-topic image/alt results | Rejected; retried once as the next row. |
| `text truncation` / ux | Content: Essential Text Truncation; Truncation | Wrap essential labels; never clamp event names for uniform cards. |
| `viewport units` / ux | Layout: Viewport Units; Responsive: Viewport Meta | Prefer min-height dvh with fallback, allow browser zoom. |
| `form accessibility` / react | No match | Retry `form inputs` was also empty; no verified React-domain form match. |
| `rerender state` / react | Rerender: Defer State Reads; Derived State | Advisory only; no speculative optimization or viewport JS for CSS layout. |
| `forms accessibility` / stack react | Forms: Controlled components for forms; Debounce rapid input changes | Preserve form values; no expensive search exists here, so no debounce is needed. |
| `keyboard input viewport` / web | Native TextInput keyboard-type/label advice | Not PWA-specific; rejected. Retry `keyboard avoid` also returned native/off-topic results. |
| `keyboard focus semantic` / web | Native TextInput keyboard-type/next advice | Not a web semantic/focus match; rejected. Retry `focus management` / ux returned Focus Appearance plus off-topic z-index advice; only focus appearance is relevant. |

The helper's `web` domain currently searches `app-interface.csv` and returned native app code for these queries.
No verified PWA soft-keyboard result was found. General web implementation guidance below is explicitly derived
from the skill Quick Reference and project rules, not claimed as a successful keyboard search.
The local React-stack advice carries dataset metadata for React 19.2.x; it is advisory, not proof of a newer API version.

## Conflicts and decisions

- Helper summaries use 44 px/44 pt in places and distinguish native 44 pt / 48 dp elsewhere. Project Android minimum is 48 dp.
  Implement at least 48 CSS px web controls, verify target behavior on actual Android, and never equate physical units.
  WCAG's 24 CSS px AA floor does not reduce the project's stronger touch requirement.
- Native safe-area and KeyboardAvoidingView examples do not apply directly to React DOM. Use CSS safe-area env insets,
  dynamic viewport height and normal scroll flow; keep Save reachable with the soft keyboard. Real Android verification remains required.
- Generic helper icon/font/palette preferences cannot replace approved themes, local assets, Noto serif headings or approved Radix.
  Text navigation labels are sufficient; new icon packages and native UI stacks are not introduced.
- Generic glass, gradients, animation and shimmer recommendations are excluded by project design. Quiet color feedback is sufficient.
- Generic short toast dismissal does not apply to persistent backup warnings, storage failures, undo requirements or required confirmations.
- React-stack preference for controlled inputs does not forbid approved react-hook-form. Preserve form values and accessible labels whichever approved approach is used.
- A generated design system would duplicate approved authority. Focused queries were used; no helper `MASTER.md` was generated.

## Handoff and measured checks

[DESIGN.md](design-options/DESIGN.md) derives geometry, type, component treatment and a Stitch-ready brief from 03.
[theme.css](../apps/web/src/theme.css) includes all six approved canvas/ink/accent combinations plus surface, muted,
border, danger, focus, on-accent and detail roles. Theme geometry and controls remain identical.
[CONTRAST.md](design-options/CONTRAST.md) reports 90 measured foreground/background pairs: normal text minimum **4.72:1**;
control/focus minimum **3.14:1**. Accent-filled buttons use on-accent; focus outlines have a separating offset.
These numbers describe solid token pairs, not a blanket claim about future opacity, overlays or actual component CSS.

[FONTS.md](design-options/FONTS.md) records four unmodified Noto 2.015 regular/bold faces, **2,712,644 bytes** total,
SHA-256 hashes, Turkish/numeral character-map checks and embedded SIL OFL 1.1 license evidence.
The OS `/usr/share/licenses/noto-fonts/LICENSE` says Apache 2.0 but differs from the actual font's embedded license.
Use embedded font metadata; the bundled license includes its copyright/trademark and locally available OFL text.
No fonttools package was available; SFNT name records were read with Python's standard library and glyph maps with installed fc-query.
TTF keeps a larger initial font payload; no extra dependency or network conversion was introduced.

## Inspected references and critique

Generated and rasterized all **16 SVGs** using installed `rsvg-convert`: 12 Today variants across cool/paper/balanced,
light/dark, 360/412 px; Settings and Event form at both widths. Inspected the 12-frame Today contact sheet and the
360 px and 412 px forms sheets, plus the 360 px paper reference at full size for the wrapped event title.
References use the installed Noto files through fontconfig, corresponding to the bundled unmodified faces.
SVGs specify Noto families with fallback; viewing on a machine without Noto may substitute a font.

- Kâğıt's serif date/page hierarchy and next-event title stay distinct, with readable sans list entries. Dark paper is calm green,
  with a light mint action and thin focal rule. No card wall or large decoration competes with the next event.
- Serin and Dengeli preserve the exact geometry. Cool cyan and balanced terracotta carry the same action/status roles;
  their dark variants maintain readable muted labels instead of lowering opacity.
- At 360 px, completion controls retain 48 px height and the long flexible-event title wraps onto a second line.
  At 412 px, more space is available while gutters and hierarchy remain fixed. Daily rows leave a deliberate second line
  for longer titles; production rows must grow naturally rather than enforce this reference's fixed coordinates.
- Settings keeps theme and appearance in distinct, labeled groups; selected text complements color.
  The event form shows visible field labels and full Save/Cancel text, using a long scrolling form rather than fixed keyboard-level actions.
- Next-event and Today titles are clearly separated; the date is secondary. List separators are stronger than decoration
  because the same border token also supports controls. This is intentionally conservative for reliable contrast.

Static SVGs cannot prove browser overflow, enlarged text, keyboard focus, Android safe areas/soft keyboard, screen-reader
announcements, dirty-form navigation, storage transactions, offline loading or performance. Those need application tests
and real-device checks from [07](07-TEST-PLAN.md). No real-device check is claimed here.

## Reproduce evidence

1. `python3 docs/design-options/render.py` generates 16 references and the local gallery.
2. `python3 docs/design-options/verify.py` verifies all 90 pairs, four font faces, 16 valid SVGs and identical Today geometry per width.
3. `rsvg-convert docs/design-options/today-paper-light-360.svg -o /tmp/today-paper-360.png` makes an inspectable raster.

The helper searches and static checks are preparation evidence; the combined phase gate is still reviewed separately.

Integration check attempt: `pnpm check` ran during parallel implementation and stopped at Biome formatting/import diagnostics in other active application/configuration files. The owned `theme.css` passed its focused Biome check. A later full-project run belongs to integration verification; this preparation report does not claim that it passed.
