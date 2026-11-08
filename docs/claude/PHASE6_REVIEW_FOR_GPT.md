# Phase 6 review: feature/phase6-fsrs-owner-audio-20261106 (head 7346318)

Reviewed by Claude on 2026-11-05. The zip is byte-identical to the pushed branch. All three workflows passed on 7346318.
**Verdict: approved, with one real fix (item 1) to make at the start of Phase 7.**

## Verified
- `vendor/ts-fsrs.umd.js` is **genuine**. Its SHA-256 (59b74441…176b) equals `dist/index.umd.js` from the npm `ts-fsrs@5.4.2` tarball, which I downloaded and compared myself. The LICENSE file is byte-identical to the package's MIT licence.
- `index.html` adds only the vendor script and `app/55-review-deck.js`, and both are classic scripts.
- `updateFromLegacy` now merges into `legacyCards` (`{...old, ...card}`), so FSRS fields survive every save. Deleting a word in the old UI still removes it.
- Legacy cards stay in `legacyCards` and are never promoted to lexeme IDs. New-course cards are created only for approved lexemes in approved chapters that have been marked read. Today that is zero.
- The four counters (introduced, encountered, recognised, productive) count only approved lexemes, and legacy saved words are shown separately.
- The Phase 5 fixes are done: Vērum/Falsum labels, Latin-first feedback, and order cards with drag, ↑/↓ buttons and keyboard support.

## 1. Fix: the first FSRS rating resets legacy intervals (affects the owner's real progress)
`hydrate()` returns `createEmptyCard(now)` for any card without `fsrs`. A legacy word the owner had pushed out to, say, a 30-day interval becomes a **New** card. Rating it "Good" then schedules it minutes or a day ahead, so every saved word restarts from zero on its first review.
**Fix:** when `!raw.fsrs && raw.reps > 0 && raw.days >= 1`, seed a Review-state card instead:
```js
const due=new Date(Number(raw.due)||now), days=Math.max(1,Number(raw.days));
return {...lib.createEmptyCard(new Date(now)), state:lib.State.Review, stability:days, difficulty:5,
  due, last_review:new Date(due.getTime()-days*86400000), scheduled_days:Math.round(days),
  reps:Number(raw.reps)||1, lapses:0};
```
Keep the `createEmptyCard` path for `reps===0`. Add tests: a legacy card with `days:30` rated Good must come back **more than 30 days** later, and the same card rated Again must lapse to a short interval.

## 2. Small fixes
- **Daily limits are not enforced.** `dueCards()` ignores `newDaily`/`reviewDaily`. Cap the queue: new cards (`fsrs.state===New` or no `fsrs`) up to `newDaily` per local day, and reviews up to `reviewDaily`. Count from `deck.log` entries for today.
- **Exposure is counted only when moving away from a sentence**, so the last sentence of a chapter is never counted. Also count the current sentence when "Mark chapter read" is pressed.
- **The review heading is English** ("Vocabulary review", "Saved", "Due"). Make it Latin-first, like the rest of the app (e.g. *Memoria: verba repetenda*).

## Next
Phase 7 (audio, background music and click sounds, per `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md` A and B), starting with fix 1. Phase 8 (sketch art) can run in parallel.
