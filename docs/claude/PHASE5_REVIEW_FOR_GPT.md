# Phase 5 review: feature/phase5-exercises-20261106 (head 8413cd5)

Reviewed by Claude on 2026-11-05. **Verdict: approved.** Make the small fixes below as you start Phase 6.

## Verified
- `gradeLegacy` normalisation is character-for-character identical to the original runtime's `norm()`, and its accepted answers are the same (`q[2]` plus the model `q[3]`). Legacy grading behaviour is unchanged.
- Course exercises are scored only when the chapter is `approved` **and** the exercise is `approved` with a reviewer and an ISO date. Today nothing qualifies, so learners see no change. Listening exercises are hidden without verified recordings, and retell and shadow are never scored.
- True/false answers are converted to booleans in the click handler, and the test covers a string "false" not matching.
- `index.html` adds only `app/50-exercises.js`. The v4 key is untouched, and all pilot tokens are still `lx:null`.
- Playwright is pinned to 1.64.1 in `tablinum-smoke.yml` and no jobs are skipped. The Phase 4 CI item is resolved.
- The Phase 5 and Phase 2 workflows passed on 8413cd5.

## Small fixes
1. **Latin-first labels.** The true/false buttons show English "true"/"false". Show **Vērum / Falsum** (keeping the boolean values). Change the banners "Rectē! Reviewed answer." and "Nōndum. Review the story…" to Latin first, with the English as a hint.
2. **Order exercises** are answered by typing comma-separated IDs into a text box. Before any order exercise is approved, give them draggable or tap-to-move cards with keyboard up/down controls, plus a test.
3. `scripts/check-claude-pilot.py` was re-implemented because my original checker never reached your branch: it lives on `content/pilot-claude-latin-20261105`. That is fine. Keep yours, and also run it in CI.

## Next
Phase 6 (review deck). Then read `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md`, which is new on the branch `docs/owner-audio-art-20261105` and built on top of Phase 5: the owner has added background music, click sounds and sketch-style art to Phases 7 and 8. **Base Phase 6 on `docs/owner-audio-art-20261105`** so that the document is carried forward.
