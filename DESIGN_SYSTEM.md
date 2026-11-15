# Tablinum design system

Introduced with the November 2026 interface redesign (branch `ui/premium-redesign-20261115`).
It replaces the inline stylesheet in `index.html` and the four layered files
`tablinum-polish.css`, `tablinum-modern.css`, `tablinum-play.css` and `welcome.css`.

## Files

| File | Role |
| --- | --- |
| `app/styles/tablinum-fonts.css` | `@font-face` rules for the two bundled families. |
| `app/styles/lx-tokens.css` | Every colour, type, space, radius, shadow and motion value. Light theme, dark theme, reader size and line-spacing steps. |
| `app/styles/lx-app.css` | Every component, in 23 numbered sections (base, app bar, layout, lesson rail, side panel, type helpers, controls, surfaces, reader, lesson path, exercises, words, progress, settings, home, audio strip, messages, welcome guide, games, flourishes, small screens, reduced motion, print). |
| `Picture Practice.html` | Keeps its own small inline stylesheet, now written with the same tokens. |

Rules, each enforced by a test:

- `lx-app.css` contains no raw hex colours. Colours come from tokens (`tests/redesign.test.cjs`).
- No `@import`, no remote URL, no font from outside `assets/` (`tests/design-integrity.test.cjs`, `tests/redesign.test.cjs`).
- The dark theme is written twice in `lx-tokens.css`: once for `prefers-color-scheme: dark` when the setting is "System", once for `html[data-theme="dark"]`. The two blocks must be identical (`tests/redesign.test.cjs`).
- Every text/background pair below meets WCAG AA in both themes (`tests/phase12-accessibility.test.cjs`, 52 pairs).

## Typography

Two families, both bundled and both under the SIL Open Font License.

| Token | Family | Used for |
| --- | --- | --- |
| `--font-serif` | Gentium Book Plus, loaded as "Tablinum Book" | All Latin, headings, the brand, lesson titles. It has every macron. |
| `--font-sans` | Source Sans 3 (variable, 200–900), loaded as "Tablinum Sans" | Interface text: navigation, buttons, labels, help, settings. |

Sizes: `--text-xs` 12px, `--text-s` 13.5px, `--text-m` 15.5px, `--text-l` 18px. Page headings use
`clamp()` between about 28px and 40px. Eyebrow labels are 11–12px, weight 700, letter-spaced, upper case.

Latin reading text is set by two learner-controlled variables:

| Setting | Attribute on `<html>` | Values |
| --- | --- | --- |
| Text size | `data-reader-size` 0–4 | 18, 20, **22**, 25, 29px |
| Line spacing | `data-reader-leading` 0–2 | 1.5, **1.75**, 2.05 |

The reading column is capped at `--measure` (720px).

## Colour

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#f5f0e6` | `#12151c` | Page |
| `--surface` | `#fffdf9` | `#1c212c` | Cards, app bar, panels |
| `--surface-2` | `#f8f3e9` | `#222836` | Insets, hover |
| `--surface-3` | `#ece4d3` | `#2b3243` | Segmented-control track, progress track |
| `--ink` / `--ink-2` / `--ink-3` | `#201c17` / `#4a4339` / `#675e52` | `#ece6d9` / `#c5beb0` / `#a09a8e` | Text, secondary text, captions |
| `--line` / `--line-strong` | `#e3d9c7` / `#c8bba2` | `#2d3545` / `#414b60` | Rules, control borders |
| `--primary` / `--on-primary` | `#27344f` / `#fbf8f1` | `#d9b36c` / `#1b1609` | The one main action in a view |
| `--accent` (+ `-soft`, `-line`) | `#7c5c2b` | `#d9b36c` | Selection, progress, eyebrows, links |
| `--good` (+ `-soft`, `-line`) | `#3c6045` | `#a3d0a8` | Correct answers, approved recording |
| `--bad` (+ `-soft`, `-line`) | `#963a2b` | `#f2a896` | Wrong answers, destructive actions |
| `--focus` | `#2b5cb0` | `#8fb7ff` | Keyboard focus ring |
| `--plate` / `--plate-ink` | `#f6efdf` / `#4a4339` | same | Mount behind the watercolours, which are painted on pale paper in both themes |

