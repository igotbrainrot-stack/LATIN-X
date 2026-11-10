# LATIN X — owner-approved quantity conventions
**Date:** 10 November 2026 · **Branch:** `fix/classical-quantity-conventions-20261110`

This is a distinct editorial follow-up to the merged restored Classical Latin pronunciation standard (PR #11). The owner accepted the recommendations on 10 November 2026. The preferred spelling is a course convention supported by the cited grammatical rule, **not a fresh listening review or a claim of Latinist verification**.

| Case | Decision | Evidence |
|---|---|---|
| `magnus` and inflections | `māgnus`, `māgna`, `māgnā`, `māgnam`, `māgnum`, `māgnō` | A&G §603.d (quantity before `gn`) |
| `significātiōnem` (UI) | `sīgnificātiōnem` | A&G §603.d |
| `reconstrūctiō` (music disclaimer) | `recōnstrūctiō` | A&G §603.d (before `ns`); term remains post-Classical |
| `dēest` | Keep `dēest` | Retain documented house convention without claiming lexicographic certainty |
| `Gāius` | Three syllables, `Gā.ĭ.us` | Lewis & Short; Chapter I audio needs review |
| `tonitrus` | Keep short second `i` | Dictionary allows common/variable quantity |

**Preservation:** The SHA-locked historical manuscript is untouched. The course overlay in `scripts/lib/legacy-errata.cjs` is the only source of the legacy adjustment; generated lesson/lexical/catalogue data is synchronised. Do not rename `arbor-magna` or other picture targets; the accepted answers and storage keys are stable. All eight Book I pilot lessons remain drafts. No recording, filename, audio checksum, approval status, or saved-progress schema has been modified.

**Listening required:** The historical Arjun clips `arjun-s005` (`s005-arjun.mp3`) and `arjun-word-magna` (`word-magna-arjun.mp3`) were generated before the revised long-ā target. Both retain their existing `pass` decision as an historical owner judgement, but **must be rechecked against** /ˈmaːŋ.na/. Existing nine Titus sentence warnings, the trisyllabic Gāius question and pending II–VIII clip reviews also remain outstanding. The course's transcription may be corrected without altering the recording.

**Regeneration/testing:** `node scripts/build-pronunciation.cjs --check`, `npm test`, pilot compilation, content source locks, backup/migration and browser suites. The release remains subject to the separate strict 78-MP3 offline build test. Any future changes to the voice require new owner listening approval, not an automatic status promotion.
