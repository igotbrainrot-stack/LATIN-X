# LATIN X / Tablinum — Phase 3b complete Claude handover

**Date:** 6 November 2026, Sydney.  
**Branch:** `feature/phase3b-content-loader-20261106`  
**Parent:** `feature/phase3-runtime-20261105` (Phase 3a).  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/feature/phase3-runtime-20261105...feature/phase3b-content-loader-20261106

**DELIVERY:** Review the ENTIRE repository branch ZIP (runnable index.html, Windows launchers, app/, content/, lessons/, curriculum/, scripts/, tests/, workflows and all review documents), not only this handover. Double-click `Start Tablinum.cmd` after extracting the full ZIP. No build or internet required for learning.

## Pass 1 — implementation

- Corrected Claude's Phase 3a blocker: the HTTP smoke-test server now serves the requested JS assets with correct MIME types, instead of returning `index.html` for every URL. The original safety-net test has NOT been deleted, weakened or skipped. Corrected Phase 3a source-check run https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42058673497 passed Linux, Windows and visual Chromium jobs.
- Added `app/30-content-loader.js` exposing `Tablinum.catalogue`, `registerChapter`, `loadChapter` (on-demand classic-script injection, caching and shared in-flight promises) and `legacySourceAt`, with strict local path whitelisting, unknown-ID rejection, missing-file alerts and no automatic approval.
- `index.html` now loads compiled `content/catalogue.js`, `content/lexicon.js`, eight `content/legacy/chNN.js`, the loader, then the original app runtime in that order. No fetch(), ES modules or server in the downloadable app.
- Removed the duplicate eight-chapter `L=[...]` authoring literal from browser runtime. The reader, quiz and progress receive the **same** original lesson source from the eight compiler-generated `legacy_source` objects. All eight legacy chapters, 67 sentences, 24 questions and 8 cloze exercises are protected by source/content lock tests.
- The loader also supports later genuinely approved course lessons (published into the compiler catalogue) with ephemeral selection, without rewriting old v4 chapter progress. New-course reading may display, but unsupported new exercise types are NOT automatically graded. Compiler-approved lexicon hints only; the 128 unsigned Claude candidates are never promoted.
- Kept original SHA-locked source in `archive/index-v04-inline-phase3a-baseline.html`; `scripts/lib/extract-legacy.cjs` uses this source for all authoring and compiler comparisons. Original SHA-1: `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20`. The Phase 3b source test now checks that every generated chapter equals that frozen original, rather than expecting the deliberately changed browser JS to be byte-identical.
- Added negative and browser tests for concurrent script loads, missing files, illegal paths, unapproved status, a synthetic-only in-memory approved course, no fake automatic grading, original v4 key preservation and returning to the original lesson.

## Pass 2 — testing

**Node 22 commands:**
```
npm test
npm run test:phase2
npm run test:phase3b
npm run test:lexemes
npm run test:package
```

**Windows/browser commands after Playwright installation:**
```
npm install --no-save playwright
npx playwright install chromium
npx playwright install firefox
npm run test:browser
npm run test:file
npm run test:phase3b-browser
npm run test:review-browser
```

The dedicated `.github/workflows/phase3b-content-loader.yml` workflow runs Linux and Windows tests; Windows also exercises actual HTTP browser visual checks and `file://` tests in Chromium, Chrome, Edge, Firefox and the owner vocabulary editor. An earlier fully successful Node/Windows run on SHA `40832a6c1ddae72e06a533e3120a4c06470f872e` is https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42060281048. **Check the newest run for the final head SHA**; never call a later commit tested merely because an earlier commit passed.

**Expected and essential RED gates:**
```
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```
No signed new lexemes, no verified new-course introductions, no approved playable new-course lessons. The 130-chapter plan is not a 130-chapter runtime.

## Limitations and open reviews

The Phase 2 compiler still emits data-only `TablinumCompiledContent[id]` assignments; the loader accepts these and will also accept `registerChapter(data)` scripts, but the deterministic compiler's output format was not changed in Phase 3b. Chapter source hashes exist in the catalogue but browser-side cryptographic drift checking is not implemented. This loader is **not** the Phase 3c v4→v5 migration. The old 100-note cap and startup normalization remain known legacy limits.

**Waiting on the owner:** sign/reject 128 Claude-drafted vocabulary rows with genuine review/date/macron/source evidence; verify and sign 15 proposed paradigm sample tables; carry out the real Windows checklist and restore an actual old profile; later sign original pilot Latin chapters. Owner tier is always labelled **not Latinist-verified**. No Familia Romana text/audio/plots, commercial scans or unknown media were uploaded to Git.

## Claude next review instructions

Review the ENTIRE ZIP. Re-run Linux and Windows CI (especially HTTP and real local file:// browsers), inspect all eight legacy source hashes and progress/backup compatibility, test missing local file recovery and concurrent loads, and audit the new course adapter against real compiler outputs. Report concrete bugs with paths/line numbers; do not invent approvals. Fix on a single new branch built on Phase 3b, not main, and return an **entire current runnable ZIP plus this updated handover**.

**Next exact build task:** Phase 3c — non-destructive, idempotent v4→v5 migration with untouched old raw string, backup snapshot, six original fixtures including 120 notes, byte-size storage warnings, v2/v4/v5 restore, Windows browser tests. Do not merge to main or release.
