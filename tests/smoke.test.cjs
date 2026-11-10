"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync("index.html","utf8");
assert(html.includes('<script src="app/legacy-runtime.js"></script>'),"Missing classic external app script tag");
const script=fs.readFileSync("app/legacy-runtime.js","utf8");
assert(script,"Missing app script");new vm.Script(script,{filename:"Tablinum-index.html"});
const nodes=new Map(),events={},audioEvents={},frames=new Map();let renders=0,lastAudio,blobIndex=0,frameId=0;
function node(id){
 if(!nodes.has(id))nodes.set(id,{id,value:"",textContent:"",dataset:{},classList:{toggle(){}},setAttribute(){},focus(){},addEventListener(){},
 set innerHTML(v){this._html=v;if(id==="main")renders++},
 get innerHTML(){return this._html||""}});
 return nodes.get(id);
}
const document={getElementById:node,createElement:()=>({id:"",setAttribute(){}}),querySelector:q=>q==="footer"?node("footer"):null,querySelectorAll:()=>[],addEventListener:(name,fn)=>events[name]=fn,activeElement:null,body:{insertBefore(){},appendChild(){}}};
class AudioMock{constructor(){lastAudio=this;this.currentTime=0;this.duration=NaN;this.src="";this.paused=true}pause(){this.paused=true}play(){this.paused=false;return Promise.resolve()}load(){}removeAttribute(name){if(name==="src")this.src=""}addEventListener(name,fn){audioEvents[name]=fn}}
class FileReaderMock{readAsText(file){this.result=file.contents;this.onload?.()}}
let stored=JSON.stringify({ch:'<img src=x onerror=alert(1)>',notes:null,vocab:"bad",answers:"bad"});
const storage=new Map([["tablinum-source-review-v02",stored]]);
const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>{assert.notEqual(key,"tablinum-source-review-v02","Do not rewrite original v4 data");storage.set(key,String(value))}},window={};
const sandbox={document,window,localStorage,Audio:AudioMock,FileReader:FileReaderMock,URL:{createObjectURL:()=>("blob:test/"+(++blobIndex)),revokeObjectURL(){}},confirm:()=>true,setTimeout(){},console,requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId},cancelAnimationFrame:id=>frames.delete(id)};
const sources=["content/catalogue.js","content/lexicon.js","content/migration-maps.js","app/20-state-v5.js",...Array.from({length:8},(_,i)=>"content/legacy/ch"+String(i+1).padStart(2,"0")+".js"),"app/30-content-loader.js","app/50-exercises.js","vendor/ts-fsrs.umd.js","app/55-review-deck.js","content/illustrations.js","app/64-art-scenes.js","content/music.js","app/58-music-score.js","app/60-audio-ambience.js","app/70-user-media.js"];
for(const source of sources){vm.runInNewContext(fs.readFileSync(source,"utf8"),sandbox,{filename:source})}
vm.runInNewContext(script,sandbox,{filename:"app/legacy-runtime.js"});
const api=window.TablinumAudit;assert(api);
const state=()=>sandbox.TablinumStateV5.legacyView(JSON.parse(storage.get("tablinum-state-v5")),sandbox.TablinumMigrationMaps.legacy_id_map),click=data=>events.click({target:{closest:()=>({dataset:data})}}),change=(id,file)=>events.change({target:{id,files:[file]}});
assert.equal(api.chapterCount(),8);assert.equal(api.questions(),24);assert.equal(api.cloze(),8);
for(let chapter=0;chapter<api.chapterCount();chapter++){
 const short=api.lessonAt(chapter).q.find(q=>q[1]===null);
 assert(short,"Each introductory chapter should have a written question");
 assert(Array.isArray(short[2])&&short[2].length>=3,"Existing three correct written answers must remain, with approved additions allowed");
 for(const answer of short[2])assert(api.correctAnswer(short,answer),"Explicit correct answer should be accepted");
 assert(!api.correctAnswer(short,"nōn "+short[2][0]),"Incorrect negation must not pass");
}

