"use strict";
const assert=require("node:assert/strict"),path=require("node:path");
const {chromium}=require("playwright"),{pathToFileURL}=require("node:url");
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.TABLINUM_BROWSER_CHANNEL||undefined});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[],requests=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("request",request=>{if(/^https?:\/\//.test(request.url()))requests.push(request.url())});
  const url=pathToFileURL(path.resolve(__dirname,"..","index.html")).href;
  await page.goto(url);
  await page.locator(".sentence").first().waitFor();
  const before=await page.evaluate(()=>globalThis.TablinumAmbience.debug());
  assert.equal(before.activated,false,"No audio context before a gesture");
  assert.equal(before.hasAudioContext,false,"Autoplay must be impossible until input");
  await page.locator("#music-toggle").waitFor();
  await page.locator('#tabs [data-tab="progress"]').click();
  const after=await page.evaluate(()=>globalThis.TablinumAmbience.debug());
  assert.equal(after.activated,true,"First click should activate audio");
  assert.equal(await page.locator("#music-toggle").getAttribute("aria-pressed"),"true");
  await page.locator("#music-toggle").click();
  assert.equal(await page.locator("#music-toggle").getAttribute("aria-pressed"),"false");
  await page.locator("#sfx-toggle").click();
  assert.equal(await page.locator("#sfx-toggle").getAttribute("aria-pressed"),"false");
  await page.locator("#music-volume").evaluate(element=>{
   element.value="0.35";element.dispatchEvent(new Event("input",{bubbles:true}));
  });
  await page.locator("#sfx-volume").evaluate(element=>{
   element.value="0.10";element.dispatchEvent(new Event("input",{bubbles:true}));
  });
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.deepEqual(state.ui.audio,{music:false,musicVolume:0.35,sfx:false,sfxVolume:0.10});
  await page.reload();
  await page.locator("#music-toggle").waitFor();
  assert.equal(await page.locator("#music-toggle").getAttribute("aria-pressed"),"false");
  assert.equal(await page.locator("#sfx-toggle").getAttribute("aria-pressed"),"false");
  assert.equal(await page.locator("#music-volume").inputValue(),"0.35");
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().activated),false,"No autoplay on reload");
  await page.locator("#music-toggle").click();
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().activated),true);
  await page.evaluate(()=>globalThis.TablinumAmbience.duck(true));
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().ducked),true);
  await page.evaluate(()=>globalThis.TablinumAmbience.duck(false));
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().ducked),false);
  await page.evaluate(()=>globalThis.TablinumAmbience.setRecording(true));
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().playing),false);
  await page.evaluate(()=>globalThis.TablinumAmbience.setRecording(false));
  assert.equal(await page.evaluate(()=>globalThis.TablinumAmbience.debug().recording),false);
  assert.deepEqual(errors,[],"No browser page errors");
  assert.deepEqual(requests,[],"No network or CDN request is needed for original music");
  console.log("PASS Phase7a Windows file://: no autoplay, user-gesture WebAudio, header settings, separate toggles, v5 persistence, ducking, mic pause and zero network.");
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
