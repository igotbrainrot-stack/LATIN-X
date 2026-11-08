# Implementation status matrix — 6 November 2026

**Status labels:** `DONE + CI` = committed and covered by the reported workflows. `DONE / unverified` = source committed but manual/expert verification pending. `NOT IN THIS BRANCH` = no source in the GitHub package; do not infer from handovers. `PENDING OWNER` = no synthetic approval.

| Area | GitHub package state | Evidence / caveat |
|---|---|---|
| Original learner app, eight playable chapters | DONE + CI | `index.html`, `Start Tablinum.cmd`, `tests/smoke.test.cjs`, Windows Chromium `file://` checks. Original runtime unchanged on this branch |
| Earlier v0.2 source archive | DONE | `archive/index-v02-original.html`; do not replace current app with it |
| Existing progress/backup and classic scripts | DONE + CI | `tests/backup-compat.test.cjs`, `tests/file-url-smoke.cjs`; no new migration |
| 130-chapter curriculum | PLAN ONLY | `curriculum/CURRICULUM_130_MASTER_PLAN.md`, `curriculum/vocabulary-budgets-130.json`; planned targets are not playable lessons |
| Familia Romana research | SOURCE NOTES | `curriculum/FAMILIA_ROMANA_RESEARCH.md`; copyrighted source text/audio not committed |
| Legacy Phase 1 lexeme registry and source maps | ENGINEERING | `curriculum/lexicon/`, `scripts/build-phase1-registry.cjs`, `scripts/validate-lexemes.cjs` |
| Claude 128-entry 32-column review queue | DONE + CI | `curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv`; all approvals blank |
| Offline review page, Windows launcher and CLI | DONE + CI | `Vocabulary Review.html`, `Start Vocabulary Review.cmd`, `Validate Vocabulary CSV.cmd`; Windows `file://` browser suite |
| Grammar fail-closed validator | DONE / needs linguistic review | `scripts/lib/grammar.cjs`, 172 provisional catalogue records, `tests/grammar-gate.test.cjs`; no compiler hookup yet |
| Regular paradigm proposal generation | PARTIAL / needs linguistic review | `scripts/lib/paradigms.cjs`, 15 unreviewed sample fixture patterns; NOT a complete validated Latin conjugator |
| Previous Phase 2 deterministic lesson compiler | **NOT IN THIS BRANCH** | Only in separate `LATIN_X_PHASE2_FULL_BUILD_20261105.zip` stored in ChatGPT Library |
| Phase 2 legacy-to-lesson 8 JSON exports | **NOT IN THIS BRANCH** | Only in the separate earlier ZIP |
| Phase 2 generated catalogue/lesson artefacts | **NOT IN THIS BRANCH** | Only in the separate earlier ZIP |
| Original historical GPT provisional comparison artifacts | **NOT IN THIS BRANCH** | Mentioned in attached `LATIN_X_COMPLETE_20261105.zip`, not extracted here |
| Approved lexical entries (owner / Latinist) | **PENDING OWNER** | Zero signed approvals. `review_tier=owner` label alone is not a signature |
| New approved and playable chapters | **NOT IMPLEMENTED** | Eight old chapters playable; none of the planned 130 are approved/playable |
| 1,500 Latin lexemes by Chapter 90 | **GATE RED** | Planned cumulative budget is not verified course introduction |
| Approximately 3,000 by Chapter 130 | **GATE RED** | No auto-promotion; zero verified new-course introductions |
| Phase 3 runtime loader and state v5 migration | **NOT IMPLEMENTED** | Do not start on review branch |
| New recording/alignment, speaking, FSRS | **NOT IMPLEMENTED** | Existing imported audio modes retained; no inferred timing |
| Third-party PDFs, Ørberg MP3s, dictionaries, other bulk archives | **NOT INCLUDED BY DESIGN** | Source licences and owner privacy; do not place in Git |

## Tests and expectations

The `package.json` scripts run the Node unit/regression suite, lexical validators, strict grammar tests, paradigm fixtures, and Playwright file URL tests. On GitHub, see `.github/workflows/phase2-review-restoration.yml`.

The available confirmed successful workflow for pre-package branch commit `93336b55798c64fcd2213972f3714999f2ba3366`:
https://github.com/cosmiccopper29-svg/Latin-X/actions/runs/42034196756

This document and the other review packaging files are appended after that commit. **Do not attribute the earlier success to any later revision until its own workflow has completed.**

## Priority fixes for Claude

1. Recover, reconcile and test the standalone Phase 2 compiler source and its derived ledger against this branch; do not overwrite the editor.
2. Validate and correct provisional grammar feature IDs against all 130 chapter `grammar_focus` entries and the compiler's actual schema.
3. Audit the verb, noun, adjective patterns and macrons; fill the missing moods/tenses/forms; require actual reviewed sample paradigms before acceptance.
4. Verify CSV round trip and owner-signature behaviour (including owner-tier drafter≠reviewer and full source evidence).
5. Restore four historical provisional source comparison files exactly, only after inspecting `LATIN_X_COMPLETE_20261105.zip`.
6. Author Chapters 1–8 as **unapproved originals**, design exercises and exposures, obtain editorial signoffs, and only then compile real introductions.
7. Extend real browser/audio and Windows tests; preserve the original eight chapters and v4 local progress.
