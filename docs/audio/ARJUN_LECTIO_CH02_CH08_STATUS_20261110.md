# Arjun narration — Lectiō Chapters II–VIII (10 November 2026)

Owner requested completion of the remaining original Latin Lectiō reading narration, using the previously selected Arjun voice. The current legacy course has exactly **58 sentences** across Chapters II–VIII (9+9+8+8+8+8+8). Each sentence has a Runway generation task ID recorded in a chapter manifest below. The canonical text comes from `content/legacy/ch02.js` through `ch08.js` and was not altered in the application's lesson source.

| Chapter | Sentences | Runway task manifest |
|---|---:|---|
| II — Familia | 9 | `arjun_lectio_ch02_20261110.json` |
| III — Dōnum | 9 | `arjun_lectio_ch03_20261110.json` |
| IV — Cēna | 8 | `arjun_lectio_ch04_20261110.json` |
| V — Forum | 8 | `arjun_lectio_ch05_20261110.json` |
| VI — Canis | 8 | `arjun_lectio_ch06_20261110.json` |
| VII — Tempestās | 8 | `arjun_lectio_ch07_20261110.json` |
| VIII — Crās | 8 | `arjun_lectio_ch08_20261110.json` |

All 58 generation requests received Runway task IDs. One sample recording per chapter was verified complete by retrieving its task. The remainder are submitted and recorded but have not individually been rechecked or listened to. An earlier first batch encountered a connection limit and may have produced untracked duplicate tasks; the chapter-specific manifests above are authoritative.

**IMPORTANT — Audio status:** The Runway task IDs are **not offline MP3 files**. These takes are awaiting owner listening review and binary retrieval. The application's `content/narration.js` still references the existing Chapter I catalogue only, and no Chapter II–VIII Arjun MP3s were installed. The current Linux Mint package cannot play the new Arjun recordings until the real files are imported. The existing sentence-click-only behaviour must be preserved. Do not claim a finished Linux Mint binary or owner-approved pronunciations from this data alone.

**Installation checklist:** download each task's real MP3; check lengths/decoding/checksums; review Classical Latin pronunciation (especially consonantal V = [w]); preserve the canonical Latin/macrons, keep TTS aliases provenance-only; add chapter II–VIII to a well-tested narrator catalogue and use the same sentence-click playback; retain browser voice fallback and quiet soundtrack ducking; run Node/browser/release tests; publish full Linux Mint package with real assets.
