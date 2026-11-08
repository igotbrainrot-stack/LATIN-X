# LATIN X — Research: natural, teachable Latin speech through Runway

**Research completed:** 2026-11-07 (Sydney)
**Purpose:** Future AI-generated natural voice pilot, not a completed/approved recording.
**Baseline:** `LATIN_X_MORE_BLENDED_GLOW_COMPLETE_CLAUDE_20261107.zip`; research-only addendum. No audio was generated, no course material or approved art modified, no new pronunciation was owner/Latinist-approved.
**Language target:** *restored/reconstructed Classical Latin* (not modern Italianate/Ecclesiastical Latin), unless owner explicitly requests a second accent. This is a pedagogical convention, not a claim to exact ancient phonetics.

## 1. Findings and confidence

1. Latin (`la`) is NOT among officially supported speech languages listed for ElevenLabs Multilingual v2, Eleven v3 or Eleven v4 as of this research. The connected Runway tool rejected `languageCode: 'la'` for Multilingual v2. An expressive v3 attempt was separately blocked by the connected Free plan. **DO NOT claim native/verified Latin support.** Latin pronunciation must be evaluated acoustically with Latin expertise.
2. Runway's publicly documented API lists `eleven_v4`, `eleven_v3`, `eleven_multilingual_v2` and `seed_audio` for text-to-speech. At the time of the tool check, the **ChatGPT Runway `generate_speech` connector only accepted `eleven_v3` / `eleven_multilingual_v2`**; its schema exposed `text`, `voice`, `model`, `speed` and `languageCode`, **not** dictionary locators, forced-alignment or Eleven v4. This does NOT imply the independent Runway REST API can accept all ElevenLabs-native features; verify the precise Runway request schema before engineering against it. Claude may need direct ElevenLabs API for PLS dictionaries, v4 inline IPA and timestamps if unsupported by the Runway integration.
3. ElevenLabs' **Eleven v4 supports inline IPA** written `/.../` and per-word pronunciation dictionaries (IPA phoneme and alias), including multi-language phoneme functionality. Eleven v3 offers some IPA support, but ElevenLabs' documentation is inconsistent across older agent/content surfaces; **test, do not assume**. Multilingual v2 supports alias substitutions rather than reliable IPA phoneme dictionary rules.
4. **Pauses are model-specific.** Eleven v3 and v4 do not parse SSML `<break>` tags: use sentence punctuation, short phrasing and supported v3/v4 audio tags such as `[pause]` where documented. Multilingual v2 does support `<break time="0.3s" />`, but excessive breaks can create artifacts. Do not send `<break>` tags to v3/v4 where they may be spoken as text.
5. ElevenLabs warns that digits, symbols, acronyms and dates may be normalized incorrectly or spoken verbatim. Fully spell required numbers in **Latin** in the **speech-only** input after human review; never rely on an English-language normalizer to expand Roman numerals, headings, punctuation or abbreviations into Latin. API `apply_text_normalization` exists on ElevenLabs endpoints but its Latin support is not established.
6. ElevenLabs Forced Alignment and other speech timing endpoints are **not independently verified for Latin** (its Forced Alignment languages page lists 29 languages, excluding Latin). Runway's current `generate_speech` connector returns an MP3 task, **not** vetted, word-aligned timestamps. LATIN X must use real audio timing, not guessed words/second.

### Source links (retrieved November 7, 2026)
- ElevenLabs model/language lists: https://elevenlabs.io/docs/overview/models/
- ElevenLabs pronunciation dictionary and model support: https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries
- ElevenLabs v4 pronunciation guide (Oct 1, last updated Nov 3, 2026): https://elevenlabs.io/blog/pronunciation-dictionary-guide
- ElevenLabs delivery and IPA best practices: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
- ElevenLabs model-specific pause rules: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses
- ElevenLabs special-character normalization: https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/why-are-numbers-dates-symbols-and-acronyms-not-properly-pronounced-or-spoken-in-the-correct-language
- ElevenLabs timing API: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- ElevenLabs Forced Alignment language coverage: https://elevenlabs.io/docs/overview/capabilities/forced-alignment
- Runway API available audio model IDs and request schema: https://docs.dev.runwayml.com/api/
- Loyola University Chicago, Latin pronunciation: https://jlong1.sites.luc.edu/L101pron.htm
- Open University, reconstructed Latin evidence: https://www.open.edu/openlearn/mod/oucontent/view.php?id=25780&section=3
- Truman State University, vowel length, syllabification and stress: https://rharriso.sites.truman.edu/latin-language/pronunciation-syllable-division-and-accent-2/

