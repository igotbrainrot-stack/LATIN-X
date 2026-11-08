# Refinement report — polish and audit pass (8 November 2026)

**Base:** `LATIN_X_COMPLETE_WITH_MIRIAM_AUDIO_20261109.zip` (SHA-256 `d2a8bdef…e88`), i.e. the MIRIAM_V4_COMPLETE source plus the approved-narration integration. Every file in it was checksum-verified before work began. The narration code, approved MP3s and approval records are untouched.

**Ground rules kept:** legacy lesson text and answer keys byte-locked; nine approved scenes and their polygons unchanged; pilot chapters, picture keys and lexemes remain unsigned; v4/v5 storage keys and migration untouched; no pronunciation alias appears anywhere learner-facing; no merge, push or release was made (GitHub access is suspended).

## Visual improvements

All styling changes live in one new file, `app/styles/tablinum-polish.css`, loaded after the original manuscript stylesheet. `index.html`'s original CSS and scripts are unchanged; only four enumerated `<link>` tags were added.

- **Header:** title, edition note and sound controls were three items on one flex line, leaving the note floating mid-page and the slider labels sitting below the button baseline. Now a two-column grid: title left, controls right, note under the controls. Duplicate visible "Music"/"Clicks" labels are kept for screen readers but removed from the visual line. "Off" state is visibly muted.
- **Picture-region chips** under each scene were browser-default buttons (system font, blue border). They now match the manuscript controls and show a burgundy pressed state.
- **Links** were default blue in three places (Picture Practice link, Art Review link, music provenance). Now burgundy with consistent underline offset.
- **File pickers** used the OS "Choose File" button; now styled to match `.btn`.
- **Recording seek bar** sat inside a text-field box (empty framed strip). Now a plain slider.
- **Progress page:** the four vocabulary measures were in a 3-column grid, stranding "Productive" alone; now 4-up (2-up on narrow screens). Course-map rows had the score floated higher than the chapter link and a green-grey rule from an older palette; now baseline-aligned with tabular figures and the palette's rule colour.
- **Library:** storage note no longer touches the "Export my recordings ZIP" button.
- **Buttons:** added a pressed (`:active`) state for immediate feedback; `aria-pressed` buttons show their state.
- **Phone layout (≤720 px):** sound controls fit on one row; the dock's "Speak sentence" label was clipped, and a fifth button (narration "Alt take") would have wrapped awkwardly. The dock is now a flexible row with a wider primary button.
- **Picture Practice:** palette, corner radii (7–8 px → the app's 2 px), link colour and selected states aligned with the reader.
- **Typography:** the designated faces (Palatino Linotype / Book Antiqua) are unchanged. Linux Mint has neither, so text fell back to a generic serif. A bundled OFL face, Gentium Book Plus (registered as "Tablinum Book"), now fills that slot, with full macron coverage. Windows rendering is unaffected. No Uberata font exists in this project, so that clause did not apply.
- **Icon:** new monogram icon (SVG, PNG, ICO) used as the page favicon and the Linux menu icon.

Screenshots before/after (desktop 1440, tablet 1024, phone 390, all five tabs) were taken in Chromium and reviewed. They are attached to the project thread rather than stored in the repo.

## Usability improvements

- One obvious, console-free way to start on both systems: `Tablinum.html`.
- Linux menu entry + desktop icon via a double-clickable installer that reports success with a dialog.
- Release READMEs explain start-up, progress backup when moving folders, missing audio and fonts in a few lines.

## Technical defects repaired

| Defect | Cause | Fix |
|---|---|---|
| `test:phase3c-browser` failed (recovery button never appeared) | Test copied `app/` and `content/` to a temp folder but not `vendor/`, which the Progress page has needed since Phase 6 | Copy `vendor/` and `assets/` too. The app itself was confirmed working. |
| `test:art-browser` failed on the pristine ZIP ("7 !== 1") | Selector `[data-art-scene=…]` also matched the six region buttons | Select `figure[data-art-scene=…]` |
| `test:axe-browser` could not run | `axe-core` not installed / declared | Pinned `axe-core 4.10.3` (exact version the test asserts) as a dev dependency |
| `test:vendor-fsrs` could not run | `ts-fsrs` not declared | Pinned `ts-fsrs 5.4.2` as a dev dependency; vendored bundle verified identical |
| `strong-glow-highlight.test.cjs` failed | Asserted the old blur radii replaced by the owner-approved softer blend | Removed; `art-glow-blend.test.cjs` covers the current values and is now in `npm test` |
| axe: dock outside any landmark; heading level skipped (h1 → h3) | Markup in byte-locked runtime | `80-accessibility.js` adds `role=region` + label to the dock and `aria-level=2` to the guidance heading. axe now reports **0 violations of any severity** on all five tabs (was 2 moderate) |
| `owner-miriam-v3-review` and `art-glow-blend` tests passed but were not in `npm test` | Omitted from the chain | Added |

## Performance

No bottleneck was found worth changing: the app is static files, starts in well under a second from `file://` in Chromium, and the polish layer adds two small stylesheets plus font files that load only on systems without Palatino (Linux). No runtime JavaScript was added except four attribute assignments in the existing accessibility observer.

## Refactoring

Deliberately minimal. The runtime and lesson data are byte-locked by tests, so presentation fixes went into a separate stylesheet rather than editing locked code. New code: `scripts/build-release.cjs` (dependency-free ZIP/tar.gz writer), `scripts/write-checksums.cjs`, `tests/release-package.test.cjs`, launchers.

## Files removed or moved

- **Moved** to `docs/history/` (nothing referenced them): 19 superseded handovers and start-here notes, and the previous README (links rewritten).
- **Removed:** `tests/strong-glow-highlight.test.cjs` (superseded, see above).
- **Ignored:** `artifacts/`, `dist/`, `node_modules/` added to `.gitignore`.
- **Kept on purpose:** all owner tools and audition launchers (`DOWNLOAD_*.cmd`, Miriam review pages, `audio-audition/`) — tests and the audio workflow still reference them, and the approved-take download may still be needed. They are excluded from learner packages instead. Phase handovers still referenced by CI workflows or `verify-claude-package.cjs` stay at the root.

## Packaging

`npm run build:release` writes to `dist/`:
- `Tablinum-<label>-windows.zip` (91 files, ~4.1 MB): reader, Picture Practice, Art Review, approved MP3s, fonts, `Tablinum.html`, `Start Tablinum.cmd`, `Start Picture Practice.cmd`, `Install Approved Narration.cmd` + its script, README.
- `Tablinum-<label>-linux.tar.gz` (~4.1 MB): same runtime, `Tablinum.html`, `linux/install-launcher.sh` and `uninstall-launcher.sh` (0755), README.
- `Tablinum-<label>-source.zip`: every tracked file plus the Git-ignored approved MP3s.
- `SHA256SUMS.txt`.

## Tests executed (this container: Linux, Node 22.23, Chromium 1243 headless)

- `npm test`: all 34 suites pass (includes the narration test).
- `npm run test:narration`, `test:lexemes`, `test:phase2`, `test:phase3c`, `test:pilot`, `test:art`, `test:picture`, `test:illustrations`, `test:vendor-fsrs`, `test:package`: pass.
- Browser (`npm run test:browser-all`, 16 suites, real Chromium over `file://`): all pass, including axe and the new release test, which builds both packages, extracts them into paths with spaces and macrons, opens `Tablinum.html`, walks all 8 chapters, 5 tabs, Picture Practice and Art Review, and fails on any missing file, page error or network request.
- Linux installer: run against a throwaway HOME and a folder named `My Apps/Tab's $pecial 100%`; the generated `Exec` line was parsed back to the exact path; uninstall removed both entries.

## Not tested — needs a person on the real systems

- **Windows 11:** not available here. Untested: double-clicking `Tablinum.html` in Explorer with Edge as default, SmartScreen/Mark-of-the-Web prompts on the extracted ZIP, Palatino rendering.
- **Linux Mint (Cinnamon/Nemo):** not available here. Untested: double-click "Run" prompt for the installer, the trusted desktop icon, `xdg-open` choosing the default browser, the zenity dialog.
- **Firefox and Edge:** only Chromium is installed in this container. Earlier phases' CI ran Edge; this pass did not.
- Real speaker playback of the MP3s (headless browser only).

## Known limitations

- Six approved Miriam takes are still missing (s007 V6b/V6a, s009 V5a, quoque V4, vīlla V2, aqua V3); those items use the labelled browser voice. See `docs/audio/APPROVED_NARRATION.md`.
- `Start Tablinum.cmd` necessarily flashes a console for an instant; `Tablinum.html` is the console-free route. A native `.exe` launcher was rejected: unsigned executables trigger SmartScreen warnings, which is worse.
- Browser progress is tied to the folder path. Moving the folder means exporting and restoring a backup (documented in both READMEs).
- Picture-region chip labels show the region IDs (e.g. `arbor-magna`); they come from the approved region data and were left unchanged.
- On tablets (≤1120 px) the guidance column moves below the reading text; word lookups still appear inline, so this was left as designed.
