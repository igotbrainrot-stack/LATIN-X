# LATIN X — Source register for the Latin audit (10 November 2026)

Every claim in `LATIN_FINDINGS.csv` cites at least one of the sources below. Sources were read directly; nothing was taken from general translation sites, forums or another AI's opinion.

## How each authority tier was used

| Tier (from the audit brief) | Status in this audit | What was actually consulted |
|---|---|---|
| 1. Original authorised textbook edition and answer keys | **Not applicable.** LATIN X has no licensed textbook. The pilot manuscript states it is "original Latin written for Tablinum and … not taken from, or paraphrased from, any textbook". The legacy chapters come from the owner's own v0.2 app. | `archive/index-v02-original.html` (owner's original v0.2 app) was used as the source-fidelity baseline for the eight legacy chapters. `docs/pilot/CLAUDE_PILOT_B01_C001_C008.md` is the source for Book I pilot drafts. |
| 2. Allen & Greenough, *New Latin Grammar* | Used for morphology, syntax and quantity rules. | Full text of A&G as published by the Alpheios project (`github.com/alpheios-project/grammar-allen-greenough`, HTML edition of the 1903 text, the same text DCC hosts). DCC's own site could not be reached from this environment (network policy), so section numbers were read from this copy. Sections cited: §10, §44, §49, §76, §96, §108.c, §146 Note 1, §163, §214, §427, §505, §595–596, §604.a.1, §604.e.4, §604.g. |
| 3. Logeion, Lewis & Short and other lexicons | Lewis & Short used for every lexical and lemma-quantity claim. Logeion could not be reached (network policy). | Lewis & Short, *A Latin Dictionary* (1879), Perseus TEI XML (`PerseusDL/lexica`, `lat.ls.perseus-eng1.xml`). Entries consulted: Titus, Livius/Livia, Flavius, Marcus, Gaius, desum, relego, lectio, eligo, progredior/progressus, musica, inspiro, constructio, heri, hic, deinde, hodie, edo (1, 2), villa, arbor, tonitrus, tablinum, recordatio, primus, respondeo, mercator, multus. **Limit:** L&S does not mark hidden quantity (vowels before two consonants), so it is silent on lēctiō, rēctē, Mārcus. |
| 4. Packard Humanities Institute Latin texts | PHI could not be reached (network policy). | Attested Classical text was checked in the Latin Library corpus (`cltk/lat_text_latin_library`): Martial 1.17 and 7.59 for the scansion of *Titus*. The line references are standard and can be re-checked against PHI. |
| 5. Perseus and commentaries | Perseus web site could not be reached; the Perseus L&S XML (tier 3) was used instead. | — |
| 6. Collatinus, CLTK, treebanks (supplementary only) | Used as a cross-check, never as sole evidence. | Collatinus `lemmes.la` (biblissima/collatinus, current master) for lemma quantities; `pycollatinus` 0.1.x for form recognition. **Caveat found during the audit:** pycollatinus's bundled quantity data is corrupted (it returns `tīt`, `āg`, `ēt` for *Titus*, *ago*, *et*), while the current `lemmes.la` file is correct (`Tĭtus`, `ăgo`). Only `lemmes.la` was used for quantity hints, and Collatinus marks syllables long by position, so position-only disagreements were discarded. |
| 7. Scholarly pronunciation references | A&G quantity chapter (§10, §604) used for vowel-length rules. | No recordings were listened to (see `LATIN_UNRESOLVED.md`). |

## Evidence per confirmed finding

