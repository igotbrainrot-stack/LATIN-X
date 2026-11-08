# Tablinum (LATIN X): implementation roadmap

**Author:** Claude, 5 November 2026. **Audience:** GPT or another coding AI finishing the project, plus the project owner.
**Package reviewed:** `Latin-X-feature-legacy-lexeme-audit-20261105.zip` (branch `feature/legacy-lexeme-audit-20261105`).
**Status of this document:** a plan only. Nothing in the repository was changed while writing it.

> **Owner instructions (5 November 2026). These override anything below that conflicts.**
> 1. **Windows is the target platform.** Program, test and package everything to run on Windows 10 and 11 (§0 rule 3, §4.3).
> 2. **Use the Bewick's Aesop EPUB that the owner supplied** (`Bewicks Select Fables of Æsop…epub`), under the conditions in §9.5.
> 3. **GPT starts work immediately.** Begin with the first coding task in §12 without waiting for further approval, and work through the phases in order.
> 4. **Do every phase in two passes** (§12.1). Pass 1 implements; pass 2 re-reviews, re-tests and fixes. A phase is handed back only after pass 2.

> **Note on the requested starting file.** The request asked me to begin with `CLAUDE_REMAINING_WORK_HANDOVER.md`. That file is **not in the package**. I used the handovers that are present instead: `CLAUDE_REVIEW_START_HERE.md`, `README.md`, `curriculum/lexicon/LEXEME_AUDIT_HANDOVER.md`, `curriculum/CLAUDE_HANDOVER_130.md`, `docs/CLAUDE_HANDOVER.md`, `curriculum/reviews/*` and `curriculum/CLAUDE_REVIEW_RESPONSE_V3.md`. If the missing file contains decisions not reflected here, reconcile them before Phase 1.

---

## 0. Ground rules for whoever implements this

These rules apply to every phase. A phase that breaks one of them is not done.

1. **Do not rebuild what works.** The v0.4.2 manuscript app in `index.html` already has these and they stay:
   - the reader and hint ladder;
   - the exercises and cloze;
   - the basic review deck;
   - text import;
   - audio attachment and timing;
   - backup and restore;
   - the visual design.

   Extend them. Replace one only where this roadmap says so and gives the reason.
2. **Saved progress is sacred.**
   - Never delete or rewrite the v4 localStorage key `tablinum-source-review-v02`.
   - Never change the meaning of an existing key.
   - Every migration is additive, idempotent, tested against fixtures, and reversible by restoring a backup.
3. **Built for Windows, and offline launch stays a double-click.** Windows 10 and 11 are the target platform (§4.3). Opening `index.html` from a folder in Edge, Chrome or Firefox must work with no server, no install and no internet connection.
   - Never use `fetch()`/XHR for local files.
   - Never use ES modules (`type="module"`), because both fail on `file://`.
   - Use classic `<script src>` files only.
4. **Planned is not taught.** `vocabulary-budgets-130.json` holds allocations. A word counts as introduced only when the compiler derives it from an approved, token-tagged lesson. The strict gates `--require-introduced-1500/3000` stay red until that is true. Never edit the ledger by hand.
5. **No Familia Romana material.** Do not copy its text, characters, chapter plots, illustrations, audio, exercise wording or marginal notes. "Inspired by the natural method" means using the method: Latin-first reading, inference from context and pictures, and marginal Latin glosses. It does not mean the book's content.
6. **No merges, releases or tags on GitHub** unless the owner explicitly asks. Work on feature branches and hand back ZIPs, as now.
7. **Honest labels.** Device TTS is "unverified voice". Automatic alignment is "auto-aligned" until a human listens. No pronunciation score is shown unless a validated method exists, and offline none does.

---

## 1. Executive summary

Tablinum is a working **8-chapter** offline reader with a mature planning layer. That layer has three parts:

- a corrected 130-chapter curriculum in v3;
- vocabulary budgets of 500 / 1,532 / 3,036 planned new words by chapters 50 / 90 / 130;
- a first lexical audit of the existing lessons, with stable legacy IDs.

**What is missing is everything between the plan and a playable course.** That means five things:

1. A **reviewed lexeme registry**, with one entry per real, sense-disambiguated lemma.
2. A **lesson content format** with per-token lexeme tags, plus a **compiler** that checks the Latin against the registry and the grammar sequence, then derives the ledger.
3. A **runtime that loads content from separate files on `file://`**, with **stable chapter, sentence and question IDs** and a **v4→v5 progress migration**.
4. **Exercise, review, listening and speaking features** driven by that tagged content.
5. The **content itself**: about 164,000–241,000 words of original Latin across 130 chapters, with human review, recordings and illustrations.

**Dependency order:**

1. Phase 0: safety net.
2. Phase 1: registry.
3. Phase 2: content format and compiler.
4. Phase 3: runtime loader and migration.
5. Phase 4: pilot chapters 6–8 end to end.
6. Phases 5–8: exercises, spaced review, audio and speaking, art. These can partly run in parallel.
7. Phases 9–11: produce Books I, II and III.
8. Phase 12: final assessment and handover.

The pilot in Phase 4 is the real go/no-go point. It measures how long one chapter takes to author, review, record and illustrate. Plan Books I–III only from those measured numbers.

**The first coding task is in §12.** It is a test-only safety net: v4 progress fixtures, backup-compatibility tests, and a real `file://` browser test. It does not touch `index.html`.

---

## 2. What exists today

Evidence comes from reading the package files. I parsed the JSON with Python. I did **not** run the project's Node scripts or tests in this review, so the pass claims below are the project's own and are not reproduced here.

### 2.1 Implemented and working (keep)

| Area | Where | Detail |
|---|---|---|
| Single-file app | `index.html` (1,170 lines, 72 KB) | Vanilla HTML/CSS/JS, no dependencies. Opens from disk. |
| Lessons | `const L=[…]` at line 666 | 8 chapters, 67 sentences, 24 questions (each chapter has 3). Chapter shape: `{name, sub, scene, context, explain, sent:[[la,en]], q:[[prompt, options or null, answer or answers[], model]], v:[[head, meaning, "forms"]]}`. |
| Glossary | `const shared` (line 701) plus each chapter's `v`, merged into `dict` | Lookup is by surface form with macrons removed; the **first match wins**. |
| Reader | `reader()` | Latin-first. Hint ladder per sentence: 0 none → 1 previous sentence or context (Latin) → 2 up to 4 word glosses → 3 English. Guidance can be switched off. Arrow-key navigation works. |
| Exercises | `quiz()`, `answer()`, `correctAnswer()` | Multiple choice plus written answers with explicit accepted variants. Normalisation removes macrons and case. No substring matching. |
| Cloze | `guidedCloze` (8 items, one per chapter) | Answers are stored by chapter index. |
| Review deck | `review()`, `rating()` | Basic scheduler (again = 1 minute, hard ×1.2, good ×2.2, easy ×3.2). Cards are keyed by the **normalised head** (`norm(w.head)`). |
| Text import | Library tab | Imports `.txt` (up to 1 MB, kept to 20,000 characters). Sentence splits can be edited. Imported text gets no grading. |
| Audio | `mediaByChapter` Map, `validateRanges`, boundary monitor | Attach MP3/WAV plus timing JSON per chapter; one-sentence playback. **Audio lives in memory only and is lost on reload.** |
| Browser voice | `speak()`, `availableVoice()` | Uses speechSynthesis, labelled as unverified. |
| State | key `tablinum-source-review-v02`, `base.version=4`, `normalizeState()` | Every field is validated. Progress keys are the chapter index (`"0"`) and `"chapter:item"` (`"0:2"`). |
| Backup | Export `{app:"tablinum",version:4,state}`; restore accepts `tablinum` and `tablinum-v02` | Restore validates through `normalizeState`. |
| Design | `<style>` manuscript theme; illustrations drawn by `scene()` | Colours come from tokens, there are no remote assets, and the SVG colours are preserved. |
| Test hook | `window.TablinumAudit` (line 1163) | Exposes internals to the tests that mock a browser. |
| Tests | `tests/smoke.test.cjs`, `tests/design-integrity.test.cjs`, `tests/browser-smoke.cjs`, `tests/legacy-lexeme-audit.test.cjs` | Node tests with a mocked DOM, a JS fingerprint lock, Playwright over **http**, and the audit snapshot test. |
| CI | `.github/workflows/*.yml` (4 files) | Node 22: `npm test`, curriculum validators, a check that the strict gate stays red, and Playwright in a separate job. |

### 2.2 Planning and curriculum assets (complete as plans)

| Asset | State |
|---|---|
| `curriculum/vocabulary-budgets-130.json` | 130 chapters (102 teaching, 28 review). Each has title, story, grammar focus, communication task, seed words, budget, running-token range, segment count and v3 pronoun fields. Cumulative 500 / 1,532 / 3,036. |
| `curriculum/CURRICULUM_130_MASTER_PLAN.md` | Prose plan, skill loop, checkpoints at chapters 25 / 50 / 75 / 90 / 110 / 130, counting rules. |
| `curriculum/vocabulary-introductions-130.json` | Ledger with a schema and **zero entries**, as intended. |
| `curriculum/validate-roadmap-130.cjs` | Structural checks plus strict gates that load `lessons/*.json` and check that each word appears tagged in its introduction sentence. |
| `curriculum/dcc-seed-audit-50.json`, `dcc-seed-audit.json` | Seed words from the DCC core list for Book I. |
| `curriculum/lexicon/legacy-token-audit.json` | 255 tokens, 48 proper-name tokens, 198 single matches, 9 ambiguous, 0 unresolved, 128 glossary candidates (124 not proper names). All tokens have `lexeme_id:null` and `reviewer_approved:false`. |
| `curriculum/lexicon/legacy-id-map.json` | `legacy-ch01..08`, sentence and question IDs, old storage keys, and FNV fingerprints of each chapter's sentences. Status `unmapped_do_not_guess`. |
| `scripts/build-legacy-lexeme-audit.cjs` | Deterministic generator with a `--check` mode. |
| `docs/RESOURCE_INVENTORY.md` | 52 uploaded resources, classified. None is integrated. |

### 2.3 Incomplete (started, not finished)

| Item | What's missing |
|---|---|
| Lexical audit | Only covers the **sentences**. Not covered: questions, options, model answers, `context`, cloze text and clues, which learners also read. Candidate IDs hash the English gloss (see §3, W3). Inflected forms are treated as heads. No reviewed lemma exists yet. |
| Stable IDs | Exist only as an external snapshot. The app still uses numeric keys, and the ID map has **no mapping for saved vocabulary keys** (`S.vocab` keyed by normalised head). |
| Grammar sequencing | Exists only as prose (`grammar_focus`). There is no machine-readable feature list and no check that a lesson avoids grammar not yet taught. |
| Speaking | Listed only as `communication_task` text. There is no recording, prompt or rubric feature. |
| Spaced review | A basic scheduler, labelled "not FSRS". `ts-fsrs` was uploaded but is not integrated. |
| Browser testing | Playwright runs against an **http** server, not `file://`, so the Windows double-click path is untested. |

### 2.4 Not started

These have not been started:

- the reviewed lexeme registry;
- the lesson JSON format and compiler;
- the derived ledger;
- the runtime content loader;
- state v5 and migration;
- new course chapters;
- the extended exercise engine;
- per-lexeme exposure tracking;
- FSRS;
- persistent audio storage;
- human recordings and timing alignment;
- speaking practice;
- the illustration pipeline for new chapters;
- checkpoint assessments;
- Book III reading-bridge material.

