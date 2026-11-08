> **UPDATE 2026-11-07:** The owner has now supplied **all 34 original MP3s**. This older handover describes the *previous* package before audio was available. **Read `CLAUDE_HANDOVER/00_START_HERE_RECEIVED_RUNWAY_AUDIO.md` first**; no downloader is needed. The original Runway URLs are intentionally removed from this newer portable ZIP.

# Claude — START HERE: LATIN X Runway voice audition

Read `docs/claude/RUNWAY_LATIN_AUDITION_FOR_CLAUDE.md` first, then `docs/audio/audition-2026-11.json` and `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md`.

Exactly 34 Runway speech generation tasks completed, with 34 genuine task IDs and provider-reported durations. **The signed MP3 URLs are stored privately in this owner ZIP but the binary MP3 bytes are not** (Runway connected-app media cannot be fetched by this container). A one-time Windows downloader at the program root retrieves the real original MP3s and computes SHA-256; verify owner result before claiming offline playback. `Audio Audition.html` is the offline review UI, requiring downloaded MP3s for playback. No pronunciation has been approved.

Tests: `npm test`, `npm run test:art`, `npm run test:picture`, `npm run test:pilot`, `npm run test:music`, `npm run test:phase12`, `npm run test:package` and illustration compiler PASS. UI review page 17 pairs/34 controls PASS via Chromium setContent. Direct `file://` failed due sandbox browser policy; Windows/NVDA user test pending. Exact logs under `CLAUDE_HANDOVER/AUDITION_VERIFICATION_LOGS/`.

Branch: `feature/runway-latin-audition-20261107`, on `review/art-glow-audio-research-20261107`. PR #26 draft; no merges.

Never include `audio-audition/PRIVATE_Runway_Download_Links.json` or any generated MP3s in public Git. Do not promote new audio until owner's exported review has been received.
