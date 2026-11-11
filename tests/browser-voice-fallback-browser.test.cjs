"use strict";
/* Browser voice fallback: a sentence with no recording in this copy is read by the browser
   voice. When the browser refuses it (no Latin voice, or an utterance dropped after
   cancel), the program tries once more with a stand-in voice before it reports a failure,
   and an interrupted earlier sentence never shows an error. The speech engine is replaced
   by a scripted stand-in, because a headless browser has no voices. */
const path=require("node:path");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const fake=`(()=>{
 const voices=[{name:"Default English",lang:"en-US",default:true},{name:"Italiano",lang:"it-IT",default:false}];
 const log=[];let plan=[];
 window.__speech={log,plan:p=>{plan=p.slice()}};
 class U{constructor(t){this.text=t;this.lang="";this.voice=null;this.rate=1;this.onend=null;this.onerror=null}}
 window.SpeechSynthesisUtterance=U;
 const engine={getVoices:()=>voices,cancel(){log.push("cancel")},pause(){},resume(){},speaking:false,
  addEventListener(){},speak(u){const step=plan.length?plan.shift():"ok";log.push({text:u.text,lang:u.lang,voice:u.voice&&u.voice.name,step});
   setTimeout(()=>{if(step==="ok")u.onend&&u.onend({});else u.onerror&&u.onerror({error:step})},20)}};
 Object.defineProperty(window,"speechSynthesis",{value:engine,configurable:true});
 // This copy behaves as if it had no sentence recordings, so the browser voice reads them.
 const src=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,"src");
 Object.defineProperty(HTMLMediaElement.prototype,"src",{configurable:true,get(){return src.get.call(this)},
  set(v){src.set.call(this,String(v).replace("audio/narration/","audio/narration/not-in-this-copy/"))}});
})();`;
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1366,height:800}});
  page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(fake);
  await page.goto(pathToFileURL(path.join(root,"index.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){await page.locator("#lx-welcome-skip").check();await page.locator("#lx-welcome-enter").click();}
  await page.locator(".sentence").first().waitFor();
  const status=()=>page.locator("#appStatus").textContent();
  const listen=async i=>{await page.evaluate(()=>{window.__speech.log.length=0});await page.locator('button.link[data-sentence="'+i+'"]').click();await page.waitForTimeout(700)};
  const spoken=()=>page.evaluate(()=>window.__speech.log.filter(x=>typeof x==="object"));

  // 1. The browser refuses Latin: the second try uses the Italian stand-in and succeeds.
  await page.evaluate(()=>window.__speech.plan(["language-unavailable","ok"]));
  await listen(0);
  let s=await spoken();
  assert.equal(s.length,2,"one retry: "+JSON.stringify(s));
  assert.equal(s[0].lang,"la");
  assert.deepEqual([s[1].lang,s[1].voice],["it-IT","Italiano"],"the retry uses a stand-in voice");
  assert.doesNotMatch(await status(),/could not read/);
  assert.match(await page.locator("#audioNote").textContent(),/Italiano \(stand-in, not a Latin voice\)/);

  // 2. An utterance dropped straight after cancel is retried, not reported.
  await page.evaluate(()=>window.__speech.plan(["interrupted","ok"]));
  await listen(1);
  assert.equal((await spoken()).length,2);
  assert.doesNotMatch(await status(),/could not read/);

  // 3. Both tries fail: one clear message naming the reason.
  await page.evaluate(()=>window.__speech.plan(["synthesis-failed","synthesis-failed"]));
  await listen(2);
  assert.equal((await spoken()).length,2,"no endless retrying");
  assert.match(await status(),/could not read this sentence \(synthesis-failed\)/);

  // 4. Clicking another sentence while one is being read: the first one's error is silent.
  await page.evaluate(()=>window.__speech.plan(["ok","ok"]));
  await page.locator('button.link[data-sentence="3"]').click();
  await page.locator('button.link[data-sentence="4"]').click();
  await page.waitForTimeout(700);
  assert.doesNotMatch(await status(),/could not read/);
  assert.deepEqual(errors,[]);
  console.log("PASS browser voice fallback: stand-in voice retry, retry after a dropped utterance, one clear failure message, no stale errors.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
