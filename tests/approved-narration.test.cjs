"use strict";
/* Owner-approved Miriam narration: decision lock, bundled audio integrity, engine behaviour, reader integration.
 * Approved takes whose bytes are not in this copy must be absent (never faked) and must fall back honestly. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const ctx={};vm.runInNewContext(read("content/narration.js"),ctx,{filename:"content/narration.js"});
const cat=JSON.parse(JSON.stringify(ctx.TablinumNarrationCatalogue));
const sha=f=>crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
// 1. Final owner decisions (2026-11-09 handover).
assert.deepEqual([cat.voice,cat.model,cat.speed],["Miriam","eleven_v3",0.9]);
assert.equal(cat.review_status,"owner_accepted_listening_quality_not_latinist_verified");
const byId=Object.fromEntries(cat.sentences.map(s=>[s.sentence_id,s]));
// Five approved takes were regenerated on 2026-11-08 (original bytes unrecoverable): the approved task stays on record.
const tid=t=>t.approved_task_id||t.runway_task_id;
assert.deepEqual(byId["legacy-ch01-s007"].takes.map(t=>[t.clip_id,t.role,tid(t)]),[
 ["s007-v6b","default","7dbe3810-0cb9-435d-a1d6-bdf978821d95"],["s007-v6a","alternative","2331d77d-7aa5-400b-9084-a6593a6666c3"]],"Sentence 7: V6b default, V6a alternative (never V5b)");
assert.deepEqual(byId["legacy-ch01-s009"].takes.map(t=>[t.clip_id,tid(t)]),[["s009-v5a","68a14597-2f02-42a9-9c65-12419d7dda73"]]);
const word=Object.fromEntries(cat.words.map(w=>[w.canonical_text,w]));
assert.equal(tid(word.quoque),"8060b628-3555-4da4-b5de-499d80fdbc85");
assert.equal(word["vīlla"].clip_id,"voiceA__test-villa__v2");assert.equal(word["vīlla"].runway_task_id,"d0e9f755-d72c-4195-ae74-4aa84c8699c7");
assert.equal(word["vīlla"].regenerated,undefined,"vīlla V2 is the retrieved original");
assert.equal(word.aqua.clip_id,"voiceA__test-aqua__v3");assert.equal(tid(word.aqua),"56c069b3-6746-4400-be64-29fe0597ba3c");
const regen={"s007-v6b":"d5e56be3-5245-4a20-bcf4-fd7774aac9f8","s007-v6a":"51e15135-b26d-4ce0-a3ec-7cada1f77a80","s009-v5a":"77fb7257-a9ab-4130-83b2-c62b0df15c02",
 "quoque-v4-approved":"b22171b7-df88-471a-a2c9-fc0abf63a2db","voiceA__test-aqua__v3":"3c4763d0-784c-4519-b935-7a6f4b7a0a3b"};
const regenTakes=[...cat.sentences.flatMap(s=>s.takes),...cat.words].filter(t=>t.regenerated);
assert.deepEqual(Object.fromEntries(regenTakes.map(t=>[t.clip_id,t.runway_task_id])),regen,"Exactly the five regenerated takes carry their new task IDs");
for(const t of regenTakes){assert.notEqual(t.runway_task_id,t.approved_task_id);assert.equal(t.owner_listening,"pending");assert(t.tts_input)}
// 2. Every v1 take used is one the owner accepted; no rejected take is wired.
const review=JSON.parse(read("docs/audio/owner-original-review-2026-11-07.json")).reviews;
const accepted=new Set(review.filter(r=>r.voice_name==="Miriam"&&r.decision==="accept").map(r=>r.clip_id));
const rejected=new Set(review.filter(r=>r.decision==="reject").map(r=>r.clip_id));
const allTakes=[...cat.sentences.flatMap(s=>s.takes),...cat.words];
for(const t of allTakes){
 assert(!rejected.has(t.clip_id),"Rejected clip wired: "+t.clip_id);
 if(t.clip_id.endsWith("__v1"))assert(accepted.has(t.clip_id),"v1 take not owner-accepted: "+t.clip_id);
}
assert.equal(cat.sentences.length,9,"All nine Chapter I sentences have an approved take");
assert.equal(allTakes.filter(t=>t.clip_id.endsWith("__v1")).length,12,"All 12 owner-accepted Miriam v1 clips are used");
const ipa=JSON.parse(read("docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json")).ipa_trials.find(x=>x.clip_id==="voiceA__test-villa__v2");
const v3=JSON.parse(read("docs/audio/owner-miriam-alias-v3-review-2026-11-07.json")).v3_trials.find(x=>x.clip_id==="voiceA__test-aqua__v3");
assert.equal(ipa.decision,"accept");assert.equal(v3.decision,"accept");
// 3. Canonical text equals the locked lesson text; aliases never reach learner-facing files.
const sent=JSON.parse(read("lessons/legacy/ch01.json")).legacy_source.sent.map(x=>x[0]);
for(let i=0;i<9;i++)assert.equal(byId["legacy-ch01-s00"+(i+1)].canonical_text,sent[i]);
for(const alias of ["Lii-wia","Lee-wee-ah","Kwoh-kweh","AH-kwah","Līwia"])
 for(const f of ["lessons/legacy/ch01.json","content/legacy/ch01.js","index.html","app/legacy-runtime.js","app/62-narration.js"])
  assert(!read(f).includes(alias),"Speech alias "+alias+" leaked into "+f);
// 4. Bundled audio: present files are real MP3s, byte-identical to the verified audition originals; absent files are not faked.
const verified=JSON.parse(read("docs/audio/OWNER_UPLOADED_MP3_BINARY_VERIFICATION.json")).sha256s;
let present=0;
for(const t of allTakes){
 const f=path.join(root,cat.base_path,t.file);
 if(t.source_file){
  assert(fs.existsSync(f),"Bundled accepted clip missing: "+t.file);
  const b=fs.readFileSync(f);assert(b.length>1000&&(b.slice(0,3).toString("latin1")==="ID3"||(b[0]===0xff&&(b[1]&0xe0)===0xe0)),"Not an MP3: "+t.file);
  assert.equal(sha(f),verified[path.basename(t.source_file)],"Bundled clip differs from verified original: "+t.file);
  assert.equal(sha(f),sha(path.join(root,t.source_file)));present++;
 }else if(fs.existsSync(f)){
  const b=fs.readFileSync(f);assert(b.length>1000&&(b.slice(0,3).toString("latin1")==="ID3"||(b[0]===0xff&&(b[1]&0xe0)===0xe0)),"Installed later take is not an MP3: "+t.file);present++;
 }
}
assert(present>=12);
// The six formerly missing takes ship as real audio, pinned to the bytes verified on 2026-11-08.
const pinned={"s007-v6b.mp3":"52e8bdd751f4a4f03f52240f747492c63de14ff72b6f999961aea0271ff1b725","s007-v6a.mp3":"6e65651d0be42dfccaa1e2978e63f2f99fdaebb0d3973982ef3156c5c00d699a",
 "s009-v5a.mp3":"ed154eca1fd7d10901dcab5e3fcef10b359ae19904cf334d34758ef33a79ed81","word-quoque-v4.mp3":"f44a776316fd4e4f90e6cf9d9c3044734447e9336dd402a1039ad67156ffb56b",
 "word-villa-v2.mp3":"de406f5a0acc914657c1ef85e28d5b63cb816891c0a619be4b8ad01e236ebb7e","word-aqua-v3.mp3":"15fa561f56952305093548ef9109962efafcd4fa1872a8af858f8dcc93e20df7"};
for(const [f,h] of Object.entries(pinned)){const p=path.join(root,cat.base_path,f);assert(fs.existsSync(p),"Approved take missing: "+f);assert.equal(sha(p),h,"Take differs from verified bytes: "+f)}
assert.equal(present,allTakes.length,"Every catalogued take is present");
assert(!/_jwt=|cloudfront\.net/.test(read("content/narration.js")),"No signed URLs in the catalogue");
// 5. Engine behaviour with a mock Audio element.
function engine(){
 const made=[],events=[];
 class A{constructor(){made.push(this);this.l={};this.src="";this.paused=true;this.reject=null}
  addEventListener(n,f){(this.l[n]=this.l[n]||[]).push(f)}emit(n){for(const f of this.l[n]||[])f()}
  play(){if(this.reject)return Promise.reject(this.reject);this.paused=false;return Promise.resolve()}pause(){this.paused=true}removeAttribute(n){if(n==="src")this.src=""}load(){}}
 class CE{constructor(t,o){this.type=t;this.detail=o.detail}}
 const sb={Audio:A,CustomEvent:CE,document:{dispatchEvent:e=>events.push(e)},Promise};sb.globalThis=sb;
 vm.runInNewContext(read("content/narration.js"),sb);vm.runInNewContext(read("app/62-narration.js"),sb);
 return {N:sb.TablinumNarration,made,events};
}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 {const {N,made,events}=engine();let ends=0;
  assert.equal(N.take("legacy-ch02-s001","x"),null,"Only Chapter I has narration");
  assert.equal(N.play("legacy-ch01-s007","Livia arborem videt."),false,"Text mismatch must not play");
  N.play("legacy-ch01-s007","Līvia arborem videt.",{onend:()=>ends++});await tick();
  const a=made.at(-1);assert.equal(a.src,"audio/narration/miriam/s007-v6b.mp3");
  a.emit("ended");a.emit("ended");assert.equal(ends,1,"Exactly one completion per clip");
  assert.equal(events.length,1);assert.equal(events[0].detail.key,"legacy-ch01-s007");
  N.setAlternative("legacy-ch01-s007",true);N.play("legacy-ch01-s007","Līvia arborem videt.");await tick();
  assert.equal(made.at(-1).src,"audio/narration/miriam/s007-v6a.mp3");
  assert.equal(N.wordTake("Quoque").file,"word-quoque-v4.mp3");assert.equal(N.wordTake("villa").file,"word-villa-v2.mp3");
  assert.equal(N.wordTake("gaius").file,"word-gaius-v1.mp3");assert.equal(N.wordTake("magnam"),null,"No inflected-form guessing");
 }
 {const {N,made}=engine();let missing=0,ends=0;
  N.play("legacy-ch01-s009","Līvia laeta est.",{onmissing:()=>missing++,onend:()=>ends++});
  const a=made.at(-1);a.emit("error");a.emit("ended");
  assert.equal(missing,1);assert.equal(ends,0,"A failed clip never reports completion");
  assert.equal(N.play("legacy-ch01-s009","Līvia laeta est."),false,"Known-missing file falls straight through");
 }
 {const {N,made}=engine();let blocked=null;
  N.play("legacy-ch01-s001","Hic est hortus.",{onmissing:(t,b)=>blocked=b});made.at(-1).reject={name:"NotAllowedError"};await tick();
  assert.equal(blocked,true);assert.notEqual(N.known(N.take("legacy-ch01-s001","Hic est hortus.")),"missing","Autoplay block is not a missing file");
 }
 // 6. Reader integration.
 const present=new Set(fs.readdirSync(path.join(root,cat.base_path)));
 const nodes=new Map(),ev={},spoken=[],audios=[];
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,value:"",textContent:"",dataset:{},classList:{toggle(){}},setAttribute(){},focus(){},addEventListener(){},querySelector:()=>null,set innerHTML(v){this._h=v},get innerHTML(){return this._h||""}});return nodes.get(id)};
 const dockBtns={};
 const mkBtn=action=>({dataset:{action},textContent:"",hidden:false,attrs:{},parentElement:{style:{}},setAttribute(k,v){this.attrs[k]=v},
  insertAdjacentHTML(pos,html){const m=html.match(/data-action="(\w+)"/);dockBtns[m[1]]=mkBtn(m[1]);dockBtns[m[1]].hidden=/\bhidden\b/.test(html)}});
 dockBtns.play=mkBtn("play");dockBtns.pause=mkBtn("pause");
 const document={getElementById:node,createElement:()=>({id:"",setAttribute(){}}),querySelector:q=>{const m=q.match(/\.dock \[data-action='(\w+)'\]/);return m?dockBtns[m[1]]||null:q==="footer"?node("footer"):null},querySelectorAll:()=>[],addEventListener:(n,f)=>ev[n]=f,activeElement:null,body:{insertBefore(){},appendChild(){}},dispatchEvent(){}};
 // Simulated file system: a clip loads only if its MP3 really is in audio/narration/miriam.
 class AM{constructor(){audios.push(this);this.l={};this.currentTime=0;this.duration=NaN;this._src="";this.paused=true}
  get src(){return this._src}set src(v){this._src=v;const f=String(v).split("/").pop();if(String(v).startsWith("audio/narration/"))setImmediate(()=>this.emit(present.has(f)?"loadedmetadata":"error"))}
  addEventListener(n,f){(this.l[n]=this.l[n]||[]).push(f)}emit(n){for(const f of this.l[n]||[])f()}
  play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}load(){}removeAttribute(n){if(n==="src")this._src=""}}
 const synth={speak:u=>spoken.push(u.text),cancel(){},getVoices:()=>[]};
 const storage=new Map();
 const sb={document,window:{speechSynthesis:synth},speechSynthesis:synth,SpeechSynthesisUtterance:function(t){this.text=t},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))},
  Audio:AM,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o?.detail}},FileReader:class{},URL:{createObjectURL:()=>"blob:x",revokeObjectURL(){}},confirm:()=>true,setTimeout(){},console,requestAnimationFrame:()=>0,cancelAnimationFrame(){},Promise};
 const html=read("index.html"),srcs=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]).filter(f=>f!=="app/80-accessibility.js");
 assert(srcs.indexOf("content/narration.js")<srcs.indexOf("app/62-narration.js")&&srcs.indexOf("app/62-narration.js")<srcs.indexOf("app/legacy-runtime.js"));
 for(const f of srcs)vm.runInNewContext(read(f),sb,{filename:f});
 const before=JSON.stringify([...storage.entries()].filter(([k])=>k!=="tablinum-state-v5"));
 const click=d=>ev.click({target:{closest:()=>({dataset:d,closest:()=>({dataset:{sentenceContainer:"4"}})})}});
 const playing=()=>audios.filter(a=>!a.paused&&a.src.startsWith("audio/narration/")).at(-1);
 const settle=async()=>{for(let i=0;i<6;i++)await tick()};
 click({ch:"0"});click({tab:"read"});
 click({sentence:"0"});await settle();
 let a=playing();assert(a&&a.src.endsWith("s001-v1.mp3"),"Sentence 1 plays Miriam");assert.equal(spoken.length,0);
 assert.equal(node("audioMode").textContent,"Miriam — approved recording");
 // Reading on: clip end moves to the next sentence and keeps reading while Miriam clips exist.
 a.paused=true;a.emit("ended");await settle();
 a=playing();assert(a&&a.src.endsWith("s002-v1.mp3"),"Clip end advances to sentence 2");
 const state=()=>JSON.parse(storage.get("tablinum-state-v5"));
 assert.equal(state().ui.sel,"legacy-ch01-s002");
 // Sentence 6 ends; sentence 7's file presence decides whether reading continues.
 click({sentence:"5"});await settle();a=playing();assert(a.src.endsWith("s006-v1.mp3"));
 a.paused=true;a.emit("ended");await settle();
 assert.equal(state().ui.sel,"legacy-ch01-s007","Highlight moves to sentence 7");
 if(!present.has("s007-v6b.mp3")){
  assert(!playing()||!playing().src.endsWith("s007-v6b.mp3"));
  assert.equal(spoken.length,0,"Never switches to the browser voice on its own");
  click({action:"play"});await settle();
  assert.deepEqual([...spoken],["Līvia arborem videt."],"Missing V6b: browser voice reads canonical text");
  assert(node("appStatus").textContent.includes("not Miriam"));
  assert.equal(node("audioMode").textContent,"Browser voice — not Miriam");
 }else{
  assert(playing().src.endsWith("s007-v6b.mp3"),"Installed V6b plays on");
 }
 // Word lookup button: only for words with an installed approved clip.
 click({word:"magna"});await settle();
 assert(node("help").innerHTML.includes('data-action="hearWord"'),"magna has Miriam's accepted word clip");
 click({action:"hearWord"});await settle();assert(playing().src.endsWith("word-magna-v1.mp3"));
 click({word:"Līvia"});await settle();assert(!node("help").innerHTML.includes('data-action="hearWord"'),"No word button without an approved word clip");
 // Other chapters keep the browser voice; learner data untouched apart from v5 state.
 click({ch:"1"});click({sentence:"0"});await settle();
 assert.equal(node("audioMode").textContent,"Browser voice — not Miriam");
 assert.equal(JSON.stringify([...storage.entries()].filter(([k])=>k!=="tablinum-state-v5")),before,"No other stored learner data changed");
 console.log("PASS approved narration: final owner decisions locked; "+present.size+" files in audio/narration/miriam ("+allTakes.filter(t=>fs.existsSync(path.join(root,cat.base_path,t.file))).length+"/"+allTakes.length+" approved clips present, all SHA-verified); no rejected takes or aliases; one completion per clip; read-on stops before non-Miriam sentences; honest fallbacks; word button.");
})().catch(e=>{console.error(e);process.exit(1)});
