# Claude review: Tablinum 130-chapter curriculum (1,500 → 3,000 words)

**Reviewed:** 4 November 2026 (the package is dated 5 November)
**Package:** `Latin-X-plan-latin-3000-word-curriculum-20261105.zip`, branch `plan/latin-3000-word-curriculum-20261105`
**Scope:** review only. Nothing was changed, merged or rebuilt.

---

## 1. Executive assessment: **Conditional — revise before authoring**

The plan is honest and well structured. It keeps the user's 15-word beginner ceiling, separates *planned* from *introduced* vocabulary, keeps the verified ledger empty instead of faking it, and treats reading and speaking as separate skills. The Familia Romana research is accurate where I could check it.

It is not ready to drive authoring yet, for five reasons:

1. **Grammar order has real dependency errors.** Topics are used before they are taught: sequence of tenses (ch 99) is needed by ch 67–68; ablative uses (ch 51–58) are needed by the ablative absolute (ch 43); the pluperfect subjunctive is used in ch 79 but never introduced. Several very common constructions are missing altogether (*cum* + subjunctive, negative purpose with *nē*, 3rd-declension adjectives, imperfect and future passive).
2. **About a dozen chapter titles contain Latin errors**, including one that is nonsense (ch 93 *Agerī dēspōnsī*). These titles will be copied into lesson files.
3. **The early chapters are too short for the plan's own repetition rule.** Twelve new words × 8–10 encounters cannot fit into a 100–220-word story (chapters 1–10).
4. **The app cannot scale to this plan as built.** Lesson JSON files can't be loaded when `index.html` is opened directly from disk, and saved progress is keyed by chapter *number*, which the new outline renumbers.
5. **The authoring load is very large.** The plan calls for 154,000–232,000 words of original, reviewed Latin, plus art and audio. A pilot is needed to measure real cost before committing to 130 chapters.

None of these are reasons to drop the plan. All of them are fixable in the outline before any chapter is written.

---

## 2. Tests run and not run

