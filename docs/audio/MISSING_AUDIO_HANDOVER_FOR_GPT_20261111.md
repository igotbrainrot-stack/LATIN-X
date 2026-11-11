# Missing audio: handover for GPT

> **Resolved 11 November 2026.** All 17 originals were found in the owner's earlier offline release (`Tablinum-0.4.2-arjun-offline.20261110-source.zip`), matched by SHA-256 with `restore_originals.py` from the owner's recovery kit, and committed. No new takes were generated and every owner approval stands. The rest of this document is kept for the record.

**From:** Claude, 11 November 2026. **For:** GPT, to produce the recordings the program still lacks.
**Repository:** `igotbrainrot-stack/LATIN-X`. Work on top of branch `audio/owner-media-20261111` (pull request #17), which holds the 61 recordings already supplied.

## 1. What is missing

The offline release needs 78 media files (`docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json`). 61 are in Git. These 17 are not:

**Chapter I sentences (9).** Folder `audio/narration/arjun/`.

| File | Canonical Latin | Text sent to the voice (pronunciation alias) | Runway task | Length |
|---|---|---|---|---|
| `s001-arjun.mp3` | Hic est hortus. | Hic est hortus. | `0d7db6cc-de53-49bd-8ca1-0b2dacd09de4` | 2.40 s |
| `s002-arjun.mp3` | In hortō est arbor. | In hortō est arbor. | `5dc1d88c-6a8c-4c28-8f54-2cf6c75f7c48` | 2.56 s |
| `s003-arjun.mp3` | In hortō est puella. | In hortō est puella. | `942d0670-ae3b-42f7-97aa-4874ea163436` | 2.08 s |
| `s004-arjun.mp3` | Puella Līvia est. | Puella Li'wi'ah est. | `90f1e439-1c07-4207-ac35-00eaa9b1057f` | 3.12 s |
| `s005-arjun.mp3` | Arbor magna est. | Arbor magna est. | `a3e2c234-690b-42bc-a605-3c4da5d70c0a` | 2.16 s |
| `s006-arjun.mp3` | Līvia parva est. | Li'wi'ah parva est. | `cf260310-b497-4cec-97a7-b637ddce9713` | 2.40 s |
| `s007-arjun.mp3` | Līvia arborem videt. | Li'wi'ah arborem videt. | `7cf88ac5-a839-4946-9183-aeea5b073285` | 2.48 s |
| `s008-arjun.mp3` | Līvia sub arbore sedet. | Li'wi'ah sub arbore sedet. | `55ef1d42-be20-49f7-bfa6-ce67ec685f6d` | 3.04 s |
| `s009-arjun.mp3` | Līvia laeta est. | Li'wi'ah laeta est. | `d776e60a-18f8-4190-a7c7-01d747c0a914` | 2.32 s |

**Single words (8).** Folder `audio/narration/arjun/`. Played when the learner clicks the word.

| File | Word | Text sent to the voice | Runway task | Length |
|---|---|---|---|---|
| `word-quoque-arjun.mp3` | quoque | Kwoh-kweh. | `50bc1473-ad1d-4660-8ab3-7917e332f5a4` | 1.60 s |
| `word-villa-arjun.mp3` | vīlla | WEE-lah. | `73802ad4-f9f8-4655-b139-c2fc9e0481da` | 2.16 s |
| `word-aqua-arjun.mp3` | aqua | AH-kwah. | `8a18a57a-2f81-46fd-b8b5-d6a01d4e42dc` | 1.44 s |
| `word-cena-arjun.mp3` | cēna | KAY-nah. | `44970650-e33e-4ea0-be30-ce566892be34` | 1.04 s |
| `word-gaius-arjun.mp3` | Gāius | GAH-yoos. | `591a6d2c-2f8c-4a74-8543-b2a5b29a7c8a` | 1.04 s |
| `word-magna-arjun.mp3` | magna | MAHNG-nah. | `2eac5a03-e1cd-49ac-8949-3f52381f1d4c` | 2.32 s |
| `word-pecunia-arjun.mp3` | pecūnia | peh-KOO-nee-ah. | `cd705260-1ff3-43b3-9b90-00ce7316ca0e` | 2.08 s |
| `word-laeta-miriam-fallback.mp3` | laeta | (Miriam voice, see below) | `c456a05d-2cc3-46ae-afe2-c754bb6b38e9` | |

Pinned size and SHA-256 of every file are in `ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json` and `content/narration.js`.

## 2. Try to recover the originals first

All 17 were made on 9 November 2026, and the owner listened to them and approved all of them ("all good. go ahead"). The owner sent 16 of them on 10 November in a file called `LATIN VOICE.zip` (and `LATIN.zip`). Regenerating gives a different take, which loses that approval.

1. Ask the owner whether they still have `LATIN VOICE.zip` or the files above.
2. Otherwise, open each Runway task ID above and download its MP3.
3. A recovered file is correct only if its SHA-256 matches the pin. If it does, put it in place with the exact file name. No other change is needed, and its approval stands.

The word *laeta* is a special case. The Arjun take (task `16daa58b-d7fa-489b-ac55-b1ac766242b2`) never arrived, so the program uses an older Miriam recording, `word-laeta-miriam-fallback.mp3`. Recover that Miriam file by hash like the others. Making a new Arjun *laeta* is optional and is covered in section 4.

## 3. If an original cannot be recovered: generate a new take

Use the same settings as every other recording, so chapter I sounds like chapters II to VIII:

- Runway text to speech, voice **Arjun**, model **eleven_v3**, speed **0.9**.
- Send the text in the "Text sent to the voice" column, not the canonical Latin. The aliases (`Li'wi'ah` for *Līvia* and the word respellings) are how the approved takes were made. They are provenance only and never appear in the app.
- One sentence or one word per clip. No added words, no pauses before or after beyond the voice's own.
- MP3 output, the file name from the table, saved in `audio/narration/arjun/`.
- Pronunciation rules are in `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md`: c and g always hard, consonant v as w, qu as kw, gn as ngn, long vowels held.

Record the new Runway task ID for each clip.

## 4. Wire a new take into the program

A new take has a new hash, so every pin for that file must change, and it goes back to awaiting review.

1. `content/narration.js`: for that take, set the new `sha256` and `runway_task_id`, set `owner_listening` to `"pending"`, and remove `owner_listening_review_date` and `owner_decision`. Keep `clip_id`, `file`, `role` and `voice`. Do not mark anything `"pass"`: only the owner can, after listening.
2. `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json`: new `sha256` and `bytes`.
3. `SHA256SUMS.txt`: new hash for that path.
4. Add the new task IDs, the prompts and the date to `docs/audio/ARJUN_CH1_REGENERATION_20261109.json` under a new key, keeping the old records.

For a new Arjun *laeta*: name it `word-laeta-arjun.mp3`; in `content/narration.js` replace the Miriam word entry with an Arjun one (`clip_id` `arjun-word-laeta`, `role` `default`, `voice` `Arjun`, `owner_listening` `pending`); replace its line in the checksum manifest; and update `tests/approved-narration.test.cjs`, which currently asserts that *laeta* uses Miriam (lines 32–35 and 97).

## 5. Check before you hand back

```
npm test
LATIN_X_REQUIRE_PRIVATE_AUDIO=1 npm run test:narration
npm run test:offline-media
npm run test:browser-all
npm run test:release
npm run build:release
```

With all 78 files present, the strict narration test and `test:release` must pass. They cannot pass with any file missing.

## 6. Rules

- Do not change any canonical Latin, in `content/legacy/` or in `content/narration.js`. The player refuses a clip whose `canonical_text` differs from the sentence.
- Do not say a clip has been listened to, sounds right, or is approved. Report task IDs, durations, file sizes and hashes only. The owner listens.
- Agreement between AI tools is not evidence that the pronunciation is correct.
- The repository is public. The owner chose on 11 November 2026 to publish the recordings, so committing these 17 is allowed. Do not commit signed Runway links or other private files (`.gitignore` lists them).
- Keep playback click-only: a sentence or word plays when the learner clicks it, and nothing auto-advances.
