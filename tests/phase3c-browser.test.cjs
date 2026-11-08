"use strict";
/* Real file:// recovery tests, not mocked. Source folders are copied to a
 * disposable temp path so a missing chapter can be simulated safely. */
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url"),{chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const oldRaw=fs.readFileSync(path.join(root,"tests/fixtures/v4/midcourse.json"),"utf8");
const capsRaw=fs.readFileSync(path.join(root,"tests/fixtures/v4/at-caps.json"),"utf8");
async function run(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"latin-x-3c-"));
 let browser;
 try{
  fs.copyFileSync(path.join(root,"index.html"),path.join(temp,"index.html"));
  fs.cpSync(path.join(root,"app"),path.join(temp,"app"),{recursive:true});
  fs.cpSync(path.join(root,"content"),path.join(temp,"content"),{recursive:true});
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext(),page=await context.newPage();
  const url=pathToFileURL(path.join(temp,"index.html")).href;
  await page.addInitScript(raw=>{localStorage.setItem("tablinum-source-review-v02",raw)},capsRaw);
  await page.goto(url);await page.locator(".sentence").first().waitFor();
  const full=await page.evaluate(()=>({
   original:localStorage.getItem("tablinum-source-review-v02"),
   snapshot:localStorage.getItem("tablinum-v4-snapshot"),
   notes:JSON.parse(localStorage.getItem("tablinum-state-v5")).chapters
  }));
  assert.equal(full.original,capsRaw);assert.equal(full.snapshot,capsRaw);
  assert.equal(Object.values(full.notes).filter(ch=>Object.hasOwn(ch,"notes")).length,120);
  await context.close();
  // A missing chapter must never trigger a write, not even v4 snapshot.
  fs.unlinkSync(path.join(temp,"content/legacy/ch04.js"));
  const missingCtx=await browser.newContext(),missing=await missingCtx.newPage();
  await missing.addInitScript(raw=>{localStorage.setItem("tablinum-source-review-v02",raw)},oldRaw);
  await missing.goto(url);await missing.locator("#appStatus").waitFor();
  const failed=await missing.evaluate(()=>({
   original:localStorage.getItem("tablinum-source-review-v02"),
   snapshot:localStorage.getItem("tablinum-v4-snapshot"),
   v5:localStorage.getItem("tablinum-state-v5"),
   message:document.querySelector("#appStatus").textContent
  }));
  assert.equal(failed.original,oldRaw);
  assert.equal(failed.snapshot,null);
  assert.equal(failed.v5,null);
  assert.match(failed.message,/ch04\.js|missing/i);
  await missingCtx.close();
  // A corrupt new-format profile must never be overwritten implicitly.
  fs.copyFileSync(path.join(root,"content/legacy/ch04.js"),path.join(temp,"content/legacy/ch04.js"));
  const corruptCtx=await browser.newContext(),corrupt=await corruptCtx.newPage();
  await corrupt.addInitScript(raw=>{
   localStorage.setItem("tablinum-source-review-v02",raw);
   localStorage.setItem("tablinum-state-v5","{corrupt");
  },oldRaw);
  await corrupt.goto(url);await corrupt.locator(".sentence").first().waitFor();
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem("tablinum-state-v5")),"{corrupt");
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),oldRaw);
  await corrupt.locator('#tabs [data-tab="progress"]').click();
  await corrupt.locator('[data-action="remigrateV4"]').waitFor();
  corrupt.on("dialog",dialog=>dialog.accept());
  await corrupt.locator('[data-action="remigrateV4"]').click();
  const repaired=await corrupt.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(repaired.ui.chapterId,"legacy-ch04");
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),oldRaw);
  assert.equal(await corrupt.evaluate(()=>localStorage.getItem("tablinum-v4-snapshot")),oldRaw);
  await corruptCtx.close();
  console.log("PASS: real Chromium file:// 120 notes, no writes on missing chapter, untouched corrupt-v5 and explicit safe recovery.");
 }finally{if(browser)await browser.close();fs.rmSync(temp,{recursive:true,force:true})}
}
run().catch(e=>{console.error(e);process.exitCode=1});
