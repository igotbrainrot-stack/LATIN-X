# Bug audit — November 2026 redesign

Branch `ui/premium-redesign-20261115`, based on `release/easy-install-20261111` at `e442e15`
(the tip of PR #19). Before any change, every suite on that base passed (see `TEST_REPORT.md`,
"Baseline"). The audit below was done by reading the runtime and by using the program in Chromium at
1440, 1366, 820, 390, 360 and 320px, in light and dark.

Severity: **High** blocks or misleads a learner; **Medium** degrades a normal session; **Low** is polish.

## Fixed in this branch

| ID | Sev. | Defect on the base | Cause | Fix | Regression test |
| --- | --- | --- | --- | --- | --- |
| R-01 | Medium | A brand-new learner was told "Export a backup to protect your progress" on first launch, before having any progress. | The reminder only looked at the last export date. | The reminder is held back while the profile has no answers, saved words, notes or word checks. | `redesign-browser` step 1 |
| R-02 | High | In browser-voice mode the audio strip had no Play button, so the strip under a story could not start that story's audio. | Play was hidden unless a file was attached. | Play is always shown on the reader and speaks the selected sentence; Pause/Stop is disabled when nothing is playing. | `redesign-browser` step 5, `browser-voice-fallback-browser` |
| R-03 | Medium | A selected sentence and a sentence being read aloud looked the same, and the strip did not say whether anything was playing. | One `.selected` style for both. | Separate `.is-playing` state, a Stop control on the sentence, "Sentence n of m · playing" in the strip, `data-playing` on the strip. | `redesign-browser` step 5 |
| R-04 | Medium | On a phone the audio strip's note was cut off, its buttons crowded the text, and the toast could cover the strip. | Fixed-width strip designed for desktop. | Stacked strip on phones, arrow-only step buttons under 380px, toast positioned above the strip. | `redesign-browser` step 11 (320 and 390px), `browser-smoke` |
| R-05 | Low | The review card used a second `<h1>` for the Latin word. | Heading used for size. | The word is an `<h2>`; each view has one `<h1>`. | `redesign-browser` steps 1 and 3, `phase12-axe-browser` |
| R-06 | Low | Several runtime strings carried inline styles (font sizes, margins, one hard-coded border colour `#dfe7db`), so those elements ignored the stylesheet and could not follow a theme. | Inline `style="…"` in generated markup. | Replaced by classes that use tokens; the only inline styles left set a width or a progress value. | `redesign.test.cjs` (no raw hex in `lx-app.css`), `phase12-axe-browser` dark pass |
| R-07 | Low | The line above each illustration read "This is a visual preview alongside the original legacy lesson; its Latin text and grades are unchanged" — a developer note shown to learners. | Review-stage wording left in. | The caption keeps "Approved Book I artwork", the subject, and the Picture Practice link, and sits under the picture. The "related illustration (not a literal depiction…)" notice for lesson VIII is kept. | `legacy-main-art`, `legacy-main-art-browser` |
| R-08 | Medium | Backup, restore, reset and recording export sat at the bottom of the progress page, under the course map. | Accreted layout. | Moved to Settings → Your data; Progress links there. | `file-url-smoke`, `phase7b-browser`, `guided-lessons-browser`, `phase12-accessibility-browser` |
| R-09 | Low | The glossary did not exist as a view: a word could only be looked up by finding it in a story. | Missing feature. | Words → Glossary: search in Latin or English, filter, forms met, occurrences that open the sentence. Built only from existing lexicon and form-note data. | `redesign-browser` step 6 |
| R-10 | Low | `installControls()` in `60-audio-ambience.js` assumed the created element supported `querySelector`. | Unchecked DOM call. | Looks the control up from the document and checks it. | `phase7a-audio` |

## Found and deliberately not changed

These need the owner or a Latinist. Nothing here was settled by this branch.

| ID | Sev. | Observation | Why it was left |
| --- | --- | --- | --- |
| O-01 | Medium | Region chips under each picture show internal identifiers with hyphens (`arbor-magna`, `arbor-parva`). | The labels are the approved region ids. Showing "arbor magna" would be new learner-facing Latin. Needs the owner's wording. |
| O-02 | — | 58 Chapter II–VIII Arjun recordings are still "awaiting owner review" (U-01, U-02, U-05). | Owner decision. The interface labels them as pending and does not treat them as approved. |
| O-03 | — | "Recordātiō incepta" replacement (LX-015 / U-06) and wording fixes LX-020 to LX-025 are unapplied. | Owner decision. The strings are unchanged. |
| O-04 | Low | Picture Practice says prompts are "awaiting Claude's review and the owner's sign-off". | Existing status wording about content approval; changing it is the owner's call. |
| O-05 | Low | Review and Progress still contain phrases such as "unsigned legacy free cards" and "Legacy saved words … (not automatically owner-approved)". | They are honest status statements. Plainer wording is recommended but changes how approval is described. |
| O-06 | Low | The footer says "Version 0.4.2 Manuscript Edition review build". | Version and edition naming belong to the owner; a contract test pins the string. |
| O-07 | Low | The licence file shipped in the `@fontsource-variable/source-sans-3` package names "Google Inc." while the upstream font notice names Adobe. | Recorded in `ATTRIBUTION.md` and `docs/LICENCE_REGISTER.md`; the file is shipped unmodified. |

## Not verified

- No test was run on a real Windows 11 or Linux Mint desktop. Everything was run in headless Chromium 153 on Linux in a cloud container. The installer scripts were exercised only as far as `npm run test:easy-install` goes.
- Firefox, Edge and Safari were not run.
- No screen reader (NVDA, Orca) was used. axe-core found no violations, which is not the same as a manual audit.
- Audio was checked for state and labels, not listened to.
- Latin correctness was not reviewed.
