# LATIN X — Main-reader approved art bridge / full Claude handover

**7 November 2026 (Australia/Sydney)**

## Problem and verified root cause

The owner launched the main app using `Start Tablinum.cmd` → `index.html` and saw the old geometric SVG drawings. **All nine approved WebPs were already inside the complete ZIP.** The reader's legacy chapter code called `TablinumArtScenes.renderChapter(activeCourse?.id, fallbackScene)`. On the eight playable legacy chapters `activeCourse` is null, so the lookup received `undefined` and returned the SVG. The approved picture IDs (`b01-c001`…`c008`) belong to a separate **unsigned** eight-chapter Book I pilot, so simply publishing those Latin lessons to make the pictures appear would have falsified owner approvals.

## Source lineage and branch discipline

- Repository: https://github.com/cosmiccopper29-svg/Latin-X
- Parent: `fix/picture-overlap-grading-20261107` (PR #24, reviewed-source lineage from `review/picture-exercises-20261107`).
- Continuation: `fix/main-reader-approved-art-20261107` (stacked on parent; **do not merge to main**).
- Compare: https://github.com/cosmiccopper29-svg/Latin-X/compare/fix/picture-overlap-grading-20261107...fix/main-reader-approved-art-20261107
- No releases, no new Latin sign-offs or new WebP sign-offs.

## Pass 1 — safe visual integration

- `app/64-art-scenes.js` now additionally observes main reader re-renders and inserts reviewed Book I visual previews **only** when a playable legacy lesson is selected and approved matching art exists. It does not modify the original byte-locked `app/legacy-runtime.js`, `index.html`, any compiled Latin or user state.
- Exact legacy-topic mapping (legacy chapter numbers are **not** Book I chapter numbers):

| Playable legacy chapter | Approved Book I picture |
|---|---|
| I In hortō | C001 Hortus et arbor |
| II Familia | C002 Familia |
| III Dōnum | C004 Dōna |
| IV Cēna | C003 Cēna |
| V Forum | C006 Forum |
| VI Canis | C007 Canis in viā |
| VII Tempestās | C008 storm **and** C008 sun |
| VIII Crās | C005 evening, clearly labelled **related**, not a literal illustration |

- The preview is explicitly labelled as from the separate Book I material; it **does not represent approval of the pilot chapters**, any word/grammar or the 44 picture-answer keys. A link opens the existing standalone `Picture Practice.html`.
- `renderChapter` still enforces the original owner approval, real WebP path, caption, provenance and polygon gates. No `asset`, `approval`, `polygons` or other manifest values are edited. The unchanged SVG is embedded as a **hidden fallback only if the approved WebP loads successfully**; if an image fails it is shown again with original context.
- All nine approved image files, original Latin, saved learner data formats/keys and the picture-scoring overlap fix from the parent remain byte-identical.
- `Start Tablinum.cmd` remains the main launcher; `START_HERE_ART_FIX.txt` explains to fully extract the ZIP to a **new** folder (not open HTML inside ZIP or reuse the old folder), and select `Lectiō`.

## Pass 2 — verification

The complete ZIP includes `CLAUDE_HANDOVER/TEST_RESULTS.txt`, `APPROVED_ASSET_SHA256.txt` and a file inventory. Run:

```bash
npm test
npm run test:picture
npm run test:art
npm run test:phase2
npm run test:music
npm run test:package
npm run test:lexemes
npm run test:phase12
```

`tests/legacy-main-art.test.cjs` verifies the eight topic matches, nine approved images (with C008 storm+sun), exact signed gate, custom-text exclusion, legacy SVG fallback and no legacy runtime changes. `tests/legacy-main-art-browser.test.cjs` is an actual `file://` browser regression on the main program: all eight chapter selections, real WebP loading, hiding original SVG after load, keeping sentences, keyboard polygon selection without progress writes, and SVG recovery on an image error. It is included in the dedicated **Windows Chromium, Chrome, Edge and Firefox** CI workflow.

**Important environment limitation:** this ChatGPT container blocks both `file://` and loopback browser navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), so local visual tests could not run. The hosted Windows matrix is authoritative for browser execution. Automated results do not replace a physical owner PC, NVDA screen-reader verification or manual artwork inspection.

## Remaining sign-offs and work

1. The eight original Book I pilot Latin manuscripts, original exercise keys, and **44 picture keys** remain unsigned. Keep their automatic grading off and do not pretend they are published because the owner likes the pictures.
2. The 128 lexeme candidates and 15 paradigms await owner decisions. All 1,500/3,000 lexeme milestones and review-ready proof gates remain RED until genuinely met. No content padding, plagiarism or automatic approvals.
3. Phases 9–11 must not start until the owner signs the pilot chapters. Final manual Windows/NVDA/hardware checks are still pending.
4. For a real learner-facing *new* course chapter reader, first acquire genuine owner chapter approvals and then use the existing compiled chapter loader. This main-reader art bridge is a deliberate preview, not an approval shortcut.

## Handover standard

**Always provide the complete runnable Windows source/assets/tests program and this handover as a single downloadable ZIP for Claude**, not just Markdown or a patch. Do not ship original third-party copyrighted materials or external recordings.
