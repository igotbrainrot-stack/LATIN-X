# Tablinum — Windows 10/11 manual offline test record

**Phase:** 0 (baseline before changing the program)  
**Status:** NOT YET PERFORMED ON A PHYSICAL WINDOWS MACHINE. This is a checklist, not a passing test report.

| Field | Result |
|---|---|
| Test date | _Not yet supplied_ |
| Windows version/build | _Not yet supplied_ |
| Edge version | _Not yet supplied_ |
| Chrome version | _Not yet supplied_ |
| Firefox version | _Not yet supplied_ |
| Tester | _Not yet supplied_ |
| ZIP or branch tested | `test/phase0-safety-net` |

## Test on each Windows browser while disconnected from the internet

| Check | Edge | Chrome | Firefox | Notes / evidence |
|---|---|---|---|---|
| Unzip complete ZIP into `Documents\Tablinum\` | Not run | Not run | Not run | |
| Double-click `index.html`; no server or install | Not run | Not run | Not run | |
| Open with `Start Tablinum.cmd` | Not run | Not run | Not run | Launcher uses system default browser |
| Latin chapter I shows nine sentences and original scene colours | Not run | Not run | Not run | |
| Complete two questions, raise a hint, save a word, write a note | Not run | Not run | Not run | |
| Close and reopen browser; check progress retained | Not run | Not run | Not run | |
| Export a v4 JSON backup; verify non-empty file in Downloads | Not run | Not run | Not run | |
| Move the extracted folder to Desktop or another drive | Not run | Not run | Not run | |
| Reopen; note any changed file-origin storage behaviour | Not run | Not run | Not run | File origin can differ by browser |
| Restore the saved backup and verify answers/notes/vocabulary | Not run | Not run | Not run | |
| Macrons `ā ē ī ō ū ȳ` render in system serif fonts | Not run | Not run | Not run | |
| Keyboard navigation and visible focus | Not run | Not run | Not run | |

## Phase 7 repeat checks (not required in Phase 0)

When audio persistence and speaking are implemented, additionally test MP3 playback, imported audio surviving reload (where storage is supported), timing fallback, microphone permission, recording/playback, and export of recordings. These features are **not certified by this Phase 0 checklist**.

## Reporting an issue

Record browser version, Windows build, exact actions, result, whether internet was disconnected, a screenshot if possible, whether the app had been moved after saving progress, and whether the old JSON backup restored successfully. **Do not upload real private progress backups to a public repository**; use synthetic fixtures for bug reports.
