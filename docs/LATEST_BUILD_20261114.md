# Latest LATIN-X build and continuation handover — 14 November 2026

## Current source of truth
- Repository: https://github.com/igotbrainrot-stack/LATIN-X
- Latest build branch: `release/easy-install-20261111`
- Latest build PR: https://github.com/igotbrainrot-stack/LATIN-X/pull/19
- Head at inspection (before this documentation commit): `3dafc0545da96ec161d295ad38078d68ebf364fb`
- Default branch: `main`; **PR #19 is open and not merged**.
- This handover is documentation only. It does **not** claim a newly compiled or independently tested release artifact.

## Source build and learner distribution
1. Check out `release/easy-install-20261111`, not `main`, to work with the most recent integrated setup work.
2. Install Node.js 22+ and run `npm install`.
3. Run `npm test`, `npm run test:easy-install`, `npm run test:narration`, `npm run test:offline-media`, and `npm run test:offline-contract`.
4. For full browser regression, set up the repository's Playwright/Chromium test environment and run `npm run test:browser-all`.
5. Run `npm run build:setup` to generate `dist/Tablinum-Setup-20261111.zip`. The generated `dist/` directory is not committed to this branch. Run `npm run test:release` and `npm run build:release` for the legacy portable release path.
6. Unpack the setup ZIP and use `Install Tablinum (Windows).cmd` or `Install Tablinum (Linux Mint).sh`. Alternatively open `Open without installing.html`. Full operating instructions: [docs/EASY_INSTALL.md](EASY_INSTALL.md).

The PR #19 author reported passing Node, media, packaging and installation checks, plus an installed Chromium load; this handover's author has **not** rerun them. Real Windows SmartScreen and Linux Mint Cinnamon desktop interactions remain unverified.

## What is implemented across open PRs
- [#14](https://github.com/igotbrainrot-stack/LATIN-X/pull/14): form notes, answer order, chapter navigation, test fixes.
- [#15](https://github.com/igotbrainrot-stack/LATIN-X/pull/15): modernised navigation and reader UI.
- [#16](https://github.com/igotbrainrot-stack/LATIN-X/pull/16): guided lesson path and word checks.
- [#18](https://github.com/igotbrainrot-stack/LATIN-X/pull/18): three word games and feedback flourishes.
- [#17](https://github.com/igotbrainrot-stack/LATIN-X/pull/17): public owner-media audio on a separate branch; the content is also included in #19's setup branch according to its PR description.
- [#19](https://github.com/igotbrainrot-stack/LATIN-X/pull/19): installer packaging of the integrated runtime with 78 owner media files.

The feature PR chain is stacked (#14 -> #15 -> #16 -> #18 -> #19). Audio #17 is separate and overlaps with #19. **Do not blindly merge these PRs or duplicate the audio commits.** Compare diffs, reconcile the shared files and obtain owner approval before merging or publishing. Do not force-push existing branches.

## Accuracy, licensing and data safeguards
- The legacy chapter content is playable, but other pilot lessons, lexicon/form annotations and picture questions include drafts requiring review. Do not imply Latinist sign-off without evidence.
- Chapter I Arjun narration has owner approval; Chapter II–VIII takes still need owner listening approval. Do not manufacture sentence timings or silently replace the selected voice.
- Owner audio is now in the public Git branches by earlier owner direction. Check distribution rights before any public release. Do not add copyrighted textbook PDFs/scans or private review/source files.
- Preserve existing browser-storage keys and backup compatibility. Users should export a Progressus backup before moving installations because `file://` browser storage may be path-scoped.
- Keep the application offline-first, with no runtime downloads. Respect source-content locks, generated-content boundaries and existing tests.

## Handoff checklist
- Audit status of PRs #14–#19 and compare `release/easy-install-20261111` against `main`.
- Verify the entire 78-file media manifest and both generated package types.
- Execute tests in a clean checkout; record exact versions, platform, failures and fixes rather than assuming PR descriptions are current evidence.
- Test actual Windows 11 and Linux Mint graphical install / reinstall / uninstall.
- Review Chapter II–VIII recordings, draft glosses and form notes with the appropriate owner/reviewer.
- Only after approval: decide integration / release strategy and publish installer ZIP with checksums and clearly distinguished source vs install artifacts.

Other important docs: [root HANDOVER.md](../HANDOVER.md), [docs/EASY_INSTALL.md](EASY_INSTALL.md), [docs/GUIDED_LESSONS.md](GUIDED_LESSONS.md), [docs/PLAY_LAYER.md](PLAY_LAYER.md), and [docs/FEATURE_INVENTORY.md](FEATURE_INVENTORY.md).
