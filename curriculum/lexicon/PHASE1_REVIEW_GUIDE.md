# Phase 1 — How to review the Latin glossary correctly

**Status:** Engineering workflow implemented; **linguistic approvals pending**. The existing program still has eight short chapters. The new-course 1,500/3,000 lexeme ledger remains empty.

## Owner-signed option (selected 5 November 2026)

The owner selected **“Claude drafts, owner signs.”** This is not the same as Latinist verification. Approved entries use one of two explicit tiers:

- `review_tier=owner`: a named `drafted_by` (for example `claude-draft-2026-11-05`), followed by the owner's `reviewer` and `reviewed_at` signature. `drafted_by` **must differ from** the owner signer. Reports and the future app must label the entry **“not checked by a Latinist”**.
- `review_tier=latinist`: a qualified Latinist's signature; the independent second-review requirement applies to Latinist-tier entries only, with up to 20 independently checked approvals required for readiness. Tier upgrades keep the same immutable `lx-...` ID and preserve earlier owner reviews.

**The Claude draft CSV was described in the uploaded instructions but was not included with that upload.** The tool accepts the prior 30-column format for `--check-sheet` and `--dry-run`; actual signed imports require the current 32-column format, including `review_tier` and `drafted_by`. **No approval is automatically generated or attributed to the owner.**

To evaluate the draft without modifying the project:

```bash
node scripts/registry-review-sheet.cjs --check-sheet path/to/legacy-candidates-claude-draft.csv
node scripts/registry-review-sheet.cjs --dry-run path/to/legacy-candidates-claude-draft.csv
```

To re-export hints using the draft's corrected **proposed lemma** as well as the original glossary head (without signing or importing the draft), run:

```bash
node scripts/registry-review-sheet.cjs --export my-enriched-review.csv --from-draft path/to/legacy-candidates-claude-draft.csv --dcc path/to/latin-core-list.csv
```

The output has 32 current columns, keeps the draft's proposal fields, and refreshes optional DCC headword/rank hints. It does **not** overwrite the source draft. No DCC match amounts to linguistic validation. The supplied next-steps document mentions a Claude draft, but **only the next-steps Markdown was attached to this turn**, so its full proposed lemma entries were not available for automatic re-export here.

Before import, copy the approved proposal details into the **current 32-column review sheet**, fill the owner-tier fields and actual owner signature on every approved row, and explicitly `reject` invalid candidates with a reason and signer. **Every row must receive an `approve` or `reject` decision** for a final `--import`. The `--dry-run` command can preview unsigned drafts but never counts them as approval. Run the signed `--dry-run` again before import.

`curriculum/lexicon/legacy-extra-streams.json` includes source candidate links and flags **five occurrences of three unglossed forms**: `Quandō`, `facit` (three occurrences) and `faciet`. These are review items, not automatic additions to the app's glossary.

All **future** newly authored course introductions must carry `review_tier` and be counted separately in the ledger and 1,500/3,000 reporting. Owner-tier introductions count toward the total *approved* course target but must never be presented as Latinist-verified. The new-course ledger remains empty until original, token-reviewed lessons exist.

## Current source inventory

- **128 glossary candidate rows**: 124 non-proper candidates and 4 proper names from the legacy app.
- **255 Latin reading tokens**, of which 9 have multiple glossary matches in the pre-existing audit.
- **204 legacy lookup keys** used by the app's existing *first-match-wins* dictionary. Three normalized keys have competing entries.
- **177 additional context/exercise/cloze records**. These are *not evidence of first introduction*, and their Latin/English mix has not been audited.
- **0 signed owner- or Latinist-reviewed lexemes**, **0 mapped/approved lookup keys** and **0 certified new-course introductions**.

Start at [review-sheets/legacy-candidates.csv](review-sheets/legacy-candidates.csv). Ambiguous cases are first. **50 source-matched headword/rank hints** from the owner-provided Dickinson College Commentaries CSV are already included and attributed under CC BY-SA 3.0; the other 78 candidates have no exact DCC match. All decisions remain blank. The sheet is an editorial work queue, not a data licence or verified lexicon.