| Finding | Primary evidence | Supporting evidence |
|---|---|---|
| LX-001 Tītus → Titus | L&S s.v. *Titus*: "Tĭtus, i, m., a Roman prænomen" | Martial 1.17.1 *Cogit me Titus actitare causas* and 1.17.3 *Res magna est, Tite, quam facit colonus* (Phalaecean: × × — ∪ ∪ — ∪ — ∪ — ×, *Ti* falls on ∪); Martial 7.59.1 *Non cenat sine apro noster, Tite, Caecilianus* (hexameter, *ter Ti te* = — ∪ ∪). A&G §108.c prints "T. — Titus" unmarked beside "M. — Mārcus", "C. — Gāius", "P. — Pūblius". Collatinus `Tĭtus`. |
| LX-002 contradiction | Internal: b01-c002 Lēctiō 2 sentences b01-c002-s032 and s033 ("Mārcus et Tītus in hortō sunt. Flāvia et Līvia in vīllā sunt.") | — |
| LX-003 diēm/rēm | A&G §96 Note: "In the accusative singular e is always short." | A&G text writes *diem* (§424.g *ante diem*). |
| LX-004 rēī | A&G §96 Note: ē shortened in gen./dat. sg. of *fidēs, spēs, rēs* | — |
| LX-005 i-stem ablative | A&G §76 and §76.a–b lists | — |
| LX-006 -ius adjective vocative | A&G §49.c | — |
| LX-007 Rēlege | L&S s.v. *relego* (2): "rĕ-lĕgo" | A&G §604.a.1 (rĕ- short; long only in rēligiō, rētulī, rēpulī). Collatinus `rĕlĕgo`. |
| LX-008 Rectē | A&G's macronised text: *rēctē* (Ter. Ph. 188, Conditionals chapter), *rēctā* (§214) | Collatinus `rectē=rēctē`. |
| LX-009 Lectiō | A&G verb list: "legō, lēgī, lēct-" | Collatinus `lectĭo=lēctĭō`; the course's own pilot titles use *Lēctiō*. |
| LX-010 Progressus | L&S "prōgressus, ūs"; "prō-grĕdĭor" | A&G Case Uses: *prōgressus mīlia passuum*. |
| LX-011 Elige / electum | L&S "ē-lĭgo"; Collatinus `ēlēctus` | — |
| LX-012 Musica | L&S "mūsĭca" | A&G §44 *mūsicē*. |
| LX-013 Prima / legendo | L&S "prīmus" | A&G §604.g (final o long in datives and ablatives); §505 *agrō colendō*. |
| LX-014 responde | A&G §604.e.4 (final e long in 2nd-conjugation imperative singular) | Same screen writes *Respondē*. |
| LX-015 Recordātiō | L&S "rĕcordātĭo … a recalling to mind, recollection" | — |
| LX-016 Gāiī | A&G §49.b (genitive in single -ī until the Augustan Age) | Reading uses *Gāī* five times. |
| LX-017/018 grading | `app/50-exercises.js` `gradeLegacy` (exact normalised match) and the lesson texts | A&G §595–596 on word order. |
| LX-019 picture key | b01-c007 reading and `curriculum/illustrations.json` alt text | — |
| LX-020 TTS respellings | L&S: vĭdeo, vĭa, plŭvĭa, vīsĭto, Flāvĭus, "Gāĭus … trisyl., Cat. 10, 30" | — |

## Items checked and found correct (selection)

Mārcus (A&G §108.c), Gāius (A&G §108.c, L&S), Līvia (L&S "Līvĭa"), Flāvia (L&S "Flāvĭus"), hodiē (L&S "hŏdĭē"), herī (A&G §427 "herī (-e)"), present *edit* "eats" (L&S *ĕdo*, A&G "edō, ēdī, ēsum eat"), *mālum* "apple", *mercātor, -ōris* (L&S), *tonitrus* (L&S), *quot*, *an*, *in* short and *nōn*, *crās* long (A&G §604.b–c), *hic* pronoun left unmarked (A&G §146 Note 1: "was originally short, and perhaps this quantity was always retained").

## Not used as evidence

- Agreement between this audit and any other AI review.
- pycollatinus quantity output (shown to be corrupted).
- The existing `npm test` suite (it checks structure, not Latin; it currently passes while asserting the wrong form *diēm*).