---

## 3. Weaknesses and missing requirements, with fixes

Severity: **P0** blocks scaling or risks data loss · **P1** gives wrong results if left · **P2** quality and maintainability · **P3** polish.

| # | Sev | Weakness | Evidence | Fix (phase) |
|---|---|---|---|---|
| W1 | **P0** | `normalizeState` caps maps, and the caps break at 130 chapters. `notes`, `clozeAnswers`, `clozeCorrect` and `readingConfidence` keep only **100** entries. `hintLevels`, `answers` and `correct` keep **2,500**. Entries beyond the cap are **silently dropped on the next load**. | `safeMap(…,100)` calls in `normalizeState`. At about 100 sentences per chapter, 130 chapters gives about 13,000 hint keys. | State v5 (Phase 3) stores per-chapter objects. Caps are by size in bytes, with a warning, never silent truncation. |
| W2 | **P0** | Lesson content is inline in `index.html`. 130 chapters with token tags (estimated 15–30 MB) cannot live in one inline script, and `fetch()` fails on `file://`. | Architecture. | Per-chapter classic script files that register themselves, loaded on demand with an injected `<script>` tag (Phase 3, §4.2). |
| W3 | P1 | Audit candidate IDs are `slug(head)+fnv32(gloss)`. Editing an English gloss **changes the ID**. The same word with two glosses becomes two candidates (`ad` "towards" against `ad` "to, toward"). | `register()` in `build-legacy-lexeme-audit.cjs`. | The registry IDs in Phase 1 are assigned once and never derived from text. Candidates map to registry IDs through a reviewed table. |
| W4 | P1 | Glossary heads are often inflected forms or infinitives rather than lemmas. Examples: `habet`/`habēmus`/`habēre`, `laetī`/`laetus`, `omnēs`/`omnis`, `legēbat`, `spectābat`, `timēbat`, `dīxit`, `portābit`, `cēnābimus`, `ībimus`, `sonuit`, `parentēs`, `grātiās`, `tibi`, `haec`/`hic`, `sē`. The 124 candidates will shrink to roughly 95–105 lemmas. | `legacy-token-audit.json` `glossary_candidates`. | Phase 1 review sheet. Lemma convention: verbs are listed under the 1st person singular present (`habeō`) with principal parts; nouns under the nominative singular with the genitive; adjectives under the masculine nominative. |
| W5 | P1 | The audit tokenises only `sent`. Questions, options, `context`, cloze `text/clue/proof` and model answers are learner-facing Latin too, and are unchecked. | Generator loops over `ch.sent` only. | Phase 1: add `context`, `q`, `guidedCloze` token streams, flagged with `stream:"exercise"` so that they don't count as introductions. |
| W6 | P1 | The ledger is hand-written and the strict gate only checks that the word appears in its introduction sentence. It does not check that the chapter really is the **first** occurrence, or that the word **recurs** later. | `validate-roadmap-130.cjs` lines 59–83. | Phase 2: the compiler **derives** `vocabulary-introductions-130.json` from tagged lessons, plus recurrence checks (§7.4). The gate validates the derived file and its hash. |
| W7 | P1 | Sentence and question IDs are **positional**, frozen to a snapshot. Inserting one sentence shifts every later ID. | `id_policy` "one-based ordinal frozen to this snapshot". | From Phase 2, every sentence, question and exercise carries an **explicit `id` field stored in the content**. IDs are never recomputed from position. |
| W8 | P1 | Saved vocabulary keys (`norm(head)`, e.g. `habet`, `habere`) have no migration mapping. When heads become lemmas, saved cards would point at nothing. | `S.vocab` key creation in the click handler; not in `legacy-id-map.json`. | Phase 1 adds a reviewed `legacy-vocab-map.json` (old key → lexeme_id). Phase 3 migration keeps unmapped cards as legacy cards. |
| W9 | P1 | `design-integrity.test.cjs` locks the **whole JS** to fingerprint `e3aa2876`. Any code change fails it, which pushes people to "just update the hash" and so loses its protection. | Test file. | Phase 0: add a **lesson-content lock** (the legacy chapter fingerprints from the ID map) that must never change. Phase 3 retires the whole-JS hash with a written reason in the PR, keeping the CSS-token assertions. |
| W10 | P1 | The Windows offline path (`file://`) is never tested. Playwright serves over http. | `tests/browser-smoke.cjs`. | Phase 0: add `tests/file-url-smoke.cjs` that opens `file:///…/index.html`. |
| W11 | P1 | No machine-readable grammar sequence, so a lesson can silently use the subjunctive in chapter 12. | Only prose in `grammar_focus`. | Phase 2: `curriculum/grammar-features.json` plus a compiler check (§7.5). |
| W12 | P2 | Attached audio is lost on reload. | `mediaByChapter` is an in-memory Map with object URLs. | Phase 7: shipped audio as relative files; user audio in IndexedDB with a fallback to re-attaching. |
| W13 | P2 | Two sources of truth: chapter titles and focus live in both the JSON and the master-plan Markdown. | Both files. | Phase 2: generate the outline table in the Markdown from the JSON (`scripts/render-plan.cjs`) and check it in CI. |
| W14 | P2 | Book III averages **47 new words per teaching chapter**. Retention depends on recurrence that no tool measures yet. | Budgets JSON. | Phase 2 recurrence report. Phase 11 may rebalance budgets using pilot data. |
| W15 | P2 | Human review capacity is unplanned. About 200,000 words of Latin needs an estimated 100–200 reviewer hours and 30–40 hours of finished audio. | §8 estimates. | Plan from the Phase 4 measurements. For personal use, the owner may accept a "GPT-drafted, spot-checked" tier, which must then be **labelled** as such in the app. |
| W16 | P2 | Offline Latin speech recognition does not exist, so a promise of "speaking practice" can't mean automatic scoring. | Platform reality: Web Speech recognition is online-only and has no Latin. | Phase 7: record, compare and self-rate, plus shadowing and retelling (§8.4). |
| W17 | P2 | Licensing. One uploaded EPUB came from Z-Library. The owner has decided to use it (§9.5). The provenance of "Latin AUDIO part_0" and `metadata.csv` is unknown. CC BY-SA sources (DCC, Perseus) require attribution and share-alike if redistributed. If the GitHub repo is **public**, anything committed counts as redistributed. | `docs/RESOURCE_INVENTORY.md` rows 21–24, 40. | Phase 1 licence register (§9.4). Use the Bewick EPUB under §9.5. Never commit unverified audio. |
| W18 | P2 | Browser storage behaviour on `file://` differs between browsers. Progress can appear "lost" if the folder moves, or if the user switches browser or profile. | Platform. | Phase 3: on-screen backup reminders, an "export now" prompt after milestones, and a manual test of moving the folder (§10.3). |
| W19 | P3 | The 8 legacy chapters (about 32 tokens each) are far shorter than the planned 250–450. Their relation to new chapters 1–10 is undefined. | Audit stats. | Keep them as a **"Prima Via (archive)"** shelf. New course chapters get a different namespace (`b01-c001`). Never map one onto the other automatically. |
| W20 | P3 | The requested `CLAUDE_REMAINING_WORK_HANDOVER.md` is missing from the package. | File listing. | Add it, or point `CLAUDE_REVIEW_START_HERE.md` at this roadmap. |

---

## 4. Target architecture

### 4.1 Folder layout (final)

```
index.html                  ← shell: markup, CSS, ordered <script src> tags. Still double-click to open.
app/                        ← classic scripts, no modules; each attaches to window.Tablinum
  00-namespace.js           ← window.Tablinum = {version, registerChapter, …}
  10-util.js                ← norm, esc, spell, hashing
  20-state.js               ← v5 schema, normalizeState5, save/load, quota handling
  25-migrate.js             ← v2/v4 → v5 (pure functions, unit-tested in Node)
  30-content-loader.js      ← script-injection loader, chapter catalogue
  40-reader.js              ← existing reader logic, moved, behaviour unchanged
  50-exercises.js           ← existing quiz + new exercise types (Phase 5)
  60-review.js              ← deck: legacy scheduler → FSRS (Phase 6)
  70-audio.js               ← existing audio + IndexedDB persistence (Phase 7)
  75-speaking.js            ← MediaRecorder practice (Phase 7)
  80-progress.js            ← progress, backup/restore v5
  90-main.js                ← event wiring, render
vendor/
  ts-fsrs.umd.js            ← vendored, version pinned, LICENSE alongside
content/
  catalogue.js              ← Tablinum.registerCatalogue([...all chapters: id, title, book, file, hash])
  legacy/ch01.js … ch08.js  ← the 8 existing lessons, byte-equivalent data (Phase 3)
  b01/c001.js …             ← compiled new-course chapters (generated, committed)
  lexicon.js                ← compiled runtime lexicon (id → head, gloss, pos, forms) (generated)
audio/  b01/c006.mp3 …      ← shipped recordings (relative paths work on file://)
img/    b01/c006-1.webp …   ← illustrations; SVG scene() remains the fallback
lessons/                    ← AUTHORING SOURCE (JSON), never loaded by the browser
  b01/c006.json …
curriculum/                 ← plans, budgets, grammar-features.json, derived ledger, reports
  lexicon/lexemes.json      ← REVIEWED registry (source of truth for lexeme IDs)
  lexicon/legacy-*.json     ← existing audit + ID map + new vocab map
scripts/                    ← Node 22, dependency-free build and check tools
tools/annotate/             ← Python authoring helpers (LatinCy etc.), never shipped
tests/                      ← Node unit tests, fixtures, Playwright (http + file://)
```

Why multiple files rather than one HTML file:

- A 130-chapter course with token tags is too large for one inline script.
- `<script src>` from a relative path works on `file://` in Edge, Chrome and Firefox.
- Distribution becomes "unzip the folder, double-click `index.html`".

**Windows:** the folder layout is the Windows deliverable (see §4.3). **Optional:** `scripts/build-single-file.cjs` can inline `app/`, `vendor/` and the **legacy** content into `dist/Tablinum-portable.html`, for anyone who wants one file for the 8 legacy chapters only.

### 4.2 Loading content on `file://`

```js
// app/30-content-loader.js
Tablinum._pending = new Map();
Tablinum.registerChapter = function (data) {           // called by content/b01/c006.js
  const p = Tablinum._pending.get(data.id);
  Tablinum.chapters.set(data.id, Object.freeze(data));
  if (p) { p.resolve(data); Tablinum._pending.delete(data.id); }
};
Tablinum.loadChapter = function (id) {
  if (Tablinum.chapters.has(id)) return Promise.resolve(Tablinum.chapters.get(id));
  const entry = Tablinum.catalogue.get(id);
  if (!entry) return Promise.reject(Error("Unknown chapter " + id));
  return new Promise((resolve, reject) => {
    Tablinum._pending.set(id, { resolve, reject });
    const s = document.createElement("script");
    s.src = entry.file;                   // e.g. "content/b01/c006.js" (relative)
    s.onerror = () => { Tablinum._pending.delete(id); reject(Error("Missing content file " + entry.file)); };
    document.head.appendChild(s);
  });
};
```

Each content file is **one statement**: `Tablinum.registerChapter({...});`. It contains data only, never logic.

`catalogue.js` lists every chapter's `id`, `file`, title, book, `review` flag and a `contentHash`. The hash lets the app detect that a chapter changed after the learner's progress was recorded (§5.5).

