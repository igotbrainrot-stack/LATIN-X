# LATIN X — source and offline-release structure

**Architecture:** Static HTML with ordered classic scripts and established globals. The learner opens local `Tablinum.html`, which redirects to the packaged `index.html`. No Node, Python, server, GitHub, user account or source patching is required at runtime **when built from the repository release builder**.

| Path | Responsibility |
|---|---|
| `index.html` | Manuscript shell, explicit script order, approved CSS texture, welcome dialogue |
| `app/20-state-v5.js` | State, immutable original v4 key, v5 storage, migration, backups |
| `app/30-content-loader.js` | Dynamic local chapter scripts, no network fetch |
| `app/50-exercises.js` | Signed-only newer-course exercises |
| `app/55-review-deck.js` | FSRS review logic, paired with pinned `vendor/ts-fsrs.umd.js` |
| `app/58-music-score.js`, `60-audio-ambience.js` | Three Roman MP3s with soft crossfades and WebAudio score fallback |
| `app/62-narration.js`, `content/narration.js` | Narration playback, per-take status, canonical sentence matching |
| `app/legacy-runtime.js` | Protected reader, notes, questions, vocabulary, progress and UI |
| `app/64-art-scenes.js`, `65-picture-practice.js` | Owner-approved art and unsigned picture practice |
| `app/70-user-media.js`, `80-accessibility.js` | Mic audio/exports and accessibility |
| `app/welcome/` | First-run guide with keyboard focus management and local skip setting |
| `lessons/`, `curriculum/` | Authoritative source text, plans, draft/review metadata |
| `content/` | Generated course JS: regenerate using existing compilers; don't hand-edit |
| `assets/art/`, `assets/fonts/`, `assets/icons/` | Approved visual media and fallback font |
| `audio/narration/arjun/` | Owner-provided Arjun MP3s, one labelled Miriam word fallback (ignored by Git) |
| `assets/audio/roman/` | Three Roman instrumentals (ignored by Git) |
| `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json` | Authoritative 78-file paths, lengths and SHA256 hashes |
| `launchers/` | Windows/Linux browser launcher and optional Linux desktop-menu installer |
| `scripts/build-release.cjs` | Build full Windows ZIP, Linux tar.gz, source ZIP and SHA256SUMS |
| `tests/` | Content/progress/approval locks, release extraction/browser verification |
| `docs/history/`, `CLAUDE_HANDOVER/`, `CLAUDE_REVIEW_PACKAGE/` | Historical records; retain while references and approval history are audited |

## Release versus obsolete bootstrap
- **Correct:** `node scripts/build-release.cjs --out dist` in a full checkout with 78 manifest-pinned MP3s.
- **Incorrect for an offline release:** the old `LATIN_X_LATEST_MAIN_5b1ca7d_LINUX_MINT_20261110.zip`, which downloads source on first launch.
- Learner entry points: `Tablinum.html` at the root of each extracted release, or `index.html` directly. The Linux menu-entry installation is optional, not required to read.

## Developer checks
```bash
npm test
LATIN_X_REQUIRE_PRIVATE_AUDIO=1 npm run test:narration
npm run test:browser-all
npm run test:release
node scripts/build-release.cjs --out dist
```

## Data compatibility
The original storage key `tablinum-source-review-v02` and current `tablinum-state-v5` must remain. Old saves may contain the historical `library` tab even though the Bibliothēca interface was removed. Export a backup from Progressus before changing the extracted app folder. No routine cleanup may change course text, answer keys, FSRS scheduling or approval status.
