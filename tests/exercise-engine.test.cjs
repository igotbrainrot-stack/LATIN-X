"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const engine=require("../app/50-exercises.js"),distractors=require("../scripts/lib/exercise-distractors.cjs");
const {checkSurface}=require("../scripts/lib/pilot-grammar.cjs");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const chapter={id:"b01-c001",status:"approved",audio_verified:false};
const base={id:"b01-c001-q001",type:"short",status:"approved",scoring_enabled:true,
 prompt_la:"Ubi est Līvia?",accept:["in hortō"],review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-05"},
 evidence:"b01-c001-s001"};
assert(engine.TYPES.includes("mc")&&engine.TYPES.includes("retell")&&engine.TYPES.includes("dictate"));
assert.equal(engine.registry().length,15);
assert.equal(engine.norm("  In HORTŌ!  "),"in horto");
assert.equal(engine.grade(base,"IN HORTO.",chapter).correct,true);
assert.equal(engine.grade(base,"horto",chapter).correct,false,"Never use substrings for Latin answers");
assert.equal(engine.grade(base,"in hortōsed",chapter).correct,false);
assert.equal(engine.grade({...base,id:"b01-c001-q002",accept:["Rōma"]},"Roma",chapter).correct,true);
assert.equal(engine.grade({...base,status:"proposed_ungraded"},"in hortō",chapter).status,"ungraded");
assert.equal(engine.grade({...base,review:{by:null}},"in hortō",chapter).status,"ungraded");
assert.equal(engine.grade(base,"in hortō",{...chapter,status:"draft"}).status,"unavailable");
assert.equal(engine.grade({...base,type:"retell"},"in hortō",chapter).status,"ungraded");
assert.equal(engine.grade({...base,type:"listen-mc",options:["in hortō","in viā"],audio:{verified:false,src:"a.mp3"}},"in hortō",chapter).status,"unavailable");
assert.equal(engine.grade({...base,type:"listen-mc",options:["in hortō","in viā"],audio:{verified:true,src:"a.mp3"}},"in hortō",chapter).status,"unavailable");
assert.equal(engine.grade({...base,type:"listen-mc",options:["in hortō","in viā"],audio:{verified:true,src:"a.mp3"}},"in hortō",{...chapter,audio_verified:true}).correct,true);
assert.equal(engine.grade({...base,type:"tf",answer:false},false,chapter).correct,true);
assert.equal(engine.grade({...base,type:"tf",answer:false},"false",chapter).correct,false);
assert.equal(engine.grade({...base,type:"pic",answer:"region-2"},"region-2",chapter).correct,true);
const ord={...base,type:"order",answer:["s003","s001","s002"]};
assert.equal(engine.grade(ord,["s003","s001","s002"],chapter).correct,true);
const partial=engine.grade(ord,["s003","s002","s001"],chapter);
assert.equal(partial.correct,false);assert.equal(partial.partial,1/3);
assert.equal(engine.grade({...base,type:"ending",accept:["am"]},"ām",chapter).correct,true);
assert.equal(engine.grade({...base,type:"cloze",options:["arbor","rosa"],accept:["rosa"]},"ROSA",chapter).correct,true);
assert.equal(engine.grade({...base,type:"define",options:["magnus","parvus"],accept:["parvus"]},"parvus",chapter).correct,true);
assert.equal(engine.grade({...base,type:"table",accept:["rosa,rosae"]},"ROSA ROSAE",chapter).correct,true);
assert.equal(engine.grade({...base,type:"unrecognized"},"x",chapter).status,"unavailable");
assert.equal(engine.escapeHTML("<img onerror='x'>"),"&lt;img onerror=&#39;x&#39;&gt;");
for(let i=1;i<=8;i++){
 const lesson=read("lessons/legacy/ch"+String(i).padStart(2,"0")+".json");
 for(const [j,q]of lesson.legacy_source.q.entries()){
  const adapter=engine.legacyAdapter(i-1,j,q);
  assert.equal(adapter.id,"legacy-ch"+String(i).padStart(2,"0")+"-q"+String(j+1).padStart(3,"0"));
  assert.equal(adapter.status,"legacy_unreviewed");
  const expected=[...(Array.isArray(q[2])?q[2]:[q[2]]),q[3]].filter(x=>typeof x==="string");
  for(const answer of expected)assert(engine.gradeLegacy(q,answer),"Old accepted variant lost: "+adapter.id);
  assert.equal(engine.gradeLegacy(q,"THIS MUST NOT MATCH"),false);
 }
}
const lexical=(id,head,intro,morph,pos="noun",synonyms=[])=>({
 id,head,pos,status:"approved",first_chapter:intro,near_synonyms:synonyms,
 forms:[{surface:head,morph,reviewed:true}]
});
const noun="Case=Acc|Number=Sing";
const lex=[
 lexical("lx-answer-rose","rosam",1,noun,"noun",["lx-syn-flower"]),
 lexical("lx-close-tree","arborem",4,noun),
 lexical("lx-old-table","mēnsam",1,noun),
 lexical("lx-recent-garden","hortum",5,noun),
 lexical("lx-syn-flower","flōrem",3,noun),
 lexical("lx-wrong-verb","portat",3,"Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act","verb"),
 lexical("lx-early-unreviewed","domum",2,noun),
 lexical("lx-future-word","fīlium",80,noun)
];
lex[6].forms[0].reviewed=false;
const req={exerciseId:"b01-c006-q001",answerLexemeId:"lx-answer-rose",answerMorph:noun,chapter:6,
 lexemes:lex,evidenceSentence:{tokens:[{lx:"lx-close-tree",t:"arborem"}]},limit:4};
const selected=distractors.options(req);
assert.deepEqual(selected.map(x=>x.lexeme_id),["lx-recent-garden","lx-old-table"],"Recent reviewed same-POS/morph, no evidence and no synonyms");
assert.deepEqual(distractors.options(req),selected,"Seeded options must be deterministic");
assert.throws(()=>distractors.options({...req,answerLexemeId:"lx-not-reviewed"}),/approved/);
assert(checkSurface("Līviae.",1).length>0);
assert(checkSurface("mātrī.",3).length>0);
assert(checkSurface("patris.",7).length>0);
assert.equal(checkSurface("Timentne Mārcus et Flāvia?",8).length,0);
assert(checkSurface("Timentne Mārcus et Flāvia?",7).length>0);
console.log("PASS Phase5: 15 types, reviewed-only grading, no substring, verified audio gates, all legacy answers, deterministic distractors and morphology order.");
