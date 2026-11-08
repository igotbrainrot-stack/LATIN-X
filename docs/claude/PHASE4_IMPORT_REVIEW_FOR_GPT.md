# Phase 4 import review: content/pilot-b01-c001-c008 (head c934398)

Reviewed by Claude on 2026-11-05. The uploaded zip is byte-identical to the pushed branch. **Verdict: approved. Go on to Phase 5.**

## Verified
- `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` is byte-identical to Claude's commit 56b097a.
- I parsed the manuscript independently. Every `## Lēctiō` line equals the `text_la` of the matching sentence in `lessons/b01/c001`–`c008.json`, in the same order, across 8 of 8 chapters. The token counts match: 275/284/256/267/288/279/271/306. Chapter 7 is 271 instead of 272, which is only a difference in how `immōta` is split.
- Every token has `lx:null` and `annotation_status:draft_unverified`. Status is `draft`, `drafted_by` is claude-draft-2026-11-05, and every review signature is null. `new_lexemes_declared` and `grammar_new` are empty, and nothing from b01 is in `content/catalogue.js`.
- There are 6 exercises per chapter, all `proposed_ungraded` with `scoring_enabled:false`. Speaking prompts match the `Loquere` bullets (chapter 5 correctly has only one).
- The old `write-pilot-drafts.cjs` sentence banks are gone.
- These workflows passed on c934398: the pilot importer, the Phase 3c review fixes and the Phase 2 compiler.

## Fix (CI only, not the app)
"Tablinum source checks" fails on c934398 in `browser-smoke` and `windows-offline` with `npm error notarget No matching version found for playwright-core@1.65.0`. The unpinned `npm install playwright` resolves to a broken release. Pin `playwright@1.64.1` in `.github/workflows/tablinum-smoke.yml`, as already done in the other workflows. Do not skip these jobs.

## Limits of `scripts/lib/pilot-grammar.cjs` (fold into Phase 5)
It is a list of surface forms, not a real morphology check.
- `thirdGen` is checked only when `chapter===2`. Forms like `patris`/`mātris` should be rejected in every chapter until their real `first_chapter`.
- Dative and genitive forms are not checked against chapters 2 and 4. A ch 1 `Līviae` or ch 3 `mātrī` would pass. Add a dative list (mātrī, patrī, Mārcō, Tītō, Gāiō, puerō, mercātōrī, canī) with chapter 4 as its first chapter, and a genitive list (Līviae, Tītī, Mārcī, Flāviae, Gāī…) with chapter 2.
- `-ne` on a plural verb (`timentne`) passes only because of the `nt(?:ne)?$` regex. That is fine, but add a positive test for it.
The proper fix arrives when the owner signs lexemes and tokens get real `morph` tags. Until then, also run `scripts/check-claude-pilot.py` in CI. It already passes on this text.

## Next
Phase 5 (exercise engine), as specified in GPT_HANDOVER_NEXT_PHASES.md §6. The pilot stays unpublished until the owner signs it.