assert(!script.includes("const latinClues=["),"Unreviewed Latin hint map should be removed");
for(let i=0;i<api.chapterCount();i++){const ch=api.lessonAt(i);for(let j=0;j<ch.sent.length;j++)assert.equal(api.contextualClue(ch,j),j===0?ch.context:ch.sent[j-1][0])}
assert.equal(state().ch,0);assert.equal(typeof state().notes,"object");assert.equal(typeof state().vocab,"object");
assert(api.correctAnswer(["x",null,"magna","Arbor magna est."],"Arbor magna est."));
assert(!api.correctAnswer(["x",null,"magna","Arbor magna est."],"non magna"));
assert.equal(api.splitSentences("M. Tullius videt. Titus currit.").length,2);
click({tab:"library"});node("customText").value="Hic est hortus. Puella est.";click({action:"importText"});
assert.equal(state().ch,"custom");assert.equal(state().customSentences.length,2);
click({action:"prevChapter"});assert.equal(state().ch,0);
click({guided:"0"});assert.equal(state().hintLevels["0:0"],1);
assert(node("main").innerHTML.includes("hint-words"),"Context clues should be word-clickable");
click({action:"guide"});assert(node("main").innerHTML.includes("hidden data-guided"),"Guidance-off buttons should be hidden");
click({guided:"0"});assert.equal(state().hintLevels["0:0"],1,"Guidance-off should not change hint level");
click({action:"guide"});
click({ch:"1"});click({ch:"0"});assert.equal(state().hintLevels["0:0"],1);
click({tab:"quiz"});click({choice:"0",value:"wrong"});assert(!state().correct["0:0"]);
click({choice:"0",value:"in hortō"});assert(state().correct["0:0"]);
click({choice:"0",value:"wrong"});assert.equal(state().answers["0:0"],"in hortō");
node("clozeInput").value="arbor";click({action:"clozeCheck"});assert(state().clozeCorrect["0"]);
change("audioFile",{name:"speech.mp3",size:500});assert(node("audioMode").textContent.includes("unsynchronized"));
lastAudio.currentTime=10;click({tab:"read"});click({sentence:"4"});assert.equal(lastAudio.currentTime,10);
assert.throws(()=>api.validateRanges([{start:0,end:3},{start:2,end:4}],2,5));
change("timingFile",{name:"timing.json",size:500,contents:JSON.stringify(Array.from({length:9},(_,i)=>({start:i*4,end:i*4+3})))});
assert(node("audioMode").textContent.includes("timing supplied"));
click({action:"forward"});assert.equal(lastAudio.currentTime,20);
const before=renders;lastAudio.currentTime=25;audioEvents.timeupdate();assert.equal(renders,before);
assert(api.correctAnswer(api.lessonAt(1).q[2],"Quattuor hominēs in vīllā habitant."));
assert(!api.correctAnswer(api.lessonAt(1).q[2],"nōn quattuor"));
click({action:"singleSentence"});click({action:"play"});audioEvents.play?.();
assert(frames.size>0,"One-sentence monitor should schedule animation frame");
lastAudio.currentTime=state().sel*4+3-0.015;
const firstFrame=frames.entries().next().value;frames.delete(firstFrame[0]);firstFrame[1]();
assert(lastAudio.paused,"One-sentence mode should pause near sentence interval end");
const bad=api.normalizeState({ch:"<img src=x>",notes:null,vocab:"oops",tab:"invalid"});
assert.equal(bad.ch,0);assert.equal(bad.tab,"read");assert.equal(Object.keys(bad.notes).length,0);
// Arrow-key movement must work inside a story sentence and inside a level-one hint.
function testArrowNavigation(selector,key,expected){
 let focus=null,prevented=false;
 const group={querySelectorAll:()=>[first,second]};
 const first={tabIndex:0,focus(){focus="first"},matches:v=>v===".word",closest:q=>q.includes(selector)?group:null};
 const second={tabIndex:-1,focus(){focus="second"},matches:v=>v===".word",closest:q=>q.includes(selector)?group:null};
 events.keydown({key,target:first,preventDefault(){prevented=true}});
 assert.equal(focus,expected);
 assert(prevented,"Arrow should prevent page scrolling");
}
testArrowNavigation(".words","ArrowRight","second");
testArrowNavigation(".hint-words","ArrowRight","second");
console.log("PASS: v0.4.2 course, state, all explicit short-answer variants, navigation, keyboard hint arrows and timed/untimed audio checks");
console.log("NOT TESTED: real browser, real audio, voice, complete Latin accuracy, CSS/accessibility");
