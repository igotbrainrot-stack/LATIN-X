# LATIN X — Complete continuation handover for Claude

**Compiled:** 9 November 2026 (Australia/Sydney)
**Purpose:** Continue the existing LATIN X/Tablinum program from its actual files. Do not restart or substitute a new app.

## 1. Immediate instruction

The owner needs **the complete runnable program, with the actual application files and audio**, not a downloader-only ZIP, source pointers, or another handover-only package. The owner has spent multiple rounds resolving voice pronunciation and wants development to move forward. **Do not ask them to repeat approvals or regenerate approved clips.**

You must first obtain a complete existing source ZIP (from the owner if necessary) and inspect it. In earlier discussions, an approximately 10 MB full program ZIP was indexed under `LATIN_X_LATIN_TTS_DEEP_RESEARCH_MIRIAM_V4_COMPLETE_CLAUDE_20261107.zip` and another full source package as `LATIN_X_MIRIAM_V3_PRONUNCIATION_REVIEW_COMPLETE_CLAUDE_20261107.zip`. Their filenames/size do not prove they are the absolute latest state; inspect archive manifest, branch and commits. The ChatGPT workspace previously **could not retrieve their original bytes**, so do not claim those files have already been included.

Repository used during development: https://github.com/cosmiccopper29-svg/Latin-X
Verified last accessible base: `feature/runway-latin-audition-20261107`, commit `25c7056cf5685312996e443f733423f84b4e4bf8`. A later attempt to create a GitHub handover branch returned HTTP 403 `Sorry. Your account was suspended`; a browser download also failed for the owner. Check access rather than assuming a working GitHub download.

## 2. Application state to preserve

- Original eight **playable** legacy lessons, the original lesson text and answer keys.
- Eight *new* Book I Claude manuscript pilot chapters: **draft / unsigned**, not published or graded as approved course content.
- A separate picture-practice preview with 44 draft picture questions, not presented as owner-reviewed graded content.
- Nine owner-approved watercolor scenes, reviewed regions/polygons and accessibility details; preserve image bytes, approvals and fallback rendering. Approved art is shown in the main legacy reader as contextual previews, without implying pilot readings are approved.
- Existing retro/classical design and blended-glow styling, music/SFX controls, signed-only question gates, review scheduling (offline FSRS), optional local microphone practice and separate user audio export.
- Local-first, offline `file://` operation, `Start Tablinum.cmd` and other existing launchers; preserve existing Windows usage and any Linux launch workflow supported by the actual archive.
- Existing browser state, v4/v5 history, backward-compatible backups and immutable historic progress keys. Never overwrite or silently migrate original learner data.
- Historical regression tests and source-provenance files; avoid unrelated refactors, merging stacked PRs, releases or owner-signature changes.

Past README described the main-reader art fix and the standalone picture practice tool; verify their actual state in the source ZIP before changing them.

## 3. Voice work: FINAL OWNER DECISIONS

**Voice:** Miriam, calm feminine British preset. **Speech model:** Eleven v3 via connected Runway, **speed:** 0.9. Eleanor was rejected. For these pilot recordings there was no Latin locale override; preset `voice_id` was not exposed, so do not invent an ID.

All pre-existing owner-accepted Miriam Chapter I sentence recordings remain accepted except superseded rejected takes. Preserve existing approval records and owner-review tier (`owner_not_latinist`); an owner's listening approval is not an independent specialist phonetic certification.

| Item | Canonical learner-facing text | Final recorded choice | Status |
|---|---|---|---|
| Chapter I, sentence 7 (`legacy-ch01-s007`) | `Līvia arborem videt.` | **V6b** / `Lii-wia arborem videt.` | Owner approved; use as default. V6a also approved as alternative. |
| Chapter I, sentence 9 (`legacy-ch01-s009`) | `Līvia laeta est.` | **V5a** / `Lee-wee-ah laeta est.` | Owner approved. |
| Word `quoque` | `quoque` | **V4** / `Kwoh-kweh.` | Owner approved. |
| Word `vīlla` | `vīlla` | **V2** | Owner accepted earlier. |
| Word `aqua` | `aqua` | **V3** | Owner accepted earlier. |
| Other previously accepted Miriam words/sentences | Canonical original Latin | Prior accepted versions | Preserve unchanged. |

**Owner review chronology:** V3 sentence 7 and 9 rejected; V4 sentence 7 and 9 rejected; V4 quoque accepted; V5 sentence 9a chosen; V5 sentence 7b was subsequently reported not working and is *not* the chosen file; V6a and V6b were both approved when the owner said “approve them and move forward,” with **V6b made default for sentence 7**. Do not mistakenly revert to V5b.

Runway task IDs for approved / alternate take retrieval:

