# LATIN X — Phase 2 foundation, test results (2026-11-05)

Verified locally with Node v22.16.0:

- **PASS** `npm test` (includes original reader/progress, Phase 1 review and new compiler regression fixtures).
- **PASS** `npm run test:lexemes` (unaltered 128-row source review readiness, maps and lexeme schema).
- **PASS** `npm run test:phase2` (source conversion snapshot, 130-row plan sync, deterministic compiler, synthetic negative tests).
- **PASS** `node curriculum/validate-roadmap-130.cjs`.
- **PASS** `node curriculum/validate-outline-v3.cjs`.
- **EXPECTED FAIL** `node scripts/validate-lexemes.cjs --require-review-ready` — 128 candidates still need true signed decisions.
- **EXPECTED FAIL** `node curriculum/validate-roadmap-130.cjs --require-introduced-1500` — 0 approved new-course lexical introductions.
- **EXPECTED FAIL** `node curriculum/validate-roadmap-130.cjs --require-introduced-3000` — 0 approved new-course lexical introductions.
- **NOT RUN** Playwright browser/`file://` visual and audio smoke tests: Playwright module not installed here. Earlier baseline test coverage is not evidence of a new real-browser run.

Original `index.html` SHA-256 in both input ZIP and this updated package: `8bcd065a868a8c0236f3a9ba7a7c28cba8dc5040035f948dc9d17ad4bf1ed9ac`.

**Shipping status:** same eight runnable chapters as input; one additional authored-lesson **blank draft**, zero new approved chapters, no runtime/progress migration, no auto approvals.
