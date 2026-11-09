# Tablinum — Prima Via

An offline Latin reading course that runs in any modern browser straight from its folder (`file://`). No server, installation or Internet connection.

## Start

| System | How |
|---|---|
| Windows 11 | Double-click **`Tablinum.html`** in the release package (or `index.html` / `Start Tablinum.cmd` in this source tree). |
| Linux Mint | Double-click **`Tablinum.html`**. Optional: run `linux/install-launcher.sh` once for a menu entry and desktop icon. |

Learner packages are built from this source with `npm run build:release` (see [HANDOVER.md](HANDOVER.md)).

## What is in it

- **Lectiō** — eight illustrated legacy chapters with clickable words, three-level Latin clues, macron and guidance toggles, personal notes, Arjun sentence-click narration (Chapter I owner-approved, Chapters II–VIII awaiting owner review), with labelled browser-voice fallback and optional microphone practice.
- **Exercitia** — the original 24 questions plus eight guided cloze items.
- **Memoria** — offline FSRS review of saved words.
- **Progressus** — progress ledger, course map, export of your practice recordings, backup export / restore and safe recovery of older saved data.
- **Picture Practice** — nine owner-approved watercolour scenes with clickable regions (draft questions, never graded).
- Three soft original Roman-themed lo-fi reading tracks with 8-second crossfades, narration ducking and WebAudio lyre fallback, plus separate music/click controls.

The former **Bibliothēca** tab (import your own text, local audio and timing JSON) was removed at the owner's request on 8 Nov 2026.

Content status: the eight legacy chapters are the playable course. The eight Book I pilot chapters, the 44 picture questions and all lexicon entries remain **unsigned drafts**. Latin has not been verified by a Latinist.

## Offline owner-media releases (November 2026)

This branch directly integrates the Arjun catalogue, Roman MP3 player, cloth-paper CSS texture and first-run welcome into source, without startup-time downloads or modifications. The 78 owner media files are **not committed**: unpack the owner's private audio bundle into the source tree before building. The release builder enforces `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json` (75 narration files, including one Miriam *laeta* word fallback, and 3 Roman music MP3s); it fails if a file is absent or mismatched. Use `npm test`, `npm run test:narration`, `npm run test:browser-all`, then `npm run build:release` from a complete checkout. The learner ZIP/tar.gz runs offline on first launch with no Python bootstrap. Chapter II–VIII recordings are new and not yet owner-approved. No copyrighted source textbook is included.

## Documentation

- [HANDOVER.md](HANDOVER.md) — architecture, build, tests, constraints, open issues (start here as a developer or AI agent).
- [docs/REFINEMENT_REPORT_20261108.md](docs/REFINEMENT_REPORT_20261108.md) — the November 2026 polish and audit pass.
- [docs/FEATURE_INVENTORY.md](docs/FEATURE_INVENTORY.md) — every feature with its regression coverage.
- [docs/audio/APPROVED_NARRATION.md](docs/audio/APPROVED_NARRATION.md) — historical Miriam review, preserved; see the new Arjun audio integration records for current voice status.
- [ATTRIBUTION.md](ATTRIBUTION.md) — sources, font and licence notes.
- [docs/history/](docs/history/) — earlier phase handovers and the previous README.
