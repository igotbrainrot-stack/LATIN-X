"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {checkSurface}=require("../scripts/lib/pilot-grammar.cjs");
const {tokenize}=require("../scripts/lib/tokens.cjs");
const {output}=require("../scripts/build-picture-practice.cjs");
const {withPictureExercises,generate}=require("../scripts/import-claude-pilot.cjs");
const exercise=require("../app/50-exercises.js");
const root=path.resolve(__dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"curriculum/illustrations.json"),"utf8"));
const registry=JSON.parse(fs.readFileSync(path.join(root,"curriculum/picture-exercises-b01.json"),"utf8"));
const plans=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
const source=fs.readFileSync(path.join(root,"docs/pilot/CLAUDE_PILOT_B01_C001_C008.md"),"utf8");
const lessons=withPictureExercises(generate(source,plans));
assert.equal(registry.schema,"tablinum-picture-exercises-draft-v1");
assert.equal(registry.owner_approval,"pending");
assert.equal(fs.readFileSync(path.join(root,"content/picture-exercises.js"),"utf8"),output());
const ids=new Set(),counters=new Map();let total=0;const learned=new Set();
for(const [idx,lesson]of lessons.entries()){
 const chapter=idx+1,pics=lesson.exercises.filter(e=>e.type==="pic");
 for(const seg of lesson.segments)for(const sentence of seg.sentences)for(const word of tokenize(sentence.text_la))learned.add(word.t.toLocaleLowerCase("und"));
 const current=JSON.parse(fs.readFileSync(path.join(root,`lessons/b01/c${String(chapter).padStart(3,"0")}.json`),"utf8"));
 assert.deepEqual(current,lesson,"Compiled signed/unsigned manuscript and local picture extras must match");
 assert(pics.length>=3&&pics.length<=7);
 assert.deepEqual(pics,registry.chapters[lesson.id]);
 const perScene=new Map();
 for(const ex of pics){
  total++;assert(!ids.has(ex.id),"Stable ID collision "+ex.id);ids.add(ex.id);
  assert.match(ex.id,new RegExp(`^b01-c00${chapter}-q0\\d\\d$`));
  assert.equal(ex.status,"proposed_ungraded");assert.equal(ex.scoring_enabled,false);
  assert.equal(ex.review?.by,null);assert.equal(ex.review?.at,null);
  assert.equal(ex.type,"pic");assert.equal(ex.answer,ex.region_id);
  assert(exercise.TYPES.includes(ex.type));assert.equal(exercise.approved(ex),false);
  assert.deepEqual(checkSurface(ex.prompt_la,chapter),[],"No untaught grammatical form allowed in "+ex.id);
  for(const word of tokenize(ex.prompt_la))assert(learned.has(word.t.toLocaleLowerCase("und")),
   ex.id+" uses untaught word/form: "+word.t);
  const scene=manifest.scenes.find(s=>s.id===ex.scene_id);
  assert(scene?.status==="approved");assert.equal(scene.chapter,chapter);
  assert(scene.required_region_ids.includes(ex.region_id));assert(scene.polygons[ex.region_id]);
  if(!perScene.has(scene.id))perScene.set(scene.id,new Set());
  perScene.get(scene.id).add(ex.region_id);
  assert(!ex.review?.by&&!ex.scoring_enabled,"No automatic grading of unsigned content");
 }
 for(const scene of manifest.scenes.filter(s=>s.chapter===chapter)){
  const used=perScene.get(scene.id)||new Set();
  assert.deepEqual([...used].sort(),[...scene.required_region_ids].sort(),"Every reviewed region used: "+scene.id);
  assert(used.size>=3&&used.size<=(scene.id==="b01-c006-scene"?7:6),"3–6 item target per scene; C006 has 7 mandatory regions");
  counters.set(scene.id,used.size);
 }
}
assert.equal(total,44);
assert.equal(counters.size,9);
// Every scene needs a point inside one polygon and outside the image. No modifications to signed geometry.
globalThis.TablinumIllustrationsData=manifest;
const art=require("../app/64-art-scenes.js");
assert(art.renderChapter("b01-c001","SVG fallback").includes('loading="eager"'),"Approved file:// images must load before their hidden fallback can be replaced");
for(const scene of manifest.scenes){
 let witness=null;
 for(const id of scene.required_region_ids){
  const p=scene.polygons[id];
  for(let x=1;x<100&&!witness;x++)for(let y=1;y<100&&!witness;y++)if(art.regionHit(p,x,y))witness=[x,y];
  if(witness)break;
 }
 assert(witness,"Each approved scene has a clickable interior: "+scene.id);
 assert(scene.required_region_ids.includes(art.regionAt(scene.id,...witness)));
 assert.equal(art.regionAt(scene.id,-1,99),null);
 assert.equal(art.regionAt(scene.id,110,110),null);
 assert.equal(art.regionAt(scene.id,0,-1),null);
}
const v5=require("../app/20-state-v5.js");
const practice=require("../app/65-picture-practice.js");
const unsigned=registry.chapters["b01-c006"][0];
const synthetic={...unsigned,status:"approved",scoring_enabled:true,review:{by:"TEST ONLY",at:"2026-11-07"}};
const approvedChapter={id:"b01-c006",status:"approved",audio_verified:false};
const state=v5.migrateV4toV5({},{});
const memory=new Map([[v5.V4,'{"old":"unchanged"}'],[v5.SNAPSHOT,'{"snapshot":"unchanged"}'],[v5.V5,JSON.stringify(state)]]);
const storage={getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v))};
let result=practice.evaluate(unsigned,unsigned.region_id,{id:"b01-c006",status:"draft"},storage);
assert.equal(result.status,"ungraded");assert.equal(memory.get(v5.V5),JSON.stringify(state),"Unsigned attempts must never write a v5 score");
result=practice.evaluate(synthetic,synthetic.region_id,approvedChapter,storage);
assert.equal(result.status,"graded");assert.equal(result.correct,true);assert.equal(result.saved,true);
const reloaded=JSON.parse(memory.get(v5.V5));
assert.equal(reloaded.questions[synthetic.id].correct,true);assert.equal(reloaded.questions[synthetic.id].answer,synthetic.region_id);
assert.equal(reloaded.questions[synthetic.id].attempts,1);
assert.equal(memory.get(v5.V4),'{"old":"unchanged"}');
assert.equal(memory.get(v5.SNAPSHOT),'{"snapshot":"unchanged"}');
assert.deepEqual(v5.parseBackup(v5.backupEnvelope(reloaded),{},{}).questions,reloaded.questions);

