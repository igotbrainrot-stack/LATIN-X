# LATIN X — Phase 2 recovery and owner-review implementation handback

**Date:** 5 November 2026
**Repository:** https://github.com/cosmiccopper29-svg/Latin-X
**Branch:** `fix/phase2-review-restoration-20261105`
**Parent:** `fix/phase1-owner-tier-next-steps-20261105`
**Status:** Additive, tested Phase 1 review restoration plus Phase 2 validation tools. **Not merged into main.**

## How to run the complete existing application

Download the branch ZIP from GitHub, extract the folder, and double-click **Start Tablinum.cmd**. Or double-click **index.html**. The original eight chapters remain present and unchanged. This branch remains an offline working application; its authoring tools require Node 22, but its learner UI does not.

### Review Claude's 128 candidate words

Double-click **Start Vocabulary Review.cmd**. The review page is fully local and does not call online services. Browser `file://` security requires choosing the CSV explicitly with the file picker:

`curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv`

Review the lemma, distinction between homographs, sense, macrons, source, licence and principal parts. To approve, use real personal reviewer/date and the correct tier. The sheet already identifies **Claude as drafter and owner as intended tier**, but **all decisions, signatures and macron confirmations are blank**. Export the edited CSV after a session and keep that file safe.

Pass the exported file to **Validate Vocabulary CSV.cmd** (drag and drop or run without a parameter to check the unsigned original). The CLI validates without modifying the registry. Never import a blank proposal as approved.

In PowerShell with Node 22:

```powershell
npm test
npm run test:lexemes
npm run test:grammar
npm run test:paradigms
node scripts/registry-review-sheet.cjs --check-sheet curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv
node scripts/registry-review-sheet.cjs --dry-run curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv
```

## Actually implemented on this branch

1. **User-owned vocabulary review**: `Vocabulary Review.html`, its Windows launcher and validation launcher, with local upload, search, filtering, editable source-traceable rows, explicit signature checks, no default signing, CSV export and owner-review counters.
2. **Claude draft**: Exact 128-row, 32-column CSV uploaded in this conversation, stored as a source proposal at `curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv` and set as the CLI's default queue. The original 128-row `legacy-candidates.csv` remains in Git for comparison. Do **not** treat Claude suggestions as verified Latin.
3. **Fail-closed grammar validation**: `scripts/lib/grammar.cjs`, 172 explicit rules and status `editorial_provisional_not_owner_approved` in `curriculum/grammar-features.json`. Unknown and premature `lx` token morphology is rejected. Chapter 1 nominative plural and *est/sunt* are represented. Recognises selected Universal Dependencies morphology bundles **only when POS or reviewed lexeme type is supplied**, and never guesses from spelling. Every manual preview must cite the exact token, chapter, morphology and reviewer.
4. **Regular paradigm proposal generator**: `scripts/lib/paradigms.cjs` with 15 representative *unreviewed* pattern fixtures for noun declensions (including i-stems), adjective classes and conjugations 1, 2, 3, 3-iō and 4. It proposes common indicative active/passive forms, infinitives, a small gerund/gerundive set and supine. It does **not** certify every Latin form, cover all irregular verbs or all mood/voice/tense combinations. A generated form only passes the `checkForm` gate when an independently reviewed pattern record is provided; synthetic test signers never write to the registry.
5. **CI**: Linux and Windows Node 22 regression suite, original Windows `file://` Chromium test, and new actual Windows `file://` vocabulary-review import/export test. Configuration: `.github/workflows/phase2-review-restoration.yml`.

## Very important split between uploaded source and GitHub

The **5 November 2026 Phase 2 compiler ZIP** (`LATIN_X_PHASE2_FULL_BUILD_20261105.zip`) was generated in an earlier ChatGPT turn and saved in the user's ChatGPT Library, but **was never committed to GitHub**. Its ZIP binary could not be extracted in the current execution environment. Therefore the GitHub recovery branch is based on the latest available Phase 1 branch and **does not yet contain** the earlier `scripts/compile-content.cjs`, `scripts/legacy-to-lesson.cjs`, eight `lessons/legacy` exports or their compiler tests. Do not label this GitHub ZIP as the complete earlier Phase 2 compiler. When the standalone Phase 2 source can be extracted, integrate into a new branch on top of this work with a careful diff; do not overwrite either side blindly.

Likewise, `LATIN_X_COMPLETE_20261105.zip` was provided but could not be extracted in this execution environment. The offline UI and launchers here were **recreated from the reviewed workflow requirements**, rather than falsely claimed as byte-identical restorations. The exact historical `legacy-candidates-gpt-provisional.csv`, `provisional-lemma-map.tsv`, `scripts/build-provisional-draft.cjs`, and `tests/provisional-draft.test.cjs` are **not restored on this branch**. The original GitHub `legacy-candidates.csv` still provides a separate comparison baseline.

## Pending gates — intentionally not marked complete

- **0** human-signed owner/Latinist lexemes; **128** proposals still await genuine review.
- **0** verified new-course lexeme introductions; 1,500 by Chapter 90 and approximately 3,000 by Chapter 130 remain planned targets, not taught or approved counts.
- **0** newly approved and playable chapters from the 130-chapter curriculum.
- Morphology catalogue requires mapping to the full Phase 2 lesson compiler's original `detect` schema and human review of introduction chapters before production use.
- The regular paradigm samples need editorial approval, more complete tenses and principal-part exceptions. No production lexical form is implicitly approved by these engineering tests.
- No Phase 3 runtime loader or v4-to-v5 migration has been started.
- No third-party books, Ørberg recordings, source EPUBs, PDFs, private archives or dictionary scans were committed.

**Legacy source integrity:** `index.html` is deliberately unchanged compared with parent branch (Git blob `e2dfc9cb5a2415e829f2711320152993644e47c9`). Previous handover SHA-1 was `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20` (quoted from prior records, not independently recomputed here).

**Coverage-density clarification:** Each distinct new lexeme counts **once per segment** when computing the 8%/10%/12% new-lexeme density limit; running recurrence requirements count its actual reading occurrences across chapters. This resolves the 8-recurrences vs 8%-new density ambiguity. This clarification must be carried into the separate Phase 2 compiler's `recurrence-thresholds.json` when merged.

## Recommended next implementation order

1. Reconcile the uploaded Phase 2 compiler files with this GitHub branch (prefer source-file diff, never a blanket ZIP overwrite).
2. Port the 172-feature grammar mapping into that compiler's actual `tablinum-grammar-v1` schema, verifying every `detect` rule against token morphology and Chapter 1–130 plan; keep unknown morphology a hard error.
3. Extend the proposed paradigms to the exact roadmap §7.9 patterns and obtain actual sample table reviews before use as authoring acceptance checks.
4. Restore the four exact historical provisional comparison artifacts only from their original `LATIN_X_COMPLETE` source.
5. Continue original Book I Chapter 1–8 lesson drafting as **drafts**, never label content as approved without the owner's reviews and appropriate Latin checks.
6. Run full Node/Windows-browser, negative gate tests and explicit legacy progress/backup compatibility checks before any Phase 3 migration.

**Do not merge stacked review branches or rewrite main without explicit user approval.**
