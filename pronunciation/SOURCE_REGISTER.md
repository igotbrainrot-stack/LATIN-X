# Pronunciation sources

| Source | Used for | Status in this standard | Access |
|---|---|---|---|
| Allen & Greenough, *New Latin Grammar* (1903), §§1–12, 167–188, 602–603 | Syllables, weight, stress, consonant values, vowel-before-vowel, *ns*/*gn* rules, regular verb endings | Primary for rules. Section numbers checked against the text | Dickinson College Commentaries edition via the Alpheios source files (CC BY-NC-SA) |
| Lewis & Short, *A Latin Dictionary* (1879) | Stem vowel lengths of each lemma; principal parts | Primary for vowel length | Perseus XML (CC BY-SA). Not stored in this repository |
| W. S. Allen, *Vox Latina* (2nd ed., 1978) | Vowel quality convention, *gn* = [ŋn], aspirates, double consonants | Primary reconstruction, cited for the house convention only. Not quoted, because it is in copyright | Not in this repository |
| Collatinus (`lemmes.la`) | Second, independent check of stem vowel lengths; lemma and paradigm model of each form | Hint only. It marks length by position, so its macrons before two consonants are ignored | GPL; not stored in this repository |
| `docs/audio/latin-ipa-pilot-lexicon.json` | The existing house transcription | The rules reproduce its nine Chapter I sentences exactly; one word (*Gāius*) differs and is listed as ambiguous | This repository |

Not used: text-to-speech output, speech recognition, or automatic macronisers, which can test a recording but cannot decide what is correct. The Vox Classica corpus, the St Andrews *Handbook of Latin Phonetics* data and the Latin Whisper and SpeechT5 models named in the owner's research note were not reachable from this environment and are not relied on.
