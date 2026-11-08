# Phase 3c review: feature/phase3c-state-migration-20261106 (head f9bc3a4)

Reviewed by Claude on 2026-11-05. The uploaded zip is byte-identical to the pushed branch. All three workflows passed on head f9bc3a4.
**Verdict: approved for the core migration. Fix the two small bugs below on top of this branch before Phase 4, or as the first commit of Phase 4.**

## Verified
- The old key `tablinum-source-review-v02` is never written. The only `setItem` calls go to `tablinum-state-v5` and to `tablinum-v4-snapshot`, and the snapshot is written only when it is absent and holds the exact raw v4 string.
- The migration runs only when v5 is absent. A corrupt v5 file is left in place in "blocked" mode and nothing is overwritten. Missing content puts the app in "content_missing" mode with no writes.
- The startup `save()` has been removed, and `save()` refuses to write while `Tablinum.errors` is non-empty. This fixes 3b review item 1.
- Course-chapter notes and selections now go to v5 under stable IDs. This fixes 3b item 2.
- The deep-freeze of `legacy_source` fixes 3b item 3.
- The 100-note cap and the text truncations in `normalizeState` are gone. There is a 3 MB warning, quota-error log trimming, and an in-memory fallback.
- Restore accepts the v4 export format (`app:"tablinum", version:4`) and v2 (`tablinum-v02`) through `migrateV4toV5`, and v5 through `validV5`.
- Unmapped vocabulary goes to `deck.legacyCards`. Only `status==="approved"` vocab-map rows become `deck.cards`, and there are none today, which is correct.

## Bugs to fix
1. **The course-chapter regex never matches.** `app/legacy-runtime.js:566` reads `/^b0[1-3]-c\\d{3}$/`. Inside a regex literal, `\\d` means a literal backslash followed by "d". As a result, a saved course chapter is never reopened after a reload. Change it to `/^b0[1-3]-c\d{3}$/`. Add a browser test that saves on a synthetic approved course chapter, reloads, and asserts that the same chapter is reopened. No test currently covers this.
2. **Re-migrate has no error handling.** In the `case"remigrateV4"` handler, `JSON.parse(raw)` and `storage.setItem(SNAPSHOT, raw)` are not wrapped in try/catch. "Blocked" mode is also used when the v4 data itself is unreadable, so in that case the button throws silently. Wrap both calls and show a banner such as "Original v4 data is unreadable; restore a backup." In addition, the blocked-mode note always says "A saved v5 profile could not be read", even when the v4 data is the problem. Show `boot.warning` instead.

## Minor, latent (no approved lexemes yet; fix in Phase 6 FSRS at the latest)
3. `updateFromLegacy` calls `migrateV4toV5(state, idMap, null)`. That means every `o.vocab` entry, including the projections of approved `deck.cards` made by `legacyView`, gets written back into `deck.legacyCards`. As a result, approved cards are duplicated as legacy cards, and deleting a card in the old UI never removes it from `deck.cards`. Pass the vocab map, or skip keys that came from `deck.cards`.
4. `persist` detects a full quota only by `error.name==="QuotaExceededError"`. Also accept `NS_ERROR_DOM_QUOTA_REACHED` and `code===22`.

## Next
Phase 4: the pilot, chapters 1–8, as specified in GPT_HANDOVER_NEXT_PHASES.md §5. Use the two-pass method. Chapters stay draft until the owner signs them. Do not merge to main.
