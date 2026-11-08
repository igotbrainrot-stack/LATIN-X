# Claude handover — Tablinum v0.4

Prepared 4 November 2026 from the user-uploaded index.html and Tablinum review.docx.
Repository was initially empty. Only a bootstrap README was added to main. All work is on fix/tablinum-v04-review-20261104; no merge.

## Files
- index.html: updated standalone app.
- archive/index-v02-original.html: original uploaded app, preserved without modification.
- tests/smoke.test.cjs: Node mock regression tests.
- docs/RESOURCE_INVENTORY.md: all 45 uploaded attachments, none bundled.
- docs/REVIEW_CHECKLIST.md: test plan.

## Direct v0.4 fixes
1. State normalization validates all fields, clamps chapter and sentence indices, sanitizes vocab/notes/answers and persists clean data on startup. Backup restores require a supported envelope and object state, with legacy v0.2 support.
2. Imported text Previous returns to Chapter I instead of corrupting the chapter index. Sentence splitting no longer uses Safari-incompatible lookbehind. Learners can edit segmentation and save it locally.
3. Corrected canis, pānis and pānem, habitāre, omnēs, Hic gloss, genitive question order, per fenestram and grammar notes for past and future verbs. Chapter VI asks Quō canis currit? rather than an answer-revealing gender form.
4. The 24 questions accept expected short or full model-sentence answers. Multiple-choice feedback records the selection and locks correct completions. Eight cloze exercises are integrated with revised prompts.
5. Latin-first sentence assistance progresses from tailored contextual Latin to prioritized word glosses to optional English. Self-rated confidence and hints persist across lessons.
6. Untimed audio does not seek. Timed audio selections and Prev/Next seek only to supplied intervals. Clock updates alter selection styling without replacing the reading page. Intervals are checked for types, overlaps, ordering and duration. An optional single-sentence mode stops at the measured end. Audio files are kept per chapter in the current session.
7. Starter glossary is prototype-safe with extra forms. Import file-size caps, visible storage-failure warnings, stronger contrast, Latin language markers, keyboard word navigation, an accessibility status region and mobile audio dock are included.

## Actual verification
- Application JavaScript parsed successfully.
- 20 simulated V8 interaction checks passed against the committed v0.4 source: malformed state recovery, course 8/24/8 counts, answer correctness, custom text, hint retention, MC locking, cloze, untimed non-seeking, timed seeking, invalid range rejection and no full reader redraw on a time update.
- Historical note: Node was initially unavailable locally, but GitHub Actions subsequently ran the committed smoke suite under Node 22 and passed in run 41795160656. Browser/audio tests remain outstanding.
- No real-browser UI, audio decoding, speech, mobile accessibility, complete answer matrix or qualified Latinist review was done. Do not imply otherwise.

## Remaining issues
- Latin is a draft. Chapters VII-VIII introduce complex tense changes too quickly.
- Browser voice reads only the selected sentence and may use a non-Latin default voice.
- Dictionary is a small hand-authored glossary, not LatinCy or Whitaker.
- Review scheduler is a basic interval algorithm, not TS-FSRS.
- No automatic audio alignment, verified waveform or WaveSurfer authoring interface.
- Audio does not persist across page reload; there is no IndexedDB media store.
- Some UI actions still re-render views, potentially disrupting keyboard focus. Test on real devices.
- Written answer checker cannot evaluate all valid alternate Latin grammatical constructions.
- No user-supplied third-party archives or copyrighted book/audio are integrated. Validate provenance and exact licences before use.

## Review requested of Claude
Compare against the original HTML, run npm test, execute all eight lessons and 32 exercises in a browser, inspect malformed backup recovery, check actual timed and untimed audio, review all Latin/macrons and mobile/keyboard accessibility, and prepare a prioritized defect list with reproducible evidence. Do not merge this branch. Stabilize before adding new features.

## Claude v0.4 follow-up and v0.4.1 amendment (4 Nov 2026)

The user's second review reports that v0.4 fixed all P1 problems and most earlier P2 issues. This amendment responds to the remaining issues raised in that review without expanding the core course:

