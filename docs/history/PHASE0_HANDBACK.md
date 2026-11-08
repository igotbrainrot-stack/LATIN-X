# LATIN X — Phase 0 handback (complete code and safety net)

**Branch:** `test/phase0-safety-net`  
**Source:** `feature/legacy-lexeme-audit-20261105` (direct continuation; no merge)  
**Roadmap:** [CLAUDE_IMPLEMENTATION_ROADMAP.md](../../CLAUDE_IMPLEMENTATION_ROADMAP.md) §12 (owner-supplied).  
**Running program:** `index.html` — **byte-identical** v0.4.2 Manuscript Edition.  
**Status:** Phase 0 automated tests implemented and verified in Linux/Windows GitHub Actions; manual owner Windows checklist outstanding.

## Pass 1 — implementation and testing

The following files were added:

- `tests/fixtures/v4/{empty,midcourse,custom,hostile,at-caps}.json`, plus `tests/fixtures/backups/v2-envelope.json` — synthetic regression inputs, no private learner content;
- `tests/helpers/legacy-app-harness.cjs` — DOM/FileReader/Blob test harness for the unchanged app;
- `tests/backup-compat.test.cjs` — checks valid saved fields, malicious input, old backup restore, and export→restore→export;
- `tests/legacy-content-lock.test.cjs` and `tests/fixtures/legacy-content-contract.json` — freeze the exact eight lesson payloads, sentence fingerprints, answer choices/variants, cloze contents and glossary;
- `tests/file-url-smoke.cjs` — real local `file://` test with Playwright for quiz persistence and backup restore, on Chromium and Windows Edge;
- `scripts/lib/extract-legacy.cjs` — shared bounded original lesson array extraction;
- `Start Tablinum.cmd` and `.gitattributes` — optional Windows double-click launcher and checkout line endings;
- `docs/WINDOWS_OFFLINE_CHECK.md` and [PHASE0_RESULTS.md](../PHASE0_RESULTS.md) — manual and automated evidence;
- `CLAUDE_IMPLEMENTATION_ROADMAP.md` — archived complete user-supplied plan in the same package.

Modified only `scripts/build-legacy-lexeme-audit.cjs` (imports the shared extractor; output remains byte-identical), `tests/`, `package.json` and CI workflow. **No application code, lesson text, progress data, or actual vocabulary ledger was changed.**

Two mistaken *test assumptions*, not application defects, were found by the first CI runs and corrected: (1) a valid state does not necessarily change bytes when startup normalises; (2) clicking the Progress tab changes the exported `tab` field. Regression assertions now check the correct semantics without weakening data-preservation expectations.

## Pass 2 — independent review and fixes

Re-examined the Phase 0 acceptance criteria and discovered that preserving *question prompts only* would not protect correct-answer keys during a future legacy-data migration. Added and tested immutable fingerprints for **the entire eight chapter payloads**, question answer/options, all eight cloze items and the shared glossary, plus a **full original HTML SHA-1** guard.

Strengthened automated CI to run the reproducible lexical snapshots on **both Linux and Windows**, the HTTP and local-file browser routes, and both honest `1500`/`3000` curriculum gates. Browser tests log exact Node, Playwright and browser versions to their workflow output.

**Pass 2 result:** Linux and Windows Node checks, Linux Chromium HTTP and file-path checks, Windows Chromium and Windows Edge file-path tests completed successfully. Details: [PHASE0_RESULTS.md](../PHASE0_RESULTS.md). No physical Windows 10/11 manual check is claimed.

## Known issue carried forward

The current app's v4 `normalizeState` imposes a **100-note cap**, which can drop data. This is documented by a *passing regression test*, deliberately **not fixed in this tests-only phase**. The future v5 migration must eliminate silent truncation and must never discard users' earlier v4 backup.

## For the next coding AI

**Next phase is Phase 1 from the uploaded roadmap:** author a *reviewable*, sense-aware Latin lexeme registry, lexical review CSV, stable `legacy-vocab-map.json`, and candidate mapping, while keeping the introduction ledger at **zero** until actual lessons have been approved. Work on a **single new branch on top of this Phase 0 branch**, not `main`. Two passes per phase; no releases/merges. Human verification is required before a candidate is marked approved.

**Deliver the complete runnable repository archive ZIP** with the code, docs and new tests at every handover. Do not send only this handover.
