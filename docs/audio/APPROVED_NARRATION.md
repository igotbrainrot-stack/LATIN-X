# Miriam audio in the main reader: handover (2026-11-09)

## Source lineage
- Parent: owner ZIP `LATIN_X_LATIN_TTS_DEEP_RESEARCH_MIRIAM_V4_COMPLETE_CLAUDE_20261107.zip` (438 files).
  Its app code (`app/`, `index.html`, `content/`, `lessons/`) is byte-identical to GitHub
  `feature/runway-latin-audition-20261107` @ `25c7056`; it adds the owner review records, Miriam review pages and the 34 audition MP3s.
- The same narration code was first written on GitHub branch `feature/miriam-approved-narration-20261107` (draft PR #27, stacked on PR #26).
  This ZIP extends it. GitHub later answered `403 account suspended`, so nothing from this round was pushed. Nothing was merged.
- Owner decisions: `CLAUDE_HANDOVER/LATIN_X_CLAUDE_HANDOVER_20261109.md`.

## What changed (only these files)
| File | Change |
|---|---|
| `content/narration.js` | New. Catalogue of approved takes: 9 Chapter I sentences, 8 words, with task IDs and decision records. |
| `app/62-narration.js` | New. Local MP3 player: availability probe, one completion event per clip, missing/blocked fallbacks, alt take, word lookup. |
| `app/legacy-runtime.js` | `speak()` tries Miriam first, `readOn()` advances on clip end, dock labels, "Alt take" toggle (created at runtime), word "▶ Miriam" button, `hearWord`. |
| `index.html` | Two script tags only (`content/narration.js`, `app/62-narration.js`). The layout stays byte-locked by `tests/phase3a-relocation.test.cjs`. |
| `tests/phase3a-relocation.test.cjs` | Its enumerated script list now includes the two new scripts. |
| `tests/approved-narration.test.cjs` | New regression test (added to `npm test` and `npm run test:narration`). |
| `scripts/install-narration.cjs`, `Install Approved Narration.cmd` | New. Installs downloaded takes; checks MP3 header and size, prints SHA-256, never overwrites. |
| `audio/narration/miriam/` | 12 MP3s, `README.txt`, `AUDIO_MANIFEST.json`. |
| `package.json`, `.gitignore` | Test scripts; narration MP3s kept out of public Git. |

## Behaviour
- Browser-voice mode only. Imported chapter audio (timed or untimed) is unchanged.
- **Sentence:** plays the approved take if the lesson text still exactly matches `canonical_text`. If the file is missing, the browser voice reads it, and the dock and status bar say "not Miriam".
  If autoplay is blocked, it asks the learner to press Play and does not mark the file as missing.
- **Clip end:** fires a single `tablinum:narration-ended` `{key, clipId}` event and moves the highlight to the next sentence.
  If "one sentence only" is off and the next sentence has an installed Miriam take, it plays that too. It never switches to the browser voice on its own.
- No word or sentence timing is invented.
- **Sentence 7:** an "Alt take" toggle swaps V6b and V6a for this session only. It isn't saved to progress.
- **Words:** clicking a word whose surface form matches an approved word clip (ignoring case and macrons, no inflection guessing) shows "▶ Miriam".
  The button stays hidden when the file is missing.
- Speech aliases (`Lii-wia`, `Lee-wee-ah`, `Kwoh-kweh`, `AH-kwah`, IPA) exist only as provenance in `content/narration.js`. The test checks that they never appear in learner-facing files.
- **Progress:** state changes are limited to the existing `sel` update in v5 state. The v4 store and other keys are untouched (checked in the test).

## Audio status (see `audio/narration/miriam/AUDIO_MANIFEST.json`)
- **Present, 12:** sentences s001–s006 and s008, plus words cēna, Gāius, magna, pecūnia, laeta. These are the owner-accepted Miriam v1 clips from
  `docs/audio/owner-original-review-2026-11-07.json`. They are byte-identical to `audio-audition/voiceA__*__v1.mp3`,
  their SHA-256 matches `docs/audio/OWNER_UPLOADED_MP3_BINARY_VERIFICATION.json`, and ffprobe and Chromium decode them.
- **Absent, 6:** s007-v6b, s007-v6a, s009-v5a, quoque V4, vīlla V2 (task d0e9f755…), aqua V3 (task 56c069b3…).
  This build environment cannot reach Runway's CDN or API (proxy refuses both), and no Runway connector is available, so they couldn't be
  retrieved from their task IDs. Nothing was regenerated, and no placeholder audio was added.
- vīlla V2 and aqua V3 task IDs come from `docs/audio/miriam-ipa-retries-2026-11-07.json` and `miriam-alias-v3-2026-11-07.json`.
  The accept decisions come from the two owner review JSONs next to them.

## Tests run (Linux, Node 22, headless Chromium)
- **Pass:** `npm test`, `test:narration`, `test:art`, `test:picture`, `test:pilot`, `test:music`, `test:phase12`, `test:package`, `test:owner-voice`,
  `test:browser`, `test:file`, `test:phase12-browser`, `test:phase7a-browser`, `test:phase7b-browser`, `test:legacy-art-browser`,
  `test:picture-browser`, `test:phase6-browser`, `test:phase5-browser`.
- **Fails, and also fails on the untouched parent ZIP:** `test:art-browser` ("Only signed garden preview for legacy first chapter"). Not caused by this change.
- **Not run:** `test:axe-browser` (`axe-core` isn't installed).
- **Real Chromium over `file://` with the bundled MP3s:** sentence 1 plays and reads on through 1–6 (six completion events), stops with sentence 7 highlighted,
  and doesn't start the browser voice. Pressing play on 7 gives the "not Miriam" browser voice with an explanation. The word "magna" plays and completes. No page errors.
- **Not done:** a real Windows GUI run of `Start Tablinum.cmd`, and hearing it through speakers.

## Next
1. Add the six missing takes, by the owner via the downloaders or by an agent with Runway access, using the existing task IDs only. Run `Install Approved Narration.cmd`, then `npm run test:narration`.
2. `AUDIO_MANIFEST.json` describes this ZIP as shipped; after installing, `audio/narration/miriam/LOCAL_INSTALL_RECORD.json` (written by the installer) is the current record.
3. The polish/launcher work in a parallel project thread builds on this tree.
