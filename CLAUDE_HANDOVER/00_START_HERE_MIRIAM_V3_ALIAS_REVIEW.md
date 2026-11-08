# LATIN X — Owner's second Miriam review received; Runway alias auditions v3

**7 November 2026. Work from the complete program in this ZIP. DO NOT rebuild.**

## Owner's exact review (authoritative)

The owner uploaded `LATIN_X_MIRIAM_IPA_RETRY_REVIEW.json` (exact bytes stored as `docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json`). It contains five prior experimental v2 IPA trials:

| ID | Owner's v2 decision | Owner's exact feedback |
|---|---|---|
| `legacy-ch01-s007` | `null` (NOT accepted) | `does not say it like Li W ia` |
| `legacy-ch01-s009` | `reject` | `does not say it like Li W ia` |
| `test-villa` | `accept` | *(blank)* |
| `test-aqua` | `reject` | `does not make the Akwa sound. ` |
| `test-quoque` | `reject` | `doesnt say it like Kwo Kee\n` |

**Crucial:** `null` for s007 is NOT `reject` or `accept`; record it as *undecided, with negative pronunciation feedback*. `vīlla` v2 is owner accepted; retain its existing task ID `d0e9f755-d72c-4195-ae74-4aa84c8699c7` and input `/ˈwiːl.la/`. That v2 MP3 was not in the inherited package (do not invent its SHA). The earlier owner audition accepted 12 Miriam v1 clips, rejected 5 Miriam v1 clips and rejected every Eleanor v1 clip (17); all are preserved byte-for-byte.

`selected_voice` remains `null`: no final narrator sign-off. Prior original owner review remains `docs/audio/owner-original-review-2026-11-07.json`.

## What was done

The previous inline IPA retries failed (except owner-accepted vīlla). The guide `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md` says to try a **single-word alias in speech input only** as a last resort; *never change the displayed Latin*. Four new Runway `eleven_v3` Miriam 0.9-speed trials were generated, language code omitted:

| Target | Unchanged display | Exact speech input sent | Runway task | Runway duration |
|---|---|---|---|---|
| s007 | `Līvia arborem videt.` | `LEE-wih-ah arborem videt.` | `cc2722e3-2e33-4d5a-a1e3-f2e7594a9ce6` | 3.04 s |
| s009 | `Līvia laeta est.` | `LEE-wih-ah laeta est.` | `84c2aab8-6d6c-4564-9bd1-619b704f7bbf` | 2.56 s |
| aqua | `aqua` | `AH-kwah` | `56c069b3-6746-4400-be64-29fe0597ba3c` | 1.20 s |
| quoque | `quoque` | `KWO-kweh` | `612d3b11-596b-49d6-912c-9c73788d7d0f` | 1.44 s |

These inputs are **experimental phonetic nudges, not validated IPA pronunciations**. Human listening review is still required, including unexpected letters, punctuation, English words, omitted words, vowel errors, artifacts, and trailing silence. One new task per unsatisfactory target, no mass regeneration, no claims of corrections approved.

**Important quoque nuance:** the owner's note says “Kwo Kee”; the draft house Classical Latin guide specifies `/ˈkʷɔ.kʷɛ/` (roughly “KWO-kweh”), not “KWO-kee”. We preserved this disagreement in the v3 listening page and chose the guide's sound rather than silently replacing a scholarly standard with an unsupported English approximation. Ask a qualified Latinist if this remains disputed. Do not generate a “KWO-kee” teaching clip without clarifying the pronunciation convention.

## Exact handback files

- `docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json`: owner-submitted review, byte-for-byte.
- `docs/audio/miriam-alias-v3-2026-11-07.json`: four generated Runway tasks, exact speech inputs, owner v2 notes and decisions, model/voice/speed, original v1 SHA-256 and provider-reported durations; new MP3 SHA-256 **null** pending actual bytes.
- `Miriam Alias Review v3.html`: classic-script offline review for four targets; previous rejected v1 MP3s embedded in the file, four new v3 players from local `audio-audition/` when downloaded, one-at-a-time playback, accept/reject, issue checkboxes, notes, export `LATIN_X_MIRIAM_ALIAS_V3_REVIEW.json`.
- `Start Miriam Alias Review v3.cmd`: Windows launch for the review page.
- `DOWNLOAD_MIRIAM_ALIAS_V3.cmd` + `audio-audition/DOWNLOAD_MIRIAM_ALIAS_V3.ps1`: downloads four original Runway MP3 files into `audio-audition`, validates plausible MP3, computes SHA-256 and updates manifest; requires internet and unexpired signed URL.
- `audio-audition/PRIVATE_MIRIAM_ALIAS_V3_RUNWAY_LINKS.json`: temporary signed Runway links **OWNER PRIVATE, DO NOT COMMIT, do not share in PR, no Git**, only in ZIP. Earliest token expiry Sunday 8 Nov 2026 ~21:52 Sydney; recover original task IDs if expired, no regeneration necessary.
- `tests/owner-miriam-v3-review.test.cjs`: verify exact owner states, schema, v1 hashes, alias boundaries and no private signed URLs in public manifests/page.

**Binary transfer limitation:** The four new generated v3 MP3 bytes could not be downloaded directly into this ChatGPT container. They are **not in the ZIP**. Previous 34 original MP3s ARE in the ZIP and remain byte-identical. Never manufacture MP3s, SHA-256 hashes, or clips; never label the four as playable offline until the Windows downloader runs. Original v1 clips inside the new v3 HTML are genuinely embedded and play without any download.

## Usage

1. Extract the complete ZIP into a fresh folder.
2. Run `DOWNLOAD_MIRIAM_ALIAS_V3.cmd` with internet to retrieve exactly 4 MP3s; don't delete the 34 original MP3s.
3. Open `Start Miriam Alias Review v3.cmd`, compare original v1 with the new v3. Ignore Eleanor.
4. Mark Accept/Reject, describe errors and export `LATIN_X_MIRIAM_ALIAS_V3_REVIEW.json`; send the export to GPT/Claude for targeted next action.
5. Approved v2 *vīlla* remains accepted only as a test-word clip (audio file was not supplied in this ZIP). No automatic installation in reader.

## Non-goals and protection

- **No edits** to `app/`, lessons, Latin text, artwork, image selection polygons, curriculum gates, music, approvals or learner state.
- No reading/highlight timing guesses. Never install experimental v3 audio into the main reader before owner explicitly approves a narrator and clips.
- Do not commit licensed PDFs, Ørberg audiobook MP3s, generated audition MP3s, private audio links, or owner review secrets.
- No merge, release, migration, phase gate approval, or public deployment.
- Prior branch discipline applies; PR #26 remains a draft. This ZIP contains full local runnable source; no Git push was requested or made for these v3 trials.

## Tests

`npm test`, `npm run test:art`, `npm run test:picture`, `npm run test:music`, `npm run test:package`, and `node scripts/build-illustrations.cjs --check` PASS. `node tests/owner-miriam-v3-review.test.cjs` PASS. Chromium's page smoke (via `set_content`) loaded actual embedded v1 MP3, advanced playback, operated review controls and downloaded parseable review JSON. Direct `file://` navigation is blocked by this testing environment; no physical Windows launch or v3 MP3 playback claimed. Full results are under `CLAUDE_HANDOVER/MIRIAM_V3_TEST_LOGS`.
