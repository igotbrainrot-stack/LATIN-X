# Tablinum curriculum v3 — Response to Claude's follow-up review

**Prepared 5 November 2026.** Reviewed source: [TABLINUM_REVIEW_20261105.md](reviews/TABLINUM_REVIEW_20261105.md) (section “Update: curriculum v2 check (5 Nov)”).

**Scope of this review-and-patch cycle:** the requested four remaining issues were corrected in the **130-chapter outline**, not in the eight-chapter running program. Nothing has been merged into `main`, no lessons have been authored, and no new vocabulary has been certified as introduced.

## Review findings resolved in planning files

| Original review item | Actual v3 change | Qualification |
|---|---|---|
| P1: *is/ea/id*, *eius* omitted | **Ch 20** is now a third-person anaphoric pronoun chapter, with clear staged `is/ea/id`, `eum/eam` and possessive `eius` examples | Earlier `mē/tē` contrast now appears in Ch 11 and `nōs/vōs` in Ch 16 |
| P1: *meus/tuus*, *sē/suus* omitted | **Ch 14** includes a clearly stated mini-lectio on the possessive adjective family `meus/tuus`. **Ch 26** contains a contrasting reflexive mini-lectio on `sē`, `suus` versus `eius` | These are **secondary applications** within an adjective-agreement chapter and a perfect-tense chapter. A Latinist/teacher should judge cognitive load rather than treating them as separate full grammar chapters |
| Demonstratives *hic/ille* first appear at Ch 71 | **Ch 15** now introduces nominative near/far demonstratives `hic/haec/hoc` and `ille/illa/illud`, with `hī/illī` in a familiar plural-noun scene; **Ch 71** consolidates the full oblique-case paradigms | Chapter 15's picture-supported secondary lectio must be evaluated for overload, and the canonical headword IDs must be checked |
| Ch 81 repeats Ch 42 | **Ch 81** now teaches **`eum/eam` versus reflexive `sē` in reported speech**, with the ACI construction explicitly reused from Ch 42 | Ch 82 perfect infinitive and Ch 83 future infinitive remain unchanged |
| Vocative Ch 54 too late; plural imperatives absent | **Ch 18** now introduces common vocatives alongside positive singular commands (`Mārce!`, `Tīte!`). **Ch 54** becomes an explicit **plural imperative** chapter (`venīte, audīte, portāte`), revisiting direct address | Both are tightly coupled to a command/dialogue scene |
| Latin title macron errors | Corrected Ch **76** `discēdat`, **78** `habērem`, **85** `Rūmōrēs`, **94** `Vōx`, **120** `Cōnsilium` | This is not a full Latinist sign-off of all 130 titles |
| Seven seed-headword errors | `tenēo→teneō`, `sedēo→sedeō`, `manēo→maneō`, `surgo→surgō`, `scribō→scrībō`, `sentīō→sentiō`, `laborō→labōrō` | Corrected in active `source_seed_lemmas`; historic DCC record spelling is retained as cited source material |

## Editorial decision: no artificial chapter inflation

The updated outline retains **130 chapters**, the same **102 teaching / 28 review** split and the original **500 / 1,532 / 3,036** *planned* cumulative new-lemma budgets. We use a limited **secondary micro-lectio** in Chapters 14 and 26 to put the missing pronouns in context without replacing major tense chapters or making the early reader even longer. The original one-main-grammar-point guideline remains valuable, but this is an explicitly flagged exception and **not yet pedagogically approved**.

Chapters 11 and 16 now reinforce personal pronouns alongside the same person/number verb forms. Chapter 20 uses a controlled visual "person → referred person → his or her object" pattern to teach `is/ea/id/eius`. Chapter 26 illustrates **reflexive reference to the clause subject** with `sē/suus`, contrasted with earlier `eius`. No other lesson is assumed to contain these forms until actual authored, reviewed Latin exists.

## Outstanding Claude review concerns — unchanged and explicitly open

1. **Book II–III vocabulary rates:** ~32 and ~47 new planned lemmas per teaching chapter. This only becomes credible if actual reading length, contextual repetition and Book II recognition/retention are demonstrated. Do not claim proficiency from chapter completion.
2. **Authoring volume:** the reviewer estimates **~164k–241k original Latin words** in the revised reading-length ranges. This is an estimate of a plan, not produced or checked prose; pilot Chapters 6–8 first.
3. **Lexeme registry and ledger (A1–A3):** the `vocabulary-introductions-130.json` file is deliberately empty. A separate `lexeme_registry.json`, actual tokenized lesson data and an offline generator for verified unique introductions remain the next priority.
4. **Offline architecture (R1–R5):** the running `index.html` is a legacy, self-contained eight-chapter build. Any future JSON lessons must compile to an offline script bundle or standalone HTML, with stable chapter/question IDs and a migration that does not mis-attach old learner progress after chapter changes.
5. **Speech and listening (S2–S3):** human model recordings, real spoken dialogue, Latin-only circling questions and performance-based checkpoints remain unimplemented.
6. **Expert review:** no published original expanded story, Latin instructional hint, new voice, teaching task or macron list has received a qualified Latinist's sign-off.

## Next development cycle recommended

**Cycle 2: lexeme registry design, without changing the app yet.** Start with the legacy eight chapters as a read-only content source. Define stable token indices, sense-disambiguated `lexeme_id` values, and a deterministic local build tool that produces the introductory lexeme ledger and reviews encounter counts. Include licence/source provenance and flag unresolved analyses rather than guessing.

**Cycle 3:** build the same content into a file-URL-compatible `lessons.bundle.js` and test existing `localStorage`/backup migration using chapter/question stable slugs. Do not change the live program in the same cycle as drafting the registry.

**Cycle 4:** pilot actual controlled Chapters 6–8, 250–450 words each, original chapter images, real circling questions, exercises and audio with human checks. Measure writing/review cost before scaling.

## Tests and review handoff

- `npm test`: running v0.4.2 app and design-integrity checks.
- `node curriculum/validate-outline-50.cjs`: historical DCC seed audit; not an acceptance test for new prose.
- `node curriculum/validate-roadmap-130.cjs`: 130-chapter structural and arithmetic checks.
- `node curriculum/validate-outline-v2.cjs`: prerequisite and early reading pacing regressions.
- `node curriculum/validate-outline-v3.cjs`: pronoun sequence, vocative and plural commands, distinct Chapter 81 ACI focus, macrons and 130-row Markdown/JSON agreement.
- `node curriculum/validate-roadmap-130.cjs --require-introduced-1500` **must fail** until 1,500 distinct approved new-course lemmas appear in actual tokenized Latin.
- `node curriculum/validate-roadmap-130.cjs --require-introduced-3000` **must fail** until 3,000 distinct approved introductions are evidenced.

**Please review these corrections independently.** Deliver `CLAUDE_REVIEW_130_V3.md` with remaining errors, Latinist issues, exact tests run/not run and a narrowly scoped specification for Cycle 2. **Do not merge, release, use source-copyrighted textbook material, or fabricate a 3,000-word completed course.**
