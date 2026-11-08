# LATIN X — Phase 1 owner-tier review corrections, two-pass handback

**Date:** 5 November 2026  
**Branch:** `fix/phase1-owner-tier-next-steps-20261105`  
**Parent:** `feature/lexeme-registry-phase1-20261105`  
**Owner instruction:** “Claude drafts, you sign.” **No Latinist involved for now.**  
**Source:** User-uploaded `PHASE1_NEXT_STEPS_FOR_GPT.md`, received 5 November 2026.

## State of work

**Engineering work is implemented and automated tests pass.** Phase 1 linguistic review is **not completed**. There are 128 legacy glossary candidate rows, zero actually signed owner approvals, zero Latinist-approved lexemes, and zero published new-course lexical introductions. We have not pretended to sign on behalf of the owner.

The user instructions refer to `legacy-candidates-claude-draft.csv`, but that CSV was **not among the files actually attached to this request and was not available in the current GitHub branch**. Therefore its proposed 128 lemmas could not honestly be imported or re-exported from the original draft. The scripts now accept it when supplied.

**The complete v0.4.2 runnable `index.html` is unchanged**, including the eight existing original Latin chapters and all original local progress/backup keys. Nothing was merged to `main`.

## Pass 1 — owner approval and requested fixes

1. **Owner-vs-Latinist tier:** `scripts/lib/schema.cjs` requires `review_tier:"owner"|"latinist"` for approved entries. `owner` also requires a separate `drafted_by` from the owner `reviewed_by`, a valid date, sources, licence identifiers and confirmed macrons. All signed reviewer records are preserved; owner-tier records are explicitly **NOT Latinist-checked**.
2. **Gate semantics:** `scripts/validate-lexemes.cjs` allows owner-tier readiness without 20 Latinist second signoffs, while retaining independent second reviews **for actual Latinist-tier entries**. The owner is still responsible for signing every accepted row. `curriculum/validate-roadmap-130.cjs` reports distinct owner and Latinist counts for Chapters 90/130 and the 1,500/3,000 thresholds; new separate `--require-latinist-1500/3000` options exclude owner-tier words. The actual ledger remains empty.
3. **Candidate merging:** `scripts/lib/review-workflow.cjs` compares only stable lexical identity fields when several source glossary candidates map to one lexeme. Different notes, dates and reviewers are retained separately; source citations and candidate IDs are accumulated, not overwritten.
4. **Multiple senses:** Different `sense_id` values merge into one immutable lexeme ID when the lexical identity matches. Contradictory definitions of the *same* sense still fail. Owner-to-Latinist upgrades preserve the ID and historical owner review records.
5. **DCC reference matching:** the reviewer export matches `proposed_lemma` **before** `legacy_head`. `--export output.csv --from-draft claude-draft.csv --dcc latin-core-list.csv` can re-export hints from the Claude draft's corrected headwords without importing any signed reviews or overwriting the source draft.
6. **Context/exercise/cloze audit:** all 177 extra stream records now include `source_candidate_ids` on each token. The audit finds **five unglossed occurrences of three forms**: `facit` ×3, `Quandō` ×1 and `faciet` ×1. These are review items; no change to the learner's legacy glossary was made.
7. **Licence register:** `docs/LICENCE_REGISTER.md` documents owner-supplied Bewick's *Select Fables of Æsop and Others* EPUB, its historical dates, unknown precise uploaded edition and “kept out of Git”. The EPUB was not committed.

## Pass 2 — tests and hardening

