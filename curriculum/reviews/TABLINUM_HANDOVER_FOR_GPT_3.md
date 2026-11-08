# Tablinum: handover for the next phase

Prepared 3 November 2026 from an independent review by Claude of the `tablinum-claude-review.zip` package (`index.html` v0.2, `CLAUDE_HANDOVER.docx`, `README.md`, `USER_PROVIDED_RESOURCES.md`).

> **Status update, 4 November 2026.** Sections 2 and 3 are now done in v0.4.2. That build also has the "classical manuscript" design, which Claude reviewed and considers ready to merge after a real-device check. Treat v0.4.2 plus the manuscript design as the baseline.
>
> Still open:
> - a real browser and audio test pass
> - Latinist review
> - Latin step-1 hint clues, which currently just repeat the previous sentence
> - sections 4–8
> - the new **section 10 (illustration art direction)** and **section 11 (further learning-experience improvements)**
>
> The next work is content and art, not more code polishing.

## How to use this document

You are taking over Tablinum, an original, immersion-first Latin course built as a single static web app (`index.html`, vanilla HTML/CSS/JS, no build step). Work through the phases in order. Each phase should end with a runnable app and a short changelog. Do not rebuild features that already work.

**Non-negotiable principles**
- Latin first. English is optional help that is revealed only on request, never the default.
- Original content only. Do not reproduce Familia Romana text, exercises, images or audio. Do not commit copyrighted books or audio from the user's resource folder to any repository.
- Be honest in the UI. Never claim pronunciation, timings or Latin are "verified" unless a human checked them.
- Keep the runtime static. Heavy language processing (parsing, macronizing, alignment) runs offline at build time and outputs small JSON files.

**Testing requirement.** For every change, state the exact test command, browser and result, and say clearly which tests were not run. The code review below was static: the app was never executed in a browser, so none of its findings have been confirmed at runtime. Reproduce each bug before fixing it.

---

## 1. Current state (v0.2)

- 8 chapters, 67 Latin sentences (~255 words), ~100 distinct lemmas, 24 questions (16 multiple choice, 8 short answer).
- Features: click-a-word glossary (hand-made, ~95% of story tokens covered), optional per-sentence English, macron toggle, grammar notes, notes per chapter, simple interval flashcards (not FSRS), browser speech, local MP3/WAV with optional timing JSON, `.txt` import, JSON backup/restore. State lives in `localStorage` under `tablinum-source-review-v02`.
- None of the 25 user-supplied resource groups (LatinCy, Whitaker, Perseus, DCC core list, TS-FSRS, WaveSurfer, aeneas, etc.) is integrated. The handover's description of this is accurate.

---

## 2. Bugs to fix first (line numbers refer to the v0.2 `index.html`)

### P1: fix before anything else
1. **A bad backup or stored state bricks the app permanently.** Lines 132 and 178 shallow-merge restored state with no type checks. `{"state":{"notes":null}}` makes `help()` (L162) throw on every render. The page goes blank and the broken state stays saved. **Fix:** add a `normalizeState(raw)` function that type-checks every field, clamps `ch` (integer 0..N-1 or `"custom"`) and `sel`, falls back to `base` per field, and drops unknown keys. Call it at startup and on restore. Keep a `version` field in the stored state and migrate from older versions.
2. **HTML injection via backup.** L163 writes `S.ch+1` into `innerHTML` unescaped. A backup with `"ch":"<img src=x onerror=alert(1)>"` runs script, and it persists. **Fix:** item 1's normalization, plus `esc()` on the heading.
3. **"Previous lesson" on an imported text corrupts progress.** L186–187 compute `Number("custom")-1`, which is NaN. Answers are then stored under `NaN:i` (`null:i` after reload), never count toward progress, and no chapter is highlighted. **Fix:** handle `"custom"` explicitly.

### P2
4. **Timed audio: Prev/Next don't seek** (L184–185). While playing, the `timeupdate` handler (L198) snaps the selection back. Seek in timed mode, or disable those buttons while playing.
5. **Timed playback re-renders the whole page** at each sentence boundary (L198), destroying focus and the caret in the notes box. Toggle `.selected` on two elements instead.
6. **Safari before 16.4 can't load the app.** The lookbehind regex `(?<=[.!?])` at L139 is a parse error there. Replace it with a split-and-rejoin, or `Intl.Segmenter` where available.
7. **Short answers need an exact match** (L164). "Arbor magna est." is rejected for the key "magna". Allow several accepted answers per question, and accept a full sentence that contains the key.
8. **`save()` swallows quota and private-mode errors** (L135) while the UI says "saved locally". Show a warning.

