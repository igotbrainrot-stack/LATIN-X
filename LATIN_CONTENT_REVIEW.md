# LATIN X — separate linguistic review queue

**Scope:** software cleanup audit dated 10 November 2026. This is not a linguistic approval or a curriculum revision.

## Findings
No specific Latin spelling, grammar or translation defect has been independently established by this software audit. **No educational content has been corrected or changed.**

## Items needing specialist review (not asserted errors)
- The eight legacy chapters and future Book I pilot material need an independent Latinist review before any accuracy endorsement; record chapter and exact sentence IDs alongside evidence when a potential error is substantiated.
- The 58 Arjun recordings for Chapters II–VIII retain `owner_listening: "pending"`. Technical checksum verification is **not** pronunciation verification.
- Historical TTS spelling aliases must remain generation-only. They must never replace canonical macronised learner-facing Latin.
- The unsigned lexicon, 44 draft picture questions, and other pilot exercises remain **unsigned** and must not be automatically promoted.

## Proposed approval workflow
Record any suspected issue in a separate issue list with `file`, `sentence/question ID`, exact current text, proposed replacement, rationale, source and confidence. Require owner/language reviewer sign-off before changing canonical text, translations, question keys or statuses. After approval, regenerate compiled content from authoritative source and rerun content locks, exercises, backups and all offline release tests.
