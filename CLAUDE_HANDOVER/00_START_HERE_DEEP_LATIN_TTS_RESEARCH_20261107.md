# Claude handover — Latin TTS research and owner v3 decisions

Use the existing runnable LATIN X program in the root of this ZIP. Do not rebuild it from `main`. **Do not merge stacked PRs.** This is a local research and owner audio pilot archive, not a Git push.

1. READ `docs/audio/DEEP_RESEARCH_RUNWAY_CLASSICAL_LATIN_2026-11-07.md` first. It includes direct firsthand experiences (Fini; r/ElevenLabs; r/Latin), Ciletti's Latin TTS research, Latin-trained OmniVoice LoRA and a comparison plan. No verified Runway-specific native Latin workflow was found.
2. Owner's uploaded review is **exactly** `docs/audio/owner-miriam-alias-v3-review-2026-11-07.json`. s007 v3 REJECT, s009 v3 REJECT, aqua v3 ACCEPT, quoque v3 REJECT; previous v2 villa ACCEPT, original Miriam v1 12 ACCEPT/5 REJECT, Eleanor 17 REJECT; selected narrator is still null. Never overwrite owner approvals.
3. Three further exact Runway experiments generated as clip-iteration v4, but **model is Eleven v3**: `docs/audio/miriam-alias-v4-2026-11-07.json`. No owner acceptance yet.
4. Private signed originals are in `audio-audition/PRIVATE_MIRIAM_ALIAS_V4_RUNWAY_LINKS.json` (owner ZIP ONLY, DO NOT commit). Run `DOWNLOAD_MIRIAM_ALIAS_V4.cmd` in Windows while links valid; SHA-256 is null until real MP3 bytes are downloaded. The new MP3s are not present in ZIP. Do not invent them.
5. Audition `Start Miriam Review v4.cmd`, listen side by side to exact v1 original recordings bundled in this ZIP and the 3 new clips, export review JSON, then stop. The new reviewer file is separate from the reader, no lesson audio was replaced.
6. Existing 34 v1 MP3s, full app, older v2/v3 review pages/links, prior art and audit rollback are present. Leave all unchanged.
7. New finding: Latin-trained `coolcoder613/omnivoice-latin-lora-1` (22h macronized classical Latin; demo; underlying noncommercial licence) may be a better comparative engine. Academic Ciletti 2025 paper specifically found no advantage to hyphenating syllables and required expert adjudication of audio.
8. Do not make educational claims of Latin accuracy or add fake timings; seek review from a Latinist for pronunciation and keep owner review tier distinct.
9. The original lesson, illustration, state, progress, music and Latin TTS fallback code are byte-unchanged. No branches/PRs created.
