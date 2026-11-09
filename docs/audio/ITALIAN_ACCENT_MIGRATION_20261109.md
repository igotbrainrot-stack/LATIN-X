# Italian-accent narration direction — owner request, 9 November 2026

## Owner requirement
All **new/generated LATIN X narration and spoken vocabulary** should use an **Italian accent** rather than the existing British-accent Miriam voice. Preserve Classical Latin spelling/macrons and aim for Classical Latin pronunciation, particularly consonantal `v` pronounced [w], not English [v]. This is an accent/delivery request, **not** a request to pronounce Latin using modern Italian phonology uncritically.

Owner's latest spoken name cue for Chapter I sentence 7 is `Li'wi'ah` (private speech prompt only); learner-facing canonical text remains `Līvia arborem videt.`. The user said the V12 take was "better," **not formally passed/approved**.

## Owner-selected voice (9 November 2026)

**RaffaeleR — Steady Calm and Italian Corporate Deep** is the owner's preferred male voice for all future LATIN X narration. Runway library voice ID: `YGp1lBJLaHhfIFT0yeDE`. It has a steady, deliberate, deep male delivery and neutral Northern Italian accent. This is a **voice selection**, not yet an approval of any newly rendered Latin recording, and no existing MP3 has been replaced. Classical Latin pronunciation must still be tested using `Līvia arborem videt.` (clear [w] for Latin `v`). The currently connected Runway `generate_speech` tool only exposes preset voices and does not accept this library voice ID; use a compatible `eleven_v4`/`voiceId` generation path when available.

## Candidate voice sources found in Runway
- **Silvia — Italian Accent English**: voice ID `NeTWyxKL7qMefrZEowed`, female, warm clear Italian accent, advertised for e-learning and narration.
- **Caty — Calm & whimsical**: voice ID `5DTSWAtuA2BoWMSMFTRP`, female, English with Italian accent.
- **Cristina B — Calm, Soothing**: voice ID `hPZsPQkqWehjZarI2ncr`, female, softer Italian accent.

These IDs were returned by Runway's `search_voices` tool. At this time the accessible `generate_speech` connector accepts only preset voices and the `eleven_v3`/`eleven_multilingual_v2` models, whereas library voices require `eleven_v4` and `voiceId`. **Do not pretend these IDs can be generated through the currently exposed preset-only schema.** Verify a supported library voice generation route before producing/committing new clips.

## Migration instructions
1. Produce a small audition with an actual Italian-accent voice for `Līvia arborem videt.` and compare against owner-requested W pronunciation; obtain owner's listening approval **before bulk regeneration**.
2. Then regenerate/review all current spoken Latin sentence and word recordings, maintaining filenames/asset catalogue structure only when owner approves replacements. Preserve old versions and SHA-256 records for rollback.
3. Keep exact canonical Latin text unchanged in app UI, content data, and tests. All phonetic aliases are TTS-only and private to prompts.
4. Do not mark regenerated takes as the same audio approved on 7 November; listening review required for every changed take (or explicit owner batch approval).
5. The 9 November explicit listening passes for s009-v5a, quoque-v4, aqua-v3 concern the *existing Miriam recordings*. They stay passed for that specific audio, not for future Italian-accent replacements.
6. A written design decision does not mean audio was replaced. Do not claim all voices have an Italian accent until actual MP3s are regenerated, validated and delivered in a tested release.
