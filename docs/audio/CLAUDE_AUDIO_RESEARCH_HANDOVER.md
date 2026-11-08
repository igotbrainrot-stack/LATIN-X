# START HERE — Claude: LATIN X Runway Latin speech research (7 November 2026)

Full application ZIP baseline: `LATIN_X_MORE_BLENDED_GLOW_COMPLETE_CLAUDE_20261107.zip`. This **complete** updated ZIP adds **research and an offline pilot-input preparer only**. No new Runway audio exists because the attached workspace was on the Free plan and generated no speech/music. The user said they will upgrade. Do not imply narration or music has already been generated.

Read `docs/audio/RUNWAY_LATIN_PRONUNCIATION_RESEARCH.md`, then run `node docs/audio/prepare_latin_pilot.cjs`. Verify its input against `lessons/legacy/ch01.json`. The generated JSON contains the exact nine legacy Chapter I Latin sentence IDs and Unicode text, not an altered course. No runtime code, illustration, sentence region, approval or save data has been changed. This is a research task, NOT a live audio migration or approval.

**Core finding:** Latin `la` unsupported by Runway tool's Multilingual v2; current connected speech tool exposes v3/v2, while Runway's REST API docs advertise v4. ElevenLabs v4 inline IPA and pronunciation dictionaries are promising but Latin is officially *not* listed as a supported language. Expert audition required. For v3/v4, DON'T insert v2 SSML `<break>` tags; avoid silently reading punctuation and metadata. Use separate display_text vs speech_input; preserve long vowels, record sentence metadata, and derive timestamps from real audio, not guessed timing.

**When Runway is upgraded:** do a very small two-voice audition using exact lesson text, pronunciation compare, audio QA, owner selection and genuine timing before touching offline player. Only then integrate approved MP3s, preserving browser voice fallback and existing backup/migration rules. The user's standing requirement is a complete runnable ZIP plus detailed Claude handover after EVERY task.

Sources are linked within the research report. No credentials or API keys are bundled. No Runway-generation charges occurred during this research packaging task.
