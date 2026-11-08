# LATIN X / Tablinum — Phase 7a original music and sound effects, Claude review handover

**Date:** 6 November 2026 (Australia/Sydney)  
**Branch:** `feature/phase7a-music-sfx-20261106`  
**Parent:** `feature/phase6-fsrs-owner-audio-20261106` (Phase 6 Linux and Windows CI passed on 73463180190cf4690d5376ab50ec54524408ac8d).  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/feature/phase6-fsrs-owner-audio-20261106...feature/phase7a-music-sfx-20261106  
**Status:** Not merged, not released. Phase 7a is a genuine PARTIAL implementation of the entire Phase 7 specification; microphone recording, IndexedDB, human MP3 by sentence ID and timing-v2 still pending.

## Give Claude the WHOLE runnable program ZIP

Extract `LATIN_X_PHASE7A_COMPLETE_CLAUDE_REVIEW.zip` and use `Start Tablinum.cmd` on Windows; source ZIP includes `index.html`, app/, lessons/, original eight playable lessons, all eight UNSIGNED manuscript-derived Book I chapter drafts, Phase 6 pinned genuine FSRS UMD and MIT LICENSE, compiler, curriculum, notes, CI workflows, tests, screenshots where available and this handover. Do NOT give only Markdown.

Read `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md` and `docs/claude/PHASE5_REVIEW_FOR_GPT.md` first. Historical design references include MDN Web Audio autoplay guidance: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices and AudioContext gain: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API.

## Pass 1 — implementation

- Added `content/music.js` with **three new, original** slow modal note scores, lasting approximately 3.4–3.75 minutes each, synthesized as warm plucked-string (lyre/kithara-inspired) tones using a simple Karplus–Strong delay/decay algorithm. No modern recording or published arrangement is copied. All score provenance and the disclaimer that historical reconstruction is uncertain live in `curriculum/music.json`.
- `app/60-audio-ambience.js` is an offline classic script. It lazily creates exactly one AudioContext inside the first genuine click or keypress, never plays before user input, shuffles pieces, fades track gains over four-second overlaps, stays at ~20% volume initially, and exposes graceful fallback where Web Audio is unavailable.
- Adds accessible header ♪ Music on/off and Clicks on/off buttons, plus two volume sliders. Both can be used by keyboard or mouse. Every control setting is stored in additive `v5.ui.audio` and survives backup export/reload. Defaults are `{music:true,musicVolume:0.2,sfx:true,sfxVolume:0.4}`. Existing saved v5 profiles get defaults **in memory without overwriting the old record at startup**; no new migration and no original v4 key writes.
- Quiet synthesized tick (at most once per 60 ms), rising two-note correct cue, low gentle wrong cue and three-note chapter-completion cue. No sounds on hover, typing or volume adjustments.
- Music fades to ~10% under user-played human audio **or the explicitly unverified browser voice**, returns after pause/end, mutes while a future microphone recording is active, and suspends when tab is hidden. No text or audio content is fabricated.
- The original Vocabulary Review owner page remains silent; it has none of these scripts. All other prior functions and approvals remain as in Phase 6.

## Pass 2 — reproducible verification

After installing pinned real FSRS locally with `npm install --no-save ts-fsrs@5.4.2`:
```powershell
npm test
npm run test:phase7a
npm run test:phase6
npm run test:phase3c
npm run test:phase2
npm run test:lexemes
npm run test:illustrations
npm run test:package
```
`tests/phase7a-audio.test.cjs` mocks AudioContext to verify no autoplay, one lazy context, score durations, ducking, hidden-tab and recording pause, separate settings and v5/backup preservation.

For real Windows `file://` and Playwright 1.64.1:
```powershell
npm install --no-save ts-fsrs@5.4.2 playwright@1.64.1
npx playwright install chromium
npm run test:phase7a-browser
npm run test:phase6-browser
npm run test:file
npm run test:review-browser
npm run test:browser
```
`tests/phase7a-browser.test.cjs` verifies real file:// startup has no AudioContext before a gesture, settings persist and are restored after reload with no autoplay, separate toggles, ducking and recording suppression work, and no http/https resources are requested.

Dedicated Linux/Windows CI `.github/workflows/phase7a-music-sfx.yml` checks all original and new code and produces a full ZIP plus SHA-256. Check the final HEAD SHA's run before asserting the suite passed. Acoustics on actual user hardware cannot be confirmed by a headless browser; ask owner to listen on Windows with headphones and confirm the volume.

## Phase 8 art preproduction (NOT shipped as approved images)

The first character lineup was generated as an in-chat reference using OpenAI's image generator, but **no unapproved generated character files have been committed** to the runtime asset folder. `curriculum/illustrations.json` now holds the exact original image-generation prompt and tool ID for that **draft preview only**, plus nine planned story images, required click-region IDs, Latin-first and English alt drafts and explicit `svg-scene-book` fallbacks. `scripts/check-illustrations.cjs` and `tests/illustrations-plan.test.cjs` fail on missing image/fallback, bad alt/provenance, nonexistent assets or invalid hit region references. All image assets remain `null` until created, checked and signed by the owner. Owner approval of character consistency must precede eight scene images. The Roman first-century brief remains in `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md`. Historical source references to help check architecture and clothing include https://museum.wa.gov.au/pompeii2010/daily-life/residences/ and https://www.metmuseum.org/it/essays/roman-painting. Avoid copying any reference art. The old SVG scenes remain the actual fallback.

## Still waiting on the owner

- Sign/reject 128 legacy vocabulary candidates; review 15 paradigms; test a real Windows profile backup and restore.
- Read and sign the eight Claude pilot chapters and verify their grammar/morphology and vocabulary budgets.
- Decide whether the Phase 7a generated sounds are calm, quiet and appropriate before this music is released.
- Approve the first painted character sheet before Phase 8 art is used in the app.
- The strict 1,500/3,000 unique lexeme gates remain RED; no unsigned chapter or answer key has been promoted.

## Next task, exactly

**Phase 7b:** ship verified human sentence audio and timing-v2 JSON, use IndexedDB for user-uploaded MP3 and optional MediaRecorder speaking playback/storage/ZIP export, and test Edge/Chrome/Firefox on Windows file://. Browser voice remains clearly labelled as unverified and must never be used for a graded listening item.

**Phase 8:** produce all nine requested pilot coloured ink-and-watercolour scenes + 600-px thumbnails under 250 KB, retain prompt/provenance/alt and percentage hit regions for picture tasks; keep existing SVG fallback until owner signs. Do not merge stacked PRs or start from main. Return an entire runnable ZIP plus this updated handover after each phase.
