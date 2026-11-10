# 03 — Design system

Status: approved visual direction with a local Phase 0–1 implementation handoff. Semantic tokens, bundled fonts, a reference generator and 16 editorial SVG references are available. Static references do not complete a phase gate or prove runtime behavior. This document owns visual rules; screen structure belongs to [02](02-SCREENS.md).

## 1. Shared structure

A calm, legible daily tool with practical density and restrained editorial details. All themes share navigation, information order, spacing geometry, and controls. Only color, typography, borders, and surface treatment vary.

Follow Today's order in [02](02-SCREENS.md#3-today-plan-and-tasks--phases-12). Use one focal next-event surface followed by lists and separators, not a card per section. Keep missing values distinct from zero. Actual UI copy belongs only in `apps/web/src/i18n/tr.ts`, as specified by [AGENTS](../AGENTS.md). Editorial mockup labels are English placeholders and are not application UI.

## 2. Themes and appearance

Theme: Serin, Kâğıt, Dengeli; default Kâğıt. Appearance: light, dark, system; default system. Resolve system through the device preference. All six resolved combinations have identical controls and information order.

| Theme | Character | Light canvas / ink / accent | Dark canvas / ink / accent |
| --- | --- | --- | --- |
| Serin | Cool, quiet, open; sans-serif | `#F5FAFA` / `#17282B` / `#0B7C83` | `#0E181A` / `#E6F2F2` / `#5CCFC9` |
| Kâğıt | Warm paper; serif headings, sans body; green with a small ochre detail | `#F6F7F2` / `#202B25` / `#356B51` | `#131B17` / `#ECF2ED` / `#A3D6B2` |
| Dengeli | Neutral, composed; terracotta/sage; sans-serif | `#F5F4EF` / `#292D2A` / `#8A4F36` | `#1C1E1B` / `#F2F0E9` / `#E6A486` |

Use semantic tokens, never scattered color literals in components. The executable six-palette token inventory is [theme.css](../apps/web/src/theme.css); the derived [handoff and Stitch-ready brief](design-options/DESIGN.md) are available. [Contrast evidence](design-options/CONTRAST.md) records all 90 supported text, control and focus pairs. This document remains the authority; the handoff derives from it.

## 3. Typography, components, accessibility

- Bundled fonts: Noto Serif 2.015 regular/bold for Kâğıt headings; Noto Sans 2.015 regular/bold for body and other themes. Embedded SIL OFL 1.1 metadata, copyright, Turkish glyphs `ÇĞİÖŞÜçğıöşü`, numerals and file hashes are verified in [font evidence](design-options/FONTS.md). Load only local files with `font-display: swap`. The four unmodified TTFs total 2,712,644 bytes. Actual Android legibility and fallback remain device checks.
- Use local SVG/assets; no remote fonts/images or copied logos/characters.
- Next event: one focal surface; Kâğıt may use a thin edge rule. Avoid unnecessary shadows.
- Lists: explicit event/task labels; status remains understandable without color. Decorative separators may be subtle, but cannot define an interactive boundary alone.
- Buttons: labeled, same position/action across themes, visible focus, clear primary/secondary roles. Hit targets at least 48 × 48 dp; validate Android behavior rather than equating dp with physical pixels.
- Text contrast at least 4.5:1; control/focus boundaries at least 3:1. Verify every relevant pair, not only canvas/ink.
- At 360/412 px: no horizontal overflow; long labels wrap or containers grow. Bottom navigation keeps visible labels and grows with text. Full labels remain accessible.
- Support at least 130% text, reduced motion, keyboard focus, and screen readers. Essential state cannot depend on animation.
- Vary corner treatment by component where useful; shared hit areas and geometry remain stable.

## 4. Constraints and advisory tools

No emoji, gradients, glass, purple/indigo, Inter/Roboto headings, equal-card grids, universal radius, excessive/perpetual animation, generic promotional heroes, color-only status, tiny controls, or clipped text.

UI UX Pro Max is mandatory for applicable design, implementation and review. The verified local installation is `/home/cropsre/.agents/skills/ui-ux-pro-max/SKILL.md`; focused mobile, React and web searches and their actual platform limitations are recorded in [UI-UX-REVIEW](UI-UX-REVIEW.md). Radix remains approved. Advisory helper/Stitch output cannot override this design; no competing generated master system is used.

## 5. Required mockups and critique

The [local gallery](design-options/index.html) contains 12 Today references: three themes × light/dark × 360/412 px; Settings and Event form references are available at both widths. Regenerate using `python3 docs/design-options/render.py`. These are scoped Phase 0–1 editorial references, with fabricated events and English labels; later-phase tasks, habits and nutrition are intentionally absent.

The rasterized 12-frame Today sheet and Settings/Event form references were inspected locally. Kâğıt's serif headings remain distinct above readable sans event lists. All themes preserve the same single focal surface, ruled lists and geometry; Dengeli's terracotta accent avoids a generic gray card wall. At 360 px, longer event labels wrap while completion targets retain space. Settings clearly separates theme and appearance; the longer event form scrolls rather than packing fields into a fixed viewport. Reference critique and verification limits are recorded in [UI-UX-REVIEW](UI-UX-REVIEW.md).

Inspect real references and record a short critique in each UI phase. Static examples cannot establish focus, screen-reader behavior, enlarged text, font fallback, or runtime performance. Required verification belongs to [07](07-TEST-PLAN.md).
