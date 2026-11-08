> **LATEST HANDOVER:** Open [PHASE1_OWNER_TIER_HANDBACK.md](PHASE1_OWNER_TIER_HANDBACK.md) first, followed by [curriculum/lexicon/PHASE1_REVIEW_GUIDE.md](curriculum/lexicon/PHASE1_REVIEW_GUIDE.md). The current branch implements owner vs Latinist tiers, safe multi-sense merges, draft-aware DCC hint exports, unglossed tokens and all Phase 0/1 source tests. The owner must sign the separate Claude draft before import; **do not merge, silently approve, fabricate signatures or begin Phase 2 without the owner's signed decisions.** Older handovers below are historical.

> **PHASE 1 CURRENT WORK — READ [PHASE1_HANDBACK.md](PHASE1_HANDBACK.md) FIRST.** The project contains the unchanged original eight-chapter app, a tested source-traceable 128-candidate review workflow, 50 exact DCC hints with licence attribution, 204 legacy lookup keys, 177 non-introduction context/exercise/cloze records, and an unsigned human-review CSV. The reviewer must independently check morphology, sources, macrons and nine ambiguous reading tokens. No entries have been human-approved, so the lexical *acceptance gate is intentionally not met*. The Phase 0 handback and Claude roadmap remain in this same complete program package. The older directions below are historical.

> **CURRENT DEVELOPMENT BRANCH: PHASE 0 DONE — review [PHASE0_HANDBACK.md](PHASE0_HANDBACK.md) and the [entire Claude roadmap](CLAUDE_IMPLEMENTATION_ROADMAP.md) first.** This snapshot includes all current program files and tests, synthetic v4 backup fixtures, source locks, and GitHub Windows Edge/Chromium `file://` checks. All original lesson content and saved-state formats remain unchanged; the next scoped coding task is Phase 1 (lexeme registry). The older lexeme-audit review prompt below is historical.

> **NEW CLAUDE TASK — EXPLAIN HOW TO COMPLETE THE PROJECT:** Start with [`CLAUDE_REMAINING_WORK_HANDOVER.md`](CLAUDE_REMAINING_WORK_HANDOVER.md) for a full ordered implementation plan request. This project contains the running app and all current source. Give a detailed `CLAUDE_IMPLEMENTATION_ROADMAP.md` before initiating further coding; the latest lexical-audit-specific review instructions below remain useful reference.

# LATEST CLAUDE REVIEW — Tablinum lexical audit Cycle 2

**Review the complete current project, not a handover alone.** The original eight-lesson `index.html` remains runnable, unchanged; the new work in this branch is actual offline token-indexed lexical audit and stable chapter/question ID groundwork.

**Start here:** [curriculum/lexicon/LEXEME_AUDIT_HANDOVER.md](curriculum/lexicon/LEXEME_AUDIT_HANDOVER.md). It explains the scope, measured evidence, commands, limitations, and what to review. Then inspect the generator [scripts/build-legacy-lexeme-audit.cjs](scripts/build-legacy-lexeme-audit.cjs), the [token audit](curriculum/lexicon/legacy-token-audit.json), the [legacy ID map](curriculum/lexicon/legacy-id-map.json), and [tests/legacy-lexeme-audit.test.cjs](tests/legacy-lexeme-audit.test.cjs). The uploaded review that motivated this work is archived at [curriculum/reviews/TABLINUM_REVIEW_V3_FOLLOWUP_20261105.md](curriculum/reviews/TABLINUM_REVIEW_V3_FOLLOWUP_20261105.md).

**Please perform an independent code and Latin audit** of this first lexical-registry slice, identify P0–P3 issues and propose a limited next patch to create the actual, individually verified lemma registry. No release, PR merge, lesson renumbering, progress migration, third-party copyrighted material import or silent candidate-to-verified promotion.

**Important:** *124 provisional non-proper headword candidates* is not *124 verified Latin lemmas*. The actual new-course verified-introduction ledger remains empty, and the target counts 500/1,532/3,036 remain planning figures.

---

# START HERE — Claude review of Tablinum curriculum v3

**Date:** 5 November 2026  
**Repository:** `cosmiccopper29-svg/Latin-X`  
**Branch:** `fix/tablinum-curriculum-v3-pronouns-20261105`  
**Task:** **review only**. Do not merge, release, rewrite the runnable app, add copyrighted textbook media, or create 130 chapter texts.

## What this download contains

