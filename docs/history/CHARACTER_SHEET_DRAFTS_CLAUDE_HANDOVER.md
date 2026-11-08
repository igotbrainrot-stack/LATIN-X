# LATIN X — Character artwork draft round / full Claude handover

**Date:** 2026-11-06 (Australia/Sydney).  
**Parent:** `review/phase12-prep-20261106` at `8485873fc66b2cb96ec5266c7aa4e79abba7b91b` (Claude-approved Phase 12 preparation).  
**Working metadata branch:** `art/character-sheet-candidates-20261106` (do not merge).  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/review/phase12-prep-20261106...art/character-sheet-candidates-20261106  
**Status:** DRAFT ONLY. No asset approval, runtime image publication, chapter approval, lexeme/paradigm signoff, or release.

## What the full ZIP contains

The **entire reviewed runnable source tree**: `index.html`, Windows `.cmd` launchers, classic `app/` runtime, `content/`, all original 8 legacy playable chapters, 8 **unsigned** original Book I pilot chapter drafts, curriculum/lexicon, tests, licences, workflows, and previous handovers.

New in this package:

- `CLAUDE_HANDOVER/DRAFT_CHARACTER_ART/` — four untouched original PNG drafts, three generated on this task and one previous draft retained for continuity. These belong **outside** `assets/art/b01/` and should remain outside the Git branch until reviewed by the actual owner.
- `curriculum/illustrations.json` → `character_sheet.new_candidate_previews_20261106` — source descriptions returned by image generation, generation IDs, dates, original SHA-256 checksums, QA findings, and **empty** owner review fields.
- `content/illustrations.js` — regenerated from the updated JSON with the project's existing compiler.
- `CHARACTER_SHEET_DRAFTS_CLAUDE_HANDOVER.md` and `CLAUDE_HANDOVER/START_HERE_FOR_CLAUDE.md` — these instructions, plus the test log.

**Important provenance limitation:** The image tool reports a descriptive generation prompt for each result, but not the exact internal generation prompt (its prompt metadata is empty). The manifest records those descriptions with that qualification, rather than inventing an exact prompt. Generated artwork has not been signed for use or shipped as a runtime asset.

## Pass 1 — visual drafts

Three original watercolour-and-ink Roman family groupings were created on 6 Nov 2026. They preserve the general family/dog concept but **do not meet all owner requirements**. In particular Līvia's olive-green and Tītus's faded blue clothing, Flāvia's terracotta palla, a neutral parchment reference-sheet background, and individual easy-to-isolate full-body poses are not reliably satisfied. These are **candidates needing corrections, not the canonical reference sheet**.

The older separately generated reference `image_gen_id=165700c0-da92-4f78-aee2-c549a833f0fa` is recorded in the original manifest but its original PNG is not present in this ZIP. Do not claim to have inspected or shipped that one. The prior draft `49285db5-a1f5-44ae-afb8-7eaace9841b9` is included because its actual file was available and its checksum was verified.

## Pass 2 — checks and preservation

- Confirm all four PNG originals are byte-preserved in the ZIP with SHA-256 checksums in `curriculum/illustrations.json`.
- Run `npm run build:art` before packaging and check `node scripts/build-illustrations.cjs --check` is clean.
- Run `npm test`, `npm run test:art`, `npm run test:package`, `npm run test:pilot`, `npm run test:lexemes`, and `npm run test:music` from the extracted package; see `CLAUDE_HANDOVER/TEST_RESULTS.txt` for the **actually executed** local output.
- Confirm all 9 planned scenes remain `planned_owner_unapproved`, `asset:null`, `thumbnail:null`, `polygons:{}`, `approval.by:null`; the runtime uses SVG fallback. Never fill signatures, guess polygons, or treat any draft as published.
- Original v4 key `tablinum-source-review-v02` and `tablinum-v4-snapshot` are never rewritten by this artwork-only task; all legacy runtime code is unchanged.

**Not run in this task:** Windows physical hardware/NVDA checks, real browser audio/microphone checks, new Playwright matrix (the parent branch's CI had passed), a professional Latinist review, or owner visual approval of any new image.

## Waiting on the actual owner

1. Choose or request corrections to the **character sheet**. **Do not proceed to the nine lesson scenes** until there is a clear owner-approved canonical full-body reference, with wardrobe matches for Mārcus, Flāvia, Līvia, Tītus, Gāius, his son and the dog.
2. Approve scene images individually using `Art Review.html`; after approval create 1200–2000px wide WebPs under 250KiB and thumbnails of 600px or smaller; draw actual percentage polygons and keep Latin-first alt text. Claude can handle binary image ingestion and commits only after owner choice.
3. Independently review and approve/reject 128 legacy lexemes, 15 paradigms, and eight pilot chapters; run physical Windows checklist. All 1,500/3,000 distinct lexeme milestone gates stay red.

## Next task

**Character reference correction/owner review first**. Only after a signed character reference, produce nine original painted Book I scenes following `docs/art/PILOT_SCENE_PROMPTS.md`. Continue Phases 9–11 only after manuscript signoff. Do not merge to main, publish a release, or overwrite historic saved progress. For every future task hand back the **full runnable program + tests + assets + handover in one ZIP**, not just a markdown file.
