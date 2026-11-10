# LATIN X — Latin scholarship and educational audit

**Date:** 10 November 2026 · **Baseline:** `main` at `1803e55` · **Source files changed:** none (Phases 1–6 only; Phase 7 awaits owner approval)

Companion files in this folder: `LATIN_FINDINGS.csv` (every finding with file, record, correction, evidence, impact and test), `LATIN_SOURCE_REGISTER.md` (authorities and what each was used for), `LATIN_UNRESOLVED.md`, `LATIN_GOLD_TESTS.json` (run with `node scripts/run-latin-gold-tests.cjs`), `LATIN_INVENTORY.json` (every inventoried record) and `tools/inventory.py` (regenerates it).

## 1. Summary

| Measure | Count |
|---|---|
| Latin-bearing records inventoried | **1,214** |
| … of which learner-facing in the published app | 439 (legacy lessons 232, runtime glossary/cloze/UI 88, narration transcripts 75, picture prompts 44) |
| … unpublished drafts and tooling | 775 (Book I pilot 539, candidate lexicon 128, TTS prompts 75, paradigm samples 33) |
| Records reviewed by hand | 1,214 |
| Distinct word forms cross-checked against Collatinus | 477 (468 recognised; the 9 others are English words, exercise stems *aqu-*/*dōn-* and the post-classical *reconstrūctiō*) |
| Records verified against a primary authority (L&S, A&G or metre) for each disputed feature | all records carrying a finding, plus the preservation checks in the register |
| Confirmed errors | **21** (0 critical, 4 major, 17 minor) |
| Stylistic notes | 7 |
| Checked and found correct (recorded so nobody "fixes" them) | 2 |
| Unresolved | 9 (see `LATIN_UNRESOLVED.md`) |
| Existing test suite (`npm test`, plus `test:pilot`, `test:phase2`, `test:illustrations`, `test:paradigms`, `test:grammar`) | all pass on the baseline |
| New gold tests | 137: **110 preservation tests pass**; 27 correction tests are pending until fixes are approved |

The published course is in good shape grammatically. Every legacy sentence, translation, question and model answer was checked and the Latin is correct apart from one systematic vowel-length error. **This does not mean the program is entirely accurate**: audio was not listened to, and several items need a Latinist's or the owner's judgement (see section 6).

## 2. Scope and coverage (Phase 1)

| Source | Records | Learner-facing | Reviewed | Notes |
|---|---:|---|---|---|
| `lessons/legacy/ch01–ch08.json` (and generated `content/legacy/*.js`) | 232 | yes, graded | all | 67 sentences, 101 vocabulary rows, 24 questions, 8 cloze items, titles, contexts and grammar explanations. Generated JS confirmed identical by `npm run test:phase2`. |
| `app/legacy-runtime.js`, `index.html`, `app/65-picture-practice.js`, `content/music.js` | 88 | yes | all | 40-row shared glossary, guided-cloze copy, Latin UI strings, grading logic (`app/50-exercises.js` `gradeLegacy`). |
| `content/narration.js` | 75 | yes (audio transcripts) | text only | All 75 transcripts match the lesson text exactly. Audio not inspected. |
| `curriculum/picture-exercises-b01.json` / `content/picture-exercises.js` | 44 | separate practice page, ungraded | all | |
| `lessons/b01/c001–c008.json`, `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` | 539 | no (draft, not in catalogue) | all | 379 sentences, 48 questions, 44 picture items, 15 speaking prompts, titles and margins. Read in full in the manuscript. |
| `curriculum/lexicon/legacy-candidate-map.json` | 128 | no (unsigned) | all | Head words and glosses. |
| `docs/audio/arjun_lectio_*.json`, `ARJUN_CH1_REGENERATION_20261109.json` | 75 | no (generation input) | all | TTS respellings compared with canonical text. |
| `tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json` + `scripts/lib/paradigms.cjs` | 33 | no (proposal engine) | all + generator rules | Generator run on extra lexemes (urbs, rēs, pius) to test the rules. |
| `curriculum/vocabulary-budgets-130.json` | 143 seed lemmas | no (plan) | lemma heads only | All correct. |
| Planning prose, handovers, review notes, archived HTML, audition pages | file level only | no | not line by line | Listed in `LATIN_UNRESOLVED.md` U-09. |

Hidden or reachable-but-unpublished content: the Book I pilot is not in `content/catalogue.js`, so learners cannot reach it in the main app; the picture practice page is reachable from `Start Picture Practice.cmd` but saves no score.

## 3. Method (Phases 2–4)

1. Read every record and analysed morphology, agreement, case use and sense in context; checked each English translation and gloss against the Latin.
2. Checked educational logic separately: question keys, accepted answers, distractors, cloze answers and clues, and how `gradeLegacy` normalises input (case, punctuation and macrons are ignored; otherwise exact match against the accept list plus the model sentence).
3. Cross-checked all 477 word forms with Collatinus as a hint generator only, then looked up every disagreement and every suspected error in Lewis & Short or Allen & Greenough, and for *Titus* in attested verse.
4. Compared the eight legacy chapters with the owner's original v0.2 app to separate transcription errors from source errors (none of the findings is a transcription error).
5. Checked internal consistency: the same word spelled differently in different places, narration text against lesson text, model answers against readings.

## 4. Confirmed findings (Phase 4–5)

Full records, with existing text, correction, evidence, impact and regression test for each, are in `LATIN_FINDINGS.csv`. The ones that matter most:

### LX-001 · Major · *Tītus* should be *Titus* (short i)
- **Where:** 20 published legacy records (ch02 s006, s007, vocab, q001, q002, cloze, context; ch03 s002, s008, q002; ch04 s003, q001, cloze, context; ch05 s006; ch06 q002; ch07 s004, s006, q002; ch08 s003, q002), the shared glossary (`app/legacy-runtime.js`), 9 narration transcripts, 3 picture prompts, 104 pilot sentences and the art/character data. 781 lines in 71 tracked files in total.
- **Evidence:** Lewis & Short "Tĭtus"; Martial 1.17.1, 1.17.3 and 7.59.1 scan the first syllable short; A&G §108.c prints *Titus* unmarked beside *Mārcus*, *Gāius*, *Pūblius*.
- **Origin:** already present in the owner's v0.2 app, so it is a source error, not a transcription slip.
- **Correction:** *Titus, Titī, Titō, Titum*. Grading ignores macrons, so learners' answers are unaffected; the fix changes displayed text and TTS input.
- **Knock-on effects to plan for:** the legacy content lock and compiled-content tests will fail until the legacy source is regenerated through the compiler (a trial edit in a scratch copy confirmed `tests/compiler.test.cjs` fails on a direct edit); narration `canonical_text` must change in step; the nine Chapter II–VIII recordings that say Titus should be checked by ear.

### LX-002 · Major (draft) · Self-contradictory sentence
`b01-c002-s039` *Vir et fēmina nōn in hortō sunt: vir in hortō est, fēmina in vīllā.* says the man is not in the garden and then that he is. Proposed: *Vir in hortō est, sed fēmina in vīllā est.*

### LX-003 to LX-006 · Paradigm generator (latent, not yet used by learners)
The proposal engine and its owner-review samples contain four rule errors. Two of them are major because signing the patterns as they stand would make the compiler reject correct Latin:
- 5th declension accusative *diēm*, *rēm* → *diem*, *rem* (A&G §96 Note). The test fixture asserts *diēm*, so `npm test` passes on a wrong form.
- 5th declension genitive/dative *rēī* → *reī* for *rēs, spēs, fidēs* (A&G §96 Note); the engine rejects the correct genitive.
- Masculine/feminine i-stem ablative defaults to *-ī* (*urbī*, *cīvī*) → *-e* in most nouns (A&G §76).
- Adjectives in *-ius* get vocative *-ī* (*pī*) → *-ie* (A&G §49.c).
**Recommendation:** do not sign the `noun-5` or `noun-3-i` patterns until these rules are fixed.

### LX-007 to LX-015 · Latin in the interface (minor)
*Rēlege* → *Relege* (prefix re- is short: L&S, A&G §604.a.1); *Rectē* → *Rēctē*; *Lectiō*/*lecta* → *Lēctiō*/*lēcta* (the course itself writes *Lēctiō*); *Progressus* → *Prōgressus*; *Elige*/*electum* → *Ēlige*/*ēlēctum*; *Musica* → *Mūsica*; *Prima Via · Discere legendo* → *Prīma Via · Discere legendō*; *responde* → *respondē* (the same screen already writes *Respondē*); *Recordātiō* means "recollection", not an audio recording.

### LX-016 to LX-020 · Consistency and assessment logic (minor)
- Pilot c007 q003 model answer uses *Gāiī* where the reading uses classical *Gāī*.
- Two published cloze items reject story-consistent answers (*Mārcus duo māla habet*, *Canis in viā est*).
- Five published short-answer questions reject valid word orders or equivalent subjects (*Tītus Līviae frāter est*, *Legit librum*, *Māter aquam portat*, *Sōl hodiē lūcet*, *Rosās Līvia portābit*). The UI tells learners only the expected word or full model sentence is accepted, so this is disclosed, but correct Latin is still marked "Nōndum".
- Picture item c007 q008 *Quō canis currit?* keys only *porta*; the reading says *ad portam … ad Līviam*, so *Līvia* is also right.
- TTS respellings spell short i/u as "ee"/"oo" and make *Gāius* two syllables; effect on audio unverified.

### Stylistic notes and checked-correct items
LX-021 to LX-030: a slightly narrow explanation of *-t* (ch04), *vīlla* glossed "house", later-chapter distractors, two pilot margin forms that break the pilot's own sequencing rule, "I · Hortus" vs the chapter title *In hortō*, *multus* = "many", post-classical *reconstrūctiō*, the brand *Tablinum* vs L&S *tablīnum*. *Hic* (pronoun, unmarked) and *herī* were checked and are correct.

## 5. Reconciliation with the earlier AI reports (Phase 6)

`LATIN_CONTENT_REVIEW.md` and `AUDIT_REPORT.md` (PR #3) were an engineering audit and said explicitly that no linguistic review had been done. They make no Latin claims that conflict with this audit; this audit fills that gap. The earlier picture-prompt review and the pilot drafter's notes were compared item by item; the disagreements and how evidence settles them are tabled in `LATIN_UNRESOLVED.md`. Agreement between AI reviews was not counted as evidence anywhere.

## 6. What this audit did not do

- No recording was listened to. Audio pronunciation, stress and timing are unverified (U-01).
- No source file, answer key, status, save key or audio file was changed. The only additions are this folder and `scripts/run-latin-gold-tests.cjs` (read-only; not wired into `npm test`).
- DCC, Logeion, Perseus and PHI web sites were blocked by the environment's network policy; the same texts were used from their published data sets (see the source register).
- Planning prose and historical handovers were inventoried by file, not reviewed line by line.

## 7. Proposed implementation plan (Phase 7, after approval)

1. Owner approves or rejects each finding in `LATIN_FINDINGS.csv` (suggested batches: LX-001; LX-002 + LX-016 + LX-019 + LX-024 drafts; LX-003–006 generator; LX-007–015 UI; LX-017–018 accept lists).
2. LX-001: change the legacy source text, regenerate `lessons/legacy` and `content/legacy` through `scripts/compile-content.cjs`, update the narration catalogue transcripts, the legacy content lock and the fingerprints and `question_text` copies in `curriculum/lexicon/legacy-id-map.json` in the same commit, then regenerate the pilot from its manuscript. Saved learner progress is keyed by chapter/question index and stable IDs, and saved words by the macron-free head (`titus`), so no save data has to migrate.
3. UI strings and accept lists: direct, minimal edits.
4. Paradigm engine: fix rules, correct the fixture to *diem*, regenerate `docs/owner/PARADIGM_SAMPLES.md`.
5. Flip each approved correction test in `LATIN_GOLD_TESTS.json`, then run `npm test`, the five extra suites and `node scripts/run-latin-gold-tests.cjs`; wire the gold runner into `npm test` once all approved corrections pass.
