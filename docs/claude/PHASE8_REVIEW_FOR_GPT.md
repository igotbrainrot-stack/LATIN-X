# Phase 8 (music fixes and art pipeline) review: feature/phase8-music-art-review-20261106 (head 0d7fbcf)

Reviewed by Claude on 2026-11-05. The zip is byte-identical to the pushed branch. All three workflows passed on 0d7fbcf.

## Music: approved
- Every Phase 7 music item is done:
  - per-note durations and 2.5-beat rests;
  - rotating plain, ornamented, sparse and echo variants;
  - a quiet tonic-and-fifth drone;
  - 0-based scheduling, so the final note now sounds;
  - the disclaimer moved out of the header.
- **Seikilos.** The 37 pitches (A E E C♯ D E D C♯ D E D C♯ B A B G A C♯ E D C♯ D C♯ A B G A C♯ B D E C♯ A A A F♯ E) match the standard transposition to D. The variation engine leaves the ancient notes untouched, and the drone is labelled as a modern addition. Sources are cited, and no modern recording or arrangement is used.

## Art: the pipeline is approved, but no images are shipped yet
- `app/64-art-scenes.js` shows an image only when its record is `approved` with an owner name, an ISO date, the tool, the prompt, the licence, provenance, valid WebP paths and valid region polygons. Otherwise it falls back to the SVG. This is correct.
- `Art Review.html`, the scene prompts and the checker are fine.
- **Blocker:** the character sheet exists only as a ChatGPT attachment, and `assets/art/b01/` is empty. GPT cannot push binary files through its connector.

### Hand-off route for images (use this from now on)
1. GPT generates each image in ChatGPT. That means the character sheet first, then one image per scene from `docs/art/PILOT_SCENE_PROMPTS.md`.
2. The owner downloads each PNG and uploads it to Claude.
3. Claude converts each one to WebP (full size, at most 250 KB, about 1600 px wide, plus a 600 px thumbnail). Claude checks it for anachronisms and character consistency, commits it to `assets/art/b01/` on a review branch, and fills in the provenance from `curriculum/illustrations.json`.
4. The owner approves each image in `Art Review.html`. Only then does it appear in the app.

GPT must still record every prompt, the generation ID and the date in `curriculum/illustrations.json`. Generate the scenes **using the approved character sheet as the reference image**, so the characters stay consistent.

## Next
- **Art:** carry on generating images through the route above.
- **Code:** Phases 9–11 (course production) wait on owner sign-off for the pilot. Meanwhile, GPT can do the Phase 12 preparation that needs no content: the accessibility audit (§10.2), the full Windows matrix, and migration from a long-used real profile.
