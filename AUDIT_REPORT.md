# LATIN X — conservative engineering audit (10 November 2026)

## Scope and baseline
- Repository: `igotbrainrot-stack/LATIN-X`, audited from `main` merge commit `5b1ca7d32fdf` (PR #2 merged). Changes are isolated on `audit/offline-release-preservation-20261110`; **no merge or release authorised**.
- Complete Git tree at the baseline: **461 tracked files; 18,452,358 bytes** of Git blob payload (tree inventory, not disk usage or repository history). The Git tree response was **not truncated**. Selected top-level inventory: `docs/` 105 files; `tests/` 61; `CLAUDE_HANDOVER/` 40; `curriculum/` 37; `scripts/` 34; `assets/` 34; `.github/` 21; `app/` 16; `lessons/` 16; `content/` 15; `CLAUDE_REVIEW_PACKAGE/` 6. The large historical collections account for substantial documentation, but size alone is not evidence of redundancy.
- The owner-supplied `LATIN_X_LATEST_MAIN_5b1ca7d_LINUX_MINT_20261110.zip` is **not** a complete offline source package: 83 ZIP entries, and no `index.html`; it downloads a pinned commit on first launch. Do not confuse it with the repository's `scripts/build-release.cjs` output.
- The repo is a static classic-JavaScript application meant for `file://` operation, using ordered global scripts, no runtime fetch, local state, and two platform launchers. Source content in `lessons/` and `curriculum/` feeds generated `content/`; historical versioned test locks and direct-browser runtime dependencies limit safe deletions.

## Confirmed findings and fixes
1. **Release asset privacy and provenance (fixed on audit branch):** The existing builder already fails if 78 specified files are missing or have incorrect SHA256. However, its recursive runtime walk could also include unrelated `.mp3` files, and its source ZIP explicitly incorporated local `audio-audition/` MP3s and the owner-private original listening-review JSON. It is now restricted to the **manifest-pinned 75 narration MP3s plus three Roman music MP3s**; historical auditions and private owner review stay in the developer workspace. `tests/release-package.test.cjs` now checks the source ZIP for 78 authorised audio files, rejects leaked audition audio and owner review, and still checks Windows/Linux extraction and browser launches.
2. **Clean-checkout release contract (added):** `tests/offline-release-source-contract.test.cjs` checks static source/launcher completeness, manifest uniqueness, matching narrator catalogue, Chapter I 9 pass / later 58 pending, separated Miriam `laeta` fallback, exact storage keys and legacy `library` save compatibility. This test does not need private MP3s and runs under `npm test`.
3. **Media integrity (verified locally, unchanged):** The private owner media ZIP contains **78 unique MP3s, 16,229,992 bytes uncompressed**, all matching their declared lengths and SHA256 hashes. The current GitHub narration catalogue has 67 sentences plus 8 words; 9 sentence takes marked `pass`, 58 `pending`; seven Arjun word takes plus the labelled Miriam `laeta` fallback. Every one of the 75 narration paths matches the offline manifest. Music accounts for the remaining three.
4. **Offline release architecture (already exists):** `scripts/build-release.cjs` assembles full `app/`, `content/`, `vendor/`, `assets/`, `audio/narration/` and `index.html`, and platform `Tablinum.html` launchers. `tests/release-package.test.cjs` builds Windows ZIP and Linux tar.gz, extracts them into spaces/non-ASCII paths, opens the actual local launcher through Chromium and rejects network requests, missing files and page errors. No source download is part of the repository launcher. **This audit environment cannot fetch a complete Git checkout, so those integrated package tests remain to be executed after branch checkout with the private media.**
5. **Documentation drift (confirmed, not treated as code bug):** `docs/FEATURE_INVENTORY.md` still describes Miriam as the primary narrator and synthetic lyre as the only music despite the Arjun integration; `HANDOVER.md` has older contradictory Miriam and GitHub-access notes. Corrected/current-status notes should take precedence over obsolete handovers.
6. **Protected learner state (preserved):** The v4 key `tablinum-source-review-v02`, v5 key `tablinum-state-v5`, legacy `library` schema allowance, migrations, FSRS history, backup/restore and original questions are not changed. Existing regression suites include `backup-compat`, `migration`, `phase12-long-profile` and content/art locks.

## Cleanup classification
| Area | Assessment | Action |
|---|---|---|
| Extra MP3s in developer directories | SAFE TO EXCLUDE FROM RELEASE, not necessarily safe to delete | Filter by owner checksum manifest |
| Private historical review file in source ZIP | SAFE TO EXCLUDE FROM DISTRIBUTION | Leave locally; don't package |
| `CLAUDE_HANDOVER/` (40 files), `CLAUDE_REVIEW_PACKAGE/` (6) | PRESERVE until every reference and test is mapped | Add archive index, no bulk move |
| Root phase handovers and `docs/history/` | REQUIRES REGRESSION TESTING to relocate | Document as historical candidates |
| Legacy library data/migrations | PRESERVE | No behavioural changes |
| Signed educational source, lexical reviews, media provenance | PRESERVE | No alterations |
| Obsolete bootstrap `START_LATIN_X.py` in old standalone ZIP | SUPERSEDED EXTERNAL DISTRIBUTION | Do not copy into repository release |
| Approved art/WebPs, `vendor/ts-fsrs.umd.js` | PRESERVE | No image or dependency conversions |
| Inactive legacy handlers | REQUIRES REGRESSION TESTING | No deletion pending coverage |

## Historical embedded-audio privacy caveat
The existing public source includes large historical audition/review HTML pages, including `Audio Audition.html` (~1.37 MB), with base64-embedded audio validated by `tests/audio-audition-standalone.test.cjs`. Filtering loose `audio-audition/*.mp3` files from the new release does **not** undo or erase these previously tracked embedded recordings. The revised source ZIP still includes tracked historical review HTML as part of the full source tree. Do not claim that all old audition audio has been removed from public Git. Changing these review pages could invalidate provenance or tests; handle as a separate owner-authorised privacy audit without rewriting Git history casually.

## Remaining verification and risks
- No **complete offline Windows/Linux archive** was produced in this workspace because the environment cannot resolve `github.com` to retrieve the full repository; GitHub connector supplies metadata/text but cannot place the whole working tree here. Private audio was verified independently. A full source checkout with private media remains necessary.
- Need run `npm test`, `npm run test:narration`, `npm run test:browser-all`, `npm run build:release`, and the extracted-package smoke test on the new branch; record OS, browser and results.
- Do not merge this change until CI passes and source-package privacy rules are reviewed.
- Do not modify canonical Latin, answers, macrons or statuses during software cleanup. Any linguistic concerns must go to `LATIN_CONTENT_REVIEW.md`.
- Historical folder cleanup is **not performed**; a safe archive classification is documented separately. This prevents breaking relative links, build scripts and provenance while the reference graph is incomplete.

## Before/after measurement
- **Baseline:** 461 Git-tracked files, 18,452,358 tracked blob bytes. Historical owner assets excluded; ZIP sizes are not a fair proxy.
- **After:** Expected Git file count increases by the new tests/reports; **no production content files or historical files are deleted**. The release builder will no longer include unrelated private MP3s, so release size depends only on the fixed 78 media plus runtime assets. An extracted-build before/after size comparison remains pending.
