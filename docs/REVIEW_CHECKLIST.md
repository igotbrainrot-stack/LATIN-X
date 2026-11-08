# Claude review checklist — Tablinum v0.4

Mark every item PASS / FAIL / NOT RUN with evidence and browser versions.

## Security and state
- [ ] Start the app in a real browser and inspect console errors.
- [x] Execute npm test under Node 20 or later — GitHub Actions run 41795160656 passed under Node 22. Claude should reproduce locally as desired.
- [ ] Check malformed backup fields are safely normalized; missing state is rejected.
- [ ] Restore a valid legacy v0.2 backup with progress and notes.
- [ ] Simulate unavailable local storage; see warning.

## Latin and exercises
- [ ] Validate all 67 story sentences, macrons, vocabulary and translations with a qualified Latinist.
- [ ] Review canis, pānis and pānem, omnēs, habitāre, Hic gloss, per fenestram and question wording.
- [ ] Check all 24 original questions and all eight cloze activities with wrong, right and full-model answers.
- [ ] Ensure completed multiple-choice answers remain locked.
- [ ] Assess Chapters VII-VIII grammar pacing and repetition.

## Reader and accessibility
- [ ] Check three progressive hint levels for every sentence.
- [ ] Confirm per-lesson hint and confidence values survive navigation and reload.
- [ ] Test unknown glossary words, including words matching JavaScript prototype names.
- [ ] Check keyboard word arrows, focus retention, screen reader Latin markup, feedback announcements.
- [ ] Verify 375px mobile layout, contrast and the mobile audio dock.

## Import and audio
- [ ] Untimed MP3 selection does not seek; Play resumes recording position.
- [ ] Timed selection and Prev/Next seek to real intervals only.
- [ ] Timed audio updates selected styling without resetting active notes.
- [ ] Invalid, overlapping, duration-exceeding or mismatched interval JSON is rejected.
- [ ] Check single-sentence mode stops at the supplied interval end.
- [ ] Check per-chapter audio switching and attachment persistence during current tab session.
- [ ] Import .txt, edit sentence splits, reload, and verify the result.
- [ ] Test over-limit files, backup export/restore and a device with no Latin voice.

## Licences and scope
- [ ] Confirm no third-party large archives or copyrighted Familia Romana text/audio are in the branch.
- [ ] Check resources inventory, original licences and provenance before planning future integrations.
- [ ] State which resources are actually integrated (currently none).

## Deliverable
Return a severity-ranked defect report: file/line, reproduction, expected, actual, fix, and evidence. Distinguish tested defects from theoretical issues. Do not merge the review branch before user approval.

## Additional v0.4.1 regression checks

- [ ] Toggle Guidance off: help buttons disappear rather than silently changing level; restore and confirm prior level is retained.
- [ ] Latin context hints show an existing sentence or scene caption, with clickable words and no new unreviewed hint constructions.
- [ ] Check all chapters' context hints against the existing stories for relevance; prepare improved original graded clues only after linguistic review.
- [ ] Confirm reading Play label changes correctly between browser speech, timed recording and unsynchronized recording.
- [ ] Confirm the alternate full Latin response Quattuor hominēs in vīllā habitant is accepted without accepting non quattuor.
- [ ] Check duplicate word focus, especially Līvia in multiple sentences and words in hint clues; no stale inline word meaning after changing sentences.
- [ ] Verify older Safari syntax does not depend on Object.hasOwn or lookbehind regular expressions.
- [ ] Test actual one-sentence playback boundary against real media; animation-frame check should be more responsive than timeupdate, but precision is not guaranteed.

## v0.4.2 follow-up checks

- [ ] Focus a Latin word inside a first-level clue, press Left and Right arrows; focus should move between clue words without a TypeError.
- [ ] Repeat arrow navigation in the normal story.
- [ ] Check all three accepted variants and the full model sentence for each of eight written exercises.
- [ ] Ensure nonsensical negated answers do not pass and no substring matching is introduced.
- [x] Run npm test in Node 20+ and record actual output — CI log: PASS v0.4.2 course, state, answer variants, hint arrows and audio-mock checks.
- [ ] Execute a real Chrome/Firefox browser pass, exercise all 32 graded items and test progress persistence.
- [ ] Obtain Latinist review of the new accepted answer variants before treating them as verified.

## Classical manuscript visual-only review

- [ ] Verify lessons, all 32 graded activities, dictionary, Memoria, Bibliothēca and progress still work.
- [ ] Confirm `tests/design-integrity.test.cjs` passes with unchanged v0.4.2 application script.
- [ ] Verify desktop 1440px reading width, manuscript margins and well-separated serif typography.
- [ ] Verify 390px phone and 768–1100px tablet: no page-wide horizontal overflow, chapter strip remains scrollable, audio controls are visible.
- [ ] Inspect header, folio navigation, selected-sentence treatment, contextual annotations, quiz feedback and editable text fields.
- [ ] Inspect sepia-toned existing SVG scenes; no chapter scenes are lost or misleading.
- [ ] Test contrast, focus outlines, keyboard navigation and screen-reader-friendly semantics with the new colours.
- [ ] Confirm no network requests for fonts, external images or new libraries.
- [ ] Inspect desktop and mobile screenshots created by the GitHub Actions Chromium smoke test, or run that test locally.
- [ ] Keep this a design-only review; do not merge or mix with the planned curriculum expansion.

## Manuscript review (3) acceptance — 4 Nov

- [ ] Chapter III scene still shows the original red rose; no desaturation filter on `.scene svg`.
- [ ] Chapter I tree retains green and sun yellow, with no text-only teaching clues lost.
- [ ] On a 390 × 844 phone without scrolling, at least the first Latin sentence enters the usable viewport above the audio dock.
- [ ] The narrow-phone header omits only the optional tagline/version and still shows Tablinum.
- [ ] The compact audio strip keeps readable Play, Stop/Pause, Previous and Next controls; mode and voice information can still be found.
- [ ] The empty `.app-status` remains in DOM with `aria-live="polite"`, without taking layout height when unused.
- [ ] Footer identifies v0.4.2 Manuscript Edition, consistent with the header.
- [ ] Desktop 1366–1440px styling remains refined parchment with intact original SVG imagery.
- [ ] Tests: run `npm test` and `npm run test:browser`; check the new third screenshot `tablinum-rose-ch3.png`.
- [ ] Confirm the original embedded JavaScript and lesson data are unchanged from v0.4.2.
