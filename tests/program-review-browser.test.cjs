"use strict";
/* Browser checks for the November 2026 program review fixes: focus after a wrong answer,
   saved-word feedback and removal, the answer reveal, Memoria keys and messages, and the audio strip. */
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
 let browser;const errors=[];
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(root,{waitUntil:"load"});
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  const status=()=>page.locator("#appStatus").innerText();

  // Reader: audio strip shown, no dead "Previous chapter" on chapter 1.
  assert(await page.locator(".dock").isVisible(),"audio strip belongs on the reader");
  assert(await page.locator("[data-action='prevChapter']").isDisabled(),"Previous chapter must be disabled on chapter 1");

  // Saving a word gives feedback and cannot be repeated.
  await page.locator("#main .word").first().click();
  const save=page.locator("#help [data-save]");
  await save.click();
  assert.match(await status(),/Saved .+ to Memoria/);
  assert.equal(await page.locator("#help [data-save]").count(),0,"Save button must not stay active for a saved word");
  assert(await page.locator("#help button:has-text('Saved ✓')").isDisabled());

  // Exercitia: the audio strip is hidden; a wrong typed answer keeps the focus.
  await page.locator("[data-tab='quiz']").first().click();
  assert(await page.locator(".dock").isHidden(),"audio strip must be hidden outside the reader");
  const input=page.locator("#main input[id^='answer-']").first();
  const id=await input.getAttribute("id");
  const score=()=>page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem("tablinum-state-v5")||"{}").questions||{}));
  for(let n=1;n<=3;n++){
   await page.locator("#"+id).fill("zzz");
   await page.locator("#"+id).press("Enter");
   assert.equal(await page.evaluate(()=>document.activeElement.id),id,"focus must stay in the answer box after wrong answer "+n);
   assert.equal(await page.locator("[data-show-model]").count(),n<3?0:1,"answer reveal is offered only after three misses");
  }
  const before=await score();
  await page.locator("[data-show-model]").click();
  assert.equal(await page.locator("[data-show-model]").count(),0);
  assert(await page.locator("#main .model-answer").count()>0,"the model answer must be shown");
  assert.equal(await score(),before,"revealing an answer must not score the question");

  // Memoria: keys, labels, an honest idle message, and removal.
  await page.locator("[data-tab='review']").click();
  assert(await page.locator(".dock").isHidden());
  assert.equal(await page.locator("#savedWords li").count(),1);
  await page.keyboard.press("Space");
  assert.deepEqual(await page.locator("[data-rating]").allInnerTexts(),["1 · Again","2 · Hard","3 · Good","4 · Easy"]);
  await page.keyboard.press("3");
  assert.match(await page.locator("#main").innerText(),/No reviews are due\. Next review: /);
  page.once("dialog",d=>d.accept());
  await page.locator("#savedWords summary").click();
  await page.locator("[data-unsave]").click();
  assert.match(await status(),/Removed .+ from Memoria/);
  assert.equal(await page.locator("#savedWords").count(),0);
  assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem("tablinum-state-v5")).deck.legacyCards).length),0);

  // Prōgressus: no stale schema text, raw status codes or empty measures.
  await page.locator("[data-tab='progress']").click();
  const text=await page.locator("#main").innerText();
  assert(!/schema v4|not_checked|unsupported/.test(text),"stale or raw status text in Prōgressus");
  assert(!/Four separate measures/.test(text),"the four measures are hidden until approved lexemes exist");
  assert.match(text,/Recording storage: /);

  // Daily limit: cards held back are reported, not hidden behind "Omnia bene".
  await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("tablinum-state-v5"));
   s.deck.settings={...(s.deck.settings||{}),newDaily:0};
   s.deck.legacyCards.pater={head:"pater",meaning:"father",days:1,due:Date.now()-1000,reps:0};
   localStorage.setItem("tablinum-state-v5",JSON.stringify(s));
  });
  await page.reload({waitUntil:"load"});
  await page.locator("[data-tab='review']").click();
  assert.match(await page.locator("#main").innerText(),/Today's review limit is reached\. 1 more card is ready/);

  assert.deepEqual(errors,[]);
  console.log("PASS program review fixes: focus, saved words, answer reveal, Memoria keys and messages, audio strip, Prōgressus copy.");
 }finally{if(browser)await browser.close();await close();}
})().catch(e=>{console.error(e);process.exit(1)});
