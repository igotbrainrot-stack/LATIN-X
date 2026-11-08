# Tablinum — Classical Roman Manuscript Edition

## Status
Design-only branch: `design/classical-manuscript-20261104`, based on the existing v0.4.2 review branch `fix/tablinum-v04-review-20261104`. No merge has been performed. `index.html` continues to be a single-file, offline-capable application.

## Goal and approach
Transform the previous modern, rounded, pale-green interface into a refined classical Roman study folio. Use restrained typographic hierarchy, warm tactile paper surfaces, fine rules, compact rectangular controls, and margin-note-inspired glossary. Keep the text highly readable and the visual decoration subtle.

## Actual changes
- Replaced the old 5.7 KB CSS with a self-contained classical manuscript theme. No external font imports or decorative image downloads.
- Added a presentational `codex` wrapper around the existing tab bar and three-column layout. The `tabs`, `chapters`, `main`, and `help` host IDs are unchanged.
- Converted the green top banner into a book-title header, and restyled tabs as inscribed section labels rather than rounded pills.
- Restyled chapter navigation into a compact index, with thin left-margin markers for the active chapter.
- Restyled reading passages as ruled paragraphs, with clear selected-sentence shading, fine Latin word underlines and inset marginal commentary.
- Framed the existing original SVG scene illustrations like archival printed plates, retaining their **original colours**. Chapter III's red rose, green tree, and yellow sun carry Latin meaning and must not be desaturated.
- Restyled quizzes as textbook workbook sections, vocabulary review as a study ledger, imported-text forms as annotation spaces, and the audio toolbar as a parchment control strip.
- Rebalanced the mobile layout: title-page tagline/version are hidden only on narrow screens, the header/tab/chapter strip and plate are shorter, and the sticky audio toolbar carries a one-line mode label and compact controls. The first Latin sentence should be visible above the audio strip on a 390px phone.
- Added explicit reduced-motion and printable folio rules.

## Colour palette
| Theme token | Value | Use |
|---|---|---|
| `--parchment` | `#eee1c9` | Overall paper-ground |
| `--paper` | `#faf3e5` | Main reading folio |
| `--paper-bright` | `#fff8ea` | Text inputs and options |
| `--vellum` | `#e9dcc4` | Marginal surfaces |
| `--ink` | `#382b21` | Primary reading text |
| `--ink-soft` | `#59483a` | Secondary text |
| `--terracotta` | `#a55c45` | Warm emphasis |
| `--ochre` | `#765a2a` | Rules, annotations |
| `--olive` | `#586342` | Correct answers and focus |
| `--burgundy` | `#723c3a` | Navigation and primary buttons |
| `--rule` | `#b9a284` | Engraved border colour |

## Typography
The app deliberately uses local system-installed book serifs, falling back to Georgia: Iowan Old Style, Palatino Linotype, Book Antiqua, Baskerville and Georgia. This avoids loading fonts or requiring additional downloads. Latin passage text is 22px on desktop and around 19–20px on small screens.

## Design-only preservation contract
Only the HTML presentation wrapper, header style class and CSS were changed in `index.html`. The JavaScript was explicitly compared before and after and was identical. Script FNV-1a checksum: `e3aa2876`; Adler32: `992012759`. A new `tests/design-integrity.test.cjs` asserts those values plus required host IDs and important style tokens. The existing v0.4.2 learning content, exercises, dictionary, audio behaviour, state and imported files logic is unchanged. Test scripts and CI were extended, but no new application behaviour was added.

## How to run
Open `index.html` directly in Firefox, Chrome or Edge. For the optional test suite use `npm test`. For actual graphical smoke tests install Playwright and Chromium and run `npm run test:browser`; the GitHub Actions workflow is configured to run both jobs and save desktop/mobile screenshots as an artifact.

## What must be reviewed
- Desktop and mobile typography, line breaks and content hierarchy.
- Visible focus outlines, keyboard tab/arrow navigation and the unmodified glossary audio controls.
- Warm palette contrast on input labels, feedback and small text.
- Rendering of the original-colour scene SVGs; the source vector geometry is deliberately preserved, especially colour-sensitive items such as rosam rubram.
- 375–390px phones and 1024–1440px widths, horizontal overflow and sticky dock height.
- All course actions; confirm no mismatch with existing lesson content or programme function.

## Known limitations
The illustrations are the same authored SVG scenes with their original semantic colours preserved; they have not been redrawn as historically accurate Roman artwork. The original Latin remains an educational draft requiring expert language review. External LatinCy, audio-corpus, FSRS, dictionary and text-source integrations remain outside this strictly visual branch. No change has been made to the existing v0.4.2 functional limitations.

## Workflow discipline
This branch intentionally stacks **code history** on the approved/latest review version but does not open a stacked pull request or merge either branch. Review or download this branch directly. If the team decides to merge v0.4.2 first, the design diff can then be reviewed against that merged baseline.
