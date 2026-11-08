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
const files=["content/catalogue.js","content/lexicon.js",...Array.from({length:8},(_,i)=>"content/legacy/ch"+String(i+1).padStart(2,"0")+".js"),"content/migration-maps.js","app/20-state-v5.js","app/30-content-loader.js","app/50-exercises.js","vendor/ts-fsrs.umd.js","app/55-review-deck.js","content/illustrations.js","app/64-art-scenes.js","content/music.js","app/58-music-score.js","app/60-audio-ambience.js","content/narration.js","app/62-narration.js","app/70-user-media.js","app/legacy-runtime.js","app/80-accessibility.js"];
const scriptTags=files.map(file=>'<script src="'+file+'"></script>').join("\n");
assert.equal(html,original.replace(inline[0],scriptTags),
 "Phase12 may append only the explicitly enumerated classic accessibility script to the original script replacement");
assert.equal((html.match(/<script\b/g)||[]).length,files.length);
assert(!html.includes('type="module"')&&!html.includes("fetch("));
assert(runtime.includes("const L=Array.from({length:8}"),"Runtime should use compiled legacy data");
assert(!runtime.includes("const L=["),"Legacy authoring data cannot be duplicated in browser runtime");
const {extractLessons,extractArray,readLegacySource}=require("../scripts/lib/extract-legacy.cjs");
assert.equal(readLegacySource(root),original,"Compiler must continue reading SHA-locked old lesson source");
const expected=extractLessons(original);
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
console.log("PASS Phase 3b/12: HTML unchanged except enumerated classic source tags; generated eight-chapter content matches byte-locked v0.4.2 source.");