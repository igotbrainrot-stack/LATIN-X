# Owner requirements: background music, click sounds and coloured sketch art

**Added:** 2026-11-05, at the owner's request (Claude wrote it up). These rules are binding. They extend Phase 7 (audio) and Phase 8 (illustrations) in `GPT_HANDOVER_NEXT_PHASES.md` §6. Every existing rule still applies: offline, `file://`, no `fetch()`, no ES modules, Windows-first, no copyrighted material, no merging to main.

---

## A. Background music: calm music inspired by ancient Greece and Rome

### Historical accuracy (please read this first)
The owner asked for "lute". The **lute is medieval and did not exist in Rome**. The historically accurate plucked strings are the **lyra/chelys** (lyre) and the **kithara**, a larger concert lyre. A long-necked lute, the **pandoura**, existed but was rare. Use these instead, because they give the owner the calm, plucked sound they want while staying accurate:
- **Main instrument:** lyre or kithara (plucked, warm, slow).
- **Optional, quiet:** a soft drone, a breathy **aulos** or **syrinx** (panpipes) line, and a very soft **tympanum** (frame drum) pulse. Never use modern instruments (guitar, piano, strings pad).
- **Melodies.** Either:
  1. arrange **surviving ancient melodies, which are public domain**: the *Seikilos epitaph* (1st c. AD), *Mesomedes' Hymn to the Sun* and *Hymn to Nemesis* (2nd c. AD), and the *Delphic hymns* (fragments). Cite the source of each melody in `curriculum/music.json`, and **never copy a modern recording or a modern published arrangement**; or
  2. write original slow pieces in Greek modes (Dorian, Phrygian, Lydian tetrachords).
- Label the result honestly in the app's credits: "music inspired by ancient Greek and Roman sources; reconstruction is uncertain".

### How to build it (recommended: no audio files needed)
- **Synthesize the lyre in the browser with the Web Audio API**, using Karplus–Strong plucked-string synthesis plus a gentle reverb, playing note sequences stored in a classic script (`content/music.js`). This works on `file://`, needs no downloads or licences, and adds almost nothing to the ZIP. Put the code in `app/60-audio-ambience.js`.
- If GPT instead ships recorded audio files, they must be **CC0 or created for this project**. Record their provenance in `curriculum/music.json`, play them through `<audio src="assets/music/...">` (never through `fetch`), keep the total under 15 MB, and loop them seamlessly.
- Give the music several pieces of 2–4 minutes each, played in shuffled order with crossfades, so the same loop does not grate.

### Behaviour
- **Browsers block autoplay.** Start the music on the learner's **first click or keypress**, never before. Never show an error when it is blocked.
- **Default volume is low (about 20%).** Add a header button (♪ on/off) and a volume slider, both reachable by keyboard and labelled for screen readers.
- **Duck the music** (fade to about 10%) whenever Latin narration, a listening exercise, browser speech or a speaking recording is playing, then fade it back. **Pause it completely while the microphone is recording.**
- Save the settings in **v5 state**, `ui.audio = {music:true, musicVolume:0.2, sfx:true, sfxVolume:0.4}`. This is an additive field and must not trigger a re-migration. Include it in backups.
- Pause the music when the tab is hidden (`visibilitychange`) and resume it when the tab is visible again.
- Never play it on the Vocabulary Review owner page.

## B. Sound effects on button clicks

- Use short, soft, **synthesized** sounds (Web Audio, no files), in the same lyre-and-wood character as the music:
  - **ordinary buttons and tabs:** a very soft wooden tick or a muted pluck, under 80 ms;
  - **correct answer:** two rising lyre notes;
  - **wrong answer:** one low, soft note (gentle, never a buzzer);
  - **chapter finished:** a short three-note phrase.
- Use a separate **sound effects on/off** toggle and volume, stored in `ui.audio`.
- Do not play sounds on hover, on typing in text fields, or more than once per 60 ms. Respect the mute toggle immediately.
- Click sounds must never delay the action or block the UI. Create the AudioContext once, lazily, on the first gesture.

### Tests (Phase 7)
- A Node test checks that the audio state migrates and persists, with defaults applied when the field is missing.
- A browser test checks that nothing plays before a gesture; that the toggles work and persist after a reload; that the music ducks during narration; that there are no network requests; and that everything works on Windows `file://`.

---

## C. Illustrations: coloured sketches, not stick figures or simple shapes

