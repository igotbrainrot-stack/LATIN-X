# Test report — interface redesign

Branch `ui/premium-redesign-20261115`. Run on 15 November 2026.

## Environment

- Cloud Linux container (not Linux Mint, not Windows), Node v22.23.4, Playwright 1.63.0, headless Chromium 153, axe-core 4.10.3.
- The app was loaded from `file://` in every browser suite except those that deliberately use a local `127.0.0.1` server.

## Baseline (before any change)

On `release/easy-install-20261111` at `e442e15`: `npm test`, `test:browser-all`, `test:easy-install`,
`test:narration`, `test:offline-media`, `test:offline-contract`, `test:release` and `test:package` all passed.

## Results on this branch

| Command | What it covers | Result |
| --- | --- | --- |
| `npm test` | 41 Node suites: content lock, lexicon, compiler, migration, backups, FSRS, audio, art gates, pronunciation corpus, static accessibility, design contract, redesign contract | Pass |
| `npm run test:browser-all` | 23 Chromium suites, listed below | Pass |
| `npm run test:easy-install` | Setup package layout: 165 files, 78 media files | Pass |
| `npm run test:narration` | 75 of 75 narration clips present with pinned SHA-256 | Pass |
| `npm run test:offline-media` | Arjun catalogue (67 sentences, 8 words), Roman playlist | Pass |
| `npm run test:offline-contract` | 78 media pins, runtime file list, no private artefacts, save keys | Pass |
| `npm run test:package` | Source package contents | Pass |
| `npm run build:setup` | Builds `dist/Tablinum-Setup-20261111.zip` (19.07 MB; not committed) | Built |

Browser suites in `test:browser-all`: browser-smoke, ui-modern, program-review, guided-lessons,
browser-voice-fallback, play, file-url-smoke, review-file-url, phase3b, phase3c, phase3c-review,
phase5-keyboard, phase6, phase7a, phase7b, phase8-art, phase12-accessibility, phase8-picture-practice,
phase12-axe, legacy-main-art, answer-steady (newly added to the chain), redesign (new), release-package.

### Accessibility

- axe-core: 0 violations of any impact on reader, exercises, review, progress, Home, glossary, Settings and Picture Practice, in the light theme and again in the dark theme (15 audits).
- 52 text/background token pairs meet WCAG AA contrast in both themes (4.5:1 text, 3:1 focus ring).
- Keyboard: skip link is the first Tab stop; sections, settings, exercises, word navigation with arrow keys, review keys 1–4 and Space, dialogs closing with Escape and returning focus are covered by `redesign-browser`, `phase5-keyboard-browser`, `phase12-accessibility-browser`, `program-review-browser` and `play-browser`.
- Reduced motion: no animation or transition longer than 1 ms on the reader, Home and Settings.
- Not done: a manual screen-reader pass.

### Layout

`redesign-browser` checks Home, reader, reader with a word chosen, exercises, review, glossary, progress
and Settings at 320, 390, 768, 1366 and 1920px for sideways scrolling and for controls outside the
window, and checks that the audio strip's labels are not cut off. Screens were also read by eye at 1440,
820 and 390px in both themes; a set is in `docs/design/screens/`.

### Installer and package (manual, in this container)

Done by extracting `dist/Tablinum-Setup-20261111.zip` into a folder whose name has a space and a macron:

| Check | Result |
| --- | --- |
| Package holds the two installers, `Open without installing.html`, `READ ME FIRST.txt`, `program/` | Yes |
| `program/` has the new stylesheets and both font families, and none of the retired stylesheets | Yes |
| 78 MP3 files in the package | Yes |
| `Open without installing.html` opens the program: 8 lessons on Home, 9 sentences in lesson I, a recording plays, 0 errors, 0 network requests | Yes |
| `Install Tablinum (Linux Mint).sh --no-launch --quiet` with a temporary `HOME` | Installed to `~/.local/share/tablinum`, menu entry and desktop icon created |
| Installed copy opens and plays a recording | Yes |
| Running the installer a second time | Succeeds |
| `--uninstall` | Removes the folder, menu entry and desktop icon |
| Installing over an unrelated existing `tablinum` folder | Refused, nothing changed, exit 1 |

### Media integrity

`tests/redesign.test.cjs` hashes all 78 files in `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json`
and compares them with the pinned SHA-256 values. No media file, narration catalogue entry or approval
status was changed by this branch.

## Tests that were changed, and why

No test was deleted, skipped or weakened to pass. These were edited because they described the old interface:

| Test | Change |
| --- | --- |
| `design-integrity` | Reads the three stylesheets instead of an inline `<style>`. Still requires the legacy token names, the core selectors, no remote assets, unfiltered illustrations and a mounted live region. Adds the new tokens and selectors. "2px corners" became "radii come from tokens". |
| `phase3a-relocation` | The allowed `<link>` list is now two icons and three stylesheets. The script list and order are unchanged. Paper-texture checks read `lx-app.css`. |
| `phase12-accessibility` | Focus and contrast are checked in the stylesheets, for 52 pairs across two themes (previously 8 pairs in one). Adds the skip link. |
| `offline-release-source-contract`, `release-package` | Expected file lists name the new stylesheets and font; the release test also opens Home and Settings in the extracted package. |
| `browser-smoke` | Expects the new page colour through the `--parchment` alias and the `aria-current` marker instead of square tab corners. |
| `ui-modern-browser` | Stylesheet names; tab label "Review" is now "Words"; "tabs at the top" is measured on the app bar that contains them. |
| `play-browser` | Stylesheet name. |
| `phase6-browser` | The review introduction says "offline FSRS scheduling" in a sentence; the match is case-insensitive. |
| `phase7a-browser` | Starts on Home; opens the Sound popover before using its controls; checks Escape closes it. |
| `phase7b-browser`, `file-url-smoke`, `guided-lessons-browser`, `phase12-accessibility-browser`, `program-review-browser` | Backup, restore, reset and recording export are reached through Settings. |
| `phase3b-browser`, `phase3c-review-browser`, `phase5-keyboard-browser`, `phase6-browser` | Course lessons are chosen from the lesson rail beside the reader, which is no longer shown on Progress. |
| All reader suites | Call `toReader(page)` after loading because the program opens on Home. |
| `phase12-axe-browser` | Extended to Home, glossary, Settings and the dark theme. |

## Not verified

- **Real Windows 11:** not run. `Install Tablinum (Windows).cmd` was not executed; only its presence and line endings are tested.
- **Real Linux Mint:** not run. The Linux installer was run in a generic Linux container without a desktop session, so the menu entry and desktop icon were checked as files, not seen in a menu.
- Firefox, Edge, Safari and installed Chrome were not run.
- No screen reader was used.
- Audio was not listened to. Tests check that the right file plays, that state and labels are correct, and that playback stops after one sentence.
- Latin correctness, vocabulary and answer keys were not reviewed and were not changed.
- Performance was not measured beyond the suites completing; no regressions were noticed in use.
