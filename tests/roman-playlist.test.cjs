"use strict";
/* Roman MP3 crossfade, volume, ducking, pause and WebAudio fallback.
 * All tested without external URLs or an actual audio device. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),src=f=>fs.readFileSync(path.join(root,f),"utf8");
const created=[],intervals=new Map(),gainTargets=[],events={};
let time=0,serial=0,contexts=0;
class AudioMock{
 constructor(url){this.src=url;this.volume=0;this.paused=true;this.duration=173;this.currentTime=0;this.events={};created.push(this)}
 addEventListener(name,fn){(this.events[name]||=[]).push(fn)}
 play(){this.paused=false;return Promise.resolve()}
 pause(){this.paused=true}
 removeAttribute(name){if(name==="src")this.src=""}
 load(){}
 emit(name){for(const fn of this.events[name]||[])fn()}
}
class AudioContextMock{
 constructor(){contexts++;this.currentTime=0;this.state="running";this.sampleRate=4000;this.destination={}}
 createGain(){const g={value:0,setTargetAtTime:v=>gainTargets.push(v),setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};return{gain:g,connect(){},disconnect(){}}}
 createBuffer(n,size){return{getChannelData:()=>new Float32Array(size)}}
 createBufferSource(){return{connect(){},start(){},stop(){},disconnect(){}}}
 resume(){this.state="running";return Promise.resolve()}
 suspend(){this.state="suspended";return Promise.resolve()}
}
const doc={hidden:false,querySelector:q=>q==="header"?{appendChild(){}}:null,getElementById:()=>null,createElement:()=>({style:{},innerHTML:""}),addEventListener:(n,fn)=>events[n]=fn};
const sandbox={Audio:AudioMock,AudioContext:AudioContextMock,document:doc,Float32Array,
 setInterval:fn=>{const id=++serial;intervals.set(id,fn);return id},clearInterval:id=>intervals.delete(id),
 performance:{now:()=>time*1000},Date,Math,Promise};
sandbox.globalThis=sandbox;
for(const file of ["content/music.js","app/58-music-score.js","app/60-audio-ambience.js"])vm.runInNewContext(src(file),sandbox,{filename:file});
const A=sandbox.TablinumAmbience;
assert.equal(created.length,0,"No audio before a gesture");
assert.equal(contexts,0,"No WebAudio context before a gesture");
A.configure({music:true,musicVolume:.2,sfx:true,sfxVolume:.4});
events.pointerdown();
assert.equal(contexts,1);
assert.equal(created.length,1);
assert.equal(created[0].src,"assets/audio/roman/hortus-quietus.mp3");
assert(created[0].volume>0&&created[0].volume<=.0761,"Quiet starting level");
assert.equal(created[0].paused,false);
const pulse=()=>{for(const fn of [...intervals.values()])fn()};
created[0].currentTime=167;pulse();
assert.equal(created.length,2,"Second track should be prepared before the first ends");
assert(created[1].src.endsWith("ad-lucernam.mp3"));
time=4;pulse();assert(created[0].volume>0&&created[1].volume>0,"Overlapping volumes during fade");
A.duck(true);
assert(created[0].volume+created[1].volume<=.0093,"Narration ducks background music");
A.duck(false);
time=9;pulse();assert(created[0].paused,"First track stops after 8-second crossfade");
assert(!created[1].paused,"Second track continues");
A.set({music:false});assert(created[1].paused,"Music off pauses MP3");
A.set({music:true});assert(!created[1].paused,"Music on resumes MP3");
created[1].emit("error");assert.equal(A.debug().playing,true,"Failed MP3 resumes original WebAudio score");
assert(intervals.size>0);
console.log("PASS Roman playlist: soft playback, 8s overlap, ducking, pause/resume and WebAudio fallback.");
