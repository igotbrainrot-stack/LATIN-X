# Legacy Latin ambiguity review — 9 token occurrences

**Automatically generated case list from the unmodified eight-chapter app, 5 November 2026.** These are competing matches in Tablinum's existing glossary, **not** proof that the Latin is grammatically ambiguous. The current app selects the first matching glossary row; the new registry must make a conscious morphological/sense decision rather than copying that shortcut.

| Token ID | Original Latin context | Surface | Conflicting legacy glossary candidates | Reviewer disposition |
|---|---|---|---|---|
| `legacy-ch03-s001-t004` | *Līvia rosam rubram habet.* | **habet** | habēre — to have (legacy-lex-habere-b846d382) versus habet — has (legacy-lex-habet-edbf0fe3) | Pending human sense/lemma review |
| `legacy-ch03-s002-t003` | *Tītus librum habet.* | **habet** | habēre — to have (legacy-lex-habere-b846d382) versus habet — has (legacy-lex-habet-edbf0fe3) | Pending human sense/lemma review |
| `legacy-ch03-s004-t002` | *Līvia ad mātrem ambulat.* | **ad** | ad — towards (legacy-lex-ad-11c63447) versus ad — to, toward (legacy-lex-ad-87331a6f) | Pending human sense/lemma review |
| `legacy-ch04-s005-t002` | *Mārcus ad mēnsam ambulat.* | **ad** | ad — towards (legacy-lex-ad-11c63447) versus ad — to, toward (legacy-lex-ad-87331a6f) | Pending human sense/lemma review |
| `legacy-ch04-s008-t001` | *Omnēs in vīllā cēnant.* | **Omnēs** | omnēs — everyone (legacy-lex-omnes-d378dd78) versus omnis — all (legacy-lex-omnis-13254bc4) | Pending human sense/lemma review |
| `legacy-ch05-s001-t003` | *Hodiē familia ad forum it.* | **ad** | ad — towards (legacy-lex-ad-11c63447) versus ad — to, toward (legacy-lex-ad-87331a6f) | Pending human sense/lemma review |
| `legacy-ch06-s006-t002` | *Canis ad Līviam currit.* | **ad** | ad — towards (legacy-lex-ad-11c63447) versus ad — to, toward (legacy-lex-ad-87331a6f) | Pending human sense/lemma review |
| `legacy-ch08-s005-t004` | *Flāvia respondet: «Prīmum ad amīcum ībimus.»* | **ad** | ad — towards (legacy-lex-ad-11c63447) versus ad — to, toward (legacy-lex-ad-87331a6f) | Pending human sense/lemma review |
| `legacy-ch08-s007-t001` | *Omnēs laetī sunt.* | **Omnēs** | omnēs — everyone (legacy-lex-omnes-d378dd78) versus omnis — all (legacy-lex-omnis-13254bc4) | Pending human sense/lemma review |

The nine occurrences correspond to six glossary candidate rows and three normalized lookup keys: `ad`, `habet`, and `omnēs`. The editor may decide that multiple glossary rows belong to the **same** lexeme and approve them to a shared stable ID, or that they represent genuinely different lexemes with contextual disambiguation. The approval importer cannot mark a key resolved until all competing candidates are reviewed consistently.

- The lexical review sheet starts with these cases: [review-sheets/legacy-candidates.csv](review-sheets/legacy-candidates.csv).
- Do **not** confuse `habēre` (infinitive) and `habet` (finite form) with distinct lexemes solely because the old glossary treats them as separate headwords.
- `omnēs` may be the plural of *omnis*; its old gloss "everyone" needs contextual grammatical review.
- `ad` is a preposition and multiple English glosses can reflect the same Latin lexeme; the text must be checked before merging.
- Known homographs such as `edō` (eat) versus `ēdō` (publish/issue) require separate editorial attention even if they are **not** among these nine collisions.

This file is a diagnostic and contains **no approved Latin definitions**.