## Workflow (offline, Node 22, no npm dependencies)

1. `node scripts/validate-lexemes.cjs` — verify original-source maps and print the count of unreviewed entries.
2. `node scripts/registry-review-sheet.cjs --export my-review.csv` — export a fresh sheet without overwriting committed source. To supply **optional exact-headword hints** from the owner's DCC CSV, add `--dcc "path/to/latin-core-list.csv"`. Hints do not approve words.
3. Review **each candidate**, distinguishing the actual lemma/sense from inflectional forms. Record `proposed_lemma`, a stable ASCII `lx-...-sense` identifier, precise part of speech, principal parts / declension / gender, checked macrons, sense, evidence source/license, reviewer/date, and a decision `approve`, `reject` or `needs_review`.
4. Run `node scripts/registry-review-sheet.cjs --dry-run my-review.csv`. It validates all 128 rows and simulates the new registry and legacy lookup map **without saving anything**.
5. After a backup or separate working branch, run `node scripts/registry-review-sheet.cjs --import my-review.csv` to commit reviewed entries *locally*. Review the resulting Git diff, then run `node scripts/build-phase1-registry.cjs --check` and `node scripts/validate-lexemes.cjs`.
6. For **Latinist-tier** approvals only, retain up to **20 independent second-review signatures**. Owner-tier uses a distinct named drafter and actual owner signer instead. For completion readiness, run `node scripts/validate-lexemes.cjs --require-review-ready`.
7. Commit only reviewed results and this full program, never the source audio/book assets. Real future-course ledger updates belong exclusively to Phase 2's validated lesson compiler.

### Common pitfalls

**Lexemes are not surface forms.** `habet` is a form of `habeō`; `habēre` is another form, not a different lemma. `is/eum/eius` are inflections of one pronoun, and `fīlia` and `fīlius` are distinct lexemes despite sharing a DCC CSV record.

**Homographs are not automatically the same word.** `edō` (“eat”) and `ēdō` (“publish / bring forth”) need separate sense IDs, recorded macrons and symmetric `homograph_of` links if both approved. `cum` as a preposition and conjunction may also need separate IDs. Matching is case-/macron-insensitive only for **finding candidates**, not for final sense identity.

**Several glossary entries may describe one lexeme.** For example, two candidate rows for `ad` may legitimately merge, but the first candidate's approval does **not** resolve the ambiguous legacy lookup key until all competing rows have been approved to the **same** reviewed ID. Review source contexts before merging.

**The published learner dictionary is not modified** by this work. The generated lookup map is a development sidecar, and the old `dict` code still uses its original first-match rule. No user progress is migrated.

### Reviewer decision fields

| CSV field | Required for `approve` | Meaning |
|---|---|---|
| `candidate_id` / `legacy_head` / `legacy_gloss` | Immutable | Identify source glossary row; never edit these fields |
| `proposed_lemma`, `proposed_id` | Yes | Real reviewed dictionary head and stable sense-disambiguated ID |
| `pos` | Yes | noun, verb, adj, adv, pron, prep, conj, interj, num, particle, proper_name |
| `principal_parts`, `conjugation` | Verb | Check all principal parts and conjugation |
| `principal_parts`, `declension`, `gender` | Noun | Verify genitive, stem, gender and declension |
| `sense_id` / `gloss_en` | Yes | Actual sense used in the lesson |
| `macron_authority`, `macron_reviewed=yes` | Yes | Human-checked quantity, named source |
| `source_id`, `source_locator`, `license_id` | Yes | Traceable provenance and rights |
| `reviewer`, `reviewed_at` | Yes | Signed reviewer and valid YYYY-MM-DD date |
| `second_reviewer` | For independent spot check | A second qualified reviewer |
| `homograph_of` | If applicable | Semicolon-separated IDs; must be symmetric in registry |
| `decision` | Yes | approve/reject/needs_review; blank means pending |

### Validation commands

```bash
npm test
npm run test:lexemes
node scripts/validate-lexemes.cjs --require-review-ready
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

The last **three** commands must currently fail with appropriate unmet-gate errors; do not weaken them. The normal tests should pass without any source data being promoted to reviewed.
