# LATIN X — Field research: Classical Latin speech with Runway and other TTS systems

**Research date:** 7 November 2026 (Australia/Sydney). **Audience:** LATIN X owner, GPT and Claude. **Scope:** identifiable public firsthand experiments, 2025–2026 methods, and evidence-based next actions. **Status:** research / no new owner approvals. No claims that any public model is a validated Latin teaching narrator.

## Executive conclusion

I did not locate a verifiable public case study demonstrating **repeatably accurate restored Classical Latin narration generated specifically through Runway's text-to-speech interface**. This is an evidence-limit statement, not proof such work does not exist. Runway's published supported speech languages do not include Latin, though it exposes Eleven-based general speech models; `la` was rejected during our earlier LATIN X audition. A Runway-specific pronunciation dictionary or Latin accent toggle is not evidenced in the currently connected Runway `generate_speech` control surface.

**Recommendation: do not mass-regenerate Miriam clips.** Compare the three owner-rejected problem items against a genuine Latin-trained TTS model before spending further Runway credits. For Runway, use carefully reviewed voice-specific aliases/IPA only on the failing word, avoid syllable hyphens that disrupt rhythm, keep the displayed Latin immutable, and solicit owner/Latinist listening review in sentences as well as isolation. Correct Latin is an educational requirement, not simply a pleasant voice.

## Verified firsthand and academic experiments

### 1 — Francesca Fini, *Directing a Synthetic Voice: Latin Phonetics, Voice Design, and Theatrical Text-to-Speech in ElevenLabs* (May 2026)

Source: https://www.francescafini.com/post/directing-a-synthetic-voice-latin-phonetics-voice-design-and-theatrical-text-to-speech-in-elevenl

- She first designed a suitable adult theatrical voice and *then* adapted Latin text to that voice's phonetic habits. The same Latin text needed different inputs for Italian vs English voice identities.
- Specific hard-consonant interventions included replacing the apparent Italian soft-c in *Luci* by `Luki`, and *renasci* by `renaski`; she also separated `gn` to avoid Italian palatalization.
- She used accent marks, line breaks, and audio performance tags to help phrasing.
- Scope limit: a deliberately stylized dramatic Latin performance; she does not report a phoneme-by-phoneme teaching corpus reviewed by a classicist. Her stage tags are not appropriate for LATIN X's neutral beginner reading without testing.

**Transfer:** build a **per-voice** pronunciation configuration; do not expect one English-looking alias to work with all voices.

### 2 — Michele Ciletti, *Veras Audire et Reddere Voces* (CLiC-it 2025; peer-reviewed workshop paper)

Source: https://aclanthology.org/2025.clicit-1.27.pdf

- Published a curated, specialist-reviewed corpus of approximately 24 minutes / 216 lines of Latin poetry generated with `gpt-4o-mini-tts` after preparing pronunciation-oriented script forms. Ten candidate versions were created per verse and Latin phonology experts screened them.
- Preprocessing protected classical consonants/diphthongs (`qu` → `kw`, hard `c` → `k` in relevant contexts, `ae` → `ai`, `oe` → `oi`, etc.), stress and metre.
- **Syllable-separating hyphens were tried and discontinued** because they offered no audible advantage. This accords with the unnatural timing flagged in our own `LEE-wih-ah` auditions.
- The paper notes stress, vowel quantity, accent drift, and consonant substitutions cannot be made reliably perfect by a prompt alone.
- Crucial limitation: it concerns **Latin verse** with obligatory elision and metrical ictus. LATIN X's beginner guide explicitly prefers **prose with every word spoken, no elision**; do not copy poetic elisions or add a false metre to our sentences.

**Transfer:** one original sentence per clip; preserve phonetic expectations per word; export multiple *review candidates only when needed*, and require both quality and phonological checks. Use genuine word/clip timings.

### 3 — `coolcoder613/omnivoice-latin-lora-1` and Latin learner discussion (October 2026)

Sources: https://huggingface.co/coolcoder613/omnivoice-latin-lora-1 ; https://huggingface.co/spaces/coolcoder613/latin-tts-ov ; https://www.reddit.com/r/latin/comments/1xbjai0/recordings_of_individual_words_in_classical/