## 2. Correct Latin pronunciation: non-negotiable audition checklist

Use a clearly documented **restored Classical** pronunciation for the 1st-century Roman story world, subject to expert approval. Do not mix Ecclesiastical and Classical styles. A trained Latin reviewer must check any reference IPA and generated result.

- Hard `c` and `g` even before `e/i` (`cēna`, `Gāius`), not English soft consonants.
- Consonantal `v` pronounced approximately /w/ (`vīlla`, `Līvia`) not modern English /v/.
- Long vowels with macrons (`ā ē ī ō ū ȳ`) have quantity (timing) differences; **macron is NOT a stress marker**. Preserve Unicode NFC and original text; do not delete macrons in the displayed text.
- Correct syllable stress determined by Latin syllable weight, including penult; do not use English or Italian heuristics.
- `ae`, `au`, `oe` as Classical diphthongs; geminates (`ll`, `tt`) must be perceptible where present.
- `qu` is /kʷ/ or /kw/ (not `/k/` + English u); the quality of `r` and Latin final `-m` can be tricky: standardize a teaching convention rather than asserting there is one uncontested exact accent.
- Test sentence-internal rhythm and intelligibility, not just isolated words. Avoid a modern-English accent masquerading as classical speech.

**Provisional IPA candidates requiring expert verification**, not an approved lexicon:
- `cēna` → `/ˈkeː.na/` (hard c, long first vowel)
- `vīlla` → `/ˈwiːl.la/` (v=/w/, long ī, geminate l)
- `Līvia` → `/ˈliː.wi.a/` (long first vowel and v=/w/)

Start with *plain original Latin text*. Only substitute one *reviewed* IPA entry if a specific word is demonstrably wrong. v4 syntax generally uses slash-delimited IPA inline. Do not assume the ChatGPT Runway connector supports it or that it will succeed on unsupported Latin. Maintain a source/voice/model/pronunciation-table revision for each attempt.

## 3. Avoid punctuation being read aloud and unwanted noises

**Keep two independent strings**:
- `display_text`: untouched original lesson `text_la`, matching learner text and saved content checksums.
- `speech_input`: an audited version intended solely for the external voice generator.

Suggested speech-input preparation:
1. Take the exact Latin sentence by stable lesson/sentence ID. Never include translations, labels such as `Lectiō II`, speaker annotations, JSON keys, list numbers, Markdown bullets, quotes from comments, line numbers or UI help text.
2. Unicode normalize to NFC; remove zero-width junk, HTML/XML markup (except intentional model-specific tags added later), superscript footnote references and invisible control characters. **Flag** any unexpected glyph instead of silently guessing its meaning.
3. Preserve normal sentence `.` `,` `?` `!` initially for prosody. *Do not remove all punctuation by default*. Test two variants only if the model literally says 'comma', 'period', 'question mark' or creates unnatural pauses: (A) normal punctuation, (B) punctuation simplified to a period or controlled sentence break in the **speech_input only**. Record which sounds better, never mutate `display_text`.
4. Expand Latin abbreviations/numbers according to reviewed Latin context (`III` might be a chapter number, ordinal, or quantity): **no global replacements**. Reject emoji, markdown, asterisks, slashes, section marks and mixed English lines from narration prompts.
5. v3/v4: no SSML `<break>` tags. If a pause is really needed test a single documented `[pause]` marker or split at a sentence. v2: optionally use a *small number* of 0.2–0.5 s `<break>` tags; test, do not assume Latin locale.
6. Avoid injecting prose directions such as `Read in classical Latin:` inside Runway's `text` parameter: those words can be spoken aloud. Use metadata/name fields for tracking and select the best voice by samples. Beware of overly short text and isolated words causing hallucinated filler.
7. Perform manual listen-and-transcript QA on every newly generated audio clip; investigate phonemes, missing words, added words, punctuation read aloud, vocal glitches, robotic prosody, clipping, hiss and volume spikes. Regenerate only failed lines.

**Suggested small test matrix** (generations AFTER paid plan is enabled):
- Take EXACT first 5 Latin sentences from `lessons/legacy/ch01.json` (manifest bundled) and later 1 interrogative sentence from a reviewed source.
- Test 2 potential natural narrators; make a short 2- or 3-sentence batch for context plus one sentence in isolation to compare continuity.
- Compare original macron-bearing Latin input vs a *reviewed* IPA correction for ONE problem word; do not alter source spelling.
- For punctuation failures compare ordinary `.` / `,` against a reviewed punctuation-reduced **speech-only** variant.
- Use 0.85–1.0 pacing as an empirical starting range, **not** an accuracy guarantee.
- Have one Latin-competent reviewer select the passing samples, and preserve every rejected sample's model, cost and rationale.

