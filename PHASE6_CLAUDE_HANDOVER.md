# LATIN X / Tablinum — Phase 6 full Claude review handover

**Date:** 6 November 2026, Sydney.  
**Branch:** `feature/phase6-fsrs-owner-audio-20261106`  
**Parent:** `docs/owner-audio-art-20261105` (reviewed Phase 5 plus Claude review and new owner requirements).  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/docs/owner-audio-art-20261105...feature/phase6-fsrs-owner-audio-20261106  
**Delivery:** The complete runnable ZIP, not this Markdown alone.

## Entry points and constraints

Extract the whole source archive and double-click `Start Tablinum.cmd`. This keeps the original eight playable lessons, PDFs/audio import options and v4 raw progress untouched. No copied Familia Romana text/audio, no artificial Latinist signoffs, no releases or main-branch merges. All eight proposed original Book I chapters remain unsigned and unpublished, and the 128 word decisions, 15 paradigm tables and 1,500/3,000 completion gates stay RED.

Read in order `docs/claude/PHASE5_REVIEW_FOR_GPT.md`, `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md`, `GPT_HANDOVER_NEXT_PHASES.md` §§6, 8, `PHASE5_CLAUDE_HANDOVER.md` and `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md`.

## Pass 1 — implementations

1. Addressed Phase 5's minor findings: true/false buttons now read **Vērum / Falsum** but submit booleans; reviewed feedback is **Latin first**; reviewed event-order cards can be rearranged with drag-and-drop, tap ↑/↓ and keyboard arrow controls. No approval of unsigned exercises was added.
2. Vendored **real ts-fsrs v5.4.2** locally as `vendor/ts-fsrs.umd.js`, retaining its original `vendor/ts-fsrs.LICENSE` (MIT). `scripts/vendor-fsrs.cjs` verifies the npm package is exactly 5.4.2 and records a SHA-256 in `vendor/ts-fsrs-manifest.json`. The app loads the UMD as a classic file URL script, without `fetch`, ES modules, a CDN or network.
3. `app/55-review-deck.js`: genuine FSRS scheduling with retention 0.9, no random fuzz, Again/Hard/Good/Easy, immutable reviewed-lexeme IDs, explicit `legacyCards` separation, 500-item log, 15-new/150-review daily settings scaffold, safe date hydration and stable review history.
4. Original free vocabulary saved by the eight existing chapters remains in `deck.legacyCards`. It receives genuine FSRS scheduling on review, but is NOT promoted to an owner-approved lexeme. The old `tablinum-source-review-v02` key is never modified; `app/20-state-v5.js` now keeps FSRS metadata when the original UI projection saves notes or other fields.
5. Approved new-course lexemes get recognitional cards only when the human-approved lesson is expressly marked read; listening cards require verified chapter + sentence audio, and production cards are only proposed after Book I. No new-course chapter is approved today.
6. Approved token exposure is counted once per sentence per session on sentence advance or guidance opening. `Progressus` shows **Introduced, Encountered, Recognised, Productive** independently. Recognised and Productive require a reviewed FSRS card with stability at least 21 days (or 2 logged speaking uses). Legacy provisional words never inflate these totals.
7. Owner audio/art requirements have been retained verbatim, including calm plucked-lyre music and synthesized clicks after the first user gesture, and historically plausible watercolour sketch images. Those are Phase 7 and Phase 8 deliverables; do not claim they were implemented or artworks approved merely because this document records them.

## Pass 2 — reproducible tests

The CI workflow `.github/workflows/phase6-fsrs.yml` pins npm `ts-fsrs@5.4.2`, generates the actual UMD and LICENSE, and confirms matching SHA-256 before committing the vendored copy. It runs:

```powershell
npm test
npm run test:phase6
npm run test:phase5
npm run test:phase3c
npm run test:pilot
npm run test:phase2
npm run test:lexemes
npm run test:package
node scripts/vendor-fsrs.cjs --check
```

Windows with Playwright pinned to `1.64.1`:
```powershell
npm run test:phase6-browser
npm run test:phase5-browser
npm run test:file
npm run test:review-browser
npm run test:browser
```

`tests/phase6-fsrs.test.cjs` checks FSRS review timing, old v5 projection preservation, zero unsigned approvals, per-sentence exposure deduplication, four separate counters, and fixed 500-history size. `tests/phase6-browser.test.cjs` checks real offline file URLs, v4 unchanged after scheduling, reviewed-only synthetic new-course lexemes, Vērum/Falsum and keyboard rearrangement. It uses synthetic in-memory approved test fixtures ONLY; no real book/content approval is saved.

The original compiler source lock, migration fixtures (including 120 notes), audio-mode honesty and offline vocabulary owner editor remain subject to the old regression suite. Review the latest CI run HEAD SHA and report separately all skipped/failed checks.

## Known limitations and owner reviews

- This phase implements the review deck, **not** full audio, microphone recording, historical illustration files, or graded pilot chapters.
- Legacy cards have only prior heuristic `due,days,reps` values, not actual past review grades. FSRS starts from a fresh card upon its first new rating rather than inventing an old FSRS log. Old due dates remain until then.
- Source phrase highlighting uses the original attested token surface; no automatic invented lexeme morphology.
- The four progress metrics exclude draft lexemes and unapproved chapters, regardless of how many pilot lines exist.
- The 15-new and 150-review daily values are state defaults; review-queue daily rate limiting needs further UX verification.
- A trained Latin reader must approve the 128 lexical candidates, 15 paradigms and eight draft chapters. The owner also must review the Windows real-backup restoration checklist.

## Next exact tasks

**Phase 7:** original plucked-string Web Audio music and click sounds with privacy-friendly file:// controls, verified narration ducking and microphone pause, plus user-audio storage and ungraded speaking.  
**Phase 8:** generate consistent coloured ink-and-watercolour pilot scene art and a character sheet; preserve prompts, evidence, WebP thumbnails, Latin/English alt, percentage interaction polygons and SVG fallback. Nothing is approved unless the owner actually approves it.

Claude must respond with concrete bugs and reproductions, complete current runnable ZIP with *all* program source and this updated handover, real test results, and a single new branch on top of this one. Do not merge stacked PRs or claim release.
