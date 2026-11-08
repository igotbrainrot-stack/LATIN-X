> **LATEST REVIEW CYCLE V3:** Start with [CLAUDE_REVIEW_RESPONSE_V3.md](CLAUDE_REVIEW_RESPONSE_V3.md), [the newest original review](reviews/TABLINUM_REVIEW_20261105.md), and the active [130-chapter master plan](CURRICULUM_130_MASTER_PLAN.md). The pronoun gaps, plural imperative, duplicated Ch81 topic and new macron corrections are now in planning data. No new Latin story has been written; do not infer vocabulary mastery from budget slots. The original text below is retained for history.

> **OUTLINE V2 FOLLOW-UP (5 NOVEMBER 2026):** The authoritative updated roadmap is [CURRICULUM_130_MASTER_PLAN.md](CURRICULUM_130_MASTER_PLAN.md), synced with [vocabulary-budgets-130.json](vocabulary-budgets-130.json). The original Claude review is archived in [reviews/CLAUDE_REVIEW_130.md](reviews/CLAUDE_REVIEW_130.md). Read [CLAUDE_REVIEW_RESPONSE_V2.md](CLAUDE_REVIEW_RESPONSE_V2.md) for G1–G12, L1–L14, V1–V5, A/R/S disposition and remaining implementation gates. The previous material below describes v1; treat earlier grammar chapter positions and 100–220-word early reading targets as superseded. The code remains unchanged.

# Tablinum — Claude handover for 1,500 → 3,000-word course

**Prepared:** 5 November 2026. **Status:** research-backed curriculum draft, no app/runtime/lesson modifications.  
**GitHub branch:** `plan/latin-3000-word-curriculum-20261105` (parent: `plan/latin-course-outline-50-20261105`).

## Updated user requirements

The course should start with simple, comprehensible Latin, introduce **at least 1,500 distinct Latin lexemes**, extend toward **3,000 in its harder sections**, and support **reading and spoken Latin**, not solely grammatical recall. The user has previously chosen a roughly 15-word ceiling for beginner lessons, and the handover specifies ~50 beginner chapters. Preserve this early-stage limit; add graded longer intermediate and advanced reading instead of accelerating the first chapters.

## What has been delivered

- `curriculum/FAMILIA_ROMANA_RESEARCH.md`: deep source-linked comparison of Ørberg's 35-chapter natural-method reader, approximately 1,800-word publisher claim, the `Roma Aeterna` advanced transition (~3,000 reported words), DCC lexical research, active Latin teaching and relevant curriculum standards.
- `curriculum/CURRICULUM_130_MASTER_PLAN.md`: **130 individually outlined original story chapters** with grammar, chapter new-lemma budget and cumulative targets; three books, reading/communication progression and proficiency checks.
- `curriculum/vocabulary-budgets-130.json`: machine-readable full chapter plan with targets, text lengths, speaking tasks, lectiones and review chapters.
- `curriculum/vocabulary-introductions-130.json`: **empty actual-attestation ledger**. Do not fill this with placeholder words. Real entries require an authored approved Latin lesson sentence, stable reviewed lexeme ID and evidence.
- `curriculum/validate-roadmap-130.cjs`: structural tests and future actual-vocabulary completion gates.
- Earlier `curriculum/CHAPTER_OUTLINE_50_DRAFT.md` and `dcc-seed-audit-50.json` remain as the Book I planning history and DCC source seed audit.

## Quantitative specification

| Stage | Chapters | Teaching | Review | New lemma allocation | Cumulative |
|---|---:|---:|---:|---:|---:|
| Book I / Foundation | 1–50 | 38 | 12 | 500 | 500 |
| Book II / Developing | 51–90 | 32 | 8 | 1,032 | **1,532** |
| Book III / Advanced | 91–130 | 32 | 8 | 1,504 | **3,036** |

These are **target slots only**. As of this handover, the number of new lessons that have been fully authored, human-reviewed and tagged with approved lexeme IDs in this roadmap is **zero**. The original eight short lessons remain in the working app and are not represented as 500, 1,500 or 3,000 verified lemmas.

The beginner load starts at **six** new lemmas, slowly approaches **15** by later chapters, then steps up through 17–47 in Book II and 46–49 in Book III **only alongside longer multi-lectio readings and reviews**.

## Research-derived pedagogy to implement

1. Meaning in context: coherent recurring original cast, pictures, more than one reading segment.
2. Latin-first marginal notes and simple Latin explanations with optional English.
3. Introduce a grammar pattern in a meaningful scene *before* displaying a rule; consolidate with questions and forms.
4. Revise priority lexemes in meaningfully varied contexts and subsequent review stories, not solely flashcard translations.
5. Use separate measures for **introduced / encountered / demonstrated recognition / productive use**, without conflating them.
6. Grow interpretive Latin and spoken Latin as separate skills: listen-and-repeat, picture description, dialogues, retelling, spontaneous follow-up questions, and later reasoned talk about texts.
7. Bring learners to original increasingly long narratives, then source-cleared adapted/real classical readings—not copied copyrighted textbook chapters.

## Source quality and licensing notes

DCC provides approximately 1,000 core lemmas, not 3,000. The user's CSV has 997 entries; compound headwords and homographs are important (e.g. `fīlia / fīlius`, `edō / ēdō`). Beyond those, supplement with **licensed, vetted** words selected from frequency resources and actually authored Latin scenes. Document provenance and macron review. Do not import the protected `Familia Romana` or `Roma Aeterna` passages, illustrations, exercises, audio, or other user-supplied copyrighted third-party media into GitHub.

## Explicit tests

`node curriculum/validate-roadmap-130.cjs` should **PASS** structural budget and source-ledger integrity with real introduced count 0.

`node curriculum/validate-roadmap-130.cjs --require-introduced-1500` should currently **FAIL** honestly; the app has not authored the 1,500 approved lexemes.

`node curriculum/validate-roadmap-130.cjs --require-introduced-3000` should also **FAIL** until 3,000 genuine introduced lexemes are present.

No chapter-level content quality, pronunciation, reading comprehension, speaking competence or user-retention outcome is proven by the current structural validation.

## Next development cycle

1. Obtain curriculum review from a Latinist for sequencing; confirm the desired scale and speaking difficulty.
2. Build the first small pilot: re-author the current Chapter VI–VIII material into slower original reading segments, preserving existing lessons until migration verified.
3. Establish stable `lexeme_id` schema in actual small lesson JSON with source provenance and manually checked macrons, meaning and morphology.
4. Add manual/automatic coverage checks for 8–10 contextual exposures of priority words and only zero-new review chapters.
5. Build original consistent cast character sheets and labelled chapter scenes, then revise first-step hints to use semantic meaning rather than merely repeating the previous Latin sentence.
6. Extend actual vocabulary content stage by stage, demonstrating the 1,500 minimum at the end of Book II before claiming it; add longer supported reading and dialogue for the 3,000 advanced target.
7. Run browser testing (Chromium and Firefox), with real audio and human Latinist review. The earlier manuscript app is the tested baseline; this is **planning only** and must not be described as a 130-lesson playable release.

Do not merge unfinished curriculum branches or overwrite the stable manuscript application.
