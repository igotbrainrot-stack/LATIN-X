# LATIN X / Tablinum — Phase 3c COMPLETE Claude review handover

**Date:** 6 November 2026 (Australia/Sydney)
**Current branch:** `feature/phase3c-state-migration-20261106`
**Parent:** `feature/phase3b-content-loader-20261106`
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/feature/phase3b-content-loader-20261106...feature/phase3c-state-migration-20261106
**Status:** Work in draft review branch, no main merge, release or new-course approval.

## Read this before looking at code

The ZIP of this **ENTIRE branch** is the reviewer deliverable. It contains the Windows-runnable `index.html`, `Start Tablinum.cmd`, the original eight lessons, Phase 2 compiler and generated content, Phase 1 lexeme registry/reviewer tools, all curriculum plans, all source and tests, CI workflows, source provenance and this full handover. Do NOT provide only a handover document.

Read `docs/claude/PHASE3B_REVIEW_FOR_GPT.md`, `GPT_HANDOVER_NEXT_PHASES.md`, `CLAUDE_IMPLEMENTATION_ROADMAP.md` §5, `PHASE3B_CLAUDE_HANDOVER.md` and the `CLAUDE_REVIEW_PACKAGE` instructions.

## Pass 1 — implementation and addressed review findings

1. `app/20-state-v5.js`: pure `migrateV4toV5`, `legacyView`, `updateFromLegacy`, `bootstrap`, `persist`, `parseBackup`, `backupEnvelope`, portable classic script + CommonJS test exports.
2. New `tablinum-state-v5`; no writes whatsoever to old `tablinum-source-review-v02`. On first migration, store the **exact untouched raw v4 string** in `tablinum-v4-snapshot` only if absent, then write validated v5. If v5 already exists, never silently rerun migration. If v5 is corrupt, leave it in place and provide explicit re-migrate or backup-restore actions.
3. Stable ID mapping from actual `curriculum/lexicon/legacy-id-map.json` and `legacy-vocab-map.json`, compiled offline as `content/migration-maps.js`. No fabricated lexeme approval: unmapped or ambiguous saved word cards go to `deck.legacyCards`; only truly approved mapped cards can become `deck.cards`.
4. Legacy numeric chapter, sentence, question, notes, hint, cloze and confidence fields are translated to stable IDs in `chapters`, `questions` and `ui`. Custom text and custom hint keys remain separate. Unknown old fields go under `migratedFrom.unknown`, not deleted.
5. Original v4 UI/quiz/audio functions continue running through a v5-backed compatibility projection. New user changes are stored in v5 ONLY, including course chapter IDs, and course notes stay under their own stable IDs.
6. On missing/invalid chapter assets, state writes and migration are suspended so selected sentence positions are not clamped then persisted. Existing saved progress is not replaced by fake content. The v4 original and snapshot remain byte-identical.
7. Removed the old 100-note silent cap. Warn when the v5 serialised payload exceeds roughly 3 MB (UTF-16 estimate). On quota errors trim `deck.log` to newest 500 and retry once. If storage is denied/full, keep state in memory and show a backup warning.
8. Added version-5 JSON backup export with date in filename and `exportedAt`; restore accepts v2, v4 and v5. Older envelopes migrate before the v5 write; the original old v4 key is not overwritten. A backup reminder appears on the first migration.
9. Deep-froze nested compiled original legacy lesson source to prevent accidental mutation.
10. Added independent migration fixtures and updated the original app, browser and backup regression tests to check the new storage boundary. The old 8 lessons and their source/question/cloze hashes remain fixed.

## Pass 2 — testing and acceptance

Node 22 command suite:
```powershell
npm test
npm run test:phase3c
npm run test:phase2
npm run test:lexemes
npm run test:package
node scripts/render-migration-maps.cjs --check
```

Windows file:// smoke, Chrome, Firefox, Edge, Chromium:
```powershell
npm install --no-save playwright
npx playwright install chromium
npx playwright install firefox
npm run test:file
npm run test:phase3b-browser
npm run test:review-browser
npm run test:browser
```

Workflow `.github/workflows/phase3c-state-migration.yml` executes real Linux and Windows CI, HTTP visual checks and real Windows `file://` tests. Verify the latest commit's run before asserting it passed.

Expected negative completion gates:
```
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

All remain **RED by design**, because 128 Claude candidate words are unsigned, all sample paradigm tables still need actual approval, and the 130-chapter original curriculum has no approved new-course introductions. Legacy quiz progress is NOT mapped to the new course.

## Source-specific caveats for Claude's review

- MDN documents that `localStorage` behavior under `file://` is browser-dependent, may throw a SecurityError, and can exceed quota. Manual Windows backup/export remains essential. Relevant docs:
  https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- `migrateV4toV5` is a pure JSON transform. The runtime's v4 compatibility view is transitional, not a finalized v5-native rendering engine.
- The known 20,000-character custom text limit is still present as a user-facing text-import constraint; the Phase 3c removed the 100-note migration-loss cap but does not claim unlimited attachment/audio storage.
- Source-hash drift and retired question orphan handling are part of the v5 design; end-to-end browser handling of changed chapter hashes needs an explicit future review.
- No automatic approval of Latin words, forms, recordings or lesson content; no Familia Romana licensed material in Git.

## What Claude must return

1. Findings ranked by severity with file:line and reproducible failure.
2. Independent re-run of migration and all supported browser tests, including 120 notes and corrupted v5 recovery.
3. Fix any critical data-loss or persistence regressions on a **single new branch** based on this Phase 3c branch; do not merge stacked branches.
4. A **complete runnable program ZIP with all current source, compiler, curriculum, tests, Windows launchers and updated handover**, not only Markdown.
5. An explicit status table of passes, failures, tests not run, and honest vocabulary and chapter milestones.

**Next phase after independently passing Phase 3c:** Phase 4 — draft Chapters 1–8 of Book I from original comprehensible-input syllabus. Keep them unsigned/unpublished until owner and Latin review. Continue with detailed roadmap.
