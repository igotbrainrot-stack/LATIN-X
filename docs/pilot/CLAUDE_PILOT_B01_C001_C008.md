# Tablinum — Book I, Chapters 1–8: pilot reading text drafted by Claude

**Status:** DRAFT. This text is not signed and has not been checked by a Latinist. It is original Latin written for Tablinum and is not taken from, or paraphrased from, any textbook. It replaces GPT's `docs/pilot/BOOK_I_PILOT_READING_DRAFT.md`, which failed review (see `docs/claude/PHASE4_PILOT_REVIEW_FOR_GPT.md`).

**Who signs:** the owner, with tier `owner`, labelled "not checked by a Latinist". `drafted_by: claude-draft-2026-11-05`.

## Rules this draft follows

- Each chapter tells one small story, and **no sentence is repeated word for word inside a chapter**. Words recur in new combinations, in questions and answers, and in contrasts.
- Grammar appears only from the chapter that the syllabus (`curriculum/vocabulary-budgets-130.json`) assigns to it. The restrictions below are cumulative.
  - **Ch 1:** nominative singular; `est`; `sunt` only with a compound subject and a place phrase, never with a predicate adjective; the `-ne` question; `in` + ablative, taught only as pictured place chunks.
  - **Ch 2:** adds the genitive singular, but only for the first and second declensions (`-ae`/`-ī`). There are no 3rd-declension genitives such as `patris`.
  - **Ch 3:** adds the accusative singular and third-person singular present verbs in `-t`.
  - **Ch 4:** adds the dative singular (`-ae`, `-ō`, `-ī`). `grātiās agit` is taught as a fixed chunk.
  - **Ch 5:** review only. No new lemma, case or verb form appears.
  - **Ch 6:** adds the neuter plural in `-a`, for nominative and accusative only, including predicate adjectives.
  - **Ch 7:** adds `ad` + accusative for motion, contrasted with `in` + ablative for place.
  - **Ch 8:** adds the third-person plural `-nt`, used only with compound subjects (`X et Y`). There are no masculine or feminine plural nouns or adjectives.
- **Never used in chapters 1–8:** masculine or feminine plural nouns or adjectives (`laetī`, `puerī`, `ventī`); verbs in the 1st or 2nd person (except the chunk `grātiās agit`, which is itself 3rd person); vocatives; past or future tenses; `sub`, `ex` and `per`.
- The margin notes are Latin first: `=`, `↔` (opposites), and `[pictūra]`, a picture the artist must provide.
- Each chapter ends with model questions and answers, plus speaking prompts. All of them are ungraded until Phase 5 is built and the owner signs the answer keys.

The machine check is `scripts/check-claude-pilot.py`.

**Length (all of it unique text):**

| Ch | Tokens | Sentences | Syllabus target |
|---:|---:|---:|---|
| 1 | 275 | 58 | 250–360 |
| 2 | 284 | 52 | 260–370 |
| 3 | 256 | 58 | 270–380 |
| 4 | 267 | 58 | 280–390 |
| 5 | 288 | 53 | 290–400 |
| 6 | 279 | 56 | 300–410 |
| 7 | 272 | 58 | 310–420 |
| 8 | 306 | 64 | 320–430 |

Chapters 3–8 fall slightly below their minimum, by 2–38 tokens each. I chose that over padding. Each chapter can be lengthened later, once the owner has approved the story direction. It counts tokens, finds repeated sentences, lists each word form at its first appearance, and flags forms that appear before the grammar that teaches them.

---

# Caput I — In hortō

**Grammar:** nominative subjects; `est`/`sunt`; the questions `Quis?`, `Ubi?` and `-ne?`; `in hortō`/`in vīllā`/`in arbore` as pictured place chunks.
**New (proposed, unsigned):** hortus, arbor, rosa, vīlla, puella, puer, Līvia, Tītus, magnus, parvus, pulcher, sum, in, et, sed, nōn, quoque, ecce, quis, ubi, ita, nunc, hīc, ibi.
**Margin:** magnus ↔ parvus · puella ♀ = Līvia · puer ♂ = Tītus · hīc ↔ ibi · ita ↔ nōn · [pictūra: hortus, arbor magna, arbor parva, rosa, vīlla]

## Lēctiō 1 — Hortus

