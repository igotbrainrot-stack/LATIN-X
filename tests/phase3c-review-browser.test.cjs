"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const url=pathToFileURL(path.resolve(__dirname,"..","index.html")).href;
  const context=await browser.newContext(),page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const lesson={schema:"tablinum-lesson-v1",id:"b01-c001",chapter:1,status:"approved",legacy:false,title:"Synthetic reload fixture",
    segments:[{id:"b01-c001-l1",sentences:[{id:"b01-c001-s001",text_la:"Līvia in hortō est."}]}],exercises:[],speaking:[]};
   const content=new Proxy(Object.create(null),{set(o,k,v){
    if(k==="catalogue")v.entries.push({id:"b01-c001",chapter:1,title:lesson.title,legacy:false,source_hash:"0".repeat(64),script:"content/b01/c001.js"});
    o[k]=v;return true;
   }});
   content["b01-c001"]=lesson;Object.defineProperty(globalThis,"TablinumCompiledContent",{value:content,configurable:true});
  });
  await page.goto(url);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator("#tabs [data-tab='progress']").click();
  await page.locator('[data-course="b01-c001"]').click();
  await page.getByRole("heading",{name:"Synthetic reload fixture"}).waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")).ui.chapterId),"b01-c001");
  await page.reload();
  await page.getByRole("heading",{name:"Synthetic reload fixture"}).waitFor({timeout:10000});
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),null);
  await context.close();
  const broken=await browser.newContext(),bad=await broken.newPage();
  const badErrors=[];bad.on("pageerror",e=>badErrors.push(e.message));
  await bad.addInitScript(()=>{
   localStorage.setItem("tablinum-source-review-v02","{unreadable-v4");
   localStorage.removeItem("tablinum-state-v5");localStorage.removeItem("tablinum-v4-snapshot");
  });
  await bad.goto(url);
  if(await bad.locator("#lx-welcome:not([hidden])").count()){
   await bad.locator("#lx-welcome-skip").check();
   await bad.locator("#lx-welcome-enter").click();
  }await bad.locator("#tabs [data-tab='progress']").click();
  await bad.locator('[data-action="remigrateV4"]').waitFor();
  assert.match(await bad.locator("#main").textContent(),/Original v4 data is unreadable/);
  bad.on("dialog",dialog=>dialog.accept());
  await bad.locator('[data-action="remigrateV4"]').click();
  assert.equal(await bad.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),"{unreadable-v4");
  assert.equal(await bad.evaluate(()=>localStorage.getItem("tablinum-state-v5")),null);
  assert.equal(await bad.evaluate(()=>localStorage.getItem("tablinum-v4-snapshot")),null);
  assert.deepEqual(badErrors,[]);assert.deepEqual(errors,[]);
  await broken.close();
  console.log("PASS real file URL: saved synthetic course reopened and invalid v4 re-migrate did not overwrite data.");
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
