"use strict";
/* Human-approved editorial overlay: frozen v0.4.2 archive is NEVER rewritten.
 * Applied only after readLegacySource() checks the archived HTML SHA1.
 * This overlay keeps every legacy ID, ordinal, storage key and draft status. */
const corrections=require("../../curriculum/legacy-errata.json");
if(corrections.schema!=="latin-x-approved-legacy-errata-v1"||corrections.approved_by!=="owner"||
 corrections.approved_at!=="2026-11-10")throw Error("Legacy errata approval provenance missing");
const revised=s=>typeof s==="string"?s.replace(/Tīt/g,"Tit"):s;
const mapLatin=v=>Array.isArray(v)?v.map(mapLatin):v&&typeof v==="object"
 ?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,mapLatin(x)])):revised(v);
const answerAdds={"legacy-ch02-q002":"Titus Līviae frāter est",
 "legacy-ch03-q003":"legit librum","legacy-ch04-q003":"māter aquam portat",
 "legacy-ch07-q003":"sōl hodiē lūcet","legacy-ch08-q003":"rosās Līvia portābit"};
function effectiveLessons(original){
 const result=mapLatin(original);
 if(!Array.isArray(result)||result.length!==8)throw Error("Legacy lesson count changed");
 for(const [key,answer] of Object.entries(answerAdds)){
  const match=/^legacy-ch(\d{2})-q(\d{3})$/.exec(key);
  const q=result[Number(match[1])-1].q[Number(match[2])-1];
  if(!Array.isArray(q[2]))throw Error("Expected short-answer variants "+key);
  if(!q[2].includes(answer))q[2].push(answer);
 }
 return result;
}
function effectiveCloze(original){
 const result=mapLatin(original);
 for(const [chapter,oldValue,add] of [[5,"emit","habet"],[6,"currit","est"]]){
  const entry=result[chapter-1];
  if(!entry?.answers?.includes(oldValue))throw Error("Unknown cloze baseline chapter "+chapter);
  if(!entry.answers.includes(add))entry.answers.push(add);
 }
 return result;
}
function effectiveShared(original){return mapLatin(original)}
module.exports={effectiveLessons,effectiveCloze,effectiveShared,corrections};