The loader shows a clear error if a file is missing, for example when the user unzipped only part of the folder. Rendering waits for `loadChapter`. The reader shows a "Legō…" placeholder for at most one frame on local disk.

### 4.3 Windows platform requirements

The app is programmed and tested for **Windows 10 and 11**, in Edge, Chrome and Firefox. Edge is the reference browser because every Windows PC has it.

- **Launch:** the user unzips `Tablinum\` anywhere, such as Documents or Desktop, and double-clicks `index.html`. Also ship `Start Tablinum.cmd` containing `start "" "%~dp0index.html"`, so the app opens in the default browser even when `.html` files are set to open in an editor.
- **Paths:** every content, audio and image reference is a **relative URL with forward slashes** (`content/b01/c006.js`). Never use absolute paths or backslashes inside the app. File and folder names must be lower-case ASCII with no spaces, so they survive ZIP tools, OneDrive sync and case-insensitive NTFS without collisions.
- **Long paths:** keep any path inside the folder under 100 characters, so the whole path stays under Windows' 260-character limit even when unzipped deep inside a OneDrive folder.
- **Line endings and encoding:** text files are UTF-8 without a BOM. Add `.gitattributes` with `* text=auto eol=lf` and `*.cmd text eol=crlf`. All generated files are byte-identical on Windows and Linux, so `--check` modes pass on both.
- **Build tools on Windows:** every Node script must run in PowerShell and `cmd` as well as bash. Use `path.join`, never hard-coded `/`, in Node file-system code. Write npm scripts without shell-only syntax (no `&&` chains that need bash features, no `rm -rf`, no env-var prefixes). Python authoring tools must run on Windows Python 3.10+.
- **CI:** add a `windows-latest` job to the GitHub Actions workflows that runs `npm test`, the `--check` modes, and the `file://` Playwright test in Edge (`channel: "msedge"`) and Chromium.
- **Audio and microphone:** MP3 playback and `getUserMedia` recording must be tested in Edge on Windows. The recording format differs by browser (typically Ogg/Opus in Firefox, WebM/Opus in Edge and Chrome), so store whichever MIME type `MediaRecorder` reports.
- **Storage:** localStorage and IndexedDB behaviour on `file://` must be checked per browser on Windows (§10.3). Backup files download to the user's Downloads folder; the restore dialog must accept them from there.
- **Fonts:** keep the system serif stack (Georgia, Palatino Linotype, Book Antiqua, Times New Roman). These are present on Windows. Check that macron vowels (ā ē ī ō ū ȳ) render in each font on Windows.

### 4.4 Data schemas

All schemas below are implemented as **dependency-free validator functions** in `scripts/lib/schema.cjs`, in the project's style. JSON Schema files are optional documentation.

#### 4.4.1 Lexeme registry: `curriculum/lexicon/lexemes.json`

```json
{
  "schema": "tablinum-lexemes-v1",
  "conventions": {"verb_head": "1sg present active (deponent: 1sg present passive)", "macrons": "long vowels marked; hidden quantity per reviewer note"},
  "lexemes": [
    {
      "id": "lx-habeo-have",                    // assigned ONCE; kebab, ascii; sense suffix; never derived from glosses later
      "head": "habeō",
      "principal_parts": "habeō, habēre, habuī, habitum",
      "pos": "verb",                            // noun|verb|adj|adv|pron|prep|conj|interj|num|particle|proper_name
      "conjugation": 2,                         // or declension/gender for nouns, pattern for adjectives
      "gender": null,
      "senses": [{"sense_id": "have", "gloss_en": "to have, hold", "gloss_la": "tenēre"}],
      "forms_policy": "regular",                // regular|irregular (irregular → explicit forms list)
      "forms": [],                              // only for irregular/defective; regular forms generated & reviewed (§7.9)
      "homograph_of": [],                       // e.g. lx-edo-eat ↔ lx-edo-put-forth
      "frequency": {"dcc_rank": 61, "source": "DCC Latin Core (CC BY-SA 3.0)"},
      "sources": ["dcc-core-2014", "whitaker-0.8.0"],
      "macron_authority": "Lewis & Short via Perseus (CC BY-SA)",
      "status": "approved",                     // candidate|in_review|approved|rejected
      "reviewed_by": "R1", "reviewed_at": "2026-11-20",
      "notes": ""
    }
  ]
}
```

Rules:

- IDs are immutable. Renaming a head does **not** change the ID.
- A homograph gets its own ID, for example `lx-edo-eat` and `lx-edo-put-forth`.
- `cum` is two lexemes: the preposition (`lx-cum-prep`) and the conjunction (`lx-cum-conj`).
- `quī` (relative) and `quis` (interrogative) are separate.
- `is`, `hic` and `ille` are one lexeme each, covering all their forms.
- `sē` and `suus` are separate lexemes.
- Proper names stay in the registry (they need forms and glosses) with `pos:"proper_name"`. They never count towards the milestones.

#### 4.4.2 Grammar features: `curriculum/grammar-features.json`

```json
{"schema":"tablinum-grammar-v1","features":[
  {"id":"n.acc.sg","label":"accusative singular","introduced_in":"b01-c003","detect":{"Case":"Acc","Number":"Sing"}},
  {"id":"v.subj.pres","label":"present subjunctive","introduced_in":"b01-c050","detect":{"Mood":"Sub","Tense":"Pres"}},
  {"id":"syn.abl-abs","label":"ablative absolute","introduced_in":"b02-c073","detect":"manual"},
  {"id":"pron.is","label":"is/ea/id","introduced_in":"b01-c020","detect":{"lexeme":"lx-is-pron"}}
]}
```

Build it once from `grammar_focus` in the budgets JSON. There are roughly 120–160 features. `detect` uses Universal Dependencies morphological features, which LatinCy outputs and a reviewer confirms. Syntax features that taggers can't detect reliably, such as the ablative absolute, `cum` + subjunctive, or indirect statement, are tagged by hand at the clause level.

#### 4.4.3 Lesson source: `lessons/b01/c006.json` (authoring format)

```json
{
  "schema": "tablinum-lesson-v1",
  "id": "b01-c006", "chapter": 6, "book": 1, "review": false,
  "title": "Forum", "subtitle_la": "Mārcus et Līvia in forō",
  "status": "draft|latin_reviewed|audio_ready|approved",
  "review": {"latin": {"by": "R1", "at": null}, "pedagogy": {"by": null, "at": null}},
  "budget_ref": "curriculum/vocabulary-budgets-130.json#6",
  "new_lexemes_declared": ["lx-forum-market", "lx-duo-two", "..."],
  "grammar_new": ["n.neut.pl.nom-acc"],
  "segments": [
    {"id": "b01-c006-l1", "title_la": "Lēctiō I", "image": "img/b01/c006-1.webp",
     "sentences": [
       {"id": "b01-c006-s001", "text_la": "Forum magnum est.", "en": "The forum is large.",
        "tokens": [
          {"t": "Forum", "lx": "lx-forum-market", "morph": "Case=Nom|Gender=Neut|Number=Sing"},
          {"t": "magnum", "lx": "lx-magnus-big", "morph": "Case=Nom|Gender=Neut|Number=Sing"},
          {"t": "est", "lx": "lx-sum-be", "morph": "Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act"}
        ],
        "margin": [{"token": 0, "type": "picture", "ref": "img/b01/c006-1.webp#forum"}],
        "features": [], "audio": {"file": "audio/b01/c006.mp3", "start": null, "end": null}}
     ]}
  ],
  "marginalia": [{"sentence": "b01-c006-s004", "token": 2, "la": "duo = I + I", "kind": "equation"}],
  "exercises": [ /* §8 types; each has an explicit id "b01-c006-q001" */ ],
  "speaking": [ /* prompts; ids b01-c006-sp001 */ ],
  "notes_for_reviewer": ""
}
```

`t` is the exact surface form, including macrons and capitals. Punctuation lives in `text_la` only. The compiler checks that the tokens, joined in order, reproduce the words of `text_la`.

#### 4.4.4 Compiled runtime chapter: `content/b01/c006.js`

This is a compact form of the source above. Tokens become `[surface, lexemeIndex, featureBitset]` arrays, and the English is kept only for hint level 3. A `contentHash` (SHA-256 of the canonical source JSON) is embedded and also stored in `catalogue.js`.

#### 4.4.5 Derived ledger: `curriculum/vocabulary-introductions-130.json`

The compiler writes this file. Each entry follows the existing `expected_entry_schema`, plus:

- `occurrences_in_chapter`;
- `occurrences_next_3_chapters`;
- `first_review_chapter_occurrence`;
- `derived_from_hash`.

`validate-roadmap-130.cjs` stays the gate. It additionally checks that the file's `generated_by` and `derived_from_hash` match a fresh compile, so a hand edit fails.

#### 4.4.6 State v5 (localStorage key `tablinum-state-v5`)

```js
{
  schema: 5,
  migratedFrom: {version: 4, at: "2026-…", sourceKey: "tablinum-source-review-v02", sourceHash: "fnv32"},
  ui: {chapterId: "legacy-ch01" | "b01-c006" | "custom", tab: "read", sel: "b01-c006-s001", macrons: true, guided: true, singleSentence: false},
  chapters: {           // keyed by stable chapter id
    "legacy-ch01": {notes: "", readingConfidence: "developing", cloze: {answer: "", correct: false}, hints: {"legacy-ch01-s001": 2}, contentHash: "…", lastOpened: 0}
  },
  questions: {"legacy-ch01-q001": {answer: "in hortō", correct: true, attempts: 2, at: 0}},
  deck: {
    cards: {"lx-habeo-have:recog": {lexeme: "lx-habeo-have", dir: "recog", fsrs: {/* ts-fsrs Card */}, legacyKey: "habet"}},
    legacyCards: {"xyz": {head, meaning, days, due, reps}},   // unmapped v4 cards, still reviewable
    log: []                                                    // capped ring buffer (e.g. last 2,000 reviews)
  },
  exposure: {"lx-habeo-have": {seen: 14, firstSeen: 0, lastSeen: 0}},   // reading encounters (Phase 6)
  speaking: {"b01-c006-sp001": {selfRating: 2, recordedAt: 0, recordingId: "idb:…"}},
  custom: {text: "", sentences: [], hints: {}},
  settings: {backupReminderDays: 14, lastBackupAt: 0}
}
```

### 4.5 Tooling and dependencies

| Purpose | Choice | Shipped? | Notes |
|---|---|---|---|
| Build, compile, validate | Node 22, **no npm runtime dependencies** | No | Matches the current CI. |
| Browser tests | `playwright` (dev only, already used) | No | Add `file://` runs. |
| Spaced repetition | `ts-fsrs` 6.0.0 (uploaded; MIT, verify LICENSE) | Yes, vendored | Use its UMD/IIFE build if the package has one. Otherwise bundle once with `esbuild --format=iife --global-name=FSRS` and commit the output with its version and hash. |
| Lemmatising and tagging (authoring only) | LatinCy `la_core_web_lg` 3.9.8 (uploaded wheel) via spaCy, in `tools/annotate/` (Python 3.10+) | No | Proposes `lx` and `morph`. A human confirms. |
| Morphology cross-check | Whitaker's Words 0.8.0 (uploaded) | No | Flags disagreements with LatinCy for review. |
| Macrons | Lewis & Short (Perseus `lexica`, CC BY-SA) as the authority. `latin-macronizer` as an optional proposer. | No | The macronizer needs extra components (tagger plus Morpheus). Treat it as optional. |
| Frequency | DCC Latin Core (`latin-core-list.csv`, 997 rows, CC BY-SA 3.0) | Data in registry | Attribution goes in `ATTRIBUTION.md`. |
| Forced alignment | `aeneas` 1.7.3 (uploaded) with eSpeak-NG's Latin voice | No | Generates sentence intervals that a human then verifies. |
| Waveform check UI (optional) | `wavesurfer.js` 8.0.5 (uploaded, BSD-3) | Only in an optional authoring page | Not needed in the learner app. |

