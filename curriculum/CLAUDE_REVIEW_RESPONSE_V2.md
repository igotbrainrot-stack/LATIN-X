# Tablinum 130-Chapter Curriculum — Claude Review Response / Outline v2

**Date:** 5 November 2026  
**Status:** First review-and-patch cycle completed: **outline/data only**, **NOT** approved Latin prose or an implemented 130-chapter reader.  
**Review basis:** [CLAUDE_REVIEW_130.md](reviews/CLAUDE_REVIEW_130.md) and [TABLINUM_HANDOVER_FOR_GPT_3.md](reviews/TABLINUM_HANDOVER_FOR_GPT_3.md).  
**Stable application:** `index.html` is unchanged from v0.4.2 Manuscript Edition on the parent branch. **Do not merge** until user and Claude accept this corrected outline.

## Summary

Claude recommended correcting the curriculum **before authoring new chapters**. The revised 130-row [master plan](CURRICULUM_130_MASTER_PLAN.md) now matches the machine-readable [plan](vocabulary-budgets-130.json). The vocabulary milestones remain exactly **500 at Chapter 50, 1,532 at Chapter 90, and 3,036 at Chapter 130** as **planned targets**, not actual introduced words.

## Review findings disposition (not a linguistic certification)

| Claude ID | Priority | What the outline v2 changes | Status |
|---|---|---|---|
| G1 | P1 | Ch. 67 introduces primary-sequence usage; Ch. 68 explicitly introduces primary/secondary sequence before indirect commands; Ch. 99 consolidates | **Outlined; Latinist check pending** |
| G2 | P1 | Ch. 79 explicitly presents pluperfect-subjunctive forms; Ch. 74 now uses only imperfect subjunctive (`venīret`) | **Outlined** |
| G3 | P1 | Ablative absolute moved from Ch. 43 to **Ch. 73**, after ablative means/cause/accompaniment in Ch. 51/52/57 | **Outlined** |
| G4 | P1 | Circumstantial/causal `cum` + imperfect subjunctive added Ch. 74 | **Outlined** |
| G5 | P1 | Chapter 50 now presents `ut` and `nē` purpose together after basic subjunctive forms, also `ut/nē` reported commands in Ch. 68 | **Outlined** |
| G6 | P1 | Third-declension adjectives moved to Ch. 35, simple subject relatives to Ch. 36, demonstratives to Ch. 71, oblique relatives to Ch. 72 | **Outlined** |
| G7 | P2 | Added imperfect passive (59), future passive (61), pluperfect passive (64) after Ch. 38–39 basics | **Outlined** |
| G8 | P2 | Added superlative (47), vocative (54), adverbs (58), impersonal verbs (62), fear clauses (76), irregular verbs (88), future participle (43), supine (107) | **Outlined; scope must be judged by Latinist** |
| G9 | P2 | Ch. 50's first lectio introduces present-subjunctive forms before purpose clauses | **Outlined** |
| G10 | P2 | Removed `sequor` from Ch. 40's story/candidate list; deponent verbs remain introduced in Ch. 44 | **Outlined** |
| G11 | P3 | First 50 chapters allocate **500** introductions; **570** is the strict ceiling (38 × 15), and the historical DCC audit distinguishes both | **Reconciled** |
| G12 | P3 | Authentic excerpt vocabulary in Ch. 129–130 is **glossed-only unless separately introduced in an approved teaching unit**; review chapters still have zero new lemmas | **Policy added** |
| L1–L14 | P1–P3 | All identified broken/macron-incorrect titles replaced in active v2 plan, including `Līs dē agrō`, `In thermīs`, `Epistula iam vēnerat` | **Mechanical corrections; full Latinist pass outstanding** |
| V1 | P1 | Ch. 1–10 now have **250–450 running tokens** each in 2–3 lectiones. Repetition may also occur across original Latin picture labels, comprehension questions and drills | **Target corrected, exposure auditing pending** |
| V2 | P2 | Existing eight short lessons are treated as **legacy material**, not proof that new chapter budgets are met; source data must migrate only after pilot validation | **Unresolved runtime/content, explicitly documented** |
| V3 | P2 | Ch. 51–55 eased to 800–1200 tokens; lexical budgets remain 17+ | **Revised on-ramp** |
| V4 | P2 | Book III entry contingent on actual Book II reading and lexical recognition checks; not automatically unlocked on chapter completion | **Assessment planned** |
| V5 | P1 | Do not project labour cost from a speculative per-hour writing rate; measure actual editorial/illustration/audio time for three pilot chapters | **Pilot required** |
| A1–A3 | P1/P2 | Lesson JSON with token-level `lexeme_id` is the future **single source of truth**, generating the ledger; DCC insufficient for 3k, complementary licensed resources required; common nouns `forum/thermae` may count | **Architecture/content implementation pending** |
| S1–S3 | P2/P3 | Separate task-based speaking and reading checkpoints with human assessment; Latin circling questions and human model audio; no fake automated pronunciation grading | **Plan specified, not implemented** |
| R1–R5 | P0–P3 | Require compile-to-script or single-file offline build, stable chapter/question IDs, one-time progress migration and browser tests **before changing old lesson storage** | **Architecture spike is next work item; app untouched** |