| Check | Result |
|---|---|
| Compared app `index.html` with the previously reviewed manuscript build (`cmp`) | **Identical.** No app changes in this package. |
| Recomputed `vocabulary-budgets-130.json` with Python (my own script; the package's JS was not executed) | 130 chapters; cumulative total **3,036**; every `cumulative_target` matches the running sum; all 28 review chapters have 0 new words. Total planned reading: **154,400–232,000 words** (Book I 15–31k, Book II 50–71k, Book III 90–130k). |
| Seed-list fixes from the last review | Applied: *fīlius* is now matched through the combined `fīlia; fīlius` row, *bibō* is corrected, *magnus* is chosen as house spelling, and *edō*/*ēdō* are separated in the ledger schema. |
| Research claims, fetched live on 4 Nov 2026 | See section 5. |
| `npm test`, `validate-outline-50.cjs`, `validate-roadmap-130.cjs` (including the `--require-introduced-*` gates) | **Not run.** Executing code from the upload is blocked in this review environment. My Python recomputation covers the arithmetic the roadmap validator checks, but not its schema checks. |
| Browser, mobile, TTS, real audio, Latinist review | **Not run.** |

---

## 3. Findings

Severity: **P0** blocks the plan; **P1** fix before authoring starts; **P2** fix before that book is written; **P3** polish.

### 3.1 Grammar sequencing (CURRICULUM_130_MASTER_PLAN.md and vocabulary-budgets-130.json)

| ID | Sev | Chapter(s) | Problem | Fix |
|---|---|---|---|---|
| G1 | P1 | 67–68 vs 99 | Ch 67 (perfect subjunctive in indirect questions) and ch 68 (*Dīxit ut venīret*, imperfect subjunctive after a past verb) both depend on **sequence of tenses**, which is not taught until ch 99, and then only as "limited practice". | Introduce primary and secondary sequence at ch 68, with the imperfect subjunctive. Make ch 99 a consolidation chapter. |
| G2 | P1 | 79 | *Sī anteā vīdissem* uses the **pluperfect subjunctive**, whose forms are never introduced. | Add a pluperfect-subjunctive step at ch 78–79 or split the chapter. |
| G3 | P1 | 43 vs 51–58 | The **ablative absolute** (ch 43) comes before the ablative of means, cause and manner (ch 51–58). Learners meet the hardest ablative use first. | Either move the ablative uses forward into Book I (around ch 12 and 34–40), or move the ablative absolute to about ch 60. I recommend the first, because ablative of means and manner is everywhere from the start. |
| G4 | P1 | missing | **Circumstantial and causal *cum* + subjunctive** is among the most frequent constructions in narrative Latin. It appears only as "temporal clauses with *postquam* and *cum*" at ch 109. | Add a teaching chapter around ch 70–75, after the imperfect subjunctive. |
| G5 | P1 | missing | **Negative purpose with *nē*** (and *nē* in indirect commands) is missing; only affirmative *ut* is taught (ch 50, 68). | Teach it alongside ch 50 or 68. |
| G6 | P1 | missing | **3rd-declension adjectives** (*omnis, fortis, ingēns, celer*) are never a focus, though *omnēs* appears in the first stories. | Add after ch 34 (3rd-declension nouns). |
| G7 | P2 | missing | **Imperfect, future and pluperfect passive** are missing. Only the present (38) and perfect (39) passive are taught. | Add one chapter in early Book II. |
| G8 | P2 | missing | **Fear clauses** (*timeō nē*), **impersonal verbs** (*licet, oportet, placet*), **superlative forms** (ch 112 covers only "nuance"), **adverb formation**, **supine**, **future active participle as a form** (ch 83 uses it only inside the infinitive), the **full irregular verbs** (*ferō, volō/nōlō/mālō, eō*) and the **vocative**. | Distribute across Book II. Superlatives belong right after comparatives (ch 46). |
| G9 | P2 | 50 | The **present subjunctive** first appears inside a purpose clause, with no step for its forms. | Spend the first lectio of ch 50 on the forms (*-et* vs *-at*), or move purpose clauses one chapter later. |
| G10 | P2 | 44 vs 40 | Deponents arrive at ch 44, but *sequor* already appears in the ch 40 story ("follows a boy"). | Rewrite the ch 40 story without *sequitur*, or move deponents earlier. |
| G11 | P3 | 1–50 | The 50-chapter audit allows up to 570 new words; the 130-chapter plan budgets 500 for the same chapters. | Pick one figure and update both files. |
| G12 | P3 | 129–130 | Ch 130 is "zero new core lemmas", but ch 129's authentic excerpts will bring in unplanned vocabulary. | Count excerpt vocabulary as *glossed, not introduced*, and say so in the counting rules. |

### 3.2 Latin errors in titles and labels

| ID | Sev | Ch | Current | Correct | Note |
|---|---|---|---|---|---|
| L1 | **P1** | 93 | *Agerī dēspōnsī* | *Dē agrō contrōversia* or *Līs dē agrō* | *Agerī* is not a form of *ager* (genitive *agrī*); *dēspōnsī* means "betrothed". The title is nonsense. |
| L2 | P1 | 96 | *In thermae* | *In thermīs* | *In* + place needs the ablative plural. |
| L3 | P1 | 28 | *Liber anteā missus* | e.g. *Epistula iam vēnerat* | The title uses a perfect passive participle (taught ch 39) in a pluperfect chapter, and calls a letter a *liber*. |
| L4 | P2 | 18 | *Veni hūc!* | *Venī hūc!* | The imperative has a long ī. |
| L5 | P2 | 20 | *Mē vides?* | *Mē vidēs?* | |
| L6 | P2 | 63 | *Si pluit* | *Sī pluit* | |
| L7 | P2 | 81 | *Nūntius dixit eum venīre* | *…dīxit…* | |
| L8 | P2 | 84 | *Audīvit ianuam aperīrī* | *…iānuam…* | |
| L9 | P2 | 91 | *Fabula de fonte* | *Fābula dē fonte* | |
| L10 | P2 | 62, 119 | *Consilium* | *Cōnsilium* | |
| L11 | P2 | 75 | *Dies festus* | *Diēs fēstus* | |
| L12 | P2 | 103 | *Epistula senatoris* | *Epistula senātōris* | |
| L13 | P2 | 112 | *Rēs parvae, magnae curae* | *…cūrae* | |
| L14 | P3 | 88 | *Quō meliore viā?* | e.g. *Quā viā melius?* | The title as written doesn't illustrate degree of difference and is awkward. |

**Recommendation:** run every Latin string in the curriculum files, including titles, through a macron check (latin-macronizer, offline) and then a human pass. The errors cluster in Books II–III, which were plainly drafted faster.

### 3.3 Vocabulary ramp and reading length

| ID | Sev | Problem | Evidence | Fix |
|---|---|---|---|---|
| V1 | P1 | **The early chapters can't meet the 8–10-encounter rule.** | Ch 10 budgets 12 new words in 100–220 running words. Twelve words × 9 encounters is ~108 words, half to all of the story. Chapters 1–10 all have this problem. | Raise the early length targets to about 250–450 words in 2–3 lectiones, or count encounters across the story, picture labels, questions and drill (and say so in the rule). |
| V2 | P2 | **The legacy eight chapters exceed their new budgets.** | The old ch 1 alone introduces about 12 words (*hortus, arbor, puella, magnus, parvus, videō, sedeō, laetus, sub, est, in, hic*) against a budget of 6. Its `source_seed_lemmas` already lists 7. | Treat the legacy chapters as source material to rewrite, not lessons to preserve as-is. |
| V3 | P2 | **The step from Book I to Book II is a length jump, not a word jump.** | Ch 50 is 500–900 words; ch 51 is 850–1,250 words, nearly double. | Fine if Book II opens with two easier chapters. Keep the new-word rate at 15–17 for ch 51–55. |
| V4 | P2 | **The Book III rate is plausible but only with strong support.** | 46–49 new words in 1,800–4,000 words means about 2–3% of tokens are first encounters. That is comfortable only if every other word is genuinely known. This matches the Familia Romana pace (about 1,800 words in 35 chapters, roughly 51 per chapter), so it is realistic, but only if Book II retention is actually measured. | Make Book III entry conditional on a recognition check over Book I–II vocabulary, not on chapter completion. |
| V5 | P1 | **The authoring volume is the real risk.** | 154,000–232,000 words of original Latin, each needing human review, plus about 100 illustrations and audio. My rough estimate (not a measurement): at a careful 300–500 reviewed words per hour, that is 300–800 hours of writing and review before art and audio. | Run the pilot (section 6) and measure real hours per chapter before committing to Books II–III. |

### 3.4 Vocabulary accounting and the lexeme registry

The counting rules in `FAMILIA_ROMANA_RESEARCH.md` §E and the ledger schema are **sound**. They separate introduced, recycled, recognised and productive use; don't count inflected forms, names, glossary mentions or quiz options; and keep homographs apart. This is better than most published courses.

Two design problems:

| ID | Sev | Problem | Fix |
|---|---|---|---|
| A1 | P1 | **The ledger is maintained by hand and separately from the lessons.** That makes it impossible to check the 8–10-encounter rule, and the two will drift apart. | Make the **lemmatized lesson file the single source of truth**: every token carries a `lexeme_id`. Generate the ledger, first-introduction chapter, exposure counts and review-chapter "zero new" checks automatically from the lessons. Human review then signs off a *chapter*, not 3,000 individual rows. |
| A2 | P1 | **There is no plan for words 1,000–3,000.** The DCC list stops at about 1,000. | Build `lexeme_registry.json` offline from the user's existing resources: **LatinCy** to lemmatize, **Whitaker's Words** for morphology and short glosses, **Lewis & Short** (Perseus lexica, CC BY-SA) to verify headwords and macrons, and **frequency counts over the Perseus Latin corpus** (canonical-latinLit) to rank words 1,001–3,000. Every entry records its source, licence and reviewer. |
| A3 | P2 | Proper names are excluded from the count. Good, but Roman-culture words (*thermae, forum, toga, impluvium*) need an explicit rule. | Count them as lexemes if they are taught as common nouns. |

### 3.5 Speaking and real competence

The skill loop (interpretive, listening, interpersonal, presentational) is the right frame, and the plan rightly says that 3,000 words is not fluency. The checkpoints are written as descriptions, not as tests, so nobody can tell whether they were met.

| ID | Sev | Fix |
|---|---|---|
| S1 | P2 | Turn each checkpoint into a concrete task with a pass mark. Examples: **ch 25:** answer 10 spoken Latin questions about an unseen picture, 8 understandable. **ch 50:** 60-second picture narration in Latin plus a 6-turn scripted shop dialogue. **ch 90:** read an unseen 600-word graded passage, answer 10 Latin questions (80%), and hold a 3-minute guided conversation. **ch 130:** summarise an unseen 1-page passage aloud and answer follow-up questions. A teacher or capable Latin speaker marks the speaking tasks. The app records but does not score speech. |
| S2 | P2 | Speaking needs a model voice. TTS is not acceptable as the model for 130 chapters. Plan human recordings for at least every lectio of Book I (see handover §7). Use shadowing and retelling only once recordings exist. |
| S3 | P3 | Add circling-style Latin Q&A (*Estne Līvia in hortō? Ubi est Līvia? Quis in hortō est?*). It is the cheapest way to get spoken repetition from the same story. |

### 3.6 App architecture (unchanged index.html)

| ID | Sev | Problem | Fix |
|---|---|---|---|
| R1 | **P0 for scaling** | **Lesson JSON files can't be loaded from `file://`.** The plan moves lessons into `lessons/chNN.json` but keeps "open `index.html` directly, Windows-friendly". Chrome and Edge block `fetch()` of local files from a `file://` page. | Build step: compile the lesson JSON into `lessons.bundle.js`, loaded with `<script src>`, which works from disk. For large content and audio, ship as a PWA, or a tiny local server via the existing `START_WINDOWS.bat`. Decide this before migrating. |
| R2 | P1 | **Progress is keyed by chapter number** (`answers["2:1"]`, `hintLevels`, `notes`, `readingConfidence`). The new outline swaps old ch 3 and 4 and inserts chapters, so saved progress would attach to the wrong lessons. | Give every chapter a stable slug ID (`cena`, `donum`) and every question a stable ID. Write a one-time migration from the v0.2–v0.4 keys. Bump the state version. |
| R3 | P2 | Audio for 130 chapters won't fit the current per-session object-URL model. | IndexedDB media store (already in the handover backlog). |
| R4 | P2 | The 1,000-line single file will become unworkable. | Split into modules with a build step (it's needed for R1 anyway), keeping a single-file "offline edition" as a build output. |
| R5 | P3 | Validators exist but nothing checks lesson *content* (exposures, review chapters with zero new words, macron consistency). | Add these to the lesson build once A1 is in place. |

---

## 4. Pedagogical audit summary

| Area | Verdict |
|---|---|
| Overall structure (3 books, 50/40/40) | **Good.** It keeps the beginner ceiling and grows reading length rather than front-loading words. |
| Book I pace | **Good** (6 → 15 per chapter), but the early stories are too short for the repetition rule (V1). |
| Book II pace | **Acceptable.** The ramp from 17 to 47 is steep in the second half; keep ch 51–55 gentle (V3). |
| Book III pace | **Realistic** at Familia Romana density, if Book II retention is verified (V4). |
| Grammar order | **Needs revision:** G1–G6 are real dependency or coverage errors. |
| Meaningful repetition | **Rules are right, enforcement is missing:** A1 makes it checkable. |
| Speaking goals | **Right intent, untestable as written:** S1. |
| Review cadence | **Good:** every 4th chapter in Book I and every 5th in Books II–III, all with zero new words (verified). |
| Copyright boundaries | **Good.** Clearly stated; no protected text, characters or images used. |

---

## 5. Research verification

| Claim in FAMILIA_ROMANA_RESEARCH.md | Checked against | Result |
|---|---|---|
| FR has 35 chapters, 2–3 *lectiones* each, *Grammatica Latina*, 3 *Pensa*, marginal notes | [Hackett, Familia Romana](https://hackettpublishing.com/lingua-latina-per-se-illustrata-series/familia-romana-part-i/lingua-latina-pars-i-familia-romana-full-color-edition) | **Verified.** The page says "thirty-five chapters", "two or three lessons (lectiones)", "Grammatica Latina", three "Pensa" and "an ingenious system of marginal notes". |
| "Almost 1,800 words" | Same page | **Verified** ("A vocabulary of almost 1,800 words"). This is publisher marketing; the counting method isn't stated. |
| *Roma Aeterna* about 3,000 words; overlap with FR unknown | [Hackett, Roma Aeterna](https://hackettpublishing.com/classics/lingua-latina-pars-ii-roma-aeterna-second-edition-with-full-color-illustrations) | **Verified** ("Approximately 3,000 vocabulary words"). The page does **not** say whether this is cumulative, so the research file is right not to add the figures. |
| DCC: about 1,000 lemmas, about 70% of word forms; CC BY-SA 3.0 | [DCC core vocabulary](https://dcc.dickinson.edu/vocab/core-vocabulary) | **Verified.** "approximately 70% of the word forms in a typical Latin text"; CC BY-SA 3.0 Unported. |
| Ørberg 1,811 lemmas (Muccigrosso 2004) | Same page | **Verified.** "843 lemmas (Wheelock's Latin) to 1811 (in Ørberg's Lingua Latina)", citing Muccigrosso 2004, p. 431. |
| Diederich 1,500 words about 85% | Same page | **Verified** (the page spells it "Deiderich"). |
| DCC "1,500-lemma ~80% coverage goal" | Same page | **Not found** on the page I fetched. It may be elsewhere on the DCC site; add the exact link or drop the figure. |
| Schola Latina reread-after-each-lectio advice; Australian Curriculum; ACL standards; ACTFL modes | — | **Not checked.** They are plausible and correctly hedged in the file. |

---

## 6. Recommended first development slice

Keep it small, testable, and representative of the real cost.

1. **Fix the outline** (P1 items G1–G6, L1–L3, V1) and re-issue `CURRICULUM_130_MASTER_PLAN.md` and `vocabulary-budgets-130.json`. No app changes.
2. **Decide the architecture** (R1, R2): stable chapter slugs, a lesson bundle that works from `file://`, and a state migration. Implement it with only the **existing eight chapters** moved into the new format. Prove that old saved progress survives.
3. **Pilot three chapters, end to end:** the new **ch 6 *Forum*, ch 7 *Canis in viā* and ch 8 *Tempestās*** (present tense), written fresh to the plan's rules:
   - 250–450 words each, 2–3 lectiones
   - every token tagged with a `lexeme_id`
   - 8–10 encounters per new word, checked by script
   - Latin-only margin notes and step-1 hints
   - a 5–10-item drill and Latin Q&A
   - one illustration per chapter, from the art guide
   - one human audio recording per chapter
   - Latinist sign-off
4. **Measure:** hours to write, review, illustrate and record each chapter. Then re-plan Books II–III on real numbers.

---

## 7. Next handover actions (one review-and-patch cycle each)

1. **Outline v2:** fix grammar order (G1–G10), titles (L1–L14) and early lengths (V1), and reconcile 500 vs 570 (G11). *Deliverable:* revised plan, JSON and a changelog.
2. **Registry design:** a `lexeme_registry.json` schema and a build script that derives the ledger from lemmatized lessons (A1, A2), demonstrated on the legacy eight chapters.
3. **Architecture spike:** stable slugs, `lessons.bundle.js` from JSON, the v0.4 → v0.5 state migration, and tests (R1, R2).
4. **Pilot ch 6–8** as in section 6, with the content checks (R5).
5. **Assessment tasks:** concrete checkpoint tasks for ch 25 and ch 50 (S1).
6. **Art:** character sheets plus the three pilot illustrations (handover §10).
7. **Only then** extend Book I chapter by chapter, in batches of about 4 with a review chapter, each batch reviewed before the next.