Ecce hortus.
Hortus magnus est.
In hortō est arbor.
Arbor magna est.
In hortō est quoque rosa.
Rosa parva est.
Arbor magna est, sed rosa parva est.
Rosa nōn magna est.
Arbor nōn parva est.
Rosa pulchra est.
Ecce puella.
Puella in hortō est.
Quis est puella?
Puella est Līvia.
Līvia nōn magna est; Līvia parva est.
Ubi est Līvia?
Līvia in hortō est.
Līvia et rosa in hortō sunt.
Ecce vīlla.
Vīlla quoque magna est.
Hortus est hīc; vīlla est ibi.
Ecce puer.
Puer quoque parvus est.
Quis est puer?
Puer est Tītus.
Ubi est Tītus?
Tītus in vīllā est.
Līvia in hortō est, sed Tītus in vīllā est.
Estne Tītus in hortō?
Nōn, Tītus nōn in hortō est.

## Lēctiō 2 — Ubi est Tītus?

Nunc Tītus nōn in vīllā est.
Ubi est puer?
Līvia: «Ubi est puer Tītus? Estne Tītus in vīllā?»
Nōn est. Vīlla magna est, sed Tītus ibi nōn est.
«Estne puer in hortō?»
Ita, Tītus in hortō est.
Sed ubi in hortō?
Rosa hīc est, sed puer hīc nōn est.
In hortō sunt arbor magna et arbor parva.
Estne Tītus in arbore parvā?
Nōn: arbor parva nōn magna est, et puer ibi nōn est.
Ecce! In arbore magnā est puer!
Quis est puer in arbore?
Puer in arbore est Tītus!
Tītus parvus est, sed arbor magna est.
Līvia: «Ecce Tītus! Tītus in arbore est!»
Nunc Līvia et Tītus in hortō sunt.
Līvia est hīc, et Tītus est ibi.
Et ubi est Līvia? Līvia in hortō est, et rosa quoque.
Et Tītus? Tītus nōn in vīllā, sed in arbore est.
Hortus magnus et pulcher est.
Arbor magna est, rosa parva est, puella parva est, puer parvus est.

## Quaestiōnēs (model answers, ungraded)

1. Quis est puella? — Puella est Līvia.
2. Estne rosa magna? — Nōn, rosa parva est.
3. Ubi est vīlla? — Vīlla ibi est. / Vīlla nōn in hortō est.
4. Estne Tītus in vīllā? (Lēctiō 2) — Nōn, Tītus in hortō est.
5. Ubi est Tītus? — Tītus in arbore magnā est.
6. Estne arbor magna an parva? *(picture choice)* — Arbor magna est.

## Loquere (speaking, ungraded)

- Point to the picture and say what is big and what is small: `Arbor magna est. Rosa parva est.`
- Answer aloud: `Ubi est Līvia?` `Ubi est Tītus?`

---

# Caput II — Familia

**Grammar (new):** genitive singular `-ae`/`-ī`, showing possession and relationship; the question `Cuius?`
**New (proposed, unsigned):** familia, pater, māter, fīlius, fīlia, frāter, soror, Mārcus, Flāvia, vir, fēmina, nōmen, cuius, Rōmānus.
**Margin:** pater ♂ + māter ♀ → fīlius ♂, fīlia ♀ · frāter ↔ soror · [pictūra: arbor familiae, the family tree] · Mārcus → Mārcī · Flāvia → Flāviae · Līvia → Līviae · Tītus → Tītī

## Lēctiō 1 — Ecce familia

Ecce vīlla magna.
In vīllā est familia Rōmāna.
Ecce vir: nōmen virī est Mārcus.
Mārcus pater est.
Ecce fēmina: nōmen fēminae est Flāvia.
Flāvia māter est.
Mārcus pater Līviae est.
Flāvia māter Līviae est.
Līvia fīlia Mārcī est.
Līvia quoque fīlia Flāviae est.
Tītus fīlius Mārcī et Flāviae est.
Quis est Tītus? Tītus frāter Līviae est.
Quis est Līvia? Līvia soror Tītī est.
Cuius frāter est Tītus? Tītus est frāter Līviae.
Cuius soror est Līvia? Līvia est soror Tītī.
Cuius fīlius est Tītus? Tītus est fīlius Mārcī.
Familia Mārcī nōn magna est: pater, māter, fīlius, fīlia.
Vīlla familiae magna est, et hortus vīllae quoque magnus est.

## Lēctiō 2 — Cuius est hortus?

