"use strict";
/* Test the actual Windows-style double-click route: file:///.../index.html.
 * Chromium by default; set TABLINUM_BROWSER_CHANNEL=msedge to use Edge.
 * The HTTP smoke test remains separate. */
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const assert=require("node:assert/strict");
const {chromium,firefox}=require("playwright");
const playwrightVersion=require("playwright/package.json").version;
const root=path.resolve(__dirname,"..");
const href=pathToFileURL(path.join(root,"index.html")).href;
const rawFixture=fs.readFileSync(path.join(__dirname,"fixtures","v4","midcourse.json"),"utf8");
const expectedFixture=JSON.parse(rawFixture);
const expectedCorrect=Object.keys(expectedFixture.correct).length;
const channel=process.env.TABLINUM_BROWSER_CHANNEL||undefined;
const type=process.env.TABLINUM_BROWSER_TYPE==="firefox"?firefox:chromium;
assert(!(type===firefox&&channel),"Firefox cannot be combined with a Chromium channel");
(async()=>{
 let browser;
 const pageErrors=[];
 try{
  browser=await type.launch({headless:true,...(channel?{channel}:{}),args:process.platform==="linux"&&type===chromium?["--no-sandbox"]:[]});
  console.log("ENVIRONMENT: Node "+process.version+"; Playwright "+playwrightVersion+"; "+(channel||(type===firefox?"Firefox":"Chromium"))+" "+browser.version()+"; "+process.platform);
  const context=await browser.newContext({viewport:{width:1440,height:960},deviceScaleFactor:1,acceptDownloads:true});
  const page=await context.newPage();
  page.on("pageerror",e=>pageErrors.push(e.message));
  await page.goto(href,{waitUntil:"load"});
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator('img[data-art-image="b01-c001-scene"]').waitFor({state:"visible"});
  await page.waitForFunction(()=>{const image=document.querySelector('img[data-art-image="b01-c001-scene"]');return image?.complete&&image.naturalWidth>0});
  assert.equal(await page.locator(".sentence").count(),9,"Chapter I must have exactly nine original sentences");
  // Quiz answer and persistence across a real file:// page reload.
  await page.locator("#tabs [data-tab='quiz']").click();
  await page.locator("[data-choice='0'][data-value='in hortō']").click();
  let stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(stored.questions["legacy-ch01-q001"].correct,true,"Correct answer must persist to v5 state");
  await page.reload({waitUntil:"load"});
  await page.locator("#tabs [data-tab='quiz']").waitFor();
  assert.equal(await page.locator(".quiz .is-correct").count()>0,true,"Correct question needs visible post-reload styling");
  stored=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(stored.questions["legacy-ch01-q001"].correct,true,"Answer vanished on file:// reload");
  // Seed a realistic raw v4 profile before the next reload; verify Progress.
  await page.addInitScript(({key,value})=>{
   localStorage.removeItem("tablinum-state-v5");
   localStorage.removeItem("tablinum-v4-snapshot");
   localStorage.setItem(key,value);
  },{key:"tablinum-source-review-v02",value:rawFixture});
  await page.reload({waitUntil:"load"});
  await page.locator("#tabs [data-tab='progress']").click();
  const total=await page.locator(".stat").nth(1).locator("b").textContent();
  assert.equal(total,expectedCorrect+"/24","Seeded v4 correct-answer count must appear in Progress");
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(Object.keys(restored.deck.legacyCards).length,30,"All 30 unsigned saved cards must survive migration");
  assert.equal(restored.chapters["legacy-ch03"].notes,expectedFixture.notes["2"]);
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),rawFixture,"Raw v4 profile must never be rewritten");
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-v4-snapshot")),rawFixture,"Snapshot must be byte-identical");
  // Export the exact fixture data through a real browser download.
  const [download]=await Promise.all([
   page.waitForEvent("download"),
   page.locator("[data-action='export']").click()
  ]);
  assert.match(download.suggestedFilename(),/^tablinum-backup-[0-9]{4}-[0-9]{2}-[0-9]{2}\.json$/);
  const envelope=JSON.parse(fs.readFileSync(await download.path(),"utf8"));
  assert.equal(envelope.version,5);
  assert.equal(envelope.state.ui.chapterId,"legacy-ch04");
  assert.equal(Object.keys(envelope.state.deck.legacyCards).length,30);
  // Restore the exported backup through the file input, not a mock.
  await page.locator("#restoreFile").setInputFiles({
   name:"phase0-restore.json",
   mimeType:"application/json",
   buffer:Buffer.from(JSON.stringify(envelope),"utf8")
  });
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(after.ui.chapterId,"legacy-ch04");
  assert.equal(Object.keys(after.deck.legacyCards).length,30);
  assert.equal(Object.values(after.questions).filter(q=>q.correct===true).length,expectedCorrect);
  assert.deepEqual(after.chapters,envelope.state.chapters,"Restore may not alter saved notes");
  assert.deepEqual(pageErrors,[],"Unhandled JavaScript errors in local file mode");
  const artifact=path.join(root,"artifacts","file-url-desktop.png");
  fs.mkdirSync(path.dirname(artifact),{recursive:true});
  await page.screenshot({path:artifact,fullPage:true});
  console.log("PASS: "+(channel||(type===firefox?"Firefox":"Chromium"))+" file:// launch; 9 sentences, quiz persistence, 30-word v5 restore, raw v4 snapshot and backup export and no page errors.");
  console.log("SCREENSHOT: artifacts/file-url-desktop.png");
 }finally{
  if(browser)await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
