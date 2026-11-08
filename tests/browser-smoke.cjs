"use strict";
/* Real Chromium smoke test, invoked only after installing Playwright.
   Runs locally, makes no network calls, and saves screenshot artifacts. */
const http=require("node:http");
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const rootDir=path.resolve(__dirname,"..");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer((req,res)=>{
 let relative;
 try{relative=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^[/]+/,"")||"index.html"}
 catch(e){res.writeHead(400);res.end("Bad URL");return}
 if(relative.split("/").some(component=>component===".."||component==="."||component.includes("\\")||component.startsWith("."))){
  res.writeHead(403);res.end("Forbidden");return;
 }
 const file=path.resolve(rootDir,relative);
 if(!file.startsWith(rootDir+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
  res.writeHead(404);res.end("Not found");return;
 }
 res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
 fs.createReadStream(file).pipe(res);
});
const listen=()=>new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const close=()=>new Promise(resolve=>server.close(resolve));
(async()=>{
 await listen();
 const root="http://127.0.0.1:"+server.address().port;
 let browser;
 const errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const desktop=await browser.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
  desktop.on("pageerror",e=>errors.push(e.message));
  await desktop.goto(root,{waitUntil:"load"});
  await desktop.locator('img[data-art-image="b01-c001-scene"]').waitFor({state:"visible"});
  await desktop.waitForFunction(()=>{const image=document.querySelector('img[data-art-image="b01-c001-scene"]');return image?.complete&&image.naturalWidth>0});
  assert.equal(await desktop.locator(".sentence").count(),9,"Chapter I must still contain nine original sentences");
  assert.equal(await desktop.locator(".codex").count(),1,"Main folio must render");
  const baseline=await desktop.evaluate(()=>{
   const style=getComputedStyle(document.documentElement);
   const nav=getComputedStyle(document.querySelector("#tabs button"));
   const button=getComputedStyle(document.querySelector(".btn"));
   return{parchment:style.getPropertyValue("--parchment").trim(),borderRadius:nav.borderRadius,buttonRadius:button.borderRadius};
  });
  assert.equal(baseline.parchment,"#eee1c9");
  assert.equal(baseline.borderRadius,"0px");
  assert(["2px","0px"].includes(baseline.buttonRadius),"Controls should not use pill corners");
  await desktop.locator(".sentence [data-guided='0']").click();
  await desktop.locator(".hint-words .word").first().waitFor();
  await desktop.locator(".hint-words .word").first().focus();
  await desktop.keyboard.press("ArrowRight");
  assert(await desktop.evaluate(()=>document.activeElement?.matches(".hint-words .word")),"Arrow keys must work inside Latin contextual hints");
  await desktop.locator("#tabs [data-tab='quiz']").click();
  assert.equal(await desktop.locator(".quiz").count(),4,"Chapter I should retain three questions and one cloze exercise");
  await desktop.locator("#tabs [data-tab='read']").click();
  assert.equal(await desktop.locator('img[data-art-image="b01-c001-scene"]').evaluate(el=>getComputedStyle(el).filter),"none","Approved illustration must not be recolored by CSS");
  await desktop.locator("#chapters [data-ch='2']").click();
  const giftImage=desktop.locator('img[data-art-image="b01-c004-scene"]');
  await giftImage.waitFor({state:"visible"});
  await desktop.waitForFunction(()=>{const image=document.querySelector('img[data-art-image="b01-c004-scene"]');return image?.complete&&image.naturalWidth>0});
  assert.equal(await giftImage.evaluate(el=>getComputedStyle(el).filter),"none","Approved gift scene must not be desaturated");
  assert.equal(await desktop.locator('[data-art-scene="b01-c004-scene"] .art-fallback').evaluate(el=>getComputedStyle(el).display),"none","Legacy SVG should be hidden when approved art loads");
  fs.mkdirSync(path.join(__dirname,"..","artifacts"),{recursive:true});
  await desktop.screenshot({path:path.join(__dirname,"..","artifacts","tablinum-rose-ch3.png"),fullPage:true});
  await desktop.locator("#chapters [data-ch='0']").click();
  await desktop.screenshot({path:path.join(__dirname,"..","artifacts","tablinum-desktop.png"),fullPage:true});
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on("pageerror",e=>errors.push(e.message));
  await mobile.goto(root,{waitUntil:"load"});
  await mobile.locator('img[data-art-image="b01-c001-scene"]').waitFor({state:"visible"});
  const sizes=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  assert(sizes.scroll<=sizes.viewport+2,JSON.stringify(sizes)+" — unexpected body-level horizontal overflow");
  assert(await mobile.locator(".dock").isVisible(),"Mobile audio control strip must be visible");
  await mobile.locator(".sentence").first().evaluate(el=>el.scrollIntoView({block:"center"}));
  const firstSentence=await mobile.evaluate(()=>{
    const sentence=document.querySelector(".sentence");
    const dock=document.querySelector(".dock");
    const r=sentence.getBoundingClientRect();
    const d=dock.getBoundingClientRect();
    return {top:Math.round(r.top),bottom:Math.round(r.bottom),dockHeight:Math.round(d.height),
      viewport:window.innerHeight,scrollY:window.scrollY,
      visibleAtRest:r.top < window.innerHeight-d.height-6};
  });
  assert(firstSentence.visibleAtRest,"First sentence must be readable above the dock after an ordinary scroll: "+JSON.stringify(firstSentence));
  const statusRegion=await mobile.locator("#appStatus").evaluate(el=>({display:getComputedStyle(el).display,live:el.getAttribute("aria-live")}));
  assert(statusRegion.display!=="none" && statusRegion.live==="polite","Empty accessibility status region must stay mounted");
  await mobile.screenshot({path:path.join(__dirname,"..","artifacts","tablinum-mobile.png"),fullPage:true});
  assert.equal(errors.length,0,"Browser runtime errors: "+errors.join("; "));
  console.log("PASS: Chromium desktop/mobile manuscript, Chapter III red rose colours, first sentence scrollable above mobile audio controls, status accessibility and original exercises.");
  console.log("Screenshots: artifacts/tablinum-desktop.png, tablinum-rose-ch3.png and tablinum-mobile.png");
 } finally {
  if(browser)await browser.close();
  await close();
 }
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