Hortus est hortus familiae.
Sed in hortō est rosa pulchra. Cuius est rosa?
Tītus: «Rosa est rosa Līviae.»
Ita, rosa Līviae est.
Ecce arbor magna. Cuius est arbor?
Arbor nōn est Līviae; arbor est Tītī.
Arbor Tītī magna est, sed rosa Līviae parva est.
Ubi est Mārcus? Mārcus in hortō est.
Ubi est Flāvia? Flāvia nōn in hortō, sed in vīllā est.
Ecce puella in vīllā: estne puella fīlia Flāviae?
Ita est: puella in vīllā est Līvia, fīlia Flāviae.
Ecce puer in arbore: estne puer fīlius Mārcī?
Ita est: puer in arbore est Tītus, fīlius Mārcī.
Mārcus et Tītus in hortō sunt.
Flāvia et Līvia in vīllā sunt.
Nōmen virī est Mārcus; nōmen fēminae est Flāvia.
Nōmen puellae est Līvia; nōmen puerī est Tītus.
Estne Mārcus frāter Līviae? Nōn: Mārcus pater Līviae est.
Estne Flāvia soror Tītī? Nōn: Flāvia māter Tītī est.
Estne Līvia fīlia Mārcī? Ita, Līvia est fīlia Mārcī et Flāviae.
Vir et fēmina nōn in hortō sunt: vir in hortō est, fēmina in vīllā.
Familia Rōmāna parva est, sed vīlla familiae magna et pulchra est.

> Note for the reviewer: there are 14 new lemmas, against a budget of 8. The extras are `vir`, `fēmina`, `nōmen` and `Rōmānus`; `vir` and `fēmina` are there so that pater and māter can be inferred from the picture. The owner should keep them or cut them. There are no 3rd-declension genitives (`patris`, `mātris`) on purpose.

## Quaestiōnēs

1. Quis est pater Līviae? — Mārcus pater Līviae est.
2. Cuius fīlia est Līvia? — Līvia fīlia Mārcī et Flāviae est.
3. Cuius frāter est Tītus? — Tītus frāter Līviae est.
4. Cuius est rosa? — Rosa est Līviae.
5. Cuius est arbor? — Arbor est Tītī.
6. Ubi est Flāvia? — Flāvia in vīllā est.

## Loquere

- Name each person in the family-tree picture: `Mārcus pater est. Līvia fīlia Flāviae est.`
- Say who owns what: `Rosa est Līviae. Arbor est Tītī.`

---

# Caput III — Cēna

**Grammar (new):** accusative singular (`-am`, `-um`, `-em`); third-person singular present in `-t`; the question `Quid?`
**New (proposed, unsigned):** cēna, mēnsa, aqua, cibus, pānis, liber, pōculum, bonus, habet (habeō), portat (portō), bibit (bibō), edit (edō), pōnit (pōnō), legit (legō), spectat (spectō), capit (capiō), respondet (respondeō), quid, tum, iam.
**Margin:** aqua → aquam · cibus → cibum · pānis → pānem · Quid habet? → pānem habet · [pictūra: mēnsa, pānis, pōculum aquae, liber] · bibit = 💧→👄 · edit = 🍞→👄

## Lēctiō 1 — Mēnsa

Nunc est cēna in vīllā.
In vīllā est mēnsa magna.
Flāvia cibum portat.
Quid Flāvia portat? Cibum portat.
Flāvia cibum in mēnsā pōnit.
Tum Flāvia pānem portat.
Pānis magnus est.
Flāvia pānem quoque in mēnsā pōnit.
Ecce pōculum. In pōculō est aqua.
Līvia pōculum portat.
Quid Līvia portat? Līvia nōn pānem, sed pōculum portat.
Līvia pōculum in mēnsā pōnit.
Iam cibus, pānis, aqua in mēnsā sunt.
Ubi est Mārcus? Mārcus in hortō est.
Mārcus librum habet.
Quid Mārcus habet? Librum habet.
Mārcus librum legit.
Ubi est Tītus? Tītus in hortō nōn est; Tītus iam in vīllā est!

## Lēctiō 2 — Tītus et pānis

