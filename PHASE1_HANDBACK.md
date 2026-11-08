# LATIN X — Phase 1 technical handback (two-pass engineering implementation)

**Prepared 5 November 2026**  
**Current branch:** `feature/lexeme-registry-phase1-20261105`  
**Parent:** `test/phase0-safety-net` — no merge into `main`.  
**Runnable app:** `index.html` remains **byte-for-byte unchanged**. The Phase 0 offline launcher, learner backup and old lessons remain intact.

## Status — be precise

**Engineering implementation completed:** deterministic candidate registry source mapping, 128-row review sheet with signed-import rules, DCC source headword hints, 204-key legacy dictionary index, context/exercise/cloze audit, strict schema, offline review CLI, tests and provenance documentation.

**Linguistic approval NOT completed:** **zero** of the 128 candidate glossary rows has a qualified reviewer approval in the actual project; the `lexemes.json` registry deliberately begins with an empty `lexemes` array. This is **not yet a reviewed dictionary** and does **not** meet the Phase 1 manual acceptance gate.

The app still contains 8 legacy chapters and does not yet load a new lexicon. New 130-chapter content and the strict 1,500/3,000 milestones remain unimplemented. No raw DCC list, PDF, audio or morphological model has been bundled.

## Pass 1: what was built

| New artifact | Purpose |
|---|---|
| `scripts/lib/schema.cjs` | Fail-closed lexical ID, POS/morphology, macron, reviewer, citation, homograph symmetry, candidate and dictionary-key validation |
| `scripts/lib/phase1-legacy.cjs` | Deterministically build a glossary candidate map, first-match-aware dictionary key map and non-intro stream audit |
| `scripts/build-phase1-registry.cjs` | `--init` only if absent; `--check` source-index byte identity; `--refresh` derived indexes without rewriting reviewer decisions |
| `curriculum/lexicon/lexemes.json` | Empty approved lexeme register — no fabricated Latinist signature |
| `curriculum/lexicon/legacy-candidate-map.json` | All **128** unapproved original glossary rows, with immutable candidate IDs and blank reviewed lexeme links |
| `curriculum/lexicon/legacy-vocab-map.json` | All **204** normalized keys the v0.4.2 `dict` actually uses, preserving first-match provenance and exposing 3 colliding keys |
| `curriculum/lexicon/legacy-extra-streams.json` | **177** context, exercise and cloze records with source token IDs; every record is explicitly `counted_as_new_introduction:false` |
| `scripts/lib/review-csv.cjs` | Deterministic RFC 4180 review CSV import/export; Excel formula injection guard |
| `scripts/lib/review-workflow.cjs` | Signed decisions, morphology/source/macron enforcement, stable sense-aware IDs, multiple candidates per lexeme and fail-closed ambiguity resolution |
| `scripts/registry-review-sheet.cjs` | `--export`, `--check-sheet`, `--dry-run`, `--import`, optional local DCC rank hints; no network |
| `curriculum/lexicon/review-sheets/legacy-candidates.csv` | Editable 128-row review queue with 9 ambiguous sentence-token references; **50 exact-headword DCC rank hints**, no approvals |
| `scripts/validate-lexemes.cjs` | Source index verification, exact total counts and strict `--require-review-ready` failure until approvals and independent checks exist |
| `tests/lexemes.test.cjs` | Valid synthetic approval, missing signature, wrong macron, invalid identity, ambiguous key, duplicate, unsafe CSV and second-reviewer tests |
| `docs/LICENCE_REGISTER.md` and `ATTRIBUTION.md` | DCC CC BY-SA 3.0 metadata attribution, missing licence checks and original-source boundaries |

## Pass 2: independent engineering audit and corrections

