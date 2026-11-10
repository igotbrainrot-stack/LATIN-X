#!/usr/bin/env node
"use strict";
/* Runs docs/latin-audit/LATIN_GOLD_TESTS.json against the working tree. Read-only.
 * Exit 1 if a "preserve" test fails. "correction" tests are reported as pending
 * until the owner approves and applies the matching audit finding; with --strict
 * (used by npm test once all approved corrections are applied) they must pass too. */
const fs=require("fs"),path=require("path");
const root=path.resolve(__dirname,"..");
const gold=JSON.parse(fs.readFileSync(path.join(root,"docs/latin-audit/LATIN_GOLD_TESTS.json"),"utf8"));
const Ex=require(path.join(root,"app/50-exercises.js"));
const P=require(path.join(root,"scripts/lib/paradigms.cjs"));
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const lesson=id=>JSON.parse(read("lessons/legacy/"+id.replace("legacy-","")+".json"));
const questionTuple=qid=>{const l=lesson(qid.slice(0,11));return l.questions.find(q=>q.id===qid).legacy_source};
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g," ");
function run(t){
 switch(t.kind){
  case "grade_accepts":return Ex.gradeLegacy(questionTuple(t.question),t.response)===t.expect;
  case "cloze_accepts":return lesson(t.lesson).cloze_source.answers.some(a=>norm(a)===norm(t.response))===t.expect;
  case "text_present":return read(t.file).includes(t.text)===t.expect;
  case "text_absent":return t.files.every(f=>!read(f).includes(t.text))===t.expect;
  case "paradigm_form":{let forms;try{forms=P.generateForms(t.lexeme)}catch(e){return false}
   return forms.some(f=>f.morph===t.morph&&f.surface===t.expected)===t.expect;}
  case "narration_matches_lessons":{
   require(path.join(root,"content/narration.js"));const n=globalThis.TablinumNarrationCatalogue;
   const text={};for(let i=1;i<=8;i++)for(const s of lesson("legacy-ch0"+i).sentences)text[s.id]=s.text_la;
   return n.sentences.every(s=>text[s.sentence_id]===s.canonical_text)===t.expect;}
  case "picture_answer_includes":{
   const d=JSON.parse(read("curriculum/picture-exercises-b01.json"));
   const ex=Object.values(d.chapters).flat().find(e=>e.id===t.exercise);
   const ans=[].concat(ex.accept_regions||ex.answer);return ans.includes(t.region)===t.expect;}
  default:throw Error("Unknown gold test kind "+t.kind);
 }
}
const res={preserve:{pass:0,fail:[]},correction:{pass:0,fail:[]}};
for(const t of gold.tests){const ok=run(t);const b=res[t.phase];ok?b.pass++:b.fail.push(t.id+" ("+t.finding+")");}
console.log("Preserve: "+res.preserve.pass+" pass, "+res.preserve.fail.length+" fail");
res.preserve.fail.forEach(x=>console.log("  FAIL "+x));
console.log("Correction (awaiting approved fixes): "+res.correction.pass+" pass, "+res.correction.fail.length+" pending");
res.correction.fail.forEach(x=>console.log("  PENDING "+x));
const strict=process.argv.includes("--strict");
process.exit(res.preserve.fail.length||(strict&&res.correction.fail.length)?1:0);