- This **Latin-specific** OmniVoice LoRA reports training on approximately **22 hours of macronized Latin** spoken with restored Classical pronunciation. It includes a publicly accessible demo and CLI instructions using language code `la`.
- An October 22 user reported useful speech output for their child's Latin practice, but explicitly did not certify pronunciation accuracy. They reported very slow rendering on inexpensive rented hardware (roughly minutes per word). This is **anecdotal**, not a general speed benchmark.
- Model card states that the base OmniVoice checkpoint uses a **CC-BY-NC** licence. Check the complete chain of model/data/voice licences before redistribution or any commercial use. Personal, noncommercial evaluation is the most conservative initial use.
- Some training recordings may use different elision/quantity conventions from LATIN X. We need to evaluate the same short prose lines, not presume instant correctness.

**Transfer:** run a controlled same-sentence comparison against Runway's Miriam. A model actually trained on Latin may be a better long-term source of lesson audio than endless English-influenced text spellings.

### 4 — LingQ Latin forum, May 2026

Source: https://forum.lingq.com/t/latin-tts-voices/2621321

- A user thought ElevenLabs had dedicated "Latin" voices, but investigated and corrected this: samples on a `voice-library/latin` page were **Latin-American Spanish**, not the Latin language.

**Transfer:** never infer Classical Latin support from a marketing label containing "Latin" or a romance-language accent.

### 5 — ElevenLabs user experimentation, August 2026

Source: https://www.reddit.com/r/ElevenLabs/comments/1vjasax/pronunciation_correction_layer_for_elevenlabs/

- A developer built a syllable/stress correction layer and preferred user-tested phonetic **alias entries** to raw phoneme markup for consistency in their experience; another participant reported similar success with "spell it like it sounds".
- They specifically warned that the *isolated word* and the *same word embedded in a sentence* may sound different.

**Transfer:** owner acceptance of `vīlla` as a standalone test does **not** automatically approve all future sentences containing *vīlla*. The same applies to *Līvia*, *aqua*, and *quoque*.

### 6 — Other Latin learners: alignment, human recordings, and early TTS limitations

Sources: https://www.reddit.com/r/latin/comments/17t2w27 ; https://news.ycombinator.com/item?id=49686380 ; https://www.reddit.com/r/latin/comments/1lfyln1

- 2023 Latin learners reported poor-sounding Latin TTS and mixed experiences with Aeneas, and described splitting existing human speech into captioned clips rather than synthesizing poor Latin.
- A 2026 creator of *Fables of Orbilius* uses **human narration and Latin-adapted wav2vec2 forced alignment** for text highlighting; mixed Latin/English can weaken accuracy. This is useful for our genuinely timed sentence highlighting.

**Transfer:** if no synthetic model meets Classical Latin teaching quality, record or license skilled human reading, slice actual audio at sentence boundaries, and keep real durations. No fake word timings.

## Current model / platform facts

- Runway documents generative speech languages with no Latin entry: https://help.runwayml.com/hc/en-us/articles/33505227741587-Supported-Languages-in-Generative-Audio
- Runway TTS documentation exposes model-specific tags and pacing; `eleven_v3` is expressive, but performance tags can create extraneous speech in a pedagogical reading: https://help.runwayml.com/hc/en-us/articles/23859696734611-Generating-speech-from-text
- ElevenLabs confirms `eleven_v3` / `eleven_v4` support inline IPA or pronunciation dictionaries (model-specific), but some glyphs or whole-sentence IPA still yield errors and pronunciation varies by voice/context: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices ; https://elevenlabs.io/blog/pronunciation-dictionary-guide
- `eleven_v3` and v4 **do not support SSML break tags**; use punctuation/phrasing, but do not ask the model to read formatting instructions: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses
- The connected Runway tool's `generate_speech` options for our audition were **voice, model, speed, languageCode** and exact text. It did not expose custom pronunciation dictionaries or normalization flags. Runway's developer API/SDK may expose more controls such as text normalization, but **Runway API credits are separate from web-app subscription credits**: https://help.runwayml.com/hc/en-us/articles/50683115755155-Runway-API-FAQs . Do not imply current Runway credits can pay for a new direct API pathway.

## Owner approval reconciliation: authoritative, unchanged

The owner has supplied three rounds of feedback. Retain their original files unedited:
- `docs/audio/owner-original-review-2026-11-07.json`: Miriam v1 **12 accept / 5 reject**. Every Eleanor v1 clip **17 reject**. `selected_voice: null` (not signed off globally).
- `docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json`: *vīlla v2* **accept**, Līvia s007 v2 **null** with negative note, Līvia s009/aqua/quoque v2 **reject**.
- `docs/audio/owner-miriam-alias-v3-review-2026-11-07.json`: *aqua v3* **accept**; Līvia s007 and s009 v3 **reject** (both pronunciation **and timing/vowel-length**), *quoque v3* **reject**.

