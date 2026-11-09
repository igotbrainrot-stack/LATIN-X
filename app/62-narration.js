/* Plays approved Chapter I and pending Chapter II–VIII recordings locally (file:// safe). One clip per sentence or word;
 * no word or sentence timing is invented. Completion is a single deterministic event per clip.
 * Missing/unplayable files report "missing" so the caller can fall back. Classic script, no network. */
(function(root){
"use strict";
const catalogue=root.TablinumNarrationCatalogue;
const status=new Map(); // file -> "installed" | "missing"
let current=null,request=0;
const preferAlternative=new Set();
const fold=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
function entry(sentenceId,text){
 if(!catalogue)return null;
 const found=catalogue.sentences.find(s=>s.sentence_id===sentenceId);
 // Guard: never play a clip for a sentence whose canonical text has changed.
 if(!found||String(text||"").normalize("NFC")!==found.canonical_text.normalize("NFC"))return null;
 return found;
}
function take(sentenceId,text){
 const found=entry(sentenceId,text);if(!found)return null;
 const alt=preferAlternative.has(sentenceId)&&found.takes.find(t=>t.role==="alternative");
 return alt||found.takes.find(t=>t.role==="default")||null;
}
/* Exact surface match (case- and macron-insensitive); inflected forms are not matched. */
function wordTake(word){
 if(!catalogue||!word)return null;
 const key=fold(word);
 return catalogue.words.find(w=>fold(w.canonical_text)===key)||null;
}
function src(t){return catalogue.base_path+t.file}
function known(t){return t?status.get(t.file)||"unknown":"none"}
function probe(t,Audio){
 if(!t)return Promise.resolve(false);
 const s=status.get(t.file);if(s)return Promise.resolve(s==="installed");
 const AudioCtor=Audio||root.Audio;if(typeof AudioCtor!=="function")return Promise.resolve(false);
 return new Promise(resolve=>{
  const a=new AudioCtor();let done=false;
  const finish=ok=>{if(done)return;done=true;status.set(t.file,ok?"installed":"missing");try{a.removeAttribute("src");a.load?.()}catch(e){}resolve(ok)};
  a.preload="metadata";
  a.addEventListener("loadedmetadata",()=>finish(true));
  a.addEventListener("error",()=>finish(false));
  a.src=src(t);a.load?.();
 });
}
function stop(){
 request++;
 if(current){const a=current.audio;current=null;try{a.pause();a.removeAttribute("src");a.load?.()}catch(e){}}
}
/* callbacks: onstart(take), onend(key) exactly once on natural completion,
 * onmissing(take, blocked) when the file cannot be played (blocked = browser autoplay refusal). */
function playTake(t,key,callbacks={}){
 if(!t||status.get(t.file)==="missing")return false;
 stop();const id=request,a=new root.Audio();
 current={audio:a,key,take:t};
 let settled=false;
 const fail=err=>{
  if(settled||id!==request)return;settled=true;current=null;
  const blocked=!!err&&err.name==="NotAllowedError";
  if(!blocked)status.set(t.file,"missing"); // a blocked autoplay is not a missing file
  callbacks.onmissing?.(t,blocked);
 };
 a.addEventListener("loadedmetadata",()=>status.set(t.file,"installed"));
 a.addEventListener("error",()=>fail(null));
 a.addEventListener("ended",()=>{
  if(settled||id!==request)return;settled=true;current=null;
  callbacks.onend?.(key);
  try{root.document?.dispatchEvent?.(new root.CustomEvent("tablinum:narration-ended",{detail:{key,clipId:t.clip_id}}))}catch(e){}
 });
 a.src=src(t);
 callbacks.onstart?.(t);
 Promise.resolve().then(()=>a.play()).catch(fail);
 return true;
}
function play(sentenceId,text,callbacks){return playTake(take(sentenceId,text),sentenceId,callbacks)}
function playWord(word,callbacks){const t=wordTake(word);return playTake(t,t?"word:"+t.canonical_text:"",callbacks)}
function setAlternative(sentenceId,on){if(on)preferAlternative.add(sentenceId);else preferAlternative.delete(sentenceId)}
function hasAlternative(sentenceId,text){const e=entry(sentenceId,text);return !!e&&e.takes.some(x=>x.role==="alternative")}
function usingAlternative(sentenceId){return preferAlternative.has(sentenceId)}
function playing(){return current?{key:current.key,clipId:current.take.clip_id}:null}
function labelFor(t,installed=true){
 const voice=t?.voice||catalogue?.voice||"Recorded voice";
 if(!installed)return "Browser voice — not "+voice;
 return voice+(t?.owner_listening==="pass"?" — approved recording":
  t?.owner_listening==="pending"?" — new recording, awaiting your review":" — local recording");
}
root.TablinumNarration=Object.freeze({labelFor,take,wordTake,src,known,probe,play,playWord,stop,setAlternative,hasAlternative,usingAlternative,playing,
 meta:catalogue?{voice:catalogue.voice,review_status:catalogue.review_status}:null});
})(typeof globalThis!=="undefined"?globalThis:this);
