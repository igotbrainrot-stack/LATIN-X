# LATIN X / Tablinum — Phase 3a classic-script relocation and Claude handover

**Prepared:** 6 November 2026 (Australia/Sydney)
**Branch:** `feature/phase3-runtime-20261105`
**Parent:** `fix/phase2-reconciled-20261105`
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/fix/phase2-reconciled-20261105...feature/phase3-runtime-20261105
**Next step:** Phase 3b — audited offline content loader using classic script injection, no migration.

## Full runnable package

The *whole branch ZIP* is the deliverable. Its root contains `index.html`,
`Start Tablinum.cmd`, `Vocabulary Review.html`, Windows review and validation launchers,
`app/legacy-runtime.js`, 8 existing lessons, the Phase 2 compiler and generated catalogue,
all reviewed-source data, the full 130-chapter plan, tests and these handovers.
Download and extract the **entire** branch; double-click `Start Tablinum.cmd`.

Claude: first read this handover, then `PHASE2_RECONCILED_HANDBACK.md`,
`GPT_HANDOVER_NEXT_PHASES.md` and `CLAUDE_IMPLEMENTATION_ROADMAP.md`.
Never infer approval from editorial draft data, and keep the owner-review interface available.

## Pass 1 — relocation, with NO learner behavior change

1. Archived original v0.4.2 `index.html` byte-for-byte as
   `archive/index-v04-inline-phase3a-baseline.html`. Its previously verified SHA-1:
   `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20`.
2. Copied the **exact original 51,410-character inline script body**, including leading/trailing
   whitespace, to `app/legacy-runtime.js` (classic global script, not module).
3. Replaced only `<script>old script body</script>` in the application with
   `<script src="app/legacy-runtime.js"></script>`. No DOM/CSS/Latin text or app logic altered.
4. Updated the Phase 0, Phase 1 and Phase 2 audit/compilation tools to read the relocated
   immutable JavaScript through `scripts/lib/extract-legacy.cjs` helper `readLegacySource`.
   The helper retains backwards compatibility with older `index.html` fixtures.
5. Adapted the Node smoke/backup harness to execute the same script loaded from `app/`.
   Retired the old CSS test's whole-JS fingerprint (as required by roadmap W9); the new
   `tests/phase3a-relocation.test.cjs` checks **exact equality of the relocated script to the
   archived original** and checks that the HTML differs by exactly the script-tag replacement.
   `tests/legacy-content-lock.test.cjs` continues to freeze all eight old chapters,
   67 Latin reading sentences, 24 questions and eight cloze sources.
6. Kept the v4 localStorage key `tablinum-source-review-v02`, all old progress values and
   current audio-mode controls untouched. No v5 key, loader, networking or migration added.
7. Extended the real file URL browser test to support Chromium, Chrome, Microsoft Edge and
   Firefox separately on Windows.
8. Added `.github/workflows/phase3a-runtime.yml` to execute both platforms' Node tests,
   original browser interactions, exports/backups and full-package generation.

## Pass 2 — regression and actual findings

- Initial Linux CI found a **real test-import regression**: the Phase 2 compiler fixture used
  `readLegacySource` but hadn't imported it. This was corrected in
  `tests/compiler.test.cjs` without changing program logic.
- Subsequent Linux CI: complete `npm test`, `npm run test:phase2`,
  `npm run test:phase3a`, `npm run test:lexemes`,
  `npm run test:package` and a GitHub full-source ZIP generation: **PASS**
  (see workflow https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42045701227).
- Windows browser runs with Chromium and Edge plus vocabulary review: **PASS** on the above run.
- Windows Chromium/Chrome/Edge/Firefox matrix has been added to later CI; check the
  latest `LATIN X Phase 3a classic runtime relocation` workflow before asserting the
  final browser matrix completed successfully.
- The original script FNV32 fingerprint `e3aa2876` and Adler32
  `992012759` matched before relocation. The test now compares the entire
  preserved inline script against external script literally, not just hash values.

## Exact test entrypoints (Node 22)

```powershell
npm test
npm run test:phase2
npm run test:phase3a
npm run test:lexemes
npm run test:package
npm install --no-save playwright
npx playwright install chromium
npx playwright install firefox
npm run test:file
npm run test:review-browser
$env:TABLINUM_BROWSER_CHANNEL='chrome'; npm run test:file
$env:TABLINUM_BROWSER_CHANNEL='msedge'; npm run test:file
Remove-Item Env:TABLINUM_BROWSER_CHANNEL -ErrorAction SilentlyContinue
$env:TABLINUM_BROWSER_TYPE='firefox'; npm run test:file
```

Current strict completion gates must **still fail**:
```powershell
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

## Waiting on owner — separate from engineering

- 128 Claude-proposed lexical candidates: actual owner signs each approval/rejection.
- 15 unsigned proposed Latin paradigm pattern tables in `docs/owner/PARADIGM_SAMPLES.md`.
- Owner tests the desktop Windows checklist and real previous progress/backup restore.
- New course chapters 1–8 must be drafted and reviewed before any published first introductions.

## Restrictions and current limits

The Phase 3b content loader and Phase 3c v4→v5 migration are **not implemented** here.
`content/catalogue.js` exists as generated developer output but is not loaded in the
learner browser yet. All 130 new-course chapters are still plans or drafts, not approved
playable lessons. Strict 1,500/3,000 vocabulary gates remain unmet. The 172 grammar
features and regular paradigms are provisional engineering aids requiring human Latin
verification. No new media, Ørberg text or proprietary material is distributed.

## Reviewer tasks for Claude

Review the full source project, test exact script equivalence and Windows file URLs, inspect
cross-file classic script assumptions, verify offline/localStorage behavior and detect any
silent change to the eight existing chapters. Verify the broader Phase 2 compiler remained
deterministic and review approvals stayed unsigned. Report file/line-specific defects, fix
them on **one new branch on top of this branch**, preserve existing history, rerun tests,
and hand back **the complete runnable program ZIP and full updated handover**, never only
a Markdown document.

**Next exact build task: Phase 3b (classic script content loader) — not Phase 3c migration.**
