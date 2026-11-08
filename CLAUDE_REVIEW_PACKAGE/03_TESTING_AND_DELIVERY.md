# Reproducible tests, download, and delivery contract

## Authoritative test entrypoints

This full repository ZIP contains a working original `index.html` (eight chapters) and source+CI tests. From its extracted root, with **Node 22**:

```powershell
npm test
npm run test:lexemes
npm run test:review
npm run test:grammar
npm run test:paradigms
node scripts/registry-review-sheet.cjs --check-sheet
node scripts/registry-review-sheet.cjs --dry-run
node curriculum/validate-roadmap-130.cjs
node scripts/verify-claude-package.cjs
```

For actual Windows browser tests, install Playwright and Chromium in a developer's checkout (not necessary to run the learner app):

```powershell
npm install --no-save playwright
npx playwright install chromium
npm run test:file
npm run test:review-browser
```

The GitHub Actions workflow `.github/workflows/phase2-review-restoration.yml` runs Linux and Windows Node 22 checks, and Windows Chromium `file://` for both the original app and editorial review interface. The separate packaging workflow `.github/workflows/claude-package.yml` constructs and verifies a real ZIP archive.

**Prior successful runs on commit `93336b55798c64fcd2213972f3714999f2ba3366`:**
- https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42034186499
- https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42034196756

The confirmed status of these runs must not be copied to newer commits without their own successful runs. CLI tests do **not** substitute for Latinist review.

## Negative / expected-to-fail gates

The following acceptance gates should intentionally fail until owner-signed words, reviewed lessons and verified introductions actually exist. Check the diagnostic, not just the exit code:

```powershell
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

No one may "fix" them by inserting invented signature, approval, or syllabus budget figures.

## Windows user instructions

1. Download the full archive of the named GitHub branch, or download the generated `LATIN_X_CLAUDE_REVIEW_FULL_20261106.zip` from the CI artifact.
2. Extract everything into a local folder.
3. Double-click **Start Tablinum.cmd** (or `index.html`) to run the original eight chapters offline. There is no build step or npm dependency for learners.
4. For editorial word review, double-click **Start Vocabulary Review.cmd**. Choose the file `curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv` when prompted by your browser's file picker.
5. Sign only genuinely reviewed rows. Click Save on each row, then **Export edited CSV** to store progress. Never rely on unsaved browser state. Validate exported results with **Validate Vocabulary CSV.cmd**. This validation does **not** write signed lexemes into the registry.
6. Do not mistake "owner" in `review_tier` for a signature — `reviewer`, `reviewed_at`, `decision`, `macron_reviewed` still begin empty.

## Review package content requirements

The downloadable ZIP must contain all of:
- `index.html`, `Start Tablinum.cmd`, the `archive/` original source;
- `Vocabulary Review.html`, both new Windows review/validation launchers;
- `curriculum/` (complete 130-chapter plan, lexicon source maps, original editorial queue and Claude draft);
- `scripts/` (review, grammar, paradigm and Phase 1 code);
- `tests/` and `.github/workflows/` (full CI and browser checks);
- `docs/`, `CLAUDE_IMPLEMENTATION_ROADMAP.md`, all other handovers;
- `CLAUDE_REVIEW_PACKAGE/` including the Claude prompt, this test guide, status matrix and source boundary notes;
- `README.md`, `package.json` and the licensing documents.

No proprietary/third-party raw book/audio resources or private files.

**Review outcome:** Claude must return a new ZIP containing the entire updated program, tests and handover after any changes. Never a stand-alone Markdown handover without the runnable project.

## Previous separate Phase 2 compiler ZIP

The complete previous Phase 2 compiler package and its handover are stored in the owner's ChatGPT Library. GitHub branch archive **does not** contain that compiler; adding an explanatory README cannot replace its code. The source should be diffed and merged separately if available to the reviewer.
