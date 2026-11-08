# CLAUDE — LATIN X / Tablinum: Remaining-Work Technical Handover

**Prepared:** 5 November 2026  
**Mode:** Architecture, teaching and delivery review / *implementation plan only*. Do **not** implement changes yet.  
**Repository:** `cosmiccopper29-svg/Latin-X`  
**Exact starting branch:** `feature/legacy-lexeme-audit-20261105`  
**Do not start from `main`, merge existing branches, rewrite the application or assume a proposed feature is already implemented.**

## 1. Your assignment

You are receiving the **complete current project**: existing runnable Tablinum, its source and tests, the approved-for-authoring v3 *outline* (not completed lessons), previous Claude reviews, research, vocabulary budgets and the first lexical audit.

Your job is to **explain in technical and pedagogical detail how to complete the remaining development**. Produce a realistic, ordered engineering + original Latin authoring roadmap that another coding AI can execute in small tested increments. Provide **exact files to create/change, data schemas, algorithms, migration strategy, tools and dependencies, testing and acceptance criteria**, and distinguish what can be automated from what must be reviewed by a Latinist, narrator or the user. Identify true blockers and proposals that need explicit approval.

**Do not** provide only a broad list of improvements. Do not implement code yet, fabricate completed lessons or attestations, or claim that a structural test proves Latin proficiency.

## 2. Read the actual project in this order

1. `index.html`, `README.md`, `package.json` and `tests/`. The standalone offline HTML app is the authoritative implemented baseline.
2. `CLAUDE_REVIEW_START_HERE.md` and `curriculum/lexicon/LEXEME_AUDIT_HANDOVER.md`. These describe the *latest implemented work*.
3. `scripts/build-legacy-lexeme-audit.cjs`, `curriculum/lexicon/legacy-token-audit.json`, `curriculum/lexicon/legacy-id-map.json` and `tests/legacy-lexeme-audit.test.cjs`.
4. `curriculum/CURRICULUM_130_MASTER_PLAN.md`, `curriculum/vocabulary-budgets-130.json`, `curriculum/vocabulary-introductions-130.json`.
5. `curriculum/reviews/TABLINUM_REVIEW_V3_FOLLOWUP_20261105.md`, `curriculum/CLAUDE_REVIEW_RESPONSE_V3.md`, other archived reviews, and `curriculum/FAMILIA_ROMANA_RESEARCH.md`.
6. `docs/CLAUDE_HANDOVER.md`, `docs/RESOURCE_INVENTORY.md`, `docs/REVIEW_CHECKLIST.md` for historical constraints and previously considered resources.

Please **inspect the code and actual files first**, and cite the exact paths and function/data names you rely on. Some old review notes are superseded; newer branch data and current runnable source take precedence.

## 3. What is implemented — do not rebuild or overclaim

- Tablinum **v0.4.2 Manuscript Edition** is a runnable, offline, **single `index.html`** with eight short original Latin chapters, **67 Latin sentences**, 24 chapter MC/free-response questions and eight guided cloze activities, glossary lookups, self-study functions, backups, imported text, and browser-voice / user-supplied MP3 options.
- The current 130-chapter course is **only an editorial roadmap**. The **50 / 40 / 40 chapter** structure has 102 teaching and 28 zero-new-lemma review chapters. Its **500 / 1,532 / 3,036 cumulative lexeme counts are planned budgets**, **not vocabulary already introduced**. `curriculum/vocabulary-introductions-130.json` deliberately has zero evidenced introductions.
- Original code contains existing progress/backups with **numeric chapter indices 0–7**, question keys such as `0:0`, and a custom imported-text option. Do not use planned chapter numbers as a drop-in replacement for existing saved-progress keys.
- A **read-only, deterministic lexical-candidate generator** has been implemented. Its eight-chapter snapshot contains **255 sentence word tokens, 48 proper-name tokens, 198 single-glossary matches, 9 ambiguous matches and 0 unmatched by its own glossary**. It lists **124 provisional non-proper glossary headword candidates**. These are **not 124 vetted Latin lemmas**. All token `lexeme_id` values remain `null`.
- `curriculum/lexicon/legacy-id-map.json` already freezes stable identifiers such as `legacy-ch01`, `legacy-ch01-s001`, `legacy-ch01-q001`, plus old numeric progress keys and text fingerprints. It is an **audit sidecar, not a completed runtime migration**.
- Earlier grammar-outline revisions addressed pronouns, participles, subjunctive dependencies, passive forms and macrons. Latest Claude v3 review says the course **outline is ready to author from**, with particular care that Chapters 14, 15 and 26 may be cognitively crowded.
- The Manuscript UI was redesigned, and original scene colours were restored because they teach meaning. Preserve clarity, accessibility, responsive layout and keyboard use.