---

## 5. Progress preservation and migration

### 5.1 Principles

1. **Never touch the v4 key.** Migration reads `tablinum-source-review-v02` and writes `tablinum-state-v5`. The v4 key stays exactly as it was, so the user can roll back to v0.4.2 by opening the old `index.html`.
2. **Migrate once, idempotently.**
   - If the v5 key exists, do not migrate again.
   - If v5 is unreadable, show the problem and offer "re-migrate from v4" or "restore a backup". Never silently overwrite anything.
3. **Freeze a copy.** Write the raw v4 JSON string to `tablinum-v4-snapshot` (only if absent) before the first v5 write.
4. **Auto-export suggestion.** On first v5 launch, show a banner: "Your progress was upgraded. Export a backup now?"
5. **Keep pure functions apart.** `migrate.js` exports pure `migrateV4toV5(v4State, idMap, vocabMap) → v5State`, tested in Node with fixtures.

### 5.2 Mapping rules (v4 → v5)

| v4 field | v5 destination | Rule |
|---|---|---|
| `ch` (0–7 or `"custom"`) | `ui.chapterId` | `legacy-ch0{n+1}` or `"custom"`. |
| `sel` (integer) | `ui.sel` | Sentence ID at that index in the current chapter. |
| `notes["n"]`, `readingConfidence["n"]`, `clozeAnswers["n"]`, `clozeCorrect["n"]` | `chapters["legacy-ch0{n+1}"].…` | Direct. |
| `hintLevels["n:j"]` | `chapters[legacy-ch].hints[legacy-chXX-s{j+1}]` | Use the ID map. |
| `hintLevels["custom:j"]` | `custom.hints[j]` | Never mapped onto a course chapter. |
| `answers["n:j"]`, `correct["n:j"]` | `questions["legacy-chXX-q{j+1}"]` | Direct. `attempts` is unknown; set to 1 if an answer exists. |
| `vocab[key]` | `deck.cards[lexeme:recog]` if `legacy-vocab-map.json` maps the key, else `deck.legacyCards[key]` | Convert `{days, due, reps}` to an FSRS card: state `Review`, stability = `days`, difficulty 5 (default), `due` preserved, `reps` preserved. |
| `custom`, `customSentences` | `custom.text`, `custom.sentences` | Direct. |
| `macrons`, `guided`, `singleSentence`, `tab` | `ui.*` | Direct. |
| Anything unknown | `migratedFrom.unknown` | Kept verbatim. |

A **v2 backup** (`app:"tablinum-v02"`) goes through the existing `normalizeState` (v4) first, then `migrateV4toV5`. That reuses tested code instead of writing a second v2 path.

### 5.3 Legacy chapters and the new course

The legacy chapters stay in the app as the "Prima Via (archive)" shelf, with their own IDs. Progress in `legacy-ch03` is **never** transferred to `b01-c003`, even though both are about a meal. If the owner later wants to retire the archive, that is a separate, explicit decision. It would add a reviewed mapping file and keep the archive progress visible as read-only.

### 5.4 Backups

- **Export:** `{app:"tablinum", version:5, exportedAt, appVersion, state}`. Filename: `tablinum-backup-YYYY-MM-DD.json`.
- **Restore:** accepts versions 2, 4 and 5. An older version goes through the migration. The user confirms before the restore replaces anything, as now. Audio and recordings are **not** in the JSON; they are in IndexedDB, with an optional separate "export recordings" ZIP (Phase 7).
- **Reminder:** every `backupReminderDays` days, and after finishing each review chapter.

### 5.5 When content changes under existing progress

Each chapter's progress record stores the `contentHash` it was earned against. If a chapter's hash changes, for example after a Latinist correction:

- Progress for **question IDs that still exist** is kept.
- Progress for **removed IDs** moves to `chapters[id].orphaned`. It is never deleted.
- The chapter shows a small "this lesson was revised" note.

This is why every content item needs an explicit, never-reused ID (W7). An ID may be **retired** but must never be given to a different item.

### 5.6 Migration tests (Phase 0 fixtures, Phase 3 tests)

These fixture states are needed:

1. Empty v4 state.
2. A mid-course learner: answers in chapters 1–5, hints, notes, cloze, confidence, 30 saved words including `habet` and `habere` keys.
3. A learner on the custom text, with `custom:` hint keys.
4. A v2 backup envelope.
5. Malformed and hostile input: `__proto__` keys, huge strings, wrong types.
6. A state at the caps (100 notes), to prove the caps are lifted.

For each fixture, check that:

- (a) migration output validates;
- (b) every v4 truthy `correct` maps to a v5 question that is correct;
- (c) the counts of notes, hints and cards are equal;
- (d) running the migration twice gives byte-identical output;
- (e) the v4 key is byte-identical after the app starts;
- (f) export, restore and export round-trips to identical JSON apart from `exportedAt`.

---

## 6. Roadmap: dependency-ordered phases

Each phase lists its goal, dependencies, files, tasks, automated tests, manual checks and acceptance criteria. One phase is one branch and one ZIP handback, unless it is marked as split.

### Phase 0: Safety net (tests only, no app change)

- **Depends on:** nothing. **Goal:** make every later change provably safe for saved progress and offline launch.
- **Files:** new files only:
  - `tests/fixtures/v4/*.json` (the 6 fixtures in §5.6);
  - `tests/fixtures/backups/*.json`;
  - `tests/backup-compat.test.cjs`;
  - `tests/file-url-smoke.cjs`;
  - `tests/legacy-content-lock.test.cjs`.
  - Edit `package.json` scripts and the CI workflows.
- **Tasks:** see §12, which describes this phase exactly.
- **Acceptance:**
  - `npm test` passes with the new tests.
  - `npm run test:file` passes in Chromium on Linux CI.
  - `index.html` is byte-identical.
  - The owner has run the manual Windows double-click check (§10.3) once and recorded the result.

### Phase 1: Reviewed lexeme registry (legacy slice)

- **Depends on:** Phase 0. **Goal:** turn the 124 provisional candidates into reviewed lemmas with permanent IDs, and fix the audit weaknesses W3, W4, W5 and W8.
- **Files:**
  - `curriculum/lexicon/lexemes.json` (new);
  - `curriculum/lexicon/legacy-candidate-map.json` (candidate_id → lexeme id, reviewed);
  - `curriculum/lexicon/legacy-vocab-map.json` (v4 vocab key → lexeme id);
  - `curriculum/lexicon/review-sheets/*.csv` (round trip);
  - `scripts/lib/schema.cjs`, `scripts/validate-lexemes.cjs`, `scripts/registry-review-sheet.cjs` (export and import CSV);
  - `scripts/build-legacy-lexeme-audit.cjs`, extended with the `context`, `q` and cloze streams;
  - `tests/lexemes.test.cjs`;
  - `docs/LICENCE_REGISTER.md` and `ATTRIBUTION.md`.
- **Tasks:**
  1. Write the registry validator: unique immutable IDs, required fields by POS, macron characters limited to āēīōūȳ and their capitals, `homograph_of` symmetric, no `approved` entry without `reviewed_by` and `reviewed_at`.
  2. Generate a review CSV from the 128 candidates. Columns: `candidate_id`, `head`, `gloss`, `forms`, `proposed_lemma`, `proposed_id`, `pos`, `principal_parts`, `decision`, `notes`. Pre-fill the proposals from DCC where the head matches. The 9 ambiguous tokens come first.
  3. A human reviewer fills in the decisions. `registry-review-sheet.cjs --import` writes the entries to `lexemes.json` with status `approved` only where the sheet says approve and names a reviewer.
  4. Extend the audit to the exercise and context streams, tagged `stream:"exercise"|"context"|"cloze"`. These never count as introductions.
  5. Produce `legacy-vocab-map.json` by applying `norm()` to every legacy head and form and resolving through the candidate map.
  6. Start the licence register (§9.4).
- **Tests:**
  - The validator passes. Every legacy token resolves to exactly one approved ID or a proper name.
  - Each of the 9 ambiguous tokens has a recorded decision.
  - The vocab map covers every key `dict` could ever produce.
  - The strict gates are still red, because the legacy chapters are not new-course lessons.
- **Manual:** the reviewer signs the CSV, and a second person spot-checks 20 random entries.
- **Acceptance:** about 95–105 approved lemmas cover 100% of legacy tokens. `vocabulary-introductions-130.json` is still empty.

### Phase 2: Lesson format, grammar features and compiler

- **Depends on:** Phase 1. **Goal:** a single command turns `lessons/**/*.json` into runtime content plus a derived ledger and quality reports, and fails on any rule violation.
- **Files:**
  - `curriculum/grammar-features.json`;
  - `scripts/compile-content.cjs` (the main build);
  - `scripts/lib/{tokens,coverage,recurrence,grammar,ids}.cjs`;
  - `scripts/render-plan.cjs`;
  - `reports/` (generated, committed): `coverage-b01.md`, `recurrence.md`, `grammar-violations.md`;
  - `tests/compiler.test.cjs` with tiny fixture lessons under `tests/fixtures/lessons/`.
  - Converter `scripts/legacy-to-lesson.cjs` (L → `lessons/legacy/ch0N.json`).
- **Compiler steps,** in order. Each step fails the build with a precise message including file, ID and token.
  1. **Schema:** every lesson validates. IDs match `^(legacy-ch\d\d|b0[1-3]-c\d{3})(-(l\d|s\d{3}|q\d{3}|sp\d{3}))?$`. IDs are unique across the whole course. Retired IDs are listed in `curriculum/retired-ids.json` and never reused.
  2. **Token integrity:** the token surfaces equal the words of `text_la`, and every `lx` exists in the registry with status `approved`. Any `lx` is allowed in `draft`; only approved ones in `approved`.
  3. **Form check:** each token's surface plus `morph` must be a valid form of its lexeme, using the generated paradigms in §7.9. Any mismatch is reported, and macron mismatches separately.
  4. **New-word derivation:** walk the chapters in course order and keep a `known` set. A non-proper `lx` not in `known` is new in this chapter. Compare against `new_lexemes_declared`, and fail on any difference. Fail if the count exceeds `budget_new_lemmas`. Review chapters must have 0 new words.
  5. **Coverage:** in each reading segment, the share of tokens that are known, new-this-chapter, proper names or glossed in the margin must be 100%. The share that are **new-this-chapter** must be ≤ 8% in Book I, 10% in Book II and 12% in Book III. These are configurable starting values; tune them in the pilot.
  6. **Recurrence** (§7.4).
  7. **Grammar gating** (§7.5).
  8. **Length:** running tokens must fall within `target_running_tokens`, with a warning within 10% outside the range. The segment count must equal `lesson_segments`. Mean words per sentence must stay under the stage cap: 7 for chapters 1–10, 10 for 11–50, 14 for 51–90, 18 for 91–130. These are starting values.
  9. **Emit:** `content/<book>/<chapter>.js`, `content/catalogue.js`, `content/lexicon.js`, the derived ledger and reports. Output must be deterministic: sorted keys, stable formatting, and `--check` mode as in the existing generator.