Tītus mēnsam spectat.
Tītus pānem in mēnsā spectat.
Pānis Tītī nōn est; pānis familiae est.
Sed Tītus pānem capit.
Quid Tītus capit? Tītus pānem capit!
Tītus pānem edit.
Flāvia Tītum spectat.
Flāvia: «Ubi est pānis?»
Tītus nōn respondet; Tītus pānem edit.
Līvia pōculum habet. Līvia aquam bibit.
Quid Līvia bibit? Aquam bibit.
Quid Tītus edit? Pānem edit.
Mārcus librum in mēnsā pōnit.
Mārcus cibum capit et edit.
Flāvia quoque cibum edit et aquam bibit.
Nunc familia cēnam habet.
Cēna bona est.
Tītus pānem nōn iam habet, sed Tītus cibum habet.
Tum Flāvia mēnsam spectat: cibus nōn iam in mēnsā est.
Pānis quoque nōn iam in mēnsā est.
Quid in mēnsā est? Liber Mārcī et pōculum Līviae in mēnsā sunt.
Mārcus librum capit et in hortō legit.
Quid Mārcus legit? Librum legit.
Sed ubi est Tītus? Tītus nōn legit; Tītus in arbore est.
Flāvia Tītum in arbore spectat.
Tītus in arbore est, et Tītus pānem habet!
Flāvia: «Ecce pānis familiae!»

> Note for the reviewer: there are 20 new lemmas, against a budget of 9. All are concrete, pictured objects or simple actions. If the owner wants the count nearer the budget, the best candidates to move to a later chapter are `legit`, `respondet` and `bonus`.

## Quaestiōnēs

1. Quid Flāvia portat? — Flāvia cibum portat.
2. Ubi Flāvia pānem pōnit? — Flāvia pānem in mēnsā pōnit.
3. Quid Līvia bibit? — Līvia aquam bibit.
4. Quid Mārcus habet? — Mārcus librum habet.
5. Quid Tītus capit? — Tītus pānem capit.
6. Ending: aqu___ (Līvia aqu___ bibit) — aquam.

## Loquere

- Point to the table and say what each person has: `Mārcus librum habet.`
- Answer aloud: `Quid Tītus edit?`

---

# Caput IV — Dōnum

**Grammar (new):** dative singular, for the recipient (`-ae`, `-ō`, `-ī`); the question `Cui?`; `grātiās agit` as a fixed chunk.
**New (proposed, unsigned):** dōnum, dat (dō), accipit (accipiō), amīcus, laetus, ruber, alius, Gāius, venit (veniō), cui, grātiās agit (grātia).
**Margin:** dat = 🎁 → · accipit = → 🎁 · Līvia → Līviae (cui?) · Mārcus → Mārcō · māter → mātrī · pater → patrī · ruber = 🌹 · laetus = 🙂 · [pictūra: arrows from giver to receiver]

## Lēctiō 1 — Rosa rubra

Ecce hortus et rosa rubra.
Līvia in hortō est.
Līvia rosam rubram habet.
Rosa rubra pulchra est.
Līvia rosam portat.
Flāvia in vīllā est.
Līvia Flāviae rosam dat.
Cui Līvia rosam dat? Līvia mātrī rosam dat.
Flāvia rosam accipit.
Quis rosam accipit? Māter rosam accipit.
Flāvia laeta est.
Flāvia Līviae grātiās agit.
Nunc rosa nōn Līviae est; rosa Flāviae est.
Flāvia rosam in mēnsā pōnit.
Tītus rosam spectat.
Estne rosa Tītī? Nōn, rosa Flāviae est.

## Lēctiō 2 — Amīcus Mārcī

Ecce, Gāius venit.
Quis est Gāius? Gāius amīcus Mārcī est.
Gāius dōnum habet.
Dōnum nōn magnum est; dōnum parvum est.
Cui Gāius dōnum dat?
Gāius Mārcō dōnum dat.
Mārcus dōnum accipit.
Quid est dōnum? Dōnum est liber!
Mārcus librum habet et laetus est.
Mārcus Gāiō grātiās agit.
Gāius quoque laetus est.

## Lēctiō 3 — Aliud dōnum