## 4. Real sentence timing and offline LATIN X integration

**Current code:**
- `app/legacy-runtime.js` → `availableVoice()` chooses a browser Latin voice or system default; `speak()` constructs `SpeechSynthesisUtterance(line[0])`, `lang='la'`, `rate=.82`. Browser speech is NOT a verified Latin pronunciation source.
- The main reader already supports user-imported chapter MP3 and optional exact `intervals` to follow sentences (`validateRanges()`, `timed()` and playback controls). It separates timed MP3, untimed MP3 and browser voice; **do not invent timings for untimed audio**.
- `app/70-user-media.js` stores optional user MP3 and timing blobs locally in IndexedDB (memory-only fallback in some browsers). Do not change the v4 snapshot or v5 migration formats to store new generated audio.
- `app/60-audio-ambience.js` synthesizes music with Web Audio, ducks music while narrating, and respects autoplay restrictions. A prerecorded soundtrack would need a separate user-gesture-driven player and ducking integration, not a forced autoplay.

**Recommended delivery architecture:**
- Approve narration by **sentence ID** `legacy-ch01-s001`, etc. Package verified files under e.g. `assets/audio/narration/legacy-ch01/s001.mp3` with a per-file SHA256; provide alternate main-lesson `chapter.mp3` and timings if desired.
- If using one full chapter MP3, derive each `start`/`end` from real audio playback or a truly supported, checked timestamp API. Validate against actual duration, ensure intervals nonoverlap, preserve exact ID ordering and don't use guessed characters/second.
- An implementation alternative for the first pilot: individual approved audio clips per sentence, `onplay` and `ended` drive highlighting. No fake clocks. Keep `Play`, `Pause`, Next/Prev and re-entry consistent; do not play an audio file until clicked.
- In all versions, store actual Latin text and voice-generated text separately; if speech input contains IPA it does **not** replace the reader's original sentence text. Pronunciation annotations and rejected candidates are authoring metadata only.
- Recorded audio never silently replaces unreviewed course content, is never graded and is marked "AI-generated, pronunciation expert review pending" until accepted. Music provenance and licensing also need review.

## 5. Claude's implementation checklist AFTER the upgrade

1. Reconfirm the connected Runway plan and available credits. Pilot first; do not bulk-spend credits.
2. Inspect available Runway surface: the connected ChatGPT tool's v3/v2 options may differ from Runway **REST API** `eleven_v4`. If v4 is not exposed, use v3 limited trials or get authorized account/app access for an API that accepts IPA/dictionaries. Never fabricate successful Latin support or ask for credentials in chat.
3. Produce audited input data from the exact Latin lesson sources. Run `node docs/audio/prepare_latin_pilot.cjs` locally. Confirm exact original text/macrons/IDs, and list punctuation and odd characters requiring review.
4. Produce two auditions; compare real audio and reject wrong accent, literally read punctuation, missing/mispronounced words, hallucinated English, sudden pauses, breaths/white noise, glitches.
5. Create a versioned IPA/alias lexicon ONLY after knowledgeable Latin review; test each rule with the chosen model and voice. Avoid wholesale English respelling.
6. Validate human timing, audio duration, loudness/peak, seamless sentence joins, and voice timbre across clips; produce real per-sentence metadata.
7. Integrate only the owner-selected, vetted MP3s into the existing offline application without changing protected data, tests or artwork. Leave browser voice as a clearly labelled fallback.
8. After all tests and user acceptance, deliver one complete runnable ZIP with all source, audio, approvals/provenance, test results and Claude handover; no stacked PR merges or release without owner's authorization.

## 6. Fail conditions (block course-audio promotion)

- Unsupported `languageCode: la`, or arbitrary `languageCode: it/es` masquerading as authentic Latin.
- Mispronounced hard c/g, long vowels, v=/w/, syllable stress, diphthongs, or consistent vowel length.
- TTS literally says punctuation names, XML tags, Latin lesson headings, English translations, speaker instructions or IPA slash labels.
- Added/omitted words, audible non-Latin filler, metallic glitches, sudden tempo/timbre/volume shift.
- Nonexistent or guessed sentence intervals; synthetic timings that pretend to track real voice.
- Unverified AI voice presented as a Latinist-approved reference.
- Any request that requires an API secret embedded in the offline app (secrets stay server-side, generation at build-time only).