## 4. Product goals and hard constraints

**Learner experience:** A natural-method reader **inspired by the general pedagogy** of Ørberg's *Familia Romana*, but made of **original Latin stories, characters, exercises, marginal clues and illustrations**. Start extremely simple. Increase vocabulary, reading length and grammatical complexity gradually. Learner should develop **usable graded Latin reading and meaningful active listening/speaking practice**, not just flashcard recognition. English translation should be opt-in.

**Quantitative goals:** At least **1,500 genuinely introduced distinct Latin lexemes** by Chapter 90 and **3,000+ as an advanced stretch** by Chapter 130, when genuinely authored and reviewed content makes this defensible. Chapter 1 starts with a six-lemma budget; Book I retains at most 15 new lemmas in each teaching chapter, and review chapters introduce none. Later budgets increase only alongside longer, comprehensible and revisited reading. *Inflections, proper names, duplicates, and glossary-only entries must not falsely inflate counts.*

**Reliability:** Keep launch as easy as double-clicking `index.html` on Windows (Firefox/Chrome/Edge), including `file://` restrictions. Any new JSON/module system must have a tested **offline bundle/build output**; browser `fetch('lessons/...json')` from `file://` is not a viable assumed solution. No hidden installation or network dependency for learners.

**Continuity:** Keep existing lesson features, imported text, backups, glossary, quiz data and learner progress. Introduce durable ID/backup migration *before* chapter renumbering, and test it against both normal and malicious/corrupt backups. Migration must not silently map an old answer to a different new question. Do not wholesale rebuild the app.

**Audio truthfulness:** Treat three modes distinctly: valid synchronized imported MP3 intervals can drive sentence highlighting; untimed MP3 cannot automatically seek or highlight in sync; browser voice is not Ørberg/the original recording. Do not invent timings, pretend browser voices are native Latin, or bundle copyrighted recordings.

**Content rights:** Do not put *Familia Romana* or *Roma Aeterna* PDFs/OCR/audiobooks, scanned dictionaries, copyrighted pictures, secret keys or user-private archives into GitHub. Inspect precise licences/versions before integrating DCC data, Whitaker, Perseus, LatinCy, phonetic models or an authoring tool. Prefer offline preprocessing and original assets.

**Branching and deliverables:** Work from this exact branch and create **one new working branch on top** for the *next* development slice. Do not merge, create releases or stack unrelated PRs. Every completed future Claude handover must include **the full current program files + updated documentation and tests in a downloadable ZIP**, not just a memo.

## 5. Required remaining phases — explain *how* to do every one

### Phase A — finish the lexical registry and sentence-level audit (highest priority)

Design the concrete `lexeme_registry` schema with **stable, sense-disambiguated IDs**, canonical lemma with reviewed macrons, POS, inflection/paradigm metadata as useful, attested gloss, source/license, reviewer approval, and provenance to individual original lesson **sentence/token IDs**.

Specify how to use `legacy-token-audit.json` as a queue of *provisional candidates*, not authoritative morphology. Explain explicit manual resolution of the nine ambiguous glossary matches; non-obvious homographs (e.g. **`edō` “eat” vs `ēdō` “issue”**); inflected surface forms incorrectly used as glossary heads; proper names; and discrepancies between common spellings and the DCC CSV's compound entries. `fīlia/fīlius` may share one source record but are not automatically the same lexeme.

Define and demonstrate a **deterministic, offline compiler** converting *reviewed*, token-tagged Latin lesson sentences into:
- first-introduction unique lexeme counts per chapter;
- genuine repeated contextual encounters (including clear source sentence IDs);
- conflicts/unresolved-token reports that block “verified” publication;
- meaningful progress toward 1,500 and 3,000 milestones, with separate measures of *introduced*, *recognised* and *productively used* words.

**Acceptance:** A small reviewed test fixture with explicitly disambiguated words and deliberate failure cases (homograph, wrong macron, unknown sense, duplicated inflection, a proper name, review chapter introducing a new lexeme). The **actual full-course introduction ledger remains unchanged** until approved authored content is present. No false 124→verified conversion.

