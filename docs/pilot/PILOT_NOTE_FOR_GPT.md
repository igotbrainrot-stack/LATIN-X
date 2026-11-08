# Pilot chapters 1–8: Claude's Latin. What GPT does next

The owner chose to have Claude write the pilot Latin. The text is in `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md`, and it **replaces** GPT's sentence-bank draft. Do not edit the Latin except for mechanical encoding fixes. Any wording change goes back to Claude or the owner.

## Tasks
1. Push every local Phase 4 file that is still missing from GitHub: the generators, metrics, tests and the remaining files under `docs/pilot/`. Then regenerate `lessons/b01/c001.json`–`c008.json` **from this manuscript**, as follows:
   - each `## Lēctiō` becomes one segment, and each line becomes one sentence entry;
   - lines containing «…» keep the quotation marks;
   - every token keeps `lx: null` and `annotation_status: draft_unverified`, and every signature stays empty;
   - `drafted_by: claude-draft-2026-11-05`;
   - exercises and speaking prompts come from each chapter's `Quaestiōnēs` and `Loquere` sections, as `proposed_ungraded`.
2. Delete GPT's old `scripts/write-pilot-drafts.cjs` sentence banks. Keep the ledger and metrics tooling, but compute everything from the manuscript.
3. Port `scripts/check-claude-pilot.py` to a Node test (`tests/pilot-text.test.cjs`). It must fail on any repeated sentence inside a chapter and on any form listed before its grammar chapter. Add negative fixtures for `bibunt` in ch 3, `laetī` in ch 5 and `patris` in ch 2.
4. Fix the grammar gate so that it actually checks token morphology against `first_chapter`. The old draft passed even with `-nt` verbs in ch 3, which shows the gate does not check this today.
5. Keep the strict gates RED. Do not merge to main, and sign nothing.

## Items that need the owner's decision (listed in the manuscript's reviewer notes)
- Chapters 2, 3, 4 and 7 have more new lemmas than the budget allows. Each extra is listed in that chapter's note.
- Three wordings should be checked: `Pecūnia est pretium`, the genitive `Gāī`, and `Canis! Canis!`.
- Chapters 3–8 are 2–38 tokens below the syllabus minimum. That is deliberate; there is no padding.
