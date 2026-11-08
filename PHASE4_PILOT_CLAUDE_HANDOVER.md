# LATIN X — Claude-authored Book I pilot: complete handover

**Prepared:** 6 November 2026 (Australia/Sydney)  
**Branch:** `content/pilot-b01-c001-c008`  
**Parent:** `feature/phase3c-state-migration-20261106`  
**Source of Latin:** `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md`, uploaded by the owner.  
**Owner instruction:** `docs/pilot/PILOT_NOTE_FOR_GPT.md`.  
**Status:** DRAFT / UNSIGNED / UNPUBLISHED. Do not merge to main or promote lexemes.

## Give Claude the WHOLE runnable project

Upload the full branch ZIP, not this handover alone. Extract on Windows and double-click
`Start Tablinum.cmd` to open the original playable app. The ZIP also contains all eight
manuscript-derived lesson JSON files, tests, compiler, reports, source maps, owner-review
editor, prior handovers, original eight playable legacy lessons and the curriculum plan.

Read in this order:
1. `docs/pilot/PILOT_NOTE_FOR_GPT.md` — binding authoring rules and owner decisions.
2. `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` — Claude's original Latin, unaltered.
3. `scripts/import-claude-pilot.cjs` — deterministic one-line/one-sentence importer.
4. `scripts/lib/pilot-grammar.cjs`, `tests/pilot-text.test.cjs` — order and manuscript locks.
5. `reports/pilot-metrics.md`, `GPT_HANDOVER_NEXT_PHASES.md`, `PHASE3C_CLAUDE_HANDOVER.md`.

## Pass 1 — implementation

- Applied all four findings in Claude's `PHASE3C_REVIEW_FOR_GPT.md`: fix saved-course
  `/\d{3}/` reload pattern, catch corrupt v4 JSON/snapshot storage errors during
  re-migrate, prevent duplicate approved deck cards, and recognise Firefox quota names/code.
  A dedicated Node test and a real `file://` browser test exercise these fixes.
- Copied Claude's manuscript **verbatim** to `docs/pilot/`. No rewriting, padding,
  sentence substitutions, grammatical corrections or silent approval.
- `scripts/import-claude-pilot.cjs` is the ONE source-to-JSON generator. It maps
  each `## Lēctiō` to a segment; each printed reading line to a single sentence,
  retaining `«…»` and exact typography, plus original source-line references.
  Even when a line contains two punctuation-delimited clauses, it is ONE source entry.
- Each reading token has `lx:null`, `morph:null` and
  `annotation_status:"draft_unverified"`. All chapter review signatures remain null,
  `status:"draft"` and `drafted_by:"claude-draft-2026-11-05"`.
- Exercises are exactly the six chapter `Quaestiōnēs`; speaking prompts are
  `Loquere` bullets. Both are `proposed_ungraded`, without invented answer-key approval.
  None of these eight new-course chapters is published to the learner catalogue yet.
- `scripts/pilot-metrics.cjs` derives actual line and token counts from the manuscript.
  No invented hours/1,000 tokens. `reports/pilot-metrics.md` is generated.
- `scripts/lib/pilot-grammar.cjs` checks known early forms against
  `curriculum/grammar-features.json` first-chapter rules and rejects out-of-sequence
  explicitly annotated morphologies even when `lx:null`.
  The compiler invokes these draft checks on Chapters 1–8, rather than skipping grammar
  checks for all drafts. **This is not a substitute for a full human Latin review.**

## Pass 2 — reproducible acceptance gates

Run under Node 22 from the project root:

```powershell
npm run build:pilot
npm run test:pilot
npm test
npm run test:phase2
npm run test:phase3c
npm run test:lexemes
npm run test:package
```

The text regression test rejects a duplicate reading line within a chapter, refuses any
manuscript-to-lesson divergence, and checks the exact negative forms:
`bibunt` in Chapter 3, `laetī` in Chapter 5 and `patris` in Chapter 2.
It also injects an explicit 3rd-person-plural morphological tag into a Chapter 3
draft token and requires rejection by its `first_chapter` in the grammar feature catalogue.

**Expected strict RED gates:**
- Owner vocabulary review readiness (128 proposed candidates remain unsigned)
- 1,500 approved unique introductions by Chapter 90
- 3,000 approved unique introductions by Chapter 130
- 15 owner paradigm sample-table approvals

The compiler deliberately keeps all new pilot chapters OUT of approved player content and
the introductions ledger. A draft being present is NOT a certified vocabulary introduction.

## Exact source-derived counts

When one manuscript line is treated as one sentence, Chapters 1–8 have
52 / 40 / 45 / 49 / 43 / 49 / 46 / 55 reading entries respectively.
Unicode-token counts are 275 / 284 / 256 / 267 / 288 / 279 / 271 / 306, for 2,226 total.
Claude's front-matter prose counts punctuation-delimited sentences differently, and lists
272 for Chapter 7. The generator follows the underlying manuscript lines; it does not
rewrite content to make these figures match.

## Waiting on the owner

- Decide on excess proposed vocabulary in Chapters 2, 3, 4 and 7; verify Chapter 1's
  foundational vocabulary against its budget and Chapter 5's zero-new-words aim.
- Send any requested wording changes back to Claude or approve them explicitly.
  Especially check `Pecūnia est pretium`, `Gāī` and `Canis! Canis!`.
- Chapters 3–8 are 2–39 tokens shorter than their minimum (Unicode tokenizer): leave as-is for now.
- Review original Latin, images and margin notes, morphology, exercises and speaking
  prompts, preferably with a qualified Latinist. Only a real human can sign chapters.
- Review the 128 lexical candidates and 15 paradigm tables. Do not forge approvals.

## Reviewer limitations and next task

The pilot's `lx:null` and `morph:null` fields mean a complete token-by-token
grammar proof and licensed dictionary match have NOT been carried out. The explicit
surface-form test catches named high-risk examples but cannot determine every
homograph or inflection automatically. Claude or the owner must review corrections
before signatures and publication. Preserve the original eight playable legacy chapters,
the v5 state and the untouched v4 original key.

**Next:** Owner-led manuscript and vocabulary-budgets review, then deeper verified
token/lexeme annotation, signed Latin and pedagogical approval, and only then publication.
Do not start Phase 5 graded exercise engines by marking draft keys approved.