### P3
9. **The glossary uses a plain object** (L127–128), so the imported word "constructor" matches `Object.prototype`. Use `Object.create(null)` or a `Map`.
10. **Multiple-choice questions don't show which option was picked.** A wrong pick after a correct one still shows "Rectē". Highlight the choice and lock the question once it's correct.
11. **The course size is hardcoded** (`7`, `/8`, `/24`, `/3` at L165, L169, L187). "Next chapter" on chapter 8 just reloads chapter 8. Derive the counts from the data and add an end-of-book screen.
12. **Changing chapter wipes every chapter's revealed hints** (L171), and the rain scene draws a sun (L142).

### Audio and speech
- `speechSynthesis.getVoices()` is empty until `voiceschanged` fires, so the first Speak uses the default (English) voice. Wait for voices and show the voice name in the UI.
- Pause calls `cancel()`, so there's nothing to resume. Rename it Stop, or use `pause()` and `resume()`.
- "Speak / play selected" is misleading in untimed mode, which plays from the current position. Relabel the button per mode.
- Add a "play this sentence only" option (pause at `ranges[i].end`).
- Validate the timing JSON only after `loadedmetadata`, since `duration` can still be NaN. Show friendly messages for malformed files.
- Keep the audio file and timings per chapter for the session, and store audio in IndexedDB so it survives a reload.

### Imports and storage
- Check `file.size` before reading (about 1 MB for text and timings, a few MB for backups).
- Warn when pasted text is truncated at 20,000 characters, or add `maxlength`.
- Improve sentence splitting so it handles `;`, `:`, line breaks and abbreviations like *M. Tullius*, and let the user correct the splits.

### Accessibility and mobile
- `render()` rebuilds the page on every click, so focus is lost each time. Restore focus, or update only the parts that changed.
- The four file inputs are `display:none` inside a `<label>`, which keyboard users can't reach. Make them focusable.
- Add `lang="la"` on all Latin text, an `aria-live="polite"` region for feedback and glosses, and `aria-current` on the active tab.
- Every word is a tab stop (~40 per chapter). Use one tab stop per sentence, with arrow keys between words.
- Contrast fails WCAG AA: `.mini` 3.8:1, `.subtle` 3.8:1, footer 3.3:1, focus ring 2.6:1. Also raise the 10–12px text sizes.
- Replace the generic SVG `aria-label` with the chapter's context sentence.
- On phones (<620px) the gloss panel sits below the whole lesson. Show glosses in a popover or bottom sheet. Make the audio dock sticky.

---

## 3. Latin corrections (have a Latinist confirm)

| Ch | Problem | Change |
|---|---|---|
| 6 | *Cānis* is wrong everywhere: title, sentences, headword, question, note. *Cānis* comes from *cānus* (grey). | *canis* |
| 6 | *Ad quam canis currit?* gives away the answer, because Livia is the only woman among the options. | *Ad quem canis currit?* |
| 3, 4, 8 | *panis*, *panem* | *pānis*, *pānem* |
| 1 | *Hic est hortus* is glossed "Here is…", which would need *hīc*. | Translate it "This is a garden" and gloss *hic* as "this (masc.)" |
| 2 | Headwords *habitare* and *omnes* | *habitāre*, *omnēs* |
| 2 | *Tītus est frāter cuius?* | *Cuius frāter est Tītus?* |
| 7 | *ad fenestram spectābat* | *per fenestram spectābat* |
| 7 | The note omits *sonuit* (perfect) and *Nōlī timēre* (negative command) | Add one line on each |
| 8 | The note implies every future tense has *-b-*, but *feret* and *faciēmus* don't. | Explain the *-am/-ēs/-et/-ēmus* future of the 3rd and 4th conjugations |
| 1 | Question 2 uses Titus and Marcus before they're introduced | Use chapter 1 names only |

**Glossary gaps to fill:** *hominēs, mātrem, mātrī, patrem, patrī, Grātiās, agō, respondet, Nōlī, timēre, parāmus, rosās, sē, Tītō, Mārcum, Tītum, quam*. *Interrogat* (ch 5) is only defined in ch 8.

