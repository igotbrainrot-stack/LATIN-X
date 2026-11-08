"use strict";
/* Non-negotiable legacy content contract: old learner IDs may not silently
 * shift because a chapter's sentences or questions changed position. */
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const assert=require("node:assert/strict");
const {extractArray,extractLessons,readLegacySource}=require("../scripts/lib/extract-legacy.cjs");
const root=path.resolve(__dirname,"..");
const html=readLegacySource(root);
// Original HTML SHA1 intentionally retired in Phase 3a: the byte-preserved script and fixed chapter data remain locked.
const map=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/legacy-id-map.json"),"utf8"));
const L=extractLessons(html);
const cloze=extractArray(html,"const guidedCloze=","\n];\n// Contextual hints");
const shared=extractArray(html,"const shared=",";\nfunction norm(",0);
const contract=JSON.parse(fs.readFileSync(path.join(root,"tests/fixtures/legacy-content-contract.json"),"utf8"));
function fnv32(s){
 let h=2166136261;
 for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
 return(h>>>0).toString(16).padStart(8,"0");
}
assert.equal(L.length,8);
assert.equal(map.legacy_chapters.length,8);
assert.equal(cloze.length,8);
assert.equal(contract.schema,"tablinum-legacy-content-contract-v1");
assert.equal(contract.chapterCount,8);
assert.equal(contract.sentenceCount,67);
assert.equal(contract.questionCount,24);
assert.equal(contract.clozeCount,8);
assert.equal(fnv32(JSON.stringify(shared)),contract.sharedGlossaryFnv32,"Shared vocabulary changed");
assert.equal(L.reduce((a,c)=>a+c.sent.length,0),67);
assert.equal(L.reduce((a,c)=>a+c.q.length,0),24);
for(const [i,c] of L.entries()){
 const frozen=map.legacy_chapters[i];
 const savedContent=contract.chapters[i];
 assert.equal(savedContent.legacyId,frozen.legacy_id);
 assert.equal(fnv32(JSON.stringify(c)),savedContent.allLessonDataFnv32,"Whole legacy chapter changed including accepted answers / glosses: "+(i+1));
 assert.equal(fnv32(JSON.stringify(c.q)),savedContent.questionDataFnv32,"Original question options/answers changed: "+(i+1));
 assert.equal(fnv32(JSON.stringify(cloze[i])),savedContent.clozeDataFnv32,"Original cloze answer or clue changed: "+(i+1));
 assert.equal(frozen.legacy_id,"legacy-ch"+String(i+1).padStart(2,"0"));
 assert.equal(frozen.original_zero_based_index,i);
 assert.equal(frozen.title,c.name);
 const fingerprint=fnv32(c.sent.map(x=>x[0]).join("\n"));
 assert.equal(fingerprint,frozen.latin_sentence_fingerprint_fnv32,
  "Latin sentence text/order changed in legacy chapter "+(i+1));
 assert.equal(c.q.length,frozen.old_storage_keys.answers_and_correct.length);
 for(const [j,q] of c.q.entries()){
  assert.equal(q[0],frozen.old_storage_keys.answers_and_correct[j].question_text,
   "Question prompt/order changed, would corrupt saved answer key "+i+":"+j);
  assert.equal(frozen.old_storage_keys.answers_and_correct[j].old_key,i+":"+j);
 }
 assert.equal(c.sent.length,frozen.old_storage_keys.hint_levels.length);
 for(const [j,entry] of frozen.old_storage_keys.hint_levels.entries()){
  assert.equal(entry.old_key,i+":"+j);
  assert.equal(entry.sentence_id,frozen.legacy_id+"-s"+String(j+1).padStart(3,"0"));
 }
}
console.log("PASS: unchanged legacy chapter data, question answers/variants, cloze clues, shared glossary, 67 sentences and saved-state keys.");