- **Legacy conversion:** convert `L` to `lessons/legacy/ch0N.json` with the existing IDs and approved tokens from Phase 1. The test then compiles them back and asserts the sentence text equals `L` exactly, with matching fingerprints from `legacy-id-map.json`. Legacy chapters are flagged `legacy:true`; they are excluded from the course ledger and exempt from the length rules.
- **Tests:**
  - The compiler runs on the fixture lessons, and each rule violation produces a failure (one fixture per rule).
  - Legacy round-trip identity.
  - `render-plan.cjs --check` keeps the master-plan table in sync with the JSON.
- **Acceptance:** `node scripts/compile-content.cjs --check` passes on the legacy lessons, and the strict gates stay red.

### Phase 3: Runtime loader, state v5 and migration

- **Depends on:** Phase 2. **Goal:** the app reads chapters from `content/` files on `file://`, uses stable IDs, and migrates v4 progress safely. **No visible behaviour change** for the 8 legacy chapters.
- **Split into three commits:**
  - **3a:** move JS out of `index.html` into `app/*.js` unchanged (pure relocation). A test proves the concatenated scripts equal the old inline script apart from the file boundaries.
  - **3b:** add the loader and `catalogue.js`, move `L` to `content/legacy/*.js`, and add the `Tablinum.chapters` API. `reader()` and the rest receive the chapter object instead of indexing `L[S.ch]`.
  - **3c:** state v5, migration, backup v5, map caps lifted (W1), quota handling, backup reminder.
- **Files:** `index.html` (now a shell), `app/*.js`, `content/legacy/*.js`, `content/catalogue.js`, `tests/migration.test.cjs`, `tests/smoke.test.cjs` (adapted to load `app/*.js` in the VM harness), `tests/file-url-smoke.cjs` (extended).
- **Algorithms:**
  - **Quota handling:** wrap `setItem`. On `QuotaExceededError`, trim `deck.log` to its newest 500 entries and retry once. If it still fails, show "Storage full: export a backup" and keep the state in memory.
  - **Size budget:** warn at 3 MB of serialised state.
  - **Retire `design-integrity` whole-JS hash** (W9). Keep the CSS-token checks. Add the lesson-content lock from Phase 0 as the replacement guard. Explain this in the PR description.
- **Tests:**
  - All of §5.6.
  - The VM smoke test passes against `app/*.js`.
  - Playwright over http **and** `file://`: opening the app, chapter switching, reload persistence, export, restore of a v4 fixture, and a missing content file showing the error.
  - The v4 key is unchanged after launch.
- **Manual:** on Windows, test Edge, Chrome and Firefox. Double-click, make progress, close, reopen. Move the folder and record what happens per browser. Restore a real v0.4.2 backup the owner exported before upgrading.
- **Acceptance:**
  - The legacy chapters look and behave the same, confirmed by screenshot comparison within 1% pixel difference, excluding the progress banner.
  - All migration tests pass.
  - The manual Windows matrix is recorded in `docs/WINDOWS_OFFLINE_CHECK.md`.

### Phase 4: Pilot, new-course chapters 6–8 end to end

- **Depends on:** Phase 3. **Goal:** prove the whole authoring pipeline on three real chapters (Forum, Canis in viā, Tempestās), and **measure the effort**.
- **Steps:** follow the per-chapter workflow in §7.2 completely, including human Latin review, recording, alignment, illustration, exercises and a learner test. The pilot uses chapters 1–5 as **prerequisites**: write chapters 1–5 too, at least as drafts, or the "known" set for chapter 6 is empty. Realistically the pilot is **chapters 1–8**, with 6–8 fully finished and 1–5 at Latin-reviewed status.
- **Measure:** the hours for drafting, tagging, review, corrections, recording, alignment check, art and exercises, per 1,000 tokens. Record them in `reports/pilot-metrics.md`.
- **Acceptance:**
  - Chapters 6–8 compile with zero errors.
  - The ledger now derives about 35 real introductions; the gate prints the counts but stays red.
  - A test learner reads chapter 7 without English at hint level 3 for more than 90% of sentences.
  - The owner approves the look and feel.
  - Go/no-go for full production is decided on the metrics.

### Phase 5: Exercise engine

- **Depends on:** Phase 3 (runtime) and the Phase 4 content for real data. It can start alongside Phase 4.
- **Goal:** the exercise types in §8, all defined in lesson JSON with explicit IDs and stored by ID.
- **Files:** `app/50-exercises.js` (type registry `Tablinum.exerciseTypes[type] = {render, check, normalize}`), `scripts/lib/exercises.cjs` (compile-time validation and distractor checks), tests per type.
- **Acceptance:**
  - Each type has a Node test for correct and incorrect answers, macron and case handling, and no substring matches.
  - Keyboard-only completion works in Playwright.
  - Legacy questions and cloze still work, shown through the new engine as types `mc`, `short` and `cloze`.

### Phase 6: Vocabulary review (FSRS) and exposure tracking

- **Depends on:** Phases 1 and 3. **Goal:**
  - replace the basic scheduler with FSRS;
  - make cards per lexeme and direction, with context;
  - track reading exposure per lexeme;
  - show the four separate counters: introduced, encountered, recognised, productive.
- **Details:** see §8.5.
- **Acceptance:**
  - Migrated legacy cards keep their due dates within ±1 day.
  - FSRS scheduling matches ts-fsrs reference outputs for a fixed review sequence.
  - The counters never merge.
  - The Progress tab shows "words met in lessons" (derived from content and exposure) separately from "words introduced by the course" (derived ledger).

### Phase 7: Audio, listening and speaking

- **Depends on:** Phase 3, and for real audio, Phase 4 recordings.
- **Goal:**
  - play shipped audio by sentence ID;
  - store user audio and recordings in IndexedDB;
  - add listening exercises (§8.3) and speaking practice (§8.4).
- **Files:** `app/70-audio.js`, `app/75-speaking.js`, `scripts/align-audio.md` (operator guide), `tools/align/run_aeneas.py`, `tests/audio-*.test.cjs`.
- **IndexedDB:** database `tablinum`, stores `userAudio` (key `chapterId`, value `{blob, name, ranges}`) and `recordings` (key `recId`, value `{blob, mime, promptId, createdAt}`). On startup, feature-detect IndexedDB. If it is not available (some `file://` setups), fall back to the current in-memory behaviour and say so in the Library tab.
- **Timing JSON:** v2 keyed by sentence ID (`{"b01-c006-s001": [0.42, 2.10], …, "status": "human-verified"}`). The old array form is still accepted for user imports.
- **Acceptance:**
  - Shipped audio plays on `file://` in all three Windows browsers.
  - A user-attached file survives a reload where IndexedDB works.
  - Recording works after the microphone permission prompt.
  - No score is ever shown for pronunciation.

### Phase 8: Illustrations

- **Depends on:** Phase 4 (the pilot proves the style).
- **Goal:** original, consistent images per reading segment.
  - Follow §10 of `curriculum/reviews/TABLINUM_HANDOVER_FOR_GPT_3.md`: style guide, character sheet, prompt template, label positions.
  - Keep `scene()` SVG as the fallback.
- **Files:**
  - `img/**.webp`, about 1600 px wide, quality 80, about 120–250 KB each;
  - `curriculum/illustrations.json`: per-image ID, prompt, seed or tool, reviewer, licence and alt text in Latin plus English;
  - `scripts/check-images.cjs`: every referenced image exists, its size is within budget, and its alt text is present.
- **Acceptance:**
  - Every image's provenance is recorded.
  - No image was made with "in the style of Familia Romana" or a named illustrator.
  - Labels in images use only approved lexemes known by that chapter.

### Phases 9–11: Course production (Books I, II, III)

- **Depends on:** Phases 4–8 accepted.
- **Batches:** batches of 4 teaching chapters plus their review chapter, following the master plan cadence. Each batch is one branch: author → compile → review → record → illustrate → learner check → approve.
- **Book I (chapters 1–50).** Finish the pilot chapters, then the rest. The checkpoints at chapters 25 and 50 (§8.6) are built **into** the review chapters.
- **Book II (chapters 51–90).** Same process. The chapter 90 gate needs the derived ledger to reach ≥1,500 approved introductions. That is when `--require-introduced-1500` turns green **by itself**.
- **Book III (chapters 91–130).** Apply the excerpt policy: classical excerpts are glossed only and never counted. Licensed public-domain texts are allowed as supplementary readers (§9.3). `--require-introduced-3000` turns green only if the derived ledger reaches 3,000. If the pilot metrics show that Book III's pace (47 new words per chapter) fails recurrence, **lower the Book III budgets and say so**. Never pad the count.
- **Acceptance per batch:**
  - The compiler is green.
  - The Latin review is signed.
  - Audio is aligned and verified.
  - Images are present.
  - The exercises pass validation.
  - One learner read-through is logged.

### Phase 12: Final assessment and handover

The final phase covers:

- the end-to-end Windows matrix;
- the full migration test from a real long-used v4 profile;
- the checkpoint assessments, taken by a learner and marked by a human;
- an accessibility audit (§10.2);
- an updated README;
- a final archive ZIP (not a GitHub release unless the owner asks).

---

## 7. Authoring and validating the 130-chapter course

### 7.1 Roles

**Author.** GPT drafting, or a human. Writes original Latin from the chapter brief.

**Latin reviewer.** A person with university-level Latin. Responsible for:

- grammar and idiom;
- macrons;
- that each word is used in the sense the registry claims.

**Pedagogy reviewer.** May be the same person as the Latin reviewer. Checks:

- that meaning can be inferred from the pictures and context;
- that recurrence feels natural;
- the exercise quality.

**Voice talent.** One consistent reader for the whole course (§9.2).

**Illustrator or curator.** Creates or curates the images.

**Test learner.** The owner counts as a learner.

### 7.2 Per-chapter workflow

1. **Brief.**
   - Run `scripts/chapter-brief.cjs b01-c006`.
   - It prints the chapter's title, story, grammar focus, budget and seed words from `vocabulary-budgets-130.json`.
   - It prints the **known lexemes so far** from the compiled earlier chapters.
   - It lists the **lexemes due for recycling**, meaning words that would otherwise go unseen too long (§7.4).
   - It lists the allowed grammar features.
2. **Draft.**
   - The author writes 2–6 segments of original Latin within the token range.
   - Use only known words, plus up to the budget of new words.
   - Each new word must be **inferable**: show it in the picture, define it in Latin in the margin, contrast it with a known word, or let the story make it clear.
   - Do not copy, paraphrase or imitate the plot of any Familia Romana chapter.
3. **Annotate.**
   - Run `python tools/annotate/annotate.py lessons/b01/c006.json`. LatinCy proposes a lemma and morphology for every token.
   - The proposals are mapped to registry IDs by lemma plus POS.
   - Any new lemma not in the registry becomes a **registry candidate** in `lexemes.json`, with status `candidate`.
   - Whitaker's Words disagreements are flagged in `notes_for_reviewer`.
4. **Compile.** Fix every error and look at every warning.
5. **Latin review.**
   - The reviewer reads the rendered chapter (with `?review=1`, which shows token tags on hover) and the CSV of new registry candidates.
   - The reviewer approves the candidates, corrects the Latin and signs `review.latin`.
