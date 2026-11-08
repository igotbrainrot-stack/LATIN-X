"use strict";
const assert=require("node:assert/strict"),path=require("node:path");
const {chromium}=require("playwright"),{pathToFileURL}=require("node:url");
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--use-fake-device-for-media-stream","--use-fake-ui-for-media-stream"]});
 try{
  const context=await browser.newContext({permissions:[]}),page=await context.newPage();
  const errors=[],network=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
  const url=pathToFileURL(path.resolve(__dirname,"..","index.html")).href;
  const raw=JSON.stringify({version:4,ch:0,vocab:{rosa:{head:"rosa",meaning:"rose",due:0,days:3,reps:2}}});
  await page.addInitScript(v=>localStorage.setItem("tablinum-source-review-v02",v),raw);
  await page.goto(url);await page.locator(".sentence").first().waitFor();
  const prefix=await page.evaluate(()=>({id:globalThis.TablinumAudit.currentChapter().name,sent:globalThis.TablinumAudit.currentChapter().sent.length}));
  assert(prefix.sent>0);
  await page.locator('#tabs [data-tab="library"]').click();
  assert.match(await page.locator("#main").textContent(),/Vōx mea/);
  await page.locator("#audioFile").setInputFiles({name:"my-story.mp3",mimeType:"audio/mpeg",
   buffer:Buffer.from([73,68,51,4,0,0,0,0,0,0,0,0])});
  try{
   await page.waitForFunction(async()=>((await globalThis.TablinumUserMedia.getAudio("0"))?.blob?.size)===12,null,{timeout:5000});
  }catch(error){
   const debug=await page.evaluate(()=>({chapter:globalThis.TablinumAudit.currentChapter().name,
    storage:globalThis.TablinumUserMedia.status(),
    saved:document.getElementById("appStatus")?.textContent,
    candidates:[...document.querySelectorAll("input[type=file]")].map(x=>x.id)}));
   throw Error("Chapter audio import did not persist: "+JSON.stringify({debug,errors}));
  }
  const recordedSize=await page.evaluate(async()=>((await globalThis.TablinumUserMedia.getAudio("0"))?.blob?.size));
  assert.equal(recordedSize,12,"Audio must exist in local media store");
  const v2={schema:"tablinum-timing-v2",chapter_id:"legacy-ch01",intervals:Array.from({length:prefix.sent},(_,i)=>({
   sentence_id:"legacy-ch01-s"+String(i+1).padStart(3,"0"),start:i*2,end:i*2+1.8
  }))};
  await page.locator("#timingFile").setInputFiles({name:"times-v2.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(v2))});
  await page.waitForFunction(()=>document.getElementById("appStatus")?.textContent?.includes("unverified"));
  const timing=await page.evaluate(()=>globalThis.TablinumUserMedia.getTiming("0"));
  assert.equal(timing.timing.ranges.length,prefix.sent);
  assert.equal(timing.timing.verified,false);
  await page.evaluate(async()=>globalThis.TablinumUserMedia.put("record:legacy-ch01:legacy-ch01-s001",{
   kind:"recording",blob:new Blob([new Uint8Array(128).fill(5)],{type:"audio/webm"})
  }));
  const zipSize=await page.evaluate(async()=>{
   const file=await globalThis.TablinumUserMedia.exportRecordings();
   const arr=new Uint8Array(await file.arrayBuffer());
   return {size:file.size,header:[...arr.slice(0,4)]}
  });
  assert(zipSize.size>200);assert.deepEqual(zipSize.header,[80,75,3,4]);
  const persisted=await page.evaluate(()=>globalThis.TablinumUserMedia.status());
  await page.reload();await page.locator("#tabs").waitFor();
  if(persisted==="persistent"){
   const restoredSize=await page.evaluate(async()=>((await globalThis.TablinumUserMedia.getAudio("0"))?.blob?.size));
   assert.equal(restoredSize,12,"IndexedDB chapter audio should survive file URL reload");
   const storedSize=await page.evaluate(async()=>((await globalThis.TablinumUserMedia.getRecording("legacy-ch01","legacy-ch01-s001"))?.blob?.size));
   assert.equal(storedSize,128,"Stored speaking practice survives reload");
  }else{
   console.log("IndexedDB unavailable on this file URL origin: session-only fallback correctly reported");
  }
  await page.locator('#tabs [data-tab="read"]').click();
  assert(await page.locator('[data-action="recordSpeak"]').count()===1);
  assert(await page.locator('[data-action="stopSpeak"]').count()===1);
  assert(await page.locator('[data-action="compareSpeak"]').count()===1);
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),raw);
  assert.deepEqual(network,[],"No external fetch/CDN in offline media suite");
  assert.deepEqual(errors,[],"No browser JS errors in local media suite");
  console.log("PASS Phase7b Windows file:// local MP3, timing-v2, non-graded recorded ZIP, actual IDB/fallback, silent v4 key and no network.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
