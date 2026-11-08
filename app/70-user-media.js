/* Offline recording and imported audio store. User-owned blobs stay OUT of Git and
 * progress JSON. No fetch, no remote APIs, no grading, no automatic verification. */
(function(root){
"use strict";
const DB="tablinum-local-media-v1",STORE="media",LIMIT=100*1024*1024;
const fallback=new Map();
let dbPromise=null, recorder=null, stream=null, chunks=[],activeKey=null;
let permanent=null; // null = not checked, false = memory-only fallback
function openDB(){
 if(dbPromise)return dbPromise;
 if(!root.indexedDB){permanent=false;return Promise.resolve(null)}
 dbPromise=new Promise(resolve=>{
  let request;
  try{request=root.indexedDB.open(DB,1)}
  catch(e){permanent=false;return resolve(null)}
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"key"});
  };
  request.onsuccess=()=>{permanent=true;resolve(request.result)};
  request.onerror=()=>{permanent=false;resolve(null)};
  request.onblocked=()=>{permanent=false;resolve(null)};
 });
 return dbPromise;
}
async function put(key,item){
 if(typeof key!=="string"||key.length>256||!/^((chapter:|timing:|record:)[A-Za-z0-9:._-]+)$/.test(key))throw Error("Invalid local media key");
 if(item?.blob&&(!(item.blob instanceof Blob)||item.blob.size>LIMIT))throw Error("Audio exceeds 100 MB maximum");
 const record={...item,key,savedAt:new Date().toISOString()};
 fallback.set(key,record);
 const db=await openDB();
 if(!db)return {stored:"temporary",key};
 try{
  await new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,"readwrite");
   t.objectStore(STORE).put(record);
   t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error("Storage failed"));
   t.onabort=()=>reject(t.error||Error("Storage cancelled"));
  });
  return {stored:"persistent",key};
 }catch(e){permanent=false;return {stored:"temporary",key}}
}
async function get(key){
 if(fallback.has(key))return fallback.get(key);
 const db=await openDB();if(!db)return null;
 try{
  return await new Promise(resolve=>{
   const t=db.transaction(STORE,"readonly"),request=t.objectStore(STORE).get(key);
   request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>resolve(null);
  });
 }catch(e){return null}
}
async function all(){
 const db=await openDB();
 if(!db)return [...fallback.values()];
 try{
  const rows=await new Promise(resolve=>{
   const r=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
   r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>resolve([]);
  });
  const m=new Map(rows.map(row=>[row.key,row]));
  for(const [k,row] of fallback)m.set(k,row);
  return [...m.values()];
 }catch(e){return [...fallback.values()]}
}
async function remove(key){
 fallback.delete(key);
 const db=await openDB();if(!db)return false;
 try{
  await new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,"readwrite");t.objectStore(STORE).delete(key);
   t.oncomplete=resolve;t.onerror=()=>reject(t.error);
  });
  return true;
 }catch(e){return false}
}
const chapterKey=id=>"chapter:"+id;
const timingKey=id=>"timing:"+id;
const recordingKey=(chapter,sentence)=>"record:"+chapter+":"+sentence;
function sentenceIds(chapter){
 return (chapter?.segments||[]).flatMap(seg=>(seg.sentences||[]).map(s=>s.id));
}
function validateTimingV2(data,chapter,duration=NaN){
 if(!data||data.schema!=="tablinum-timing-v2"||data.chapter_id!==chapter?.id)
  throw Error("Timing-v2 requires the matching chapter_id and schema");
 const ids=sentenceIds(chapter);
 if(!ids.length||!Array.isArray(data.intervals)||data.intervals.length!==ids.length)
  throw Error("One actual timing interval per displayed sentence is required");
 const seen=new Set();let end=0;
 const intervals=data.intervals.map((x,i)=>{
  if(!x||x.sentence_id!==ids[i]||seen.has(x.sentence_id)||
    !Number.isFinite(x.start)||!Number.isFinite(x.end)||x.start<0||
    x.end<=x.start||x.start<end)throw Error("Invalid or mismatched sentence timing "+i);
  if(Number.isFinite(duration)&&duration>0&&x.end>duration+0.5)throw Error("Timing exceeds audio duration");
  seen.add(x.sentence_id);end=x.end;
  return {start:x.start,end:x.end};
 });
 return {ranges:intervals,verified:false,source:"user_supplied_unverified",
  schema:data.schema,chapter_id:data.chapter_id};
}
async function saveAudio(chapter,file){
 if(!chapter||!file||!file.size||file.size>LIMIT)throw Error("Choose a recording smaller than 100 MB");
 if(!(/\.(mp3|m4a|wav|ogg|opus|webm)$/i.test(file.name)||/^audio\//.test(file.type)))
  throw Error("Choose a supported local audio recording");
 return put(chapterKey(chapter),{blob:file,name:String(file.name).slice(0,180),kind:"audio"});
}
async function getAudio(chapter){return get(chapterKey(chapter))}
async function saveTiming(chapter,data){return put(timingKey(chapter),{kind:"timing",timing:data})}
async function getTiming(chapter){return get(timingKey(chapter))}
async function startRecording(chapter,sentence,ambience){
 if(recorder&&recorder.state!=="inactive")throw Error("A recording is already running");
 if(!root.navigator?.mediaDevices?.getUserMedia||typeof root.MediaRecorder!=="function")
  throw Error("Microphone recording is not supported by this browser; try Chrome or Edge");
 if(!/^b0[1-3]-c\d{3}-s\d{3}$/.test(sentence)&&!/^legacy-ch0[1-8]-s\d{3}$/.test(sentence)&&!/^custom-s\d{3}$/.test(sentence))
  throw Error("Invalid sentence ID");
 stream=await root.navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
 try{
  const mime=["audio/webm;codecs=opus","audio/ogg;codecs=opus"].find(x=>root.MediaRecorder.isTypeSupported?.(x));
  recorder=new root.MediaRecorder(stream,mime?{mimeType:mime}:undefined);
  chunks=[];activeKey=recordingKey(chapter,sentence);
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.start(250);
  ambience?.setRecording(true);
  return {key:activeKey,started:true};
 }catch(e){stream?.getTracks().forEach(t=>t.stop());stream=null;ambience?.setRecording(false);throw e}
}
async function stopRecording(ambience){
 const r=recorder,which=activeKey;
 if(!r||r.state==="inactive")throw Error("No microphone recording in progress");
 return await new Promise((resolve,reject)=>{
  r.onerror=e=>{cleanup();reject(e.error||Error("Microphone failed"))};
  r.onstop=async()=>{
   const blob=new Blob(chunks,{type:r.mimeType||"audio/webm"});
   cleanup();
   if(!blob.size)return reject(Error("Recording was empty"));
   try{resolve(await put(which,{blob,kind:"recording",mime:blob.type}))}catch(e){reject(e)}
  };
  function cleanup(){
   stream?.getTracks().forEach(t=>t.stop());
   stream=null;recorder=null;activeKey=null;chunks=[];ambience?.setRecording(false);
  }
  try{r.stop()}catch(e){cleanup();reject(e)}
 });
}
function isRecording(){return !!recorder&&recorder.state!=="inactive"}
async function getRecording(chapter,sentence){return get(recordingKey(chapter,sentence))}
function crc32(bytes){
 let crc=-1;
 for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xEDB88320:0)}
 return (crc^-1)>>>0;
}
function zipFiles(files){
 const enc=new TextEncoder(),chunks=[],central=[];let offset=0;
 const u16=(v)=>[v&255,(v>>>8)&255],u32=v=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];
 function append(bytes){chunks.push(Uint8Array.from(bytes));offset+=bytes.length}
 for(const file of files){
  const name=enc.encode(file.name),data=file.bytes;
  if(name.length>200||!name.length||!/^[A-Za-z0-9_.\/-]+$/.test(file.name)||file.name.includes(".."))throw Error("Unsafe recording filename");
  if(data.length>LIMIT)throw Error("Recording over size limit");
  const crc=crc32(data),start=offset;
  append([80,75,3,4,...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),
   ...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);
  append(data);
  central.push([80,75,1,2,...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),
   ...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),
   ...u16(0),...u16(0),...u32(0),...u32(start),...name]);
 }
 const position=offset;
 for(const x of central)append(x);
 append([80,75,5,6,...u16(0),...u16(0),...u16(central.length),...u16(central.length),
  ...u32(offset-position),...u32(position),...u16(0)]);
 return new Blob(chunks,{type:"application/zip"});
}
async function exportRecordings(){
 const rows=(await all()).filter(x=>x.kind==="recording"&&x.blob instanceof Blob);
 const files=[];
 for(const item of rows){
  const name=item.key.replace(/^record:/,"").replace(/[^A-Za-z0-9._-]/g,"_");
  const ext=item.blob.type.includes("ogg")?"ogg":item.blob.type.includes("mp4")?"m4a":"webm";
  files.push({name:"recordings/"+name+"."+ext,bytes:new Uint8Array(await item.blob.arrayBuffer())});
 }
 if(!files.length)throw Error("No stored speaking recordings to export");
 files.push({name:"README.txt",bytes:new TextEncoder().encode(
 "Personal speaking recordings for self-comparison only. No automatic grades or audio timing validation.\n")});
 return zipFiles(files);
}
root.TablinumUserMedia=Object.freeze({openDB,put,get,all,remove,saveAudio,getAudio,saveTiming,getTiming,
 startRecording,stopRecording,isRecording,getRecording,exportRecordings,validateTimingV2,
 status:()=>permanent===true?"persistent":permanent===false?"temporary":"not_checked",zipFiles});
if(typeof module!=="undefined"&&module.exports)module.exports=root.TablinumUserMedia;
})(globalThis);