- **Fix 1:** The first review CSV implementation contained a missing nested-loop brace; corrected before the committed review sheet was generated.
- **Fix 2:** Re-export of already approved decisions must preserve full POS, forms, sources and reviewer data, so it can round-trip; now supported.
- **Fix 3:** Strict readiness now requires at least **20 separately second-reviewed** approved entries, and the second reviewer must not be the primary signer.
- **Fix 4:** The 50 DCC-derived headword/rank hints in the committed CSV were explicitly documented under **CC BY-SA 3.0**; the raw 997-row user CSV was **not** committed.
- **Fix 5:** Added `curriculum/lexicon/AMBIGUITIES_TO_REVIEW.md` showing all 9 colliding sentence-token contexts, not only isolated glossary words.
- **Integrity:** No approved lexeme can be inferred from a DCC match, a folded headword, a vocabulary deck card, a model's morphological guess, a proper name, or an English gloss. Existing source and progress keys are never written by these tools.

## Measured source and indexing results

| Metric | Value |
|---|---:|
| Original lessons | 8 |
| Original Latin reading sentences | 67 |
| Original reading word tokens | 255 |
| Original glossary candidate rows | **128** (124 non-proper; 4 names) |
| Original ambiguous token occurrences | **9** (involving six candidate rows) |
| Legacy normalized dictionary keys | **204** |
| Competing dictionary keys | **3** (`ad`, `habet`, `omnēs`) |
| Additional context / exercise / cloze records | **177**; never first-introduction evidence |
| DCC exact-headword / rank hints in review CSV | **50** (out of 128 candidates; **not approvals**) |
| Human-approved lexemes | **0** |
| Certified new-course introductions | **0** |

These are *deterministic source measurements and editorial queue counts*, not a claim that the Latin is free of morphological errors.

## Commands to reproduce

```bash
npm test
npm run test:lexemes
node scripts/validate-lexemes.cjs
node scripts/build-phase1-registry.cjs --check
node scripts/registry-review-sheet.cjs --check-sheet
node scripts/registry-review-sheet.cjs --dry-run
```

The **human acceptance** check should presently fail:

```bash
node scripts/validate-lexemes.cjs --require-review-ready
```

The **new-course vocabulary** checks must also continue to fail, for the right reason:

```bash
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

Human-review working procedure and all fields: [PHASE1_REVIEW_GUIDE.md](curriculum/lexicon/PHASE1_REVIEW_GUIDE.md). For source details and ambiguous tokens, read [AMBIGUITIES_TO_REVIEW.md](curriculum/lexicon/AMBIGUITIES_TO_REVIEW.md).

## What Claude or a Latinist must do before calling Phase 1 finished

1. Independently review all 128 candidate rows, merging inflected forms of a lemma when correct, separating genuine homographs, and verifying Latin morphology, principal parts, accents, meanings and POS.
2. Complete the review CSV **without copying any model's guess as human certification**. Sign approvals with reviewer/date, named quantity authority, source provenance and the appropriate rights.
3. Resolve all 9 ambiguous token occurrences and all 3 competing legacy dictionary keys; every legacy token must lead to exactly one approved source lexeme (or an excluded proper-name annotation).
4. Perform a reproducible independent check of at least **20 approved lexemes** with a second signer.
5. Run the import dry-run; import on its own branch; inspect Git changes and run every Phase 0 / Phase 1 regression. Approvals and their source citations must be editable and auditable.
6. **Do not copy the approved registry into the actual course introduction ledger.** In the next phase, only authored token-tagged and reviewed Latin lessons can prove new-course vocabulary introductions.

## Next coding phase after signed Latin review

**Phase 2** of the archived [CLAUDE_IMPLEMENTATION_ROADMAP.md](CLAUDE_IMPLEMENTATION_ROADMAP.md): create a versioned, token-tagged lesson content schema and compiler, with exact old-lesson round-trip and stable IDs. Keep `file://` safe by compiling content for classic scripts or inline HTML, and migrate progress only in Phase 3 with backup tests.

## Handback and branch rules

Provide the **entire current ZIP**, including runnable `index.html`, both Phase 0 and Phase 1 tests, all curriculum documents and review sheets. Start any further work on one new branch on top of `feature/lexeme-registry-phase1-20261105`. No merge, release, copyrighted textbook media, private backups, or unreviewed glossary-to-lexeme promotion.
