# Tablinum — Prima Via

> **Latest setup build (14 November 2026):** The newest integrated work is on `release/easy-install-20261111` ([PR #19](https://github.com/igotbrainrot-stack/LATIN-X/pull/19)), **not yet merged to `main`**. Run `npm run build:setup` from that branch to produce `dist/Tablinum-Setup-20261111.zip`, with a Windows installer, Linux Mint installer and portable launcher. Read [setup instructions](docs/EASY_INSTALL.md) and [latest-build handover](docs/LATEST_BUILD_20261114.md). The generated ZIP is not stored in Git.

> **Interface redesign (15 November 2026):** branch `ui/premium-redesign-20261115` rebuilds the interface on top of the setup build: a Home screen, light and dark themes, adjustable reading text, a glossary and a Settings screen. It is a pull request against `release/easy-install-20261111` and is **not merged**. See [CHANGELOG.md](CHANGELOG.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [BUG_AUDIT.md](BUG_AUDIT.md), [TEST_REPORT.md](TEST_REPORT.md) and [DEVELOPMENT_HANDOVER.md](DEVELOPMENT_HANDOVER.md). It has not been run on a real Windows or Linux Mint desktop.

An offline Latin reading course that runs in any modern browser straight from its folder (`file://`). No server, installation or Internet connection.

## Start

| System | How |
|---|---|
| Windows 11 | Double-click **`Tablinum.html`** in the release package (or `index.html` / `Start Tablinum.cmd` in this source tree). |
| Linux Mint | Double-click **`Tablinum.html`**. Optional: run `linux/install-launcher.sh` once for a menu entry and desktop icon. |

Learner packages are built from this source with `npm run build:release` (see [HANDOVER.md](HANDOVER.md)).

## What is in it

- **Home** — continue where you left off, today's review, all eight lessons with their progress, word games and Picture Practice.
- **Lēctiō · Read** — eight illustrated legacy chapters with clickable words, three-level Latin clues, adjustable text size and line spacing, focus mode, personal notes, Arjun sentence-click narration (Chapter I owner-approved, Chapters II–VIII awaiting owner review), with labelled browser-voice fallback and optional microphone practice. One sentence plays per click; nothing advances by itself.
- **Exercitia · Practise** — the original 24 questions plus eight guided cloze items, and a word check per chapter.
- **Memoria · Words** — offline FSRS review of saved words, and a searchable glossary of the course words with the forms and sentences where each is met.
- **Prōgressus · Progress** — lesson progress, word knowledge and the course map.
- **Settings** — theme (system, light, dark), reading display, macrons, sound, backup export / restore, export of your practice recordings, and safe recovery of older saved data.
- **Picture Practice** — nine owner-approved watercolour scenes with clickable regions (draft questions, never graded).
- Three soft original Roman-themed lo-fi reading tracks with 8-second crossfades, narration ducking and WebAudio lyre fallback, plus separate music/click controls in the Sound menu.

The former **Bibliothēca** tab (import your own text, local audio and timing JSON) was removed at the owner's request on 8 Nov 2026.

Content status: the eight legacy chapters are the playable course. The eight Book I pilot chapters, the 44 picture questions and all lexicon entries remain **unsigned drafts**. Latin has not been verified by a Latinist.

## Offline owner-media releases (November 2026)

The repository integrates the Arjun catalogue, Roman MP3 player, cloth-paper CSS texture and first-run welcome into source, without startup-time downloads or modifications. Since 11 November 2026, by the owner's decision, all 78 owner media files are committed: 75 narration files (including one Miriam *laeta* word fallback) and 3 Roman music MP3s. The release builder enforces `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json` (75 narration files, including one Miriam *laeta* word fallback, and 3 Roman music MP3s); it fails if a file is absent or mismatched. From a complete checkout, run `npm test`, `LATIN_X_REQUIRE_PRIVATE_AUDIO=1 npm run test:narration`, `npm run test:browser-all`, `npm run test:release`, then `npm run build:release`. The release builder requires all 78 local private files. The learner ZIP/tar.gz runs offline on first launch with no Python bootstrap. Chapter II–VIII recordings are new and not yet owner-approved. No copyrighted source textbook is included.

**Distribution warning:** The older `LATIN_X_LATEST_MAIN_5b1ca7d_LINUX_MINT_20261110.zip` contains a first-launch source downloader, not the complete offline app. For a genuine offline release, use the output of `scripts/build-release.cjs` with the 78 manifest-pinned MP3s. The source is never changed on launch. Move folders only after exporting a backup (Settings → Your data) because browser `file://` storage may be path-scoped.

## Documentation

- [AUDIT_REPORT.md](AUDIT_REPORT.md), [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [LATIN_CONTENT_REVIEW.md](LATIN_CONTENT_REVIEW.md) — current audit and protection reports.
- [docs/history/ARCHIVE_CANDIDATES_20261110.md](docs/history/ARCHIVE_CANDIDATES_20261110.md) — conservative historical-document archive map.
- [DEVELOPMENT_HANDOVER.md](DEVELOPMENT_HANDOVER.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [BUG_AUDIT.md](BUG_AUDIT.md), [TEST_REPORT.md](TEST_REPORT.md), [CHANGELOG.md](CHANGELOG.md), [docs/FABLE52_DEVELOPMENT_STATUS.md](docs/FABLE52_DEVELOPMENT_STATUS.md) — the November 2026 interface redesign.
- [HANDOVER.md](HANDOVER.md) — architecture, build, tests, constraints, open issues (start here as a developer or AI agent).
- [docs/REFINEMENT_REPORT_20261108.md](docs/REFINEMENT_REPORT_20261108.md) — the November 2026 polish and audit pass.
- [docs/FEATURE_INVENTORY.md](docs/FEATURE_INVENTORY.md) — every feature with its regression coverage.
- [docs/audio/APPROVED_NARRATION.md](docs/audio/APPROVED_NARRATION.md) — historical Miriam review, preserved; see the new Arjun audio integration records for current voice status.
- [ATTRIBUTION.md](ATTRIBUTION.md) — sources, font and licence notes.
- [docs/history/](docs/history/) — earlier phase handovers and the previous README.
