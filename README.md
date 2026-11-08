# Tablinum — Prima Via

An offline Latin reading course that runs in any modern browser straight from its folder (`file://`). No server, installation or Internet connection.

## Start

| System | How |
|---|---|
| Windows 11 | Double-click **`Tablinum.html`** in the release package (or `index.html` / `Start Tablinum.cmd` in this source tree). |
| Linux Mint | Double-click **`Tablinum.html`**. Optional: run `linux/install-launcher.sh` once for a menu entry and desktop icon. |

Learner packages are built from this source with `npm run build:release` (see [HANDOVER.md](HANDOVER.md)).

## What is in it

- **Lectiō** — eight illustrated legacy chapters with clickable words, three-level Latin clues, macron and guidance toggles, personal notes, approved Miriam recordings where available (browser voice, labelled "not Miriam", elsewhere) and optional microphone practice.
- **Exercitia** — the original 24 questions plus eight guided cloze items.
- **Memoria** — offline FSRS review of saved words.
- **Progressus** — progress ledger, course map, export of your practice recordings, backup export / restore and safe recovery of older saved data.
- **Picture Practice** — nine owner-approved watercolour scenes with clickable regions (draft questions, never graded).
- Background lyre music and click sounds with separate on/off and volume controls.

The former **Bibliothēca** tab (import your own text, local audio and timing JSON) was removed at the owner's request on 8 Nov 2026.

Content status: the eight legacy chapters are the playable course. The eight Book I pilot chapters, the 44 picture questions and all lexicon entries remain **unsigned drafts**. Latin has not been verified by a Latinist.

## Documentation

- [HANDOVER.md](HANDOVER.md) — architecture, build, tests, constraints, open issues (start here as a developer or AI agent).
- [docs/REFINEMENT_REPORT_20261108.md](docs/REFINEMENT_REPORT_20261108.md) — the November 2026 polish and audit pass.
- [docs/FEATURE_INVENTORY.md](docs/FEATURE_INVENTORY.md) — every feature with its regression coverage.
- [docs/audio/APPROVED_NARRATION.md](docs/audio/APPROVED_NARRATION.md) — Miriam recordings, including the five regenerated takes.
- [ATTRIBUTION.md](ATTRIBUTION.md) — sources, font and licence notes.
- [docs/history/](docs/history/) — earlier phase handovers and the previous README.
