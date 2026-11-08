# Phase 12 preparation — accessibility and long-profile safety audit

**Branch:** `feature/phase12-accessibility-migration-20261106`, parent `review/phase8-20261105` (`7173993`).  
**Status:** partial accessibility audit and automated regression preparation, NOT a complete accessibility certification or an owner hardware sign-off.

## What was checked and improved

- **Language:** learner reader and exercises use `lang="la"`; English interface stays `lang="en"`. Original lesson wording and labels are unchanged.
- **Landmarks:** the chapter navigation and learning guidance asides receive explicit accessible names.
- **Input names:** chapter notes, pasted Latin text, and corrected sentence boundaries receive actual `<label for>` elements. Because the legacy reader dynamically replaces its panels, a small **additive** `app/80-accessibility.js` classic script re-applies these labels after renders. It never reads or writes saved progress.
- **Result updates:** existing `role="status"` and `aria-live="polite"` patterns retained. Do not claim an actual screen-reader announcement until tested with NVDA/JAWS/VoiceOver.
- **Keyboard and motion:** existing focus-visible rules and reduced-motion override retained.
- **Colour:** automated WCAG 2 contrast sampling for eight common body ink/paper token combinations found all sampled pairs >=4.5:1. This does not prove contrast on every element or over semi-transparent backgrounds, hover states, artwork, or disabled content.
- **Image alternatives:** the signed-only illustration renderer already requires Latin and English alternatives, and all unapproved scenes still use the SVG fallback.
- **Historical source lock:** all original eight playable lessons and `app/legacy-runtime.js` remain unchanged. The strict Phase3b HTML lock now explicitly permits **only one additional enumerated classic script**. No modules, fetch, server or CDN.

## Long profile, synthetic only

`tests/phase12-long-profile.test.cjs` simulates an old v4 profile with 160 notes, 820 unreviewed vocabulary cards, 100 user-corrected sentence splits, 64 hint states, imported Latin, macrons and unknown extra fields. Tests enforce raw v4 byte identity, exact snapshot, idempotent reopening, v5 backup round-trip, fail-closed corrupt v5 and no artificial truncation. The test is entirely synthetic; no owner's real profile was accessed or committed.

## Automated commands

- `npm test` — old suite plus two new Phase12 tests.
- `npm run test:phase12` — Node/static + long-used-profile regression.
- `npm run test:phase12-browser` — requires Playwright 1.64.1 / real browser, checks live generated labels, Latin, status and no network through `file://`.
- Windows GitHub Actions matrix: Playwright Chromium, installed Chrome, installed Edge and Playwright Firefox (a hosted Windows runner, not the owner's computer).

## Manual audit still required

- Complete each exercise type with keyboard only in each browser; check focus after dynamic rerenders.
- NVDA with Firefox/Edge (ideally JAWS too): spoken `lang=la`, exercise feedback, word lookup and picture regions.
- Zoom 200/400%, long text, font resizing and reduced-motion preferences.
- Verify full contrast of real controls, placeholders, states and overlays (not just eight token pairs).
- Test voice, imported local audio, microphone and file storage persistence on a real offline Windows 10/11 machine; test moving folders and backups.
- Apply WCAG 2.2 AA review findings separately. This report is *not* an AA conformance claim.

## Content and owner gate

128 legacy vocabulary candidates, 15 paradigm tables, eight pilot chapters and the character sheet + 9 scene images remain unsigned. Never publish or sign in code. Strict 1,500/3,000 introduced-lexeme checks must remain RED.