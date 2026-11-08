> **RECEIVED AUDIO UPDATE:** This document was written before the owner supplied `audio-audition.zip`. All 34 MP3s and measured SHA-256 metadata **are now included in the full ZIP**. Read `CLAUDE_HANDOVER/00_START_HERE_RECEIVED_RUNWAY_AUDIO.md` for latest facts and disregard the historical missing-MP3/download instructions below.

# LATIN X — Runway two-voice Classical Latin audition, handover to Claude

**Created:** 2026-11-07 (Australia/Sydney). **Status: generation complete, owner review outstanding.**

## Baseline and Git discipline
- Original submitted source: `LATIN_X_GPT_PACKAGE_LATIN_AUDIO_20261107.zip`.
- Base branch: `review/art-glow-audio-research-20261107` (review head `0d7819f` per Claude).
- One new review branch: `feature/runway-latin-audition-20261107`.
- Compare: https://github.com/cosmiccopper29-svg/Latin-X/compare/review/art-glow-audio-research-20261107...feature/runway-latin-audition-20261107
- Do **not** merge stacked PRs, publish a release, alter owner image approvals, modify learner states, or start phases 9–11.

## Pass 1: Runway audition exactly from Claude's guide
- Inspected current connected Runway `generate_speech` schema. Connector permits `eleven_v3` and `eleven_multilingual_v2`; **not** `eleven_v4` or IPA dictionaries via this tool. We used the best available `eleven_v3`.
- Connected account was authenticated, paid and had 2,250 credits at task start.
- Voice A: `Miriam`, calm adult feminine British narrator; Voice B: `Eleanor`, calm adult feminine Canadian narrator. Presets' underlying voice ID is *not* provided by Runway; `voice_id` is explicitly null, do not invent one.
- Rate: **0.9×**, no language code (Latin `la` rejected by Runway), no SSML, IPA or respelling, and no extra directions in text.
- Generated exactly 34 individual speech tasks: 9 **unchanged** legacy Chapter I sentences per voice and 8 words per voice (`cēna`, `Gāius`, `vīlla`, `magna`, `aqua`, `quoque`, `pecūnia`, `laeta`). Every source sentence and its identifier matches `lessons/legacy/ch01.json` and `docs/audio/prepare_latin_pilot.cjs`.
- **All 34 tasks returned completed MP3 asset metadata.** Exact task IDs, exact spoken inputs, draft IPA hints and provider durations are recorded in `docs/audio/audition-2026-11.json`.
- **No IPA retries**: owner must listen before declaring any pronunciation wrong, per guide. No fake phonetic checks or approved recordings.

## Actual artifact transport limitation — important
The Runway connector gave finished MP3 **signed download URLs and playable in-chat viewers**, but this execution sandbox cannot retrieve the hosted binary bytes (restricted outbound network and downloader not authorized for this host). It would be dishonest to claim the original MP3 bytes or measured SHA-256 hashes are already contained in the ZIP.

The owner-facing **complete runnable ZIP** contains:
- `Audio Audition.html`: browser-only, offline file:// listening and quality-review page (no fetch or network dependencies); two voices side by side, exact Latin, draft IPA, checklist, accept/reject, notes, export JSON.
- `docs/audio/audition-2026-11.json`: 34 successful task IDs, original input, model, voice name, explicit unknown `voice_id`, speed, no locale, generated date, **provider-reported** duration, `sha256:null`, no owner approval.
- `audio-audition/PRIVATE_Runway_Download_Links.json`: actual **temporary signed** URLs, 34 original MP3s; OWNER ZIP ONLY, **do not put into Git**.
- `DOWNLOAD_AUDITION_MP3S.cmd` and `audio-audition/DOWNLOAD_AUDITION_MP3S.ps1`: Windows PowerShell helper using only standard Windows tools to copy all 34 real MP3s into `audio-audition/` with exact filenames, validate MP3 headers and compute actual SHA-256 hashes locally, updating the local JSON. Must run while links remain valid (the first URLs expire 2026-11-08 02:10 UTC). If expired, refresh the existing Runway task URL; do not spend credits regenerating.
- The original, **fully runnable LATIN X program**, all current signed images, source, tests and Claude handovers. It runs as previously without the optional audition MP3s.

