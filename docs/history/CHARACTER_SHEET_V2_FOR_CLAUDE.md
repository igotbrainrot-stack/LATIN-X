# LATIN X — Character Sheet V2: Claude full-source handover

**Date:** 6 November 2026 (Sydney).  
**Purpose:** owner-directed refinement of previously selected **candidate A (full-body lineup)**; *not a new lesson or approval*.  
**Branch for this task:** `art/character-sheet-v2-owner-review-20261106`.  
**Parent:** `art/character-sheet-candidates-20261106` at `5523343c38ae387ccec443eb0bc661f0203ca4f4` (based on Claude-approved `review/phase12-prep-20261106`).  
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/art/character-sheet-candidates-20261106...art/character-sheet-v2-owner-review-20261106  
**Disposition:** Review-only. Do **not** merge to `main`, mark approved, or publish scenes or a release.

## Deliverables in the full ZIP

- All runnable offline Windows application code (`index.html`, `Start Tablinum.cmd`, `app/`, `content/`, `lessons/`, `curriculum/`, `tests/`, `vendor/`, `scripts/`, `.github/workflows/`, previous handovers), **including all eight legacy playable chapters and all eight still-unsigned pilot manuscripts**.
- `CLAUDE_HANDOVER/DRAFT_CHARACTER_ART/character-sheet-v2-unapproved.png`: new full-resolution original PNG, **1774×887, RGB**, SHA-256 `e6a60f4df382033f7c37135f49684441000a88db5900e7426a0f50ff612e92e9`, image generation ID `df1e03a6-4346-4ce6-8e73-727f48a114cc` (2026-11-06). **This is in the user-delivered ZIP, NOT in the public Git repository or runtime assets.**
- The four earlier preview images in `CLAUDE_HANDOVER/DRAFT_CHARACTER_ART/`, preserved unchanged.
- `CLAUDE_HANDOVER/PASTE_TO_GPT_CHARACTER_SHEET_V2.md`: verbatim owner corrections and intended design.
- `curriculum/illustrations.json` updates only the top-level `character_sheet` draft record to v2; retains previous previews and all nine unsigned scene records. `content/illustrations.js` was regenerated from that manifest using the existing classic-script compiler.
- This handover and the local test logs in `CLAUDE_HANDOVER/TEST_RESULTS_CHARACTER_V2.txt`.

## Character-sheet V2 — source and review

Owner explicitly chose **candidate A as the base**. The requested single, non-overlapping front-facing row uses a plain parchment background; Mārcus (~40, curly hair, short beard, ivory tunic/red trim, no cloak), Flāvia (~35, updo, ivory stola/terracotta palla), Līvia (~9, two long braids, olive tunic), Tītus (~7, light curls, faded-blue tunic, gold bulla), Gāius (~40, clean-shaven, grey temples, blue-grey tunic/brown mantle), Gāius's son (~10, short straight black hair, slimmer face, ochre tunic), and seated white/chestnut dog wearing a brown collar. No writing or buildings.

Image tool returned the **descriptive art prompt** recorded in `character_sheet.prompt` and the generation ID above. Its metadata did **not** provide a verbatim internal hidden generation prompt. The exact user-owned source directions are stored separately in `character_sheet.owner_correction_brief_verbatim` and in the ZIP to ensure repeatability without inventing tool details.

The creator's visual inspection indicates a substantially closer match to the owner brief, with isolated head-to-toe silhouettes, distinct colour-coding and no scenic buildings. **Only the owner may approve or request corrections.** The manifest leaves `approval.by`, `approval.at`, `approval.notes`, `owner_review.by`, `owner_review.at` and `owner_review.decision` all null. An unsigned preview must never appear in the student app.

## Pass 1 — creation and safe metadata only

1. Regenerated one new character sheet as directed (not the nine chapter images).
2. Stored original PNG in the complete handover ZIP, with real SHA-256 provenance and exact output dimensions.
3. Updated `curriculum/illustrations.json` at `character_sheet`, preserving the older candidates. Changed no lesson sources, original saved-state handlers, runtime assets, vocabulary approvals, exercise grades or signatures.
4. Regenerated `content/illustrations.js` via `npm run build:art` with no fetch/ES module changes.

## Pass 2 — actually executed local checks

Environment: Node v22.16.0, Linux container. Executed: `npm run build:art`, `npm test`, `npm run test:art`, `npm run test:package`, `npm run test:pilot`, `npm run test:lexemes`, `npm run test:music`, `node scripts/build-illustrations.cjs --check`, plus SHA-256 verification and ZIP integrity scan. All local commands passed; full raw stdout is attached in `CLAUDE_HANDOVER/TEST_RESULTS_CHARACTER_V2.txt`.

**Not run:** physical Windows/Chrome/Edge/Firefox hardware, NVDA accessibility, human audio/microphone assessment, Latinist validation or owner's art decision. The previously approved Phase 12 Windows CI results belong to the earlier branch; do not claim we reran them for v2.

## Gates / waiting on actual owner

- Current V2 character sheet **awaiting owner approval**. It is *not* a signed reference; all earlier candidates are also drafts.
- All **nine** pilot illustrations remain `planned_owner_unapproved`; no WebPs, thumbnails, click polygons or signed images exist in `assets/art/b01`. Do **not generate the nine scenes** until owner explicitly approves V2.
- All eight original Book I pilot chapters remain unsigned; 128 legacy vocabulary candidates and 15 paradigms need the owner's decisions. The 1,500 / 3,000 distinct lexeme gates are RED. No marks or approvals should be invented.
- Do not write to the old `tablinum-source-review-v02` or `tablinum-v4-snapshot` keys; preserve additive v5 state.

## Next exact action

**Present the PNG to the owner and obtain an explicit approve/revise decision.** Once approved, Claude may ingest the actual PNG, generate/crop exportable reference assets and assist with WebP conversion; only then proceed to the nine pilot lesson scenes in `docs/art/PILOT_SCENE_PROMPTS.md`. Draw region polygons from actual pixels; owner signs each final scene in `Art Review.html`. Keep all unapproved imagery out of the runtime.

For any follow-up Claude handoff, always provide the **entire program source, all new assets, tests, prior handovers and current handover in one ZIP**.
