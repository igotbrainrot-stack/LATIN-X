# Tablinum — Legacy lexeme audit and stable-ID handover (Cycle 2, first slice)

**Date:** 5 November 2026  
**Repository:** `cosmiccopper29-svg/Latin-X`  
**Branch:** `feature/legacy-lexeme-audit-20261105`  
**Source:** the latest user-provided [Tablinum v3 review](../reviews/TABLINUM_REVIEW_V3_FOLLOWUP_20261105.md).  
**Scope:** actual offline lexical candidate extraction and frozen legacy identifier mapping, **NOT** rewriting Latin, renumbering chapters or migrating learner state.

## What was built in this branch

1. [`scripts/build-legacy-lexeme-audit.cjs`](../../scripts/build-legacy-lexeme-audit.cjs) — an **offline dependency-free Node 22 generator**. It extracts only the original `L` chapter array and `shared` glossary literals from the existing single-file application (in a bounded VM). It does not execute the browser program. It creates two deterministic JSON snapshots:
   - [`legacy-token-audit.json`](legacy-token-audit.json), token-by-token sentence identifiers, word positions, exact Latin surfaces, source glossary candidates, unresolved/ambiguous/proper-name flags and all source-row IDs;
   - [`legacy-id-map.json`](legacy-id-map.json), stable identifiers and original numeric saved-progress keys for every original chapter, sentence and question.
2. [`tests/legacy-lexeme-audit.test.cjs`](../../tests/legacy-lexeme-audit.test.cjs) — tests 8 chapters, 67 sentences, 24 questions, every legacy question/word ID, old index keys, non-duplication and **zero** verified lexical introductions.
3. [`.github/workflows/legacy-lexeme-audit.yml`](../../.github/workflows/legacy-lexeme-audit.yml) — real Node 22 CI that reruns `npm test`, verifies both generated JSON outputs byte-for-byte with `--check`, confirms the 130-chapter plan and its false-claim rejection gate, then publishes CI status.
4. Original [`index.html`](../../index.html) is **unchanged** from the already tested v0.4.2 Manuscript Edition and remains the runnable Windows/offline application.

## Actual provisional lexical analysis

| Metric | Result |
|---|---:|
| Original embedded chapters | 8 |
| Original Latin sentences | 67 |
| Original multiple-choice / free-response questions | 24 |
| Word-token occurrences in lesson sentences | **255** |
| Proper-name occurrences excluded from vocabulary | 48 |
| Direct single-glossary candidate matches | 198 |
| Ambiguous matches needing human checking | **9** |
| Unmatched by the app's OWN global glossary | 0 |
| Provisional non-proper glossary-head candidates | **124** |
| Human-reviewed, evidence-certified new-course lexemes | **0** |

**Critical distinction:** the 124 candidate heads are **not** 124 valid lemmas. For example, the old glossary may treat an inflected form as a headword, and macron-insensitive matching can merge genuinely distinct lexical senses. The script does **not** inspect morphology, validate word meanings or prove that any learner knows a word. The fact that all 255 tokens have *some* glossary source does **not** prove 100% correct dictionary coverage. Inspect the 9 ambiguous tokens, including collisions between *habēre* / *habet*, two *ad* definitions and nominative *omnēs* / adjective *omnis*.

All token records leave `lexeme_id:null` and `reviewer_approved:false`. Therefore `curriculum/vocabulary-introductions-130.json` is deliberately untouched and still empty; the 1,500 and 3,000 completion claims **must continue to fail** until original teaching text is authored, token-checked, contextualised and signed off.

## Stable chapter IDs and learner progress

The original app stores selected chapter as **numeric index 0–7** in localStorage under `tablinum-source-review-v02`, with chapter-specific keys such as `0` for notes, reading confidence and cloze work, `0:0` for the first question and first sentence hint, and similar keys for later chapters.

The snapshot attaches a distinct stable namespace:

- `legacy-ch01`–`legacy-ch08`, one per **existing original** chapter;
- `legacy-ch01-s001`, for its first sentence, and `legacy-ch01-s001-t001` for its first Latin token;
- `legacy-ch01-q001`, for its first graded question;
- `legacy-imported-custom`, an independent placeholder for user-imported text that must not be conflated with a standard course chapter.

**Do not** treat `legacy-ch01` as the same as the newly proposed `b01-c001`. The planned curriculum reorganises chapters and some story/grammar order; mapping their saved progress by bare ordinal would attach answers to the wrong questions. New course IDs remain `null` in the sidecar until **explicit text/question mapping** is approved and migration tests pass. Hash fingerprints of the original Latin chapter sentences help detect accidental changes before migration.

This slice does **not** alter the user's existing `localStorage`, JSON backup format or audio files.

## How to check

```bash
npm test
node scripts/build-legacy-lexeme-audit.cjs --check
node tests/legacy-lexeme-audit.test.cjs
node curriculum/validate-roadmap-130.cjs
node curriculum/validate-outline-v3.cjs
```

To regenerate snapshots deliberately after a **reviewed source change**:

```bash
node scripts/build-legacy-lexeme-audit.cjs
```

Review the changed token and ID fingerprints. Do not automatically replace user backup mappings or mark any candidates approved.

The strict `--require-introduced-1500` and `--require-introduced-3000` gates remain intentionally **red**.

## What Claude should review next

Please review the actual scripts and JSON, not just the roadmap:

- Is the `lexeme_id` field correctly left unverified for every token? Flag gloss collisions, spelling/inflection-as-lemma issues, proper-name exclusions and possible omitted homographs.
- Are the source glossary provenance links and `legacy-chXX` IDs stable enough? What additional fields must be provided in a reviewed lexical registry (principal parts, part of speech, disambiguated meanings, macron authority and licence)?
- Test the token audit against all 67 sentences, including `Mārcus`, `Līvia`, `edō/ēdō` and ambiguous surface forms. Do not claim the script has human Latinist approval.
- Check the mapping from numeric storage keys to stable chapter/question IDs and propose tests for a future non-destructive v0.4.2→v0.5 backup migration.
- Next implementation phase should be a **separate** `file://`-safe compiled-lesson architecture spike. No runtime bundling/migration or audio database changes belong in this lexical-audit branch.

**Requested handback:** `CLAUDE_LEXEME_AUDIT_REVIEW.md` with severity-ranked bugs, proposed minimal fixes, test results and a plan for the first *human-verified* disambiguated lexeme annotations.

## Limitations

No LatinCy, Whitaker, DCC morphology engine, external dictionary, OCR, original MP3, FSRS or copyright-protected reader has been bundled. These source archives still require separate provenance and licensing review. No native browser, audio, recording or learner-proficiency testing is claimed by this document. The complete original program remains in this repository and branch ZIP.
