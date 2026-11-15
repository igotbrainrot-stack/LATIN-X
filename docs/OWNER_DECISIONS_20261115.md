# Decisions taken on the owner's behalf, 15 November 2026

On 15 November the owner was given the list of open decisions and answered: "make your best
judgments on all of these and proceed". This file records each judgment, the reason, and what was
left untouched. Any of them can be reversed; the commit that applies them is on branch
`chore/owner-decisions-20261115`.

| Item | Decision | Reason |
| --- | --- | --- |
| 58 Chapter II–VIII Arjun recordings | **Left as "awaiting review".** Not approved, not rejected. | Approval means someone has listened and compared each take with the listening sheet (`pronunciation/CLASSICAL_PRONUNCIATION_STANDARD.md`: "a text check or a checksum is not a listening check"). That could not be done here. A technical check was run instead (below). The recordings still play and stay labelled as awaiting review. |
| "Recordātiō incepta" (LX-015, U-06) | **Latin dropped.** The message is now "Recording started; no scoring." | *Recordātiō* means "recollection". There is no Classical word for an audio recording, and the audit's stated default is to keep the English rather than invent Neo-Latin. |
| LX-020 text-to-speech respellings | **Declined.** No change. | They are inputs for recordings that already exist. Changing them only matters if the recordings are regenerated, which is not being done. |
| LX-021 explanation of *-t* in Chapter IV | **Declined for now.** | Optional and stylistic. The sentence is in the locked published lesson text; the present wording is narrow, not wrong. |
| LX-022 *vīlla* = "house" | **Declined.** | The audit calls it a valid beginner simplification. The gloss is also used by the meaning exercises, so changing it changes an answer key. |
| LX-023 distractors from later chapters | **Declined.** | The audit says it is not an error. |
| LX-024 pilot Chapter 8 margin note | **Declined for now.** | It is in the unpublished draft pilot, which learners do not see and which needs a full review anyway. |
| LX-025 "I · Hortus" in the course guide | **Applied:** "I · In hortō". | Matches the chapter title used everywhere else. `scripts/lib/latin-corpus.cjs` and the pronunciation lexicon were regenerated to match. |
| Picture labels such as `arbor-magna` | **Hyphens replaced with spaces** on screen ("arbor magna"), marked as Latin. | The words are the approved region names; only the separator changed. No new Latin was written and the internal ids are unchanged. |
| Status phrases | **Reworded in plain English**, keeping the meaning. "…separated from unsigned legacy free cards" is now "Words you saved in the eight lessons are kept apart from reviewed course words, because their entries have not been checked by the course owner yet." "Legacy saved words: N (not automatically owner-approved)" is now "Words you saved in the lessons: N (their entries are not yet checked by the course owner)." Picture Practice now says "These picture prompts are a draft and have not been checked yet" and "The answers are a draft and not yet checked; no score is saved." | Learners should not have to read project jargon. Each sentence still says the material is unchecked. |
| Footer | "Version 0.5.0 review build · Latin content is unreviewed original draft material · No copyrighted textbook included." | "Manuscript Edition" named the previous design. "Review build" and the unreviewed-content statement stay, because the Latin and most recordings are still unreviewed. |
| Version | **0.4.2 → 0.5.0** (`package.json`, footer, Settings > About, installer names). | New interface, Home, Settings, glossary, dark theme and installers are a feature release, not a patch. Saved data is unchanged, so it is not 1.0. |
| Code-signing certificate | **Not bought.** | It costs money and needs the owner's identity. The `.exe` stays unsigned; `packaging/README.md` says where to add signing. |
| Merge order | #14, #17, #15, #16, #18, #19, #20, #21, then this branch, each as a merge commit. Drafts #12 and #1 left open. | Each later branch already contains the earlier ones, so merging in this order keeps every pull request's own history. #12 and #1 are drafts that are not part of the tested line. |

## Technical check of the 58 pending recordings

Not a listening check. Each file was decoded with ffmpeg and measured.

- All 58 decode without error and match their pinned SHA-256 (`npm run test:narration`).
- Speaking rate is between 0.24 and 0.55 seconds per syllable (median 0.39), so none is cut short or padded with long silence.
- Average loudness is between −18.5 and −13.3 dB; the highest peak is −0.7 dB, so none clips and none is very quiet.
- No file is mostly silence.

What this cannot show: whether vowel lengths, stress and consonants are right. That still needs ears.

## Still only possible on real machines

Installing on a real Windows 11 PC and a real Linux Mint desktop, a screen-reader pass (NVDA,
Orca), and a run in Firefox. CI installs every installer on `windows-latest` and `ubuntu-latest`,
and the axe audit and keyboard tests pass in Chromium; these are the closest substitutes available.