1. With Guidance off, the hint controls are now hidden; clicking the stale control programmatically does not advance hints. Previous hint levels remain if guidance is turned back on.
2. Removed the 67 new Latin hint strings, including previously flagged panem/vides and unfamiliar vocabulary. Level-one hints now reuse existing story material (adjacent preceding sentence or original chapter context). This avoids newly invented clue vocabulary but is intentionally a temporary teaching compromise. Latin shown in contextual hints is word-clickable for glossary help.
3. The top lesson button is now mode-specific: Browser voice, Timed recording or Untimed recording.
4. Chapter II's four-person answer accepts the explicitly verified full alternative Quattuor hominēs in vīllā habitant, without indiscriminate token containment matching.
5. Chapter I no longer uses Tītus/Mārcus distractors before those characters are introduced; the alternatives now reuse words in Chapter I. Small-text contrast and older Safari Object.hasOwn compatibility were improved.
6. Focus restoration records the sentence and word position so repeated words such as Līvia do not redirect focus to an earlier sentence; a previous inline gloss is removed when sentence selection changes.
7. Single-sentence audio stopping now uses requestAnimationFrame monitoring when available, plus the existing timeupdate check as a fallback. It targets the supplied end interval with a small margin; this is not sample-accurate or acoustic alignment.
8. Added regression checks for these changes to tests/smoke.test.cjs. Originally tested only in V8; as of v0.4.2, GitHub Actions run 41795160656 has successfully executed npm test in Node 22. Genuine media testing remains mandatory.

**Important unchanged limitations:** Short natural-method stories are still too brief for later tense constructions; the learner needs longer original, graded material in the next content phase. No user-provided third-party data or audio archive has been embedded in this branch. The repo still has no FSRS, LatinCy, Whitaker, EPUB, WaveSurfer or aeneas integration. Do not begin those changes until this source passes browser and linguistic review.

## v0.4.2 amendment — third Claude review (4 Nov 2026)

Claude's v0.4.1 review confirmed the earlier fixes but found that keyboard arrows crashed inside level-one hint words. The code was directly corrected to search the closest .words or .hint-words container and guard against a missing parent.

The original eight written exercises now each carry three explicitly accepted answer variants. For example, the Chapter II genitive question allows Līviae, frāter Līviae est, and Tītus est frāter Līviae, plus the original model sentence. Broad substring matching has deliberately NOT been added.

New regression coverage checks keyboard navigation in the story and hint text, all eight variant lists, and rejection of negated wrong answers. The committed smoke-test code passed in a simulated V8 runtime with host shims, then GitHub Actions run 41795160656 executed npm test under real Node 22 and reported PASS. Real browsers, audio, voice and Latinist review remain untested. Continue to treat Chapters VI–VIII and the 35-chapter expansion as separate future content work. No supplied third-party archives have been integrated.

## Manuscript redesign addendum — strictly visual

Branch `design/classical-manuscript-20261104` begins at the reviewed v0.4.2 code and **only modifies presentational HTML/CSS** inside `index.html`. The complete application script is unchanged byte-for-byte: script FNV-1a `e3aa2876`, Adler32 `992012759`. New tests/design-integrity.test.cjs enforces this contract. See docs/MANUSCRIPT_DESIGN.md for palette, rationale and CSS selectors.

Claude should inspect the new layout at desktop, tablet and narrow phone sizes, check contrast and focus, verify original illustration scenes and all activity types render, and test that the sticky audio strip never obscures important controls. Run `npm test`; optionally run `npm run test:browser` with Playwright, which generates screenshots. Do not introduce new lesson data, change audio timing, or rewrite application logic as part of this visual design review.

## Claude manuscript review (3) response — 4 November 2026

Source: user-supplied `Tablinum review(3).docx`, manuscript redesign review. Applied changes **in the actual `index.html`**, maintaining the exact v0.4.2 JavaScript and eight-lesson content:

- P2: Removed the strong grayscale/sepia/saturation filter from all narrative SVGs. The red rose (`rosam rubram`) in Chapter III, green tree and yellow sun retain the original SVG fill colours; a subtle warm paper-coloured plate remains around the illustration.
- P2: At 720px and below, collapsed the title block, hidden optional tagline/version text only on phone screens, reduced section-tab/chapters height and the illustration plate, and compacted the dock to a single-line audio mode description with a four-column control row. The existing controls/semantics remain.
- P3: Changed empty `.app-status` from `display:none` to a zero-height/zero-padding mounted region. Its `aria-live="polite"` attribute and JS updates are untouched.
- P3: Corrected the footer from v0.4.1 to the current v0.4.2 manuscript edition.
- Optional SVG aspect-ratio crop was **not** applied: we chose to preserve the complete existing drawings instead of cropping semantic elements at the edges.

Expanded design-integrity and Playwright browser tests assert original SVG colours, current version footer, empty status region visibility in the accessibility tree, and mobile first-sentence visibility above the sticky audio dock. This work is exclusively presentational and does not add the proposed 35-chapter curriculum. The original JavaScript signature remains `e3aa2876` FNV-1a / `992012759` Adler32.
