/* Phase 3b: classic-script chapter loader. No fetch(), modules or network service.
 * Phase 2 compiler currently writes data-only globalThis.TablinumCompiledContent
 * assignments; this bridge also accepts future registerChapter(data) scripts. */
(function(global){
"use strict";
const compiled=global.TablinumCompiledContent||(global.TablinumCompiledContent=Object.create(null));
const tablinum=global.Tablinum||(global.Tablinum=Object.create(null));
const files=new Map(),chapters=new Map(),pending=new Map();
const failures=[];
function recordFailure(message){
 if(!failures.includes(message))failures.push(message);
 const region=typeof document==="object"&&document.getElementById?document.getElementById("appStatus"):null;
 if(region)region.textContent=message;
}
function safeEntry(entry){
 return !!entry&&typeof entry==="object"&&
  /^(?:legacy-ch\d{2}|b0[1-3]-c\d{3})$/.test(entry.id||"")&&
  /^content\/(?:legacy\/ch\d{2}|b0[1-3]\/c\d{3})\.js$/.test(entry.script||"")&&
  typeof entry.title==="string"&&typeof entry.source_hash==="string"&&
  /^[a-f0-9]{64}$/.test(entry.source_hash)&&
  (entry.legacy===true||entry.legacy===false);
}
function importCatalogue(){
 const catalogue=compiled.catalogue;
 if(!catalogue||catalogue.schema!=="tablinum-content-catalogue-v1"||!Array.isArray(catalogue.entries)){
  recordFailure("Missing or invalid content/catalogue.js. Re-extract the complete Tablinum ZIP.");
  return;
 }
 for(const item of catalogue.entries){
  if(!safeEntry(item)||files.has(item.id)){
   recordFailure("Invalid chapter catalogue entry; please reinstall the complete Tablinum ZIP.");
   files.clear();return;
  }
  files.set(item.id,Object.freeze({...item}));
 }
}
function validChapter(chapter,expected){
 return !!chapter&&typeof chapter==="object"&&chapter.schema==="tablinum-lesson-v1"&&
  chapter.id===expected&&
  (chapter.legacy===true&&chapter.status==="legacy_unreviewed"&&
   chapter.legacy_source&&Array.isArray(chapter.legacy_source.sent)&&Array.isArray(chapter.legacy_source.q)||
   chapter.legacy!==true&&chapter.status==="approved");
}
function freezeLesson(x){if(x&&typeof x==="object"&&!Object.isFrozen(x)){for(const v of Object.values(x))freezeLesson(v);Object.freeze(x)}return x}
function registerChapter(chapter){
 const id=chapter&&chapter.id,entry=files.get(id);
 if(!entry)throw Error("Unlisted chapter: "+String(id));
 if(!validChapter(chapter,id)||!!chapter.legacy!==entry.legacy)throw Error("Invalid compiled chapter "+id);
 const existing=chapters.get(id);
 if(existing){if(existing!==chapter)throw Error("Duplicate registered chapter "+id);return existing}
 if(chapter.legacy)freezeLesson(chapter.legacy_source);
 chapters.set(id,Object.freeze(chapter));
 compiled[id]=chapter;
 const wait=pending.get(id);
 if(wait){pending.delete(id);wait.resolve(chapter)}
 return chapter;
}
function loadChapter(id){
 const cached=chapters.get(id);if(cached)return Promise.resolve(cached);
 if(pending.has(id))return pending.get(id).promise;
 const entry=files.get(id);
 if(!entry)return Promise.reject(Error("Unknown or unpublished chapter "+String(id)));
 if(compiled[id]){
  try{return Promise.resolve(registerChapter(compiled[id]))}
  catch(error){recordFailure(error.message);return Promise.reject(error)}
 }
 if(typeof document==="undefined"||!document.createElement||!document.head)
  return Promise.reject(Error("No document available to load "+entry.script));
 let resolve,reject;
 const promise=new Promise((ok,fail)=>{resolve=ok;reject=fail});
 pending.set(id,{promise,resolve,reject});
 const script=document.createElement("script");
 script.src=entry.script;
 script.async=true;
 script.onerror=()=>{
  pending.delete(id);
  const message="Missing content file "+entry.script+". Re-extract the complete Tablinum ZIP.";
  recordFailure(message);reject(Error(message));
  script.remove&&script.remove();
 };
 script.onload=()=>{
  if(!pending.has(id))return;
  if(!compiled[id]){
   pending.delete(id);
   const message="Content file "+entry.script+" loaded without a valid chapter.";
   recordFailure(message);reject(Error(message));return;
  }
  try{registerChapter(compiled[id])}
  catch(error){pending.delete(id);recordFailure(error.message);reject(error)}
 };
 document.head.appendChild(script);
 return promise;
}
function legacySourceAt(index){
 if(!Number.isInteger(index)||index<0||index>7)throw Error("Invalid legacy index "+index);
 const id="legacy-ch"+String(index+1).padStart(2,"0"),entry=files.get(id);
 let chapter=chapters.get(id);
 if(!chapter&&compiled[id]&&entry){
  try{chapter=registerChapter(compiled[id])}catch(error){recordFailure(error.message)}
 }
 if(chapter&&chapter.legacy_source)return chapter.legacy_source;
 const file=entry?entry.script:"content/legacy/ch"+String(index+1).padStart(2,"0")+".js";
 const message="Missing content file "+file+". Re-extract the complete Tablinum ZIP.";
 recordFailure(message);
 return {name:"Chapter unavailable",sub:message,scene:"book",context:message,
  explain:message,sent:[],q:[],v:[],unavailable:true};
}
tablinum.catalogue=files;
tablinum.chapters=chapters;
tablinum._pending=pending;
tablinum.errors=failures;
tablinum.registerChapter=registerChapter;
tablinum.loadChapter=loadChapter;
tablinum.legacySourceAt=legacySourceAt;
importCatalogue();
for(let index=0;index<8;index++){
 const id="legacy-ch"+String(index+1).padStart(2,"0");
 if(compiled[id]&&files.has(id)){
  try{registerChapter(compiled[id])}catch(error){recordFailure(error.message)}
 }
}
})(globalThis);
