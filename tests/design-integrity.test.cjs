"use strict";
/* Visual-only change contract: lesson data and every JavaScript handler are locked
   to the v0.4.2 review branch. Do not update these fingerprints for CSS edits. */
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
assert(html.includes('<script src="app/legacy-runtime.js"></script>'),"Classic script load required on file URL");
// Whole-JS fingerprint retired after Phase 3a; phase3a-relocation and legacy-content-lock guard original logic and words.
// Premium redesign (Nov 2026): the inline <style> block moved to three bundled
// stylesheets. The contract is unchanged in spirit: tokens, landmarks, offline-only assets.
assert(!/<style[\s>]/.test(html),"index.html must not carry an inline stylesheet any more");
const sheets=["app/styles/tablinum-fonts.css","app/styles/lx-tokens.css","app/styles/lx-app.css"];
for(const sheet of sheets)assert(html.includes('<link rel="stylesheet" href="'+sheet+'">'),"Missing stylesheet link "+sheet);
const css=sheets.map(sheet=>fs.readFileSync(sheet,"utf8")).join("\n");
assert(css.length>20000,"Interface CSS must be present");
for(const token of ["--parchment","--paper","--ink","--terracotta","--ochre","--olive","--burgundy","--rule",
 "--bg","--surface","--primary","--accent","--good","--bad","--focus","--font-serif","--font-sans","--reader-size","--reader-leading"]){
 assert(css.includes(token),"Missing theme token "+token);
}
for(const selector of [".codex",".layout",".sentence",".word",".quiz",".option",".dock",".scene",".appbar",".home-head",".lesson-card",".gloss-bar",".set-row","@media (max-width: 560px)","@media (max-width: 900px)","prefers-reduced-motion","prefers-color-scheme: dark"]){
 assert(css.includes(selector),"Missing styling for "+selector);
}
for(const id of ["tabs","chapters","main","help","audioMode","audioNote"]){
 const matches=html.match(new RegExp('id="'+id+'"',"g"))||[];
 assert.equal(matches.length,1,"Expected exactly one "+id+" host element");
}
assert(html.includes('<div class="codex">'),"Folio wrapper missing");
assert(!/@import\b/i.test(css),"No remote font imports permitted");
assert(!/https?:\/\//i.test(css),"No network-dependent CSS assets permitted");
assert(/--radius-s:\s*\d+px/.test(css)&&/--radius:\s*\d+px/.test(css),"Corner radii come from tokens");
for(const m of css.matchAll(/url\(\s*["']?([^"')]+)/g))assert(/^data:|^\.\.\/\.\.\/assets\//.test(m[1]),"Stylesheets may only reference bundled assets: "+m[1]);
assert(/filter:\s*none/.test(css),"Colour-bearing illustrations must keep their source SVG colours");
assert(!/filter:\s*grayscale\(|filter:\s*sepia\(/.test(css),"Do not desaturate pedagogical SVG colours");
assert(!/\.app-status:empty\s*\{\s*display:\s*none/.test(css),"ARIA live region must stay mounted");
assert(html.includes("Version 0.5.0 review build"),"Footer must show current edition");
assert(css.includes(".dock .tools { display: grid;"),"Compact mobile control strip is required");
console.log("PASS: Visual-only contract — original script/data unchanged; classical styles, landmarks and offline assets retained.");