// Claude review regression: Chapter VIII storm polygons overlap. A point inside
// the expected answer is correct even if regionAt highlights a smaller region.
const storm=manifest.scenes.find(s=>s.id==="b01-c008-scene-storm");
const stormQuestions=registry.chapters["b01-c008"].filter(q=>q.scene_id===storm.id);
const reviewedStorm={id:"b01-c008",status:"approved"};
for(const [answer,point,highlight]of [
 ["fenestra",{x:25,y:25},"ventus"], // Window opening covered by wind region
 ["ventus",{x:30,y:32},"arbor"]   // Wind covering the bending tree
]){
 const draft=stormQuestions.find(q=>q.answer===answer);assert(draft,"Expected original storm prompt for "+answer);
 assert(art.regionHit(storm.polygons[answer],point.x,point.y));
 assert.equal(art.regionAt(storm.id,point.x,point.y),highlight,"Smallest region still used for highlighting");
 const signed={...draft,status:"approved",scoring_enabled:true,review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-07"}};
 assert.equal(practice.evaluate(signed,highlight,reviewedStorm,null).correct,false,"Keyboard button still selects literal smallest region");
 const hit=practice.evaluate(signed,highlight,reviewedStorm,null,point);
 assert.equal(hit.status,"graded");assert.equal(hit.correct,true,"Pointer click within answer polygon must be correct for "+answer);
 assert.equal(practice.evaluate(draft,highlight,{id:"b01-c008",status:"draft"},storage,point).status,"ungraded","Live unsigned picture remains ungraded");
 assert.equal(practice.evaluate(signed,highlight,reviewedStorm,null,{x:-1,y:30}).correct,false,"Invalid click coordinates cannot claim a grade");
 assert.equal(practice.evaluate(signed,highlight,reviewedStorm,null,{x:70,y:40}).correct,false,"Unrelated click cannot claim a different answer region");
}
// Reviewed-only pointer grading stores the actual correct answer, not the
// smallest highlighted background/foreground region.
const windowExercise=stormQuestions.find(q=>q.answer==="fenestra");
const approvedWindow={...windowExercise,status:"approved",scoring_enabled:true,review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-07"}};
const savedWindow=practice.evaluate(approvedWindow,"ventus",reviewedStorm,storage,{x:25,y:25});
assert.equal(savedWindow.correct,true);assert.equal(savedWindow.saved,true);
assert.equal(JSON.parse(memory.get(v5.V5)).questions[approvedWindow.id].answer,"fenestra");
assert.equal(JSON.parse(memory.get(v5.V5)).questions[approvedWindow.id].correct,true);
assert.equal(memory.get(v5.V4),'{"old":"unchanged"}');
assert.equal(memory.get(v5.SNAPSHOT),'{"snapshot":"unchanged"}');
console.log(`PASS picture exercises: ${total} unsigned keys cover all 9 scene region maps; cumulative Latin forms, inside/outside hit tests, future signed grade, storm overlapping-polygon clicks and v5 backup roundtrip.`);
