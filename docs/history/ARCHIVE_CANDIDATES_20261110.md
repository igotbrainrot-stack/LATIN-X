# Historical documentation archive map — 10 November 2026

This is a **non-destructive classification**, not an instruction to delete records. The baseline Git tree has 461 files, including 40 in `CLAUDE_HANDOVER/`, six in `CLAUDE_REVIEW_PACKAGE/`, 105 in `docs/`, and many root phase handovers. Historical size is not evidence of disposability.

## Current authoritative starting points
- `README.md` — current learner and developer orientation
- `HANDOVER.md` — architecture and integration notes (check for older contradictory sections)
- `PROJECT_STRUCTURE.md` — new module/release paths
- `AUDIT_REPORT.md` and `VERIFICATION_REPORT.md` — current evidence and testing limitations
- `docs/FEATURE_INVENTORY.md` — feature regression map
- `docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json` and `content/narration.js` — 78-file integrity and owner-listening statuses

## Historical candidates, preserve until reference-tested
| Collection | Status | Rationale |
|---|---|---|
| `CLAUDE_HANDOVER/` | Preserve, likely archival | 40 historical reports, audio provenance, test logs and screenshots |
| `CLAUDE_REVIEW_PACKAGE/` | Preserve, likely archival | Six historical cross-agent review/implementation records |
| Root `PHASE2_*HAND BACK`, `PHASE3*_CLAUDE_HANDOVER.md`, `PHASE4...` onward | Candidate for `docs/history/phases/` after links and scripts are scanned | Development chronology; historical decisions may be essential |
| `docs/history/` | Preserve as archive | Already segregated legacy documents |
| `audio-audition/` & `docs/audio/` | Preserve private/public separation | Crucial provenance and historical owner approvals; no bulk deletion |
| `archive/index-v04-inline-phase3a-baseline.html` | **Protected** | Byte-lock source for `tests/phase3a-relocation.test.cjs` and compiler |
| `artifacts/`, `reports/` | Candidate audit only | May be referenced by art provenance, tests and reproducible screenshots |
| Root historical pronunciation review HTML/pages | Preserve outside learner release | Existing tests may rely on embedded assets and exact markup |
| Root `SHA256SUMS.txt` | Preserve; review build checks | Source integrity for historical tracked contents |

## Moving files safely, in a future PR
1. Record all references in source/tests/docs/workflows/launchers to candidate paths (including literal paths, generated paths and dynamically loaded assets).
2. Verify content hashes of every approval/source record before and after a move.
3. Move **only** confirmed documentation-only items; never move compiled lesson JS, locked baseline HTML, owner decisions or media to satisfy a cosmetic goal.
4. Update every relative link and script reference; run `npm test`, full browser matrix and release validation.
5. Preserve Git history; make moves in small reviewable groups. If a file's purpose is unclear, keep it.
6. Keep the lean learner runtime archive separate from comprehensive development/approval history.

## Explicitly out of scope
No content, question keys, lexicon signatures, picture approval decisions, FSRS state, local-storage migrations or private owner review data are moved or rewritten in this conservative audit.
