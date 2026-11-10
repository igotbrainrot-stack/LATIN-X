# Tablinum feature inventory (8 November 2026)

Used as the regression checklist for the polish pass. "Automated" names the test that exercises the feature in a real browser (B) or in Node (N). Status after the pass: every feature below is **present and unchanged in behaviour** unless the Notes column says otherwise.

| Area | Feature | Where | Automated | Notes |
|---|---|---|---|---|
| Shell | Four study tabs (Lectiō, Exercitia, Memoria, Progressus) | `legacy-runtime.js` `tabs()` | B browser-smoke, release-package | **Bibliothēca removed** at owner request (8 Nov); a saved Library tab opens Lectiō |
| Shell | Chapter index (8 legacy chapters), keyboard focus restore | `legacy-runtime.js` | B phase5-keyboard, release-package | |
| Shell | Status/live region (`#appStatus`) incl. backup reminder | runtime | B phase12-accessibility | |
| Reader | Sentence list, selected-sentence highlight, Arrow keys between words | runtime | N smoke, B phase5-keyboard | |
| Reader | Word lookup, "Save word" | runtime | N smoke | |
| Reader | Three-level Latin clue per sentence | runtime | N smoke | |
| Reader | Macrons on/off, Guidance on/off, Explain the grammar | runtime (help aside) | N smoke | |
| Reader | Personal notes per chapter (local) | runtime | N phase12-long-profile | |
| Reader | Approved watercolour scene with clickable regions + SVG fallback | `64-art-scenes.js` | B legacy-main-art-browser, phase8-art-browser | region chips restyled |
| Reader | Arjun sentence-click narration (9 Chapter I pass / 58 Chapters II–VIII pending), 7 Arjun words and labelled Miriam laeta fallback | `62-narration.js`, `content/narration.js` | N approved-narration | from the audio thread; untouched |
| Reader | Browser speech; playback of local audio attached before the removal | runtime | N smoke | attaching new local audio/timing was part of Bibliothēca and is **removed** |
| Reader | Vōx mea: record / stop / compare (ungraded) | `70-user-media.js` | B phase7b-browser | |
| Reader | Self-assessment (Need support / Getting there / Understood) | runtime | N smoke | |
| Dock | Prev / Play / Stop voice / (Alt take) / Next, mode + note | runtime | B browser-smoke | phone layout fixed |
| Exercitia | Original 24 MC/short questions with accepted variants; 8 guided cloze | runtime | N legacy-content-lock, smoke | |
| Exercitia | 15-type signed-only exercise engine (new course) | `50-exercises.js` | N exercise-engine, B phase5-keyboard | |
| Memoria | FSRS review deck (pinned ts-fsrs 5.4.2), daily caps | `55-review-deck.js`, `vendor/` | N phase6-fsrs, B phase6-browser | |
| ~~Bibliothēca~~ | Import .txt / paste text, sentence boundary editor | — | N smoke (handler) | **removed from UI** (owner request); a previously imported text still appears in the chapter list and can be removed from Progressus |
| ~~Bibliothēca~~ | Attach local audio + timing JSON | — | N phase7b-user-media (API) | **removed from UI**; existing audio can be removed from Progressus |
| Progressus | Export my recordings ZIP (moved from Bibliothēca) | `70-user-media.js` | B phase7b-browser | |
| ~~Bibliothēca~~ | Link to Art Review (owner tool) | — | — | link removed with the tab; open `Art Review.html` directly |
| Progressus | Ledger tiles, four vocabulary measures, course map | runtime | N smoke | tiles 4-up, map aligned |
| Progressus | Export backup JSON, restore v0.2/v4/v5 backups | `20-state-v5.js` | N backup-compat, migration | |
| Progressus | Reset progress (confirm) | runtime | N phase3c-review | |
| Progressus | Re-migrate from original v4 when v5 is unreadable | runtime | B phase3c-browser, phase3c-review-browser | test fixture repaired |
| Storage | v4 key immutable, v5 key, snapshot, quota handling | `20-state-v5.js` | N migration, phase12-long-profile | |
| Content | On-demand chapter loader, missing-file guidance | `30-content-loader.js` | N content-loader, B phase3b | |
| Sound | Three Roman MP3s, eight-second crossfades, narration ducking, WebAudio lyre fallback and separate controls | `60-audio-ambience.js`, `58-music-score.js` | N phase7a-audio, B phase7a-browser | header layout refined |
| First-run | Welcome guide, skip setting, course progression and Escape/focus controls | `app/welcome/` | B release-package | Introduced with Arjun release |
| Picture Practice | 9 scenes, 44 draft questions, polygon hit tests, never graded | `Picture Practice.html`, `65-picture-practice.js` | B phase8-picture-practice | palette aligned |
| Owner tools | Art Review, Vocabulary Review, Audio Audition, Miriam review pages, CSV validator | root `.html` / `.cmd` | B review-file-url, N owner-* | not in learner packages; unchanged |
| Accessibility | Landmarks, labels, Latin `lang`, focus rings, reduced motion | `80-accessibility.js` | B phase12-axe (0 violations of any level now) | dock region + heading level added |
