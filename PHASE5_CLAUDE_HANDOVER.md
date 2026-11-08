# LATIN X / Tablinum — Phase 5 COMPLETE Claude review handover

**Date:** 6 November 2026 (Sydney).
**Branch:** `feature/phase5-exercises-20261106`.
**Parent:** `content/pilot-b01-c001-c008` (Phase 4 approved by Claude; draft PR #7).
**Compare:** https://github.com/cosmiccopper29-svg/Latin-X/compare/content/pilot-b01-c001-c008...feature/phase5-exercises-20261106

## Deliver the ENTIRE program, not just Markdown

Claude receives `LATIN_X_PHASE5_COMPLETE_CLAUDE_REVIEW.zip`, consisting of the runnable
`index.html`, `Start Tablinum.cmd`, original eight playable chapters, exact eight
Claude Latin manuscript drafts, compiler, curriculum, lexicon owner-review tools, all
scripts, tests, historical source, GitHub workflows and all earlier handovers. To run
the original learner app, extract the complete ZIP and double-click the Windows launcher.
Do NOT replace this with only the handover, tests or a PDF.

Review `docs/claude/PHASE4_IMPORT_REVIEW_FOR_GPT.md` (source approval), then this
handover, `GPT_HANDOVER_NEXT_PHASES.md` §6, and
`CLAUDE_IMPLEMENTATION_ROADMAP.md` §§8.1–8.4.

## Pass 1 — new implementation

1. Fixed Claude's remaining CI-only defect by pinning `playwright@1.64.1` in
   the original `.github/workflows/tablinum-smoke.yml`, **without skipping jobs**.
2. Strengthened `scripts/lib/pilot-grammar.cjs` to reject Chapter 1 genitives
   (e.g. `Līviae`), Chapter 1–3 datives (`mātrī` etc.), unsupported pilot
   third-declension genitives (`patris` / `mātris`) and premature plural verbs,
   while accepting the valid Chapter 8 plural question `Timentne…`.
   **A surface-form list is conservative, not a full morphological tagger.**
3. Added `scripts/check-claude-pilot.py` as an independent manuscript comparison
   check, since the uploaded Claude review named a Python file that was not present
   in this GitHub branch. It checks exact reading lines, uniqueness, unsigned tokens
   and sampled premature forms. It is a new implementation, NOT claimed to be
   byte-identical to Claude's original Python checker.
4. `app/50-exercises.js` is a dependency-free classic-script exercise registry
   for `mc, short, tf, wh, order, pic, retell, ending, cloze, define, table,
   listen-pic, listen-mc, dictate, shadow`. Exposes typed validators,
   macron-optional exact matching (not substring), true/false, ordered events,
   picture region IDs, non-graded retell and source-evidence IDs.
5. Strict score eligibility requires BOTH the **published approved chapter**
   AND the exercise's own approval status, reviewer identity and date.
   Proposed `proposed_ungraded` exercises and all unsigned Latin pilot chapters
   remain ungraded and unpublished. Human verified recording flags are required
   to display any new-course listening task. Browser speech is never represented
   as an authentic recording, and speaking is never auto-scored.
6. `scripts/lib/exercise-distractors.cjs` is a deterministic author-time-only
   distractor generator: requires approved lexemes and reviewed forms; POS,
   morphology (case/number or person/number/tense), introduction chapter and
   same-sense/synonym and evidence-sentence exclusions. Prefer words introduced
   in the last ten chapters. Its output is a PROPOSAL, not a signed question.
7. Legacy questions are exposed via a typed `legacyAdapter` and routed through
   `TablinumExercises.gradeLegacy` with the ORIGINAL normalisation and accepted
   variants. Old eight-chapter question IDs and v5 progress remain unchanged.
8. In `app/legacy-runtime.js`, compiled and genuinely approved course
   chapters may show signed exercises; correct answers are recorded under stable
   question IDs in **v5 only**. Evidence links return to the source sentence.
   The existing eight legacy quiz screens remain usable and unchanged in content.
   Retelling offers manual model comparison, never a numeric speech grade.
9. The original v4 storage key is never rewritten; old backups and notes remain
   protected by the Phase 3c test suite. All draft tokens remain `lx:null`.

## Pass 2 — test matrix (check the latest CI run against the branch SHA)

Node 22, Linux and Windows:

```powershell
npm test
npm run test:phase5
npm run test:pilot
npm run test:phase2
npm run test:phase3c
npm run test:lexemes
npm run test:package
```

Independent Python on Linux:

```bash
python3 scripts/check-claude-pilot.py
```

Real Windows file:// with Playwright pinned to 1.64.1:

```powershell
npm install --no-save playwright@1.64.1
npx playwright install chromium
npm run test:phase5-browser
npm run test:file
npm run test:browser
npm run test:review-browser
```

`tests/exercise-engine.test.cjs` covers all legacy question accepted variants,
the 15 registered types, unsigned and audio gates, exact macron-insensitive matches,
order partial credit, deterministic distractors and prohibited early forms.
`tests/phase5-keyboard-browser.test.cjs` injects **only synthetic in-memory
approved fixtures** (never signs a real lesson), selects a course chapter,
answers a reviewed MC and a short question using keyboard-only interactions,
checks evidence navigation and v5 stable IDs, verifies unsigned/audio exclusion,
and returns to the original legacy quiz.

`tests/pilot-text.test.cjs` retains the original Claude manuscript lock and
negative fixtures. The Linux and Windows workflow `.github/workflows/phase5-exercises.yml`
produces a full source ZIP with SHA-256. The original `tablinum-smoke.yml` workflow
must also pass after the published Playwright version pin.

## Important limitations / reviewer focus

- **No genuinely approved new-course lessons exist** in the GitHub catalogue.
  The new-course UI can only be exercised with synthetic in-memory test fixtures
  until the owner signs Latin, all lexical sense IDs, morphology and answer keys.
  Do not interpret a synthetic passing test as actual publication.
- The legacy eight original quiz answers were already available before this phase
  and remain playable. They are still `legacy_unreviewed`, NOT retroactively
  certified by a Latinist. Their acceptance behavior should remain byte-compatible.
- The `table` type currently checks a single normalized composite answer,
  not a full multi-cell interactive paradigm editor. Listening picture/dictation
  require genuine chapter audio. Event ordering is text-input based at this phase;
  future UI enhancements can add drag-and-drop with keyboard parity.
- Reviewed forms are currently absent in the owner-signed new lexicon; the
  distractor tool thus cannot yet produce real course options. Never forge them.
- Original `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` and all eight unsigned
  generated lessons are preserved without wording changes.

## Mandatory expected RED milestones

- 128 proposed vocabulary rows: unsigned.
- 15 paradigm pattern sample tables: not approved.
- 1,500 and 3,000 unique reviewed-lexeme gates: not met.
- Book I Chapters 1–8: drafts, not approved or published.
- Owner must decide excess vocabulary in Chapters 2, 3, 4, 7 and the
  wordings `Pecūnia est pretium`, `Gāī`, `Canis! Canis!`.

## Claude's response contract and next exact task

1. Review the **complete runnable ZIP**; identify bugs with paths and precise reproduction.
2. Re-run Node and Windows keyboard-only tests and original source-content locks.
3. Explicitly label checks not run, never invent owner or Latinist signatures.
4. If critical bugs are found, fix on ONE new branch based on this Phase 5 branch,
   without merging stacked PRs or touching main.
5. Return the **complete runnable program ZIP plus updated handover**, not prose alone.
6. Next exact phase: **Phase 6 — reviewed FSRS vocabulary deck and exposure
   tracking** (requires vendored pinned dependency with retained LICENSE);
   preserve legacyCards and four independent vocabulary counters.
