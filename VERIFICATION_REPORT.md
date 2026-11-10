# LATIN X — verification record (10 November 2026)

**Baseline:** `main` commit `5b1ca7d32fdf`. **Work branch:** `audit/offline-release-preservation-20261110`. This file distinguishes confirmed evidence from unexecuted checks.

## Executed in this audit
| Check | Outcome | Scope |
|---|---|---|
| Git tree inventory | PASS | API recursive tree complete: 461 files, 18,452,358 tracked bytes |
| Supplied latest Linux ZIP structure | PASS: bootstrap identified | 83 entries; no `index.html`. Not a complete offline release |
| Owner media ZIP checksum | PASS | All 78 MP3 files match provided SHA256 and byte counts, 16,229,992 bytes total |
| Narration/manifest mapping | PASS | Current GitHub catalogue: 67 sentences + 8 words; 75 matching paths; 9 pass, 58 pending; labelled Miriam `laeta` |
| Release builder modified JavaScript | PASS syntax parse | Confirms parseability, not runtime correctness |
| Prior GitHub PR #2 CI | PASS (baseline only) | Ubuntu compiler, Windows compiler, Node smoke, browser smoke, Windows offline; before audit branch modifications |

## GitHub Actions verification of audit branch
The audit changes at `d4fc0d3859` were checked by two workflows, both **completed successfully**:
- [Tablinum Phase 2 offline lesson compiler](https://github.com/igotbrainrot-stack/LATIN-X/actions/runs/42745230031) — Ubuntu and Windows compiler jobs passed.
- [Tablinum source and visual checks](https://github.com/igotbrainrot-stack/LATIN-X/actions/runs/42745229665) — Node tests, Chromium browser smoke, and Windows offline/browser jobs passed.

These are clean **public checkout** CI jobs. They do not contain the 78 private owner MP3s, and do not constitute an extracted release-package verification. The full private-media checks remain listed below.

## Required, not yet executed for this branch
| Command/check | Status / reason |
|---|---|
| `npm test` | PASS in GitHub Actions clean checkout (Linux/Windows); not rerun locally in this workspace |
| `npm run test:narration` | Pending: requires complete source; strict private-media run should set `LATIN_X_REQUIRE_PRIVATE_AUDIO=1` |
| `npm run test:browser-all` | Pending: Playwright/Chromium with full source and private audio |
| `node scripts/build-release.cjs --out dist` | Pending: complete checkout plus 78 supplied MP3s needed |
| `npm run test:release` | Pending: extracts Windows ZIP and Linux tar.gz and requires private media and Chromium |
| Extracted `file://` startup, no network | Pending: cannot truthfully certify without running extracted builds |
| Windows 11 / Linux Mint native launches | Pending: no native VM/desktop runtime tested here |
| Legacy save/restore, 24 questions, 8 clozes, art | Baseline suites exist; audit-branch rerun pending |
| Actual audio crossfades and narration in desktop browser | Unit tests exist; no human listening validation here |
| Owner linguistic approval of 58 takes | PENDING OWNER REVIEW. No approval inferred from SHA256 |

## How to finish
1. Checkout the audit branch. Use Node 22 or newer and the project's pinned Playwright.
2. Extract the owner's `LATIN_X_PRIVATE_OFFLINE_MEDIA_20261110.zip` **into the repo root**. Do not commit these ignored MP3s.
3. Run `npm test`, `LATIN_X_REQUIRE_PRIVATE_AUDIO=1 npm run test:narration`, `npm run test:browser-all`, and `npm run test:release`.
4. Run `node scripts/build-release.cjs --out dist`; verify `SHA256SUMS.txt` and contents of all three archives.
5. Disconnect networking, extract the Linux and Windows archives to clean folders, open `Tablinum.html`, test all eight chapters, progress/restore, narration and music. Record browser/OS.
6. Preserve progress backup before changing the release folder location.
7. Do not mark this verified or merge the branch until the remaining test results are recorded.
