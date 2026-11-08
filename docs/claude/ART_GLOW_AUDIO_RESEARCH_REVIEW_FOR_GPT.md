# Claude review: overlap grading, glow, main-reader art, new watercolour art, Runway Latin audio research

**Reviewed:** owner ZIP `LATIN_X_RUNWAY_LATIN_PRONUNCIATION_RESEARCH_COMPLETE_CLAUDE_20261107.zip` (no GitHub branch was pushed for this work).
**Review branch:** `review/art-glow-audio-research-20261107`, built on `review/picture-exercises-20261107` (2340ec2). Build on it.

## What is good
- **Overlap grading:** implemented as asked. A click is correct when it is inside the answer's polygon (`65-picture-practice.js`), and the highlight still uses the smallest region. Scoring stays off for unsigned items.
- **Glow highlight and main-reader art:** `app/legacy-runtime.js` and `index.html` are byte-identical. My two Latin fixes and the browser-test fix from the last review were kept.
- **New art:** the nine regenerated watercolour scenes are 1200 px wide, with transparent edges and under 250 KiB. I overlaid every polygon on the new pictures; all 44 regions still sit on the right subject. Small notes, no change needed: c002 no longer leaves open space on the right for a family tree, and in c005 Līvia now holds a drawing on a sheet.
- **Tests:** `npm test`, `test:pilot`, `test:picture`, `test:art`, `test:music`, `test:package`, `test:phase12`, `test:regions` pass on this branch. `tests/legacy-main-art-browser.test.cjs` passes in real Chromium. The axe scan has no serious or critical findings.

## Fixed on this branch
- `tests/art-replacement-regions.test.cjs` required the 34 MB of source PNGs in `CLAUDE_HANDOVER/`. Source PNGs stay outside Git, so the PNG hash check now runs only when that folder is present. The small provenance JSONs and rollback WebPs the test needs are committed under `CLAUDE_HANDOVER/`.

## For you to fix (stale browser tests; your sandbox cannot run them, mine can)
1. `tests/phase8-picture-practice-browser.test.cjs` still expects the old polygon stroke `#633724`; the glow now leaves the stroke as `none`. Assert the glow instead: for example, the selected polygon's filter or fill, as `strong-glow-highlight.test.cjs` does in Node.
2. `tests/phase8-art-browser.test.cjs` still asserts "No unsigned picture may be shown" in the main reader (it finds 1). The main reader now shows the approved Book I art on purpose, so update it: approved scenes shown, SVG fallback only on load error.
3. Move test inputs out of `CLAUDE_HANDOVER/` into `docs/art/provenance/` so the test suite never depends on a handover folder.

## Approval records
The owner approved the nine new pictures on 2026-11-07 (decision card). Claude recorded it: each scene has a new `approval` and keeps the 6 November one in `approval_history`. Do not edit approvals yourself.

## Runway Latin audio research: approved, with these additions
The report is careful and right on the main points: restored Classical pronunciation, `la` is not a supported language code, separate `display_text` and `speech_input`, no SSML breaks on v3/v4, real timings only, per-sentence clips. Add these to the audition checklist:
- **"Hic est"** (legacy-ch01-s001) is a good first test: classical *hic* before a vowel was pronounced with a doubled c (*hicc est*).
- **Elision and final -m:** for a beginner reader, use **no elision** across words and a **light final -m**. State this convention in the audio metadata, so every clip follows it.
- **Italian or Spanish voices** tend to soften c and g before e and i (Ecclesiastical habits). Reject a voice that says *cēna* with "ch" or *Gāius* with soft g; add *pecūnia*, *Gāī* and *cibus* to the test words.
- **Who reviews:** no Latinist is available, so audition review is owner tier. Claude cannot listen to audio. Give the owner a short side-by-side page per clip: the Latin text, the IPA candidates and the checklist, so they can tick each item.
- **Audition on legacy ch01 is fine.** Do not generate production audio for the Book I pilot chapters until the owner signs their text, or the clips may need redoing.
- Fix the typo "Lituanist" → "Latinist" in `RUNWAY_LATIN_PRONUNCIATION_RESEARCH.md`.

## Next
1. The three test fixes above.
2. When the owner's Runway plan is upgraded: the two-voice audition as the report describes, with the additions above. No app integration until the owner picks a voice.
3. Phases 9–11 stay blocked until the owner signs the 8 pilot chapters.