- Added `tests/owner-tier-review.test.cjs` with **synthetic** owner and Latinist approvals; they never write to production data.
- Verified two `ad` glossary rows can merge into one lexeme despite different reviewers/notes/dates, and two distinct senses can share a lexeme identity.
- Verified owner-to-Latinist tier upgrade keeps the original lexeme ID and original reviewer history.
- Verified signed rejection of a duplicate candidate does not keep a dictionary key falsely ambiguous. Readiness still requires all original reading tokens and legacy dictionary keys to have reviewed coverage.
- Rejected owner approvals without distinct draft attribution; preserved the independent Latinist check.
- Validated the original **30-column Claude draft CSV** with `--check-sheet` and `--dry-run`. An actual `--import` refuses unsigned rows or a missing tier/signature. The current editable CSV uses **32 columns**.
- Added a test for `--from-draft` + local DCC source where `habēre`'s proposed lemma `habeō` gets a DCC headword hint; **no DCC match creates an approval**.
- Reviewer records are validated even after a tier upgrade, including an owner's distinct drafter and independent second-reviewer identity.
- Existing Phase 0 source/content checks and progress compatibility remain under CI. No new-course lemmas were marked taught.

## How the owner can complete review now

1. Supply or locate the **actual `legacy-candidates-claude-draft.csv`**. The instructions document alone is not the 128-row draft.
2. Preview it safely:
   ```bash
   node scripts/registry-review-sheet.cjs --check-sheet path/to/legacy-candidates-claude-draft.csv
   node scripts/registry-review-sheet.cjs --dry-run path/to/legacy-candidates-claude-draft.csv
   ```
3. If the owner's 997-row DCC CSV is available locally, expand reference hints without changing any approvals:
   ```bash
   node scripts/registry-review-sheet.cjs --export signed-preparation.csv --from-draft path/to/legacy-candidates-claude-draft.csv --dcc path/to/latin-core-list.csv
   ```
4. Review every proposed Latin headword, principal part, meaning, pronunciation quantity and ambiguous context. Sign each accepted row in the 32-column sheet: `review_tier=owner`, `drafted_by=claude-draft-2026-11-05` (or accurate identifier), `decision=approve`, actual `reviewer`, `reviewed_at`, `macron_reviewed=yes`, source and licence fields. Sign rejected rows with `decision=reject`, real reviewer/date and reason. Do **not** copy invented personal signatures.
5. Dry-run then import a **fully signed** sheet on a new branch:
   ```bash
   node scripts/registry-review-sheet.cjs --dry-run signed-preparation.csv
   node scripts/registry-review-sheet.cjs --import signed-preparation.csv
   npm test
   npm run test:lexemes
   node scripts/validate-lexemes.cjs --require-review-ready
   ```
6. Confirm `curriculum/vocabulary-introductions-130.json` still has `introduced_lexemes:[]`, and both total-course gates stay unmet. The owner tier must be labelled **“not checked by a Latinist”** in any future app display or counts. Only then start the Phase 2 lesson compiler.

## Commands for unsigned engineering state

```bash
npm test
npm run test:lexemes
node scripts/validate-lexemes.cjs
node scripts/registry-review-sheet.cjs --check-sheet
node scripts/registry-review-sheet.cjs --dry-run
node scripts/validate-lexemes.cjs --require-review-ready    # intentionally FAILS
node curriculum/validate-roadmap-130.cjs --require-introduced-1500  # intentionally FAILS
node curriculum/validate-roadmap-130.cjs --require-introduced-3000  # intentionally FAILS
```

The parent branch's Phase 0 Windows/Chromium test results remain available; this branch changes **offline build tools, metadata and tests**, not the browser's application runtime. New Linux and Windows Phase 1 Node CI covers the changed tools.

## Limits

A named owner signer provides a recorded owner review, **not an independent Latinist's verification**. A Claude-produced proposal is not proof of Latin accuracy, source rights, or pedagogical proficiency. Future content compiler must count **owner-reviewed** and **Latinist-verified** words separately, never conflate the two, and must derive actual word introductions only from authored, tagged lessons.

**Deliverable:** this branch's full ZIP includes `index.html`, Windows launcher, all Phase 0/1 code, scripts, tests, editable CSV, docs and this handback. Nothing is merged or released.
