# Latin corrections: combined integration run (10 November 2026)

This branch merges, onto `main` at `1803e55`:

| PR | Branch | Content |
|---|---|---|
| #4 | `audit/latin-scholarship-20261110` | Audit, findings, gold tests |
| #9 | `fix/latin-approved-ui-007-014-20261110` | UI vowel quantities LX-007 to LX-014 (#5 is an identical patch and is not included) |
| #6 | `fix/latin-approved-paradigms-20261110` | Paradigm generator LX-003 to LX-006 |
| #7 | `fix/latin-approved-pilot-20261110` | Pilot and picture exercises LX-001, LX-002, LX-016, LX-019 |
| #8 | `fix/latin-approved-legacy-errata-20261110` | Published lessons, narration text, answer lists LX-001, LX-017, LX-018 |

The merges had no conflicts. The audit report in this folder describes the audit baseline and is left as dated.

## Results on the merged tree

- `node scripts/run-latin-gold-tests.cjs --strict`: 110 of 110 preservation tests and 28 of 28 correction tests pass. The runner is now part of `npm test` in strict mode, so a correction that is reverted fails the build.
- `npm test` and the extra suites (`test:pilot`, `test:phase2`, `test:illustrations`, `test:art`, `test:paradigms`, `test:grammar`, `test:music`, `test:package`, `test:offline-media`, `test:offline-contract`) pass.
- `test:release` builds the offline ZIP and needs the owner's private MP3s, which are not in the repository, so it fails here and on `main` alike ("Missing offline recording"). Run it on the owner's machine before a release.
- All 15 browser suites (`test:browser-all` set) pass.

## Saved data

- Sentence, question and vocabulary-row IDs and counts are identical to `main` in all eight legacy chapters.
- The keys of `curriculum/lexicon/legacy-id-map.json` are identical to `main`.
- `tests/backup-compat.test.cjs`, `tests/migration.test.cjs` and `tests/fixtures/v4/` are unchanged and pass.
- In `content/narration.js` only the nine `canonical_text` values with *Titus* changed. Audio checksums and `owner_listening` statuses did not change. No MP3 is in the repository.

## Still open

- LX-015 (*Recordātiō incepta*) needs a wording decision (U-06).
- The nine recordings that say *Titus* and the 58 pending Chapter II–VIII takes need listening review (U-01, U-02, U-05).