**MP3s are NOT inside the initial ZIP.** This is a delivery blocker, not an audio generation failure. The signed links and Windows helper enable the owner to acquire exactly the originals; after doing so the local ZIP contents can be re-archived with the MP3s for Claude. Don't represent `sha256:null` as a calculated hash. The Runway UI also permits listening to the finished task cards directly.

## Pass 2: test fixes from Claude
1. `tests/phase8-picture-practice-browser.test.cjs` checks no hard stroke and a selected blurred glow, not old `#633724` line.
2. `tests/phase8-art-browser.test.cjs` requires the approved first chapter WebP preview to display while retaining a hidden SVG fallback, rather than wrongly requiring zero images.
3. Moved `REPLACEMENT_PROVENANCE_AND_ANCHORS.json`, `EXTRA_EDGE_FEATHER_PROVENANCE.json`, `NEW_ART_GENERATION_PROVENANCE.json` and 18 previous art WebPs from handover-only directories into `docs/art/provenance/`; updated `tests/art-replacement-regions.test.cjs` paths. Optional full-native PNGs remain outside Git.

Actual local results on Node 22.16.0: **PASS** `npm test`, `npm run test:art`, `npm run test:package`, `npm run test:pilot`, `npm run test:picture`, `npm run test:music`, `npm run test:phase12`, `node scripts/build-illustrations.cjs --check`. Audition JSON and script syntax were validated, all 34 text inputs matched and all private signed URLs parsed. Local full Chromium file:// browser automation did **not** run: this sandbox's bundled Chromium hung, and Playwright was unavailable here; do not claim actual Windows GUI or NVDA test pass.

## Owner next steps
1. Extract complete ZIP; run **`DOWNLOAD_AUDITION_MP3S.cmd`** soon while temporary links are live (uses internet one time); confirm 34 real MP3s have appeared in `audio-audition/` and hashes are populated locally.
2. Open **`Audio Audition.html`** directly. Compare voice A and B for all 9 sentences and 8 words, check exact macrons and reconstructed Classical consonants, punctuation reading, extraneous words, stress, mispronounced `c`, `g`, `v`, `gn`, breath/clicks, fade/volume and edge silence.
3. Mark Accept/Reject and a note for each. Choose one preferred voice (or neither) and click **Export my review JSON**. Owner review is owner-tier **not checked by a Latinist**.
4. After receiving owner's exported review, make **at most one targeted IPA retry for a specific failed word/sentence**. Do not auto-promote baseline clips to teaching audio, and do not generate all signed/unsigned Book I narration yet.
5. Continue future task only from this branch/review branch; preserve existing signed watercolour art and v4/v5 state invariants. All music changes are out of scope for this *speech audition* task.

## CI follow-up: old source/visual smoke assertions
The GitHub Actions `Tablinum source and visual checks` workflow initially failed because two original smoke tests expected `'.scene svg'` to be visibly rendered. The approved-art integration correctly displays `img[data-art-image]` and hides SVG fallback. These checks have now been updated without any application code or artwork edits:
- `tests/browser-smoke.cjs`: verify approved c001 and c004 WebPs load, no CSS desaturation, and fallback becomes hidden. Test the first Latin sentence is readable after scrolling on a narrow viewport, since the approved illustration now precedes the text.
- `tests/file-url-smoke.cjs`: assert c001 approved WebP is visible and loaded rather than hidden legacy SVG.
These changes were pushed to the same `feature/runway-latin-audition-20261107` branch after the previous CI failures, final test-fix commit `25c7056cf5685312996e443f733423f84b4e4bf8` (PR #26). The local Node regression remains green. Refer to the newest GitHub Actions run for hosted CI results; do not treat older red runs as the final branch head.

**Security**: `audio-audition/PRIVATE_Runway_Download_Links.json` is a temporary bearer-URL manifest and is included ONLY inside the owner ZIP. Do not email, post, or commit it. Run the downloader promptly, before 2026-11-08 02:10 UTC for the earliest links. When it finishes, consider deleting the private URL manifest from shared copies of the project; retain the MP3s and task IDs. The downloader's PowerShell 5.1 code was syntax-reviewed but cannot be executed in this Linux workspace; Windows owner run is required.
