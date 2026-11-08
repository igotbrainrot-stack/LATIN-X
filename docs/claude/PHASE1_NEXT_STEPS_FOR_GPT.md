# Phase 1: next steps for GPT (owner decision, 5 November 2026)

**The owner chose "Claude drafts, you sign".** Claude has filled in draft proposals for all 128 rows (`legacy-candidates-claude-draft.csv`). The owner checks each row and signs it. No Latinist is involved for now. Do two passes, as with every phase.

## 1. Add an owner-signed review tier (do not weaken the honest labels)

- Add a field `review_tier` to each approved lexeme. Allowed values:
  - `latinist` (signed by a qualified Latin reviewer);
  - `owner` (signed by the owner after Claude drafted it).
- **Change the `--require-review-ready` rule.** The "20 independent second reviews" requirement applies only to `latinist`-tier entries.
  - For `owner`-tier entries, require a `drafted_by` value (for example `claude-draft-2026-11-05`) that differs from `reviewed_by`. That records that one party drafted and another checked.
  - Do not remove the second-review rule for the `latinist` tier.
- The app (Phase 3 onwards) and every report must show owner-tier words as **"not checked by a Latinist"**.
- The new-course ledger and the 1,500 / 3,000 gates report the two tiers as separate counts, and never present owner-tier words as Latinist-verified.
- An owner-tier entry can be upgraded to `latinist` later by adding the Latinist's signature. The lexeme ID must not change.

## 2. Fixes found in Claude's Phase 1 review

1. **Merging candidates into one lexeme.** `reviewImport` compares the whole entry, so merging fails when `notes`, `reviewed_at` or `second_reviewed_by` differ between rows. Compare only the lexical fields: `head`, `pos`, `principal_parts`, `conjugation`, `declension`, `gender`, `senses`, `homograph_of`. Combine the notes and keep every reviewer record.
2. **Multiple senses.** A lexeme can only get one sense from a row, so rows with different `sense_id` values for the same `proposed_id` should **add a sense**, not conflict. Claude's draft gives `omnis` and `omnēs` the same sense, so this is not blocking for the legacy words, but it will be for the new course.
3. **DCC frequency hints.** Only 50 of 128 rows got hints, because the app's verb heads are infinitives (`habēre`) while DCC uses first-person heads (`habeō`). Match against `proposed_lemma` as well as `legacy_head`, and re-export the hints.
4. **Exercise and context tokens.** `legacy-extra-streams.json` lists the tokens but never links them to candidates. Link each token to its candidate IDs, as the sentence audit does. Report the unglossed ones: **Quandō, facit, faciet** are currently the only exercise and cloze words with no glossary entry. Do not change the app's glossary in this phase. Just record them as review items.
5. **Licence register.** Add the Bewick's Aesop EPUB as roadmap §9.5 requires: edition, date, file name, "owner-supplied", "kept out of git".
6. **The CSV draft.** Accept the draft CSV file as input to `--check-sheet` and `--dry-run`. It has the same columns as the generated sheet, in the same order, with CRLF line endings. The import must keep refusing rows without `decision`, `reviewer`, `reviewed_at`, source, licence, macron authority and `macron_reviewed=yes`.

## 3. After the owner signs

1. Copy the signed CSV over `curriculum/lexicon/review-sheets/legacy-candidates.csv` on a new branch.
2. Run `node scripts/registry-review-sheet.cjs --dry-run`, then `--import`.
3. Run every Phase 0 and Phase 1 test and `--require-review-ready`. All should pass for the owner tier.
4. Confirm `vocabulary-introductions-130.json` is still empty, and the strict course gates are still red.
5. Hand back the full ZIP with "Pass 1" and "Pass 2" sections. Then start Phase 2 (lesson format and compiler).
