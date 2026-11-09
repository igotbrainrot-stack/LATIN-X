"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[],external=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",req=>{if(/^https?:/.test(req.url()))external.push(req.url())});
  const root=path.resolve(__dirname,".."),source=fs.readFileSync(path.join(root,"curriculum/illustrations.json"));
  await page.goto(pathToFileURL(path.join(root,"Art Review.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator("#manifest").setInputFiles({name:"illustrations.json",mimeType:"application/json",buffer:source});
  assert.equal(await page.locator("#choice option").count(),10,"Character sheet and 9 separate scenes should be reviewable");
  assert.match(await page.locator("#status").textContent(),/No image has been approved/);
  await page.locator("#choice").selectOption("0");
  assert.match(await page.locator("#sceneTitle").textContent(),/Hortus et arbor/);
  assert.equal(await page.locator("#regions button").count(),6,"Chapter 1 demands six picture regions");
  await page.locator("#regions button").first().click();
  assert.match(await page.locator("#coordinate").textContent(),/arbor-magna/);
  await page.locator("#approve").click();
  assert.match(await page.locator("#status").textContent(),/Approval blocked/);
  await page.locator("#draft").click();
  assert.match(await page.locator("#status").textContent(),/Saved locally/);
  await page.locator("#export").click();
  assert.match(await page.locator("#status").textContent(),/JSON exported/);
  await page.locator("#choice").selectOption("character");
  assert.match(await page.locator("#sceneTitle").textContent(),/Original character sheet/);
  assert.equal(await page.locator("#regions button").count(),0,"Character sheet is not a scene polygon");
  assert.deepEqual(errors,[],"Offline Art Review must not throw");
  assert.deepEqual(external,[],"No art editor upload or external request");
  await page.goto(pathToFileURL(path.join(root,"index.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator(".sentence").first().waitFor();
  assert.equal(await page.locator("img[data-art-image]").count(),1,"Main reader shows a linked, owner-approved Book I scene as a visual preview");
  await page.waitForFunction(()=>{const i=document.querySelector("img[data-art-image]");return !!i&&i.complete&&i.naturalWidth>0&&i.style.display!=="none"});
  assert.equal(await page.locator("figure[data-art-scene=\"b01-c001-scene\"]").count(),1,"Only signed garden preview for legacy first chapter");
  assert.equal(await page.locator("[data-art-scene=\"b01-c001-scene\"] .art-fallback").isHidden(),true,"Signed image replaces SVG, but SVG stays as load-error fallback");
  assert.deepEqual(errors,[]);
  console.log("PASS Phase8 Chromium file://: art review protection/owner export, signed garden preview loads in legacy reader, SVG error fallback retained, no CDN.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
