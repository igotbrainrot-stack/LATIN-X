"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const musicSrc=fs.readFileSync(path.join(root,"content/music.js"),"utf8");
const synthSrc=fs.readFileSync(path.join(root,"app/60-audio-ambience.js"),"utf8");
const scoreSrc=fs.readFileSync(path.join(root,"app/58-music-score.js"),"utf8");
const provenance=JSON.parse(fs.readFileSync(path.join(root,"curriculum/music.json"),"utf8"));
let contexts=0,createdSources=0,nextInterval=0,intervals=new Map(),saved=null;
const listeners={};
const header={appendChild(){}};
const document={
 hidden:false,querySelector:q=>q==="header"?header:null,getElementById:()=>null,
 createElement:()=>({style:{},innerHTML:""}),
 addEventListener:(kind,cb)=>{listeners[kind]=cb}
};
class FakeAudioContext{
 constructor(){contexts++;this.sampleRate=4000;this.currentTime=0.2;this.state="running";this.destination={}}
 createGain(){const node={values:[],gain:{value:1,setValueAtTime(v){node.values.push(v)},linearRampToValueAtTime(v){node.values.push(v)},exponentialRampToValueAtTime(v){node.values.push(v)},setTargetAtTime(v){node.values.push(v)}},connect(){},disconnect(){}};return node}
 createBuffer(n,len,sr){return {getChannelData:()=>new Float32Array(len)}}
 createBufferSource(){createdSources++;return {connect(){},start(){},stop(){},disconnect(){},set buffer(v){this._buf=v}}}
 resume(){this.state="running";return Promise.resolve()}
 suspend(){this.state="suspended";return Promise.resolve()}
}
const sandbox={document,AudioContext:FakeAudioContext,
 setInterval:(fn)=>{intervals.set(++nextInterval,fn);return nextInterval},
 clearInterval:id=>intervals.delete(id),Math,Date,Float32Array,globalThis:null};
sandbox.globalThis=sandbox;
vm.runInNewContext(musicSrc,sandbox,{filename:"content/music.js"});
vm.runInNewContext(scoreSrc,sandbox,{filename:"app/58-music-score.js"});
vm.runInNewContext(synthSrc,sandbox,{filename:"app/60-audio-ambience.js"});
const api=sandbox.TablinumAmbience;
assert.equal(contexts,0,"Must not create AudioContext before a gesture");
assert.equal(api.debug().activated,false);
assert.equal(provenance.scores.length,4);
assert(sandbox.TablinumMusic.pieces.every(p=>{
 const duration=sandbox.TablinumMusicScore.compile(p).totalSeconds;
 return duration>=120&&duration<=240;
}),"Every piece must last 2–4 minutes and have a complete rhythmic score");
assert(sandbox.TablinumMusic.pieces.some(p=>p.id==="seikilos-epitaph"));
api.configure({music:true,musicVolume:0.2,sfx:true,sfxVolume:0.4},(x)=>saved=x);
assert.equal(contexts,0);
listeners.pointerdown();
assert.equal(contexts,1,"AudioContext created ONLY on first gesture");
assert.equal(api.debug().playing,true);
assert(intervals.size>=1);
for(const fn of intervals.values())fn();
assert(createdSources>0,"Original pluck note buffers should be created on the first scheduled music tick");
api.duck(true);assert.equal(api.debug().ducked,true);
api.duck(false);assert.equal(api.debug().ducked,false);
api.sound("tick");
api.set({music:false});assert.equal(saved.music,false);
assert.equal(api.debug().playing,false);
api.set({sfx:false});assert.equal(saved.sfx,false);
api.set({musicVolume:0.65,sfxVolume:0.1});assert.equal(saved.musicVolume,0.65);
api.set({music:true});assert.equal(api.debug().playing,true);
api.setRecording(true);assert.equal(api.debug().recording,true);assert.equal(api.debug().playing,false);
api.setRecording(false);assert.equal(api.debug().recording,false);assert.equal(api.debug().playing,true);
document.hidden=true;listeners.visibilitychange();
assert.equal(api.debug().playing,false);
document.hidden=false;listeners.visibilitychange();
assert.equal(api.debug().playing,true);
api.activate();assert.equal(contexts,1,"One AudioContext reused");
const stateApi=require("../app/20-state-v5.js");require("../content/migration-maps.js");
const state=stateApi.migrateV4toV5({},globalThis.TablinumMigrationMaps.legacy_id_map);
assert.deepEqual(state.ui.audio,{music:true,musicVolume:0.2,sfx:true,sfxVolume:0.4});
const storage={m:new Map(),getItem(k){return this.m.has(k)?this.m.get(k):null},setItem(k,v){this.m.set(k,v)}};
state.ui.audio={music:false,musicVolume:0.45,sfx:false,sfxVolume:0.13};
const projected=stateApi.updateFromLegacy(state,stateApi.legacyView(state,globalThis.TablinumMigrationMaps.legacy_id_map),globalThis.TablinumMigrationMaps.legacy_id_map);
assert.deepEqual(projected.ui.audio,state.ui.audio,"Old UI save must not reset music and SFX settings to defaults");

assert.equal(stateApi.persist(storage,state).ok,true);
const recovered=stateApi.bootstrap(storage,globalThis.TablinumMigrationMaps.legacy_id_map);
assert.deepEqual(recovered.state.ui.audio,state.ui.audio,"v5 audio settings survive reload");
const imported=stateApi.parseBackup(stateApi.backupEnvelope(state),globalThis.TablinumMigrationMaps.legacy_id_map);
assert.deepEqual(imported.ui.audio,state.ui.audio);
assert(!/fetch\s*\(|XMLHttpRequest|https:\/\/.*\.mp3/.test(synthSrc),"No networking for WebAudio synthesis");
console.log("PASS Phase7a: original 3x 2–4m modal scores; no audio before gesture, one lazy AudioContext, duck, settings, microphone pause, hidden-tab pause, v5 backup.");
