# LATIN X — Lexical data and media licence register

**Updated:** 5 November 2026. This register documents reviewed evidence and outstanding checks. No external Latin dictionary has been imported into the Phase 1 runtime or approved lexical registry.

| Resource | Source, version / locator | Status and licence evidence | Phase 1 use | Redistribution / conditions |
|---|---|---|---|---|
| Original Tablinum v0.4.2 eight chapters and glossary | `index.html`, owner-directed project code | **Original project content**; rights and distribution of repository governed by the project owner, not assumed CC | 128 source glossary candidates, 255 sentence tokens and source ID links | Keep original source and credit authors where identified |
| Dickinson College Commentaries Latin Core Vocabulary | https://dco.dickinson.edu/vocabulary | **Verified**: that vocabulary page states **CC BY-SA 3.0 Unported**, with credit to Christopher Francese and contributing editors. The current DCC website states CC BY-SA at https://dcc.dickinson.edu/terms-use (version not specified there). | **50 exact-headword/rank hints** are present in the committed `curriculum/lexicon/review-sheets/legacy-candidates.csv`, matched against the user-provided 997-entry source; no complete DCC source dataset or approved lexicon is bundled | This review-sheet metadata is **attributed to DCC / Christopher Francese** and should be handled under **CC BY-SA 3.0**. Attribute and observe share-alike terms for downstream versions; review exact source/export rights before adding actual gloss definitions. Verify exact dataset/version and upstream attribution before incorporating data |
| Lewis & Short / Perseus lexical material | https://www.perseus.tufts.edu/ | **Licence for the exact file/export not yet confirmed** | Potential human macron / morphology authority | Do not copy or distribute lexicon entries without verifying export licence and source |
| Whitaker's Words software | User-provided archive (not in repository) | **Exact package licence, contents and reuse rights not yet independently checked** | Possible optional authoring-only cross-check | Do not bundle until checked |
| LatinCy model and lexicon | User-provided packages (not in repository) | **Exact model weights and package licence not yet checked** | Possible local automated morphological proposals; no approval authority | Do not ship model or derived data before confirming terms |
| Ørberg, *Lingua Latina per se illustrata: Familia Romana* and *Roma Aeterna* | Copyrighted textbooks/recordings | **Rights reserved; not cleared for GitHub distribution** | Pedagogical approach only | Do not copy text, images, audio, exercises, chapter scenes or licensed scans |
| User-supplied audio, fable EPUB and private source archives | Kept outside repository | **Individual rights and exact editions pending review** | Not used in Phase 1 | Do not commit source archives or redistribute prematurely |

| Bewick's *Select Fables of Æsop and Others* EPUB | Owner-provided file, described as `Bewicks Select Fables of Æsop and others…epub`. Work first published **1784**; historical editions include **1820** and **1871**. **Exact supplied EPUB edition/date not independently established.** | Historical text/engravings may be public domain, but any modern foreword, editing, cover, metadata or reproduction rights require edition-specific checking. | Possible original Latin retellings and original art reference in later phases only; **not used by Phase 1** | **Owner-supplied; kept out of Git.** Verify edition and rights before extracting/reproducing any assets. |

## Reviewer record / provenance requirements

Every **approved** lexeme must carry `sources:[{source_id,locator,license_id}]`, `macron_authority`, `macron_reviewed:true`, `reviewed_by` and `reviewed_at`. A matched DCC headword provides a *hint*, not grammatical validation, licensed reuse clearance for an unrelated export, or proof of review. The `licence_id` field must identify a documented source category; it is not a machine-granted licence.

The CSV tools leave those approval fields blank until signed by a qualified reviewer. An independent second reviewer should spot-check at least 20 entries before Phase 1 is declared complete.

**Public repository caution:** source rights and licence terms must be reviewed whenever new data is committed. Keep source PDFs, MP3s, model weights, private progress and dictionaries out of Git.
