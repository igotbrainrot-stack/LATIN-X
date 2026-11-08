# LATIN X — Root cause and verified playback repair (2026-11-07)

## User issue
"the audio is still not playing. check to see if it is actually connected"

## Findings
- The 34 genuine Runway MP3s WERE present, decodable and correctly named in the previous full ZIP. Every original SHA-256 matches `docs/audio/audition-2026-11.json`.
- `Audio Audition.html` previously fetched `docs/audio/audition-data-2026-11.js` and referenced 34 relative `audio-audition/*.mp3` paths. Opening the HTML from a compressed archive or without its subfolders caused absent data and silent/failed media. The UI only exposed a cryptic missing-file message.
- **The main Tablinum reader was never wired to these audition voices**, intentionally, as the supplied `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md` requires owner listening approval first. Reader browser TTS remains the separate, old playback mechanism. Do not claim replacing narration.

## Implemented
1. `Audio Audition.html` now embeds the unchanged audited draft manifest and the original SHA-256-matching MP3 bytes as `data:audio/mpeg;base64,...` sources. It runs standalone and offline, even if its supporting files are absent. Review/export process unchanged.
2. Dedicated **Test sound** control at top confirms playback status; all 34 clip audio elements are directly connected, show useful error messages and enforce a single active player.
3. `Start Audio Audition.cmd` launcher and clear start-here instructions. `index.html` is intentionally byte-identical to the previous app (preserves strict Phase12 source integrity).
4. `tests/audio-audition-standalone.test.cjs` checks all 34 embedded data URLs byte-for-byte against source MP3 SHA-256 and manifest, safe source isolation and HTML navigation, without network.

## Verified
- Browser: Chromium `page.set_content` (local browser policy blocks file/http navigation) loaded one standalone HTML with no remote/external refs and rendered all 17 pairs/34 controls; played first voice and a later second-voice recording (currentTime advanced), automatically paused prior audio; review choices and JSON export succeeded. No JavaScript errors. Screenshot `CLAUDE_HANDOVER/PLAYBACK_CONNECTED_CHROMIUM.png`.
- `npm test` + `npm run test:art`, `test:music`, `test:picture`, `test:package` (see output logs). Browser test from HTML bytes is not a physical Windows file:// test.
- FFprobe confirms each of the original 34 source MP3s decodes; no pronunciation or pedagogical approval is asserted.

## IMPORTANT: Git exclusion for this owner ZIP
The fixed root `Audio Audition.html` now **embeds binary MP3 bytes as base64 data URI strings**. **Do not commit this owner-only HTML or the MP3s to GitHub.** The prior small, external-file variant is preserved in `CLAUDE_HANDOVER/AUDIO_AUDITION_GIT_SAFE_BEFORE_EMBED.html` as a rollback and Git-safe starting point. The owner ZIP can intentionally distribute the complete audio assets locally; the public Git branch should not.

## Boundaries
- No new audio is installed in the reader. No change to `index.html`, lesson content, words, scene polygons, artwork, previous art rollback, FSRS state, current score, owner approvals, music code or media licensing.
- No new Runway credits spent.
- After owner exports listening review, regenerate only rejected pronunciations before approving any reader integration.

## Launcher
`Start Audio Audition.cmd` OR `Audio Audition.html`; listener works without its external files because the original audio and metadata are embedded. Full program: `Start Tablinum.cmd`.