The owner wants **colour sketch-style illustrations**: pen-and-ink line work with watercolour or coloured-pencil washes, like an artist's sketchbook. The current simple SVG shapes and stick figures stay only as a fallback.

### Style guide (one consistent look across the course)
- Loose but confident ink lines; soft watercolour colour; warm parchment-white background; light hatching for shadow. Warm earth palette: terracotta, ochre, olive and faded blue.
- **No text inside images.** Labels are added by the app, so that Latin margins and `pic` exercise regions stay accurate.
- Do not imitate a named living artist, and **never copy or trace Familia Romana's illustrations** or any other textbook art.
- **Keep the characters consistent.** Make one character sheet first, approve it, then reuse it as the reference for every scene:
  - **Mārcus** (father, about 40, short beard, toga only for formal scenes, otherwise a tunic);
  - **Flāvia** (mother, stola and palla, hair up);
  - **Līvia** (girl, about 9, tunic, hair braided);
  - **Tītus** (boy, about 7, tunic, a **bulla** amulet at his neck);
  - **Gāius** (family friend), his son, and the **dog**.
- **Historical accuracy (Rome, 1st century AD):**
  - a villa with a peristyle garden, tegulae roof tiles, and an atrium with an impluvium;
  - Roman round bread scored into 8 segments, clay pōcula and a low mēnsa;
  - forum stalls with awnings, coins (as/sestertius) and baskets of apples and eggs;
  - streets paved with polygonal stones, with stepping stones;
  - no glass windowpanes in a modest house: use shutters or small openings;
  - no anachronisms such as forks, potatoes or tomatoes.

### Required pilot scenes (Book I ch 1–8; regions = clickable `pic` areas)
| Ch | Scene | Must show (region IDs) |
|---:|---|---|
| 1 | Garden, with Tītus hidden up the big tree | `arbor-magna`, `arbor-parva`, `rosa`, `vīlla`, `Līvia`, `Tītus` |
| 2 | Family in front of the villa, plus a family-tree panel | `Mārcus`, `Flāvia`, `Līvia`, `Tītus`, `vīlla` |
| 3 | Supper table; Tītus taking the bread | `mēnsa`, `pānis`, `pōculum`, `liber`, `cibus` |
| 4 | Gift scene with arrows from giver to receiver (arrows drawn by the app) | `rosa-rubra`, `liber`, `pōculum-rubrum`, `Gāius` |
| 5 | Evening in the villa, recalling the day | a reuse of earlier elements |
| 6 | Forum stall | `mercātor`, `māla`, `ōva`, `pecūnia`, with 1, 2 and 3 apples countable |
| 7 | Street, gate and running dog | `via`, `porta`, `canis`, `puer`, `Līvia` |
| 8 | Storm from two windows, then sun over the garden (2 images) | `ventus`, `pluvia`, `fenestra`, `sōl`, `arbor` |

### How to make and ship them
- GPT generates the images with its image tool. **Every image is a draft until the owner approves it.** Record the tool, the full prompt, the date, the generation settings and the licence status in `curriculum/illustrations.json`.
- Store them in `assets/art/b01/` as **WebP, about 1600 px wide, under 250 KB each**, plus a 600 px thumbnail. Load them with `<img src>`, which works on `file://`. Keep the existing SVG as the fallback when an image is missing.
- Give every image **Latin-first alt text** (`Līvia in hortō stat; Tītus in arbore est.`) with English below it.
- Store `pic` exercise regions as percentage polygons in `curriculum/illustrations.json`, not baked into the image.
- **Check every generated image** for:
  - wrong details: extra fingers, garbled text, modern objects, glass windows;
  - inconsistent characters between scenes;
  - legibility at 600 px.
  Regenerate any image that fails.
- Optionally (owner choice, later): redraw the 8 legacy chapter scenes in the same style.

### Tests (Phase 8)
`scripts/check-illustrations.cjs` must fail when:
- a scene referenced by a chapter has no image or fallback;
- an image is over the size limit;
- an image's alt text is missing;
- an image has no provenance record;
- a `pic` region refers to a missing region ID.

---

## Order
1. Finish the review fixes for Phase 5.
2. Phase 6 (review deck) as planned.
3. **Phase 7** now includes sections A and B. **Phase 8** now includes section C.
4. Phases 7 and 8 can run in parallel. If the owner wants, the click sounds and the music can be built first as a small Phase 7a, because they do not depend on the deck.
