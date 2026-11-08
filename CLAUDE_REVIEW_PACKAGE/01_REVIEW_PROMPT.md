# Claude review instructions — two-pass technical and educational audit

You are reviewing a complete offline Latin-learning application, not just a proposed architecture. Read `00_START_HERE.md` first, then inspect all relevant code and data.

## PASS A: Independent review. Do not patch until you have findings.

### 1 — Regression and packaging integrity
- Read `index.html`, `archive/index-v02-original.html`, `tests/smoke.test.cjs`, `tests/backup-compat.test.cjs`, `tests/file-url-smoke.cjs`.
- Verify the eight original chapters, question and cloze answer keys, dictionary, progress, backups, imported text, and all audio mode labels still behave correctly. Compare the source against the Phase 1 parent; it should not have been modified.
- Test Windows Chromium/Edge *file://* app and review UI, plus Firefox manually if available. Check keyboard controls, accessible labels, focus, 128-row filtering and exported CSV consistency.
- Inspect `Vocabulary Review.html` for CSV injection, malicious file content, Unicode, browser security assumptions, unsaved edits, review/signature validation and possible false approvals. Treat the CLI as authoritative.

### 2 — Lexicon and editorial integrity (priority)
- Read `scripts/lib/review-workflow.cjs`, `scripts/lib/review-csv.cjs`, `scripts/registry-review-sheet.cjs`, `curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv`.
- Check exactly 128 unique candidates, original head/gloss unchanged, exact 32-column header, quote/CRLF round trip and real user-signature requirements. The draft contains NO decisions, reviewers, reviewed dates or approved macrons.
- Verify all sense-aware IDs, proposed lemmas, multi-candidate merges, ambiguous token keys, inflectional vs lemma identities, homographs (*malum* apple vs evil, *edō* eat vs *ēdō* issue) and evidence source rights. Claude's draft is a **proposal**, not a reviewed lexicon.
- Compare the draft against the earlier Phase 1 `legacy-candidates.csv` and the original latest `LATIN_X_COMPLETE_20261105.zip` if supplied. Record exact source mismatches rather than inventing original missing files.

### 3 — Phase 2 grammar fail-closed test
- Inspect `scripts/lib/grammar.cjs` and `curriculum/grammar-features.json` against ALL 130 `grammar_focus` entries from `curriculum/vocabulary-budgets-130.json`.
- Confirm morphology cannot pass when unrecognized, ambiguous, unintroduced or absent; no tagger confidence alone qualifies as proof.
- Verify chapter 1 `n.nom.pl`, *est/sunt*; v3 pronouns in chapters 11/14/15/16/20/26; plural imperatives at 54; oblique relatives at 72; past/future/passive/subjunctive timing.
- The feature map uses provisional string IDs; the previously generated Phase 2 compiler expected a different grammar schema. Explain the adapter and avoid broken integration.
- Run negative fixtures for Chapter 3 imperfect and future passive, unknown morphological categories, wrong person/voice/number, false use of partial feature bundles, and manual preview bound to one exact token.
- Detect source-plan errors in the provisional map and identify any catalogue gaps; a high feature count by itself is not proof of coverage.

### 4 — Paradigm quality (critical)
- Audit `scripts/lib/paradigms.cjs`, `tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json`, `tests/paradigms.test.cjs` against independent Latin grammar resources.
- Check case endings and stem changes: 1st–5th declension, 3rd i-stem, 2nd -ius vocatives, 5th-declension e-stems, unusual nouns, masculine/neuter/feminine adjective forms, third-declension 1-/2-/3-termination adjectives.
- Check full verb principal parts, thematic vowels, conjugations 1/2/3/3-iō/4, macron quantity, active/passive, imperfect/future/perfect/pluperfect, irregular stems, participles, supines, gerund/gerundive and infinitives. **Expect provisional defects** and do not treat current generated forms as authoritative.
- The current grammar maps and paradigm outputs use different morphology conventions in places; establish a canonical UD-like representation plus exact normalized ID adapter.
- Ensure `checkForm` rejects all unapproved patterns and unapproved irregular forms, despite being mechanically generated.
- Create tested sample tables with external verification notes; do not falsely write human signatures.

### 5 — Curriculum, pedagogy, licensing
- Review the 130 chapter trajectory: easy comprehensible Latin, very gradual grammar introduction, original narrative, Latin-first meaning, controlled vocabulary recurrence, increasing reading and conversation skill. Compare pedagogical approach with *Familia Romana* **without copying its text**.
- Confirm 1,500-word minimum through Chapter 90 and aspirational ~3,000 through 130 refer to distinct approved and introduced lexemes; lexical/grammar milestones are derived from authored content, not budget JSON.
- Inspect chapter order and corrections from `curriculum/CLAUDE_REVIEW_RESPONSE_V3.md`.
- Check word density = each new lexeme **once per segment**, while recurrence requires actual repeated token exposures; preserve pending future coverage.
- Review third-party licence register; keep proprietary textbooks/audiobooks outside Git.

## PASS B: Implement narrowly, after ranking the findings

1. Resolve critical regressions, particularly any owner-review false approvals, loss of unsaved data, unsupported morphology acceptance, or wrong irregular/regular Latin forms.
2. Update tests and then run them under Node 22 (Linux + Windows), Windows file:// browser, real CSV import/export. Report *results* and *unrun tests* separately.
3. Preserve existing app and stable data; add fixes on **one** new branch based on `fix/phase2-review-restoration-20261105`; do not merge.
4. If the user supplies `LATIN_X_PHASE2_FULL_BUILD_20261105.zip`, reconcile it by file and symbol rather than replacing this branch wholesale. The current GitHub tree contains **no Phase 2 compiler**, so the compiler integration must be independently verified.
5. Draft original Latin Chapters 1–8 only as **draft** until signed. Chapter 1 must be accessible to beginners, with clear nominative and `est/sunt` and cautious vocabulary. Do not artificially mark all lessons complete.

## Required review response template

- **Executive summary:** what currently runs and what does not.
- **Findings:** table with severity (blocker/high/medium/low), path and location, reproduction, actual vs expected, proposed fix, confidence.
- **Latin accuracy:** named paradigms, exact wrong forms, corrections and independent source citations; distinguish reviewed/uncertain.
- **QA matrix:** commands, platforms, passing/failing/blocked and failure logs; confirmed strict red gates.
- **File-by-file diff summary:** what changed and what stayed untouched.
- **Remaining roadmap:** tasks in dependency order, with no claiming unfinished course content as implemented.
- **Deliverable:** complete runnable ZIP (all source, launcher, tests, handover and reviewer notes) and GitHub branch link. If another AI will pick up, include its instructions in the ZIP.

Do not invent successful runs, signer identities, verified Latinist review or availability of the missing standalone Phase 2 compiler.