6. **Exercises and speaking prompts.** Write them by type (§8), using only known words.
7. **Audio.** Record, align, verify (§9.2).
8. **Illustrations.** Generate and review (§6, Phase 8).
9. **Learner check.**
   - Someone who has done the earlier chapters reads the chapter cold.
   - Log any sentence where they needed English (hint level 3).
   - A rate above 10% sends the chapter back for revision.
10. **Approve.** Status becomes `approved` and the compiler emits it into the shipped `content/`.

### 7.3 Vocabulary rules

These rules are enforced by the compiler.

- **One lexeme ID per lemma and sense.** Inflected forms never count separately. Proper names never count.
- **First occurrence equals introduction.** The ledger records the first approved reading sentence that contains the word. A word that appears only in exercises, answer keys, English text or marginal glosses is not introduced.
- **Budget:** derived new words ≤ `budget_new_lemmas`, and review chapters have 0 new words.
- **Target spread:** the chapter should land within 80–100% of its budget. Below 80% is a warning, so the milestones are not missed by accident.
- **Seeds:** at least half of the chapter's `source_seed_lemmas` should be introduced as planned, or deliberately moved, with a note recorded.
- **Frequency first:** by the end of Book II, ≥ 90% of DCC core lemmas the reviewer judges suitable should be introduced. The compiler reports DCC coverage per book.

### 7.4 Recurrence algorithm (retention)

For each lexeme first introduced in chapter `n`:

```
inChapter      = count of reading tokens with this lx in chapter n          → require ≥ 6  (Book I: ≥ 8)
nearFollow     = count in chapters n+1 … n+3 (reading + exercises)          → require ≥ 4
reviewHit      = appears in the next review chapter's reading               → require true
spacingGaps    = for chapters n+4 … min(n+40, 130): longest run of chapters
                 with zero occurrences                                       → warn if > 10, fail if > 20
                 (Book III: warn > 15, fail > 30)
```

`scripts/lib/recurrence.cjs` produces `reports/recurrence.md`. It lists every word that fails, and the **recycling list** that `chapter-brief.cjs` feeds to the next author, sorted by the longest gap. Thresholds live in `curriculum/recurrence-thresholds.json` so the pilot can tune them.

### 7.5 Grammar gating algorithm

- Map each token's `morph` (UD features) and `lx` to feature IDs using `grammar-features.json`.
- Each feature has `introduced_in`. For a token in chapter `n` using feature `f`, require `chapterIndex(f.introduced_in) ≤ n`. Otherwise report a violation.
- Exceptions must be explicit. Set `"preview": ["v.subj.pres"]` on a sentence, with a marginal gloss explaining the form. This is allowed for at most 2 sentences per chapter, as natural-method "lexical previews". An example is *quid vult* before the full treatment of `volō`.
- The **chapter's own** `grammar_new` must appear at least 10 times across its segments, so the new structure is genuinely taught through exposure.

### 7.6 Reading length and difficulty checks

The compiler reports these per segment:

- running tokens;
- sentences;
- mean and maximum sentence length;
- new-word density;
- maximum distance between two occurrences of the same new word;
- the share of sentences with a subordinate clause, from the morphology.

Stage caps are in §6, Phase 2, step 8. Review chapters may be up to 25% longer than their range.

### 7.7 Books II–III specifics

- **Book II** introduces narrative and dialogue registers. Every chapter should have one dialogue segment, which feeds the speaking prompts.
- **Book III**, chapters 121–130, may include short **licensed** excerpts:
  - public-domain classical texts, such as Perseus TEI under CC BY-SA for the markup;
  - the underlying Latin text, which is public domain.

  Excerpt-only words are tagged `"gloss_only": true`. They never count and do not trigger recurrence rules.
- **Supplementary readers.** Public-domain graded Latin readers can be added as optional "Lēctiōnēs additae". Their words are counted as **encountered**, not introduced. Examples:
  - Aesop in H. Clarke's Latin (the LibriVox recording is public domain; check the text edition's date);
  - *Fabulae Faciles* (Ritchie, 1903).

  They must be imported through the same token tagging so the learner's exposure stats include them.

### 7.8 Validation summary (all automated unless noted)

| Check | Tool | Blocking? |
|---|---|---|
| Schema, IDs, token integrity | `compile-content.cjs` | Yes |
| Registry approval of every `lx` in an approved lesson | Compiler | Yes |
| Form validity and macrons against paradigms | Compiler (§7.9) | Yes for approved status |
| New-word derivation, budget, review = 0 | Compiler | Yes |
| Coverage and new-word density | Compiler | Yes |
| Recurrence | Compiler | Fail and warn thresholds |
| Grammar gating | Compiler | Yes |
| Length and sentence caps | Compiler | Warning |
| Ledger derived, not hand-edited | `validate-roadmap-130.cjs` | Yes |
| Strict 1,500 / 3,000 gates | `validate-roadmap-130.cjs --require-…` | Red until true |
| Idiom, sense, naturalness | **Human Latin reviewer** | Yes |
| Inferability and interest | **Pedagogy reviewer and learner check** | Yes |

### 7.9 Paradigm generation for form checks

`scripts/lib/paradigms.cjs` generates the regular forms from `principal_parts` plus a pattern. It covers:

- nouns: 1st–5th declension, including i-stems;
- adjectives: 1st/2nd declension and 3rd declension (one, two or three terminations);
- verbs: conjugations 1–4 and 3-iō, in all tenses, moods and voices the course teaches, plus participles, infinitives, gerund and gerundive, and supine.

Irregular and defective lexemes carry an explicit `forms` list in the registry; examples are *sum, possum, volō, nōlō, mālō, eō, ferō, fīō, edō, dō* and the pronouns.

A token passes if its surface, with macrons, equals a generated form whose features match `morph`. The reviewer approves a **sample table** for each paradigm pattern once, stored in `tests/fixtures/paradigms/*.json`. This catches typos and wrong macrons cheaply across 200,000 words.

---

## 8. Exercise design (natural-method principles)

**Principles.**

- Latin first, and English only as the last hint.
- Meaning comes from pictures, context and Latin marginal notes, for example *magnus ↔ parvus*, *duo = I + I*, *dominus: vir quī servōs habet*.
- Every exercise uses only known words.
- Every exercise is **about the story**, so practising it means re-reading.

Each exercise has an explicit ID and is stored as `questions[id]`.

### 8.1 Reading comprehension

| Type | `type` | Data | Check |
|---|---|---|---|
| Multiple choice in Latin | `mc` | prompt, options, answer, `evidence` sentence ID | Exact option. Afterwards, the evidence sentence is highlighted. |
| Short Latin answer | `short` | prompt, `accept` list, model | Normalise with NFC, lower case, remove punctuation and macrons (macrons ignored by default). Exact match to an accepted form. No substrings. |
| True or false (*Vērum an falsum?*) | `tf` | statement, truth, evidence | Boolean, then show the evidence. |
| Who / where / what (*Quis? Ubi? Quid?*) | `wh` | Generated in authoring from tagged sentences, then human-edited | Same as `short`. |
| Order the events | `order` | 3–6 sentence IDs | Exact sequence. Partial credit is shown but not stored as correct. |
| Picture matching | `pic` | image regions, sentence IDs | Region click. |
| Retell (production) | `retell` | prompt, key lexemes | Self-check against a model answer, plus a checklist of the key words used. Not auto-graded. |

**Generating questions for the circling technique.** At authoring time, `tools/annotate/questions.py` turns each sentence into candidate questions: yes/no, either/or, who, where, what. It uses the token tags, for example *Līvia rosam mātrī dat* → *Quid Līvia dat? Rosamne an pānem Līvia dat? Cui Līvia rosam dat?*.

The author picks and edits these. They are never shipped unreviewed.

The compiler checks that every word in a question is known. It also checks that an interrogative appears only after its own chapter: *quis* and *quid* from chapter 11 in the v3 plan, *cui* and *cuius* when they are taught. Before that, use `tf` and `pic` only.

### 8.2 Grammar-in-context and vocabulary

| Type | `type` | Notes |
|---|---|---|
| Ending fill (forms in context) | `ending` | A sentence from the story with an ending blanked: *Līvia rosam mātr__ dat*. The check is exact: macrons are optional, but the ending letters must be exact. |
| Word fill (story cloze) | `cloze` | The existing type, generalised. The blank is a chapter word. Options can come from the same chapter (easy) or be typed (hard). |
| Latin definition matching | `define` | Match a word to a Latin definition or antonym written by the author (*parvus ↔ magnus*). No English. |
| Paradigm builder (Book I from chapter 20 on) | `table` | Fill a small table of forms of a known word. Uses the paradigm generator for answers, restricted to forms already met. |

**Distractor algorithm** (for `mc`, `cloze`, `define`). Candidate distractors must:

- share the answer's part of speech;
- for nouns, share its case and number; for verbs, share its person, number and tense;
- be known by this chapter;
- not be synonyms (the registry has an optional `near_synonyms` list);
- not appear in the evidence sentence.

The algorithm prefers words introduced within the last 10 chapters, so the distractors double as review. It is deterministic, seeded by the exercise ID, so tests are stable.

### 8.3 Listening

These need a recorded human reader.

| Type | `type` | Behaviour |
|---|---|---|
| Listen and choose a picture | `listen-pic` | Play one sentence. Choose an image region. |
| Listen and answer | `listen-mc` | The question is shown in Latin; the audio is the evidence. |
| Dictation | `dictate` | Play a sentence, type it. Diff by token: macrons are optional, and a word-level diff shows which words were missed. |
| Shadowing | `shadow` | Play a sentence, then record (§8.4). |
| Text-free listening pass | reader mode | Hide the text and play a whole segment. A one-tap self-rating ("cēpī / partim / nōn cēpī") is stored per segment. |

Until human audio exists for a chapter, its listening exercises are hidden. Device TTS stays available in the reader with its "unverified" label, but it never drives a graded listening task.

### 8.4 Speaking

There is no automatic scoring.

- **Shadowing and repeat.**
  1. Play the model sentence.
  2. Record with MediaRecorder (after permission).
  3. Play the model and the learner's recording back to back.
  4. The learner rates themselves 0–3.
  5. Recordings go to IndexedDB, and can be exported as a ZIP.
- **Answer aloud.** Each `wh` question has a "say it" mode. The learner records an answer, then sees the accepted answers.
- **Describe the picture.** Show an image and a list of target words. The learner records 3–6 sentences and ticks the target words they used. This is stored as productive use for those words.
- **Role-play scripts** (Book I) **and open prompts** (Books II–III). The app plays the other speaker's turn and pauses for the learner's turn. The `communication_task` text in the budgets JSON becomes `speaking[]` prompts per chapter.
- **Optional human review.** "Export for tutor" packages the recordings with their prompts and model text. A tutor's ratings can be imported as JSON into `speaking[id].tutor`.
- **Pronunciation standard.** Pick **one**: restored classical, or ecclesiastical. Record it in `docs/PRONUNCIATION.md`, and use it for every recording and for the voice talent's brief.

### 8.5 Vocabulary review (FSRS)

- **Cards:** one per lexeme per direction.
  - `recog`: Latin → meaning, shown **in the original story sentence**, with the word highlighted. The Latin definition is shown first, then English on demand.
  - `listen` (once audio exists): hear the word in its sentence.
  - `prod` (Book II on, optional): picture or Latin definition → type the Latin. Macrons optional.
