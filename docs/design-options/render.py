"""Generate editorial references from the application's semantic theme tokens."""
from html import escape
from pathlib import Path
import re
import textwrap

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
THEMES = {"cool": "Cool", "paper": "Paper", "balanced": "Balanced"}


def palettes():
    css = (ROOT / "apps/web/src/theme.css").read_text()
    pattern = r'\[data-theme="(\w+)"\]\[data-appearance="(\w+)"\] \{([^}]+)\}'
    return {(theme, mode): dict(re.findall(r"--([\w-]+):\s*(#[\da-fA-F]+)", body))
            for theme, mode, body in re.findall(pattern, css)}


class Screen:
    def __init__(self, width, height, colors, theme, title):
        self.width, self.height, self.colors = width, height, colors
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
                      f'<title id="title">{escape(title)} — editorial reference</title>',
                      '<desc id="desc">English placeholder labels and fabricated events. Static design reference, not application UI.</desc>']
        self.heading = "Noto Serif" if theme == "paper" else "Noto Sans"
        self.box(0, 0, width, height, "canvas")

    def box(self, x, y, w, h, fill="surface", stroke=None, radius=0):
        edge = f' stroke="{self.colors[stroke]}"' if stroke else ""
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{self.colors[fill]}"{edge}/>')

    def text(self, x, y, label, size=16, color="ink", bold=False, heading=False):
        font = self.heading if heading else "Noto Sans"
        weight = 700 if bold else 400
        self.parts.append(f'<text x="{x}" y="{y}" font-family="{font}, serif" font-size="{size}" font-weight="{weight}" fill="{self.colors[color]}">{escape(label)}</text>')

    def lines(self, x, y, label, width, size=16, color="ink", bold=False):
        rows = textwrap.wrap(label, width=max(12, int(width / (size * .56))))
        for i, line in enumerate(rows):
            self.text(x, y + i * 24, line, size, color, bold)

    def rule(self, y, x=20, width=None):
        self.box(x, y, width or self.width - 40, 1, "border")

    def button(self, x, y, w, label, primary=False):
        self.box(x, y, w, 48, "accent" if primary else "surface", None if primary else "border", 8)
        self.text(x + 12, y + 30, label, 16, "on-accent" if primary else "ink", True)

    def save(self, name):
        (OUT / name).write_text("\n".join(self.parts + ["</svg>"]) + "\n")


def navigation(s, active="Today"):
    y = s.height - 86
    s.box(0, y, s.width, 86, "surface")
    s.rule(y, 0, s.width)
    for i, label in enumerate(["Today", "Plan", "Records", "More"]):
        x = i * s.width / 4 + 8
        if label == active:
            s.box(x, y + 1, s.width / 4 - 16, 3, "accent")
        s.text(x + 3, y + 36, label, 14, "accent" if label == active else "muted", label == active)
        if label == "Records":
            s.text(x + 3, y + 58, "Later", 12, "muted")
    s.box(s.width / 2 - 30, s.height - 10, 60, 3, "muted", radius=2)


def event_row(s, y, time, title, subtitle):
    s.text(20, y + 27, time, 14, "muted", True)
    s.lines(76, y + 27, title, s.width - 168, 16, bold=True)
    s.text(76, y + 78, subtitle, 14, "muted")
    s.button(s.width - 76, y + 9, 56, "Done")
    s.rule(y + 100)


def today(s):
    s.text(20, 30, "SATURDAY · 07 NOVEMBER", 13, "muted", True)
    s.text(20, 77, "Today", 32, heading=True)
    s.button(s.width - 100, 45, 80, "+ Add", True)
    s.text(20, 111, "A little room for your day.", 16, "muted")
    s.box(20, 139, s.width - 40, 156, "surface", "border", 4)
    s.box(20, 139, 4, 156, "accent")
    s.text(38, 166, "NEXT EVENT", 12, "accent", True)
    s.text(38, 204, "Morning walk", 24, heading=True)
    s.text(38, 236, "09:00 — 09:30", 16, bold=True)
    s.text(38, 270, "Movement · Open details", 14, "muted")
    s.text(20, 341, "Daily plan", 23, heading=True)
    s.text(s.width - 93, 340, "History", 14, "accent", True)
    event_row(s, 362, "09:00", "Morning walk", "30 min · Movement")
    event_row(s, 468, "11:30", "Library visit", "45 min · Personal")
    s.text(20, 622, "Flexible", 23, heading=True)
    s.lines(20, 658, "Prepare next week’s reading list for the library", s.width - 52, 16, bold=True)
    s.text(20, 714, "No set time · 20 min · Personal", 14, "muted")
    s.rule(737)
    s.text(20, 771, "Saved on this device", 14, "muted")
    navigation(s)


