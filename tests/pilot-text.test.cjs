"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {generate,withPictureExercises}=require("../scripts/import-claude-pilot.cjs");
const {checkPilot,checkSurface}=require("../scripts/lib/pilot-grammar.cjs");
const root=path.resolve(__dirname,"..");
const manuscript=fs.readFileSync(path.join(root,"docs/pilot/CLAUDE_PILOT_B01_C001_C008.md"),"utf8");
const plan=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
const expected=generate(manuscript,plan);
const extended=withPictureExercises(JSON.parse(JSON.stringify(expected)));
function uniqueLines(lesson){
 const seen=new Set();
 for(const seg of lesson.segments)for(const s of seg.sentences){
  const key=s.text_la.normalize("NFC").trim().replace(/\s+/g," ").toLowerCase();
  if(seen.has(key))throw Error("Repeated reading sentence: "+lesson.id+" "+s.text_la);
  seen.add(key);
 }
}
assert.equal(expected.length,8);
for(let i=0;i<8;i++){
 const ex=expected[i],file=path.join(root,"lessons/b01/c"+String(i+1).padStart(3,"0")+".json");
 const actual=JSON.parse(fs.readFileSync(file,"utf8"));
 assert.deepEqual({...actual,exercises:actual.exercises.slice(0,6)},ex,
  "The original six manuscript questions and all authored Latin must remain intact: "+ex.id);
 assert.deepEqual(actual.exercises.slice(6),extended[i].exercises.slice(6),
  "Picture extras must be exactly the unsigned source registry: "+ex.id);
 assert.equal(actual.status,"draft");assert.equal(actual.drafted_by,"claude-draft-2026-11-05");
 assert.equal(actual.review.latin.by,null);assert.equal(actual.review.pedagogy.by,null);
 assert.deepEqual(actual.new_lexemes_declared,[]);assert.deepEqual(actual.grammar_new,[]);
 assert.equal(actual.exercises.length,extended[i].exercises.length);
 assert(actual.speaking.length>=1);
 uniqueLines(actual);
 const issues=checkPilot(actual);
 assert.deepEqual(issues,[],ex.id+" early grammar feature or form");
 for(const seg of actual.segments)for(const s of seg.sentences)for(const t of s.tokens){
  assert.equal(t.lx,null);assert.equal(t.morph,null);assert.equal(t.annotation_status,"draft_unverified");
 }
 assert(actual.segments.length===plan.chapters[i].lesson_segments);
 console.log("PASS "+actual.id+": "+actual.reading_sentence_count+" distinct manuscript lines; "+actual.reading_token_count+" reading tokens; annotations unsigned");
}
for(const [n,form]of [[3,"bibunt"],[5,"laetī"],[2,"patris"]]){
 assert(checkSurface("Ecce "+form+".",n).length>0,"Early form must fail in Chapter "+n+": "+form);
 const bad=JSON.parse(JSON.stringify(expected[n-1]));
 bad.segments[0].sentences[0].text_la="Ecce "+form+".";
 assert(checkPilot(bad).length>0,"Form gate must reject "+form+" without linked lx");
}
const dup=JSON.parse(JSON.stringify(expected[0]));
dup.segments[1].sentences.push({...dup.segments[0].sentences[0],id:"synthetic-duplicate"});
assert.throws(()=>uniqueLines(dup),/Repeated reading sentence/);
const morph=JSON.parse(JSON.stringify(expected[2]));
morph.segments[0].sentences[0].tokens[0].morph="Mood=Ind|Number=Plur|Person=3|Tense=Pres|Voice=Act";
morph.segments[0].sentences[0].tokens[0].pos="verb";
assert(checkPilot(morph).some(e=>e.includes("not introduced until chapter 8")),"Explicit morphology must obey first_chapter even when lx=null");
console.log("PASS Claude pilot manuscript lock, negative chapter forms, duplicates and explicit morph-first_chapter gate.");