Sed Tītus nōn laetus est.
Tītus dōnum nōn habet.
Līvia Flāviae rosam dat; Gāius Mārcō librum dat; sed Tītus dōnum nōn accipit.
Gāius Tītum spectat.
Tum Gāius aliud dōnum capit.
Aliud dōnum parvum et rubrum est.
Quid est? Est pōculum rubrum!
Gāius Tītō pōculum rubrum dat.
Cui Gāius pōculum dat? Gāius puerō pōculum dat.
Tītus pōculum accipit.
Nunc Tītus laetus est!
Tītus Gāiō grātiās agit.
Tum Tītus aquam in pōculō habet et bibit.
Flāvia laeta est, Mārcus laetus est, Tītus laetus est.
Et Līvia? Līvia quoque laeta est.
Līvia dōnum nōn habet, sed laeta est.
Flāvia rosam rubram in pōculō magnō pōnit.
Nunc rosa in pōculō est, et pōculum in mēnsā est.
Cui Flāvia cibum dat? Flāvia Gāiō cibum dat.
Gāius cibum accipit et Flāviae grātiās agit.
Tum Gāius aquam bibit et pānem edit.
Cēna bona est, et Gāius laetus est.

> Note for the reviewer: `laetus` is used only in the singular (`laeta est`, `laetus est`), because `laetī` is a masculine plural, which is not taught in Book I's first eight chapters.

## Quaestiōnēs

1. Cui Līvia rosam dat? — Līvia mātrī (Flāviae) rosam dat.
2. Quis rosam accipit? — Flāvia rosam accipit.
3. Quis est Gāius? — Gāius amīcus Mārcī est.
4. Quid Gāius Mārcō dat? — Gāius Mārcō librum dat.
5. Cui Gāius pōculum dat? — Gāius Tītō pōculum dat.
6. Ending: Līvia Flāvi___ rosam dat. — Flāviae.

## Loquere

- Act out giving with objects, naming the giver and the receiver: `Līvia Tītō librum dat.`
- Answer aloud: `Cui Gāius dōnum dat?`

---

# Caput V — Recēnsiō I: In vīllā

**Grammar:** review only. No new lemmas, cases or verb forms.
**Story:** at evening Līvia tells the story of the day: the garden, supper and the gifts. Tītus corrects her.

## Lēctiō 1 — In hortō

Nunc Līvia in vīllā est, et Tītus quoque.
Līvia librum Mārcī habet, sed librum nōn legit.
Līvia hortum spectat.
Hortus vīllae magnus et pulcher est.
In hortō est arbor magna; ibi est quoque arbor parva.
Ubi est rosa Līviae? Rosa nōn iam in hortō est.
Rosa in vīllā est, in mēnsā Flāviae.
Cuius est arbor magna? Arbor magna est Tītī.
Tītus in arbore magnā nōn est; Tītus in vīllā est.
Tītus pōculum rubrum habet.
Pōculum Tītī parvum est, sed pulchrum.
Estne Tītus in hortō? Nōn, Tītus in vīllā est, et Līvia quoque.

## Lēctiō 2 — Cēna

Flāvia cibum in mēnsā pōnit.
Mārcus pānem portat et in mēnsā pōnit.
Līvia pōculum Tītī capit.
Tītus: «Pōculum nōn est Līviae! Pōculum est Tītī!»
Līvia Tītō pōculum dat.
Tītus pōculum accipit et aquam bibit.
Quid Mārcus edit? Mārcus pānem edit.
Quid Flāvia bibit? Flāvia aquam bibit.
Gāius quoque venit et cibum accipit.
Mārcus Gāiō pānem dat, et Gāius Mārcō grātiās agit.
Flāvia fīliae cibum dat.
Līvia cibum accipit, sed librum spectat, nōn cibum.
Tum Flāvia fīliae pānem quoque dat.
Nunc Līvia pānem edit et aquam bibit.
Tītus pōculum rubrum in mēnsā pōnit.
Cēna familiae bona est.

## Lēctiō 3 — Dōna

Mārcus: «Quid est dōnum Flāviae?» Līvia patrī respondet: «Rosa est dōnum Flāviae, et liber est dōnum Mārcī.»
Mārcus librum habet; Gāius Mārcō librum dat.
Flāvia rosam habet; Līvia mātrī rosam dat.
Tītus pōculum habet; Gāius puerō pōculum dat.
Cui Līvia rosam dat? Mātrī.
Cui Gāius librum dat? Mārcō.
Cui Gāius pōculum dat? Tītō.
Sed Līvia dōnum nōn habet!
Gāius Līviam spectat.
Gāius Līviae aliud dōnum nōn dat.
Tum Mārcus in hortō aliam rosam capit.
Mārcus rosam rubram portat et fīliae dat.
Nunc Līvia quoque rosam habet.
Līvia patrī grātiās agit.
Nunc familia Mārcī in vīllā est, et Līvia laeta est.

> Note for the reviewer: the checker must show zero new lemmas in this chapter. `aliam` (alius, ch 4) and `fīliae` (dative, ch 4) are recombined, not new.

