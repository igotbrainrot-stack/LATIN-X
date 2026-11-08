# LATIN X — Claude review handover: Phase 6 corrections and Phase 7b offline media

**Date:** 6 November 2026 (Sydney).  
**Branch:** `fix/phase6-reviewed-phase7b-20261106`  
**Immediate parent:** `feature/phase7a-music-sfx-20261106` (contains the passed Phase 6 branch below it).  
**Claude's explicit review base:** `review/phase6-20261105` @ `ad5f9e6`. Its full `PHASE6_REVIEW_FOR_GPT.md` is now copied **verbatim** into `docs/claude/PHASE6_REVIEW_FOR_GPT.md` on this branch.  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/feature/phase7a-music-sfx-20261106...fix/phase6-reviewed-phase7b-20261106

**FULL PROGRAM PACKAGE REQUIRED.** Give Claude the complete `LATIN_X_PHASE7B_COMPLETE_CLAUDE_REVIEW.zip` containing original runnable `index.html` and `Start Tablinum.cmd`, all old playable chapters, eight Claude original unsigned Book I drafts, current compiler/curriculum/lexicon, the vendored genuine `ts-fsrs@5.4.2` UMD + MIT LICENSE, the original modal music and SFX, new user audio storage and speaking tools, every test and complete handovers. Never give only this Markdown.

## Background and what was already built

- Phase 6 approved subject to the fixes below; full external Claude review at `docs/claude/PHASE6_REVIEW_FOR_GPT.md`.
- Phase 7a on parent includes three original slow synthesized modal lyre pieces, music/click toggles and volume saved in additive v5, privacy-respecting first-gesture Web Audio, narration ducking, recording pause, hidden-tab pause and nine unapproved Phase 8 illustration slots with SVG fallback.
- Existing eight playable lessons are unchanged in content, and all course drafts and lexeme/paradigm decisions remain unapproved. **Never sign or infer owner/LATINIST approvals.**
- Original `tablinum-source-review-v02` key and `tablinum-v4-snapshot` are never overwritten.

## Pass 1 — changes implemented

### Claude Phase 6 review repairs (required)

1. **Existing interval survival:** `app/55-review-deck.js` seeds a previously reviewed legacy card lacking FSRS history with an FSRS `Review` state using its historical `days`, `reps`, `due`, and derived previous-review date. The app does NOT invent a history of individual ratings or mark the old lexeme approved. `tests/phase6-claude-fixes.test.cjs` explicitly requires a legacy 30-day card rated Good to schedule more than 30 days ahead, while Again lapses to a short interval. New (`reps=0`) cards remain New.
2. **Daily limits:** `dueQueue` enforces a single shared 15-new/150-review default budget across approved and legacy decks. The `deck.log` entries for the learner's current **local** day consume that budget, and an attempted excess review is rejected even if an old button is still in the DOM. Limits are settings-derived and testable with synthetic daily caps of one each. Old log entries with no `kind` are conservatively counted as reviews.
3. **Last sentence:** pressing `Mark approved chapter read` now records the currently selected final sentence's encountered lexemes. Per-session deduplication still prevents counting the same sentence twice. Added browser regression.
4. **Latin first:** the review screen uses `Memoria: verba repetenda`, `Servāta`, `Hodiē`, `Posteā` and `Ostende significātiōnem` with English guidance.

### Phase 7b: genuinely local audio and ungraded speaking

