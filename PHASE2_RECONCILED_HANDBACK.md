# LATIN X / Tablinum — Phase 2 reconciled handback

**Prepared:** 6 November 2026 (Sydney).
**Current branch:** `fix/phase2-reconciled-20261105`
**Parent:** `fix/phase2-review-restoration-20261105`
**Compiler source:** `feature/phase2-lesson-compiler-20261105`
**GitHub compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/fix/phase2-review-restoration-20261105...fix/phase2-reconciled-20261105
**No main merge, release, force-push or learner migration.**

## Summary and result

This branch now **contains both sides** of the previously divergent work:
the Phase 2 lesson compiler (`scripts/compile-content.cjs`, `scripts/legacy-to-lesson.cjs`,
8 legacy JSON lessons, generated JS catalogue, derived vocabulary ledger, reports and a blank
new-course Chapter 1 scaffold) **and** the offline owner vocabulary reviewer, Claude's 128
unsigned draft rows, 172-feature editorial grammar gate and gated regular paradigm proposals.

The original `index.html` is unchanged, with SHA-1
`9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20` confirmed in Linux CI.
The original eight chapters are playable offline. The **new 130-chapter course is not yet playable**.

Read `GPT_HANDOVER_NEXT_PHASES.md` and `CLAUDE_IMPLEMENTATION_ROADMAP.md` for the full project plan.

## Pass 1 — integration and engineering

1. Created the branch **from the current owner-review restoration branch**, preserving its Windows review launchers and 128-row unsigned draft.
2. Imported the compiler-only files by **existing Git blob SHA**, preserving original source and choosing explicit winners for shared files. Kept the strict grammar source; chose the compiler's generated ledger and roadmap validator, instead of overwriting the reviewer.
3. Rewired `compile-content.cjs` to the new `tablinum.strict-grammar-features.v1` schema and `scripts/lib/grammar.cjs`:
   - every tagged `lx` token needs a mapped, introduced grammatical feature;
   - unknown, incomplete or premature morphology is a hard compiler error;
   - grammar previews are limited to two sentences per chapter, require a Latin margin note and a token-specific human reviewer;
   - manually-tagged clause features are checked separately.
4. Rewired forms:
   - explicitly reviewed irregular/manual forms may pass exact surface + UD morphology;
   - generated regular forms need their pattern to have a **real owner-signed table**;
   - current `approved_patterns` is empty, so regular proposals do **not** authorize any production form.
5. Preserved compiler-generated content and vocabulary provenance. Fixed new-word density to count each newly introduced lexeme **once per reading segment**, without weakening recurrence frequency thresholds.
6. Merged npm scripts so tests cover the old app, review, grammar, paradigms and compiler.
7. Added `scripts/render-paradigm-samples.cjs` to generate 15 owner-readable proposal tables at `docs/owner/PARADIGM_SAMPLES.md`, leaving all approvals blank.
8. Added a Linux/Windows CI pipeline to regenerate derived files and verify their deterministic contents, test old-state safety, and package the complete branch.

### Pass 1 real defect discovered and corrected

The source compiler's `scripts/lib/tokens.cjs` rejected the standard UD tag `Person=3` because its morphology parser required values to begin with a letter. The initial CI run failed. The parser now permits numeric values and the subsequent full test run passed. This is a real fix, not a suppressed error.

## Pass 2 — independent regression and verified runs

**Linux Node 22:** `npm test`, `npm run test:phase2`, `npm run test:lexemes`, `npm run test:package`, deterministic content generation and separate owner paradigm rendering were run by GitHub Actions.

**Windows Node 22:** the same tests were run, then Playwright Chromium `file://` tests for the original app, its backups, the new vocabulary review editor, and Microsoft Edge `file://` tests for the original app.

- Combined build, first completed cross-platform check: https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42043849071 — **both jobs passed**.
- Linux CI separately verified the original `index.html` SHA-1 as `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20`.
- The compiler's 8 preserved legacy chapters, draft exclusion, deterministic output and injected **synthetic (non-production)** signed fixtures are covered.
- Added integrated negative tests: chapter 3 imperfect, chapter 1 subjunctive, unknown morphology, and generated forms from an unsigned paradigm. **No actual user signature was added**.
- A real Windows Firefox run and manual owner Windows checklist have **not** been performed. Don't claim otherwise.
- The CI execution validates code paths, **not linguistic accuracy** of all generated forms. Human sample-table review is still required.

## Outputs and commands

In the extracted full project on Windows, learner can double-click `Start Tablinum.cmd` (no install).
For owner editorial workflow, double-click `Start Vocabulary Review.cmd`, then load
`curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv`.

With Node 22:

```powershell
npm test
npm run test:lexemes
npm run test:phase2
npm run test:review
npm run test:grammar
npm run test:paradigms
npm run test:package
node scripts/render-paradigm-samples.cjs --check
```

**Expected to FAIL until genuine owner review/content:**
```powershell
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

The derived ledger `curriculum/vocabulary-introductions-130.json` is generated only by the compiler;
no editorial budget or legacy glossary entry is evidence of a new-course introduction.

## Waiting on the owner

- Sign or reject the **128** Claude-proposed lexemes from the offline review page; real owner name/date, checked sense, checked macrons, sources and rights, distinct Claude drafter; do not imply Latinist verification.
- Audit and sign the **15** generated sample paradigm tables in `docs/owner/PARADIGM_SAMPLES.md`; never autogenerate approver/date fields.
- Complete the real Windows checklist in `docs/WINDOWS_OFFLINE_CHECK.md`.
- Later, inspect/sign individually drafted pilot Latin chapters (Phase 4).

**No owner action is needed to begin Phase 3 or to draft unapproved chapters.**

## Unresolved engineering and linguistic limitations

- The 172 mapped grammar tags are a provisional software coverage map, **not proof** of all morphological/syntactic accuracy or 130-chapter readiness.
- Verb paradigms are incomplete for multiple moods and compounds; some stems and quantities require correction by a Latin expert. Unapproved generated forms are deliberately blocked.
- Some historical GPT provisional comparison artifacts from the earlier `LATIN_X_COMPLETE` archive were not recovered byte-for-byte; the attached 128-row Claude proposal is present.
- No new chapter of the 130 is approved/playable. Chapter 1 remains a blank, unpublished scaffold.
- No user speech grading, FSRS migration, new audiobook alignment, state-v5 migration or image library added.

## Next task (begin immediately, in ONE separate branch)

**Phase 3a: relocate the unchanged inline application JavaScript into ordered classic external scripts.**
Branch: `feature/phase3-runtime-20261105` based on this Phase 2 branch.
Do not change the legacy reading experience or learner storage key. Update source-reading
test harnesses for classic-script loading and replace the old whole-JavaScript design fingerprint
with the locked original chapter/sentence/question content test. Do not start Phase 3b or 3c
until 3a tests run on Linux and Windows, including real `file://` browsers.

## Full Claude review handover requirement

Deliver the **entire runnable repository ZIP**, not Markdown alone: app, launchers,
curriculum, scripts, generated content, 8 original lessons, owner review CSV, all tests,
CI workflow, this handback, older Claude comments and roadmap. See `CLAUDE_REVIEW_PACKAGE`
for the two-pass review prompt. Keep proprietary textbook/audio scans and private files out of Git.