- **Card creation:**
  - Automatic: cards are created when a chapter is finished (the learner marks it read or passes its exercises) for the chapter's new words. They start in the FSRS `New` state.
  - Manual: words the learner saves from any text, including custom imports. Words not in the registry become `legacyCards`-style free cards.
- **Scheduler:** ts-fsrs, default parameters, desired retention 0.9 (a setting). Ratings map to `Again/Hard/Good/Easy`. The review log is a capped ring buffer.
- **Daily limits:** new cards per day (default 15, roughly the per-chapter budget early on) and a maximum number of reviews.
- **Exposure tracking:**
  - When a learner advances past a sentence, or opens its hint, every `lx` in that sentence gets `exposure[lx].seen++` once per session per sentence.
  - The counter is shown on the word's gloss panel: "vīsum 14×".
  - It feeds the Progress tab's "encountered" counter.
- **Four counters, never merged** (as the master plan requires):
  - **Introduced:** the derived ledger, up to the learner's furthest approved chapter.
  - **Encountered:** `exposure.seen ≥ 1`.
  - **Recognised:** an FSRS `recog` card in state Review with stability ≥ 21 days.
  - **Productive:** a `prod` card in state Review with stability ≥ 21 days, or the word was ticked in a speaking task at least twice.

### 8.6 Checkpoint assessments (chapters 25, 50, 75, 90, 110, 130)

Each checkpoint lives inside the matching review chapter (or right after it) as a separate segment, marked `assessment:true`. It contains:

1. an **unseen passage** written with only known words, about 300 tokens at chapter 25 rising to about 1,500 at chapter 130;
2. **10 comprehension questions** in Latin;
3. a **listening item**;
4. a **speaking task**, recorded and self-rated, with an optional tutor rating.

**Pass guide:**
- at least 8/10 on comprehension;
- at least 7/10 on listening.

Speaking is logged rather than gated.

Results are stored under `assessments[id]`. The Book III entry rule (`book_iii_admission` in the budgets JSON) is checked here as **advice, not a lock**, because this is personal use.

### 8.7 Hint ladder for new content

Keep the existing 0–3 ladder with the same labels and keys (`chapters[id].hints[sentenceId]`). For the new course, level 2 uses the token's **own** `lx` sense gloss, so the answer depends on the sense, not on the first surface match in `dict`. This fixes the first-match ambiguity, such as `habet` and the two meanings of `ad`.

Gloss order:
1. Latin margin note or picture, if one exists.
2. Latin synonym or definition from the registry, `gloss_la`.
3. English.

Imported custom text still uses the surface dictionary as a fallback.

---

## 9. People, software, language resources, recordings, art and licensing

### 9.1 Human expertise

| Role | When | Estimated effort (validate in the pilot) |
|---|---|---|
| Latin reviewer, with university-level Latin and confident macron use | Registry from Phase 1, then every chapter | About 1–1.5 hours per 1,000 tokens of draft. That comes to roughly 165–360 hours across the course, plus the registry: roughly 3,000 entries at 1–2 minutes each, about 50–100 hours. |
| Pedagogy reviewer (a natural-method teacher, or the Latin reviewer) | From the pilot on, then every batch | About 0.5 hours per chapter. |
| Voice talent with consistent pronunciation | From Phase 4 | Slow, clear Latin at about 90–110 words a minute gives roughly 25–45 hours of finished audio, so plan about 3× that in session time. |
| Audio editor and aligner | With recordings | About 0.5 hours per finished audio hour (auto-alignment plus spot listening). |
| Illustrator or image curator | From Phase 8 | 2–4 images per chapter, about 300–500 images in total. |
| Test learner(s) | Every batch | Reading time, plus logging hint use. |

**For personal use**, the owner may decide that GPT drafts the Latin and only a sample is reviewed. If so, add a lesson status `ai_drafted_unreviewed`, shown in the app as a small "not yet checked by a Latinist" mark. The derived ledger must then **exclude** such chapters from the milestone counts, or count them separately. The plan's honesty rule depends on this.

### 9.2 Recordings

- **Format.** Record each segment as WAV (48 kHz, 24-bit) in a quiet room with a decent USB microphone. Publish MP3 at 128 kbps mono, or Opus in WebM. Edge, Chrome and Firefox play both on `file://`. Use MP3 if in doubt.
- **Alignment.** Use aeneas with eSpeak-NG Latin (`la`) and the sentence list from the lesson JSON. It writes `timing` per sentence ID with `status:"auto"`. A human listens to each boundary at 1× speed and fixes any that are more than 150 ms off. Then status becomes `human-verified`. The app shows "auto-aligned" until verified.
- **Consent and licence.** The voice talent signs a written licence for use in the app. Record it in the licence register.
- **Existing uploads.**
  - LibriVox "Selectae Fabulae Aesopi": LibriVox recordings are public domain. Verify on the catalogue page and record the URL. It is usable for the supplementary listening readers.
  - "Latin AUDIO part_0" and `metadata.csv`: the source and licence are **unknown**. Do not use or commit them until the source is identified.

### 9.3 Software and language resources

| Resource | Use | Licence action |
|---|---|---|
| DCC Latin Core 1,000 (`latin-core-list.csv`) | Frequency priorities and draft glosses for the registry | CC BY-SA 3.0: attribute. If the registry file includes DCC text and is shared, it inherits BY-SA. |
| Perseus `lexica` (Lewis & Short) | Macron and sense authority for reviewers | CC BY-SA: attribute. Don't bulk-copy definitions into the app; write short original glosses. |
| `canonical-latinLit` (Perseus TEI) | Book III excerpts, frequency counts beyond DCC | Texts are public domain and the markup is CC BY-SA: attribute. |
| LatinCy (`la_core_web_lg` 3.9.8, `latincy-*` packages) | Authoring-time lemmatising and morphology | Check each package's LICENSE. Not shipped, so the obligations are minimal, but record them. |
| Whitaker's Words 0.8.0 | Morphology cross-check | Check the LICENSE in the zip. Not shipped. |
| `latin-macronizer` | Optional macron proposer | Check the LICENSE (it may be GPL). Not shipped; output is reviewed by a human. |
| `ts-fsrs` 6.0.0 | Scheduler | MIT: verify, keep the LICENSE beside the vendored file. Shipped. |
| `aeneas` 1.7.3 | Alignment | AGPL v3: verify. Authoring tool only, so do **not** ship or link it. |
| `wavesurfer.js` 8.0.5 | Optional alignment-check page | BSD-3: verify. |
| Lute v3, LibreLingo, ClassicsReader | Design reference only | Do not copy code without a licence check. |
| Allen & Greenough grammar (`grammar-allen-greenough`) | Reference for reviewers, and for Latin-only grammar notes written in your own words | Public domain text, with a repository licence on the markup: check it. |
| Project Gutenberg EPUBs (pg8997, pg18251) | Possible public-domain readers | Public domain in the US. Strip the Gutenberg licence header or keep it as the PG licence requires. |
| **Bewick's Aesop EPUB (owner-supplied)** | **Use**, as described in §9.5: a source of fable plots and of Bewick's engravings as illustration reference, for original Latin retellings in Books II–III. | Follow the conditions in §9.5. |

### 9.4 Licence register (Phase 1 deliverable)

`docs/LICENCE_REGISTER.md` has one row per resource with these columns:

- name and version;
- source URL;
- licence, verified from the LICENSE file or page, not from memory;
- how it is used (shipped, data-derived or tool-only);
- obligations (attribution, share-alike, notice);
- where attribution appears;
- the person who checked it, and the date.

`ATTRIBUTION.md` is shown from the app's Progress → About panel.

**Also decide whether the GitHub repository is public or private.** If it is public, everything committed counts as distributed. Keep the unverified audio, uploaded datasets and any third-party archives out of the repo and in a local `resources/` folder that is git-ignored.

### 9.5 Using the Bewick's Aesop EPUB (owner decision)

The owner has decided to use `Bewicks Select Fables of Æsop and others…epub`. Bewick's *Select Fables* dates from 1784 (and its 1820 and 1871 editions). The text and Bewick's wood engravings are public domain because of their age. This edition is in **English**, so it is not Latin reading material in itself.

How to use it:

1. **Story source for original Latin fables.** Use its fable plots as the basis for original, graded Latin retellings in Books II–III. The fable chapters in the plan are 111–120, and supplementary readers can go anywhere from chapter 51 on. Write the Latin fresh to the chapter's vocabulary and grammar limits, then tag, compile and review it like any lesson.
2. **Illustration reference.** Bewick's engravings can serve as composition references for fable illustrations, or be reproduced directly, since they are public domain. Credit them as "after Thomas Bewick" in `curriculum/illustrations.json`.
3. **Listening tie-in.** Where a Bewick fable matches one in the LibriVox *Selectae Fabulae Aesopi* recording, link the two so the learner can read the plot and then hear a public-domain Latin version. The EPUB does **not** match the H. Clarke Latin text that recording reads, so match fables by plot, not by text.

Conditions:

- Before using anything from the file, check that the edition contains **no modern copyrighted additions**, such as a recent introduction, notes or new illustrations. Use only the 18th- and 19th-century text and engravings.
- Record it in `docs/LICENCE_REGISTER.md` with its edition, date and file name, and note that it is owner-supplied.
- Keep the EPUB itself in the git-ignored `resources/` folder. Do not commit the file to the repository, especially if the repository is public.
- If the edition can't be confirmed, use the same public-domain text from Project Gutenberg or the Internet Archive instead.

### 9.6 Illustrations

- Follow `TABLINUM_HANDOVER_FOR_GPT_3.md` §10:
  - a hand-drawn ink line with watercolour fill;
  - a consistent character sheet for Līvia, Tītus, Mārcus, Flāvia and the rest;
  - in-image Latin labels placed in the empty areas.
- Prompts must not name Familia Romana, Ørberg, or any living illustrator.
- Record every image's tool, prompt, seed and terms of use in `curriculum/illustrations.json`. If an AI tool's terms restrict usage, note it.
- Characters, places and plots must be **original**. Do not reuse FR's family composition or scene sequence. The current cast (Līvia, Tītus, Mārcus, Flāvia) is already distinct; keep it.

---

## 10. Tests, manual checks and acceptance, by layer

### 10.1 Automated tests (all must pass in CI on Node 22)

| Test file | Covers | Added in |
|---|---|---|
| `tests/smoke.test.cjs` (existing, adapted in 3a) | App behaviour in the VM harness | Existing |
| `tests/legacy-lexeme-audit.test.cjs` (existing) | Audit snapshot | Existing, extended in Phase 1 |
| `tests/legacy-content-lock.test.cjs` | 8 legacy chapters byte-identical by fingerprint | Phase 0 |
| `tests/backup-compat.test.cjs` | v2 and v4 fixtures restore through `normalizeState`; caps behaviour documented | Phase 0, extended in Phase 3 |
| `tests/file-url-smoke.cjs` | Playwright `file://`: load, persist, reload, export, restore | Phase 0, extended in Phase 3 and later |
| `tests/lexemes.test.cjs` | Registry validity, candidate and vocab maps | Phase 1 |
| `tests/compiler.test.cjs` | One fixture per compiler rule, plus legacy round trip | Phase 2 |
| `tests/migration.test.cjs` | §5.6 (a)–(f) | Phase 3 |
| `tests/exercises.test.cjs` | Each type's checker, normalisation, distractors | Phase 5 |
| `tests/fsrs.test.cjs` | Reference sequence, legacy card conversion, counters | Phase 6 |
| `tests/audio.test.cjs` | Timing v1 and v2 parsing; IndexedDB fallback (fake-indexeddb is not available offline, so test the fallback path with IndexedDB undefined) | Phase 7 |
| `tests/images.test.cjs` | Every referenced image exists; size budget; alt text present | Phase 8 |
| `validate-*.cjs` (existing) | Plan, budgets, gates | Existing |

