"use strict";
const assert=require("node:assert/strict"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,"..","index.html")).href);
  await page.locator(".sentence").first().waitFor();
  const old=await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02"));
  await page.evaluate(()=>{
   const chapter={schema:"tablinum-lesson-v1",id:"b01-c001",status:"approved",legacy:false,chapter:1,
    title:"Synthetic Phase 5 test — not a published Latin chapter",
    segments:[{id:"b01-c001-l1",sentences:[{id:"b01-c001-s001",text_la:"Līvia in hortō est."}]}],
    exercises:[
     {id:"b01-c001-q001",type:"mc",prompt_la:"Ubi est Līvia?",options:["in hortō","in viā"],accept:["in hortō"],evidence:"b01-c001-s001",status:"approved",review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-05"}},
     {id:"b01-c001-q002",type:"short",prompt_la:"Ubi?",accept:["in hortō"],status:"approved",review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-05"}},
     {id:"b01-c001-q003",type:"short",prompt_la:"Unsigned test",accept:["hortus"],status:"proposed_ungraded"},
     {id:"b01-c001-q004",type:"retell",prompt_la:"Dīc narrātiōnem.",model:"Līvia in hortō est.",status:"approved",review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-05"}},
     {id:"b01-c001-q005",type:"listen-mc",prompt_la:"Audio not verified",options:["A","B"],accept:["A"],status:"approved",review:{by:"SYNTHETIC TEST ONLY",at:"2026-11-05"},audio:{verified:false,src:"no-recording.mp3"}}
    ],speaking:[]};
   const t=globalThis.Tablinum;
   t.catalogue.set(chapter.id,{id:chapter.id,legacy:false,chapter:1,title:chapter.title,
    script:"content/b01/c001.js",source_hash:"0".repeat(64)});
   t.registerChapter(chapter);
  });
  await page.locator("#tabs [data-tab='progress']").focus();
  await page.keyboard.press("Enter");
  await page.locator('[data-course="b01-c001"]').focus();await page.keyboard.press("Enter");
  await page.locator("#tabs [data-tab='quiz']").focus();await page.keyboard.press("Enter");
  await page.locator('[data-ex-choice="b01-c001-q001"][data-ex-value="in hortō"]').focus();
  await page.keyboard.press("Enter");
  await page.locator('[data-ex-evidence="b01-c001-s001"]').waitFor();
  let rec=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(rec.questions["b01-c001-q001"].correct,true,"Reviewed synthetic MC must persist by stable ID");
  assert.equal(rec.questions["b01-c001-q001"].evidence,"b01-c001-s001");
  await page.locator('[data-ex-evidence="b01-c001-s001"]').focus();await page.keyboard.press("Enter");
  assert.equal(await page.locator("#tabs [data-tab='read']").getAttribute("aria-current"),"page");
  assert.match(await page.locator(".sentence").first().textContent(),/Līvia in hortō est/);
  await page.locator("#tabs [data-tab='quiz']").focus();await page.keyboard.press("Enter");
  await page.locator('#exercise-b01-c001-q002').focus();await page.keyboard.type("IN HORTO.");
  await page.locator('[data-ex-check="b01-c001-q002"]').focus();await page.keyboard.press("Enter");
  rec=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(rec.questions["b01-c001-q002"].correct,true);
  assert.equal(rec.questions["b01-c001-q003"],undefined,"Unsigned question may not write a grade");
  assert.equal(await page.locator('[data-ex-choice="b01-c001-q005"]').count(),0,"No fictional listening task without verified human recording");
  await page.locator('[data-ex-reveal="b01-c001-q004"]').focus();await page.keyboard.press("Enter");
  assert.match(await page.locator("#main").textContent(),/Līvia in hortō est/);
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),old);
  await page.locator('#chapters [data-ch="0"]').focus();await page.keyboard.press("Enter");
  await page.locator("#tabs [data-tab='quiz']").focus();await page.keyboard.press("Enter");
  assert(await page.locator("[data-choice]").count()>0,"Original legacy quiz remains playable");
  await page.locator('[data-choice="0"][data-value="in hortō"]').focus();await page.keyboard.press("Enter");
  const legacy=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(legacy.questions["legacy-ch01-q001"].correct,true,"Old question stable IDs must remain intact");
  assert.equal(legacy.questions["b01-c001-q001"].correct,true,"Course grade must survive legacy navigation");
  assert.deepEqual(errors,[],"No uncaught browser errors");
  console.log("PASS Phase5 Windows file URL keyboard-only: synthetic MC, short, evidence navigation, ungraded/audio gate, v5 isolation and legacy quiz.");
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
