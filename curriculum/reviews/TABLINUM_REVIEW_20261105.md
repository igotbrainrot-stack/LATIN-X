# Tablinum review

Nov 3, 2026 · @igotbrainrot

## Update: curriculum v2 check (5 Nov)

Checked against CLAUDE\_REVIEW\_130.md by parsing vocabulary-budgets-130.json and reading the master plan. The app (index.html) is unchanged, as expected. Totals still add up (130 chapters, 500 / 1,532 / 3,036, review chapters at 0 new words), the strict 1,500 and 3,000 gates are still in CI, and the ledger is still honestly empty.

### Fixed

- **G1, G2, G4, G5:** sequence of tenses now arrives at 67–68, before it is needed; imperfect subjunctive at 68, cum + subjunctive at 74, fear clauses at 76, pluperfect subjunctive at 79 before past contrary-to-fact.
- **G3:** ablative absolute moved to 73, after the ablative uses at 51–57.
- **G6, G7, G8:** 3rd-declension adjectives (35), imperfect, future and pluperfect passive (59, 61, 64), superlative (47), adverbs (58), impersonals (62), irregular verbs (88), future participle (43), supine (107) are all placed.
- **G9, G10, G11, G12:** subjunctive forms taught at 50; sequor gone from 40; 500 planned vs 570 ceiling explained; excerpt words are glossed-only.
- **L1–L14:** all flagged titles are corrected (Līs dē agrō, In thermīs, Epistula iam vēnerat, Venī hūc!, Mē vidēs?, and so on).
- **V1, V3:** chapters 1–10 are now 250–450 words in 2–3 lectiones; 51–55 now start at 800, so the on-ramp is gentle.
- **S1:** Book III entry now needs a tested 600-word passage and a human-reviewed 3-minute interaction.

### Still to fix

