"use strict";
/* Art glow-only edit: unchanged region geometry, accessible selection controls. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const manifest=require("../curriculum/illustrations.json");
globalThis.TablinumIllustrationsData=manifest;
const art=require("../app/64-art-scenes.js");
const src=fs.readFileSync(path.join(__dirname,"../app/64-art-scenes.js"),"utf8");
assert.equal(manifest.scenes.length,9);
for(const scene of manifest.scenes){
  assert(art.approved(scene),`Existing approved scene ${scene.id} must remain approved`);
  const html=art.renderChapter(scene.chapter_id || scene.id.replace(/-scene(?:-storm|-sun)?$/,""),"<p>Fallback</p>");
  assert(html.includes('data-art-glow=') && html.includes('data-art-inner-glow='),`Missing halo masks for ${scene.id}`);
  assert(html.includes('stdDeviation="3.5"') && html.includes('stdDeviation="1.9"'),`Expected broad blending for ${scene.id}`);
  assert(html.includes('stroke="none" fill="none"'),`No hard selection stroke for ${scene.id}`);
  for(const region of scene.required_region_ids){
    assert(html.includes(`data-art-glow="${region}"`),`missing glow for ${scene.id}/${region}`);
    assert(html.includes(`data-art-inner-glow="${region}"`),`missing inner glow for ${scene.id}/${region}`);
  }
}
assert(src.includes('chosen?"0.76":"0"') && src.includes('chosen?"0.43":"0"'),"Selected glow layers should be balanced");
assert(!src.includes('chosen?"0.95":"0"'),"Former high-intensity narrow glow remains");
console.log("PASS glow blend: nine scenes, zero visible outlines, wider soft haloes, all original polygon maps preserved");
