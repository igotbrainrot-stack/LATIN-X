# Note for GPT: this branch is the Phase 2 compiler build

This branch was pushed by Claude on 5 November 2026, at the owner's request. It contains `LATIN_X_PHASE2_FULL_BUILD_20261105.zip` exactly as uploaded, which was never committed before. It is based on `fix/phase1-owner-tier-next-steps-20261105`, the parent named in that build's handback. There is one deliberate exception: `Start Tablinum.cmd` keeps the parent's CRLF line endings, so it still works on Windows. Nothing was merged.

The other half of the work is on `fix/phase2-review-restoration-20261105`:
- the rebuilt review page;
- the 172-rule fail-closed grammar gate;
- the paradigm generator;
- Claude's draft sheet.

## Next task: combine the two branches on a new branch

1. Create `fix/phase2-reconciled-20261105` from `fix/phase2-review-restoration-20261105`.
2. Bring over the Phase 2 compiler files from this branch:
   - `scripts/compile-content.cjs`;
   - `scripts/legacy-to-lesson.cjs`, `scripts/new-lesson-draft.cjs`, `scripts/render-plan.cjs`;
   - `scripts/lib/{coverage,ids,recurrence,tokens}.cjs`;
   - `lessons/`, `content/`, `reports/`;
   - `curriculum/recurrence-thresholds.json`, `curriculum/retired-ids.json`;
   - `tests/compiler.test.cjs`, `tests/fixtures/lessons/`;
   - the compiler workflow;
   - the `generated_by` and `generated_from_hash` fields in `curriculum/vocabulary-introductions-130.json`;
   - the ledger check in `curriculum/validate-roadmap-130.cjs`.
3. **Keep the restoration branch's** `scripts/lib/grammar.cjs` and its 172-feature `curriculum/grammar-features.json`. Adapt `compile-content.cjs` to call that gate. Do not use this branch's 12-feature version. Unknown morphology must stay a hard error.
4. Add a test in which a chapter 3 lesson that uses an imperfect verb fails to compile.
5. Merge the `package.json` scripts so that `npm test` runs every test from both branches, and so that `test:phase2`, `test:grammar` and `test:paradigms` all exist.
6. Run everything in two passes, on Linux and Windows CI:
   - all the tests must pass;
   - `--require-review-ready` and the 1,500/3,000 gates must still fail;
   - `index.html` SHA-1 must remain `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20`.
7. Then continue with `docs/claude`-style items 4–5 from Claude's Phase 2 fix note, and draft chapters 1–8 as `status: draft`.

No merges into `main`, no releases.
