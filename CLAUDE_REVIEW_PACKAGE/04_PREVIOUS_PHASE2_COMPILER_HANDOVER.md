# LATIN X — Phase 2 lesson compiler foundation: implementation and handover

**Prepared:** 5 November 2026  
**Development branch suggested (not merged or pushed):** `feature/phase2-lesson-compiler-20261105`  
**Authoritative input ZIP:** `Latin-X-fix-phase1-owner-tier-next-steps-20261105.zip`  
**Implementation state:** Phase 2 *engineering foundation*, **not** Phase 2 final acceptance or completed Latin course.

## What was actually implemented

1. `scripts/legacy-to-lesson.cjs` exports **8** original chapters into `lessons/legacy/ch01.json` … `ch08.json` with explicit, stable chapter/sentence/question IDs, preserved original Latin and English, question arrays and cloze source. It uses the Phase 1 token audit to keep provisional candidate links but sets `lx:null`, `review_status:unreviewed`. `--check` byte-verifies against regenerated sources. No source text, audio, gloss or old storage key is changed.
2. `scripts/compile-content.cjs` is a deterministic Node 22, zero-dependency compiler (`--check` for reproducibility). It checks source IDs and retired IDs, chronology/book alignment to the 130-row plan, lesson and sentence token surfaces, Unicode word offsets for legacy, reviewed morphology/form evidence for approved lessons, distinct signed lesson reviews, course word derivation, declared new words, planned word budgets, review-chapter zero-new-words, sentence length/reading length, an initial 12-feature grammar map, partial coverage and recurrence. It fails closed with source location and token details. Drafts are checked for structure but **excluded** from content and lexeme counts.
3. Generated classic-script-compatible outputs are under `content/legacy/*.js`, `content/catalogue.js`, `content/lexicon.js`, intended for **future Phase 3** loader wiring. They are **not** included by the original `index.html` today. Obsolete generated content scripts are detected/removed without deleting unmanaged files.
4. The existing `curriculum/vocabulary-introductions-130.json` now records `generated_by` and `generated_from_hash`, has **zero** approved new-course lexemes, and is verified against fresh derivation by `curriculum/validate-roadmap-130.cjs`. A changed ledger cannot be accepted as independently handwritten evidence. The 1,500/3,000 strict gates remain unmet.
5. Human-readable generated reports: `reports/coverage-b01.md`, `reports/recurrence.md`, `reports/grammar-violations.md` (no course approvals yet). `scripts/render-plan.cjs --check` verifies that the **130-row Markdown table** matches `vocabulary-budgets-130.json` exactly, without touching narrative/editorial prose.
6. `scripts/new-lesson-draft.cjs <chapter 1..130>` scaffolds a new course chapter from the current plan. `lessons/b01/c001.json` exists as a **blank, unapproved, unplayable** starter and contains the real Chapter 1 teaching brief. It does not pretend to be 250–360 words of authored Latin.
7. `tests/compiler.test.cjs` covers old-text round-trip, stable IDs, duplicate/retired IDs, drafts excluded, approved synthetic fixtures, reviewer signs, first-context introduction, unapproved lexical IDs, form and macron evidence, grammar rule checks, missing glosses, exercise-only vocabulary and pending future recurrence. Synthetic "reviewers" live only in tests and do **not** write to production ledgers.
8. `npm test`, `npm run test:lexemes`, and `npm run test:phase2` cover existing app and Phase 1/2. GitHub Actions recipe added for Linux and Windows, but not run on GitHub in this handback.

## Deliberately unchanged / not done

- `index.html` / all 8 original app chapters, styling, original input behavior, timed/untimed audio, saved v4 progress and backups, and `Start Tablinum.cmd` are **unchanged**. No runtime loader or v5 migration is implemented; that is Phase 3.
- **Zero** of the 128 Phase 1 glossary rows have actual signed owner or Latinist review. The separate `legacy-candidates-claude-draft.csv` mentioned in the prior request was not among the uploaded source files. The existing 32-column CSV is the editorial review queue, not approved words.
- No new 130-course chapter is authored, certified or playable. Chapter 1 is a blank scaffold. 1,500/3,000 are **planned** vocabulary milestones, not words taught.
- The grammar map contains only an initial 12 source-plan-based rules. It is not exhaustive or independently verified. Manually annotated syntactic features and fully reviewed inflection paradigms remain necessary. The initial form gate requires explicitly reviewed `forms` instead of claiming a complete paradigm generator exists.
- Recurrence requires 8 reading occurrences on introduction for Book I (6 in Books II–III), 4 in next 3 chapters and a hit in the next review chapter. Future unwritten chapters are clearly **PENDING**, never automatically counted as passed. The full frequency/morphology/syntax pipeline still needs work.
- No source PDF, audiobook, third-party archive, private backup, dictionary scan, or unverified rights material was included or distributed in this ZIP.
- Browser Playwright smoke tests were **not performed** here because the `playwright` dependency is not installed in this environment. CI is configured, but its results are not claimed.

## How to use this complete ZIP (Windows, no installs for learner)

Unzip the whole folder and double-click **`Start Tablinum.cmd`**, or open `index.html` directly. The existing eight-chapter app works offline; no build step is needed to open it. The new Phase 2 tools run on Node 22 and are for authoring/review only.

```powershell
npm test
npm run test:lexemes
npm run test:phase2
node curriculum/validate-roadmap-130.cjs
node scripts/compile-content.cjs --check
node scripts/legacy-to-lesson.cjs --check
node scripts/render-plan.cjs --check
```

To scaffold the next *unwritten* chapter:

```powershell
node scripts/new-lesson-draft.cjs 2
```

It refuses to overwrite an existing chapter. Author original Latin sentences and token tags, then use `node scripts/compile-content.cjs` to regenerate developer content and reports. Drafts never publish. **Do not edit the vocabulary introductions ledger by hand.**

## Next implementation tasks (priority order)

1. **Unblock Phase 1 editorial review:** obtain/prepare the missing actual 128-row Claude draft CSV; perform original human owner review in the 32-column review sheet, with explicit `owner` tier, real signature/date, checked lemma, macrons, evidence and licence, or signed rejection. Never sign on behalf of the owner. Verify with `--dry-run` and `--require-review-ready` after all source coverage is resolved.
2. Finish the Phase 2 linguistic and pedagogical checks: complete grammar features from the reviewed syllabus, add verified regular/irregular inflection form generation, tighten token-offset and syntax checks, add upcoming-chapter recurrence, primary-vs-review thresholds and rubric fixtures.
3. Author actual **original** graded Chapter 1 Latin text (250–360 tokens), translation/hints, comprehension questions, spoken prompts and 8+ meaningful reading encounters for each new approved lemma; secure review of every word/tag/answer before promotion. Extend systematically through Book I, then Books II–III. Do not borrow Ørberg/Familia Romana passages.
4. After independent tests and signed lesson approvals, connect generated content to the browser as Phase 3 in **three distinct steps** (relocate scripts, loader, v4→v5 backed-up migration) and validate `file://` on Windows and mobile. Do not start a data migration in this compiler-only build.
5. Add authored, aligned audio, grammar tutor, spaced repetition and new course UX only after the corresponding source/licence and browser work is verified. Preserve explicit MP3 timed/untimed and browser voice distinctions throughout.

**No merge, release, main-branch rewrite, or GitHub upload was performed in this handback.** The full source and runnable app are included together.