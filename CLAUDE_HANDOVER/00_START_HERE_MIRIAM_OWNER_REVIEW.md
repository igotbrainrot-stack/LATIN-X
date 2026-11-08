# LATIN X — Owner voice review and Miriam IPA retry handover (2026-11-07)

## Source of truth
- Owner uploaded `LATIN_X_OWNER_AUDIO_AUDITION_REVIEW.json`, reproduced byte-for-byte at `docs/audio/owner-original-review-2026-11-07.json`.
- 34 decisions: Eleanor 17/17 rejected; Miriam 12 accepted, 5 rejected. Owner additionally wrote **"Eleanors voice is too american and annoying"**. Exclude Eleanor from future narration and auditions.
- `selected_voice` from the actual export was `null`. Miriam is the only reasonable **working** candidate, but do **not** interpret this as formal final narrator approval.
- Miriam rejections: `legacy-ch01-s007` and `legacy-ch01-s009` note `LIVIA`/`lIVIA`; `test-villa` note `vILLA`; `test-aqua` note `AQWA`; `test-quoque` note `qWOQA`. Accepted `legacy-ch01-s008` nevertheless carries note `lIVIA`; preserve this fact without silently changing its approval.

## What was changed
- No change to main reader, lessons, artwork, progress, approved-original audio bytes or scoring.
- `Audio Audition.html` remains self-contained and embeds **all 34 exact v1 MP3s**. Original owner decisions are loaded by default. Eleanor's original cards hidden by default but can be expanded for audit.
- `Miriam IPA Retry Review.html` embeds the five rejected original v1 MP3s and offers local `<audio>` controls for five new v2 recordings once downloaded. It exports `LATIN_X_MIRIAM_IPA_RETRY_REVIEW.json`.
- Original owner review and interpretation stored separately under `docs/audio`; never rewrite original owner decisions.
- Five **experimental** targeted IPA retries generated on Runway using Miriam / eleven_v3 / 0.9 speed / language code unset. Each changed only the rejected word in the speech input (see `docs/audio/miriam-ipa-retries-2026-11-07.json`). **Eleven v3's IPA support is not proven**: pronunciation could be wrong or symbols may be spoken. Only the owner can approve.
- Runway returned task IDs and temporary signed MP3 URLs; the connector could not transfer binary audio into this container. Five v2 MP3s are NOT in this ZIP. Run `DOWNLOAD_MIRIAM_IPA_TRIALS.cmd` on Windows (internet once) to fetch the five source MP3s and compute local SHA-256; then reopen `Miriam IPA Retry Review.html` offline. Temporary URLs may expire; refresh by task ID without spending more generation credits. `PRIVATE_MIRIAM_IPA_V2_RUNWAY_LINKS.json` is owner-private; **NEVER commit it to Git**.
- All 34 original v1 MP3s remain present, verified previously; do not mislabel the five new v2 samples as verified locally.

## Corrective workflow
1. Owner evaluates v2 for literal IPA/ slash spoken, unintended word omission/addition, `Līvia /ˈliː.wɪ.a/`, `vīlla /ˈwiːl.la/`, `aqua /ˈa.kʷa/`, `quoque /ˈkʷɔ.kʷɛ/`, long vowels, stress, harsh artifacts, leading/trailing silence. IPA is Claude draft, **not Latinist verified**.
2. Owner exports five v2 review decisions and sends back.
3. For v2 rejected, first research supported model-specific phoneme/dictionary options; if unavailable use carefully reviewed single-word alias in speech input only and audition again. Do not feed the *entire sentence* as English respelling.
4. Never auto-install clips into reader until owner explicitly asks and final approved narrator/pronunciation are known. Timed sentence highlighting must follow actual MP3 durations / cue timings, not heuristics.

## Running
- Offline baseline app: `Start Tablinum.cmd` or `Start Picture Practice.cmd`.
- Original audit: `Start Audio Audition.cmd` / `Audio Audition.html`.
- Five corrections: `DOWNLOAD_MIRIAM_IPA_TRIALS.cmd` (internet), then `Start Miriam IPA Retry Review.cmd` (offline).
- Automated package tests: `npm test`, `npm run test:art`, `npm run test:picture`, `npm run test:music`, `npm run test:package`.

## Work discipline
This is a local working ZIP, not a GitHub release, merge, or approval sign-off. Maintain prior PR stacking if continuing remotely, avoid committing licensed book PDFs/MP3s and all private signed URLs, and preserve artwork rollback assets and full runnable source.