def option(s, y, label, selected=False):
    s.box(20, y, s.width - 40, 52, "surface", "border", 8)
    s.text(36, y + 32, label, 16, bold=selected)
    s.text(s.width - 105, y + 32, "Selected" if selected else "Choose", 14, "accent" if selected else "muted")


def settings(s):
    s.text(20, 35, "More / Settings", 14, "muted")
    s.text(20, 87, "Settings", 32, heading=True)
    s.text(20, 135, "Visual theme", 20, heading=True)
    for y, label in [(155, "Cool"), (215, "Paper"), (275, "Balanced")]:
        option(s, y, label, label == "Paper")
    s.text(20, 376, "Appearance", 20, heading=True)
    for y, label in [(396, "Light"), (456, "Dark"), (516, "System")]:
        option(s, y, label, label == "System")
    s.text(20, 605, "Time zone", 16, bold=True)
    s.text(20, 633, "Europe/Istanbul · Fixed", 16, "muted")
    s.rule(660)
    s.text(20, 697, "Device storage", 20, heading=True)
    s.lines(20, 732, "Persistence is not guaranteed. Keep a backup in Files.", s.width - 40, color="muted")
    navigation(s, "More")


def field(s, y, label, value, height=52):
    s.text(20, y, label, 15, bold=True)
    s.box(20, y + 12, s.width - 40, height, "surface", "border", 8)
    s.lines(32, y + 44, value, s.width - 68)


def event_form(s):
    s.button(20, 20, 88, "Cancel")
    s.text(20, 112, "New event", 30, heading=True)
    field(s, 158, "Title · Required", "Library visit")
    field(s, 254, "Date · Required", "2026-11-07")
    field(s, 350, "Timing", "Timed · 11:30")
    s.text(20, 449, "Flexible time is also available.", 14, "muted")
    field(s, 499, "Duration · Minutes", "45")
    field(s, 595, "Repeat", "Once")
    field(s, 691, "Category", "Personal")
    field(s, 787, "Note", "Return the borrowed book.", 100)
    s.lines(20, 937, "Conflicts are reviewed before saving. Your input remains editable.", s.width - 40, 14, "muted")
    s.button(20, 1010, s.width - 40, "Save event", True)
    s.text(20, 1096, "Editorial reference · scrollable form", 13, "muted")


def gallery(names):
    cards = []
    for name in names:
        cards.append(f'<figure><a href="{name}"><img loading="lazy" src="{name}" alt="{name[:-4].replace("-", " ")}" width="360"></a><figcaption>{name[:-4].replace("-", " ")}</figcaption></figure>')
    page = ['<!doctype html>', '<html lang="en"><meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1">',
            '<title>Gün Gün editorial references</title>', '<style>',
            'body{margin:24px;background:#f3f3ef;color:#202b25;font:16px/1.6 system-ui,sans-serif}',
            'main{display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start}figure{margin:0}',
            'img{display:block;max-width:100%;height:auto;border:1px solid #7e887e}',
            'figure{max-width:412px}a:focus-visible{outline:3px solid #356b51;outline-offset:4px}',
            '</style><h1>Editorial mobile references</h1>',
            '<p>English placeholder labels; fabricated events; Phase 0–1 scope. These are static references, not app UI or runtime evidence.</p>',
            '<p>Same geometry across themes. Settings separates visual theme from appearance. The event form scrolls naturally.</p><main>',
            *cards, '</main></html>']
    (OUT / 'index.html').write_text('\n'.join(page) + '\n')


def main():
    colors, names = palettes(), []
    for (theme, mode), palette in colors.items():
        for width in [360, 412]:
            name = f"today-{theme}-{mode}-{width}.svg"
            screen = Screen(width, 880, palette, theme, f"Today {THEMES[theme]} {mode} {width}")
            today(screen)
            screen.save(name)
            names.append(name)
    for title, draw, height in [('settings', settings, 900), ('event-form', event_form, 1140)]:
        for width in [360, 412]:
            name = f"{title}-paper-light-{width}.svg"
            screen = Screen(width, height, colors['paper', 'light'], 'paper', title)
            draw(screen)
            screen.save(name)
            names.append(name)
    gallery(names)
    print(f"Generated {len(names)} editorial SVG references and index.html")


if __name__ == "__main__":
    main()
