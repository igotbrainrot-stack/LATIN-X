"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {check}=require("../scripts/check-illustrations.cjs");
const original=JSON.parse(fs.readFileSync(path.join(__dirname,"..","curriculum/illustrations.json"),"utf8"));
const copy=x=>JSON.parse(JSON.stringify(x));
assert.equal(original.scenes.length,9);
assert.deepEqual(check(original),[]);
const u=original.scenes.findIndex(s=>s.id==="b01-c006-scene");assert(u>=0);
// All nine scenes are approved; negative checks run on an unsigned copy of c006.
const base=copy(original);Object.assign(base.scenes[u],{status:"planned_owner_unapproved",asset:null,thumbnail:null,polygons:{},provenance:null,tool:null,generation_prompt:null,approval:{by:null,at:null}});
assert.deepEqual(check(base),[]);
let data=copy(base);data.scenes[u].fallback=null;assert(check(data).some(x=>x.includes("neither image nor known SVG fallback")));
data=copy(base);data.scenes[u].alt_la_draft="";assert(check(data).some(x=>x.includes("missing Latin/English alt")));
data=copy(base);data.scenes[u].polygons={"not-an-image-region":[[0,0],[80,0],[0,80]]};assert(check(data).some(x=>x.includes("unknown region")));
data=copy(base);data.scenes[u].asset="assets/art/b01/nonexistent.webp";assert(check(data).some(x=>x.includes("image is missing")));
console.log("PASS Phase8 preproduction: pilot art slots (unsigned copy used for negative checks); bad fallback, alt, polygons and missing WebP fail as designed.");
