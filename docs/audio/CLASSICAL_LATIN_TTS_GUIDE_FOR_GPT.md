# Getting Runway to speak restored Classical Latin: guide for GPT

**From:** Claude, 2026-11-07. **For:** the first paid Runway audition (the owner's plan is now upgraded).
**Status:** this guide and the IPA in `latin-ipa-pilot-lexicon.json` are Claude's drafts. They have not been checked by a Latinist. The owner judges every clip by ear (owner tier).

Read `RUNWAY_LATIN_PRONUNCIATION_RESEARCH.md` first. This guide turns that research into exact steps.

---

## 1. The goal in one paragraph

A calm, clear, natural voice reading each Latin sentence of the lesson in **restored Classical pronunciation** (the pronunciation of educated Romans about the 1st century AD, as reconstructed by W. S. Allen, *Vox Latina*). It must not sound like Church Latin (Italian-style), and it must not sound like English. Every sentence is one MP3 clip, with nothing added or left out.

## 2. The pronunciation rules the voice must follow

Use these to judge every clip and to write IPA. They are the house convention for LATIN X.

### Consonants
| Letter | Say | Never | Test words |
|---|---|---|---|
| c | always **k** | "ch" or "s" before e/i | cēna /ˈkeː.na/, cibus /ˈkɪ.bʊs/, Mārcus |
| g | always hard **g** | "j" before e/i | Gāius /ˈɡaː.jʊs/, magna |
| v (consonant) | **w** | English v | vīlla /ˈwiːl.la/, Līvia /ˈliː.wɪ.a/, videt /ˈwɪ.dɛt/ |
| i (consonant, before a vowel at word start or between vowels) | **y** /j/ | "j" | Gāius, iam /jam/ |
| qu | **kw** /kʷ/ | plain k | quō /kʷoː/, aqua /ˈa.kʷa/, quoque /ˈkʷɔ.kʷɛ/ |
| gn | **ngn** /ŋn/ | "ny" | magna /ˈmaŋ.na/ |
| s | always voiceless **s** | z sound between vowels | rosa /ˈrɔ.sa/ |
| r | tapped or lightly trilled | English r | arbor /ˈar.bɔr/ |
| t | always **t** | "ts" or "sh" before i | (any -tiō word later) |
| h | light h | silent | hortus /ˈhɔr.tʊs/ |
| double consonants | **held longer** | single | vīlla, puella /pʊˈɛl.la/ |
| ph, th, ch | p, t, k with a puff of air | f, English th | (Greek words later) |

### Vowels
- A macron (ā ē ī ō ū) means the vowel is **long in time**: hold it about twice as long. It is **not** a stress mark.
- Long vowels are tense: ā /aː/, ē /eː/, ī /iː/, ō /oː/, ū /uː/.
- Short vowels are lax: a /a/, e /ɛ/, i /ɪ/, o /ɔ/, u /ʊ/.
- Diphthongs: ae /ae̯/ (like "eye"), au /au̯/ (like "ow"), oe /oe̯/ (like "oy"). laeta /ˈlae̯.ta/, caelum /ˈkae̯.lʊm/.

### Stress (where the voice leans)
1. Two syllables: stress the **first**. (hortus → HOR-tus)
2. Three or more: stress the **second-to-last** if it is heavy (long vowel, diphthong, or vowel followed by two consonants). Otherwise stress the **third-to-last**.
   - puella → pu-EL-la (el + l = heavy)
   - Līvia → LĪ-wi-a (wi is light)
   - arborem → AR-bo-rem (bo is light)
   - pecūnia → pe-KŪ-ni-a (nĭ is light, so third-to-last kū)

### Joining words (house convention for a beginner reader)
- **No elision.** Say every word fully, even when one ends in a vowel or -m and the next starts with a vowel. ("Līvia est" = LĪ-wi-a EST.)
- **Final -m is said lightly** but is audible.
- **"Hic est"**: classical *hic* before a vowel was said with a doubled c: "hik-kest". Accept "hik est"; reject "hich" or "hiss".
- A small natural gap between words; a clear pause at the full stop.

## 3. How to drive Runway

Check the current Runway text-to-speech schema yourself before starting: Claude could not reach Runway's docs from its sandbox. Use whatever the owner's upgraded account actually exposes.

### Request rules
- **Text:** exactly one sentence, the `display_text` from `pilot_example_output.json` (run `node docs/audio/prepare_latin_pilot.cjs`). Keep macrons; they help some models with vowel length.
- **Never** put instructions inside the text ("Read in Latin:", "Classical pronunciation:"). They will be spoken aloud.
- **No SSML `<break>` tags** for eleven_v3 or v4. Punctuation alone is enough for one sentence.
- **Language code:** `la` is not accepted. Leave it unset (auto) first. If the voice then sounds English, try one run with `it` only as a test: Italian helps vowels but tends to soften c/g before e/i, so listen hard for that and reject if it happens.
- **Speed:** start at 0.9. Try 0.85 if words blur.
- **Model:** the best available in this order: `eleven_v4` (if exposed: inline IPA support per ElevenLabs), then `eleven_v3`, then `eleven_multilingual_v2`.

### Getting a specific word right (only when a word fails)
Do these in order, and stop at the first that works. Change **one word at a time**, and record what you did.
1. **Inline IPA** (v4, possibly v3): replace only the failing word with its IPA from `latin-ipa-pilot-lexicon.json`, between slashes, in the *speech input only*. Example: `Arbor /ˈmaŋ.na/ est.` Do not change `display_text`.
2. **Pronunciation dictionary** (if the API offers PLS dictionaries or aliases): add a phoneme rule for that word with the same IPA.
3. **Alias respelling, last resort**, for one word only, to force a sound the model keeps missing. Example: `vīlla` → `weella` in the speech input. Never respell a whole sentence into English spelling.

### Voices
- Pick **two** calm, clear adult voices with a neutral (not strongly English or American) accent. A mature, warm narrator suits the reader.
- Use the **same voice and settings** for every clip in a chapter once chosen.

## 4. The audition (spend little; do it once, properly)
1. Sentences: the 9 legacy chapter 1 sentences (`legacy-ch01-s001`…`s009`), plus these 8 test words as one short line each: *cēna, Gāius, vīlla, magna, aqua, quoque, pecūnia, laeta*.
2. For each of the 2 voices: generate all 9 sentences plain (no IPA). Total about 18 clips plus 16 word clips.
3. Listen (the owner listens; see step 6). For any word that fails, make **one** IPA retry of that sentence only.
4. Then stop and hand over. Do not generate whole chapters until the owner picks a voice.

## 5. Reject a clip if any of these happen
- c or g softened before e/i; v said as English v; gn said as "ny"; s said as z.
- Long and short vowels sound the same throughout, or the stress is on the wrong syllable (check against the IPA).
- Any added or missing word, English words, the slashes or IPA symbols read aloud, punctuation names spoken ("period", "comma").
- Breaths, clicks, hiss, metallic glitches, clipping, sudden volume or speed changes, more than 0.3 s of silence at either end.

## 6. What to hand back
- Every clip as MP3, named `<voice-short-name>__<sentence_id>__v<n>.mp3` (e.g. `voiceA__legacy-ch01-s004__v1.mp3`).
- `docs/audio/audition-2026-11.json`: one row per clip with sentence_id, display_text, speech_input (exactly what was sent), model, voice name and id, speed, language code, Runway task id, date, duration, SHA-256, and your own notes.
- `Audio Audition.html`: an **offline** page (classic script, file://, no fetch). For each clip, show the Latin text and the IPA, add a play button and the checklist in section 5 as checkboxes, plus "Accept / Reject" and a notes box. Add an "Export my review" button that downloads a JSON. The owner uses this to judge by ear; their export is the only approval.
- Do **not** wire any clip into the reader yet. Do not change lessons, art, approvals or saved-progress code.
- Put the MP3s in the owner ZIP under `audio-audition/`, outside Git (they are review material, like the source PNGs). Commit only the JSON, the HTML page and any code.

## 7. After the owner picks a voice (later task, not now)
Generate per-sentence clips for signed chapters only, with real measured durations, and connect them to the reader's existing timed-audio path (sentence highlighting from real clip start and end). Browser speech stays as the labelled fallback.
