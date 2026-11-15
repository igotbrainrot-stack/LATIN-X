"use strict";
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
/* Play layer: the games card, the three word games, and the flourishes. Games use only
   glossary words, never change lesson progress, and keep only a best score. */
(async()=>{
 await listen();
 const root="http://127.0.0.1:"+server.address().port;
 let browser;const errors=[];
 const enter=async page=>{
  if(await page.locator("#lx-welcome:not([hidden])").count()){await page.locator("#lx-welcome-skip").check();await page.locator("#lx-welcome-enter").click();}
 };
 /* Glossary of the words the games may use, read from the page: head <-> meaning. */
 const glossary=page=>page.evaluate(()=>{
  const WC=globalThis.TablinumWordChecks,L=Array.from({length:8},(_,i)=>globalThis.Tablinum.legacySourceAt(i)),out={};
  L.forEach((c,i)=>WC.chapterWords(L,i,globalThis.TablinumFormNotes.forms).forEach(w=>{out[w.head]=w.meaning}));
  return out;
 });
 const learningState=page=>page.evaluate(()=>JSON.stringify((JSON.parse(localStorage.getItem("tablinum-state-v5"))||{}).learning||null));
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:1366,height:800}});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(root,{waitUntil:"load"});await enter(page);
  assert(await page.evaluate(()=>[...document.styleSheets].some(s=>(s.href||"").endsWith("app/styles/tablinum-play.css"))),"play stylesheet must load");
  const words=await glossary(page),heads=Object.keys(words);

  // 1. The card sits under the chapter list and survives re-renders.
  assert.equal(await page.locator("#chapters > .play-card").count(),1);
  assert.equal(await page.locator(".play-card [data-play]:not(:disabled)").count(),3);
  await page.locator("#tabs [data-tab='quiz']").click();
  await page.locator("#tabs [data-tab='read']").click();
  assert.equal(await page.locator(".play-card").count(),1,"one card after re-rendering");
  const before=await learningState(page);

  // 2. Pairs: every card is a glossary word or its meaning; a wrong pair turns back; play to the end.
  await page.locator("[data-play=pairs]").click();
  const dialog=page.locator("dialog.play-dialog[open]");
  await dialog.waitFor();
  const faces=await dialog.locator(".pair-face").allInnerTexts();
  assert.equal(faces.length,12);
  const headOf=text=>heads.find(h=>h===text)||heads.find(h=>words[h]===text);
  assert(faces.every(headOf),"every pairs card comes from the glossary: "+faces.join(" | "));
  const groups={};faces.forEach((t,i)=>{(groups[headOf(t)]=groups[headOf(t)]||[]).push(i)});
  const sets=Object.values(groups);
  assert(sets.length===6&&sets.every(g=>g.length===2),"six pairs");
  await dialog.locator(".pair-card").nth(sets[0][0]).click();
  await dialog.locator(".pair-card").nth(sets[1][0]).click();
  assert.equal(await dialog.locator(".pair-card.is-up").count(),2);
  await page.waitForTimeout(1300);
  assert.equal(await dialog.locator(".pair-card.is-up").count(),0,"a wrong pair turns back");
  for(const [a,b] of sets){await dialog.locator(".pair-card").nth(a).click();await dialog.locator(".pair-card").nth(b).click();}
  await dialog.locator(".play-result").waitFor();
  assert.match(await dialog.locator(".play-score").innerText(),/All 6 pairs in 7 turns/);
  assert.equal(await dialog.locator(".play-best").count(),1);
  await dialog.locator("[data-g=close]").last().click();
  assert.equal(await page.locator("dialog.play-dialog[open]").count(),0);
  assert.match(await page.locator("[data-play=pairs] small").innerText(),/Best: 7 turns/);

  // 3. Letter tiles: a wrong order clears; the right order moves on; six rounds.
  await page.locator("[data-play=spell]").click();
  for(let round=0;round<6;round++){
   const meaning=(await dialog.locator(".spell-meaning").innerText()).trim();
   const tiles=await dialog.locator(".spell-tile").allInnerTexts();
   const head=heads.find(h=>words[h]===meaning&&[...h.toLowerCase()].sort().join("")===tiles.slice().sort().join(""));
   assert(head,"the tiles spell a glossary word for: "+meaning);
   if(round===0){
    const target=[...head.toLowerCase()],wrong=target.slice().reverse();
    if(wrong.join("")!==target.join("")){
     for(const ch of wrong)await dialog.locator(".spell-tile:not(:disabled)",{hasText:new RegExp("^"+ch+"$")}).first().click();
     assert.equal(await dialog.locator(".spell-slot.is-full").count(),0,"a wrong order clears the slots");
    }
   }
   for(const ch of [...head.toLowerCase()])await dialog.locator(".spell-tile:not(:disabled)",{hasText:new RegExp("^"+ch+"$")}).first().click();
   if(round<5)await dialog.locator(".play-hint",{hasText:"Word "+(round+2)+" of 6"}).waitFor();
  }
  await dialog.locator(".play-result").waitFor();
  assert.match(await dialog.locator(".play-score").innerText(),/6 of 6 words/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog.play-dialog[open]").count(),0,"Escape closes the dialog");

  // 4. Quick fire: three choices, exactly one right; a right answer scores; closing stops the clock.
  await page.locator("[data-play=quick]").click();
  await dialog.locator("[data-g2=start]").click();
  for(let n=0;n<4;n++){
   await dialog.locator(".quick-option:not(:disabled)").first().waitFor();
   const ask=(await dialog.locator(".quick-ask strong").innerText()).trim();
   const options=await dialog.locator(".quick-option").allInnerTexts();
   assert.equal(options.length,3);
   const right=options.filter(o=>words[ask]===o||words[o]===ask);
   assert.equal(right.length,1,"one right choice for "+ask+": "+options.join(" | "));
   await dialog.locator(".quick-option").nth(options.indexOf(right[0])).click();
   await page.waitForTimeout(450);
  }
  assert.equal(await dialog.locator(".play-count b").first().innerText(),"4");
  /* The page's own shortcuts must not fire through the dialog. */
  await page.keyboard.press("1");await page.keyboard.press("Space");
  await dialog.locator(".play-close").click();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator("dialog.play-dialog[open]").count(),0,"a closed game does not reopen when its clock would have ended");

  // 5. Games never change lesson progress or word knowledge.
  assert.equal(await learningState(page),before,"games must not write to lesson progress");
  assert.equal(await page.locator(".lesson-path li.is-done").count(),0);

  // 6. Flourishes: a right answer lights the edge and throws leaves; a wrong one only dims the edge.
  const check=page.locator("#main .word-check").first();
  const head=await check.getAttribute("data-word-check");
  await check.locator('.option[data-value="'+words[head]+'"]').click();
  assert(await page.locator(".codex").evaluate(el=>el.classList.contains("edge-good")));
  assert.equal(await page.locator("body > .leaf-burst").count(),1);
  assert.equal(await page.locator(".leaf-burst i").count(),10);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator(".leaf-burst").count(),0,"the leaves are removed afterwards");
  const second=page.locator("#main .word-check").nth(1),head2=await second.getAttribute("data-word-check");
  const wrong=(await second.locator(".option").evaluateAll(els=>els.map(e=>e.dataset.value))).find(v=>v!==words[head2]);
  await second.locator('.option[data-value="'+wrong+'"]').click();
  assert(await page.locator(".codex").evaluate(el=>el.classList.contains("edge-bad")&&!el.classList.contains("edge-good")));
  assert.equal(await page.locator(".leaf-burst").count(),0);
  // The step that has just been completed is stamped once.
  const third=page.locator("#main .word-check").nth(2),head3=await third.getAttribute("data-word-check");
  await third.locator('.option[data-value="'+words[head3]+'"]').click();
  assert.equal(await page.locator(".lesson-path li.just-done").count(),1);
  await page.locator("#main .word").first().click();
  assert.equal(await page.locator(".lesson-path li.just-done").count(),0,"the stamp does not repeat on the next render");

  // 7. Reduced motion: no leaves are created at all.
  const calm=await browser.newPage({viewport:{width:1366,height:800},reducedMotion:"reduce"});
  calm.on("pageerror",e=>errors.push(e.message));
  await calm.goto(root,{waitUntil:"load"});await enter(calm);
  const c=calm.locator("#main .word-check").first(),ch=await c.getAttribute("data-word-check");
  await c.locator('.option[data-value="'+words[ch]+'"]').click();
  assert.equal(await calm.locator(".leaf-burst").count(),0);
  await calm.close();

  // 8. Phone: the card moves under the word panel, the dialog fits, nothing scrolls sideways.
  const phone=await browser.newPage({viewport:{width:360,height:740}});
  phone.on("pageerror",e=>errors.push(e.message));
  await phone.goto(root,{waitUntil:"load"});await enter(phone);
  assert.equal(await phone.locator("#help > .play-card").count(),1);
  assert.equal(await phone.locator("#chapters .play-card").count(),0);
  await phone.locator("[data-play=pairs]").click();
  const box=await phone.locator("dialog.play-dialog[open]").boundingBox();
  assert(box.x>=0&&box.x+box.width<=360.5&&box.height<=740,"the dialog fits a phone: "+JSON.stringify(box));
  assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  console.log("PASS play layer: games card, Pairs, Letter tiles, Quick fire, no effect on progress, edge light, leaves, step stamp, reduced motion, phone.");
 }finally{
  if(browser)await browser.close();
  await close();
 }
})().catch(error=>{console.error(error);process.exitCode=1});