Light is warm ivory with a midnight primary and bronze accent. Dark is a designed theme, not an
inversion: midnight surfaces, ivory ink, bronze-gold primary, and softened feedback colours. The paper
grain (`body::before`) is switched off in the dark theme.

The names used by the earlier stylesheets (`--parchment`, `--paper`, `--ochre`, `--olive`, `--burgundy`,
`--rule` and others) remain as aliases of the new tokens.

## Space, shape, depth, motion

- Space: a 4px scale, `--s1` 4px to `--s8` 64px.
- Radii: `--radius-s` 6px (controls), `--radius` 10px (inputs, small cards), `--radius-l` 16px (cards, dialog), `--radius-pill` (chips, switches).
- Shadows: `--shadow-1` resting cards, `--shadow-2` raised (audio strip, popover), `--shadow-3` dialogs.
- Motion: `--fast` .14s for colour and border changes, `--slow` .28s for a view entering or a result appearing, one easing curve `--ease`. Nothing loops. Under `prefers-reduced-motion: reduce` every animation and transition is reduced to effectively zero and the leaf burst in the games is not created (`tests/ui-modern-browser.test.cjs`, `tests/play-browser.test.cjs`, `tests/redesign-browser.test.cjs`).

## Layout

- App bar (`.appbar`, sticky, 64px; 108px in two rows on phones): brand button (goes Home), the five sections, then Sound, Course guide and Settings.
- `.layout` grid: lesson rail 264px, main column, side panel 328px. The rail and side panel are shown beside the reader and exercises only. Home, Words, Progress and Settings use a single centred column.
- Breakpoints: 1240px (narrower rails), 1040px (side panel under the text), 900px (lesson rail becomes a horizontal strip), 560px (phone: tabs become a five-column row, the audio strip stacks), 380px (step buttons in the audio strip show arrows only).
- Checked at 320, 390, 768, 1366 and 1920px wide for sideways scrolling and clipped controls (`tests/redesign-browser.test.cjs`).

## Components

| Component | Class | Notes |
| --- | --- | --- |
| Button | `.btn`, `.btn.primary`, `.btn.danger`, `.link` | One `.primary` per view. Minimum height 40px. |
| Icon button | `.icon-btn` | 40px square, always with `aria-label` and `title`. |
| Segmented control | `.segmented` | Theme, line spacing, Review/Glossary. Uses `aria-pressed`. |
| Switch | `.switch` | A real button with `aria-pressed`; the label is separate text. |
| Card / panel | `.panel`, `.stat`, `.lesson-card`, `.today-tile` | `--surface` on `--bg`, `--shadow-1`. |
| Sentence | `.sentence`, `.selected`, `.is-playing` | Selected has a bronze rule at the left. Playing adds a raised card and a Stop control. The two are separate states. |
| Word | `.word`, `.is-chosen` | Button-like span, keyboard reachable, arrow keys move between words. |
| Answer option | `.option`, `.is-correct`, `.is-wrong` | Colour is never the only signal: a tick or cross is added. |
| Lesson path | `.lesson-path` | Three steps per lesson with current/done states. |
| Audio strip | `.dock` | `data-playing`, `data-source` = approved, pending, local, browser, timed or untimed. Names the voice and its approval status. |
| Toast | `.app-status` | The existing `#appStatus` live region, fixed above the audio strip, never unmounted. |
| Sound popover | `#ambience-controls` | Opens from `#sound-button`, closes on outside click or Escape. |
| Dialog | `#lx-welcome`, `dialog.play-dialog` | Scrim, focus kept inside, Escape closes. |

## Preferences and storage

Display preferences are stored inside the existing profile, as one additive field:

```
tablinum-state-v5 → ui.display = { theme: "system"|"light"|"dark", size: 0–4, leading: 0–2, focus: boolean }
```

No key, schema name or version changed. A profile or backup without `ui.display` loads with the
defaults (system, 2, 1, off). Out-of-range values fall back to the defaults. The field is exported and
restored with backups. Home and Settings are views, not saved sections: `ui.tab` still only holds
`read`, `quiz`, `review` or `progress`.

## Language

Latin section names that already existed (Lēctiō, Exercitia, Memoria, Prōgressus, Liber prīmus, and
others listed in `scripts/lib/latin-corpus.cjs`) are kept, each with an English label. No new Latin
interface text was written for the redesign: new labels are in English, because new Latin needs the
owner's approval.
