# LATIN X — Claude recovery and continuation handover

Updated 9 November 2026. **This file documents prior work; it is not the recovered application.**

## Objective
Restore the **existing complete runnable LATIN X/Tablinum** application into the new repository `igotbrainrot-stack/LATIN-X`, without rewriting the program. Deliver tested Windows/Linux and source archives with real local MP3s, not only a downloader or reference links.

## History and source
Old GitHub: `cosmiccopper29-svg/Latin-X` (unavailable after suspension).
Last verified reference: branch `feature/runway-latin-audition-20261107`, commit `25c7056cf5685312996e443f733423f84b4e4bf8`.
Previously indexed complete program ZIPs include:
- `LATIN_X_LATIN_TTS_DEEP_RESEARCH_MIRIAM_V4_COMPLETE_CLAUDE_20261107.zip`
- `LATIN_X_MIRIAM_V3_PRONUNCIATION_REVIEW_COMPLETE_CLAUDE_20261107.zip`
- `LATIN_X_AUDIO_PLAYBACK_CONNECTED_COMPLETE_CLAUDE_20261107.zip`
They were not recoverable as raw bytes in this workspace on 9 November 2026. **Do not claim complete restoration until real source ZIP is inspected.**

## Preserve existing features
- Eight original playable legacy lessons and exact Latin/source answer keys.
- Eight newer Book I Claude-drafted pilot chapters, still **unsigned**.
- Separate picture practice: 44 draft picture questions, not approved for graded release.
- Nine approved Roman watercolour scenes, reviewed region polygons, original bytes/approval metadata and fallback art.
- Classical/manuscript UI, blended glow styling, original music, soft SFX, settings.
- Offline FSRS review, signed-only exercises, optional microphone recording and learner audio export.
- `file://` offline runtime and launchers (including `Start Tablinum.cmd`); support Linux as present in recovered source.
- Historic v4/v5 progress and backup compatibility; don't modify prior keys or invent owner approvals.
- Tests, source provenance, existing app sections. No release or destructive branch merge.

## Final Miriam decisions (owner approved; not Latinist certified)
Runway Miriam preset, Eleven v3, speed 0.9, no Latin locale.
- Chapter I sentence 7 `legacy-ch01-s007`, visible Latin `Līvia arborem videt.`: V6b DEFAULT, original task `7dbe3810-0cb9-435d-a1d6-bdf978821d95`; V6a approved alternative, task `2331d77d-7aa5-400b-9084-a6593a6666c3`.
- Chapter I sentence 9 `legacy-ch01-s009`, visible Latin `Līvia laeta est.`: V5a, task `68a14597-2f02-42a9-9c65-12419d7dda73`.
- Word `quoque`: V4, task `8060b628-3555-4da4-b5de-499d80fdbc85`.
- Word `aqua`: V3, task `56c069b3-6746-4400-be64-29fe0597ba3c`.
- Word `vīlla`: V2, task `d0e9f755-d72c-4195-ae74-4aa84c8699c7`.
- All other accepted Miriam originals remain accepted; Eleanor was rejected. Sentence 7 V5b and V3/V4 problematic variants are not chosen.
- `Lii-wia`, `Lee-wee-ah` and `Kwoh-kweh` are **TTS-only phonetic aliases**, never learner-visible spellings.

## 8 November regenerated takes (NOT identical to originally approved takes)
The owner asked to regenerate five audio items. Five new Runway jobs succeeded:
- s007 V6b regenerated: `d5e56be3-5245-4a20-bcf4-fd7774aac9f8`
- s007 V6a regenerated: `51e15135-b26d-4ce0-a3ec-7cada1f77a80`
- s009 V5a regenerated: `77fb7257-a9ab-4130-83b2-c62b0df15c02`
- quoque V4 regenerated: `b22171b7-df88-471a-a2c9-fc0abf63a2db`
- aqua V3 regenerated: `3c4763d0-784c-4519-b935-7a6f4b7a0a3b`
All use the same Miriam preset/model/rate. They were **not individually re-approved** as byte-identical recordings. Signed URLs used in the prior handover caused Invalid JWT problems for some downloads; never store them in public Git.

## Restore and validate
1. Acquire the owner's complete source ZIP from Library or a local backup, extract and inspect it. Preserve original folder structure and source fingerprints.
2. Acquire the actual local MP3 binaries from the owner or original Runway tasks; verify header, duration/full decode and SHA-256. Distinguish approved original take from regenerated substitute in the manifest.
3. Keep canonical Latin text unchanged. Use sentence-level highlighting triggered by real audio playback/end events, never invented timing or seeking. Label fallback browser speech separately from Miriam.
4. Add MP3s only if the owner is permitted to redistribute them; NEVER commit private signed URLs, JWTs, copyrighted textbooks/recordings or sensitive media.
5. Run the existing regression suite, including packaging, art, exercise, audio, progress migration and browser offline checks; note tests not actually run.
6. Deliver one full runnable verified program ZIP with application source, test files, Claude handover and local licensed audio, with manifest + checksums. No downloader-only substitute.

## Current repository status
Only recovery documentation and audio records are being restored while the complete app archive remains unavailable. Upload actual program only when source bytes are present. Never label this GitHub state as a functioning app.
