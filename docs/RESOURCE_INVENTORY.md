# User-provided resource inventory

Source: conversation attachments through 5 November 2026. **53 uploaded files**, including apparent repeat uploads, the latest index.html, and all four Claude review documents. Most original third-party files are not included in this GitHub package; the two newest reviewer handover documents are archived in `curriculum/reviews/`. Filenames and sizes come from attachment metadata. Matching names do not establish identical bytes; check hashes and licences before integration.

| # | Uploaded filename | Size (MB) | Classification |
|---:|---|---:|---|
| 1 | selectaefabulaeaesopior_2401_librivox(2).zip | 203.96 | Audio / speech data |
| 2 | Building a Latin App with AI Data, Resources and Open-Source Building Blocks(1).docx | 0.01 | User reference / review |
| 3 | latin-macronizer-master(2).zip | 7.00 | Lexicon / Latin NLP |
| 4 | la_core_web_lg-3.9.8-py3-none-any(2).whl | 283.18 | Application example |
| 5 | whitakers_words-0.8.0(2).zip | 1.21 | Lexicon / Latin NLP |
| 6 | canonical-latinLit-0.0.33195683883(2).zip | 52.49 | Reading content |
| 7 | pg8997-images-3(2).epub | 0.18 | Reading content |
| 8 | lute-v3-3.10.3(2).zip | 1.15 | Application example |
| 9 | ClassicsReaderAndroid-3.0.0(2).zip | 41.29 | Application example |
| 10 | LibreLingo-lluis-v1.8.1(2).zip | 79.69 | Application example |
| 11 | wavesurfer.js-8.0.5.zip | 17.27 | Audio tooling / scheduling |
| 12 | latin-core-list.csv | 0.08 | Grammar / vocabulary |
| 13 | pg18251-images-3.epub | 1.17 | Reading content |
| 14 | latincy-readers-1.9.0.zip | 0.75 | Lexicon / Latin NLP |
| 15 | latincy-preprocess-0.5.1.zip | 0.37 | Lexicon / Latin NLP |
| 16 | aeneas-1.7.3.zip | 30.51 | Audio tooling / scheduling |
| 17 | ts-fsrs-6.0.0.zip | 1.19 | Audio tooling / scheduling |
| 18 | lexica-master.zip | 59.02 | Lexicon / Latin NLP |
| 19 | latincy-vocab-0.4.0.zip | 0.16 | Lexicon / Latin NLP |
| 20 | latincy-lexicon-0.13.0.zip | 18.29 | Lexicon / Latin NLP |
| 21 | metadata.csv | 3.52 | Audio / speech data |
| 22 | Latin AUDIO part_0 first half.zip | 506.18 | Audio / speech data |
| 23 | grammar-allen-greenough-master.zip | 63.31 | Grammar / vocabulary |
| 24 | Bewicks Select Fables of Æsop and others. In three parts. 1. Fables extracted from Dodsleys. 2. Fables with reflections in… (Aesop Robert Dodsley [Aesop]) (z-library.sk, 1lib.sk, z-lib.sk).epub | 9.86 | Reading content |
| 25 | latin-core-list(1).csv | 0.08 | Grammar / vocabulary |
| 26 | latincy-readers-1.9.0(1).zip | 0.75 | Lexicon / Latin NLP |
| 27 | latincy-preprocess-0.5.1(1).zip | 0.37 | Lexicon / Latin NLP |
| 28 | ts-fsrs-6.0.0(1).zip | 1.19 | Audio tooling / scheduling |
| 29 | lexica-master(1).zip | 59.02 | Lexicon / Latin NLP |
| 30 | latincy-vocab-0.4.0(1).zip | 0.16 | Lexicon / Latin NLP |
| 31 | latincy-lexicon-0.13.0(1).zip | 18.29 | Lexicon / Latin NLP |
| 32 | selectaefabulaeaesopior_2401_librivox(3).zip | 203.96 | Audio / speech data |
| 33 | latin-macronizer-master(3).zip | 7.00 | Lexicon / Latin NLP |
| 34 | whitakers_words-0.8.0(3).zip | 1.21 | Lexicon / Latin NLP |
| 35 | canonical-latinLit-0.0.33195683883(3).zip | 52.49 | Reading content |
| 36 | pg8997-images-3(3).epub | 0.18 | Reading content |
| 37 | aeneas-1.7.3(1).zip | 30.51 | Audio tooling / scheduling |
| 38 | wavesurfer.js-8.0.5(1).zip | 17.27 | Audio tooling / scheduling |
| 39 | pg18251-images-3(1).epub | 1.17 | Reading content |
| 40 | Latin AUDIO part_0 second half.zip | 346.09 | Audio / speech data |
| 41 | ClassicsReaderAndroid-3.0.0(3).zip | 41.29 | Application example |
| 42 | LibreLingo-lluis-v1.8.1(3).zip | 79.69 | Application example |
| 43 | lute-v3-3.10.3(3).zip | 1.15 | Application example |
| 44 | index.html | 0.04 | Baseline program |
| 45 | Tablinum review.docx | 0.01 | User reference / review |
| 46 | Tablinum review(1).docx | 0.02 | User reference / review (v0.4 follow-up) |
| 47 | Tablinum review(2).docx | 0.02 | User reference / review (v0.4.1 follow-up) |
| 48 | Tablinum review(3).docx | 0.02 | User reference / review (manuscript redesign) |
| 49 | TABLINUM_HANDOVER_FOR_GPT(3).md | 0.03 | User reference / follow-up handover (130-chapter curriculum) |
| 50 | CLAUDE_REVIEW_130.md | 0.02 | User reference / Claude review of curriculum plan |
| 51 | Tablinum review.md | 0.04 | User reference / latest v2 curriculum review; archived in `curriculum/reviews/TABLINUM_REVIEW_20261105.md` |
| 52 | Tablinum review(2).md | 0.04 | User reference / curriculum v3 review; archived in `curriculum/reviews/TABLINUM_REVIEW_V3_FOLLOWUP_20261105.md` |
| 53 | CLAUDE_IMPLEMENTATION_ROADMAP.md | 0.09 | User-supplied 12-phase execution roadmap; archived in repository root and implemented from Phase 0 |

## Dataset facts from earlier source inspection

- metadata.csv had 23,870 entries: 9,000 part_0, 9,000 part_1, 5,870 part_2. A total of 3,985 part_2 entries had a blank speaker field. The supplied audio ZIPs were labelled part_0; their inner coverage and exact alignment have not been validated here.
- The two DCC vocabulary CSV copies were text-identical in the earlier review. The file contains 997 data rows, one missing definition (fore) and repeated frequency rank 280.
- The uploaded Bewick Aesop EPUB does not match the H. Clarke Latin text used for the LibriVox recording.
- Check licences and provenance separately for software, dictionary content, reading texts and audio. Do not bundle copyrighted Familia Romana material.

## Current integration status

None of the uploaded third-party code, corpus data or media is included in v0.4.2 runtime. The eight original lessons, small dictionary and exercises are authored directly inside index.html. Integrations are future work after Claude review.
