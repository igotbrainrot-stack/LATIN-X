"use strict";
const assert=require("node:assert/strict");
const media=require("../app/70-user-media.js");
(async()=>{
 const chapter={id:"b01-c001",segments:[{sentences:[
  {id:"b01-c001-s001"},{id:"b01-c001-s002"},{id:"b01-c001-s003"}
 ]}]};
 const v2={schema:"tablinum-timing-v2",chapter_id:chapter.id,intervals:[
  {sentence_id:"b01-c001-s001",start:0.1,end:1.2},
  {sentence_id:"b01-c001-s002",start:1.2,end:2.5},
  {sentence_id:"b01-c001-s003",start:2.7,end:3.9}
 ]};
 assert.deepEqual(media.validateTimingV2(v2,chapter).ranges.map(x=>x.end),[1.2,2.5,3.9]);
 assert.equal(media.validateTimingV2(v2,chapter).verified,false);
 assert.throws(()=>media.validateTimingV2({...v2,chapter_id:"b01-c002"},chapter),/chapter_id/);
 assert.throws(()=>media.validateTimingV2({...v2,intervals:v2.intervals.slice(0,2)},chapter),/One actual/);
 assert.throws(()=>media.validateTimingV2({...v2,intervals:[v2.intervals[0],{...v2.intervals[1],sentence_id:"b01-c001-s001"},v2.intervals[2]]},chapter),/mismatched/);
 assert.throws(()=>media.validateTimingV2(v2,chapter,3),/exceeds audio duration/);
 const sample=new Blob([Uint8Array.of(1,2,3,4)],{type:"audio/mpeg"});
 Object.defineProperty(sample,"name",{value:"my-reading.mp3"});
 const saved=await media.saveAudio(chapter.id,sample);
 assert(["temporary","persistent"].includes(saved.stored));
 assert.equal((await media.getAudio(chapter.id)).blob.size,4);
 await media.saveTiming(chapter.id,media.validateTimingV2(v2,chapter));
 assert.equal((await media.getTiming(chapter.id)).timing.verified,false);
 assert.equal(media.isRecording(),false);
 const voice=new Blob([new Uint8Array(256).fill(7)],{type:"audio/webm"});
 await media.put("record:b01-c001:b01-c001-s001",{blob:voice,kind:"recording"});
 const zip=await media.exportRecordings();
 const bytes=new Uint8Array(await zip.arrayBuffer());
 assert.deepEqual([...bytes.slice(0,4)],[80,75,3,4],"ZIP local file header must exist");
 assert(bytes.some((x,i)=>x===80&&bytes[i+1]===75&&bytes[i+2]===1&&bytes[i+3]===2),"ZIP central directory must exist");
 assert(bytes.some((x,i)=>x===80&&bytes[i+1]===75&&bytes[i+2]===5&&bytes[i+3]===6),"ZIP end record must exist");
 const snapshot=await media.getRecording("b01-c001","b01-c001-s001");
 assert.equal(snapshot.blob.size,256);
 await media.remove("chapter:"+chapter.id);
 assert.equal(await media.getAudio(chapter.id),null);
 await media.remove("record:b01-c001:b01-c001-s001");
 await assert.rejects(media.exportRecordings(),/No stored speaking recordings/);
 assert.throws(()=>media.zipFiles([{name:"../escape.txt",bytes:new Uint8Array([1])}]),/Unsafe recording filename/);
 await assert.rejects(media.saveAudio(chapter.id,{name:"bad.exe",size:12,type:"application/exe"}),/supported local audio/);
 console.log("PASS Phase7b: offline local blobs, fail-closed timing-v2 per sentence, real ungraded recording ZIP structure, removal and unsafe path rejection.");
})().catch(e=>{console.error(e);process.exitCode=1});
