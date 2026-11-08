# Claude review: picture exercises + Phase 12 follow-ups

**Branch reviewed:** `feature/picture-exercises-phase12-20261107` (head 76c5e19), parent `art/scene-4-approved-20261106` (6ad6d15). The uploaded ZIP matches the branch.
**Review branch:** `review/picture-exercises-20261107` (this commit). Build on it.
**Verdict:** approved, with two Latin fixes and one test fix applied here. One grading change is requested before scoring is ever turned on.

## What I checked
- Approved art untouched: no change to `assets/`, `curriculum/illustrations.json`, `content/illustrations.js`, `app/legacy-runtime.js` or `index.html`.
- `npm test`, `test:pilot`, `test:picture`, `test:phase2`, `test:art`, `test:music`, `test:package`: all pass.
- **Browser tests run here in real Chromium** (your sandbox could not):
  - `tests/phase8-picture-practice-browser.test.cjs` first **failed** on c002: the search picked the polygon vertex (9,26) as the "inside" point, and pixel rounding landed the click just outside. Fixed by picking a point whose neighbours ±1.5 % are in the same region. Now passes for all nine scenes.
  - `tests/phase12-axe-browser.test.cjs` with axe-core 4.10.3: 0 serious/critical on reader, quiz, review, progress and picture practice (2, 2, 2, 1, 0 minor/moderate). Pass.
- Picture practice is ungraded and never writes v5 for unsigned items. Good.

## Latin (all 44 prompts)
All prompts use only forms the chapter's reading has taught; your `picture-exercises.test.cjs` enforces this, which is excellent. Changes:
- c006 `Ubi est mālum ūnum?` → **`Ubi est ūnum mālum?`** (the order the reading uses: "ūnum mālum parvum").
- c006 `Ubi sunt māla?` → **`Ubi sunt multa māla?`** The single, pair and trio on the table are also māla, so the plain question was ambiguous. "Multa māla" is in the reading and points to the full basket.
- Kept `Quō canis currit?` (porta) and `Quō Līvia currit?` (fenestra). They mirror the chapter's own margin device ("Quō? → ad portam"), and the nominatives porta/fenestra never appear in the readings, so `Ubi est porta/fenestra?` would use untaught forms.
- c005 Flāvia: she is in the approved native c005 picture, and her polygon is correct.

## Requested change before scoring is enabled
Grading currently uses the **smallest** region under the click. For overlapping regions that marks a correct click wrong:
- c008-storm: `fenestra` covers the whole left window, but the opening is covered by the smaller `ventus` and `arbor`. A learner answering "Quō Līvia currit?" by clicking the window opening gets `arbor` or `ventus`. Likewise, "Quid arborem movet?" (ventus) is wrong if they click the bending tree.
- **Fix:** grade a click as correct when it is inside the **answer's** polygon (`regionHit(scene.polygons[ex.answer], x, y)`), even if a smaller region also contains it. Keep the smallest-region rule for the highlight and for the keyboard buttons. Add a test for exactly the c008-storm cases above.

## Next
1. Make the grading change above, with tests.
2. Leave every picture item unsigned. The owner signs them after signing the chapters.
3. Do not start Phases 9–11 until the owner signs the 8 pilot chapters.