- The **complete current Tablinum Manuscript Edition application** in `index.html`, with **eight existing original chapters**, previous smoke tests and documentation. This program file is identical to the reviewed v0.4.2 manuscript branch; this cycle changes curriculum data only.
- The **entire 130-chapter planned curriculum** in `curriculum/CURRICULUM_130_MASTER_PLAN.md` and machine-readable `curriculum/vocabulary-budgets-130.json`.
- The original follow-up review archived verbatim as `curriculum/reviews/TABLINUM_REVIEW_20261105.md`.
- The issue-by-issue [curriculum/CLAUDE_REVIEW_RESPONSE_V3.md](curriculum/CLAUDE_REVIEW_RESPONSE_V3.md), the prior review in `curriculum/reviews/CLAUDE_REVIEW_130.md`, and all prior programme handover documents.
- Independent research on *Familia Romana* in `curriculum/FAMILIA_ROMANA_RESEARCH.md`, vocabulary planning data, and honest introduction-count gates.

**Critical:** There are **not** 130 playable Latin chapters or 3,000 verified vocabulary words yet. The 500 / 1,532 / 3,036 vocabulary totals are *planned budgets*. The verified-introductions ledger is intentionally empty.

## What changed after Claude's v2 check

Review the specific flagged findings and confirm the new sequencing:

1. **Ch 11:** `mē/tē` alongside `ego/tū`; **Ch 14:** `meus/tuus` within adjective agreement; **Ch 15:** `hic/ille` as picture-supported near/far demonstratives; **Ch 16:** `nōs/vōs`; **Ch 20:** `is/ea/id/eum/eam/eius`; **Ch 26:** `sē/suus` contrasted with `eius`. Check the cognitive load of these *explicitly marked secondary lectiones*.
2. **Ch 71** teaches the **oblique demonstrative forms as consolidation**; it is no longer the first exposure to `hic/ille`.
3. **Ch 18** introduces vocative direct address with positive singular commands (`Mārce!`, `Tīte!`); **Ch 54** expands to plural imperatives (`venīte, audīte, portāte`).
4. **Ch 81** is no longer a duplicate of Ch 42's ACI with present infinitive. It now contrasts `eum/eam` (someone else) and reflexive `sē` (the subject of reporting). Ch 82 and 83 retain perfect and future infinitives.
5. Corrected macrons in titles at Ch 76, 78, 85, 94, 120; corrected `teneō`, `sedeō`, `maneō`, `surgō`, `scrībō`, `sentiō`, `labōrō` in candidate word lists. **No qualified Latinist has certified the complete Latin**.

## Please evaluate

- Does the combined pronoun/demonstrative sequencing teach meaningful comprehensible Latin, or should one or more topics get separate chapters?
- Do the apparent four fixes introduce any new grammar prerequisites or lexical-count inaccuracies? Are the Chapter 15 and Chapter 26 mini-lectiones too dense?
- Are the Latin sentence examples implied by the plan idiomatic and grammatically plausible? Check macrons and vocative usage.
- Has the repeated Ch 42/Ch 81 topic genuinely been resolved?
- Are the 500 / 1,532 / 3,036 *allocations* realistic with the proposed longer readings and human quality control? Note the remaining real-registry and content-production work.
- Is the next narrow task correctly chosen: **a token-level, source-traceable lexeme registry derived from actual original lessons** before an offline `file://`-safe architecture migration?
- Review the v0.4.2 runnable app only insofar as relevant to compatibility. Do not assume browser/audio or human-spoken-Latin tests have been done if they have not.

## Commands

```bash
npm test
node curriculum/validate-outline-50.cjs
node curriculum/validate-roadmap-130.cjs
node curriculum/validate-outline-v2.cjs
node curriculum/validate-outline-v3.cjs
```

The following should **fail by design** until actual authored and approved lemma-tagged lessons substantiate the count:

```bash
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

The actual browser test is optional and requires an installed Playwright + Chromium. Use `npm run test:browser` when set up, and report the browser/version and actual result. Clearly state tests *not* run.

## Requested handback

Return a file **`CLAUDE_REVIEW_130_V3.md`** containing a pass/conditional/revise verdict, a prioritized findings table with exact chapter and JSON/Markdown references, anything still incorrect in Latin, a concise assessment of graded reading and speaking competence, actual test results, and a limited **Cycle 2 lexeme-registry specification** for GPT to implement next.

Do **not** implement anything in the repo during the review. Keep the complete program, all analysis and future handovers together in the next package. No GitHub merges or releases without instruction.
