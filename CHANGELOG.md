# Changelog

Dates are 2026. The program version shown to learners is unchanged at 0.4.2 (the owner sets versions).

## 0.5.0 — owner decisions (15 November, branch `chore/owner-decisions-20261115`)

The owner asked for best-judgment decisions on the open items. Full record: `docs/OWNER_DECISIONS_20261115.md`.

- Version 0.4.2 → 0.5.0. Footer reads "Version 0.5.0 review build".
- "Recordātiō incepta." removed from the recording message (LX-015); the English stays.
- Course guide lists Chapter I as "I · In hortō" (LX-025).
- Picture labels show spaces in place of hyphens ("arbor magna").
- Plain-English wording for the unchecked-material notices in Words, Progress and Picture Practice.
- Not changed: the 58 Chapter II–VIII recordings stay "awaiting review"; LX-020 to LX-024 declined.

## Unreleased — packaging layout (15 November, branch `build/installer-layout-20261115`)

Based on `ui/premium-redesign-20261115` (PR #20). Not merged, not released. No program file, saved-data format, content or media changed, and no runtime file moved.

### Added
- `packaging/manifest.json`: one description of what ships (runtime files, exclusions, media count, icons, names, release label, install locations). `build-release.cjs` and `build-easy-install.cjs` now read it. The Setup ZIP they produce is byte-identical to before.
- `npm run build:stage`: writes the exact installer tree to `dist/stage/Tablinum/` with `payload.json` (every file, size and SHA-256), for any installer tool.
- `packaging/windows/tablinum-setup.iss` and `npm run build:windows-exe`: a single per-user Windows `.exe` (Inno Setup 6) that runs the existing `install-windows.ps1`.
- `packaging/linux/` and `npm run build:linux-installers`: a single-file per-user `.run` that runs the existing Mint installer, and a system-wide `.deb`.
- `tests/packaging-layout.test.cjs` (in `npm test`) and `.github/workflows/installers.yml`, which builds and really installs the `.exe`, `.run` and `.deb`.
- `packaging/README.md`.

## Unreleased — interface redesign (15 November, branch `ui/premium-redesign-20261115`)

Based on `release/easy-install-20261111` (PR #19). Not merged, not released.

### Added
- **Home.** The program opens on Home: a "Continue learning" card for the next unfinished step, today's review count, word-check totals, a listening shortcut, all eight lessons with progress, the three word games and Picture Practice.
- **Settings.** Theme (system, light, dark), reading text size (five steps), line spacing (three steps), focus mode, macrons, clue buttons, music and click sounds with volumes, course guide at start, backup reminder interval, backup export and restore, recording export, reset, and an About panel.
- **Dark theme**, designed separately from the light theme.
- **Glossary** under Words: search in Latin or English, filter (all, saved, to revisit, by lesson), forms met in the stories, and occurrences that open the sentence in the reader.
- **Reading display controls** above each story: smaller, larger, line spacing, focus mode.
- **Sound popover** in the app bar, with the current track and a "Next track" button.
- Source Sans 3 as the interface typeface (bundled, SIL Open Font License).
- A skip link, and `aria-current` on the open section.
- Tests: `tests/redesign.test.cjs`, `tests/redesign-browser.test.cjs`, `tests/helpers/open-reader.cjs`. The axe audit now covers Home, Glossary, Settings and the dark theme.

### Changed
- One design-token file and one application stylesheet replace the inline `<style>` block and four layered stylesheets.
- Navigation: Home, Lēctiō / Read, Exercitia / Practise, Memoria / Words, Prōgressus / Progress. The lesson list and the word panel are shown beside the reader and exercises only.
- The audio strip always offers Play on the reader, shows "Sentence n of m" and whether it is playing, and marks the source (approved recording, recording awaiting approval, browser voice).
- A sentence being read aloud is shown differently from the selected sentence.
- Backup, restore, reset and recording export moved from Progress to Settings.
- Picture Practice uses the same tokens and follows the chosen theme.
- The illustration caption no longer carries a developer note; it sits under the picture.
- `index.html` body was restructured (app bar, skip link). This departs from the earlier rule in `HANDOVER.md` that `index.html` may change only in its enumerated tags; the owner's redesign directive of 15 November asked for it. The script list and its order are unchanged.

### Fixed
- First-launch backup reminder shown to a learner with no progress.
- No Play button in the audio strip when the browser voice is the source.
- Audio strip and toast overlapping or cut off on phones.
- Two `<h1>` elements on the review card.
- See `BUG_AUDIT.md` for the full list with tests.

### Not changed
- Latin text, vocabulary, questions, answer keys, form notes, artwork and all 78 media files (checked byte-for-byte against the pinned manifest).
- Recording approvals: Chapter I approved, Chapters II–VIII awaiting the owner.
- Storage key `tablinum-state-v5`, schema and version. Display settings are one additive field, `ui.display`.
- The installer system from PR #19 and the release builder.
- No automatic sentence advance. No network access.

## 14 November — easy-install setup build (PR #19)
See `docs/LATEST_BUILD_20261114.md`.

## Earlier
See `docs/history/`, `docs/REFINEMENT_REPORT_20261108.md` and `docs/PROGRAM_REVIEW_20261111.md`.
