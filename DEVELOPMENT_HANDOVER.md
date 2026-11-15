# Development handover — interface redesign

For the next developer or AI agent. Read with `HANDOVER.md` (architecture, build, constraints),
`DESIGN_SYSTEM.md`, `BUG_AUDIT.md` and `TEST_REPORT.md`.

## Where things stand

- Branch `ui/premium-redesign-20261115`, cut from `release/easy-install-20261111` at `e442e15` (PR #19).
- It is one more link in the existing stack: #14 → #15 → #16 → #18 → #19 → this branch. None of the earlier PRs were merged, rebased or re-based by this work. `main` was not touched. No release was published.
- The branch contains the redesign, its tests and its documents. It contains no Latin, vocabulary, answer-key, artwork or audio change.

## How the interface is built now

The program is still plain HTML with ordered classic scripts, opened from `file://`. No build step, no
modules, no `fetch`, no network.

```
index.html                 shell: skip link, app bar (brand, #tabs, tools), .codex > .layout
                           (#chapters, #main, #help), .dock (audio strip), footer, script list
app/styles/tablinum-fonts.css   two bundled families
app/styles/lx-tokens.css        all design values, light and dark
app/styles/lx-app.css           all components
app/legacy-runtime.js      state, rendering and the document-level click handler
app/60-audio-ambience.js   music, click sounds, the Sound popover
app/welcome/welcome.js     the course guide dialog
```

Things worth knowing in `app/legacy-runtime.js`:

- `hasShell` is true when the page has the app bar. The Node harness (`tests/helpers/legacy-app-harness.cjs`) has no app bar, so there the runtime keeps its earlier behaviour. New DOM calls are guarded with `?.` for the same reason.
- `overlay` holds `"home"`, `"settings"` or `null`. `shown()` returns `overlay || S.tab`. Home and Settings are views, not saved sections, so `ui.tab` in storage only ever holds `read`, `quiz`, `review` or `progress`. The program starts with `overlay = "home"`.
- `displayPrefs()`, `applyDisplay()` and `setDisplay(patch)` own `ui.display` and the four `data-*` attributes on `<html>`.
- `render()` rebuilds `#tabs`, `#chapters`, `#main` and `#help` with `innerHTML`. Focus and scroll position are kept by `stableFocus`/`restoreFocus` and `holdPlace`/`keepPlace`. One-shot markers (`data-fresh`, `view-enter`, `is-new`) stop entrance animations replaying.
- New view functions: `home()`, `settingsView()`, `dataPanels()`, `glossary()` with `glossaryRows()`, `glossaryDetail()`, `glossaryList()`, `refreshGlossary()`. Rewritten: `tabs()`, `help()`, `reader()`, `readerTools()`, `review()`, `savedWordsList()`, `progress()`, `updateDock()`, `mountPlay()`.
- `markPlaying()` toggles `.is-playing` on the sentence and the Listen/Stop button. `updateDock()` sets `data-playing` and `data-source` on `.dock`.
- The glossary typing handler updates the list without a full render, so the search box keeps focus.
- The Latin interface strings listed in `scripts/lib/latin-corpus.cjs` (`UI_LATIN`) must stay in the source; `tests/latin-pronunciation.test.cjs` checks each one.

## Rules that still apply

Unchanged from `HANDOVER.md` §6, restated because they are easy to break from the interface side:

- Never write `tablinum-source-review-v02`. The profile is `tablinum-state-v5`; any change to it needs a tested, backward-compatible migration. `ui.display` is additive and optional.
- Show `Līvia` and `quoque`. The narration respellings must never reach the learner (`tests/redesign.test.cjs` §6, `tests/redesign-browser.test.cjs` step 10).
- A recording is "approved" only where `content/narration.js` says the owner passed it. Do not relabel pending recordings.
- Clicking a sentence plays that sentence. Nothing advances on its own. Timings are never invented. The browser voice is always named as a synthetic voice.
- New Latin (including interface labels), vocabulary, answers, artwork and recording approvals need the owner.
- One rule did change: `HANDOVER.md` said `index.html` may change only in its enumerated tags and that visual work belongs in `tablinum-polish.css`. The redesign directive replaced that. The current contract is in `tests/phase3a-relocation.test.cjs` (exact script list and order, exactly five `<link>` tags, no inline script or style) and `tests/design-integrity.test.cjs`.

## Tests

`npm test` (Node, includes `tests/redesign.test.cjs`), `npm run test:browser-all` (Chromium, includes
`tests/redesign-browser.test.cjs` and the release package test), then `test:easy-install`,
`test:narration`, `test:offline-media`, `test:offline-contract`, `test:package`. Results are in
`TEST_REPORT.md`.

Browser suites written for the reader call `toReader(page)` from `tests/helpers/open-reader.cjs` after
loading, because the program now opens on Home; suites that need the data tools call `toSettings(page)`.
No test was removed or skipped. Where an assertion described the old look (2px corners, the parchment
hex, tab labels, stylesheet file names) it was rewritten to describe the new contract; each such change
is listed in `TEST_REPORT.md`.

Running the browser suites rewrites the tracked screenshots in `artifacts/`.

## Open decisions for the owner

1. Approve or reject the 58 Chapter II–VIII Arjun recordings (U-01, U-02, U-05).
2. Choose the replacement for "Recordātiō incepta" (LX-015 / U-06).
3. Apply or decline wording fixes LX-020 to LX-025.
4. Region chip labels under the pictures (`arbor-magna`): supply learner-facing Latin, or approve showing the ids without hyphens.
5. Plainer learner wording for the status phrases listed in `BUG_AUDIT.md` (O-04, O-05) and the footer (O-06).
6. Whether to bump the version for this interface.
7. Merge order for the PR stack.

## Suggested next work

- Run the program and both installers on a real Windows 11 machine and a real Linux Mint machine. This has not been done.
- A manual screen-reader pass (NVDA on Windows, Orca on Mint).
- Run the browser suites in Firefox and Edge (`TABLINUM_BROWSER_NAME`).
- `app/legacy-runtime.js` is about 1,600 lines in one closure. Splitting the view functions into separate classic scripts would make it easier to maintain; it was left alone here because the content-lock tests fingerprint parts of it and the redesign did not need it.