**Do not equate `null` with `reject`, do not copy a clip approval between versions, and do not treat a word-isolation approval as full-context approval.** No new final narrator selection, phonological/Latinist approval, or main-reader integration is authorized.

## Best next experiment (no mass generation)

1. **Stop generating variations** before the owner listens to the three newest Miriam alias v4-iteration files (`docs/audio/miriam-alias-v4-2026-11-07.json`). Those v4 labels refer to **clip version**, not Eleven v4 model; they used `eleven_v3`.
2. **Benchmark Latin model versus Runway on exactly three unchanged visible Latin inputs:** `Līvia arborem videt.`, `Līvia laeta est.`, `quoque`. Keep display text identical. For the model with genuine Latin language support, use macronized orthography and appropriate language `la`; for Runway, send only one reviewed alternate phonetic script per failed word. Obtain owner's approval for the preferred audio. Obtain Latinist verification for high-stakes pronunciation accuracy.
3. **Do not use hyphenated syllable-by-syllable phonetic prompts** for whole words in production. If the pronunciation is unacceptable, test alternative *model* or native Latin reader rather than iterating endlessly on the English-voice spelling.
4. **Validate clips**: exact words, no read-out punctuation/IPA/slashes; natural stress and short/long vowels; hard c and g; w-like consonantal v; `qu`/`kʷ`; no glitches, severe clipping, >0.3 s end silence. Owner/Latinist judgement is the arbiter. Maintain clip ID, source text, exact speech_input, voice, model, audio hash, duration, correction notes and approval tier.
5. **Assemble only after approval**: accepted MP3 by sentence and actual duration, chapter highlighting from real clip boundaries; browser voice remains explicit fallback.
6. **Special caution with `quoque`**: the owner's "Kwo Kee" feedback contrasts with the draft house guide's reconstructed `/ˈkʷɔ.kʷɛ/`. Do not silently change the pronunciation standard to fit the owner's English respelling; ask a qualified Latinist to review the intended Classical Latin realization and compare the sound, rather than spelling alone.

## References and limitations

The article by Fini and the r/Latin / r/ElevenLabs threads are first-person/individual reports; the Ciletti paper is scholarly research on poetry and has stronger method evidence, not a direct Runway benchmark. The Latin LoRA model's pronunciation, speed, rights and operational requirements need independent QA before incorporation. This is a research document and **does not claim that newly generated trial MP3 bytes were packaged**; the private Runway-signed retrieval links remain owner-only in `audio-audition/`, outside the Git repo.

## Further comparison candidates and engineering controls

- `Ken-Z/latin_SpeechT5` (https://huggingface.co/Ken-Z/latin_SpeechT5) is another purpose-trained Latin speech model. Its model card reports **67 hours** of Latin audio training and CC-BY-4.0 licensing. It is an alternative benchmark, **not evidence of professional recording quality**; the sample quality, specific accent, and full distribution rights need independent checking before LATIN X adoption.
- The current Runway developer API reference (https://docs.dev.runwayml.com/api/) lists `eleven_v4` among TTS API models, which may provide stronger IPA handling than the **connected Runway chat generator** used here. The chat generator schema presently exposes only `eleven_v3` and `eleven_multilingual_v2`; the developer API requires separately purchased API credits. Do **not** spend money setting that up until a small side-by-side pronunciation check supports the change.
- Runway's published SDK includes text normalization controls for certain speech model request shapes (`applyTextNormalization`: `auto|on|off`) and other controls such as stability. Potential application: avoid punctuation, digits, abbreviations or macrons being spelled out unexpectedly. **Availability and effectiveness must be checked in the exact model and API**, not guessed from the generic SDK; our connected generator doesn't expose them (https://github.com/runwayml/sdk-python/blob/main/src/runwayml/types/text_to_speech_create_params.py).
- For pure TTS output, prefer display text and speech input as two distinct fields, **not markup interspersed with Latin**. Never place an instruction such as "say the word" or a prompt tag not verified to be silent in the speech text. For one sentence, a normal final full stop is sufficient; do not use SSML breaks on Eleven v3/v4.