## Quaestiōnēs

1. Ubi est rosa Flāviae? — Rosa in vīllā, in mēnsā, est.
2. Cuius est pōculum? — Pōculum est Tītī.
3. Cui Līvia pōculum dat? — Līvia Tītō pōculum dat.
4. Quid Gāius Mārcō dat? — Gāius Mārcō librum dat.
5. Quis Līviae rosam dat? — Mārcus (pater) Līviae rosam dat.
6. Estne Līvia laeta? — Ita, Līvia laeta est.

## Loquere

- Retell one gift in a single sentence: `Gāius Tītō pōculum dat.`

---

# Caput VI — Forum

**Grammar (new):** neuter plural nominative and accusative in `-a`; predicate adjectives in `-a`; the numbers ūnum, duo, tria; the question `Quot?`
**New (proposed, unsigned):** forum, mālum, ōvum, mercātor, pecūnia, pretium, multus, ūnus, duo, trēs, quot, emit (emō), vendit (vendō), numerat (numerō).
**Margin:** mālum → māla · ōvum → ōva · dōnum → dōna · pōculum → pōcula · ūnum 🍎 · duo 🍎🍎 · tria 🍎🍎🍎 · multa = 🍎🍎🍎🍎🍎🍎 · vendit ↔ emit · pretium = 💰 → 🍎 · [pictūra: mercātor, mēnsa, māla, ōva, pecūnia]

## Lēctiō 1 — In forō

Ecce forum.
Forum magnum est.
Mārcus et Līvia in forō sunt.
In forō est mercātor.
Mercātor mēnsam habet.
In mēnsā sunt māla.
Māla rubra sunt.
Quot māla in mēnsā sunt? Multa māla in mēnsā sunt.
In mēnsā sunt quoque ōva.
Ōva nōn rubra sunt.
Mercātor māla et ōva vendit.
Quid mercātor vendit? Māla et ōva vendit.
In forō nōn est arbor, nōn est rosa.
Sed in forō sunt multa māla et multa ōva.
Mārcus mercātōrem spectat; Līvia māla spectat.
Estne mālum rubrum? Ita: māla rubra sunt.
Ōva parva sunt, sed māla magna sunt.

## Lēctiō 2 — Quot māla?

Līvia māla numerat.
«Ūnum, duo, tria…»
Līvia tria māla magna spectat.
Tria māla magna sunt; alia māla parva sunt.
Mārcus māla emit.
Quot māla Mārcus emit? Mārcus duo māla emit.
Mārcus nōn tria, sed duo māla capit.
Līvia: «Estne pretium magnum?»
Mercātor: «Pretium nōn magnum est.»
Mārcus mercātōrī pecūniam dat.
Pecūnia est pretium.
Mercātor pecūniam accipit.
Nunc Mārcus duo māla habet.

## Lēctiō 3 — Dōna

Habetne Līvia mālum? Līvia mālum nōn habet.
Sed mercātor Līviam spectat.
Mercātor puellae ūnum mālum parvum dat.
Līvia mālum accipit et mercātōrī grātiās agit.
Nunc Mārcus duo māla habet, et Līvia ūnum mālum habet.
Quot māla sunt? Tria māla sunt!
Mārcus quoque ōva emit: Mārcus duo ōva capit.
Ōva parva sunt.
Līvia ōva et māla portat.
Māla et ōva sunt dōna: dōna Flāviae et Tītī.
In vīllā Līvia Flāviae ōva dat, et Tītō ūnum mālum dat.
Tītus mālum accipit et edit.
Nunc in mēnsā sunt duo māla et duo ōva.
Dōna parva sunt, sed bona.
Flāvia ōva accipit et Līviae grātiās agit.
Flāvia ōva in mēnsā pōnit.
In mēnsā sunt quoque pōcula.
Pōcula parva sunt.
Quot pōcula in mēnsā sunt? Tria pōcula in mēnsā sunt.

> Note for the reviewer: `alia māla` uses `alius` (ch 4) in the newly taught neuter plural. **Please check `Pecūnia est pretium`**: it works as an equation for inferring the word from the picture, but a Latinist may prefer another wording. `mercātōrī` is a 3rd-declension dative, the same pattern as `patrī`, which ch 4 teaches.

## Quaestiōnēs