1. **Pronouns are missing (new, P1).** No chapter teaches is/ea/id, possessives (meus, tuus, suus) or reflexive sē. Demonstratives hic/ille were moved to 71. These are among the most common words in any Latin text, and chapters 82–83 already use sē in their titles. Suggest is/ea/id plus eius around 20–24, meus/tuus and suus/sē around 26–36, hic/ille back in Book I, with 71 as consolidation.
2. **Chapter 81 repeats chapter 42.** Both teach indirect statement with the present infinitive. Make 81 about eum versus sē, or about time relative to the main verb.
3. **Vocative at 54 is late.** Commands to named people start at 18 (Mārce, venī!). Introduce the vocative at 18 and keep 54 for the fuller treatment. Plural imperatives (-te) are also not listed anywhere.
4. **Remaining macron slips.** Titles: Vox senis → Vōx senis (94), Timeō nē nāvis discedat → discēdat (76), Sī tempus haberēm → habērem (78), Rumōrēs → Rūmōrēs (85), Recēnsiō XXVI — Consilium → Cōnsilium (120). Seed lemmas: tenēo → teneō, sedēo → sedeō, manēo → maneō, surgo → surgō, scribō → scrībō, sentīō → sentiō, laborō → labōrō.
5. **Book II–III pace (V4) is unchanged.** About 32 new words per teaching chapter in Book II and 47 in Book III, against 13 in Book I. That is fine only if the retention checks are real, so the registry and pilot still have to prove it.
6. **Total size (V5) went up.** The ranges now sum to about 164k–241k words of Latin, so the ch 6–8 pilot matters even more for estimating effort.
7. **Not started yet, as planned:** the lexeme registry (A1–A3), the architecture spike (R1–R5: file:// loading, chapter slugs, IndexedDB audio, modules), human audio and circling questions (S2–S3).

Verdict: the grammar order is now sound for Book I–II except for the pronoun gap. Fix items 1–4 (a small edit to the JSON and master plan), then move to cycle 2 (registry) and cycle 3 (architecture spike).

## Update: 35-chapter outline review (4 Nov)

The outline has the right shape: one grammar point per chapter, a review chapter every 3–4, and the overloaded old chapters 7–8 spread across chapters 7–16. It needs three changes before any chapters are written:

- Several grammar topics essential for real reading are missing.
- Chapters 3 and 4 are in the wrong order.
- The word target needs a decision.

No app code changed: the zip is the approved manuscript build plus a new `curriculum/` folder.

**1. Word target: the outline is right, and the conflict came from my handover.** I suggested warning above 15 new words per chapter while also aiming for 800–1,200 words. With 27 teaching chapters, 15 per chapter gives about 400 words. Natural-method readers typically introduce about 25–40 new words per chapter, supported by long, repetitive stories. **Recommendation:** allow about 25–30 new words per teaching chapter (at most \~15 in chapters 1–5), which gives about 750 words, and reach \~1,000 through the graded extra readings.

**2. Grammar gaps (needed to read easy original Latin)**

| Missing topic | Why it matters | Suggested slot |
| --- | --- | --- |
| Ablative with *in, cum, sub, ē/ex, dē* | Used from chapter 1 (*in hortō*) but never taught as a point | Chapter 6, alongside *ad* + accusative (place where vs place to) |
| 1st and 2nd person verbs (*-ō, -s, -mus, -tis*) and *ego/tū* | Every dialogue needs them, and the stories already use *habēmus* and *faciēmus* | Its own chapter around 7–8 |
| Plural nouns and adjective agreement | Only neuter plurals are covered | Fold into chapters 5–7 |
| Infinitive with *possum, volō, dēbeō* | Very common, and *nōlī timēre* already needs the infinitive | Before chapter 11 |
| Personal and possessive pronouns (*is/ea/id, meus/tuus/suus, sē*) | Essential for following any story | Around chapter 18 |
| **Indirect statement** (accusative + infinitive) | One of the most frequent structures in real Latin, and fables use it constantly | Replace chapter 25 (the future perfect, which is rarer) |
| **Ablative absolute** | Very frequent in narrative prose | After the participles, around chapter 31 |
| Deponent verbs | Chapter 29 lists *sequor* as a seed word but never teaches deponents | One chapter, or move *sequor* later |
| Comparatives (*maior, melior*) | Common in fables | Can share a chapter with the 5th declension |

There are more than 35 slots' worth of topics now. I'd make chapters 33–34 (4th and 5th declension) a single chapter, and teach *diēs* and *rēs* as vocabulary early (around chapter 9, *Herī*), since they're so frequent.

**3. Order and wording fixes**

- Chapter 3 teaches the dative before chapter 4 teaches the accusative, but the object *rosam* has to be understood before *Līvia rosam mātrī dat* makes sense. Swap them: accusative in 3 (*Dōnum*), dative in 4 (*Cēna*, "Flāvia Tītō pānem dat").
- Titles don't match between the table and the guidance list for chapters 20, 23 and 32. *Quid faciāmus?* (ch 32) is a subjunctive, which isn't taught by then.
- Chapter 33 lists *nāvis* among its seed words, but *nāvis* is 3rd declension, not 4th. *Exercitus* (army) fits a harbour story oddly.

**4. Latin and data errors in the seed lists**

- Chapter 4 seed *ēdō* is the wrong word: *ēdō* means "put forth, publish". "Eat" is *edō* (short e). The DCC matching picked a homograph.
- *bībō* (ch 4 note) should be *bibō*.
- *māgnus* is spelled *magnus* in the lessons. Pick one convention and use it everywhere.
- *fīlius* is listed as not found in the core list, but it is one of the most common Latin nouns, so the matching probably missed it. Spot-check the "not matched" list by hand before relying on the audit.

**Tested:** I read the outline and spot-checked the audit JSON; the app files are unchanged from the approved design build. **Not checked:** the full DCC mapping against the CSV, which isn't included in the zip.

## Update: manuscript redesign, second pass (4 Nov)

All findings from the first design review are fixed, and only the CSS and footer text changed: the app script is byte-for-byte the same as the previous build. I'd consider the design ready to merge after a real-device check.

- **Colour restored.** The scene filter is now `none`, so the red rose, green tree and yellow sun are back.
- **Phone layout fixed.** In my 390 px static mock-up the first sentence now sits above the toolbar, and the second is half visible. The header is one line on phones and the toolbar is a compact 4-button row.
- **Status line** stays in the accessibility tree when empty. **Footer** now reads v0.4.2.

**Minor, optional:** on phones the picture is now only 108 px tall, which makes small details such as the rose hard to see. Something like 130 px is a better balance. The toolbar buttons are 32 px tall, which passes WCAG's 24 px minimum but is under the 44 px touch size most phone guidelines recommend.

**Tested:** I compared the scripts (identical), diffed the CSS, and re-rendered the same static mock-up at 1366 px and 390 px. **Not run:** the real app and its tests.

## Update: manuscript redesign review (4 Nov)

The redesign looks good and breaks nothing. The script is the v0.4.2 code, and the only changes from v0.4.1 are the two items from my last review. All text contrast passes. Two things should change before merging: the sepia filter strips the colour that the story depends on, and on phones the header and toolbars push the first Latin sentence below the fold.

**Tested:** I diffed the script against v0.4.1 and ran `node --check` on it (passes). I computed contrast for 14 colour pairs. I also rendered a static copy of the page with the new CSS and hand-written lesson markup, with no app code, at 1366 px and 390 px to check the layout. **Not run:** the real app, `npm test` and `npm run test:browser`. I can't see the GitHub Actions run the handover cites, so I haven't verified that it passed.

**v0.4.2 code changes (from v0.4.1):** the arrow-key error in hint words is fixed, with a guard against a missing parent. Each of the 8 short-answer questions now lists 3 accepted answers, for example *Līviae / frāter Līviae est / Tītus est frāter Līviae*. The variants are good Latin. I have no further code issues.

**Design findings**

| Pri | Issue | Fix |
| --- | --- | --- |
| P2 | The sepia filter on the scenes (`grayscale(.48) sepia(.78) saturate(.52)`) turns the red rose in chapter 3 grey, though the caption says *rosam rubram*. The green tree and yellow sun lose their colour too. In a natural-method course the picture carries meaning, so this works against the teaching. | Drop the filter, or use a light warm tint such as `sepia(.15)`, and keep the original fills. |
| P2 | On a 390 px phone, the title block, tab bar and chapter strip take about 380 px and the sticky toolbar about 110 px. The first sentence doesn't appear until you scroll. | Under 720 px, shrink the header to one line (or hide the tagline and version), and fold the toolbar's voice description into a single line. |
| P3 | The status line uses `.app-status:empty{display:none}`. Some screen readers don't announce a live region that only appears when its text is added. | Keep it in the layout but visually empty (zero padding) rather than `display:none`. |
| P3 | The header says v0.4.2 but the footer still says v0.4.1. | Update the footer. |
| P3 | The scene keeps its pale side bands at wide widths, as in the original. | Cosmetic. `preserveAspectRatio="xMidYMid slice"` would fill the frame. |

**Passes:** all text pairs are 5–8:1 (labels, hints, toolbar, footer, feedback boxes, primary buttons). The focus ring is 5.8:1 against the page. Hidden hint buttons stay hidden (`[hidden]{display:none !important}`). There is a reduced-motion rule and a print style. The fonts are local book serifs (Palatino, Book Antiqua, Georgia), all of which include the macron vowels ā ē ī ō ū.

## Update: v0.4.1 review (4 Nov)

v0.4.1 fixes everything from the v0.4 review. It adds one small new keyboard bug, and one item I raised turns out to have been my own mistake. The code is ready for a real browser test, and after that the work should move on to course content.

**Tested:** I diffed it against v0.4 line by line (the changes are limited to the review items) and ran `node --check` on the script (Node 22.23.4), which passes. **Not run:** the app in a browser and `tests/smoke.test.cjs`, for the same reason as before.

| v0.4 item | v0.4.1 |
| --- | --- |
| Hint button counts with "Guidance off" | Fixed. The button is hidden while guidance is off, and the levels are kept. |
| New Latin clues (*panem*, *vides*, \~35 unknown words) | Fixed by removing them. Step 1 now shows the previous sentence (or the scene caption for sentence 1), and those words can be clicked. This is honest but weak teaching, since the learner has just read that sentence. Proper clues are a content task for the Latinist pass. |
| Lesson Play button label | Fixed. It is now specific to each mode. |
| Gloss stays under the old sentence | Fixed. |
| One-sentence mode overrun | Fixed. It is checked every animation frame, with a 25 ms margin. |
| Focus jumps to an earlier repeated word | Fixed. It now records the sentence and word position. |
| `Object.hasOwn` on older Safari; `<small>` contrast | Both fixed. |
| Chapter 1 question uses Titus and Marcus too early | Fixed. The distractors are now chapter 1 words. |
| *Quattuor hominēs in vīllā habitant* rejected | **My error.** That question is multiple choice, so the example didn't apply. The extra key added for it is harmless. The real gap is in the short-answer questions: natural variants such as *Frāter Līviae est* (for *Cuius frāter est Tītus?*) are still rejected. Adding two or three listed variants per short question is the safe fix; rejecting broad substring matching was the right call. |

**New in v0.4.1**

- **P3: arrow keys on a word inside a step-1 hint throw an error.** The keydown handler looks for `.closest(".words")`, but hint words sit in `.hint-words`, so it gets `null` and throws a TypeError (L572). Match `.words, .hint-words` instead.

**Next:** run `npm test` and one browser pass on your machine, then start the content phase: rewriting chapters 6–8, the 35-chapter outline, and Latinist-reviewed step-1 clues.

## Update: v0.4 review (4 Nov)

v0.4 is a real fix. All three P1 bugs, every P2 item and almost all of the Latin corrections are done properly in the source, not patched on top. What remains is one confusing interaction, new Latin in the hint clues that needs checking, and a few small items. I'd treat v0.4 as the new baseline.

**Tested:** I extracted the script and ran `node --check` on it (Node 22.23.4); the syntax passes. I confirmed `archive/index-v02-original.html` is identical to the original upload, and read the whole new `index.html` (584 lines) against each earlier finding. I recomputed the contrast ratios. **Not run:** the app in a browser, the bundled `tests/smoke.test.cjs` (it executes the app code, which is blocked here), speech and real audio. The v0.4 handover says its author couldn't run Node either, so nobody has run that test file yet.

**Earlier findings: status in v0.4**

| Finding | v0.4 |
| --- | --- |
| Bad backup blanks the app (P1) | Fixed. `normalizeState()` checks every field's type at startup and on restore, then re-saves clean data. |
| HTML injection via `ch` (P1) | Fixed. `ch` is clamped and the heading is escaped. |
| "Previous" on imported text corrupts progress (P1) | Fixed. It returns to chapter 1. |
| Timed Prev/Next don't seek; page redraw during playback | Fixed. Selection seeks, and playback only toggles the highlight. |
| Safari lookbehind regex | Fixed. |
| Exact-match short answers | Partly. The answer word or the exact model sentence is accepted, but *Quattuor hominēs in vīllā habitant* is still rejected because the model is *Quattuor hominēs habitant*. Accept any answer that contains the key word. |
| Silent save failures, file size limits, truncation warning | Fixed. |
| Prototype-name glossary bug; multiple-choice selection and locking; hardcoded counts; end of book | Fixed. |
| Speech: voice loading, Stop label, voice name shown | Fixed. |
| "Speak / play selected" label in untimed mode | Fixed in the bottom bar, but the identical button at the top of each lesson still has the old label. |
| Audio lost on chapter change; play one sentence only | Fixed. Audio is kept per chapter for the session, and there is a one-sentence mode. |
| Keyboard: file inputs, one tab stop per sentence, `lang="la"`, live status, focus restore | Fixed. |
| Contrast | Fixed for labels, body text, footer and focus ring (now 6–7:1). Plain `<small>` text is still 4.1:1 on white. |
| Mobile gloss off screen | Fixed. The gloss now shows inline under the sentence, and the audio bar is sticky on phones. |
| *canis*, *pānis*, *habitāre*, *omnēs*, *Hic* gloss, *Cuius frāter*, *per fenestram*, chapter 7 and 8 notes, glossary gaps | Fixed. Chapter 6 now asks *Quō canis currit?*, which avoids the giveaway. |
| The two wrong fill-in-the-gap keys | Fixed. Both items were rewritten so that only one answer fits. |
| Chapter 1 question uses Titus and Marcus before they are introduced | Not fixed (minor). |
| Chapter 7–8 pacing | Not changed, and acknowledged in the handover. This is the next content job. |

**New issues in v0.4**

| Pri | Issue | Where | Fix |
| --- | --- | --- | --- |
| P2 | With "Guidance off", the hint button still counts up (1/3, 2/3…) but no hint ever appears. It looks broken. | L350 | Show hints regardless of that toggle, or hide the hint button when guidance is off. |
| P2 | The new Latin hint clues (`latinClues`, 67 lines) are fresh, unreviewed Latin. Two of them write *panem* without the macron again, and one writes *vides* for *vidēs*. | L153, L156 | Fix those three, and have the clues reviewed with the stories. |
| P2 | The clues use about 35 words the learner hasn't met (*aspice, quaere, tristis, foeda, cōnsōlātur, praeparat…*), and hint text can't be clicked for a gloss. So a clue is often harder than the sentence it explains. | L153–160 | Write clues from known words only, or render them with clickable words. |
| P3 | Selecting another sentence moves the highlight, but the word gloss stays under the previous sentence until the next full redraw. | L433–438 | Redraw the gloss, or clear the chosen word, on selection. |
| P3 | In one-sentence mode, playback can run up to about 0.25 s into the next sentence, because `timeupdate` only fires about 4 times a second. | L564 | Check against the end time with `requestAnimationFrame` while playing. |
| P3 | Focus restoration matches the first word with the same text, so after clicking *Līvia* in sentence 6 focus can jump back to sentence 3. | L267–270 | Include the sentence number in the focus record. |
| P3 | `Object.hasOwn` sets a new minimum of Safari 15.4 (March 2022). Older iPhones get a blank page. | L139, L322 | Use `Object.prototype.hasOwnProperty.call`, or accept that minimum. |

**Next step:** fix the P2 items (about an hour), run `npm test` and a real browser pass on your own machine, then move on to the content work: rewriting chapters 6–8 into slower chapters and drafting the 35-chapter outline.

## Update: v0.3 review (4 Nov)

v0.3 adds three useful features but fixes none of the bugs or Latin errors below. Its `index.html` is the v0.2 file byte for byte, plus a 157-line patch inserted before the first render. The patch also copies two of the Latin errors into its new exercises and adds two answer keys that reject correct answers.

**Tested:** I extracted the script and ran `node --check` on it (Node 22.23.4): the syntax passes. I compared `index.original.html` with the v0.2 upload (identical) and read the patch line by line. **Not run:** the app in a browser, the bundled `smoke-test.js`, the 32 exercises, and audio. Running uploaded code is blocked in this session. Note that `smoke-test.js` only compiles the script and searches for strings, so it can't catch any of the issues below.

**What v0.3 added, and how well it works**

| Feature | Verdict |
| --- | --- |
| Three-step help per sentence (Latin context, then vocabulary, then English) | Right idea, and it follows the Latin-first approach. But step 1 shows the same chapter-level context line for every sentence, so it isn't really a hint about that sentence. In chapter 3 it nearly gives sentence 5 away word for word. Step 2 lists the first 4 glossary hits in order, so words like *in* and *est* crowd out the useful ones. Skip names and function words first. |
| One fill-in-the-gap question per chapter (8) | Good format, but two keys reject correct answers: *In hortō est \_\_\_\_* accepts only *arbor*, though the story also says *In hortō est puella*; and *Mārcus pater \_\_\_\_ est* accepts only *Līviae*, though *Tītī* is equally true. Two items copy the v0.2 errors *Cānis* and *panem*. |
| Confidence self-rating per chapter | Works, but nothing uses it yet. It could decide which chapters come up for rereading. |
| Progress panel for the new items | Hardcodes `/ 8` again. |

**Status of the earlier findings in v0.3**

| Finding | v0.3 |
| --- | --- |
| P1: a backup with `notes: null` blanks the app permanently | Still present. `help()` is unchanged, and the new `ensureGuidedState()` only checks the four new fields. |
| P1: HTML injection through `S.ch` in the heading | Fixed by accident. The rewritten reader escapes `Number(S.ch)+1`. |
| P1: "Previous lesson" on an imported text saves progress under `NaN` | Still present (now labelled "Previous chapter"). |
| All P2 and P3 code items, audio, storage and accessibility | Still present. Unchanged code. |
| Latin corrections (*canis*, *Ad quem*, *pānis*, macrons, notes) | None applied, and two are repeated in the new exercises. |

**New small issues in the patch:**

- Hint levels for imported text are keyed by sentence number, so a newly imported text inherits the old text's hint levels.
- The help button adds one more tab stop per sentence, and every click still rebuilds the page and loses focus.
- Backups still say `app: "tablinum-v02"` with no version field, although they now hold v0.3 state.

**Recommendation:** before adding more features, apply phase 1 of the plan (the P1 and P2 fixes plus the Latin table) directly in the source, not as another patch layered on top. Then fix the two cloze keys by allowing several accepted answers per item. Patching around the old functions keeps every old bug alive and makes the code harder to change each round.

## Summary

Tablinum is a tidy, honest prototype with three bugs worth fixing before anything else: a corrupt backup can permanently break the app, a crafted backup can inject HTML, and "Previous lesson" from an imported text corrupts saved progress. The Latin is mostly sound, but chapter 6 misspells *canis* throughout, one question gives away its own answer, and chapters 7 and 8 introduce three past and future formations far too quickly for a natural-method course.

The upload is a single-file web app (`index.html`, about 200 lines of vanilla HTML, CSS and JavaScript) plus a handover document, a README, a review prompt and a list of 25 resource groups. It holds 8 chapters, 67 Latin sentences and 24 questions. The handover is candid about its limits, and I found its claims about what is and isn't implemented to be accurate.

**What was tested.** This is a static review: I read every line of the source and the handover. I checked the Latin by hand, measured the dictionary's coverage of the story text with a script that parses the lesson data without running it, and computed colour contrast ratios. **Not run:** the app itself in a browser, the 24 questions end to end, speech, and timed audio. Running the uploaded code was blocked in this session. Every defect below is from reading the code, and each names the line it comes from.

## Code defects, by priority

The three P1 items each take a few lines to fix. Line numbers refer to the uploaded `index.html`.

| Pri | Defect | Where | Fix |
| --- | --- | --- | --- |
| P1 | A backup or stored state with a field of the wrong type (e.g. `"notes": null`) is merged as is. `help()` then throws on every render, the page goes blank, and the bad state is saved, so reloading doesn't help. | L132, L178, L162 | Validate each field's type on load and restore, and fall back to `base` per field. |
| P1 | `S.ch` from a backup is written into the heading unescaped (`Lectiō ${S.ch+1}`). A backup with `"ch":"<img src=x onerror=…>"` runs script, and it persists in localStorage. | L163, L178 | Coerce `ch` to an integer 0–7 or `"custom"` on load, and pass the heading through `esc()`. |
| P1 | "Previous lesson" on an imported text runs `Number("custom")-1`, which is NaN. Progress is then saved under `NaN:0` (`null:0` after reload), never counts, and no chapter is highlighted. | L186–187 | Treat `custom` explicitly: send it to chapter 1 or hide the button. |
| P2 | In timed mode, Prev/Next change the selection without seeking. While audio plays, `timeupdate` immediately snaps the selection back. | L184–185, L198 | Seek in timed mode, or disable Prev/Next during playback. |
| P2 | Timed playback re-renders the whole page at each sentence boundary. Anyone typing a note or focused on a button loses focus and caret. | L198 | Toggle the `.selected` class on the two affected sentences only. |
| P2 | The lookbehind regex used for sentence splitting is a parse error in Safari before 16.4 (iOS 16.3 and older), so the whole app fails to load there. | L139 | Split with `/([.!?])\s+/` and rejoin, or use `Intl.Segmenter` where present. |
| P2 | Short answers must equal the key exactly. "Arbor magna est." is marked wrong for *Arbor magna est an parva?*, though the page asks for Latin answers. | L164 | Accept a list of keys per question, and accept a full sentence that contains the key. |
| P2 | `save()` swallows quota and private-mode errors, while the UI says notes are "saved locally". | L135 | Show a one-line warning when a save fails. |
| P3 | The dictionary is a plain object, so an imported word like *constructor* matches `Object.prototype` and shows an empty entry. | L127–128 | Use `Object.create(null)` or a `Map`. |
| P3 | Multiple-choice questions don't mark which option was picked. Picking a wrong option after a right one records the wrong answer but still shows "Rectē". | L164–165 | Highlight the chosen option and freeze the question once correct. |
| P3 | The course size is hardcoded: `7`, `8/`, `/24`, `/3`. "Next chapter" on chapter 8 just reloads chapter 8. | L165, L169, L187 | Derive the counts from `L`, and show an end-of-book message. |
| P3 | Changing chapter clears every chapter's revealed hints, and the rain scene still draws the sun. | L171, L142 | Clear hints only for the chapter being left, and make the sun optional per scene. |

## Latin

The sentences are grammatical and the story holds together. The problems are a few macrons, one self-answering question, thin grammar notes for chapters 7 and 8, and the pace. These are my corrections; a Latinist should still sign off, as the handover says.

| Ch | Issue | Correction |
| --- | --- | --- |
| 6 | *Cānis* is wrong throughout: chapter title, sentences, glossary headword, question and grammar note. *Canis* has a short a, while *cānus* means grey-haired. The sentences already write *canem*, so the chapter is inconsistent with itself. | *canis* everywhere |
| 6 | *Ad quam canis currit?* asks "to which woman", and Livia is the only woman among the options, so the question gives its own answer away. | *Ad quem canis currit?* |
| 4, 3, 8 | *panis* and *panem* need a long a. | *pānis*, *pānem* |
| 1 | *Hic est hortus* is glossed "Here is a garden" and *hic* as "here". That meaning needs *hīc*. Without the macron the sentence means "This is a garden", which matches *Haec est vīlla* in chapter 2. | Keep *Hic*, translate "This is a garden", and gloss *hic* as "this (masc.)" |
| 2 | The headword *habitare* lacks its macron, and so does the shared headword *omnes*. | *habitāre*, *omnēs* |
| 2 | *Tītus est frāter cuius?* is unnatural word order. | *Cuius frāter est Tītus?* |
| 7 | *Ad fenestram spectābat* reads as "looked toward the window". The scene is Titus watching the storm outside. | *per fenestram spectābat* |
| 7 | The note covers *erat*, *manēbat*, *legēbat* and *dīxit*, but not *sonuit* (perfect) or *Nōlī timēre* (negative command), both used in the story. | Add one line on each |
| 8 | The note says future endings are *-bit* and *-bimus*, but the story also uses *feret* and *faciēmus*, which have no *-b-*. Learners will read *faciēmus* as a mistake. | Say that 3rd and 4th conjugation verbs form the future with *-am, -ēs, -et, -ēmus* |
| 1 | Question 2 offers Tītus and Mārcus as options before they are introduced in chapter 2. | Use names from chapter 1 only, or accept this as a deliberate distractor |

**Dictionary gaps.** 243 of 255 story words (95%) resolve to an entry. The forms with no entry are: *hominēs* (ch 2); *mātrem*, *mātrī*, *patrem*, *Grātiās*, *agō* (ch 3); *respondet* (ch 5, 8); *Nōlī*, *timēre* (ch 7); *parāmus*, *rosās*, *sē* (ch 8). The question options *Tītō*, *patrī*, *Mārcum*, *Tītum* and *quam* are also missing. *Interrogat* (ch 5) resolves only because the glossary is global; its entry sits in chapter 8.

**Difficulty.** Chapters 1–6 move at a sensible natural-method pace (present tense; nominative, accusative, genitive, dative and ablative of place). Chapter 7 then introduces the imperfect, the perfect and a negative command in 8 sentences, and chapter 8 adds two different future formations. With 8–9 sentences per chapter there isn't enough repetition to absorb any of these. *Familia Romana* doesn't reach past tenses until the second half of the book. I'd spread chapters 7–8 over at least 4–6 chapters and double the sentence count per chapter before adding new grammar.

## Audio and speech

The timed and untimed modes are kept honestly separate. Untimed audio never seeks, and nothing invents timestamps. The gaps are in the details.

- **The first Speak usually picks the wrong voice.** `speechSynthesis.getVoices()` returns an empty list until Chrome fires `voiceschanged`, so the first utterance goes to the default voice (usually English). Even later, no common desktop voice has `lang` starting with "la", so the fallback is silent. Show the name of the voice actually in use beside the Play button (L174).
- **Pause stops speech for good.** In voice mode Pause calls `cancel()`, so there is nothing to resume. Either label it Stop or use `speechSynthesis.pause()` and `resume()` (L183).
- **The "Speak / play selected" label is wrong for untimed audio.** That mode plays from wherever the recording is, not from the selected sentence. Relabel the button per mode (L163).
- **Timed audio plays past the selected sentence.** That may be intended, but a "play this sentence only" option (pause at `ranges[i].end`) is what learners usually want for repetition.
- **The duration check is skipped if metadata hasn't loaded.** A timing JSON loaded right after attaching audio passes with `audio.duration` still NaN. Wait for `loadedmetadata` before validating (L178).
- **A malformed timing file shows a raw JavaScript error** (for example `null` gives "Cannot read properties of null"). Show the friendly message instead.
- **Changing chapter discards the audio.** This is documented, but anyone with audio for several chapters has to re-attach the file each time. Keeping the file and its ranges per chapter for the session would fix that.

## Storage, imports and backups

The main risk is that every restored field is trusted. The two P1 items above come from that. Beyond those:

- **There's no schema validation or migration.** `{...base, ...old}` is a shallow merge with no version check. Restoring a backup with `vocab: "x"` or `custom: 5` crashes the Memoria or reader view. Add a `normalizeState()` that checks each field's type, clamps `ch` and `sel`, and drops unknown keys, then call it both at startup and on restore. Keep `version` in the stored state, not only in the export envelope.
- **Files are read whole before any limit applies.** A 500 MB file picked as ".txt" is read completely into memory before being cut to 20,000 characters. Check `file.size` first, at about 1 MB for text and timing files and a few MB for backups.
- **Long text is cut without warning.** Pasted text over 20,000 characters is silently truncated. Add `maxlength` to the text box or say how much was cut.
- **Sentence splitting is crude.** It ignores `;` `:` and line breaks, so verse or unpunctuated text becomes one sentence. It also breaks at abbreviations such as *M. Tullius*.
- **Escaping is otherwise good.** Every other value from state goes through `esc()` before it reaches `innerHTML`, and nothing is fetched from the network.
- **Reset is narrower than the user may expect.** It keeps notes and imported text. The label says so, so this is acceptable.

## Accessibility and mobile

The biggest accessibility problem is that every click rebuilds the whole page, so keyboard and screen-reader users are sent back to the top after each action.

- **Focus is lost on every action.** `render()` replaces `main` and the side panel, so clicking a word, a hint or an answer leaves focus on `<body>`. Restore focus to the equivalent element after rendering, or update only the parts that changed.
- **File pickers can't be reached by keyboard.** All four (text, audio, timing, restore) are `display:none` inputs inside a `<label>`, which can't take focus. Use a visually hidden but focusable input, or a real button that calls `input.click()`.
- **Latin isn't marked as Latin.** The page is `lang="en"`, so screen readers read Latin with English rules. Add `lang="la"` to sentences, questions and headwords.
- **Feedback isn't announced.** "Rectē!" and "Not quite" and the word meanings appear silently. Put them in an `aria-live="polite"` region. The tabs also lack `aria-current` or a `tablist` role, so the active tab is shown by colour only.
- **Every word is a separate tab stop.** A 9-sentence chapter means about 40 tab stops before reaching the questions. Make one tab stop per sentence, with arrow keys to move between words.
- **Some text fails contrast.** I computed these ratios against WCAG AA (4.5:1 for text, 3:1 for focus indicators): `.mini` labels 3.8:1, `.subtle` 3.8:1, the footer 3.3:1 and the focus ring 2.6:1. Much of the text is also 10–12px.
- **Illustrations have no real description.** Every scene has `aria-label="Contextual illustration"`. Use the chapter's context sentence instead.
- **On phones, word meanings appear far below the text.** Under 620px the help panel stacks below the whole lesson, so tapping a word shows its meaning off screen. A bottom sheet or a popover by the word would fix it. The audio dock also isn't sticky, so Play is at the very bottom of the page. (Inferred from the CSS; not checked on a device.)

## Resources: integrated vs planned

None of the 25 resource groups is integrated, and the handover says so correctly. The zip holds only the names of the archives, not the archives themselves, so I couldn't check hashes, contents or licence files. The app's library page lists LatinCy, Whitaker, Lewis & Short, Perseus, Vox Classica, WaveSurfer, aeneas and TS-FSRS as "planned, not implemented", which is accurate.

The licence notes below are from memory of these projects. Confirm each against the LICENSE file in the exact archive before using it.

| Resource | Likely licence | Consequence |
| --- | --- | --- |
| TS-FSRS, WaveSurfer.js, LatinCy models and tools | MIT or BSD-style | Safe to bundle with attribution |
| Perseus canonical-latinLit, Perseus lexica (Lewis & Short) | CC BY-SA | Can ship derived data, but that data stays share-alike |
| aeneas | AGPL-3.0 | Keep it as an offline authoring tool. Don't link it into the app or run it as a network service. |
| latin-macronizer | GPL | Use it offline to macronize your own texts; the output is fine to ship |
| Whitaker's Words | Permissive (verify) | Fine to precompute a lookup table from |
| Gutenberg EPUBs (Ritchie, D'Ooge), LibriVox Aesop | Public domain in the US | Strip Gutenberg branding; check rules in your own country |
| Allen & Greenough (Alpheios copy) | Possibly non-commercial | Prefer the Dickinson College edition |
| Vox Classica audio, Bewick ebook (z-library) | Unknown | Don't integrate or commit until provenance is established |

## Next-phase plan

Keep the app static and do the heavy language work at build time. Python tools (LatinCy, Whitaker, the macronizer, aeneas) run offline over your own lesson texts and write small JSON files. The browser app only loads those files, so it stays installable, fast and licence-clean. Each phase below ships on its own and doesn't rebuild what already works.

1. **Fix and split (about 1–2 days).** Apply the P1 and P2 fixes above and the Latin corrections. Move the lesson data from `index.html` into `lessons/ch01.json` and so on, with a schema that allows several answer keys per question. Add a small Playwright test that loads each chapter, answers all 24 questions, and does a backup and restore round trip, including a malicious backup.
2. **Real dictionary (about 1 week).** Build-time script: run LatinCy over each lesson to get the lemma and morphology of every token. Add short glosses from the DCC core list (997 lemmas) and fall back to Whitaker's Words. Write `lexicon.json`, keyed by form and pointing to the lemma, gloss and parse. The app looks up the token by its position in the sentence, so homographs are resolved by the parser rather than by first-match. Every token gets an entry, and anything unresolved is flagged for you to fill by hand.
3. **Controlled progression (ongoing).** Use the same pipeline to report, per chapter, which lemmas and grammar features are new, and to warn when a chapter introduces more than about 15 new lemmas or more than one new construction. This is what turns the 35–40 chapter course in the handover into something you can check rather than hope for.
4. **FSRS review (about 2–3 days).** Replace `rate()` with TS-FSRS, which is MIT licensed and ships as an ES module. Store its card state inside `S.vocab`, migrating existing cards as new. Review each word inside the sentence it was saved from, not as a bare word, which fits the natural method.
5. **Verified audio (about 1 week).** Record or source a clean reading per chapter. Run aeneas offline to produce the same `[{start,end}]` JSON the app already accepts. Add a WaveSurfer view in an authoring page where you check and adjust boundaries, and ship only timings you have checked. Store audio with IndexedDB rather than as object URLs so it survives a reload.
6. **Imported texts (about 1 week).** Accept Perseus TEI and Gutenberg EPUB at build time, run them through the macronizer and phase 2, and publish them as graded readers tagged with how much of their vocabulary is already known at each chapter. In-browser `.txt` import stays as the quick path.