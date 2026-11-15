"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const original=read("archive/index-v04-inline-phase3a-baseline.html");
const html=read("index.html"),runtime=read("app/legacy-runtime.js");
assert.equal(crypto.createHash("sha1").update(original).digest("hex"),
 "9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20","Original v0.4.2 source SHA drift");
const inline=original.match(/<script>([\s\S]*?)<\/script>/);
assert(inline,"Archived v0.4.2 inline script missing");
// content/form-notes.js (Nov 2026): generated draft form notes shown beside a clicked word; data only.
const files=["content/catalogue.js","content/lexicon.js","content/form-notes.js",...Array.from({length:8},(_,i)=>"content/legacy/ch"+String(i+1).padStart(2,"0")+".js"),"content/migration-maps.js","app/20-state-v5.js","app/30-content-loader.js","app/50-exercises.js","vendor/ts-fsrs.umd.js","app/55-review-deck.js","app/56-word-checks.js","app/57-play.js","content/illustrations.js","app/64-art-scenes.js","content/music.js","app/58-music-score.js","app/60-audio-ambience.js","content/narration.js","app/62-narration.js","app/70-user-media.js","app/legacy-runtime.js","app/80-accessibility.js"];
const welcomeScript="app/welcome/welcome.js";
const scriptTags=[...files,welcomeScript].map(file=>'<script src="'+file+'"></script>').join("\n");
// Polish pass (Nov 2026): presentation-only <link> tags may follow the original
// inline stylesheet. They are enumerated here; no script, logic or data may change.
const headLinks=['<link rel="icon" href="assets/icons/tablinum.svg" type="image/svg+xml">',
 '<link rel="icon" href="assets/icons/tablinum-48.png" sizes="48x48" type="image/png">',
 '<link rel="stylesheet" href="app/styles/tablinum-fonts.css">',
 '<link rel="stylesheet" href="app/styles/tablinum-polish.css">',
 '<link rel="stylesheet" href="app/welcome/welcome.css">',
 // Interface modernisation (Nov 2026): layout, surfaces and motion. Presentation only.
 '<link rel="stylesheet" href="app/styles/tablinum-modern.css">',
 '<link rel="stylesheet" href="app/styles/tablinum-play.css">'];
for(const link of headLinks){const target=link.match(/href="([^"]+)"/)[1];assert(fs.existsSync(path.join(root,target)),"Missing linked presentation asset "+target)}
// Preserve the exact legacy reading sources, but allow explicitly approved presentation additions.
const paths=[...html.matchAll(/<script src="([^"]+)"\s*><\/script>/g)].map(m=>m[1]);
assert.deepEqual(paths,[...files,welcomeScript],"Only the approved classic scripts, in the correct order");
for(const link of headLinks)assert(html.includes(link),"Approved stylesheet/icon asset link must exist");
assert.equal(html.split("<link ").length-1,headLinks.length,"Only the approved stylesheet and icon links");
assert.equal(html.split("<script ").length-1,files.length+1,"Only explicitly enumerated scripts");
assert(!html.includes("<script>"),"No new inline startup logic");
assert(html.includes("body::before"),"Keep approved CSS paper texture");
assert(!html.includes("body::after"),"Do not stack a second page texture");
assert(html.includes('id="lx-welcome"')&&html.includes('id="lx-welcome-enter"'),"First-run guide and enter button must be present");
assert(html.includes('aria-modal="true"')&&html.includes('id="lx-welcome-skip"'),"Welcome accessibility and persistence controls");
assert(fs.existsSync(path.join(root,welcomeScript)),"Welcome controller must be bundled");
assert(!html.includes('type="module"')&&!html.includes("fetch("));
assert(runtime.includes("const L=Array.from({length:8}"),"Runtime should use compiled legacy data");
assert(!runtime.includes("const L=["),"Legacy authoring data cannot be duplicated in browser runtime");
const {extractLessons,extractArray,readLegacySource}=require("../scripts/lib/extract-legacy.cjs");
const {effectiveLessons}=require("../scripts/lib/legacy-errata.cjs");
assert.equal(readLegacySource(root),original,"Compiler must continue reading SHA-locked old lesson source");
const expected=effectiveLessons(extractLessons(original));
const content={};
for(const file of files.filter(file=>file.startsWith("content/")))vm.runInNewContext(read(file),content,{filename:file});
const data=content.TablinumCompiledContent;
assert.equal(data.catalogue.entries.length,8);
for(let i=0;i<8;i++){
 const id="legacy-ch"+String(i+1).padStart(2,"0");
 assert.deepEqual(JSON.parse(JSON.stringify(data[id].legacy_source)),JSON.parse(JSON.stringify(expected[i])),
  "Compiled legacy chapter differs from the frozen original: "+id);
 assert.equal(data.catalogue.entries[i].id,id);
}
assert.equal(extractArray(original,"const guidedCloze=","\n];\n// Contextual hints").length,8);
console.log("PASS Phase 3b/12: locked legacy content unchanged; explicitly approved CSS and welcome assets; no unreviewed scripts.");