1. Quid mercātor vendit? — Mercātor māla et ōva vendit.
2. Quot māla Mārcus emit? — Mārcus duo māla emit.
3. Quid Mārcus mercātōrī dat? — Mārcus mercātōrī pecūniam dat.
4. Cui mercātor ūnum mālum dat? — Mercātor Līviae (puellae) ūnum mālum dat.
5. Quot ōva Mārcus emit? — Duo ōva.
6. Ending: dōnum → dōn___ (plural) — dōna.

## Loquere

- Count the objects in the picture aloud: `Ūnum mālum, duo māla, tria māla.`
- Answer aloud: `Quot māla in mēnsā sunt?`

---

# Caput VII — Canis in viā

**Grammar (new):** `ad` + accusative for motion, contrasted with `in` + ablative for place; `prope` + accusative; the question `Quō?`
**New (proposed, unsigned):** canis, via, porta, ad, prope, currit (currō), vocat (vocō), ambulat (ambulō), lātrat (lātrō), stat (stō), immōtus, quō, subitō, statim.
**Margin:** in viā = ● on the road · ad portam = → to the gate · Ubi? → in viā · Quō? → ad portam · currit = ambulat, but fast · lātrat = what a dog says · [pictūra: via, porta vīllae, canis, puer]

## Lēctiō 1 — Canis

Ecce via.
Via magna est.
In viā est canis.
Canis parvus est.
Ubi est canis? Canis in viā est.
Canis nōn stat; canis currit.
Quō canis currit? Canis ad forum currit.
Prope forum est puer.
Puer canem spectat.
Puer canem vocat.
Sed canis ad puerum nōn currit.
Canis lātrat et currit.
Canis ad mēnsam currit; in mēnsā sunt māla et ōva.
Mercātor canem spectat: «Nōn! Nōn!»
Canis ōvum nōn capit; canis ad viam currit.

## Lēctiō 2 — Ad portam

Līvia prope portam vīllae stat.
Ubi est Līvia? Līvia prope portam est.
Canis subitō ad portam currit.
Quō nunc currit canis? Ad portam currit, ad Līviam!
Līvia canem spectat.
Canis Līviam spectat.
Līvia nōn currit; Līvia stat.
Canis lātrat, sed Līvia stat immōta.
Puer ad portam currit.
Quis est puer? Puer est fīlius Gāī.
Puer canem vocat: «Canis! Canis!»
Nunc canis ad puerum currit.

## Lēctiō 3 — In viā

Tītus ad portam ambulat.
Tītus Līviam et puerum et canem spectat.
Tītus: «Quis est puer?» Līvia Tītō respondet: «Puer est fīlius Gāī.»
Fīlius Gāī Tītō ūnum mālum dat.
Tītus mālum capit et canī dat.
Canis mālum nōn edit!
Canis ad Tītum currit, et Tītus ad viam currit.
Nunc Tītus et canis in viā sunt.
Flāvia ad portam ambulat.
Ubi est Tītus? Tītus in viā est.
Flāvia Tītum vocat.
Tītus statim ad portam currit; canis quoque currit.
Nunc canis prope portam stat, et fīlius Gāī canem vocat.
Fīlius Gāī ad forum ambulat, et canis quoque.
Tītus prope portam stat et canem spectat.
Quō Līvia ambulat? Līvia ad hortum ambulat.
Ubi est nunc Līvia? In hortō est.
Et Tītus? Tītus nōn iam in viā, sed in vīllā est.
Flāvia Tītō pānem dat, et Tītus edit.

> Note for the reviewer: `immōtus` is one extra pictured word, and it can be cut. Please check these three forms. `Gāī` is the classical genitive of Gāius (`Gāiī` is the later spelling). `Canis! Canis!` is a call whose vocative form is identical to the nominative. `canī` is a 3rd-declension dative, the same pattern as `patrī`.

## Quaestiōnēs

1. Ubi est canis? — Canis in viā est.
2. Quō canis subitō currit? — Canis ad portam (ad Līviam) currit.
3. Quis canem vocat? — Puer (fīlius Gāiī) canem vocat.
4. Ubi stat Līvia? — Līvia prope portam stat.
5. Quō Tītus currit? — Tītus ad viam currit; tum ad portam.
6. Ubi or Quō? Choose: ___ est canis? / ___ currit canis? — Ubi / Quō.

## Loquere

- Move a token on the picture and say `Canis ad portam currit.` / `Canis in viā est.`
- Answer aloud: `Quō Tītus currit?`

