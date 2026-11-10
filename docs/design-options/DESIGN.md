# Gün Gün implementation handoff

Derived from [03 — Design](../03-DESIGN.md); that document remains the design authority.
Scope: approved local Phase 0–1, editorial mobile references, no new product behavior.

## Structure and intent

Keep the same geometry, information order, controls, spacing and navigation for all three themes.
Default theme is Kâğıt (`paper`); appearance defaults to `system`, resolved by the app to light or dark.
Use `data-theme="cool|paper|balanced"` and resolved `data-appearance="light|dark"` on the same root element.
The local CSS fallback is paper/light before the app resolves saved appearance.

Today: date and Add action; one next timed-event focal surface; chronological event list;
separate flexible-event list; history link; Today/Plan/Records/More navigation.
Records remains disabled with a later-phase explanation. Phase 2 tasks and Phase 3 habits/time are excluded.
Settings separates theme from appearance. Event forms show visible labels, native date/time controls,
a recurrence selector and conditional weekday choices, category, note, save and cancel.
Dirty form departure and event conflicts require the confirmations owned by the screen specification.

## Tokens and geometry

[theme.css](../../apps/web/src/theme.css) is the executable token inventory for all six combinations.
Components use `--canvas`, `--ink`, `--accent`, `--surface`, `--muted`, `--border`, `--danger`,
`--focus`, `--on-accent`, `--detail`, `--heading-font`, and `--body-font`.
`--detail` provides restrained ochre for paper/cool, sage for balanced; never conveys state alone.
Use the accent background only with `--on-accent`; ordinary text uses ink/muted on canvas/surface.
Use border/focus tokens for control boundaries and visible focus. Do not apply opacity to functional text.

Shared geometry: 4/8/12/16/24/32 px rhythm at the default browser text size; 20 px phone gutters;
48 CSS px minimum target as a web implementation baseline for the project's Android 48 dp target.
Validate physical target behavior on Android; CSS pixels and native dp are not interchangeable units.
Use 8 px control corners, 4 px focal-surface corners, square list separators and pill status labels.
Body is 16 px/1.6, headings 24–32 px, metadata 14 px/1.5; layout expands for enlarged text.
Use natural wrapping, shrinkable text columns and `overflow-wrap: anywhere` for user content.
Do not shrink or clip labels to reproduce a fixed reference height.

Noto Serif regular/bold supplies paper headings; Noto Sans regular/bold supplies all body text
and cool/balanced headings. Fonts and their SIL Open Font License 1.1 are bundled in `apps/web/public/fonts/`.
Use local font-face URLs with swap; no runtime font service or CDN.
Font selection settles the Phase 0 packaging choice; real Android legibility remains a device check.

## Mobile and accessibility implementation

Use semantic HTML controls and explicit labels; SVG icons beside labels are decorative.
Keep four bottom destinations with a visible current marker and disabled semantics for Records.
Prefer normal document flow for forms and sticky navigation that reserves layout space.
Include safe-area insets, dynamic viewport height fallback and scroll clearance around focused controls.
Do not fix Save above a soft keyboard or assume a native KeyboardAvoidingView exists in a PWA.
Keep browser Back predictable, restore sensible route focus, and preserve input after errors.
Use native dialog semantics or approved Radix, trap modal focus, restore the trigger and provide Cancel.
Show field errors alongside their controls; failed multi-field submission also needs a linked focusable summary.
Enable paste/password managers for backup passwords; essential instructions cannot disappear in a short toast.
No decorative motion; pressed feedback may use color with 120 ms transitions, 0 ms for reduced motion.
No gradients, glass, emoji, purple/indigo, card walls, promotional heroes or remote assets.

## Stitch-ready brief

Build an Android-first offline personal planner with quiet editorial hierarchy. Use a single reading column,
serif date heading for paper, one focal next-event panel and thin ruled lists. Preserve 20 px phone gutters,
48 CSS px minimum web controls, clear visible labels, wrapped event names and persistent four-item navigation.
Use only the exact semantic palettes in theme.css; dark appearance has its own tokens. Theme changes never
change screen structure. Produce the 360/412 px variants before adding decorative refinements. All actual
product copy comes from `apps/web/src/i18n/tr.ts`; English in these references is editorial placeholder copy.
Do not generate another master design system or infer tasks, nutrition, habits or financial screens in this scope.

## References and limits

Open [index.html](index.html) locally for 12 Today SVG references, plus Settings and Event form at both widths.
The English labels and fabricated events are editorial examples, not shipping product UI or stored user data.
Regenerate with `python3 docs/design-options/render.py`; it reads executable theme tokens and needs no packages.
Render with installed `rsvg-convert` for inspection. Static SVGs show layout intent, not a browser implementation.
Contrast evidence and inspected-reference critique are recorded in [UI-UX-REVIEW](../UI-UX-REVIEW.md).
