/* Phase 3c: pure, additive, loss-avoiding v4 -> v5 state migration.
 * Can run under classic file:// scripts, Node and test VM without dependencies.
 * No writes to the original key tablinum-source-review-v02. */
(function(root){
"use strict";
const V4="tablinum-source-review-v02",V5="tablinum-state-v5",SNAPSHOT="tablinum-v4-snapshot";
const tabs=new Set(["read","quiz","review","library","progress"]);
const audioDefaults={music:true,musicVolume:0.2,sfx:true,sfxVolume:0.4};
function audioSettings(o){
 const v=o&&typeof o==="object"&&!Array.isArray(o)?o:{};
 const clamp=(x,d)=>Number.isFinite(Number(x))?Math.min(1,Math.max(0,Number(x))):d;
 return {music:v.music!==false,musicVolume:clamp(v.musicVolume,0.2),
  sfx:v.sfx!==false,sfxVolume:clamp(v.sfxVolume,0.4)};
}
const blockedKeys=new Set(["__proto__","prototype","constructor"]);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=o=>o&&typeof o==="object"&&!Array.isArray(o)?o:{};
const safeEntries=o=>Object.entries(object(o)).filter(([k])=>!blockedKeys.has(k));
const dict=()=>Object.create(null);
function copy(o){return JSON.parse(JSON.stringify(o))}
function text(v){return typeof v==="string"?v:""}
function chapterMap(idMap){
 const chapters=Array.isArray(idMap&&idMap.legacy_chapters)?idMap.legacy_chapters:[];
 const result=dict(),question=dict(),sentence=dict(),byId=dict();
 for(const ch of chapters){
  const n=ch.original_zero_based_index,id=ch.legacy_id;
  if(!Number.isInteger(n)||n<0||n>7||typeof id!=="string"||!/^legacy-ch0[1-8]$/.test(id))continue;
  result[String(n)]=id;byId[id]=n;
  for(const q of ch.old_storage_keys?.answers_and_correct||[])if(q.old_key&&q.id)question[q.old_key]=q.id;
  for(const q of ch.old_storage_keys?.hint_levels||[])if(q.old_key&&q.sentence_id)sentence[q.old_key]=q.sentence_id;
 }
 return {chapter:result,byId,question,sentence};
}
const legacyChapter=n=>"legacy-ch"+String(n+1).padStart(2,"0");
function migrateV4toV5(source,idMap,vocabMap){
 if(object(source).schema==="tablinum-state-v5"&&source.version===5)return copy(source);
 const raw=object(source),map=chapterMap(idMap);
 const selected=raw.ch==="custom"?"custom":map.chapter[String(raw.ch)]||"legacy-ch01";
 const view=dict(),questions=dict(),cards=dict(),legacyCards=dict(),customHints=dict(),unknown=dict();
 const knownKeys=new Set(["version","ch","sel","tab","macrons","guided","singleSentence","custom","customSentences","translations","answers","correct","notes","readingConfidence","clozeAnswers","clozeCorrect","hintLevels","vocab"]);
 const ensure=id=>{if(!own(view,id))view[id]={hints:dict(),translations:dict(),orphaned:dict()};return view[id]};
 for(const [key,val]of safeEntries(raw.notes)){
  const id=map.chapter[key]||(/^b0[1-3]-c\d{3}$/.test(key)?key:key==="custom"?"custom":null);
  if(id)ensure(id).notes=copy(val);else {ensure("v4-note:"+key).notes=copy(val);unknown["notes:"+key]=copy(val)}
 }
 for(const field of ["readingConfidence","clozeAnswers","clozeCorrect"]){
  for(const [key,val]of safeEntries(raw[field])){
   const id=map.chapter[key]||(/^b0[1-3]-c\d{3}$/.test(key)?key:key==="custom"?"custom":null);
   const dest=field==="readingConfidence"?"readingConfidence":field==="clozeAnswers"?"clozeAnswer":"clozeCorrect";
   if(id)ensure(id)[dest]=copy(val);else unknown[field+":"+key]=copy(val);
  }
 }
 for(const [key,val]of safeEntries(raw.hintLevels)){
  if(key.startsWith("custom:")){customHints[key.slice(7)]=copy(val);continue}
  const id=map.sentence[key];
  if(id){const n=key.split(":")[0];ensure(map.chapter[n]).hints[id]=copy(val)}
  else if(/^b0[1-3]-c\d{3}:\d+$/.test(key)){const id2=key.split(":")[0];ensure(id2).hints[key]=copy(val)}
  else unknown["hints:"+key]=copy(val);
 }
 for(const [key,val]of safeEntries(raw.translations)){
  const id=map.sentence[key];
  if(id){const n=key.split(":")[0];ensure(map.chapter[n]).translations[id]=copy(val)}
  else unknown["translations:"+key]=copy(val);
 }
 const allQuestions=new Set([...Object.keys(object(raw.answers)),...Object.keys(object(raw.correct))]);
 for(const key of allQuestions){
  const id=map.question[key];
  if(!id){unknown["question:"+key]={answer:raw.answers?.[key],correct:raw.correct?.[key]};continue}
  questions[id]={answer:own(object(raw.answers),key)?copy(raw.answers[key]):"",
    correct:raw.correct?.[key]===true,attempts:own(object(raw.answers),key)?1:0};
 }
 const vocabByKey=dict();
 for(const row of (Array.isArray(vocabMap?.keys)?vocabMap.keys:[])){
  if(typeof row.key==="string"&&row.status==="approved"&&typeof row.approved_lexeme_id==="string"&&row.approved_lexeme_id)vocabByKey[row.key]=row.approved_lexeme_id;
 }
 for(const [key,card] of safeEntries(raw.vocab)){
  const c=object(card),value={head:text(c.head),meaning:text(c.meaning),
   days:Number.isFinite(c.days)&&c.days>0?c.days:1,due:Number.isFinite(c.due)?c.due:0,
   reps:Number.isInteger(c.reps)&&c.reps>=0?c.reps:0};
  const lx=vocabByKey[key];
  if(lx&&!own(cards,lx+":recog")){
   cards[lx+":recog"]={...value,lexemeId:lx,direction:"recog",state:"Review",
    stability:value.days,difficulty:5,sourceKey:key};
  }else legacyCards[key]=value;
 }
 for(const [k,v]of safeEntries(raw))if(!knownKeys.has(k))unknown[k]=copy(v);
 const savedSel=Number.isInteger(raw.sel)&&raw.sel>=0?raw.sel:0;
 const selectedIndex=selected==="custom"?null:map.byId[selected];
 const selectedSentence=selected==="custom"?"custom:"+savedSel:
  (selectedIndex===undefined?"legacy-ch01":selected)+"-s"+String(savedSel+1).padStart(3,"0");
 return {schema:"tablinum-state-v5",version:5,
  ui:{chapterId:selected,sel:selectedSentence,tab:tabs.has(raw.tab)?raw.tab:"read",
   macrons:raw.macrons!==false,guided:raw.guided!==false,singleSentence:raw.singleSentence===true,audio:audioSettings(null)},
  chapters:view,questions,deck:{cards,legacyCards,log:[]},
  custom:{text:text(raw.custom),sentences:Array.isArray(raw.customSentences)?copy(raw.customSentences):[],hints:customHints},
  migratedFrom:{version:raw.version||4,unknown},
  backup:{lastExportAt:null,backupReminderDays:30}};
}
function legacyView(v5,idMap){
 const map=chapterMap(idMap),ui=object(v5.ui);
 const n=map.byId[ui.chapterId],custom=ui.chapterId==="custom";
 const selected=typeof ui.sel==="string"&&ui.sel.includes("-s")?Number(ui.sel.split("-s").pop())-1:
   typeof ui.sel==="string"&&ui.sel.startsWith("custom:")?Number(ui.sel.slice(7)):0;
 const o={version:4,ch:custom?"custom":Number.isInteger(n)?n:0,sel:Number.isInteger(selected)&&selected>=0?selected:0,
  tab:tabs.has(ui.tab)?ui.tab:"read",macrons:ui.macrons!==false,guided:ui.guided!==false,
  singleSentence:ui.singleSentence===true,translations:dict(),answers:dict(),correct:dict(),
  notes:dict(),readingConfidence:dict(),clozeAnswers:dict(),clozeCorrect:dict(),hintLevels:dict(),
  vocab:dict(),custom:text(v5.custom?.text),customSentences:Array.isArray(v5.custom?.sentences)?copy(v5.custom.sentences):[]};
 for(const [id,ch]of safeEntries(v5.chapters)){
  const number=map.byId[id],key=Number.isInteger(number)?String(number):id.startsWith("v4-note:")?id.slice(8):id,c=object(ch);
  if(own(c,"notes"))o.notes[key]=copy(c.notes);
  if(c.readingConfidence)o.readingConfidence[key]=copy(c.readingConfidence);
  if(c.clozeAnswer)o.clozeAnswers[key]=copy(c.clozeAnswer);
  if(c.clozeCorrect===true)o.clozeCorrect[key]=true;
  for(const [s,val]of safeEntries(c.hints)){
   const m=/legacy-ch0([1-8])-s(\d{3})/.exec(s);
   const name=Number.isInteger(number)&&m?number+":"+(Number(m[2])-1):s;
   o.hintLevels[name]=copy(val);
  }
  for(const [s,val]of safeEntries(c.translations)){
   const m=/legacy-ch0([1-8])-s(\d{3})/.exec(s);
   const name=Number.isInteger(number)&&m?number+":"+(Number(m[2])-1):s;
   o.translations[name]=copy(val);
  }
 }
 for(const [k,v]of safeEntries(v5.custom?.hints))o.hintLevels["custom:"+k]=copy(v);
 const reverse=dict();
 for(const [id,record]of safeEntries(v5.questions)){
  for(const [legacyKey,mapped]of Object.entries(map.question))if(mapped===id){reverse[id]=legacyKey;break}
  if(!reverse[id])continue;
  if(own(object(record),"answer")&&record.answer!=="")o.answers[reverse[id]]=copy(record.answer);
  if(record.correct===true)o.correct[reverse[id]]=true;
 }
 for(const [k,c]of safeEntries(v5.deck?.legacyCards))o.vocab[k]=copy(c);
 for(const [id,c]of safeEntries(v5.deck?.cards))if(c.sourceKey&&!own(o.vocab,c.sourceKey))o.vocab[c.sourceKey]=copy(c);
 return o;
}
function updateFromLegacy(v5,state,idMap,vocabMap=null){
 // Re-migrating a legacy UI view updates only legacy-compatible fields; all
 // other v5 data (review history, orphaned items, course chapters) are kept.
 const next=copy(v5),projection=migrateV4toV5(state,idMap,vocabMap);
 next.ui={...next.ui,...projection.ui,audio:audioSettings(next.ui.audio)}; // Legacy view cannot reset v5-only audio choices
 next.custom={...next.custom,...projection.custom};
 for(const [id,ch]of safeEntries(projection.chapters)){
  const previous=object(next.chapters[id]);
  next.chapters[id]={...previous,...ch,orphaned:previous.orphaned||dict()};
 }
 // Deletions from the old UI (reset quiz / cloze) must delete ONLY old-ID
 // records, not unrelated new-course questions or retired/orphaned data.
 const map=chapterMap(idMap);
 for(const id of Object.values(map.question))if(!own(projection.questions,id))delete next.questions[id];
 for(const [id,q]of safeEntries(projection.questions))next.questions[id]={...object(next.questions[id]),...q};
 for(const id of Object.values(map.chapter)){
  const before=next.chapters[id],current=projection.chapters[id];
  if(!before)continue;
  if(!current){
   before.hints=dict();before.readingConfidence=null;before.clozeCorrect=false;before.clozeAnswer="";
  }else{
   before.hints=current.hints||dict();
   before.translations=current.translations||dict();
   before.readingConfidence=current.readingConfidence||null;
   before.clozeAnswer=current.clozeAnswer||"";
   before.clozeCorrect=current.clozeCorrect===true;
  }
 }
 // Approved v5 cards remain approved: their legacy UI projections must
 // never be accidentally imported as duplicate unsigned legacy cards.
 const displayed=object(state.vocab);
 const approvedSourceKeys=new Set(Object.values(object(next.deck.cards))
   .map(card=>card?.sourceKey).filter(k=>typeof k==="string"));
 for(const [id,card]of safeEntries(next.deck.cards)){
  if(!card?.sourceKey)continue;
  if(!own(displayed,card.sourceKey)){
   delete next.deck.cards[id]; // Old UI explicitly deleted/reset this card.
   continue;
  }
  const shown=object(displayed[card.sourceKey]);
  next.deck.cards[id]={...card,
   due:Number.isFinite(shown.due)?shown.due:card.due,
   reps:Number.isInteger(shown.reps)&&shown.reps>=0?shown.reps:card.reps,
   days:Number.isFinite(shown.days)&&shown.days>0?shown.days:card.days};
 }
 for(const [key,card]of safeEntries(projection.deck.legacyCards)){
  if(!approvedSourceKeys.has(key))next.deck.legacyCards[key]={...object(next.deck.legacyCards[key]),...card};
 }
 for(const key of Object.keys(next.deck.legacyCards)){
  if(approvedSourceKeys.has(key)||!own(projection.deck.legacyCards,key))delete next.deck.legacyCards[key];
 }
 // Preserve initial unknown v4 fields from original migration.
 next.migratedFrom=next.migratedFrom||{version:4,unknown:dict()};
 return next;
}
function utf16Bytes(s){return s.length*2}
function persist(storage,value){
 const copyState=copy(value);
 let serialized=JSON.stringify(copyState),warning=utf16Bytes(serialized)>=3*1024*1024?"Progress exceeds 3 MB; export a backup soon.":"";
 try{storage.setItem(V5,serialized);return {ok:true,state:copyState,warning,bytes:utf16Bytes(serialized)}}
 catch(error){
  if(error&&(error.name==="QuotaExceededError"||error.name==="NS_ERROR_DOM_QUOTA_REACHED"||error.code===22)){
   const log=copyState.deck&&copyState.deck.log;
   if(Array.isArray(log)&&log.length>500){
    copyState.deck.log=log.slice(-500);serialized=JSON.stringify(copyState);
    try{storage.setItem(V5,serialized);return {ok:true,state:copyState,warning:"Storage was nearly full: kept the latest 500 review-log entries. Export a backup.",bytes:utf16Bytes(serialized)}}
    catch(ignore){}
   }
  }
  return {ok:false,state:value,warning:"Storage unavailable or full: export a backup. Current changes remain in memory.",error,bytes:utf16Bytes(serialized)};
 }
}
function validV5(data){
 return !!data&&data.schema==="tablinum-state-v5"&&data.version===5&&
  data.ui&&typeof data.ui==="object"&&!Array.isArray(data.ui)&&
  typeof data.ui.chapterId==="string"&&
  data.chapters&&typeof data.chapters==="object"&&!Array.isArray(data.chapters)&&
  data.questions&&typeof data.questions==="object"&&!Array.isArray(data.questions)&&
  data.deck&&typeof data.deck==="object"&&!Array.isArray(data.deck)&&
  data.deck.cards&&typeof data.deck.cards==="object"&&!Array.isArray(data.deck.cards)&&
  data.deck.legacyCards&&typeof data.deck.legacyCards==="object"&&!Array.isArray(data.deck.legacyCards)&&
  Array.isArray(data.deck.log)&&data.custom&&typeof data.custom==="object"&&!Array.isArray(data.custom);
}
function bootstrap(storage,idMap,vocabMap,contentReady=true){
 let rawV4,rawV5,rawSnapshot;
 try{
  rawV4=storage.getItem(V4);rawV5=storage.getItem(V5);rawSnapshot=storage.getItem(SNAPSHOT);
 }catch(e){return {state:migrateV4toV5({},idMap,vocabMap),mode:"memory",warning:"Browser storage is unavailable. Export a backup before closing.",originalV4:null}}
 if(rawV5!==null){
  try{
   const data=JSON.parse(rawV5);
   if(!validV5(data))throw Error("Invalid v5 shape");
   data.ui.audio=audioSettings(data.ui.audio);
   return {state:data,mode:"ready",warning:"",originalV4:rawV4};
  }catch(e){return {state:migrateV4toV5({},idMap,vocabMap),mode:"blocked",warning:"Saved v5 state could not be read. Restore a backup or select Re-migrate from v4; nothing was overwritten.",originalV4:rawV4}}
 }
 let decoded=null;
 if(rawV4!==null)try{decoded=JSON.parse(rawV4)}catch(e){
  return {state:migrateV4toV5({},idMap,vocabMap),mode:"blocked",warning:"Original v4 data is unreadable. No stored data has been changed. Restore a backup.",originalV4:rawV4};
 }
 const state=migrateV4toV5(decoded||{},idMap,vocabMap);
 if(!contentReady)return {state,mode:"content_missing",warning:"Chapter content is missing. Stored progress has not been modified.",originalV4:rawV4};
 try{
  if(rawV4!==null&&rawSnapshot===null)storage.setItem(SNAPSHOT,rawV4);
 }catch(e){return {state,mode:"memory",warning:"Could not preserve the original v4 snapshot. Export a backup; no migration was written.",originalV4:rawV4}}
 const result=persist(storage,state);
 return {state:result.state,mode:result.ok?"ready":"memory",warning:result.ok?
  rawV4!==null?"Progress was upgraded to v5. Export a backup now.":"Export a backup to protect your progress.":result.warning,originalV4:rawV4};
}
function backupEnvelope(state,now=new Date().toISOString()){
 return {app:"tablinum",version:5,exportedAt:now,appVersion:"0.5.0-phase3c",state:copy(state)};
}
function parseBackup(input,idMap,vocabMap,normalizeV2){
 const envelope=typeof input==="string"?JSON.parse(input):input;
 if(!envelope||!["tablinum","tablinum-v02"].includes(envelope.app)||!object(envelope.state)||Array.isArray(envelope.state))throw Error("Not a supported Tablinum backup.");
 if(envelope.version===5){
  if(envelope.app!=="tablinum"||!validV5(envelope.state))throw Error("Invalid v5 backup");
  const restored=copy(envelope.state);restored.ui.audio=audioSettings(restored.ui.audio);return restored;
 }
 if(envelope.version===4||envelope.version===2||envelope.app==="tablinum-v02"){
  const old=envelope.app==="tablinum-v02"&&typeof normalizeV2==="function"?normalizeV2(envelope.state):envelope.state;
  return migrateV4toV5(old,idMap,vocabMap);
 }
 throw Error("Unsupported Tablinum backup version");
}
const api={V4,V5,SNAPSHOT,chapterMap,migrateV4toV5,legacyView,updateFromLegacy,bootstrap,persist,parseBackup,backupEnvelope,utf16Bytes};
root.TablinumStateV5=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(globalThis);
