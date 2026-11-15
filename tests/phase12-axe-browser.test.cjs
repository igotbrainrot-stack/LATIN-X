"use strict";
const {toReader,toSettings}=require("./helpers/open-reader.cjs");
/* CI-only axe-core audit on actual Windows file:// browser. Does NOT claim full
 * WCAG conformity or replace manual NVDA+keyboard testing. */
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium,firefox}=require("playwright");
const axeVersion=require("axe-core/package.json").version;
assert.equal(axeVersion,"4.10.3","Pin axe-core in CI rather than taking latest silently");
(async()=>{
 const selected=process.env.TABLINUM_BROWSER_NAME||"chromium";
 const browser=await(selected==="firefox"?firefox:chromium).launch({headless:true,...(["chrome","msedge"].includes(selected)?{channel:selected}:{})});
 const context=await browser.newContext(),page=await context.newPage();
 const root=path.resolve(__dirname,".."),failures=[];
 try{
  async function audit(label){
   /* Audit the settled page: a view fades in over about half a second, and text measured
      part-way through that fade reads as low contrast. */
   await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect&&Number.isFinite(a.effect.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{}))));
   await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
   const results=await page.evaluate(()=>window.axe.run(document,{reporter:"v2"}));
   const violations=results.violations.filter(v=>["serious","critical"].includes(v.impact));
   for(const v of violations)failures.push(label+": "+v.id+" ("+v.impact+") "+v.nodes.slice(0,4).map(n=>n.target.join(" ")).join(" / "));
   console.log(`axe ${label}: ${results.violations.length} violations, ${violations.length} serious/critical`);
  }
  await page.goto(pathToFileURL(path.join(root,"index.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await toReader(page);
  await page.locator('.sentence').first().waitFor();
  await audit("reader");
  for(const [label,id] of [["quiz","quiz"],["review","review"],["progress","progress"]]){
   await page.locator(`#tabs [data-tab="${id}"]`).click();await audit(label);
  }
  // Views added by the November 2026 redesign, then every main view again in the dark theme.
  await page.locator('#tabs [data-tab="home"]').click();await audit("home");
  await page.locator('#tabs [data-tab="review"]').click();
  await page.locator("[data-words='glossary']").first().click();
  await page.locator("[data-gloss]").first().click();await audit("glossary");
  await toSettings(page);await audit("settings");
  await page.locator('[data-set-theme="dark"]').click();await audit("settings-dark");
  for(const id of ["home","read","quiz","review","progress"]){
   await page.locator(`#tabs [data-tab="${id}"]`).click();
   if(id==="read"){await page.locator(".sentence .word").nth(2).click();await page.locator(".sentence [data-guided='0']").click();}
   await audit(id+"-dark");
  }
  await page.goto(pathToFileURL(path.join(root,"Picture Practice.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await toReader(page);
  await page.locator('[data-picture-chapter="b01-c001"]').waitFor();
  await page.waitForFunction(()=>{const i=document.querySelector('img[data-art-image]');return i?.complete&&i.naturalWidth>0&&i.style.display!=="none"});
  await page.locator('img[data-art-image]').first().scrollIntoViewIfNeeded();
  await audit("picture-practice-dark");
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem("tablinum-state-v5"));s.ui.display.theme="light";localStorage.setItem("tablinum-state-v5",JSON.stringify(s))});
  await page.reload();
  await page.waitForFunction(()=>{const i=document.querySelector('img[data-art-image]');return i?.complete&&i.naturalWidth>0&&i.style.display!=="none"});
  await audit("picture-practice");
  assert.deepEqual(failures,[],"axe serious/critical violations in file:// Windows flow:\n"+failures.join("\n"));
  console.log("PASS axe-core 4.10.3 Windows "+selected+": reader, quiz, review, progress, home, glossary, settings and picture-practice, in the light and dark themes (no serious/critical violations)");
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
