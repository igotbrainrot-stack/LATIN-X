"use strict";
/* Owner-authorised Classical quantity decisions. Preserve historical archival
 * data, saved-state identifiers, approval status and private-media provenance. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),file=p=>fs.readFileSync(path.join(root,p),"utf8"),json=p=>JSON.parse(file(p));
const P=require("../scripts/lib/latin-phonology.cjs");
const cases=[["māgna","/ˈmaːŋ.na/"],["māgnus","/ˈmaːŋ.nʊs/"]];
for(const [word,ipa] of cases)assert.equal(P.analyseWord(word).ipa,ipa);
assert.equal(P.analyseWord("Gāius").syllables.length,3,"Owner chose trisyllabic Gāius");
assert.equal(P.analyseWord("Gāius").stress,0);
assert.equal(P.analyseWord("tonitrus").stress,0,"Retain short-i tonitrus");
const ui=file("app/legacy-runtime.js");
assert(ui.includes("Ostende sīgnificātiōnem"));
assert(ui.includes("recōnstrūctiō incerta est"));
assert(ui.includes("Verbum dēest"),"Retain existing dēest convention");
assert(!ui.includes("Ostende significātiōnem"));
const l=json("lessons/legacy/ch01.json");
assert.equal(l.sentences[4].text_la,"Arbor māgna est.");
assert.equal(l.legacy_source.v.find(x=>x[0]==="māgnus")[2],"māgna");
assert.equal(l.status,"legacy_unreviewed");
assert.equal(l.sentences.length,9);
assert(file("archive/index-v04-inline-phase3a-baseline.html").includes("Arbor magna est."),"Historical locked source must be unchanged");
for(let c=1;c<=8;c++){
 const ch=json("lessons/b01/c"+String(c).padStart(3,"0")+".json");
 assert.equal(ch.status,"draft","Unsigned pilot must remain a draft");
}
const pic=json("curriculum/picture-exercises-b01.json").chapters["b01-c001"].find(x=>x.id==="b01-c001-q007");
assert.equal(pic.prompt_la,"Ubi est arbor māgna?");
assert.equal(pic.region_id,"arbor-magna");
assert.equal(pic.answer,"arbor-magna");
assert.equal(pic.scoring_enabled,false);
const scene=json("curriculum/illustrations.json").scenes.find(x=>x.id==="b01-c001-scene");
assert(scene.required_region_ids.includes("arbor-magna"));
assert(scene.polygons["arbor-magna"]);
const narText=file("content/narration.js");
require(path.join(root,"content/narration.js"));
const N=globalThis.TablinumNarrationCatalogue;
assert.equal(N.sentences.length,67);assert.equal(N.words.length,8);
assert.equal(N.sentences.filter(s=>s.takes[0].owner_listening==="pass").length,9);
assert.equal(N.sentences.filter(s=>s.takes[0].owner_listening==="pending").length,58);
const clip=N.sentences.find(s=>s.sentence_id==="legacy-ch01-s005");
const word=N.words.find(w=>w.clip_id==="arjun-word-magna");
assert.equal(clip.canonical_text,"Arbor māgna est.");
assert.equal(word.canonical_text,"māgna");
assert.equal(clip.takes[0].file,"s005-arjun.mp3");
assert.equal(word.file,"word-magna-arjun.mp3");
assert.equal(clip.takes[0].owner_listening,"pass");
assert.equal(word.owner_listening,"pass");
assert.equal(N.words.find(w=>w.voice==="Miriam").canonical_text,"laeta");
const media=json("docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json");
assert.equal(media.files.length,78);
assert(media.files.some(f=>f.path==="audio/narration/arjun/s005-arjun.mp3"));
assert(media.files.some(f=>f.path==="audio/narration/arjun/word-magna-arjun.mp3"));
const tsv=file("pronunciation/QUANTITY_LEXICON.tsv").trim().split("\n"),columns=tsv[1].split("\t");
const rows=new Map(tsv.slice(2).map(l=>{const vals=l.split("\t");const o=Object.fromEntries(columns.map((k,i)=>[k,vals[i]]));return[o.form,o]}));
assert.equal(rows.size,345);
for(const w of ["māgna","māgnā","māgnam","māgnō","māgnum","māgnus","sīgnificātiōnem","recōnstrūctiō"]){
 assert.equal(rows.get(w)?.status,"SUPPORTED",w+" must cite A&G but not claim Latinist verification");
}
assert.equal(rows.get("tonitrus").status,"AMBIGUOUS","Dictionary still allows variable i");
assert.equal(rows.get("dēest").status,"AMBIGUOUS","Retained convention is not a new evidence claim");
assert.equal(rows.get("Gāius").status,"AMBIGUOUS","Three syllables chosen but recording remains unchecked");
const sh=file("pronunciation/LISTENING_SHEET.csv");
assert(sh.includes("Arbor māgna est."));
assert(sh.includes("māgna,/ˈmaːŋ.na/"));
assert(!sh.includes("Arbor magna est."));
console.log("PASS approved Classical quantity: māgnus, sīgnificātiōnem, recōnstrūctiō; preserved dēest, Gāius, tonitrus, IDs, draft gates, 78 audio pins and review labels.");
