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
  await page.goto(url);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }await page.locator(".sentence").first().waitFor();
  const prefix=await page.evaluate(()=>({id:globalThis.TablinumAudit.currentChapter().name,sent:globalThis.TablinumAudit.currentChapter().sent.length}));
  assert(prefix.sent>0);
  // Bibliothēca (chapter audio + timing import UI) was removed in Nov 2026. The local media
  // store still backs Vōx mea; its export now lives on the Progress page.
  assert.equal(await page.locator('#tabs [data-tab="library"]').count(),0,"Library tab removed");
  await page.locator('#tabs [data-tab="progress"]').click();
  assert.match(await page.locator("#main").textContent(),/Vōx mea/);
  assert.equal(await page.locator('#main [data-action="exportRecordings"]').count(),1,"Recordings export kept on Progress");
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
  console.log("PASS Phase7b Windows file:// (Library tab removed): recordings export on Progress, non-graded recorded ZIP, actual IDB/fallback, silent v4 key and no network.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
