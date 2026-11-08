"use strict";
/* Runtime-only test harness for the *unchanged* self-contained v0.4.2 HTML app.
 * Mimics the app's DOM hooks and data actions; no mutation of the application.
 * Real browser behaviour is tested separately in file-url-smoke.cjs. */
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const indexPath=path.join(__dirname,"..","..","index.html");
assert(fs.readFileSync(indexPath,"utf8").includes('<script src="app/legacy-runtime.js"></script>'),"Missing classic script src");
const script=fs.readFileSync(path.join(__dirname,"..","..","app","legacy-runtime.js"),"utf8");
assert(script,"Legacy inline JavaScript was not found");
new vm.Script(script,{filename:"tablinum-inline.js"});

function createHarness(initialRaw="{}"){
 const elements=new Map(),events=Object.create(null),audioEvents=Object.create(null),downloads=[],writes=[];
 let stored=String(initialRaw),blobNumber=0,lastBlob=null,rafCounter=0;
 const stateStore=new Map([["tablinum-source-review-v02",stored]]);
 const frames=new Map();
 function element(id){
  if(!elements.has(id)){
   const e={id,value:"",textContent:"",dataset:{},classList:{toggle(){}},
    setAttribute(){},focus(){},addEventListener(){},
    set innerHTML(value){this._html=String(value)},
    get innerHTML(){return this._html||""}};
   elements.set(id,e);
  }
  return elements.get(id);
 }
 const doc={
  getElementById:element,
  createElement(tag){
   const node={id:"",download:"",href:"",dataset:{},setAttribute(){},remove(){},addEventListener(){}};
   if(tag==="a")node.click=function(){
    downloads.push({filename:this.download,content:lastBlob?String(lastBlob.parts[0]):""});
   };
   return node;
  },
  querySelector:q=>q==="footer"?element("footer"):null,
  querySelectorAll:()=>[],
  addEventListener:(type,cb)=>{events[type]=cb},
  activeElement:null,
  body:{insertBefore(){},appendChild(){}}
 };
 class AudioMock{
  constructor(){this.currentTime=0;this.duration=NaN;this.src="";this.paused=true}
  pause(){this.paused=true}
  play(){this.paused=false;return Promise.resolve()}
  load(){}
  removeAttribute(key){if(key==="src")this.src=""}
  addEventListener(k,fn){audioEvents[k]=fn}
 }
 class FileReaderMock{readAsText(file){this.result=file.contents;this.onload?.()}}
 class BlobMock{constructor(parts,opts){this.parts=parts;this.type=opts?.type||"";lastBlob=this}}
 const localStorage={
  getItem(key){return stateStore.has(key)?stateStore.get(key):null},
  setItem(key,value){
   if(key==="tablinum-source-review-v02")throw Error("Original v4 state may NEVER be overwritten");
   stateStore.set(key,String(value));writes.push({key,value:String(value)});
  }
 };
 const window={};
 const sandbox={
  document:doc,window,localStorage,Audio:AudioMock,FileReader:FileReaderMock,
  Blob:BlobMock,URL:{createObjectURL:()=>("blob:test/"+(++blobNumber)),revokeObjectURL(){}},
  confirm:()=>true,setTimeout(){},clearTimeout(){},console,
  requestAnimationFrame(fn){frames.set(++rafCounter,fn);return rafCounter},
  cancelAnimationFrame(id){frames.delete(id)}
 };
 for(const source of ["content/catalogue.js","content/lexicon.js","content/migration-maps.js","app/20-state-v5.js",...Array.from({length:8},(_,i)=>"content/legacy/ch"+String(i+1).padStart(2,"0")+".js"),"app/30-content-loader.js","app/50-exercises.js","vendor/ts-fsrs.umd.js","app/55-review-deck.js","content/illustrations.js","app/64-art-scenes.js","content/music.js","app/58-music-score.js","app/60-audio-ambience.js","app/70-user-media.js"]){
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..","..",source),"utf8"),sandbox,{filename:source,timeout:5000});
 }
 vm.runInNewContext(script,sandbox,{filename:"app/legacy-runtime.js",timeout:5000});
 assert(window.TablinumAudit,"TablinumAudit test API missing");
 const click=(dataset)=>events.click({target:{closest:selector=>selector==="button"?{dataset}:null}});
 const change=(id,contents)=>events.change({target:{id,files:[{name:"backup.json",size:Buffer.byteLength(contents,"utf8"),contents}]}});
 return{
  api:window.TablinumAudit,
  get raw(){return stored},
  v5(){const raw=stateStore.get("tablinum-state-v5");return raw?JSON.parse(raw):null},
  state(){
   const raw=stateStore.get("tablinum-state-v5");
   if(!raw)return JSON.parse(stored);
   return sandbox.TablinumStateV5.legacyView(JSON.parse(raw),sandbox.TablinumMigrationMaps.legacy_id_map);
  },
  get savedKeys(){return Array.from(stateStore.keys())},
  click,change,
  downloads,writes,elements,events,audioEvents,
  localStorage
 };
}
module.exports={createHarness};
