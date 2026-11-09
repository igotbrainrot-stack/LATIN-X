"use strict";
/* file:// browser integration using synthetic in-memory course data ONLY.
 * No actual vocabulary or chapter approval is written to Git or localStorage. */
const assert=require("node:assert/strict"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext();
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,"..","index.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator(".sentence").first().waitFor();
  assert.equal(await page.locator(".sentence").count(),9,"Original chapter must render");
  await page.evaluate(()=>{
   const t=globalThis.Tablinum;
   t.catalogue.set("b01-c001",{
    id:"b01-c001",chapter:1,title:"Synthetic course test",legacy:false,
    source_hash:"0".repeat(64),script:"content/b01/c001.js"
   });
   t.registerChapter({
    schema:"tablinum-lesson-v1",id:"b01-c001",status:"approved",chapter:1,legacy:false,
    title:"Synthetic course test",subtitle_la:"TEST ONLY — not approved by anyone",
    segments:[{id:"b01-c001-l1",sentences:[{
     id:"b01-c001-s001",text_la:"Hic est hortus.",en:"Synthetic browser fixture only"
    }]}],exercises:[],speaking:[]
   });
  });
  await page.locator("#tabs [data-tab='progress']").click();
  await page.locator('[data-course="b01-c001"]').click();
  await page.getByRole("heading",{name:"Synthetic course test"}).waitFor();
  assert.equal(await page.locator(".sentence").count(),1);
  assert.match(await page.locator(".sentence").first().textContent(),/Hic est hortus/);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(state.ui.chapterId,"b01-c001","Selected course progress belongs to v5 IDs");
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),null,"Course visit must not create or rewrite original v4 storage");
  await page.locator("#tabs [data-tab='quiz']").click();
  assert.match(await page.locator("#main").textContent(),/Automatic grading is disabled/);
  await page.locator('#chapters [data-ch="0"]').click();
  assert.equal(await page.locator(".sentence").count(),9,"Legacy chapter restored without losing content");
  await page.evaluate(()=>{
   globalThis.Tablinum.catalogue.set("b01-c002",{
    id:"b01-c002",chapter:2,title:"Missing synthetic test",legacy:false,
    source_hash:"0".repeat(64),script:"content/b01/c002.js"
   });
  });
  await page.locator("#tabs [data-tab='progress']").click();
  await page.locator('[data-course="b01-c002"]').click();
  await page.locator('#main [role="alert"]').waitFor();
  assert.match(await page.locator('#main [role="alert"]').textContent(),/Missing content file content\/b01\/c002.js/);
  assert.equal(await page.locator(".sentence").count(),0,"Do not display a fake missing lesson");
  await page.locator('#chapters [data-ch="0"]').click();
  assert.equal(await page.locator(".sentence").count(),9);
  assert.deepEqual(errors,[],"No uncaught script errors");
  console.log("PASS Phase3b Windows file://: synthetic approved course loading, no fabricated grading, preserved v4 progress, missing-script alert and return to legacy.");
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
