**LATEST CLAUDE REVIEW BASELINE:** [PHASE8_MUSIC_CHARACTER_CLAUDE_HANDOVER.md](../PHASE8_MUSIC_CHARACTER_CLAUDE_HANDOVER.md). Review original character-sheet preview from the ChatGPT attachment and owner art brief; complete program source ZIP contains prompts, tools and all tests, but no unsigned painted scene WebPs. Do not sign anything or merge main.

**CURRENT HANDOVER AFTER CLAUDE PHASE 6 REVIEW:** Read [PHASE7B_CLAUDE_HANDOVER.md](../PHASE7B_CLAUDE_HANDOVER.md), [verbatim Claude Phase 6 review](../docs/claude/PHASE6_REVIEW_FOR_GPT.md), and [owner art/audio requirements](../docs/owner/AUDIO_AND_ART_REQUIREMENTS.md). Return full runnable source ZIP, never just documentation.

**CURRENT CLAUDE REVIEW BASELINE:** [PHASE7A_CLAUDE_HANDOVER.md](../PHASE7A_CLAUDE_HANDOVER.md) and [binding audio/art brief](../docs/owner/AUDIO_AND_ART_REQUIREMENTS.md). Full runnable source ZIP, not this note alone. Music/SFX code is Phase7a only; Phases 7b and 8 are not finished.

