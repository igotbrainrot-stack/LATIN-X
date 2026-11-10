# LATIN X pronunciation standard (LATIN-X-RCL-v1)

**Target:** restored Classical Latin, the educated pronunciation of Rome around the first century BC to the first century AD. This is a reconstruction, not a recording, and some details are uncertain. Church (Italianate) Latin is a different standard, not an error: under this standard it is marked as "not the course standard".

**Status:** drafted by Claude on 10 November 2026. It has not been reviewed by a Latinist. It follows the house convention already used in `docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md`, and the code reproduces all nine Chapter I transcriptions in `docs/audio/latin-ipa-pilot-lexicon.json` exactly.

## What lives where

| File | Purpose |
|---|---|
| this page | The rules, with their sources |
| `scripts/lib/latin-phonology.cjs` | The rules as code: syllables, weight, stress, transcription |
| `EXCEPTIONS.json` | Words the rules get wrong, analysed by hand |
| `QUANTITY_LEXICON.tsv` | Every word form the course shows or speaks (345), with vowel-length status and transcription |
| `QUANTITY_NOTES.json` | Hand decisions that set a word's status, with reasons |
| `LISTENING_SHEET.csv` | One row per recording (75), with the target transcription, what to listen for, and columns for the reviewer's verdict |
| `SOURCE_REGISTER.md` | The sources and what each may be used for |
| `tools/collatinus_stem_check.py` | Regenerates `data/quantity_evidence.json` from Lewis & Short and Collatinus |

`npm run build:pronunciation` rebuilds the lexicon and the sheet. `npm run test:pronunciation` checks the rules, the coverage and that the files are current. That test also runs in `npm test`.

## The rules

1. **Vowel length is part of the word.** A macron marks a long vowel, held about twice as long. A macron does not mark stress. The course spelling with macrons is the source of vowel length; the code never guesses it. Vowel length and syllable weight are different things.
2. **Syllables** (A&G §7). One consonant between vowels starts the next syllable (*pa-ter*). Of two or more, the last starts the next syllable (*hor-tus*, *dīc-sit* for *dīxit*). A stop followed by *l* or *r* starts the next syllable together (*pa-trem*). In prose such a syllable counts as light; in verse it may be either (A&G §603.f). *h* is only a breathing and never closes a syllable. Double consonants are split and both are pronounced (*puel-la*, *vīl-la*).
3. **Weight** (A&G §603.e–f). A syllable is heavy if its vowel is long, if it has a diphthong, or if a consonant closes it. *x* and *z* count as two consonants. *qu* and *ngu* before a vowel count as one.
4. **Stress** (A&G §12). Two syllables: stress the first. Three or more: stress the second-to-last if it is heavy, otherwise the third-to-last. With an enclitic (*-que*, and *-ne* after a consonant), stress the syllable before it (*ha-BET-ne*). Words like *quoque*, *dēnique*, *itaque* are not host plus enclitic.
5. **Vowel before vowel** is short (A&G §603.a), except where a dictionary says otherwise (*Gāius*; the genitive *-īus*; 5th-declension *diēī*). **Vowel before *ns* or *nf*** is long (A&G §603.d). A&G §603.d also says a vowel before *gn* is long; the course prints *magnus*. That is recorded as a convention choice, not an error.
6. **Diphthongs** (A&G §2). *ae*, *au*, *oe* are one syllable everywhere. *ui*, *ei*, *eu* are diphthongs only in listed words (*cui*, *deinde*); elsewhere they are two syllables (*fu-it*, *me-us*).
7. **Consonants** (A&G §§4–5). *c* and *g* are always hard [k] [ɡ], also before *e* and *i*. *v* is [w]. *i* before a vowel at the start of a word is [j] (*iam*), and between vowels it is doubled [jj] (*cuius* [ˈkʊj.jʊs]). *qu* is [kʷ], *gu* after *n* before a vowel is [ɡʷ]. *ph*, *th*, *ch* are aspirated stops [pʰ tʰ kʰ], not [f θ x]. *x* is [ks]. *n* before a velar is [ŋ]; *gn* is [ŋn] (Allen). *r* is a tap or trill; the tap-versus-trill detail is not graded.
8. **Vowel quality** (house convention, after Allen). Long vowels are tense: [aː eː iː oː uː]. Short vowels are lax: [a ɛ ɪ ɔ ʊ]. Do not reduce unstressed vowels to [ə].
9. **Between words.** The transcription is word by word. Elision and final *-m* are verse matters and are not marked in prose; the course has no verse yet.

## Vowel-length status

Each form in `QUANTITY_LEXICON.tsv` has one status. The status describes the evidence, not anyone's opinion of the Latin:

| Status | Meaning |
|---|---|
| VERIFIED | Lewis & Short marks the stem vowels and they agree with the course, or a hand note cites a primary source. |
| SUPPORTED | Collatinus, or a rule from A&G (§603.a, §603.d, or a regular verb ending from §§167–188), agrees, but L&S does not mark the vowel. |
| AMBIGUOUS | Sources disagree, the quantity is disputed, or the course must choose a convention. Listed in `QUANTITY_NOTES.json` with the choice to be made. |
| UNKNOWN | No source marks any vowel of the form. This is mostly short words in closed syllables (*est*, *hortus*), where vowel length does not change the stress. |

The columns `vowels_confirmed`, `unchecked_open_vowels` and `stress_depends_on_unchecked_vowel` show which vowels are covered. No form has an unchecked vowel that decides its stress. Endings that differ only by context (*aqua* / *aquā*) cannot be confirmed from the form alone; the course text and the gold tests in `docs/latin-audit/` cover those.

Nothing here is VERIFIED by a Latinist. Machine checks and Claude's notes are evidence to review, not approval, and agreement between AI systems is not counted as evidence.

## Audio

A recording passes when it matches the transcription in `LISTENING_SHEET.csv` on: vowel length (a long vowel is audibly longer), double consonants (held longer), stress (on the marked syllable), and consonants (hard *c* and *g*, *v* as [w], *qu* as [kʷ]). A text check or a checksum is not a listening check. Text-to-speech prompts should be written from the transcription, not from English respellings such as "wee-det", which turn short vowels into long ones (LX-020).

## Decisions for the owner

- *magnus* / *māgnus* and *significātiō* / *sīgnificātiō* (before *gn*): keep the course spelling or follow A&G §603.d.
- *reconstrūctiō*: the *o* before *ns* should be long (*recōnstrūctiō*), or drop the word (LX-028).
- *dēest* / *deest* (U-03), *Gāius* in two or three syllables (U-05), *tonitrus* with short or long *i*.
