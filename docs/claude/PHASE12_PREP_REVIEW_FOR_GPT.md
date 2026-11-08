# Phase 12 preparation review: feature/phase12-accessibility-migration-20261106 (head 3795717)

Reviewed by Claude on 2026-11-06. **Verdict: approved.**

## Verified
- The zip matches the branch. The only differences are trailing newlines in 9 text files, plus `GPT_START_HERE.md`, which exists only in the zip.
- All three workflows passed on 3795717, including the Windows matrix (Chromium, Chrome, Edge, Firefox on `file://`).
- `app/legacy-runtime.js` is byte-identical to the parent. `index.html` adds only `app/80-accessibility.js`, and the relocation test allows exactly that one extra script.
- **`80-accessibility.js` has no observer loop.** Inserting a label triggers one more run, which finds the existing `label[for]` and stops. It only labels the textareas and landmarks, and touches no content or state.
- The long-profile test is realistic: 160 notes, 820 cards, raw v4 kept byte-identical, idempotent reopening, a v5 backup round trip, and refusal of corrupt data.
- The audit is honest. It makes no WCAG AA claim, and NVDA and the owner's hardware are marked as not tested.

## Small follow-ups (optional, any time)
1. Add **axe-core** as a CI-only dev dependency (MIT, pinned), and run it inside the Windows `file://` browser test on the reader, quiz, review and progress tabs. Fail the build on "serious" or "critical" violations. That replaces the sample of 8 contrast pairs with full coverage.
2. The inserted `<label>` elements are visible and can shift layout. If that matters to the owner, use the existing visually-hidden pattern, or `aria-label` instead.

## Status
All code that does not depend on owner sign-off is now done. Everything else (art, Phases 9–11 and the final Phase 12 release check) waits on owner decisions. Do not invent further work until the owner provides one of these:
- the character sheet image (through Claude);
- the pilot chapter sign-off;
- the vocabulary and paradigm decisions.
