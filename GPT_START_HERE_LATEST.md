# GPT: start here (Latin audio audition with Runway)

You are continuing **LATIN X / Tablinum**, an offline, Windows-first Latin reader for one owner's personal use. It teaches by the natural method: graded stories, pictures and Latin margin notes. It is inspired by that method only: **never copy or paraphrase Familia Romana** (its text, audio, plots or art).

Claude reviews every phase you finish. The owner passes files between you: you give the owner a ZIP, Claude reviews it and pushes a review branch, and you continue from that branch.

## Repository and branch
- Repo: `cosmiccopper29-svg/Latin-X` (public).
- **Build on: `review/art-glow-audio-research-20261107` (head 0d7819f).** It has your overlap grading, glow, main-reader art, the nine owner-approved watercolour scenes (approved 2026-11-07), your audio research, and Claude's review fixes. Push one new branch on top of it; never merge to main.
- Never merge to `main`. Never publish a release. Push exactly one new branch per task, on top of the review branch.

## Standing rules (from the owner)
1. **Windows 10/11 first.** The app opens by double-clicking `Start Tablinum.cmd` and runs from `file://`. That means classic `<script src>` tags only: no `fetch()`, no ES modules, no server, no internet.
2. **Never lose saved progress.**
   - Never write to `tablinum-source-review-v02` or to `tablinum-v4-snapshot`.
   - State is v5 (`tablinum-state-v5`), and new fields are additive.
3. **Never fake approvals.** Only the owner signs: vocabulary, paradigm tables, chapters, exercise keys and images. Owner-tier sign-off is labelled "not checked by a Latinist".
4. **Never pad content.** The strict 1,500 and 3,000 introduction gates and `--require-review-ready` stay RED until they are truly met.
5. **Two passes on every phase.** Pass 1 builds it; Pass 2 tests it and fixes what the tests find. Report real output, and name any tests you did not run.
6. Bewick's Aesop EPUB: use its plots and engravings only, and **never commit it to git**.
7. Every handback is a **complete runnable ZIP** plus a handover covering: branch, parent and compare link; Pass 1 and Pass 2; tests; items waiting on the owner; and the next task.

## Where things stand (all phases approved by Claude)
| Phase | Status |
|---|---|
| 0–2 | Safety tests, lexeme registry, lesson compiler, 172-feature fail-closed grammar gate |
| 3a–3c | Script moved to `app/`, offline content loader, lossless v4→v5 migration and backups |
| 4 | Book I chapters 1–8, written by Claude, in `lessons/b01/`. **Unsigned.** |
| 5 | Exercise engine. Only owner-signed keys are graded. |
| 6 | FSRS review deck (genuine ts-fsrs 5.4.2). Legacy intervals kept, daily limits enforced. |
| 7 | Lyre music (3 original pieces plus the Seikilos epitaph), click sounds, ducking, user audio, ungraded speaking |
| 8 | Art done. All nine Book I watercolour scenes **owner-approved 2026-11-07**; picture practice with answer-polygon grading (unsigned, ungraded). |
| 12 prep | Accessibility labels, long-profile migration test, Windows browser matrix: all green |

Read these first:
1. `docs/claude/PHASE12_PREP_REVIEW_FOR_GPT.md`
2. `docs/claude/PHASE8_REVIEW_FOR_GPT.md` (the image route)
3. `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md`
4. `GPT_HANDOVER_NEXT_PHASES.md`

## Your tasks now
The owner's Runway plan is now upgraded.

1. **Read, in order:**
   - `docs/claude/ART_GLOW_AUDIO_RESEARCH_REVIEW_FOR_GPT.md` (Claude's review of your last package)
   - `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md` (**the exact method for getting Runway to speak restored Classical Latin**)
   - `docs/audio/latin-ipa-pilot-lexicon.json` (IPA for the 9 test sentences and 40 words)
2. **Run the audition (main task)** exactly as in sections 3–6 of the guide: 2 voices, the 9 legacy chapter 1 sentences plus 8 test words, one IPA retry only for words that fail. Then stop. Hand back the MP3s, `docs/audio/audition-2026-11.json` and the offline `Audio Audition.html` review page for the owner.
3. **Fix the three test items** in Claude's review (two stale browser tests; move test inputs out of `CLAUDE_HANDOVER/`).
4. Do not wire audio into the reader, and do not start Phases 9–11.

## Rules for the art (do not change)
- Never edit, re-encode or replace the approved WebPs, polygons, captions or approvals in `curriculum/illustrations.json`. Ask Claude if a region looks wrong.
- `tests/phase8-art-gates.test.cjs` and `tests/illustrations-plan.test.cjs` expect all nine scenes approved and run the fail-closed checks on an unsigned copy of c006. Keep them as they are.
- Source PNGs stay outside Git.

## Waiting on the owner
- Listen to every audition clip in `Audio Audition.html`, accept or reject each, and pick a voice.
- Sign the new picture exercises after Claude checks them.
- Read and sign the 8 pilot chapters.
- Sign or reject the 128 legacy words.
- Approve the 15 paradigm tables.
- Run the Windows checklist.
