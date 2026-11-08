# LATIN X — Picture exercises + Phase 12 accessibility continuation

**Date:** 2026-11-07 · **Status:** development review only, no new signed Latin course or exercise keys.

## Source of truth and Git branch

- Received complete ZIP: `LATIN_X_GPT_PACKAGE_ALL_SCENES_20261106.zip` (305 entries; ZIP integrity passed).
- Exact parent branch: `art/scene-4-approved-20261106` at head `6ad6d15` (verify full SHA on GitHub).
- New stacked branch: `feature/picture-exercises-phase12-20261107`.
- Compare: https://github.com/cosmiccopper29-svg/Latin-X/compare/art/scene-4-approved-20261106...feature/picture-exercises-phase12-20261107
- **Never merge into `main`, publish a release, or fill owner review signatures.**

## Phase 1 — implementation

1. Kept all **9 owner-approved scene image bytes, polygons, alt captions, approval fields and character artwork unchanged**. Retained the byte-locked `app/legacy-runtime.js`, `index.html`, every legacy learner ID and saved-progress migration.
2. Added **44 draft `pic` questions** to the eight `lessons/b01/c001.json`…`c008.json` files. Every region appears at least once. Chapter VI has **seven** required region IDs, so needs seven questions, an explicit exception to the “3–6 per scene” target. Chapter VIII covers both storm (four) and sun (three).
3. `curriculum/picture-exercises-b01.json` is the independent unsigned question source. `scripts/import-claude-pilot.cjs` now appends these rows **after** recreating Claude's original six source questions. `tests/pilot-text.test.cjs` continues to compare all six original questions and every reading sentence byte-for-byte, plus it verifies the appended picture questions. `scripts/build-picture-practice.cjs` generates a static `content/picture-exercises.js` classic script; no network or fetch.
4. Added offline **`Start Picture Practice.cmd`**, which launches `Picture Practice.html`. This intentionally presents UNSIGNED pilot picture exercises without pretending the original reader has published those unsigned chapters. The existing reader remains completely untouched. The page shows the nine approved images as separate scenes, a chapter/question selector, and visibly highlights the selected approved polygon on image click **or** native keyboard-accessible region button.
5. `app/64-art-scenes.js` now maps image click coordinates into reviewed 0–100% polygons using `TablinumArtScenes.regionHit`, chooses the smallest containing polygon for overlapping backgrounds, and aligns highlight SVG with the actual image dimensions; it never mutates approved geometry. `app/65-picture-practice.js` uses the reviewed exercise engine only when **both the chapter and question have signatures**. The current unsigned preview is explicitly *not graded* and **does not write to v5**. A synthetic reviewed exercise test shows a legitimate grade can persist through a v5 backup while leaving v4 and its snapshot immutable.
6. Phase 12 optional follow-ups: `app/80-accessibility.js` now visually hides its real text-field `<label>` elements, without changing the byte-locked HTML or removing their accessible names. Added a CI-only pinned `axe-core@4.10.3` scan, fail on serious/critical findings, and browser checks across reader, quiz, review, progress and picture practice pages.

## Phase 2 — tests and verification

Re-run these commands from the project root:

```sh
npm test
npm run test:pilot
npm run test:picture
npm run test:phase2
npm run test:art
npm run test:music
npm run test:package
```

New Node test `tests/picture-exercises.test.cjs` checks cumulative taught word forms, exact image IDs, 44 unique unsigned keys, 9 scene polygon maps, one hit inside and outside every scene, true synthetic review-gated scoring and a v5 backup roundtrip. `tests/phase8-picture-practice-browser.test.cjs` performs genuine Windows `file://` image-load, inside/outside click, keyboard/region highlight and unchanged v4/v5 checks. `tests/phase12-axe-browser.test.cjs` injects pinned axe-core in CI for five real UI views and fails on serious or critical findings. No runtime dependency or web fetch is introduced.

**Limitations to report honestly:** isolated local environment policy blocks Chromium navigation (both file:// and localhost), even though the browser launches; browser results must be taken from the GitHub-hosted Windows matrix, not inferred from Node unit tests. Physical Windows 10/11, screen-reader and owner-signoff manual tests have not been run. Automated axe results do not certify complete WCAG compliance.

## Owner/Claude work still pending

- Claude must review **all 44 Latin prompts**, particularly whether “Quō canis currit?” (gate) and “Quō Līvia currit?” (window) answer the exact **approved polygon**, and inspect Chapter V Flāvia polygon because the approved painting may not depict her. Do **not** silently edit approved polygons.
- The **eight original pilot chapters are unsigned**; all picture answers `proposed_ungraded`, `scoring_enabled:false`, reviewer fields `null`. Do not mark them reviewed or claim they are graded.
- The 128 legacy vocabulary decisions, 15 paradigm tables and 1,500/3,000 introduction gates remain pending/RED. Do not start original course Phases 9–11 before owner signs the first eight pilot chapters.
- Run the real-owner Windows offline launcher, browser/keyboard and NVDA checklist before production release.

## Next milestone

Have Claude review the image-to-prompt mapping and Latin grammar, ask the **owner** to sign each answer key, and only after the source chapter is genuinely approved connect the picture grading directly into the published course quiz via the reviewed exercise engine. No synthetic signatures may be shipped.

**Handback contract:** the ZIP must include every runnable program file, all approved WebPs and thumbnails, source manifest, tests, signed/unsigned review status, this handover and full test logs. Not a partial patch-only handover.