- Sentence 7 V6b (DEFAULT): `7dbe3810-0cb9-435d-a1d6-bdf978821d95`
- Sentence 7 V6a (approved alternative): `2331d77d-7aa5-400b-9084-a6593a6666c3`
- Sentence 9 V5a: `68a14597-2f02-42a9-9c65-12419d7dda73`
- `quoque` V4: `8060b628-3555-4da4-b5de-499d80fdbc85`

The original accepted word takes `vīlla` V2 and `aqua` V3 have owner-review JSON files in prior package history; retrieve those exact task IDs from existing manifests instead of guessing.

**Critical pronunciation/text rule:** `Lii-wia`, `Lee-wee-ah`, `Kwoh-kweh` are **private TTS input aliases only**. Display exactly `Līvia` and `quoque` in Latin lessons, quiz text, transcript and accessibility names. Never expose pronunciation aliases as if they were correct orthographic Latin. Map each canonical sentence ID to its approved MP3 filename and actual audio bytes.

## 4. Audio acquisition blocker

Past Runway generation tasks succeeded, and `get_task` exposed completed MP3 URLs, but the execution sandbox was unable to copy their binary bytes. Several earlier ZIPs contained **download scripts and manifests only**, with **no actual MP3s**. This caused repeated owner frustration.

1. Search the **actual uploaded complete source ZIP** and its audio subfolders for real MP3 files. Check every archive member and MP3 magic/header; don't infer from filenames.
2. If a required MP3 is absent, retrieve the existing approved task's original audio (not re-generate and re-bill). Runway signed links are temporary and previously issued links may be expired. Refresh original task URLs as needed.
3. Verify each obtained asset by file length, file type, ability to decode and SHA-256. Put MP3s inside the **final program ZIP** under a stable project-controlled path.
4. Avoid exposing temporary signed URLs/private tokens in public Git or in documentation uploaded publicly.
5. If retrieval is impossible, report explicitly which MP3s are absent rather than claiming the full audio integration is complete.
6. Never invent word-level timestamps. For sentence-based playback, advance/highlight on actual clip completion; any finer sync needs verified timing.

## 5. Implementation request for Claude

Take the **real latest program ZIP** as the parent source, inspect the existing code architecture and tests, then implement and deliver:

1. A manifest mapping canonical Chapter I sentence IDs to approved audio paths, associated owner decision and provenance; use the existing approved baseline takes for all other sentences.
2. Actual offline playback in the main learner: play/pause, sentence selection, next/previous where already supported, clean end-of-clip advancement and sentence-level highlight. Honor browser autoplay restrictions; don't fake audio progress or claim MP3 is available if missing.
3. Keep original Latin text/quiz keys, approved artwork, visuals, settings, progress and all original features unchanged unless essential to fix an observed defect.
4. Robust fallback when MP3 is absent, with a plain user-facing explanation and no broken controls. Any browser-voice alternative must be explicitly labelled as **not Miriam**.
5. Regression coverage for approval mapping, original text integrity, fully offline playback, missing-audio behavior, state preservation, source provenance and package integrity.
6. An easy-to-launch **complete ZIP containing the entire running app + local MP3 files actually retrieved + handover + tests**. Test `Start Tablinum.cmd`/Windows offline as available, and state honestly if not tested in a real GUI. Include SHA-256 checksums and a concrete manifest.
7. Provide a brief end-user summary and a separate detailed Claude-to-next-agent handover *inside the same ZIP*. No unverified claims.

## 6. Suggested acceptance checklist

- [ ] A full runnable program ZIP, not a builder-only download.
- [ ] All the original app folders/files and source/tests retained.
- [ ] Main reader opens through the existing launcher with no development-only setup.
- [ ] Nine approved watercolor scenes and all legacy content still work.
- [ ] Approved Miriam audio is present as real local MP3 data, not merely task IDs/links.
- [ ] Chapter I sentence 7 plays V6b by default; sentence 9 V5a; word `quoque` V4; word `vīlla` V2; `aqua` V3.
- [ ] All accepted baseline recordings preserved, no recycled rejected clips.
- [ ] Canonical `Līvia`/`quoque` visible everywhere; aliases never shown to learners.
- [ ] Offline audio playback behavior tested where possible; tests and limitations reported.
- [ ] Historic v4/v5 progress and review signatures preserved.
- [ ] Archive passes integrity checks and can be extracted.

## 7. Git and scope restrictions

Do not merge into `main`, force-reset other feature branches, publish releases, change historical art reviews, or approve unsigned curricula/lexemes. If GitHub is still inaccessible (prior HTTP 403 suspended account), work from the actual owner-supplied ZIP and provide the finished ZIP here without pretending a push succeeded. Keep the next changes targeted to final audio integration. The user wants progress, not additional pronunciation auditions.

## 8. Notes on provenance and confidence

This handover consolidates user decisions and previous project records. It **does not** include the full program source or MP3 binaries; these must be supplied or verified separately. The last verified accessible GitHub base is older than the final Miriam decisions. Preserve explicit uncertainty where audio files or current source commits cannot be inspected.