### Phase B — offline-safe lesson architecture and stable course IDs

Give a step-by-step plan to go from embedded `const L=[...]` data to **versioned, testable structured lessons** (e.g. `lessons/chNN.json` as *authoring* inputs), without breaking `file://` use. Compare two feasible delivery options:
1. compile all reviewed lesson JSON into a static `lessons.bundle.js` loaded from the local file path, with a fallback bundled in the single-page distribution;
2. compile approved data directly into `index.html` for one-double-click, dependency-free distribution.

Recommend one with concrete tradeoffs and specify source/build vs runtime files, schema validators, output reproducibility, maximum file/memory size and extension paths (future optional media). Provide a proposed folder tree and **exact JSON schema sketches** for `lesson`, `lectio`, `sentence`, `token`, `gloss`, `question`, and `review`.

**Stable IDs and migration:** distinguish the already frozen `legacy-ch01` namespace from the new planned `b01-c001` namespace. Explain stable question and sentence IDs, content revision IDs, preservation of numeric state, explicit human-approved mapping, migration backups/rollback and safe behaviour when a former chapter no longer corresponds to the new chapter. Include backup fixture tests, reimports, changed chapter order, changed question answer keys and user-written notes.

**Acceptance:** App still launches when a user double-clicks it with no server, existing eight original lessons remain usable, existing backup restores without corruption, and all current tests pass.

### Phase C — write and test the first **original Latin teaching pilot**

Recommend a small pilot of **Chapters VI–VIII** or another limited set clearly justified against the approved *v3* syllabus. Important: old legacy Chapter VI–VIII material **does not exactly equal** the proposed new chapters. Define a migration/edition-aware approach rather than replacing content and changing existing answer meaning.

For each pilot lesson, specify:
- a *Latinist-reviewed* 250–450-word beginner passage target across 2–3 meaningful `lectiones`;
- gradual vocabulary budget and actual source-traceable lemma ledger;
- one principal grammar pattern and carefully staged secondary material, avoiding overcrowding;
- illustrations with consistent **original** Roman-world characters and semantically meaningful colours;
- Latin-first contextual *margin clues*, synonyms, contrasts and picture labels that do not introduce inexplicable unseen words;
- 8–10 meaningful exposures for *priority* new vocabulary across story, question, image caption and rereading (count true occurrences honestly);
- comprehension checks **after each lectio**, 5–10 original exercises in the full chapter, and a rereading/review step;
- spoken tasks: listen and shadow a *verified* model, describe pictures, answer Latin questions, act out brief dialogues, retell a scene without scripted answers;
- a human review checklist for grammar, morphology, macrons, Roman-world plausibility and readability.

**Acceptance:** small playable pilot with old-vs-new state coexistence, tagged texts that pass the lexical compiler, working keyboard/mobile interaction, and one end-to-end backup/restore check. Measure authoring and review workload rather than projecting an unsupported delivery schedule.

### Phase D — verified audio, timed highlighting, voice and speaking features

Describe the audio authoring pipeline: source/record **lawfully usable, human-checked** Latin narration, clean/normalised file, sentence text alignment, timings `[{start,end}]`, manual QA, duration guards, and graceful fallback when timing is absent. Describe optional offline authoring aids such as forced alignment tools only after licence review.

Keep **timed MP3**, **untimed MP3**, and **browser voice** distinct in UI and tests. No fake synchronization or unsynchronised seeking. Recommend storage architecture for user-imported audio (optional IndexedDB only when needed) and test quota, browser private mode, restore and clear operations. Discuss optional audio player, play sentence versus continue, stop/pause/resume and honest voice labels.

For speaking: design **practice and assessment separately**; options for manual self-recording, comparison and teacher scoring; do **not** claim automatic pronunciation scoring accuracy without appropriate validated models. State how ordinary Windows browser privacy and microphone permissions affect usability, and offer a no-mic alternative.

### Phase E — expand the course in quality-controlled batches

