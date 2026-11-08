"use strict";
/* Real browser follow-up for the separate offline a11y module.
 * Matrix on Windows: Chromium, installed Chrome, installed Edge, Playwright Firefox. */
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const {chromium,firefox}=require("playwright");
(async()=>{
 const selected=process.env.TABLINUM_BROWSER_NAME||"chromium";
 const type=selected==="firefox"?firefox:chromium;
 const options={headless:true};
 if(selected==="chrome"||selected==="msedge")options.channel=selected;
 const browser=await type.launch(options),context=await browser.newContext(),page=await context.newPage();
 const errors=[],network=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("request",req=>{if(/^https?:/i.test(req.url()))network.push(req.url())});
 try{
  await page.goto(pathToFileURL(path.resolve(__dirname,"..","index.html")).href);
  await page.locator(".sentence").first().waitFor();
  assert.equal(await page.locator('#chapters').getAttribute('aria-label'),"Chapter navigation");
  assert.equal(await page.locator('#help').getAttribute('aria-label'),"Learning guidance and personal notes");
  assert.equal(await page.locator('label[for="notes"]').textContent(),"Personal notes for this chapter");
  // Bibliothēca (text/audio import) was removed from the learner app in Nov 2026.
  assert.equal(await page.locator('#tabs [data-tab="library"]').count(),0,"Library tab removed");
  await page.locator('#tabs [data-tab="progress"]').focus();await page.keyboard.press("Enter");
  await page.locator('[data-action="exportRecordings"]').waitFor();
  await page.locator('#chapters [data-ch="0"]').click();
  await page.locator('#tabs [data-tab="quiz"]').click();
  assert(await page.locator('#main [lang="la"]').count()>0,"Latin prompts need lang=la");
  const status=await page.evaluate(()=>({role:document.getElementById("appStatus")?.getAttribute("role"),
   live:document.getElementById("appStatus")?.getAttribute("aria-live")}));
  assert.deepEqual(status,{role:"status",live:"polite"});
  assert.deepEqual(network,[],"file URL learner must make no external requests");
  assert.deepEqual(errors,[],"No browser JS errors during accessibility regression");
  console.log("PASS Phase12 browser "+selected+": labelled dynamic fields, offline Latin, live status, no network/errors.");
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
