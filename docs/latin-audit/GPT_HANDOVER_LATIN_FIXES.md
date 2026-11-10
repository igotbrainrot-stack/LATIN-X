# GPT handover: apply the Latin audit corrections (LATIN X)

**From:** Claude (Latin scholarship audit, 10 November 2026) · **Repo:** `igotbrainrot-stack/LATIN-X` · **Base:** `main` at `1803e55` · **Audit branch:** `audit/latin-scholarship-20261110` (draft PR #4)

## 0. Read first

1. `docs/latin-audit/LATIN_AUDIT_REPORT.md`: the summary.
2. `docs/latin-audit/LATIN_FINDINGS.csv`: one row per finding, with file, record ID, current text, correction, evidence and test.
3. `docs/latin-audit/LATIN_UNRESOLVED.md`: **do not change anything listed there**.
4. `docs/latin-audit/LATIN_GOLD_TESTS.json` and `scripts/run-latin-gold-tests.cjs`: your acceptance tests.

## 1. Ground rules (non-negotiable)

- **Owner approval.** Apply only findings the owner has approved by ID. If you have no approval list, stop and ask. Suggested batches are in section 4. Do not apply anything in the "do not fix" list (section 6).
- **Minimal edits.** Change only the characters named in the finding. Keep every other macron, word, punctuation mark, ID, order and status.
- **Never** edit or re-hash `archive/index-v04-inline-phase3a-baseline.html` or `archive/index-v02-original.html`. They are SHA-locked historical originals.
- **Never** change sentence IDs, question order, `old_key` values or `tablinum-*` localStorage keys. Saved progress depends on them.
- **Never** commit MP3s. Owner audio is private. Do not change `sha256` values or `owner_listening` statuses in `content/narration.js`.
- **Never** promote unsigned material (pilot status `draft`, picture `proposed_ungraded`, lexicon `pending`) to approved.
- **Do not** "fix" learner backup fixtures: `tests/fixtures/v4/midcourse.json` contains a learner's typed answer `"Tītī"`. That is user data and must stay as it is.
- One PR per batch, branched from current `main`. Run the full test list in section 5 before each push.

## 2. How the legacy lessons are built (read before LX-001)

The eight published chapters are **generated**, not hand-edited:

```
archive/index-v04-inline-phase3a-baseline.html   (SHA1-locked original, never edit)
   └─ scripts/lib/extract-legacy.cjs  readLegacySource()
        └─ scripts/legacy-to-lesson.cjs   →  lessons/legacy/chNN.json
              └─ scripts/compile-content.cjs  →  content/legacy/chNN.js, content/catalogue.js
```

Locks that will fail on any text change, by design:
- `tests/legacy-content-lock.test.cjs` with `tests/fixtures/legacy-content-contract.json` (whole-chapter, question, cloze and shared-glossary FNV32 hashes)
- `curriculum/lexicon/legacy-id-map.json` (`latin_sentence_fingerprint_fnv32`, `question_text`)
- `curriculum/lexicon/legacy-token-audit.json` (`latin_text`, token `surface`)
- `scripts/compile-content.cjs` line 78 (`original legacy lesson changed`)
- `tests/compiler.test.cjs`

A direct edit to `lessons/legacy/*.json` was tried in a scratch copy and fails `tests/compiler.test.cjs`, as expected.

**Recommended approach: an approved errata layer.** Do not unlock the archive. Instead:
1. Add `curriculum/legacy-errata.json` listing each approved replacement: `{finding:"LX-001", target:"all legacy Latin strings", from:"Tīt", to:"Tit", approved_by, approved_at}`.
2. In `scripts/lib/extract-legacy.cjs` (or immediately after extraction in `legacy-to-lesson.cjs`, the lock test and `compile-content.cjs`), apply the errata to the extracted `lessons`, `guidedCloze` and `shared` data **after** the archive SHA check. Do it in one shared helper so every consumer sees the same corrected data.
3. Regenerate: `node scripts/legacy-to-lesson.cjs && node scripts/compile-content.cjs`.
4. Update the locks to the new hashes **in the same commit**, and record the old and new values plus the errata ID in `tests/fixtures/legacy-content-contract.json` (add an `errata_applied` array) so the change is auditable. Update `legacy-id-map.json` fingerprints and `question_text`, and `legacy-token-audit.json` `latin_text` and `surface` values, for the affected rows only.
5. The runtime glossary `shared` in `app/legacy-runtime.js` is hash-locked through the contract: update the string (`"Tītus","Titus","Tītō Tītum"` → `"Titus","Titus","Titō Titum"`) and the `sharedGlossaryFnv32` in the same commit, and explain it in the commit message.

If the owner prefers a different mechanism, stop and ask; do not invent a third one.

## 3. Finding-by-finding instructions

Severity: M = major, m = minor. "Gold test" names refer to `LATIN_GOLD_TESTS.json`.

### LX-001 (M) Tītus → Titus (short i)
Replace the first vowel only: `Tītus→Titus`, `Tītī→Titī`, `Tītō→Titō`, `Tītum→Titum`. **Do not** touch `Mārcus`, `Līvia`, `Flāvia`, `Gāius`.
- **Legacy (published):** via the errata layer (section 2). That covers `lessons/legacy/ch02–ch08.json`, `content/legacy/ch02–ch08.js` and the runtime `shared` glossary and `guidedCloze` copy in `app/legacy-runtime.js`.
- **Narration:** `content/narration.js` `canonical_text` for the 9 affected sentences (legacy-ch02-s006, s007; ch03-s002, s008; ch04-s003; ch05-s006; ch07-s004, s006; ch08-s003) and the matching `canonical_text` in `docs/audio/arjun_lectio_ch0*_20261110.json`. Leave `tts_input`, `sha256` and statuses alone. The gold test `G-PRES-narration-sync` requires narration text to equal lesson text.
- **Pilot (draft):** edit `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md`, then regenerate `lessons/b01/*.json` with `npm run build:pilot`. Do not hand-edit the JSON.
- **Picture prompts:** `curriculum/picture-exercises-b01.json` (3 prompts plus `answer`/`region_id` values `Tītus`), then regenerate `content/picture-exercises.js` with `node scripts/build-picture-practice.cjs`. Region IDs are also polygon keys in `curriculum/illustrations.json`, so rename them consistently there and regenerate `content/illustrations.js` (`npm run build:art`). Run `npm run test:art` and `node tests/picture-exercises.test.cjs`.
- **Lexicon review data:** `legacy-candidate-map.json`, `legacy-vocab-map.json`, `legacy-extra-streams.json` and the two review-sheet CSVs: change only the Titus head words and forms.
- **Leave unchanged:** `archive/*`, `docs/history/*`, `curriculum/reviews/*`, `tests/fixtures/v4/midcourse.json`, `art-replacement-records.json` and `docs/art/provenance/*` (historical provenance records; add a note instead if the owner wants).
- **Audio follow-up:** tell the owner that the 9 Chapter II–VIII Titus recordings were generated from "Tītus" and need listening review. Do not regenerate audio unless asked.
- **Gold test:** `G-LX-001-titus`.

### LX-002 (M, draft) Contradictory sentence b01-c002-s039
In `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` line 171, replace
`Vir et fēmina nōn in hortō sunt: vir in hortō est, fēmina in vīllā.`
with `Vir in hortō est, sed fēmina in vīllā est.` Then run `npm run build:pilot` and `npm run test:pilot`. The sentence ID must stay `b01-c002-s039`; check that the importer keeps IDs by position. Gold test: `G-LX-002-contradiction`.

### LX-003 (M) 5th declension accusative singular: diēm → diem
`scripts/lib/paradigms.cjs`, noun-5: for `acc.sg`, shorten a final `ē` of the stem before `m` (`diē`+`m` → `diem`, `rē`+`m` → `rem`). Change the fixture check in `tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json` from `["n.acc.sg","diēm"]` to `["n.acc.sg","diem"]`, then regenerate `docs/owner/PARADIGM_SAMPLES.md` with `node scripts/render-paradigm-samples.cjs`. Authority: A&G §96 Note. Gold tests: `G-LX-003-diem`, `G-LX-003-fixture`.

### LX-004 (m) 5th declension gen./dat. singular of rēs, spēs, fidēs
Allow an explicit short-e genitive (`reī`) instead of throwing `5th-declension quantity requires explicit long-vowel stem`. With `genitive:"reī"` the engine must produce gen./dat. `reī` and acc. `rem`, and keep `diēī` for `diēs`. Authority: A&G §96 Note. Gold tests: `G-LX-004-rei`, `G-LX-004-rem`.

### LX-005 (M) Masculine/feminine i-stem ablative singular
`nounRules["noun-3-i"].sg[4]` is `"ī"`; change it to `"e"`. Add an optional lexeme flag (for example `abl_i:true`) for the nouns A&G §76.a lists (acc. in -im such as `turris`, `sitis`, `vīs`, plus `secūris`), and for the §76.b optional list allow both forms. Keep neuter i-stems (`noun-3-i-n`) and adjectives (`adj-3-*`) on `-ī`: they are correct. The sample `cīvis` abl. becomes `cīve`. Regenerate `PARADIGM_SAMPLES.md`. Gold tests: `G-LX-005-urbe`, plus the preservation tests `G-PRES-paradigm-mare` (marī) and `fortis` (fortī) must still pass.

### LX-006 (m) Vocative of adjectives in -ius
In `generateNounForms`, apply the `-ius → -ī` vocative only when the source lexeme is a noun or proper name. Adjectives (`generateAdjectiveForms`) in `-ius` get `-ie` (`pius → pie`). Keep `fīlius → fīlī`. Authority: A&G §49.c. Gold test: `G-LX-006-pie`.

### LX-007 to LX-014 (m) Latin UI strings: direct edits

| ID | File:line | From | To |
|---|---|---|---|
| LX-007 | `app/legacy-runtime.js:406, 438` | `Rēlege` | `Relege` |
| LX-008 | `app/legacy-runtime.js:406, 438, 485, 499, 506, 516`; `app/65-picture-practice.js:74` | `Rectē` | `Rēctē` |
| LX-009 | `app/legacy-runtime.js:304, 382, 561, 792`; `index.html:676` | `Lectiō` (and `lecta` in `Lectiō lecta`) | `Lēctiō` (`Lēctiō lēcta`) |
| LX-010 | `app/legacy-runtime.js:304, 553`; `index.html:678` | `Progressus` | `Prōgressus` |
| LX-011 | `app/legacy-runtime.js:357, 536` | `Verbum electum`; `Elige verbum` | `Verbum ēlēctum`; `Ēlige verbum` |
| LX-012 | `app/legacy-runtime.js:558` | `Musica ex fontibus` | `Mūsica ex fontibus` |
| LX-013 | `index.html:6, 671, 684` | `Prima Via`; `Discere legendo` | `Prīma Via`; `Discere legendō` |
| LX-014 | `app/legacy-runtime.js:442, 492` | `Intellege et responde` | `Intellege et respondē` |

Line numbers are from `1803e55`; search for the string rather than trusting the number. **Check before editing:** `tests/design-integrity.test.cjs`, `tests/phase3a-relocation.test.cjs` and `tests/smoke.test.cjs` may assert some of these exact strings or hash `app/legacy-runtime.js`. If a test asserts the old Latin text, update that assertion in the same commit and say so. Never loosen a test into a no-op. The tab labels may also appear in browser tests (`tests/*browser*.cjs`); grep for each old string across `tests/` first.

`curriculum/vocabulary-budgets-130.json` also uses `Prima Via` in stage labels (planning data). Change it only if the owner wants consistency there; it is not learner-facing.

### LX-015 (m) "Recordātiō incepta"
**Owner decision needed (U-06).** Default if approved without wording: drop the Latin and keep `"Recording started; no scoring."` at `app/legacy-runtime.js:815`. Do not invent Neo-Latin.

### LX-016 (m, draft) Gāiī → Gāī
`docs/pilot/CLAUDE_PILOT_B01_C001_C008.md:572`: `Puer (fīlius Gāiī) canem vocat.` → `Puer (fīlius Gāī) canem vocat.`, then `npm run build:pilot`. Leave the reviewer note that mentions `Gāiī` as the later spelling. The illustration region ID `Gāiī-fīlius` is an internal key and can stay unless the owner asks. Gold test: `G-LX-016-fīlius_Gāiī`.

### LX-017 (m) Cloze alternatives (published)
Owner chooses: **(a)** add answers, or **(b)** sharpen clues. Default (a):
- `legacy-ch05` cloze answers `["emit"]` → `["emit","habet"]`
- `legacy-ch06` cloze answers `["currit"]` → `["currit","est"]`

These live in the locked `guidedCloze` data, so use the errata layer (section 2) and update `clozeDataFnv32`. Gold tests: `G-LX-017-*`.

### LX-018 (m) Short-answer alternatives (published)
Add to each question's accept list (`q[2]`) via the errata layer, keeping the existing entries and order:

| Question | Add |
|---|---|
| legacy-ch02-q002 | `Titus Līviae frāter est` (after LX-001; grading ignores macrons) |
| legacy-ch03-q003 | `legit librum` |
| legacy-ch04-q003 | `māter aquam portat` |
| legacy-ch07-q003 | `sōl hodiē lūcet` |
| legacy-ch08-q003 | `rosās Līvia portābit` |

Do not change `gradeLegacy`. Question prompts must not change, because `question_text` is a saved-state key. Gold tests: `G-LX-018-*`. All `G-PRES-*-rej-*` tests (wrong answers rejected) must still pass.

### LX-019 (m, draft) Picture b01-c007-q008 accepts Līvia
Add `"accept_regions": ["porta","Līvia"]` to the exercise in `curriculum/picture-exercises-b01.json` and keep `answer: "porta"`. Then make `app/65-picture-practice.js` grade against `accept_regions` when present, regenerate `content/picture-exercises.js`, and run `node tests/picture-exercises.test.cjs`. The runner already reads `accept_regions`. Gold test: `G-LX-019-pic`.

### LX-020 (m) TTS respellings
**No change to committed files without the owner.** These are generation inputs for recordings already made. If the owner asks for regeneration, use the canonical macronised text or respell short vowels distinctly (`wih-det`, not `wee-det`) and Gāius as three syllables.

### LX-021 to LX-028 Stylistic (optional, owner choice only)

| ID | Optional change |
|---|---|
| LX-021 | ch04 explain: "The ending -t marks 'he, she or it' (third person singular), as in edit, bibit, venit." (via errata, locked) |
| LX-022 | `vīlla` gloss "country house" (locked vocab; errata) |
| LX-024 | pilot c008 margin: remove `duae fenestrae` / `plūrēs` |
| LX-025 | `index.html:680` `I · Hortus` → `I · In hortō` |
| others | leave |

## 4. Suggested PR batches

1. **UI macrons:** LX-007 to LX-014 (low risk, direct edits).
2. **Paradigm engine:** LX-003 to LX-006 (not learner-facing; fixtures and samples regenerate).
3. **Pilot drafts:** LX-002, LX-016, LX-019, plus the pilot and picture parts of LX-001.
4. **Published legacy text:** the errata layer plus LX-001 (legacy, narration, glossary), LX-017 and LX-018. Highest risk; do it last and alone.

## 5. Tests to run before every push

```
npm test
npm run test:phase2
npm run test:pilot
npm run test:illustrations
npm run test:art
npm run test:paradigms
npm run test:grammar
node scripts/run-latin-gold-tests.cjs
```

- Preservation tests (110) must stay green. A preserve failure means you changed something that was correct: revert it.
- Each correction test for an approved finding must turn from PENDING to pass.
- After the last batch, wire the gold runner into `npm test` (append `&& node scripts/run-latin-gold-tests.cjs`) and change the runner to fail on pending correction tests for approved findings, or move fully-applied tests from `phase: "correction"` to `phase: "preserve"`.
- Browser suites if available: `npm run test:browser`, `npm run test:file`.

## 6. Do not fix (verified correct, or unresolved)

- `Hic est hortus.` (pronoun *hic*, unmarked): correct (A&G §146 Note 1).
- `herī`: correct (A&G §427).
- `edit` (present, "eats"): correct; never write `ēdit`.
- `Mārcus`, `Gāius`, `Līvia`, `Flāvia`, `hodiē`, `mālum`, `mercātor/mercātōrēs`: correct.
- `Gāī` (genitive) in pilot readings: correct.
- `Verbum dēest` (U-03), `Pecūnia est pretium` (U-04), Gāius audio (U-05), the Tablinum brand (LX-028): owner decision.
- All audio files and `owner_listening` statuses.

## 7. Report back

For each batch, report: findings applied (IDs), files changed, lock hashes changed (old → new), test output (pass/fail counts, including the gold runner's preserve and correction counts), and anything skipped and why.