5. `app/70-user-media.js`: offline classic-script IndexedDB store for user-imported chapter MP3/WAV/OGG/M4A and optional microphone recordings. If IndexedDB is unavailable (including restrictive `file://` browsers), a session-memory fallback is honestly labelled temporary and the user is told to keep source recordings.
6. Imported MP3 blobs and user-provided timing metadata can be restored after reload **where IndexedDB is available**. They are NOT added to v5 JSON backups; the old v4 key remains untouched. Chapter audio remains unaligned until measured intervals are provided. Existing MP3 untimed mode MUST NOT seek falsely or highlight audio as synchronized.
7. Strict `tablinum-timing-v2` parsing validates chapter IDs, exact stable sentence IDs in order, positive non-overlapping intervals and duration bounds. Imported intervals remain `verified:false`: uploading a timing file is not proof of acoustic accuracy.
8. The reader now offers **Record this sentence**, **Stop recording**, and **Compare my voice**. Recording is opt-in via browser microphone permission; browser synthesis and attached human recordings remain distinct. The music module is explicitly paused while capturing speech and ducked while replaying. No transcription, score or automated approval is generated.
9. Recording export uses a small, self-contained ZIP writer with correct CRC-32 and local Central Directory; user-owned speaking files are downloaded as `tablinum-my-speaking-recordings.zip`. No remote API, module loader, CDN, `fetch`, or copyrighted recordings.
10. The library has a clearly visible note that local audio and speaking recordings must be exported separately from progress backups. File import remains opt-in and Windows-first.

### Phase 8 truthful status

11. `curriculum/illustrations.json` contains nine scene specifications, Latin and English draft alt, historical references, polygon region plans and SVG fallbacks, but the painted character sheet and scenes are **not yet owner-approved or installed as final WebP runtime assets**. Their absence must not be represented as finished images. The owner must review character consistency and Roman dress before final scene production.

## Pass 2 — reproducible verification

Linux Node 22 and Windows Node 22 through `.github/workflows/phase7b-reviewed.yml` (check **the exact final SHA** before claiming success):

```powershell
npm install --no-save ts-fsrs@5.4.2
npm run test:vendor-fsrs
npm test
npm run test:phase6-claude
npm run test:phase7b
npm run test:phase7a
npm run test:phase6
npm run test:phase5
npm run test:phase3c
npm run test:phase2
npm run test:pilot
npm run test:lexemes
npm run test:illustrations
npm run test:package
```

On Windows with `npm install --no-save ts-fsrs@5.4.2 playwright@1.64.1` and `npx playwright install chromium`:

```powershell
npm run test:phase7b-browser
npm run test:phase6-browser
npm run test:phase7a-browser
npm run test:phase5-browser
npm run test:file
npm run test:review-browser
npm run test:browser
```

The tests cover historical 30-day Good and Again, limit caps across both decks, final-sentence exposure, strict timing-v2 and invalid IDs, session fallback, local ZIP integrity and unsafe path rejection, actual browser local file imports, first-gesture Web Audio, earlier signed-only exercises and v4 preserved state. The Windows workflow may also execute an Edge channel smoke check if installed.

**Independent manual checks still necessary:** microphones and MIDI-like timbre on the owner's real Windows hardware, real v0.4.2 backup restore, Edge/Chrome/Firefox permission differences, a long MP3's actual timing accuracy, export of large speaking ZIPs and available disk quota.

## Compliance and known limitations

- The FSRS model/version is **pinned v5.4.2**; do not silently migrate to ts-fsrs v6 / FSRS-7 (that is a separate historical-data migration). Vendor files and exact SHA manifest are retained.
- Daily review counters depend on `deck.log` which is trimmed to the latest 500 records under the original storage rule. Learners doing over 500 reviews in one day may not have fully accurate daily counts; this is a noted limitation for a later independent daily counter.
- User-uploaded audio is neither certified as pedagogically correct nor approved for graded listening. `MediaRecorder` depends on browser permission/codec support. Speaking practice is self-comparison **without grades**.
- There is still no completed Phase 8 set of signed WebP illustrations. The existing SVG fallback remains.

## Waiting on the owner

Sign/reject 128 candidate lexical entries in `Start Vocabulary Review.cmd`, approve the 15 unreviewed paradigm samples, review and sign the 8 original pilot Latin chapters, complete `docs/WINDOWS_OFFLINE_CHECK.md` with a real backup, and approve character sheet plus individual watercolour scenes. The strict 1,500 and 3,000 **approved-lexeme** introduction milestones remain RED.

## Next exact task

Finish Phase 7b browser/device checks, then Phase 8 owner-reviewed character and watercolor art with provenance, <250 KB WebP assets and thumbnails, accessible picture-region interactions. Preserve original source content and the ability to open `index.html` directly. Create only one new branch from this branch; no stacked PR merges and no release. Return the **full runnable program ZIP and handover together**.
