# Claude / GPT review handover — Tablinum course outline v50

**Source:** Uploaded `TABLINUM_HANDOVER_FOR_GPT(2).md` (section 12) and the user's `latin-core-list.csv` (997 records). The course outline is **awaiting user approval**; it is not implemented in the program.

## Read these first

1. `curriculum/CHAPTER_OUTLINE_50_DRAFT.md` — complete 50-row story, grammar and vocabulary table.
2. `curriculum/dcc-seed-audit-50.json` — source-matched lemma audit, reused seed words and candidates absent as exact headwords.
3. `curriculum/validate-outline-50.cjs` — reproducible structural check with Node 20+: `node curriculum/validate-outline-50.cjs`.
4. `curriculum/CHAPTER_OUTLINE_35_DRAFT.md` — superseded original plan retained for comparative reference.

## Decisions incorporated

- **About 50 chapters**, 38 teaching chapters and 12 review chapters, in a roughly four-chapter cycle.
- **No more than ~15 newly introduced lemmas per teaching chapter**; review stories reuse known words.
- The upper bound is 570; additional graded readings will support the longer target of 800–1,200 words. The seed list is *not* a claim of 570 scheduled DCC lemmas.
- Chapters **III and IV swapped** pedagogically: accusative (direct object) precedes dative (recipient).
- Added or separated the ablative, 1st/2nd person, plurals, adjective agreement, infinitives, personal pronouns, indirect statement, ablative absolute, deponents, comparatives, 4th/5th declensions and basic subjunctive.
- Corrected the DCC matching of `fīlius` as an alias inside one combined `fīlia -ae f.; fīlius -ī m.` source row.
- Distinguished supplementary `edō` 'eat' from the DCC CSV's `ēdō` 'bring forth', and retained `bibō` rather than `bībō`. The CSV's `māgnus` entry is recorded but flagged for editorial verification; learner spelling remains `magnus`.

## Independent review requested

Check the **grammar introduction order**, that each chapter really introduces only one major pattern, authentic Classical Latin macrons, the semantic suitability and source membership of candidate lemmas, frequency of repetition, story/illustration consistency, and the 38/12 pacing. Pay particular attention to whether future perfect, ablative absolute, indirect statement and purpose clauses need further staging.

**Do not** write 50 chapters of prose, introduce new app code, generate final character art, publish imported book texts, or merge branches until the user approves the outline. If the structure is accepted, start with a small controlled rewrite and a separate art storyboard, with Latinist verification.

## Testing / limitations

The planning data has been validated against the 997-row supplied DCC CSV and its combined headword structure. `index.html` on this branch has been checked against the manuscript/35-chapter branches and remains unchanged. The output is a **content plan**, not 50 new runnable lessons. Structural tests cannot verify that Latin is grammatically correct, that learners retain words, or that a teacher has approved the course.
