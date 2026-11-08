"use strict";
/* The legacy app embeds the original data arrays in one inline script.
 * Extract as bounded JS literals only; never execute the browser application.
 * Shared by the lexical-audit generator and immutable legacy-content tests.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
function extractArray(source,openToken,closeToken,extra=2){
  const start=source.indexOf(openToken);
  assert(start!==-1,"Missing original source data marker: "+openToken);
  const begin=start+openToken.length;
  const end=source.indexOf(closeToken,begin);
  assert(end!==-1,"Missing original source data terminator: "+closeToken);
  const literal=source.slice(begin,end+extra);
  return vm.runInNewContext("("+literal+")",Object.create(null),{timeout:2000});
}
function extractLessons(source){
  return extractArray(source,"const L=","\n];\n\nconst shared=");
}

function readLegacySource(root=path.resolve(__dirname,"..","..")){
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 if(html.includes('<script src="content/catalogue.js"></script>')){
  // Phase 3b removes the old L literal from browser code; only the archived,
  // SHA-locked original is allowed to author the eight legacy JSON fixtures.
  const crypto=require("node:crypto");
  const original=fs.readFileSync(path.join(root,"archive","index-v04-inline-phase3a-baseline.html"),"utf8");
  assert.equal(crypto.createHash("sha1").update(original,"utf8").digest("hex"),
    "9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20","Frozen original v0.4.2 source changed");
  return original;
 }
 const scriptPath=path.join(root,"app","legacy-runtime.js");
 if(html.includes('<script src="app/legacy-runtime.js"></script>')){
  assert(fs.existsSync(scriptPath),"Missing Phase 3a external classic script");
  return fs.readFileSync(scriptPath,"utf8");
 }
 return html; // only for older Phase 0/1 snapshots.
}

module.exports={extractArray,extractLessons,readLegacySource};