## Explicit vocabulary policy

- **Planned** words: numbered budget slots in `vocabulary-budgets-130.json`; **not actual introductions**.
- **Introduced** words: checked independent lexeme IDs in a published, approved Latin sentence and reusable contextual teaching material, as documented in the generated ledger.
- **Recycled/encountered:** later appearances of an already introduced word, in story/Latin gloss/lesson drill; repeated English translations do not add encounters.
- **Recognised:** separate checks of learner performance on unfamiliar but graded readings; must not be inferred from completion.
- **Productive:** observed written/oral use; optionally recorded and human assessed.
- **Authentic excerpt-only:** unknown words in source-cleared extracts for Chapters 129–130 are glossed but **not counted as new introduced course lexemes**, unless a reviewed teaching unit explicitly introduces and revisits them.
- **Common nouns:** Roman cultural nouns such as `forum`, `thermae`, `toga`, and `impluvium` may count when taught as ordinary lexical words. Proper names do not.

The Foundation budget in the revised plan is **500**, not the 570-word mathematical maximum, and Chapter I's DCC candidate subset was reduced to **six** to match its first introduction allocation. The old 50-chapter DCC seed audit is retained as historical source evidence; its topic-specific seed lists are not assumed to match v2's moved grammar targets.

## Draft performance checkpoints — human reviewed, not claims of proficiency

| Checkpoint | Interpretive test | Speaking or writing test | Proposed provisional criterion |
|---|---|---|---|
| Ch. 25 | Unseen 120–180-word highly graded scene + ten Latin factual questions | Ten spoken picture questions and short answers | 8/10 comprehension and 8/10 intelligible responses; human review for speech |
| Ch. 50 | Unseen 250–400-word graded narrative + twelve questions | 60-second scene narration plus six-turn familiar shop or household exchange | ~80% interpretive; intelligibility and basic form accuracy marked by a competent speaker |
| Ch. 90 | Unseen ~600-word graded passage and ten Latin questions | 3-minute guided conversation on known topics | 8/10 comprehension, teacher-rated topic maintenance and ability to ask follow-up questions |
| Ch. 130 | New one-page advanced graded text with a few carefully glossed items | Oral synopsis and open follow-up Q&A | Coherent account of main events and reasons, checked by a Latinist; no unsupported CEFR label |

These thresholds are *initial proposals* and need teacher calibration with learners. Pronunciation model audio must be human-checked; browser speech is an unverified fallback.

## Next patch sequence — not done here

**Cycle 2: Lexical registry design (A1/A2).** Create independently vetted `lexeme_registry.json` metadata and a deterministic offline script that derives introduction counts and occurrences from tokenized `lessons/chNN.json`. Prove it on the old eight chapters without changing UI or backup state. The user must approve licensing for third-party dictionaries; no book/audio assets or proprietary data committed.

**Cycle 3: Offline architecture spike (R1/R2).** Stable slug IDs and question IDs; compile lessons to a `lessons.bundle.js` or build into standalone `index.html`; write safe v0.4→v0.5 migration; test actual Windows `file://` use and backup preservation **before migrating learner progress**.

**Cycle 4: Original lesson pilot (Ch. VI–VIII).** Write 250–450-word Latin reading segments with clear visual cues, 8–10 real encounters for each priority new word, Latin margin hints, exercises, original chapter art, verified human audio and Latinist sign-off. Time every stage and update scope based on evidence.

**Cycle 5 onward:** Real assessments; character-sheet and chapter art approvals; sequential reviewed chapter batches. Keep previously working app available until replacement build is demonstrably compatible.

## Tests

- `node curriculum/validate-outline-v2.cjs` — structural corrections, correct titles, grammar prerequisites, pacing and budget consistency.
- `node curriculum/validate-roadmap-130.cjs` — original 130-chapter schema and 500/1,532/3,036 totals.
- `npm test` — existing program checks without changing JavaScript.
- `node curriculum/validate-roadmap-130.cjs --require-introduced-1500` — **must currently fail** with `GATE NOT MET`, as no reviewed new-course text has been produced.

The above checks **do not prove Latin prose accuracy**. Real audio, learner assessments, original new art and migration are still not tested.

## Version and GitHub policy

`index.html` is untouched; no main merge, release, asset upload or workbook migration. The review branch contains the complete program, historic baseline, Claude's source documents, updated curriculum JSON, a synchronised 130-row outline, review instructions and tests. Preserve this full snapshot in every subsequent Claude handover.
