# Phase 7a/7b review: fix/phase6-reviewed-phase7b-20261106 (head 616cc1d)

Reviewed by Claude on 2026-11-05. The zip is byte-identical to the pushed branch. All three workflows passed on 616cc1d.
**Verdict: approved. The music works but needs a musical upgrade (section 2). Then go on to Phase 8.**

## 1. Verified
- **The Phase 6 fixes are correct.**
  - `hydrate()` seeds a Review-state card from the legacy `days`/`reps`/`due`, and the test requires that a 30-day card rated Good comes back after more than 30 days.
  - The daily limits are shared across both decks, counted by local day, and enforced inside `rate()`.
  - The last sentence is counted when the chapter is marked read.
  - The review screen is Latin-first.
- **Music and click sounds follow the spec.**
  - Nothing starts before a pointer or key gesture, and there are no audio files and no fetch.
  - Default music volume is 0.2, capped at 0.3.
  - The music ducks to 10% for an attached audio file and for browser speech (`legacy-runtime.js` lines 148, 156, 187, 574–577 and 845–847).
  - It stops while the microphone records (`70-user-media.js` lines 123/125/140), and it pauses when the tab is hidden.
  - Clicks are rate-limited to one per 60 ms. Correct, wrong and complete sounds are wired into all three answer paths.
  - Settings persist in v5 `ui.audio`.
- **User media.** It uses IndexedDB, with a 100 MB per-file limit and a memory fallback. Speaking is never scored, and there are no network APIs.

## 2. Music: make it sound like music, not a loop box
Each piece is **one 32-note phrase of equal-length notes, replayed 8 times verbatim** (only an octave lift on every 4th cycle). After a minute it will sound mechanical. That is the opposite of "calming", and a lyre player would never play this way. Please:
1. **Rhythm.** Give every note a duration (for example `durations:[2,1,1,2,…]` in steps), and end phrases on long notes. Add a breath (a rest) between phrases.
2. **Drone.** Add a quiet, sustained or slowly re-plucked low tonic plus fifth (kithara open strings) under the melody, at about 30% of the melody's gain.
3. **Variation, not repetition.** For each cycle, choose among 3–4 variants: an ornamented version (an upper or lower neighbour note on long notes), a sparse version (alternate notes plus rests), a version answered by an octave-up echo, and an alternate cadence. Avoid two identical cycles in a row.
4. **Use one real ancient melody.** Add the *Seikilos epitaph* (1st c. AD, public domain) as a fourth piece. Enter the pitches yourself from the ancient notation as given in standard scholarship (for example Pöhlmann & West, *Documents of Ancient Greek Music*, 2001, no. 23), and cite that source in `curriculum/music.json`. Do not copy any modern recording or arrangement. This is the one place where the music can be genuinely historical, which is what the owner asked for.
5. **Off-by-one bug.** In `schedule()`, `at=stream.start+(i-1)*step` and `noteFreq(p,i-1)`. For `i=0` the frequency is `NaN` (`degrees[-1]`) and the note is silently skipped, and the loop stops at `total-1`. As a result **the final tonic of every piece never sounds**. Use `i` instead of `i-1` in both places, and add a test that the last scheduled note is the final degree.
6. Remove the long line "Original lyre-inspired synthesis; historical reconstruction uncertain." from the header bar, which is cluttered on narrow windows. Put it in the progress or credits panel with `curriculum/music.json`.

## 3. Phase 8 status
Only the plan exists (`curriculum/illustrations.json`, with nine scene specs and an SVG fallback). That is fine. Phase 8 now needs the **character sheet first**, then the scenes, following `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md` section C. Each image stays a draft until the owner approves it.

## Next
Make the section 2 music fixes, then build Phase 8 (art). Do two passes, hand back the full ZIP, and push to one new branch built on `review/phase7-20261105`.
