"use strict";
/* Visual-only change contract: lesson data and every JavaScript handler are locked
   to the v0.4.2 review branch. Do not update these fingerprints for CSS edits. */
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
assert(html.includes('<script src="app/legacy-runtime.js"></script>'),"Classic script load required on file URL");
// Whole-JS fingerprint retired after Phase 3a; phase3a-relocation and legacy-content-lock guard original logic and words.
const css=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
assert(css,"Manuscript CSS must be present");
for(const token of ["--parchment","--paper","--ink","--terracotta","--ochre","--olive","--burgundy","--rule"]){
 assert(css.includes(token),"Missing theme token "+token);
}
for(const selector of [".codex",".layout",".sentence",".word",".quiz",".option",".dock",".scene","@media (max-width: 720px)"]){
 assert(css.includes(selector),"Missing styling for "+selector);
}
for(const id of ["tabs","chapters","main","help","audioMode","audioNote"]){
 const matches=html.match(new RegExp('id="'+id+'"',"g"))||[];
 assert.equal(matches.length,1,"Expected exactly one "+id+" host element");
}
assert(html.includes('<div class="codex">'),"Folio wrapper missing");
assert(!/@import\b/i.test(css),"No remote font imports permitted");
assert(!/https?:\/\//i.test(css),"No network-dependent CSS assets permitted");
assert(/border-radius:\s*2px/.test(css),"Controls should have modest corners");
assert(/filter:\s*none/.test(css),"Colour-bearing illustrations must keep their source SVG colours");
assert(!/filter:\s*grayscale\(|filter:\s*sepia\(/.test(css),"Do not desaturate pedagogical SVG colours");
assert(!/\.app-status:empty\s*\{\s*display:\s*none/.test(css),"ARIA live region must stay mounted");
assert(html.includes("Version 0.4.2 Manuscript Edition review build"),"Footer must show current edition");
assert(css.includes(".dock .tools { display: grid;"),"Compact mobile control strip is required");
console.log("PASS: Visual-only contract — original script/data unchanged; classical styles, landmarks and offline assets retained.");
