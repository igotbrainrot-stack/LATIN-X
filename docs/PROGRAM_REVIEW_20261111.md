# Program review, 11 November 2026

Reviewed by Claude on `main` at 8de337b. The review ran the existing test suites, used the app in headless Chromium at 1280 px and 390 px widths, and read `app/legacy-runtime.js`. No audio was listened to. Nothing here is a statement that the Latin is correct; see `docs/latin-audit/` for that work.

## What was checked and found sound

- `npm test` and the browser suites pass on `main`.
- No page errors and no horizontal overflow at either width.
- All 139 distinct words in the eight chapters have a glossary entry.
- Backup export, reset and restore round-trip correctly.

## Fixed in this change

| # | Problem | Fix |
|---|---|---|
| 1 | After a wrong typed answer the page re-rendered and keyboard focus fell to the page body, so the learner had to click back into the box each time. | Focus returns to the same answer box (short answers, cloze, course exercises). |
| 2 | "Save vocabulary" gave no sign that anything happened, and the button stayed active. | A status message confirms the save and the button reads "Saved ✓". |
| 3 | A saved word could never be removed. | Memoria has a "Saved words" list with a Remove button for each word (asks first; removes the card and its history). |
| 4 | Short answers and cloze are graded by exact match, so a learner could be stuck on one question with no way forward. | After three misses a "Show the answer" button appears. Showing the answer never scores the question; the learner still types it. |
| 5 | Memoria said "Omnia bene! No reviews are due" even when cards were ready but held back by the daily limit, and never said when the next review was. | It now says how many cards are held until tomorrow, or when the next review falls. |
| 6 | Rating buttons read "again / hard / good / easy" in lower case and needed the mouse. | Labels are "1 · Again" to "4 · Easy"; Space or Enter reveals, keys 1 to 4 rate. |
| 7 | The audio strip (Prev, Play, Pause, Next) stayed on Exercitia, Memoria and Prōgressus, where it does nothing useful. | It is shown only on Lēctiō. |
| 8 | Prōgressus said "Current schema v4" (it is v5) and showed the raw code "Storage: not_checked". | Plain wording for both. |
| 9 | "Verba discenda · Four separate measures" always showed four zeros, because no lexemes are approved yet. | The block is hidden until approved lexemes exist. The count of legacy saved words stays. |
| 10 | "← Previous chapter" on chapter 1 did nothing. | The button is disabled there. |
| 11 | `SHA256SUMS.txt` was stale: 73 tracked files had changed since it was written and 32 were not listed. | Hashes of all tracked files are refreshed and the missing files added. Lines for the private MP3s are left as they were, because those files are not in this checkout. |

Test: `tests/program-review-browser.test.cjs` (`npm run test:program-review-browser`, also part of `npm run test:browser-all`).

## Follow-up change (same day)

The owner asked for the remaining gaps to be completed. This second change does what can be done without a Latinist or a pair of ears.

| # | Gap | What was done |
|---|---|---|
| 12 | Glosses ignored the inflected form. | Clicking a word now also shows its possible forms, for example *hortō*: "one of dative singular; ablative singular. The sentence shows which." All 207 glossary forms are covered. Regular forms come from `scripts/lib/paradigms.cjs` applied to draft dictionary data in `curriculum/lexicon/legacy-form-lexemes.json`; irregular words list only the forms the course uses. Every possible reading is listed and the program never picks one from context. The note is labelled "Draft note, not yet reviewed" in the app. |
| 13 | Typed answers accepted only the listed variants. | The words of an accepted answer in another order are now accepted (*Magna est arbor*). A different word or ending is still wrong. |
| 14 | The reader had no "next chapter" button. | Added; disabled on the last chapter. |
| 15 | `tests/phase7a-browser.test.cjs` failed about one run in five. | Two causes. First, a real bug: when a music file failed to load, the fallback music loop could restart while a microphone recording was in progress, or while the page was hidden. Fixed in `app/60-audio-ambience.js`. Second, a test fault: the test wrote a preference from a Playwright init script, and Chromium then sometimes presented an empty storage area after a reload of a `file://` page. Reproduced outside the app's own code paths; the test now writes the preference from the page. 25 consecutive runs pass. |

**Review needed.** The form notes are Claude's draft, not checked by a Latinist and not copied from a dictionary. The review sheet is `curriculum/lexicon/review-sheets/legacy-form-notes.csv` (one row per form, with verdict and note columns). Rebuild with `npm run build:form-notes`; `tests/form-notes.test.cjs` runs in `npm test`.

The same test fault was then found in `file-url-smoke`, `phase6-browser` and `phase7b-browser`, which failed in 1 to 3 of 8 runs on unchanged `main`. They received the same fix and each passed 12 consecutive runs. `phase3c-review-browser` and `phase3c-browser` also use init scripts; they did not fail here and were left alone.

## Gaps still open

These need a Latinist, a listener or an owner decision.

- **Form notes are unreviewed** (item 12) and list possible readings only; they do not say which reading a given sentence uses.
- **No approved lexemes.** `content/lexicon.js` is empty, so the four vocabulary measures and reviewed cards are dormant. All saved words are "legacy, not owner-reviewed".
- **Recordings.** None of the 75 recordings has been checked by ear against `pronunciation/LISTENING_SHEET.csv`. `npm run test:release` needs the private MP3s and cannot run in a clean checkout.
- **Open owner decisions from the Latin audit:** LX-015 wording; *reconstrūctiō* or *recōnstrūctiō*; *magnus* or *māgnus*; *dēest*; *Gāius*; *tonitrus*.
