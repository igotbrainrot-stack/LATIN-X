# Book I illustration prompts — approval-gated, original art only

**Status:** DRAFT PROMPTS, no painted scenes signed. Generated first character-sheet preview: OpenAI image_gen ID `165700c0-da92-4f78-aee2-c549a833f0fa`. This preview is attached in the user's ChatGPT conversation; the program ZIP contains its full source prompt and wardrobe map, not the original 3.17 MB PNG.

**Mandatory common direction** for every scene: original, quiet hand-inked Roman domestic sketch, coloured watercolour on cream parchment; muted terracotta/ochre/olive/faded blue, soft pencil hatching, believable human hands and faces, clean silhouettes with generous empty areas. **No visible text, captions, arrows or labels.** Roman Italy, 1st–2nd century CE, no glass windows, modern furniture, forks, tomatoes, or potatoes. For *every* scene use the same signed characters from `curriculum/illustrations.json.character_sheet.character_colors`. Keep clothing, faces and heights consistent. The owner's approval of the character sheet is REQUIRED before any scene is considered production-ready. ImageGen or other tool output is always **draft**, not an approved image. No Familia Romana illustration or scene tracing.

## B01 C001 — Hortus et arbor
Roman villa peristyle garden seen obliquely, two visibly different trees, one much larger. Līvia, 9, olive tunic and braid, stands by three rose bushes. Tītus, 7, pale blue tunic and bulla, is partly hidden **high in the large tree** yet clearly findable. A small tree stands separate. Low tiled-roof villa and colonnade behind. Warm morning light. Required clickable targets: `arbor-magna`, `arbor-parva`, `rosa`, `vīlla`, `Līvia`, `Tītus`. No target may overlap so closely that a polygon becomes ambiguous.

## B01 C002 — Familia apud vīllam
Roman family in front of a tiled-roof villa, with clearly readable six-character standing positions. Left-to-right: father Mārcus beard and white tunic, mother Flāvia ivory/terracotta stola, daughter Līvia green braid, son Tītus blue with gold bulla. Leave calm empty area to the right for a **separate app-rendered family tree panel**; do not draw any lettering or family-tree arrows in the artwork. Required regions: `Mārcus`, `Flāvia`, `Līvia`, `Tītus`, `vīlla`.

## B01 C003 — Cēna
1st century Roman dining scene, low wooden mēnsa laid with Roman round bread scored in eight sections, simple earthenware drinking cups, fruit and a closed scroll/wooden writing tablet labelled only by app as liber. Tītus reaches towards bread with a natural, anatomically convincing hand. Clearly separate other food portions. No forks, ceramic plates with modern designs or glassware. Required: `mēnsa`, `pānis`, `pōculum`, `liber`, `cibus`.

## B01 C004 — Dōna
Stone atrium with impluvium, gentle afternoon sun. Family friend Gāius (tall, blue-grey tunic, brown mantle) is offering a book/scroll, a **distinct red rose**, and a distinct **red clay cup** on separate sides of the scene. Another person receives the gift. Leave horizontal open space for arrows the app draws separately; do not paint arrows. Required: `rosa-rubra`, `liber`, `pōculum-rubrum`, `Gāius`.

## B01 C005 — Vesper in vīllā
Golden dusk through Roman shuttered openings onto a villa peristyle. Mārcus, Flāvia, Līvia and Tītus sit or stand together recalling their day; same faces, clothes, hairstyles and bulla as the reference. Rose garden and tiled roofs softly recede into evening. Keep the earlier villa and cast recognizable. Required: `vīlla`, `Mārcus`, `Flāvia`, `Līvia`, `Tītus`.

## B01 C006 — Forum
Busy but uncluttered Roman town forum market stall under linen awning. Period-dressed mercātor offers red/gold apples and a basket of eggs, small Roman coins (as / sestertius) on wood. Three apples must be individually and clearly countable (one isolated, pair beside, trio near a basket), with other fruit not masquerading as apples. No modern signs or typography. Required: `mercātor`, `māla`, `ōva`, `pecūnia`, `mālum-1`, `māla-2`, `māla-3`.

## B01 C007 — Canis in viā
Roman polygonal-stone street, raised stepping stones and a clear city gate, no modern signs. Familiar white/chestnut patched dog runs visibly towards the gate. Līvia in green braid watches beside a young boy in tunic. Legible action, correct paws. Required: `via`, `porta`, `canis`, `puer`, `Līvia`.

## B01 C008a — Tempestās et pluvia
Two rectangular wooden-shutter window openings viewed from the modest atrium, no glass panes. Dark thunderstorm approaching, gusts bending one clearly visible tree, slanting rain. One opening captures wind-whipped foliage, other the rain. Do not add fantasy lightning or modern window frames. Required: `ventus`, `pluvia`, `fenestra`, `arbor`.

## B01 C008b — Sōl post tempestātem
Same garden, tree and villa as previous storm scene but bright sunlight returns after rain, pools in stone path with soft reflections and damp leaves. Open ochre-blue sky and golden sun through clouds. The same garden and large tree are identifiable. Required: `sōl`, `arbor`, `hortus`.

## Asset/approval pipeline

1. Owner visually approves character sheet (signature and date) through `Start Art Review.cmd`. Do not fill any signature on their behalf.
2. Generate each scene from its prompt using the signed character sheet as a consistent reference. Keep originals outside Git until rights and owner checks complete.
3. Save each approved full image under `assets/art/b01/` as 1200–2000 px wide WebP under 250 KiB, and a 600 px wide `-thumb.webp`, also under 250 KiB.
4. Enter *exact* generation prompt, tool, rights, Latin-first alt/English, and actual **image-aligned** polygon coordinates (0–100%) in `Art Review.html`; export updated JSON. The app never invents polygon positions.
5. On a new branch, replace `curriculum/illustrations.json` with actual owner-signed manifest; run `node scripts/build-illustrations.cjs`, `node scripts/check-illustrations.cjs`, the standard old-app source lock, and Windows `file://` art/browser tests. A scene is published only if all gates pass.
6. Until approval and assets exist, the learner uses the original SVG for all legacy chapters and all published new-course chapters.

**Historical reading:** <https://www.metmuseum.org/it/essays/roman-painting> and <https://museum.wa.gov.au/pompeii2010/daily-life/residences/>; user-approved design direction in `docs/owner/AUDIO_AND_ART_REQUIREMENTS.md`. Use these for general accuracy, not for copying images.