**LATEST REVIEW BASELINE: Phase 6.** Open [PHASE6_CLAUDE_HANDOVER.md](../PHASE6_CLAUDE_HANDOVER.md), [Claude's Phase 5 approval](../docs/claude/PHASE5_REVIEW_FOR_GPT.md) and [Owner music/art requirements](../docs/owner/AUDIO_AND_ART_REQUIREMENTS.md). Return the entire runnable program ZIP, not this document alone.

**Phase 4 source of truth:** [Current Claude handover](../PHASE4_PILOT_CLAUDE_HANDOVER.md) and [verbatim Latin manuscript](../docs/pilot/CLAUDE_PILOT_B01_C001_C008.md). Full source ZIP required. Earlier notes below refer to previous phases.

> **CURRENT — PHASE 3c (6 Nov 2026):** Start with [PHASE3C_CLAUDE_HANDOVER.md](../PHASE3C_CLAUDE_HANDOVER.md). All earlier Phase 2/3a/3b handovers below are historical context. Phase 3c includes a separate v5 progress state, untouched original v4 snapshot, and older-backup migration. Review the COMPLETE runnable source ZIP, not just the Markdown.

**CURRENT PHASE 3b:** Read [PHASE3B_CLAUDE_HANDOVER.md](../PHASE3B_CLAUDE_HANDOVER.md) first. New compiled local chapter loader and corrected Phase 3a HTTP test are now included. Older warnings below apply to earlier branches. Review the COMPLETE ZIP with source, tests, course and handovers.

> **LATEST (6 NOV 2026):** Phase 3a is present on this branch. **First read [PHASE3A_CLAUDE_HANDOVER.md](../PHASE3A_CLAUDE_HANDOVER.md)** for the exact source relocation, test evidence and Phase 3b next steps. Older warnings about the Phase 2 compiler being missing are historical and superseded by [PHASE2_RECONCILED_HANDBACK.md](../PHASE2_RECONCILED_HANDBACK.md). Full source ZIP and reviewer prompt remain the handover standard.

> **NEWER STATUS (6 NOV 2026):** The older caution below saying the Phase 2 compiler is missing is superseded on this **reconciled branch**. The compiler and review-tools branches are now combined and tested. Begin with [PHASE2_RECONCILED_HANDBACK.md](../PHASE2_RECONCILED_HANDBACK.md), then follow the rest of this review package. Owner approvals, linguistic certification and Phase 3 migration remain pending.

# LATIN X / Tablinum — CLAUDE FULL REVIEW PACKAGE

**Package prepared:** 6 November 2026 (Australia/Sydney).
**Project:** LATIN X, internally called *Tablinum*.
**Complete runnable source:** This entire GitHub branch ZIP, not just this `CLAUDE_REVIEW_PACKAGE` folder.
**Repository:** https://github.com/cosmiccopper29-svg/Latin-X
**Branch:** `fix/phase2-review-restoration-20261105`
**Draft review PR:** https://github.com/cosmiccopper29-svg/Latin-X/pull/2
**Correct parent:** `fix/phase1-owner-tier-next-steps-20261105`.
**Do not merge into main. Do not rebuild from main.**

## 1. Message from the owner to Claude

Review the **entire attached program**, its tests and the source documents, not only this handover. Recheck the Latin, vocabulary model, grammar and inflections, teaching sequence, runtime stability, accessibility, offline Windows launch, future migration safety and the 130-chapter curriculum. Report actual reproducible defects with file:line evidence, severity, minimal fix and missing acceptance tests. Work in **two passes**: (A) architecture/linguistic/code audit, (B) implement and test agreed critical corrections in a new branch on top of the current branch. **Do not claim anything passed unless it actually ran.** Do not sign lexical approvals or approve Latin lessons in the owner's name. Deliver a new **complete runnable ZIP with source and full updated handover**, not a document alone.

## 2. Exact current app

The offline runnable application is `index.html`. On Windows, double-click `Start Tablinum.cmd`, or open `index.html` directly. It contains eight original playable chapters, grammar/word hints, exercises, vocabulary review, imported-text reader and progress/backup facilities. The original application and storage schema have not been migrated or rewritten by this recovery branch.

The separate **editorial** review interface is `Vocabulary Review.html` (Windows launcher: `Start Vocabulary Review.cmd`). It lets the owner load, search, edit and export the 128-row Claude **draft** vocabulary CSV. Use `Validate Vocabulary CSV.cmd` to validate a sheet. These are offline tools, not the learner app.

The 130-chapter course is a **detailed curriculum plan**, not 130 playable lessons. Strict milestones: at least 1,500 independently introduced approved Latin lexemes by Chapter 90; ~3,000 targeted by Chapter 130. Owner/Latinist approval tiers must remain distinct. Current *approved* introductions: zero.

## 3. Source of truth and essential reading order

1. `PHASE2_REVIEW_RESTORATION_HANDBACK.md` — precisely what was implemented on this branch, what's missing, and why.
2. `CLAUDE_REVIEW_PACKAGE/01_REVIEW_PROMPT.md` — adversarial two-pass review and output contract.
3. `CLAUDE_REVIEW_PACKAGE/02_IMPLEMENTATION_MATRIX.md` — existing vs pending status.
4. `CLAUDE_REVIEW_PACKAGE/03_TESTING_AND_DELIVERY.md` — tests, evidence and packaging.
5. `CLAUDE_IMPLEMENTATION_ROADMAP.md` — detailed authoritative engineering roadmap (focus §§4, 7.4–7.9, Phase 2–4).
6. `curriculum/CURRICULUM_130_MASTER_PLAN.md`, `curriculum/vocabulary-budgets-130.json`, `curriculum/CLAUDE_REVIEW_RESPONSE_V3.md` — 130-chapter syllabus including v3 pronoun corrections.
7. `curriculum/lexicon/PHASE1_REVIEW_GUIDE.md`, `curriculum/lexicon/AMBIGUITIES_TO_REVIEW.md`, `curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv` — source-traceable 128-word owner review queue.
8. `docs/WINDOWS_OFFLINE_CHECK.md`, `docs/LICENCE_REGISTER.md`, `ATTRIBUTION.md`.
9. All `scripts/`, `tests/`, `.github/workflows/`, `index.html` and the entire `archive/` original.

## 4. Critical provenance warning — two unmerged lines of work

There is a separate, newer-in-design **Phase 2 lesson compiler** generated as
`LATIN_X_PHASE2_FULL_BUILD_20261105.zip`, originally saved in the owner's ChatGPT Library, with
`LATIN_X_PHASE2_HANDOVER_20261105.md`. That archive contains the 8 legacy-to-lesson JSON exports,
`scripts/compile-content.cjs`, generated catalogues, deterministic derived word ledger,
chapter-one blank scaffold, chapter-length/recurrence checks and compiler tests. **It is NOT in this GitHub branch.**
This environment could not extract that binary archive to merge its sources. The branch ZIP here is
a complete runnable GitHub recovery build, **not** the full combined compiler+recovery build.
The original `LATIN_X_COMPLETE_20261105.zip` is also separately uploaded; four old provisional
comparison artifacts have not been restored byte-for-byte.

Claude: if you are given the two additional archives, inspect them, diff their files against this
branch, and integrate without overwriting the current review tools, tests or original runtime.
Do not falsely report those older ZIPs as already included. If only this package is present,
list the compiler reconciliation as a required dependency rather than fabricating its contents.

## 5. Non-negotiable constraints

- Preserve original `index.html` behavior, 8 legacy chapters and old backup/storage compatibility;
  do not start a Phase 3 v4→v5 migration on this review branch.
- Never commit Ørberg/Familia Romana copyrighted text, PDFs, MP3 files, commercial recordings, dictionary scans,
  the user's private backups, unrelated third-party archives or unverified licences.
- Never mark drafted words `approved` without a real owner signature/date/quantity check and provenance.
  Never conflate owner-tier approval and Latinist verification.
- A planned word budget is not a learned or introduced word. Keep both 1,500/3,000 strict gates red until
  **actual approved, tagged, compiled chapter introductions** establish them.
- Preserve stable IDs and course/legacy source traceability; do not silently remap existing player progress.
- The app must launch offline from `file://` on Windows, with real browser tests, not just Node mocks.
- All manuscripts, lesson texts and answer keys require explicit qualified human review before release.

## 6. Your requested deliverables

Claude should return (i) findings ordered by severity, with reproduction and direct paths,
(ii) fixes on ONE new branch based on this branch, (iii) exact CI and manual results and gates still red,
(iv) complete current runnable application ZIP containing **all source code and updated test files**,
(v) complete handover, test report and user-visible installation instructions in that same ZIP.
An old source-only snapshot or handover-only Markdown is not acceptable.

**Next file:** `01_REVIEW_PROMPT.md`.