### 10.2 Accessibility (Phase 5 on, and Phase 12)

- Keyboard-only completion of every exercise type.
- Visible focus.
- `lang="la"` on Latin text.
- `aria-live` on results.
- Contrast ≥ 4.5:1 for body text, checked against the manuscript palette.
- Images have alt text in Latin plus English.
- Audio has a transcript, which is the sentence text.
- No information is conveyed by colour alone.

### 10.3 Manual Windows offline check (Phase 0 baseline; repeat after Phases 3, 7 and 12)

Record the results in `docs/WINDOWS_OFFLINE_CHECK.md`, giving the date, Windows version, each browser version, and a pass or fail with notes for each step.

1. Unzip to `C:\Users\<you>\Documents\Tablinum\`.
2. Double-click `index.html`. Test with Edge as the default browser, then right-click → Open with Chrome, then Firefox. Disconnect the network first.
3. Make progress: answer 2 questions, set a hint, save a word, write a note. Close the browser and reopen it. Progress should be present.
4. Export a backup.
5. Move the folder to `D:\` or the Desktop and reopen it. Record what happens per browser. Then restore the backup from step 4.
6. Phase 7 and later: play shipped audio, attach your own MP3, reload. Record from the microphone.

### 10.4 Acceptance per phase

Each phase lists its own acceptance criteria above. Every phase also needs all of the following:

- (a) all of §10.1 so far is green;
- (b) the strict gates are red unless the derived ledger truly passes;
- (c) the v4 key is untouched;
- (d) the Windows check is re-run when the phase touches runtime loading, storage or audio;
- (e) a handback note listing what was **not** tested.

---

## 11. Key risks

| Risk | Mitigation |
|---|---|
| Human review capacity is the real bottleneck | The pilot measures it, and batches go only as fast as review. If reviewing every chapter isn't affordable, use a labelled `ai_drafted_unreviewed` tier that is excluded from the milestone counts. |
| GPT-drafted Latin contains subtle errors at scale | Paradigm form checks, the grammar gate and a mandatory reviewer sign-off before `approved`. |
| Storage loss on `file://` | Backup reminders, a v4 snapshot key, a separate recordings export, and the folder-move test. |
| Book III pace harms retention | Recurrence reports. Budgets are lowered openly rather than padded. |
| Scope creep in the runtime | No framework and no bundler at runtime. Classic scripts only. Each phase has a narrow acceptance list. |
| Licence contamination | Licence register, git-ignored `resources/`, the Bewick EPUB edition checked (§9.5), unknown audio held back. |

---

## 12. The first coding task for GPT

**Start immediately.** The owner has approved this work. GPT should begin this task now, without waiting for further confirmation, then continue through the phases in order, using the two-pass method in §12.1 for every phase.

**Task:** Phase 0. Add a progress and offline-launch safety net. This is test-only, with **no change to `index.html`**.

**Branch:** `test/phase0-safety-net` from the current `feature/legacy-lexeme-audit-20261105` head. Do not merge.

### Files to create

1. `tests/fixtures/v4/` with six JSON files. Each is a **raw v4 state object**, exactly as it would sit in `localStorage['tablinum-source-review-v02']`.
   - `empty.json`: `{}`.
   - `midcourse.json`:
     - `ch:3`;
     - `answers`/`correct` for keys `0:0`–`4:2` (some wrong);
     - `hintLevels` with values 1–3 on several `n:j` keys;
     - `notes` for `"0"`, `"2"`;
     - `clozeAnswers`/`clozeCorrect` for `"0"`, `"1"`;
     - `readingConfidence` for `"0"`–`"4"`;
     - `vocab` with 30 entries. Include the keys `habet`, `habere`, `ad`, `omnes` and `livia`, with realistic `{head, meaning, days, due, reps}`.
   - `custom.json`: `ch:"custom"`, `custom` text of 3 sentences, `customSentences`, `hintLevels` with `custom:0`, `custom:2`.
   - `hostile.json`:
     - `__proto__`, `constructor` and 81-character keys;
     - wrong types (`ch:"7"`, `sel:-5`, `vocab.x.days:"NaN"`);
     - a 30,000-character `custom`.
   - `at-caps.json`: `notes` with 120 keys `"0"`–`"119"`, to document the current 100-entry cap (W1).
   - `v2-envelope.json`: `{app:"tablinum-v02", version:2, state:{…small v2-style state…}}` (a backup file, not raw state).
2. `tests/backup-compat.test.cjs`. Load `index.html` in the **same VM harness pattern as `tests/smoke.test.cjs`**: extract the script, mock the DOM and `localStorage`, use `window.TablinumAudit`. For each raw fixture:
   - Call `TablinumAudit.normalizeState(fixture)` and assert the output keeps every valid value.
     - `midcourse`: all `correct` keys present, 30 vocab entries, notes text equal, `ch` equal.
     - `hostile`: no prototype keys, `custom.length===20000`, `ch===0`, `sel===0`.
   - For `at-caps.json`, assert the **current** behaviour: exactly 100 notes are kept. Name the test `"KNOWN LIMIT W1: notes capped at 100 (fix in Phase 3)"` so the limit is documented, not hidden.
   - Simulate the restore path: seed `localStorage` with `midcourse`, boot the app, and assert that `localStorage['tablinum-source-review-v02']`, parsed, deep-equals the `normalizeState` output. Startup calls `save()`, so this documents that startup rewrites the key in normalised form.
   - For `v2-envelope.json`, run the restore code path and assert the resulting state. Use the existing `restoreBackup` through a mocked `FileReader` and `confirm()→true`, as `smoke.test.cjs` does for imports, or call `normalizeState(envelope.state)` if `restoreBackup` is not exposed. **Do not** add new exports to `index.html`.
   - Round trip: export through the mocked `download()` blob capture, then restore, then export again. The two exported `state` objects must be deep-equal.
3. `tests/legacy-content-lock.test.cjs`:
   - Extract `L` exactly as `scripts/build-legacy-lexeme-audit.cjs` does, by copying its `extractArray` approach into a small shared helper `scripts/lib/extract-legacy.cjs`. The generator then imports that helper with no behaviour change. Prove this with `--check`.
   - Recompute each chapter's `fnv32(sentences.join("\n"))` and assert it equals `latin_sentence_fingerprint_fnv32` in `curriculum/lexicon/legacy-id-map.json`.
   - Also assert 8 chapters, 67 sentences, 24 questions, 8 cloze items, and the exact question prompts recorded in the ID map.
4. `tests/file-url-smoke.cjs`, using Playwright with the pre-installed Chromium (do not run `playwright install` locally; CI may install it). It must:
   - open `pathToFileURL(path.resolve("index.html")).href`;
   - wait for `.scene svg`;
   - assert 9 sentences in chapter I;
   - click quiz → answer question 1 correctly;
   - reload the page and assert the answer is still marked correct, which proves `localStorage` works on `file://`;
   - seed `localStorage` with `tests/fixtures/v4/midcourse.json` via `page.addInitScript`, reload, and assert the Progress tab shows the expected count of correct answers;
   - fail on any `pageerror`;
   - save `artifacts/file-url-desktop.png`.
5. `docs/WINDOWS_OFFLINE_CHECK.md`: the §10.3 checklist as an empty table for the owner to fill in.
6. `Start Tablinum.cmd` (CRLF line endings): `@echo off` then `start "" "%~dp0index.html"`. Add `.gitattributes` as described in §4.3.

### Files to modify

- `package.json`:
  - keep `test`, and append `&& node tests/backup-compat.test.cjs && node tests/legacy-content-lock.test.cjs && node tests/legacy-lexeme-audit.test.cjs`;
  - add `"test:file": "node tests/file-url-smoke.cjs"`.
- `.github/workflows/tablinum-smoke.yml`: in the Playwright job, add a step `npm run test:file` after `npm run test:browser`, and upload the `artifacts/` folder. Add a `windows-latest` job that runs `npm test` and `npm run test:file` with Edge (`channel: "msedge"`), so the tests prove the Windows path.
- `scripts/build-legacy-lexeme-audit.cjs`: only to import the shared extractor. Its outputs must be byte-identical, which `--check` proves.

### Must not change

- `index.html`;
- `curriculum/vocabulary-introductions-130.json`;
- any lesson text;
- the strict gate behaviour;
- the existing tests' assertions. Adapting imports is fine; weakening assertions is not.

### Commands to run, with expected results

```bash
npm test                                            # all pass, including the 3 new Node tests
node scripts/build-legacy-lexeme-audit.cjs --check  # PASS, snapshots unchanged
node curriculum/validate-roadmap-130.cjs            # PASS
node curriculum/validate-outline-v3.cjs             # PASS
node curriculum/validate-roadmap-130.cjs --require-introduced-1500   # must FAIL with "GATE NOT MET"
npm run test:browser                                # pass (http)
npm run test:file                                   # pass (file://)
git diff --stat main...HEAD -- index.html           # empty
```

### Definition of done

1. All the commands above give the stated result, and the actual console output is pasted into `docs/PHASE0_RESULTS.md`, with the Node, Playwright and Chromium versions.
2. `sha1sum index.html` equals `9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20`, the v0.4.2 manuscript file.
3. The W1 cap is documented by a named passing test, and is **not** fixed in this task.
4. CI runs the new tests. The handback states which runs were local and which were CI.
5. `docs/WINDOWS_OFFLINE_CHECK.md` exists, ready for the owner. Its results may be blank until the owner runs it.
6. The handback ZIP contains the whole repository, plus a short `PHASE0_HANDBACK.md` listing:
   - files added and changed;
   - anything not tested;
   - anything in the fixtures that surprised you, for example a field `normalizeState` dropped that a learner would miss.

7. The Windows CI job is green, and the new test scripts run unchanged from PowerShell.

### 12.1 Two passes for every phase

The owner has asked for **two passes** on every task.

**Pass 1: implement.** Build the phase as specified, run every listed test, and record the results.

**Pass 2: review and fix.** Start again from a fresh read of the diff, as if reviewing someone else's work:

1. Re-read this roadmap's section for the phase and tick off every file, test and acceptance criterion. List anything missed.
2. Re-run every command from a clean checkout on **both** Windows (PowerShell) and Linux. In particular, re-run the `file://` test in Edge.
3. Check the ground rules in §0. Confirm that `index.html` changed only where the phase allows it, that the v4 key `tablinum-source-review-v02` is untouched, that the strict gates are still red unless truly met, and that no Familia Romana material came in.
4. Look for the faults pass 1 is most likely to miss: Windows path and line-ending issues, tests that pass because they assert too little, silently dropped data, and hard-coded values that should come from data files.
5. Fix everything found, re-run all the tests, and record what pass 2 changed.

The handback for each phase has a **"Pass 1"** and a **"Pass 2"** section: what was done, the test output, and what the second pass found and fixed. If pass 2 found nothing, say that plainly rather than inventing changes.

When Phase 0 is accepted, start **Phase 1** (§6) with the registry validator and the review CSV for the 9 ambiguous tokens.