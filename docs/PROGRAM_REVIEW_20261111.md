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

## Gaps not fixed here

These need reviewed Latin data or an owner decision, so they are listed and left alone.

- **Glosses ignore the inflected form.** Clicking *it* shows "to go" and *mātrī* shows "mother". A learner is not told the person, number or case. This needs a reviewed form-level table; it should not be generated unreviewed.
- **Typed answers accept only the listed variants.** A correct sentence in another word order (*Magna est arbor*) is rejected. Item 4 softens this. A real fix needs an agreed list of accepted answers per question.
- **No approved lexemes.** `content/lexicon.js` is empty, so the four vocabulary measures and reviewed cards are dormant. All saved words are "legacy, not owner-reviewed".
- **The reader has no "next chapter" button**; the learner moves on through Exercitia or the chapter list.
- **One browser test is unreliable.** `tests/phase7a-browser.test.cjs` ("No autoplay on reload") failed in 2 of 4 runs on unchanged `main` and 1 of 4 runs with this change. It was not investigated here, so it is not known whether the test or the ambience code is at fault.
- **Recordings.** None of the 75 recordings has been checked by ear against `pronunciation/LISTENING_SHEET.csv`. `npm run test:release` needs the private MP3s and cannot run in a clean checkout.
- **Open owner decisions from the Latin audit:** LX-015 wording; *reconstrūctiō* or *recōnstrūctiō*; *magnus* or *māgnus*; *dēest*; *Gāius*; *tonitrus*.
