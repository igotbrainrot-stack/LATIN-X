# LATIN X — Received actual Runway audition MP3s — Claude handover

**2026-11-07, owner upload:** `audio-audition.zip`. Continue from the latest owner ZIP of **complete runnable LATIN X**; do not rebuild from `main`, merge stacked PRs, advance unsigned lessons, or change signed artwork/state/audio behaviour.

## What changed in this package

- **All 34 original Runway audition MP3 binaries are now included** under `audio-audition/`. Verified exact expected 17 `voiceA` (Miriam) and 17 `voiceB` (Eleanor), 9 legacy Chapter I sentences + 8 test words each. No added/substituted/generated samples.
- Verified original ZIP CRC, decoded all 34 with FFmpeg, measured durations using `ffprobe`; max absolute difference from Runway task metadata less than 0.05 s (MP3 frame padding). 44,100 Hz MP3; 34 unique SHA-256 hashes; no digitally clipped samples detected in decoded single-channel checks.
- **Six test-word clips need review for trailing silence** (estimated 10 ms RMS windows at -40 dBFS): `voiceA__test-aqua__v1.mp3`, `voiceA__test-laeta__v1.mp3`, `voiceA__test-magna__v1.mp3`, `voiceA__test-quoque__v1.mp3`, `voiceA__test-villa__v1.mp3`, `voiceB__test-villa__v1.mp3`. This is **not** a pronunciation determination; owner must listen.
- Updated `docs/audio/audition-2026-11.json`: measured actual duration, per-file SHA-256, source upload, and quality indicators. Crucially, all `pronunciation_approved=false`, `owner_pronunciation_approval=null`, `owner_selected_voice=null`, `owner_review=null` remain unapproved.
- Recompiled `docs/audio/audition-data-2026-11.js` as a classic script for the offline `Audio Audition.html`. The page displays prerecorded clips, exact Latin and draft IPA, quality checklist, Accept/Reject/notes, selected narrator and **Export my review JSON**. Nothing has been automatically approved.
- `START_HERE_AUDIO_AUDITION.txt` updated for immediate offline playback. `VERIFY_AUDITION_MP3S.cmd` is an optional local hash validator. Old `DOWNLOAD_AUDITION_MP3S.cmd` now explicitly redirects to verification, because no downloader or internet is needed. Expiring private Runway signed URLs removed from this new package (original task IDs remain in JSON).
- Reader, music, visuals, lesson text, clickable polygons and progress state preserved. Not even these audition MP3s are used by `Start Tablinum.cmd` yet. Owner signoff comes first.

## What to do now

1. Extract the ZIP; double-click **`Audio Audition.html`**. Verify that each of the 34 local MP3s plays without internet.
2. Review voice A/B against `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md`; mark Accept or Reject and note words/punctuation and silence/glitches; choose voice or Neither.
3. Click **Export my review JSON**. Send that JSON back with this full project ZIP; review is the **only** owner approval.
4. Make **only** an individualized IPA/voice retry when the owner's review identifies a specific failed sentence; do not regenerate unreviewed bulk Latin audio.
5. No reading/audio timing integration until owner chooses voice and authorises further work.

## Validation scope

Audio integrity and metadata checks were performed programmatically. Neither reconstructed Latin pronunciation nor the original scripted transcript were authenticated by a Latinist. Audible content, omitted or substituted syllables and punctuation reading still require human listening. UI smoke and Node regression details are in `CLAUDE_HANDOVER/RECEIVED_AUDIO_VERIFICATION_LOG.txt`. No claim of a physical Windows GUI/NVDA review.

## Source-control discipline

This is a **local owner ZIP update** to the previously supplied audition source and draft [PR #26](https://github.com/cosmiccopper29-svg/Latin-X/pull/26). The original MP3s, old expiring Runway links and owner-only unapproved audio must never be committed to public Git. No new GitHub changes were made for receipt of the audio. Continue from the last approved review branch/PR after owner exports review, keeping audit-only MP3s private.
