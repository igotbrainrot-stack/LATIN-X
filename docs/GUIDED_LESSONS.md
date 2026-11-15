# Guided lessons and word checks

Added 11 November 2026. Applies to the eight chapters of Liber prīmus.

## The method

A lesson is three steps, always in this order, and the path bar at the top of Lēctiō and Exercitia names the next one.

1. **Read the story.** No word list comes first. The learner meets each word in a sentence, with the existing clues, glosses and audio. After every third sentence and after the last, a word check asks the meaning of one word that has just been read, with its sentence shown and the word marked.
2. **Answer the questions.** The existing comprehension questions and the cloze, unchanged.
3. **Chapter word check.** Up to six words of the chapter and two from earlier chapters. Half the questions give the Latin and ask the meaning; half give the meaning and ask the Latin. 80% completes the lesson. A new attempt draws a new set.

Words answered wrongly are asked first in the next chapter word check, and earlier-chapter words answered wrongly take the two review places in later chapters. Prōgressus shows where to continue and how many words are known, to revisit, or not yet tested.

Nothing is locked. A learner can read ahead or open any chapter; the path only shows what is still open. Memoria (spaced review of saved words) is unchanged and optional.

## What a word check may and may not ask

- The program writes no Latin. Questions use the chapter word lists, their glosses and the story sentences as they stand.
- Each question takes one answer. The right meaning is then shown.
- Wrong choices are other glossary entries. A choice is never offered if it could also be right: another form of the same word (from the form notes), a gloss that shares an English word, or a listed near-synonym (house/home, see/watch, carry/bring and so on, in `app/56-word-checks.js`).
- Entries whose gloss has no content word (for example *est*, "to be") are not asked.
- When the word in the sentence is an inflected form, the question says so and asks for the dictionary meaning: "*habitat* is a form of *habitāre*. What does *habitāre* mean?" It does not claim a tense or case.
- Questions are deterministic: the same chapter, word and attempt give the same question.

`tests/word-checks.test.cjs` builds every story check and three attempts of every chapter test and asserts these rules. `tests/guided-lessons-browser.test.cjs` walks one lesson in the browser.

## Limits

- The glosses are the existing legacy glossary. They have not had a separate Latinist review for use as test answers.
- The near-synonym list was written by Claude from the 97 glosses in use. A new chapter needs it looked at again.
- A word check tests recognition of a dictionary meaning. It does not test inflection, and passing it is not a claim that the learner can read unseen Latin.

## Storage

Answers are kept in `learning` beside the v5 state fields, so they are saved, exported in backups, restored and cleared by "Reset progress" with everything else. `TablinumWordChecks.normalise` cleans the stored value on load.
