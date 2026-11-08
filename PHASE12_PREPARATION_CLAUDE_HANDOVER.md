# LATIN X — Full Claude handover: Phase 12 non-content preparation

**Date:** 6 Nov 2026 (Sydney).  
**New branch:** `feature/phase12-accessibility-migration-20261106`.  
**Direct parent:** `review/phase8-20261105`, head `7173993eedc3eaceda40f521fec9c1bf905b1133`.  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/review/phase8-20261105...feature/phase12-accessibility-migration-20261106  
**Work type:** reviewed-branch continuation, non-content Phase 12 preparation. NOT a phase-complete acceptance, merge, release or owner signature.

## Full handover files

The complete runnable source ZIP is delivered alongside this Markdown file. It includes every existing app/content/lesson, curriculum documents, original legacy eight lessons, eight **unsigned** Book I pilot manuscripts, FSRS vendor and licence, Windows `.cmd` launchers, art editor, music, source tests and previous handovers. Extract; double-click **Start Tablinum.cmd** or `index.html` for the app; optional Node 22 `npm test`. No installation or internet needed for the learner.

## Pass 1 — implemented

1. Preserved SHA-locked archived v0.4.2 source and unchanged `app/legacy-runtime.js` and eight chapter contents. Added a single classic-script file `app/80-accessibility.js` after the legacy runtime to insert explicit labels for personal notes, imported Latin text and custom sentence split editor (all dynamically replaced by old UI). It names the chapter/guidance landmarks; it never touches localStorage, grades or audio.
2. Strengthened `tests/phase3a-relocation.test.cjs` to allow **exactly** the new enumerated classic script while otherwise comparing the app HTML byte for byte to the original plus known scripts.
3. `tests/phase12-accessibility.test.cjs`: static semantic checks, accessible-label DOM stub test, focus, Latin markers and eight sample WCAG 2 token contrast calculations.
4. `tests/phase12-long-profile.test.cjs`: realistic synthetic old profile with 160 notes, 820 cards, custom splits, unknown fields and raw v4 preservation, snapshot, no reopening writes, v5 backup round-trip and corrupt-data refusal.
5. Added Windows `file://` Playwright regression (`tests/phase12-accessibility-browser.test.cjs`) plus GitHub Actions Windows Chromium/Chrome/Edge/Firefox matrix and Linux gate assertions. Updated README and authored `docs/PHASE12_ACCESSIBILITY_AUDIT.md`.

## Pass 2 — results and limitations

- **Executed:** `npm run test:phase12` and complete Node `npm test` on local Node 22.16.0. Both pass, including all earlier Phase 0–8 regression tests. Historical source lock passed. Long profile test initially flagged only a `null`-prototype vs plain-object deep equality mismatch in the test assertion; it was corrected by a JSON plain-object comparison, with no app migration changes.
- **Not executed locally:** real browser test or owner Win10/11, native Edge/Chrome/Firefox, screen reader, microphone, real audio and user-specific progress. Local environment did not have Playwright installed for the test harness at authoring time. The new workflow attempts browser tests on hosted Windows when pushed; inspect the actual workflow result and report failures rather than claim success.
- **No actual signing:** reviewed vocabulary 0/128, paradigm 0/15, eight unsigned Book I draft chapters, nine unapproved art scenes. Seikilos music remains approved by Claude, but image production awaits the owner character sheet.
- **Gates:** Do not turn green `--require-review-ready` or `--require-introduced-1500/3000` without signed course data. No new course material was introduced.

## Claude's review task

1. Inspect the additive module for duplicate labels, MutationObserver recursion, focus handling and `file://` browser compatibility. Check that original `app/legacy-runtime.js` SHA stayed identical to parent.
2. Rerun full Node/Windows browser suites and inspect Chromium/Chrome/Edge/Firefox `file://` results. Test NVDA manually if available and mark clearly NOT TESTED otherwise.
3. Verify sample contrast calculations and fix any real text failure, without altering the study content or fabricating sign-off.
4. Return one new review branch based on this exact branch, not `main`, with complete ZIP and a written review. Do not merge any stacked PRs or publish a release.

## Waiting on owner / next

- Owner must review initial Roman family character sheet, then final WebP/thumb artwork + region polygons and personally approve each image.
- Owner must sign/reject 128 legacy word candidates, 15 paradigm tables and eight pilot chapters, and run Windows hardware backup/recording check.
- Resume Phase 8 image creation after character-sheet approval; Phase 9–11 Latin chapters only after approved pilot. Continue independent Phase 12 checks in meantime.