---

## 4. Teaching improvements

1. **Much more repetition.** Each new word should appear 8–10 times in its first chapter and keep recurring later.
2. **One new grammar idea per chapter.** Chapter 7 currently introduces the imperfect, the perfect and a negative command together, and chapter 8 adds two future formations. Spread these over 4–6 chapters.
3. **Contrast forms side by side in the story** (*Rosa pulchra est. Līvia rosam habet.*) so learners see the pattern before any note explains it.
4. **Make the pictures carry meaning.** Use Latin labels on objects and highlight what's being referred to (*hic est canis*).
5. **Grammar notes in simple Latin first** (*rosa → rosam: Līvia rosam videt*), with English as an optional extra.
6. **Questions that make the learner reread:** Latin true/false, "which picture matches?", put the sentences in order, fill in the ending (*ros__ habet*), and click the word that answers the question.
7. **A review story every 3–4 chapters** that uses only words already learned.
8. **Show what each chapter adds:** its new words and its one new grammar point.
9. **Latin-only hints before English.** The first click shows a simpler Latin rewording or a picture cue; English appears only on the second click.

**Start with:** rewriting chapters 6–8 as about 5 slower chapters that apply points 1–4. This becomes the template for every later chapter.

---

## 5. Course length and scope

The current course is about one week of reading. A basic understanding of Latin, meaning reading easy original prose and fables with occasional dictionary help, needs roughly:
- 800–1,200 known words. Use the DCC Latin Core List (997 lemmas, from the user's resources) as the target, and track coverage per chapter.
- All 5 declensions, all 4 conjugations, every indicative tense, the passive, participles, relative clauses and the basics of the subjunctive.
- Tens of thousands of words of easy, repetitive reading.

**Target:** about 35 chapters of 30–60 sentences each, built around the existing family (Mārcus, Flāvia, Līvia, Tītus). Add a review story every 3–4 chapters and finish with a bridge to real texts: adapted Aesop and Ritchie's *Fabulae Faciles* (both public domain in the US). The first deliverable should be a 35-chapter outline listing each chapter's story idea, one new grammar point, and its target lemmas from the core list. The user should approve it before any chapters are written.

---

## 6. Features and quality of life

Fast wins (about a day together):
- Glosses in a popover next to the tapped word.
- Listen-and-repeat mode: play a sentence, pause, then advance, with adjustable speed and gap.
- Daily goal and streak, dark mode, font-size setting, keyboard shortcuts (Space to play or pause, arrow keys to move between sentences), and an end-of-chapter summary.

Later:
- Flashcards that show each word inside the sentence it was saved from.
- Highlight words that are new in each chapter, and show "you know X% of this text" on imported readings.
- Install as an app and work offline (a PWA with a service worker and manifest).

---

## 7. Natural voices

Claude can't produce audio. The plan is to **generate the audio once, have someone check it, and ship it as recorded files** using the app's existing timed-audio mode, with browser speech kept only as a labelled fallback.

Options, best first:
1. **A human reader** (a Latin teacher or student). This is the most accurate and the only reliable way to get Classical pronunciation right. The current 67 sentences take under an hour to record.
2. **OpenAI text-to-speech.** It sounds natural and can be told to read slowly in restored Classical pronunciation. Latin isn't officially supported, so check the results.
3. **ElevenLabs.** Similar quality and caveats, with good control over voice consistency.

Methods:
- Send a **phonetic respelling** to the TTS service while keeping the real Latin on screen, for example *Cicero* → "Kee-keh-roh" and *vīlla* → "weel-la". Write a respelling function for restored Classical pronunciation: c and g always hard, v as w, ae as "eye", long vowels doubled, and so on.
- Use one consistent voice per character, for dialogue.
- Have a Latinist listen once, then regenerate any bad sentences.
- Run **aeneas** offline to produce `[{start,end}]` timing JSON per chapter. aeneas is AGPL, so use it as an offline tool only.
- Build a WaveSurfer authoring page where a person checks and adjusts the boundaries. Ship only timings someone has checked.
- The user supplies their own API key. Never commit keys.
- Check rights before using any Vox Classica or LibriVox audio.

---

## 8. Architecture and phased plan

Keep a static front end. Language processing runs in an offline Python pipeline that writes JSON consumed by the app.

1. **Fix and restructure (1–2 days).** Apply sections 2 and 3. Move the lessons into `lessons/chNN.json` using a schema that allows several accepted answers. Add Playwright tests: load every chapter, answer all questions, back up and restore (including malicious backups), and run on a phone-sized viewport.
2. **Real glossary (about 1 week).** Run LatinCy over the lessons to get each token's lemma and morphology. Take short glosses from the DCC core list and fall back to Whitaker's Words. Output `lexicon.json` keyed by sentence and token position, so homographs are resolved correctly. Flag unresolved tokens for a person to fill in.
3. **Controlled progression (ongoing).** Generate a per-chapter report of new lemmas and grammar features, warning above about 15 new lemmas or more than one new construction.
4. **FSRS (2–3 days).** Replace `rate()` with TS-FSRS (MIT licence) and store its card state in `S.vocab`, migrating existing cards as new.
5. **Verified audio (about 1 week).** Follow section 7. Store audio in IndexedDB.
6. **Imported texts (about 1 week).** Build-time import of Perseus TEI and Gutenberg EPUB, run through latin-macronizer (GPL, offline only) and phase 2, published as graded readers with their vocabulary coverage at each chapter.

### Licences (verify against each archive's own LICENSE file)
- MIT or BSD, safe to bundle with attribution: TS-FSRS, WaveSurfer.js, LatinCy.
- CC BY-SA, so derived data stays share-alike: Perseus texts and lexica.
- AGPL or GPL, offline tools only: aeneas, latin-macronizer.
- Public domain in the US: Gutenberg texts and LibriVox recordings.
- Possibly non-commercial: the Alpheios copy of Allen & Greenough. Prefer the Dickinson College edition.
- Unknown, so do not use until provenance is cleared: Vox Classica audio and the z-library Bewick ebook.

---

## 9. Definition of done for the first handback

- [ ] All P1 and P2 bugs fixed, each with a reproducing test.
- [ ] Section 3's Latin corrections applied, and glossary gaps filled.
- [ ] Lessons moved into JSON files, and the hardcoded counts removed.
- [ ] Accessibility fixes: focus handling, keyboard-reachable file inputs, `lang="la"`, live region, contrast.
- [ ] Popover glosses, listen-and-repeat mode and keyboard shortcuts.
- [ ] A 35-chapter outline for the user to approve.
- [ ] A test report listing commands, browsers, results, and the tests not run.

---

## 10. Illustration art direction

**Goal:** replace the flat placeholder SVG scenes with hand-drawn illustrations that carry meaning, in the tradition of illustrated natural-method Latin readers. Use pen-and-ink line drawings with a light watercolour wash, drawn simply enough that a learner can point at each object and name it in Latin.

**Copyright rule:** match the *general approach* only (simple ink line art, colour wash, labelled objects, Roman everyday life). Do **not** copy, trace, or use as image-to-image references any illustrations, characters, maps or page layouts from *Familia Romana* or any other textbook. Do not use "in the style of Familia Romana" or a named illustrator in prompts. All characters and compositions must be original to Tablinum.

### 10.1 Style guide (use for every image)
- **Line:** confident hand-inked outlines in warm dark brown (#3a2a1e), slightly uneven like a dip pen. Light hatching for shadow only; no heavy crosshatching.
- **Colour:** transparent watercolour wash on top of the line. Palette: terracotta, ochre, olive, sky blue, Roman red (#b5473a), warm stone and parchment ground. Use full colour where it carries meaning (*rosa rubra*, *sōl*, *aqua*) and soft colour elsewhere.
- **Background:** off-white paper (#faf3e5) with little or no background scenery. Objects that matter sit in clear space so they can be labelled.
- **Composition:** one clear action per image and three to six named objects at most. Show figures at mid-distance, full body, with readable gestures (pointing, giving, running).
- **Setting:** an accurate, everyday early-Imperial Roman world. Tunics and stolae, sandals, an atrium house with an impluvium, a market stall, an oil lamp, wax tablets and stylus. No fantasy, no anime, no photorealism, no 3D render look.
- **Format:** 1600×900 px (16:9) for chapter scenes; 800×800 px for single-object vocabulary pictures. Export as PNG or WebP with transparent or paper background, under 250 KB each.
- **No text in the image.** Latin labels are added by the app as clickable HTML overlays, so they can be glossed, hidden, and corrected without redrawing.

### 10.2 Character sheet (generate first, then reuse as reference)
Create one turnaround sheet per character (front, side, three-quarter) and pass it as a reference image for every later scene so the cast stays consistent.

| Character | Look |
|---|---|
| **Mārcus** (father, about 40) | Short dark hair, short beard, off-white tunic with a narrow red stripe, brown sandals |
| **Flāvia** (mother, about 35) | Dark hair in a low bun, long blue stola over a cream tunic, small bronze earrings |
| **Līvia** (daughter, about 9) | Long brown braid, ochre tunic, cheerful and curious |
| **Tītus** (son, about 11) | Short curly hair, green tunic, slightly mischievous |
| **Canis** (family dog) | Medium-sized, tan short-haired dog with a darker muzzle and a leather collar |
| **Puer** (neighbour boy, chapter 6) | Red-brown hair, plain grey tunic |

### 10.3 Prompt template
> Hand-drawn educational book illustration, confident dark-brown ink linework with light watercolour wash, off-white paper background, simple clear composition with generous empty space, ancient Roman everyday life in the early Empire. Scene: {SCENE}. Characters: {CHARACTERS, matching the reference sheets}. Clearly visible objects: {OBJECTS}. Gentle natural colours; {MEANINGFUL COLOUR} is vivid. No text, no letters, no labels, no borders. Not photorealistic, not 3D, not anime.

**Negative prompt** (if the tool supports one): text, letters, watermark, signature, modern clothing, glasses, phones, fantasy armour, blurry, cluttered background.

### 10.4 Shot list for the current eight chapters

| Ch | Scene | Objects to label (Latin) | Meaningful colour |
|---|---|---|---|
| 1 *In hortō* | Small girl sitting under a large tree in a walled garden | hortus, arbor, puella (Līvia) | green tree; the girl visibly small next to the tree |
| 2 *Familia* | Four family members in front of a Roman villa | vīlla, Mārcus, Flāvia, Līvia, Tītus | — |
| 3 *Dōnum* | Līvia hands a red rose to her mother; Tītus holds a book; Mārcus reads | rosa, liber, māter, pater | **red** rose |
| 4 *Cēna* | Family at a low table; bread, a water jug, cups | mēnsa, pānis, aqua, cibus | blue water |
| 5 *Forum* | A market stall with apples; Mārcus buying two, Līvia looking at three | forum, mercātor, māla | red and green apples, clearly countable |
| 6 *Canis* | A dog running down a street towards Līvia at a gate; a boy calling | via, canis, puer, porta | — |
| 7 *Tempestās* | Two panels: yesterday, rain and thunder with Tītus at the window; today, sunshine | pluvia, tonitrus, fenestra, sōl | grey storm against yellow sun |
| 8 *Crās* | The family packing roses and a book for a visit, with a road leading to a friend's house | rosae, liber, via, amīcus | red roses |

For each image, also record the **position of each labelled object** in `lessons/chNN.json` (`labels: [{word:"arbor", x:0.21, y:0.40}]`, as fractions of width and height). The app draws numbered markers there, and clicking one shows the Latin word with its gloss.

### 10.5 Tools and workflow
- Use any image generator that accepts reference images, for example SpriteCook, OpenAI image generation, Midjourney or Stable Diffusion with a fixed style seed. Keep the prompt, seed, model and date for each image in `art/manifest.json`.
- Generate the character sheets, choose and lock them, then generate scenes with those sheets as references.
- **Human check for every image.** No extra limbs or fingers and no garbled text. Count matches the Latin (*duo māla* shows exactly two). Clothing and objects are plausibly Roman. Colours match the story.
- Keep the old SVG scenes as a fallback when an image fails to load.
- Check the generator's licence terms allow commercial use and redistribution before shipping the art.

---

## 11. Further learning-experience improvements

These are in addition to sections 4 and 6, roughly in priority order.

1. **Clickable picture labels** (see 10.4). Tap an object in the picture to hear and see its Latin name. This links words to images without English, which is the heart of the natural method.
2. **Latin-only margin notes.** Explain new words in the margin with a tiny picture, a synonym, an opposite (*magnus ↔ parvus*) or an equation (*pater + māter = parentēs*). English appears only as the last resort. Write these instead of the current "previous sentence" step-1 hint.
3. **Reread loop.** After the questions, offer "read it again, now with audio" and track how many times each chapter has been read. Bring back any chapter rated "Need support" after 1, 3 and 7 days. Rereading is where most acquisition happens.
4. **A short drill after each chapter.** Five to ten quick form-focused items on the chapter's one grammar point (fill in the ending, choose the right form). Keep them in Latin and auto-check them.
5. **Listening comprehension.** Play a sentence without showing the text, then ask a Latin question or have the learner pick the matching picture. Add dictation (type what you hear) later.
6. **Read-aloud practice.** Record yourself reading a sentence in the browser and play it back next to the reference audio for comparison. No automatic scoring is needed.
7. **Word-in-context flashcards.** Review cards show the saved word inside its original sentence and picture. The learner rates recall, and FSRS schedules the card.
8. **"New in this chapter" panel.** List the new words (with mini pictures) and the one new grammar point, and highlight new words lightly on first reading.
9. **Gentle motivation.** A daily reading goal in sentences, a streak, and a "words you can now read" count measured against the 1,000-word core list. Avoid points, leaderboards and anything that rewards guessing.
10. **Graded extra readings.** Every three to four chapters, an optional short story that uses only known words (for example the family dog's adventures). These give lots of easy reading cheaply.
11. **Teacher or self-check view.** A printable page per chapter with the story, the picture with numbered labels, and the questions without answers. Use it for offline study or a classroom.

**Definition of done for this phase:** character sheets approved; eight new chapter illustrations with label coordinates, each passing the human check; step-1 clues rewritten as Latin-only margin notes; items 1–4 above implemented and tested in a real browser.

---

## 12. Decision: course length and vocabulary load (4 Nov 2026)

The user chose to **keep the limit of about 15 new words per chapter and expand the course to about 50 chapters**. This replaces the 35-chapter target in section 5.

What that means:
- About 50 chapters, with a review chapter roughly every 4. That gives about 38 teaching chapters × 15 words, or roughly **550–600 core words** inside the course.
- To reach the 800–1,200-word goal, add the graded extra readings (section 11, item 10) and an end-of-course bridge to adapted Aesop and *Fabulae Faciles*. Do this rather than raising the per-chapter limit.
- Use the extra chapters for the grammar gaps found in Claude's outline review: the ablative, 1st and 2nd person verbs, plurals and adjective agreement, the infinitive, pronouns, indirect statement, the ablative absolute, deponents and comparatives. Keep chapters 3 and 4 swapped (accusative before dative).
- Fix the seed-list errors first: *ēdō* → *edō*, *bībō* → *bibō*, pick one spelling for *magnus*, and re-check the core-list matching (it missed *fīlius*).
- Next deliverable: a revised outline of about 50 chapters, in the same table format, for the user to approve.

---

## 13. 130-chapter curriculum: Claude review (4 Nov 2026)

The user has expanded the target to **130 chapters in three books (50/40/40), with at least 1,500 words by chapter 90 and about 3,000 by chapter 130**, keeping the 15-word ceiling for Book I. This supersedes section 12's 50-chapter scope.

The full review is in **`CLAUDE_REVIEW_130.md`**. The verdict is **conditional: revise the outline before writing any chapters.** Work through its section 7 in order, one review-and-patch cycle per item:

1. **Outline v2.** Fix the grammar dependencies: sequence of tenses before ch 67–68, the pluperfect subjunctive for ch 79, ablative uses before the ablative absolute, and *sequor* out of ch 40. Add the missing *cum* + subjunctive, *nē* purpose, 3rd-declension adjectives and imperfect/future passive. Correct the title errors (ch 93 *Agerī dēspōnsī* is nonsense; ch 96 → *In thermīs*; plus macrons). Lengthen chapters 1–10 to 250–450 words so the 8–10-encounter rule can be met.
2. **Lexeme registry.** Lemmatized lesson files become the single source of truth, and the ledger is generated from them. Words beyond the DCC list come from LatinCy, Whitaker, Lewis & Short and Perseus corpus frequencies, each with a recorded source and licence.
3. **Architecture.** Give chapters stable slug IDs and migrate saved progress (old ch 3 and 4 swap). Compile lesson JSON into a script bundle so the app still opens from disk.
4. **Pilot chapters 6–8 end to end** (text, drill, art, human audio, Latinist sign-off), and measure the hours each takes.
5. Concrete speaking and reading checkpoint tasks for ch 25 and 50.

Do not fill the verified-introductions ledger with placeholders, and do not weaken the `--require-introduced-*` gates.