Map a realistic sequence to write **Book I: Ch 1–50**, **Book II: Ch 51–90**, **Book III: Ch 91–130**, building in review stories and concrete checkpoints:
- planned budget by Ch 50: 500; by Ch 90: 1,532; by Ch 130: 3,036;
- mandatory **actual 1,500 unique introduced, approved lemmas** by the end of Book II and **3,000+** by advanced completion if achieved;
- zero new lexemes in review chapters; any unknown word in licensed classical excerpts is glossed but **not** called newly introduced unless it receives a complete teaching unit;
- progressive reading length, source-checked lexical inventory beyond the 997-row DCC CSV, repeated reading, real assessments and speaker-checked practice;
- separate readiness gates based on **unseen reading comprehension**, spaced retrieval and actual human-assessed speaking/interaction; not only chapter completion.

Discuss the feasibility of high later-chapter new-word loads (30–49), risks of student fatigue, how to modify chapter count or reading volume if pilots fail, and how to preserve an independent editable authoring workflow. Explain the difference between **introduced**, **understood**, **remembered** and **productively usable** Latin.

### Phase F — later features, only after curriculum fundamentals

Prioritise or defer: contextual spaced-repetition review, dictionary search, imported public-domain or licensed TEI/EPUB reading with provenance, offline morphological lookups, chapter-level images and content metadata, optional printable material, alternate voice engines, built-in media and content packs. Explain how licences, bundle size, offline operation, testing and progress migration affect each. Do not start an unrelated PDF.js/Dexie migration before its need and acceptance criteria are established.

## 6. Tests and baseline checks

Inspect exact existing scripts before modifying them. At minimum run / specify:

```bash
npm test
node scripts/build-legacy-lexeme-audit.cjs --check
node tests/legacy-lexeme-audit.test.cjs
node curriculum/validate-outline-v3.cjs
node curriculum/validate-roadmap-130.cjs
```

The following **must currently fail by design** until full approved Latin content exists:

```bash
node curriculum/validate-roadmap-130.cjs --require-introduced-1500
node curriculum/validate-roadmap-130.cjs --require-introduced-3000
```

Explain a CI matrix: Node unit/lexical-compiler tests, real Chromium and Firefox browser smoke at desktop and mobile viewports, `file://` launch test, keyboard/ARIA/accessibility, backup/restore and corrupt/malicious fixture tests, user imported-text mode, audio mode fidelity, progress migration and future curriculum-quality checks. Distinguish **tests actually run by Claude** from proposed tests.

## 7. Deliverable format for your response

Return one standalone file named **`CLAUDE_IMPLEMENTATION_ROADMAP.md`** containing:

1. **Executive state-of-project audit**: actual implemented, partial, planned and blocked; do not report roadmap targets as finished features.
2. **Dependency-ordered implementation phases** (A–F). For every phase give: goal, source paths, new files and edits, algorithms/data flows, build dependencies, copyright implications, concrete outputs, tests and objective definition of done.
3. **A prioritised backlog** (P0/P1/P2/P3): explicit issue/task IDs, small implementation slices, dependencies, estimated relative complexity, acceptance tests, which require Latinist/media/user input.
4. **Concrete design decisions and pseudocode/schema** for reviewed lexeme registry, token-to-lemma annotations, intro ledger generation, `file://`-safe build, stable content IDs, migration and backwards-compatible backups.
5. **A feasible 3-chapter content pilot specification** that shows how many original sentences/words, drawings, exercises, review checks, audio assets and reviewer sign-offs are required.
6. **Milestone gates** from 8 playable legacy chapters through fully verified 50/90/130, demonstrating actual 1,500+ and 3,000+ reviewed introduced words, separate reading and speaking milestones, and risks/tradeoffs.
7. **Exact next coding handover**: a single bounded first pull request for the lexeme registry (or a better justified alternative), its specific files and tests, and how to package the full runnable code for handback.
8. **What is missing or needs approval**, including source licensing, dictionaries, reviewers, original artwork/voices, course identity/progress decisions and feasibility of later vocabulary load.
9. **Tests performed vs not performed**, including the exact commit/ref reviewed.

Make the roadmap **usable without another conversational planning loop**. Prefer reversible changes, incremental PRs and independently testable results. If there is a genuine unresolved choice, give a recommended default and an alternative with a decision point. **Do not implement or merge anything yet.**

## 8. Important final reminder

The learner expects a **usable application**, not a series of handovers in place of software. Once the review/roadmap is approved, immediately transition to coding and shipping small real increments of the *program*, preserving the standalone Windows launch and complete ZIP delivery with every handover. Do not spend further cycles only rewording the 130-chapter outline.
