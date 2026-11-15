# Play layer: word games and flourishes

Added 11 November 2026. Code: `app/57-play.js`, `app/styles/tablinum-play.css`. Test: `tests/play-browser.test.cjs` (`npm run test:play-browser`, part of `test:browser-all`).

## Word games

A "Word games" card sits under the chapter list (under the word panel on a phone). Each game opens in a dialog over the page and closes with ✕, Escape or a click outside.

| Game | What the learner does | Score kept |
|---|---|---|
| Pairs | Turns over twelve cards to match six Latin words with their meanings. | Fewest turns |
| Letter tiles | Sees a meaning and builds the Latin word from shuffled letters. Six words. "Show the word" reveals one without scoring it. | Words built without help |
| Quick fire | 40 seconds of three-choice questions, in both directions. | Most right |

Rules the games follow:

- They write no Latin. Every word and meaning comes from the chapter word lists through `TablinumWordChecks`, limited to chapters 1 to the one that is open.
- No two choices on screen could both be right. Pairs and Letter tiles draw sets of words whose meanings do not overlap; Quick fire uses the same question builder as the word checks.
- They are play. A game never changes lesson progress or word knowledge. Only the best score per game is stored, under its own key `tablinum-play-v1`, which is not part of the progress backup.
- With fewer than eight usable words the card is shown but its buttons are disabled.

## Flourishes

- **Edges.** A Greek-key band runs along the top edge (inside the section tabs, so it stays in view) and the bottom edge of the page. It slides into place when the page opens. When an answer is checked a light runs along it: gold for right, a dull red for wrong.
- **Leaves.** A right answer throws ten laurel leaves from the answer. They are removed after about a second.
- **Stamp.** A lesson step that has just been completed is stamped in the path bar, once.
- **Pen stroke.** A looked-up word is underlined as if by a pen.
- **Wreath.** Completing the third step of a lesson opens a dialog with a laurel wreath that grows leaf by leaf, the result, and a button to the next chapter.

All of it runs once per event and is switched off under `prefers-reduced-motion`; the leaves are not created at all in that case. The wording uses no new Latin.
