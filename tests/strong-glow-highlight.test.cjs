"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
require("../content/illustrations.js");
const art=require("../app/64-art-scenes.js");
const source=fs.readFileSync(path.join(__dirname,"../app/64-art-scenes.js"),"utf8");
const approved=(art.manifest.scenes||[]).filter(x=>art.approved(x));
assert.equal(approved.length,9,"All nine reviewed scene assets remain present");
let total=0;
for(const scene of approved){
 const html=art.renderChapter(scene.id.replace(/-scene(?:-storm|-sun)?$/, ""),"<svg>fallback</svg>");
 assert(html.includes('data-art-regions="'+scene.id+'"'),"Source scene renders as a classic offline SVG overlay");
 assert(html.includes('feGaussianBlur stdDeviation="1.75"'),"Outer halo is a real Gaussian blur");
 assert(html.includes('feGaussianBlur stdDeviation="0.8"'),"Inner halo is a real Gaussian blur");
 for(const region of scene.required_region_ids){
  assert(html.includes('data-art-glow="'+region+'"'),"Outer glow for "+scene.id+": "+region);
  assert(html.includes('data-art-inner-glow="'+region+'"'),"Inner glow for "+scene.id+": "+region);
  assert(html.includes('data-art-poly="'+region+'"'),"Original hit polygon still exists for "+scene.id+": "+region);
  total++;
 }
}
assert.equal(total,44,"All 44 existing approved region IDs have halo elements");
assert(!source.includes('poly.setAttribute("stroke","#'),"No solid polygon selection stroke remains");
assert(!source.includes('drop-shadow(0 0'),"Old alpha-starved drop-shadow effect removed");

function node(dataset){const attrs={};return {dataset,attrs,closest(){return {dataset:{artRegions:dataset.artRegions}}},setAttribute(k,v){attrs[k]=v},removeAttribute(k){delete attrs[k]}}}
const selected=approved.find(x=>x.id==="b01-c002-scene");
const region="Mārcus",other="Flāvia";
const nodes={
 '[data-art-region]':[node({artScene:selected.id,artRegion:region}),node({artScene:selected.id,artRegion:other})],
 '[data-art-glow]':[node({artRegions:selected.id,artGlow:region}),node({artRegions:selected.id,artGlow:other})],
 '[data-art-inner-glow]':[node({artRegions:selected.id,artInnerGlow:region}),node({artRegions:selected.id,artInnerGlow:other})],
 '[data-art-poly]':[node({artRegions:selected.id,artPoly:region}),node({artRegions:selected.id,artPoly:other})]
};
const prior=global.document;const events=[];
global.document={querySelectorAll(selector){assert(nodes[selector]);return nodes[selector]},dispatchEvent(e){events.push(e)}};
try{
 art.select(selected.id,region,{x:32,y:32});
 assert.equal(nodes['[data-art-glow]'][0].attrs.opacity,"0.95");
 assert.equal(nodes['[data-art-glow]'][1].attrs.opacity,"0");
 assert.equal(nodes['[data-art-inner-glow]'][0].attrs.opacity,"0.86");
 assert.equal(nodes['[data-art-inner-glow]'][1].attrs.opacity,"0");
 assert.equal(nodes['[data-art-poly]'][0].attrs.stroke,"none");
 assert.equal(nodes['[data-art-poly]'][0].attrs.fill,"none");
 assert.equal(nodes['[data-art-region]'][0].attrs['aria-pressed'],"true");
 assert.equal(nodes['[data-art-region]'][1].attrs['aria-pressed'],"false");
 assert.equal(events.length,1);
 assert.deepEqual(events[0].detail.point,{x:32,y:32});
 art.select(selected.id,other);
 assert.equal(nodes['[data-art-glow]'][0].attrs.opacity,"0");
 assert.equal(nodes['[data-art-glow]'][1].attrs.opacity,"0.95");
 assert.equal(nodes['[data-art-region]'][1].attrs['aria-pressed'],"true");
}finally{if(prior===undefined)delete global.document;else global.document=prior}
console.log("PASS stronger halo: 9 scene masks, 44 region maps, blurred-only 2-layer glow, selection switching, keyboard button state, unchanged click event coordinates.");