---

# Caput VIII — Tempestās

**Grammar (new):** third-person present plural in `-nt` (sunt, audiunt, vident, movent, currunt, stant, spectant, timent), contrasted with singular `-t`. Plurals are used only with `X et Y` subjects.
**New (proposed, unsigned):** tempestās, ventus, pluvia, fenestra, sōl, caelum, audit (audiō), videt (videō), movet (moveō), timet (timeō), lūcet (lūceō), dēnique.
**Margin:** Tītus audit ↔ Tītus et Līvia audiunt · videt ↔ vident · -t = ūnus · -nt = duo et plūrēs · ventus = 🌬 · pluvia = 🌧 · sōl = ☀ · [pictūra: duae fenestrae; vīlla in tempestāte]

## Lēctiō 1 — Ventus

Familia in vīllā est.
Subitō ventus magnus est.
Ventus arborem movet.
Līvia ventum audit.
Quid Līvia audit? Ventum audit.
Tītus quoque ventum audit.
Līvia et Tītus ventum audiunt.
Quid Līvia et Tītus audiunt? Ventum audiunt.
Līvia ad fenestram currit.
Tītus quoque ad fenestram currit.
Līvia et Tītus ad fenestram currunt.
Līvia arborem videt; Tītus arborem videt.
Līvia et Tītus arborem magnam vident.
Ventus portam quoque movet.
Canis in viā ventum audit et lātrat.
Līvia et Tītus canem audiunt.
Arbor nōn stat immōta; ventus arborem movet.

## Lēctiō 2 — Pluvia

Nunc pluvia quoque est.
Mārcus pluviam audit.
Flāvia pluviam audit.
Mārcus et Flāvia pluviam audiunt.
Mārcus et Flāvia ad aliam fenestram ambulant.
Mārcus hortum videt. Flāvia rosam videt.
Mārcus et Flāvia hortum et rosam vident.
Mārcus pluviam in viā videt.
Flāvia pluviam in hortō videt.
Ubi est pluvia? Pluvia in viā et in hortō est.
Ubi est rosa? Rosa in hortō est, et pluvia rosam movet.
Tītus tempestātem timet.
Līvia tempestātem nōn timet.
Quis tempestātem timet? Tītus timet.
Timentne Mārcus et Flāvia? Nōn timent.
Flāvia Tītum spectat et Tītō librum dat.
Tītus librum accipit et legit.

## Lēctiō 3 — Sōl

Dēnique ventus nōn iam arborem movet.
Pluvia nōn iam est.
Līvia caelum spectat.
In caelō est sōl.
Sōl lūcet.
Līvia et Tītus sōlem vident.
Mārcus et Flāvia ad portam ambulant.
Līvia et Tītus ad hortum currunt.
Arbor magna stat; rosa quoque stat.
Līvia et Tītus in hortō stant.
Tītus nōn iam timet.
Tītus et Līvia arborem et rosam spectant.
In hortō Līvia et Tītus ventum nōn audiunt.
Ubi est sōl? Sōl in caelō est.
Mārcus et Flāvia caelum spectant.
Quid Līvia et Tītus in hortō vident? Arborem et rosam vident.
Gāius et fīlius Gāī ad portam veniunt.
Mārcus et Flāvia Gāium et fīlium Gāī vident.
Canis quoque venit et lātrat.
Nunc familia et amīcus in hortō sunt.
Sōl lūcet, et familia Mārcī in hortō est.

> Note for the reviewer: `Timentne` puts the ch 1 `-ne` question on a ch 8 plural verb. `tempestātem` and `sōlem` are 3rd-declension accusatives, a pattern taught in ch 3 (`pānem`). `in caelō` is a new place chunk.

## Quaestiōnēs

1. Quid Līvia et Tītus audiunt? — Ventum audiunt.
2. Quō Līvia et Tītus currunt? — Ad fenestram currunt.
3. Quid Mārcus et Flāvia vident? — Hortum et rosam vident.
4. Quis tempestātem timet? — Tītus tempestātem timet.
5. Quid Līvia in caelō videt? — Sōlem videt.
6. Ending: Līvia et Tītus ventum audi___. — audiunt. / Tītus ventum audi___. — audit.

## Loquere

- Read pairs aloud and point to one or two figures: `videt / vident`, `audit / audiunt`, `currit / currunt`.
- Answer aloud: `Quid Līvia et Tītus vident?`
