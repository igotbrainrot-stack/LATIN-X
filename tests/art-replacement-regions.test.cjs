"use strict";
const assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path"), crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const catalogue=require("../curriculum/illustrations.json");
globalThis.TablinumIllustrationsData=catalogue;
const art=require("../app/64-art-scenes.js");
const previousRecord=require("../docs/art/provenance/REPLACEMENT_PROVENANCE_AND_ANCHORS.json");
const previousEdgeRecord=require("../docs/art/provenance/EXTRA_EDGE_FEATHER_PROVENANCE.json");
const newRecord=require("../docs/art/provenance/NEW_ART_GENERATION_PROVENANCE.json");
const ids=["b01-c002-scene","b01-c005-scene","b01-c008-scene-storm"];
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const file=p=>fs.readFileSync(path.join(root,p));
const ratio=(w,h)=>w/h;
const dims=b=>{
 const typ=b.toString("ascii",12,16);
 if(typ==="VP8X")return {w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3)};
 if(typ==="VP8 ")return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
 if(typ==="VP8L")return {w:1+(b[21]|((b[22]&0x3f)<<8)),h:1+((b[22]>>>6)|(b[23]<<2)|((b[24]&0x0f)<<10))};
 throw Error("Unexpected WebP header "+typ);
};
assert.equal(catalogue.scenes.length,9,"Keep exactly nine independently illustrated approved scene slots");
assert.equal(newRecord.length,9,"Nine replacement images and real generation IDs must be recorded");
assert.equal(previousRecord.length,3,"Retain three earlier polygon-retrace witnesses");
assert.deepEqual(previousRecord.map(x=>x.scene_id),ids);
assert.equal(previousEdgeRecord.scenes.length,9,"Previous edge-styled images remain available for rollback");
const lookup=new Map(newRecord.map(x=>[x.scene,x]));
assert.equal(lookup.size,9,"No duplicate scene records");
const former=new Map(previousEdgeRecord.scenes.map(x=>[x.scene_id,x]));
for(const scene of catalogue.scenes){
 const record=lookup.get(scene.id);
 assert(record&&record.generated_image_id&&record.source_sha256,"Every source image must have real provenance: "+scene.id);
 assert(scene.status==="approved"&&scene.asset&&scene.thumbnail&&art.approved(scene),"Do not alter historic approved slots");
 assert.deepEqual(Object.keys(scene.polygons).sort(),scene.required_region_ids.slice().sort(),"All required regions must remain selectable");
 // Source PNGs stay outside Git (owner rule); check them only when the handover copy is present.
 if(fs.existsSync(path.join(root,record.source_png)))assert.equal(sha(file(record.source_png)),record.source_sha256,"Keep original full-native PNG unchanged");
 assert.equal(record.source_resolution[0],1672);assert.equal(record.source_resolution[1],941);
 assert.equal(record.published_webp,scene.asset);
 for(const [name,expected] of [[scene.asset,record.published_sha256],[scene.thumbnail,record.thumbnail_sha256]]){
   const bytes=file(name);
   assert(bytes.length<250*1024,`WebP must remain <250KiB: ${name}`);
   assert.equal(bytes.toString("ascii",0,4),"RIFF");assert.equal(bytes.toString("ascii",8,12),"WEBP");
   assert.equal(bytes.toString("ascii",12,16),"VP8X","Alpha-capable WebP must be used: "+name);
   assert((bytes[20]&0x10)!==0,"Transparent faded edges require an alpha bit: "+name);
   assert.equal(sha(bytes),expected,"Unexpected image modification: "+name);
   const actual=dims(bytes);
   assert(actual.w>=500&&actual.h>=280,"Image resolution minimum: "+name);
   assert(Math.abs(ratio(actual.w,actual.h)-ratio(1672,941))<0.006,"Relative polygon coordinates must retain source aspect ratio: "+name);
 }
 const prev=former.get(scene.id);
 const prevPath=`docs/art/provenance/PRE_NEW_IRREGULAR_EDGE_WEBPS/${path.basename(scene.asset)}`;
 assert(prev&&sha(file(prevPath))===prev.output_rgba_webp_sha256,"Previous production artwork must remain byte-for-byte recoverable: "+scene.id);
}
for(const witness of previousRecord){
 const scene=catalogue.scenes.find(s=>s.id===witness.scene_id);
 assert(scene);
 assert.equal(scene.art_replacement_20261107.selection_region_status,"owner_confirmed_2026-11-07","Owner confirmed the retraced regions on 2026-11-07 (decision card); never set this without the owner");
 // Earlier SHA remains a historical fact; it must not be falsified to say it was the new generation.
 assert.equal(scene.art_replacement_20261107.new_webp_sha256,witness.new_webp_sha256);
 for(const [region,point] of Object.entries(witness.region_anchors_pct)){
  assert.equal(art.regionAt(witness.scene_id,...point),region,`Coordinate witness must still select ${region}`);
  assert(art.regionHit(scene.polygons[region],...point),`${region} must contain its witness`);
 }
}
assert(!file("app/64-art-scenes.js").toString("utf8").includes("border:1px solid #d5c8b4"),"Reader border must stay removed");
assert(file("Picture Practice.html").toString("utf8").includes(".art-figure{background:transparent"),"Picture Practice must not introduce an opaque rectangle");
assert.equal(art.regionAt("b01-c008-scene-storm",25,25),"ventus");
assert.equal(art.regionAt("b01-c008-scene-storm",30,32),"arbor");
assert.equal(art.regionAt("b01-c008-scene-storm",70,49),"pluvia");
assert.equal(art.regionAt("b01-c008-scene-storm",13.5,14.5),"fenestra");
require("../app/50-exercises.js");
const exerciseData=require("../curriculum/picture-exercises-b01.json");
globalThis.TablinumPicturePracticeData={chapters:Object.entries(exerciseData.chapters).map(([id,exercises],i)=>({id,chapter:i+1,title:id,exercises}))};
const practice=require("../app/65-picture-practice.js");
const storm="b01-c008-scene-storm";
for(const [answer,point,highlight] of [["fenestra",{x:25,y:25},"ventus"],["ventus",{x:30,y:32},"arbor"]]){
 const draft=practice.chapters.find(c=>c.id==="b01-c008").exercises.find(ex=>ex.scene_id===storm&&ex.answer===answer);
 assert(draft);
 const fixture={...draft,status:"approved",scoring_enabled:true,review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-07"}};
 const evaluated=practice.evaluate(fixture,highlight,{id:"b01-c008",status:"approved"},null,point);
 assert.equal(evaluated.status,"graded");assert.equal(evaluated.correct,true);
 assert.equal(practice.evaluate(draft,highlight,{id:"b01-c008",status:"draft"},null,point).status,"ungraded");
}
console.log("PASS new watercolor art: 9 published replacement WebPs and 9 thumbs, native PNG and former art rollback, unchanged polygon maps, provenance/SHA/size/alpha/aspect gates, 14 anchors, storm overlap and unsigned grading gate.");
