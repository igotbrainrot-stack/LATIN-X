# Phase 0 — Observed test results and limitations

**Date:** 5 November 2026 (Sydney; GitHub runs logged 4 November UTC)  
**Branch:** `test/phase0-safety-net`  
**Parent:** `feature/legacy-lexeme-audit-20261105`  
**Roadmap:** [CLAUDE_IMPLEMENTATION_ROADMAP.md](../CLAUDE_IMPLEMENTATION_ROADMAP.md) §12  
**Status:** Automated CI passes for the tested Phase 0 implementation. Physical owner-run Windows checks remain open.

## Evidence

- [Passing first corrected Linux + Windows CI run](https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/41888556143)
- [Passing second-pass content-integrity run](https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/41889062051)
- [Final verified Phase 0 full CI run — Linux and Windows jobs all passed](https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/41889820903)
- The active workflow is [tablinum-smoke.yml](../.github/workflows/tablinum-smoke.yml). Later commits only add audit/reporting coverage and browser/version output; refer to the branch's most recent workflow run for final verification.

| Test / command | Evidence and result |
|---|---|
| `npm test` (Node 22.23.4, Linux) | **PASS**: legacy smoke, manuscript design, full backup compatibility, known W1 limit, lesson lock, lexeme audit |
| `npm test` (Node 22, Windows GitHub runner) | **PASS**, unchanged scripts in PowerShell |
| `node scripts/build-legacy-lexeme-audit.cjs --check` (Windows) | **PASS**: source audit and stable ID map byte-identical after extraction helper refactor |
| `npm run test:browser` (Linux Chromium over local HTTP) | **PASS**: responsive manuscript UI, chapter III rose colours, mobile above-fold reading, exercises |
| `npm run test:file` (Linux Chromium) | **PASS**: actual `file://` page, nine Chapter I sentences, quiz answer persists on reload, populated v4 backup export and restore |
| `npm run test:file` (Windows Chromium) | **PASS** in GitHub Actions Windows environment |
| `TABLINUM_BROWSER_CHANNEL=msedge npm run test:file` (Windows Edge) | **PASS** in GitHub Actions Windows environment |
| Full original `index.html` SHA-1 | **PASS**: `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20` exactly matches the previously specified v0.4.2 baseline |
| 8-chapter sentence/question/glossary/cloze lock | **PASS**: 67 original sentences, 24 questions and 8 cloze exercises; saved answer meaning and source data unchanged |
| `node curriculum/validate-roadmap-130.cjs` and `validate-outline-v3.cjs` | Existing plan structural validation is retained; both commands are included in the final Linux CI workflow |
| `--require-introduced-1500` / `--require-introduced-3000` | **Expected failure** until actual approved, original Latin lessons meet those thresholds; CI explicitly asserts this |

The tests use a *synthetic* 30-card saved-state fixture. No real learner data or private backups were committed.

## Representative exact console output from the final CI run

The following lines were recorded from the Linux and Windows jobs of run [41889820903](https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/41889820903), rather than invented from the roadmap.

```text
PASS: KNOWN LIMIT W1: notes capped at 100 (fix in Phase 3)
PASS: startup rewrites the original v4 key to a normalised state (known legacy behaviour; no new code).
PASS: empty, populated, custom, hostile, cap-limit and v2 backup fixtures.
PASS: v4 export→restore→export preserves state; original startup normalization behaviour documented.
PASS: unchanged legacy chapter data, question answers/variants, cloze clues, shared glossary, 67 sentences and saved-state keys.
PASS: 8 stable legacy chapter IDs, 67 sentence IDs, 24 question IDs, 255 token IDs and numeric saved-state key compatibility.
PASS: deterministic lexical evidence AND stable ID map match current index.html; 8 legacy chapters, 67 sentences, 24 questions.
ENVIRONMENT: Node v22.23.4; Playwright 1.64.1; Chromium 156.0.8078.4; linux
PASS: Chromium file:// launch; 9 sentences, quiz persistence, 30-word v4 restore, backup export and no page errors.
ENVIRONMENT: Node v22.23.4; Playwright 1.64.1; Chromium 156.0.8078.4; win32
PASS: Chromium file:// launch; 9 sentences, quiz persistence, 30-word v4 restore, backup export and no page errors.
ENVIRONMENT: Node v22.23.4; Playwright 1.64.1; msedge 156.0.4314.56; win32
PASS: msedge file:// launch; 9 sentences, quiz persistence, 30-word v4 restore, backup export and no page errors.
```

The full log also confirms the 130-chapter roadmap structural check and both unverified vocabulary completion gates. The manual owner test remains open.

## Important existing behaviour recorded, NOT fixed in Phase 0

1. **W1 — 100-note cap.** The current `normalizeState` discards entries after the first 100 notes, and other v4 maps have similar caps. `tests/backup-compat.test.cjs` explicitly captures this known bug. Fix in Phase 3 after designing v5 storage and backups; do not silently hide it.
2. **Original v4 startup rewrites the existing localStorage key** with a normalised state. The application is unchanged; our harness proves both the one startup write and that unsupported fields are removed. The roadmap's future **non-destructive v5 migration** must treat this as pre-existing behaviour and preserve the old backup.
3. **File-origin storage may differ across browsers, profiles and moved folders.** Automated browser testing passed in Linux Chromium and Windows Edge/Chromium, but this does not certify the user's own machine or every Windows 10 build.
4. **No runtime migration has been implemented.** Stable IDs remain in a read-only sidecar. No new lessons, lexeme approvals, narration or data store were added.
5. **No human Latinist, pronunciation or original-audio review** has been performed.

## Manual Windows owner testing — pending

Complete [WINDOWS_OFFLINE_CHECK.md](WINDOWS_OFFLINE_CHECK.md) on a Windows 10/11 desktop, preferably offline. Test Edge, Chrome and Firefox; save a backup, move the application folder, reopen and restore. This is **not** marked passed until a real person provides the results.

## Implementation-test reproducibility

```bash
npm test
node scripts/build-legacy-lexeme-audit.cjs --check
node curriculum/validate-roadmap-130.cjs
node curriculum/validate-outline-v3.cjs
npm run test:browser
npm run test:file
```

The browser scripts require the dev-only Playwright package and browser binaries. The **learner app requires no server, npm install or internet connection**. Automated tests do not replace real Windows user acceptance.
