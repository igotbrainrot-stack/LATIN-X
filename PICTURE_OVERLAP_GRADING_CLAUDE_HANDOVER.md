# LATIN X — Picture polygon overlap grading / Claude handover

**Date:** 7 November 2026 (Australia/Sydney)

## Start here — verified source lineage
- Repository: `cosmiccopper29-svg/Latin-X`.
- Direct parent: `review/picture-exercises-20261107` (review commit `2340ec2…`); preserve this review branch. Claude's review notes are in `docs/claude/PICTURE_EXERCISES_REVIEW_FOR_GPT.md`.
- This continuation branch: `fix/picture-overlap-grading-20261107`.
- Compare: <https://github.com/cosmiccopper29-svg/Latin-X/compare/review/picture-exercises-20261107...fix/picture-overlap-grading-20261107>
- **No merges, releases, rewriting of approved images or owner signatures.**

## Pass 1: fix the overlapping-region grading defect
Claude observed that the Chapter VIII storm drawing has overlapping `fenestra`, `ventus`, and `arbor` polygons. Previously all clicks were reduced to the *smallest* polygon before grading, so clicking a valid area inside the window could incorrectly grade as `ventus`; similarly, clicking the bending tree could incorrectly grade `arbor` when answering `ventus`.

- In `app/64-art-scenes.js`, image clicks now carry an actual percentage point `{x,y}` in the `tablinum:picture-region` event. `regionAt` still chooses the smallest containing polygon for the selected visual highlight. A keyboard-accessible region button sends **no point**, preserving literal region-button semantics.
- In `app/65-picture-practice.js`, the existing backward-compatible `evaluate(ex, region, chapter, storage, point = null)` grades a valid image click against `regionHit(scene.polygons[ex.answer], point.x, point.y)` **if** the coordinates correspond to the same smallest selected region. The saved reviewed answer, if genuinely signed, is the correct `ex.answer`, not an accidentally highlighted overlapping region. Invalid or absent points fall back to existing region-key grading. The existing `engine.grade` still enforces genuine chapter/exercise review, and the current 44 questions remain `proposed_ungraded` with `scoring_enabled:false` and reviewer fields null.
- `tests/picture-exercises.test.cjs` has exact regression fixtures using the **actual approved Chapter VIII storm polygon coordinates**: `(25,25)` selects/highlights `ventus` but lies inside `fenestra`; `(30,32)` selects/highlights `arbor` but lies inside `ventus`. Both score as correct with synthetic reviewed fixtures; keyboard buttons still return the selected literal region, unsigned items remain ungraded, wrong/out-of-bounds points cannot claim the expected answer, and the **v4 source/snapshot are unchanged** on a synthetic v5 reviewed save.
- `tests/phase8-picture-practice-browser.test.cjs` now clicks those positions inside the real `file://` WebP and asserts the selected highlight, the emitted raw click point, synthetic reviewed answer result, ungraded original result, and untouched live saved progress.
- The existing `.github/workflows/picture-practice-phase12.yml` also runs on the new branch to verify all four Windows browsers and pinned axe-core checks; it still packages the exact source commit.

## Pass 2: what to validate
From the application directory:

```sh
npm test
npm run test:pilot
npm run test:picture
npm run test:phase2
npm run test:art
npm run test:music
npm run test:package
npm run test:lexemes
npm run test:phase12
```

The original unchanged signed WebPs and all legacy runtime content must be byte-preserved; `curriculum/illustrations.json`, `content/illustrations.js`, `app/legacy-runtime.js`, `index.html` are untouched. No new image, caption, polygon, app storage key, story or word has been added. The source test report and package inventories are included in the complete handback ZIP under `CLAUDE_HANDOVER/`.

The local container does not include the `playwright` Node module, so the real Windows browser matrix must be validated on GitHub Actions; do not conflate syntax/static tests with physical Windows tests. CI validates real Windows hosted environments, **not the owner's physical Windows 10/11 or NVDA setup**. Axe's absence of serious/critical violations does not certify full WCAG compliance.

## What cannot be finished without genuine owner sign-off
- Eight original Book I pilot chapters remain **unsigned**; their original exercises and all 44 picture practice questions remain unsigned/ungraded and must not be published as graded course content.
- 128 legacy vocabulary review rows and 15 paradigm tables still need owner decisions.
- The 1,500/3,000 introduced-lexeme thresholds and review-ready gate remain RED; never pad them.
- Do **not** begin Phases 9–11 of full course writing until the owner signs the first eight chapters.
- Manual owner Windows launch, data retention, browser and NVDA checks remain outstanding.

## Next for Claude
1. Review implementation and run Windows browser regression (especially Chapter VIII overlapping polygons and signed-only synthetic fixture); correct only evidence-backed failures.
2. Present the eight pilot chapters, 44 picture prompts and keys for *actual owner* review without automatically filling signatures.
3. After owner review, use existing approval gates to enable scored picture exercises, verify real v5 backup/restore, then proceed with the planned new curriculum. Keep original material independent of *Familia Romana*.
4. Each task handback must be **one complete runnable ZIP** with all program source/assets/tests, Claude handover, test output and all pending approval statuses. Never provide only a patch.
