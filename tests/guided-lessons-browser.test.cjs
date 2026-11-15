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
/* Guided lessons: the path bar names the next step, word checks sit inside the story,
   the chapter word check ends the lesson, missed words come back, and all of it survives
   a reload, a backup and a reset. */
(async()=>{
 await listen();
 const root="http://127.0.0.1:"+server.address().port;
 let browser;const errors=[];
 const enter=async page=>{
  if(await page.locator("#lx-welcome:not([hidden])").count()){await page.locator("#lx-welcome-skip").check();await page.locator("#lx-welcome-enter").click();}
 };
 /* The right and a wrong option of a rendered word-check section, read from the engine. */
 const answers=(page,section)=>section.evaluate(el=>{
  const WC=globalThis.TablinumWordChecks,L=Array.from({length:8},(_,i)=>globalThis.Tablinum.legacySourceAt(i)),FN=globalThis.TablinumFormNotes.forms;
  const values=[...el.querySelectorAll(".option")].map(b=>b.dataset.value);
  const head=el.dataset.wordCheck;
  const all=[];L.forEach((c,i)=>all.push(...WC.chapterWords(L,i,FN)));
  const first=el.querySelector(".option");
  const key=first.dataset.wt||("meaning:"+head),kind=key.split(":")[0],word=all.find(w=>w.head===key.slice(kind.length+1));
  const right=kind==="latin"?word.head:word.meaning;
  return {right,wrong:values.find(v=>v!==right),values};
 });
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:1366,height:800}});
  page.on("pageerror",e=>errors.push(e.message));
  page.on("dialog",d=>d.accept());
  await page.goto(root,{waitUntil:"load"});await enter(page);

  // 1. The reader opens with the path: three steps, the first one current.
  assert.equal(await page.locator(".lesson-path li").count(),3);
  assert.equal(await page.locator(".lesson-path li.is-current").count(),1);
  assert.match(await page.locator(".lesson-path li.is-current").innerText(),/Read the story/);
  assert.match(await page.locator(".lesson-next").innerText(),/Next step/);

  // 2. Word checks are inside the story, each after a sentence, three options, none answered.
  const checks=page.locator("#main .word-check");
  assert.equal(await checks.count(),3,"chapter 1 has three word checks in the story");
  for(let i=0;i<3;i++){
   assert.equal(await checks.nth(i).locator(".option").count(),3);
   assert.equal(await checks.nth(i).locator("mark").count(),1,"the word is marked in its sentence");
   assert(await checks.nth(i).evaluate(el=>el.previousElementSibling.matches("article.sentence")),"a check follows a sentence");
  }

  // 3. A wrong answer is recorded once, shows the meaning, and cannot be changed.
  let a=await answers(page,checks.nth(0));
  await checks.nth(0).locator('.option[data-value="'+a.wrong+'"]').click();
  assert.equal(await checks.nth(0).getAttribute("data-fresh"),"bad");
  assert.match(await checks.nth(0).locator("[role=status]").innerText(),/Nōndum\..*means.*chapter word check/s);
  assert.equal(await checks.nth(0).locator(".option:disabled").count(),3,"one answer per check");
  assert.equal(await checks.nth(0).locator(".option.is-correct").count(),1,"the right meaning is shown");
  const missedHead=await checks.nth(0).getAttribute("data-word-check");
  for(const i of [1,2]){
   a=await answers(page,checks.nth(i));
   await checks.nth(i).locator('.option[data-value="'+a.right+'"]').click();
   assert.equal(await checks.nth(i).getAttribute("data-fresh"),"good");
  }
  assert.equal(await page.locator(".word-check[data-fresh]").count(),1,"only the check just answered is animated");

  // 4. Step one is done; the path now points to the questions.
  assert.match(await page.locator(".lesson-path li.is-done").innerText(),/Read the story/);
  assert.match(await page.locator(".lesson-path li.is-current").innerText(),/Answer the questions/);
  await page.locator(".lesson-next .btn").click();
  assert.equal(await page.locator("#tabs button.active").getAttribute("data-tab"),"quiz");
  assert.equal(await page.locator("#wordTest [data-action=startWordTest]").count(),1,"the chapter word check waits at the end of the exercises");

  // 5. Finish the story questions from the model answers held by the page.
  const total=await page.locator("#main > .quiz").count();
  assert(total>=3);
  for(let i=0;i<total;i++){
   const section=()=>page.locator("#main > .quiz").nth(i);
   if(await section().locator(".option").count()){
    const n=await section().locator(".option").count();
    for(let k=0;k<n&&!(await section().evaluate(el=>el.classList.contains("is-complete")));k++)await section().locator(".option").nth(k).click();
   }else{
    // Typed answers: miss three times, ask for the model, then type it.
    for(let k=0;k<3;k++){await section().locator("input").fill("x"+k);await section().locator("button.btn.primary").click();}
    await section().locator("[data-show-model]").click();
    const model=(await section().locator(".model-answer [lang=la]").innerText()).trim();
    const question=(await section().locator(".question").innerText()).trim().split(/\s+/);
    const gap=question.findIndex(w=>w.includes("__"));
    const text=gap<0?model:model.split(/\s+/).at(gap-question.length).replace(/[.,;:!?]/g,"");
    await section().locator("input").fill(text);await section().locator("button.btn.primary").click();
   }
   assert(await section().evaluate(el=>el.classList.contains("is-complete")),"question "+(i+1)+" should be completed");
  }
  assert.match(await page.locator(".lesson-path li.is-current").innerText(),/Chapter word check/);

  // 6. The chapter word check: the missed word is asked; fail first, then pass.
  await page.locator(".lesson-next .btn").click();
  const items=page.locator("#wordTest .word-check");
  const n=await items.count();
  assert(n>=4&&n<=8,"a chapter word check has four to eight questions, got "+n);
  assert(await page.evaluate(head=>JSON.parse(localStorage.getItem("tablinum-state-v5")).learning.chapters["legacy-ch01"].test.items.some(i=>i.head===head),missedHead),"the word missed while reading is in the test");
  for(let i=0;i<n;i++){a=await answers(page,items.nth(i));await items.nth(i).locator('.option[data-value="'+a.wrong+'"]').click();}
  assert.match(await page.locator("#wordResult").innerText(),new RegExp("^0 of "+n+" correct\\. You need "));
  assert.equal(await page.locator("#wordTest .word-list li").count(),n,"missed words are listed with their meanings");
  assert.equal(await page.locator(".lesson-path li.is-done").count(),2);
  await page.locator("#wordTest [data-action=startWordTest]").click();
  assert.match(await page.locator("#wordTest .subtle").innerText(),/attempt 2/);
  const m=await items.count();
  for(let i=0;i<m;i++){a=await answers(page,items.nth(i));await items.nth(i).locator('.option[data-value="'+a.right+'"]').click();}
  assert.match(await page.locator("#wordResult").innerText(),new RegExp("^"+m+" of "+m+" correct\\. This word check is passed"));
  assert.equal(await page.locator(".lesson-path li.is-done").count(),3);
  assert.match(await page.locator(".lesson-next").innerText(),/Lesson complete/);
  assert(await page.locator(".ch").first().evaluate(el=>el.classList.contains("is-done")),"the chapter list marks the lesson complete");

  // 7. Finishing the lesson opens the wreath; its button goes on to the next chapter,
  //    whose word check brings back words from chapter 1.
  assert.match(await page.locator("dialog.play-dialog[open] #playTitle").innerText(),/Lesson 1 complete/);
  assert.equal(await page.locator("dialog.play-dialog .wreath-leaf").count(),20);
  await page.locator("dialog.play-dialog [data-g=next]").click();
  assert.equal(await page.locator("dialog.play-dialog[open]").count(),0);
  assert.match(await page.locator("#main h1").innerText(),/./);
  assert.equal(await page.locator(".ch.active").getAttribute("data-ch"),"1");
  assert.equal(await page.locator(".lesson-path li.is-done").count(),0);
  await page.locator('.lesson-path [data-path="words"]').click();
  assert(await page.locator("#wordTest .word-check .mini",{hasText:"from chapter 1"}).count()>=1,"earlier words are tested again");

  // 8. Prōgressus says where to continue and what is known.
  await page.locator('#tabs [data-tab="progress"]').click();
  assert.match(await page.locator(".continue").innerText(),/Chapter 2/);
  const stats=await page.locator(".word-knowledge .stat b").allInnerTexts();
  assert(Number(stats[0])>=m,"known words are counted");
  assert.equal(stats.reduce((x,y)=>x+Number(y),0),await page.evaluate(()=>{const WC=globalThis.TablinumWordChecks,L=Array.from({length:8},(_,i)=>globalThis.Tablinum.legacySourceAt(i));return WC.knowledge(WC.normalise({}),L,globalThis.TablinumFormNotes.forms).length}));
  assert.match(await page.locator(".stat").first().innerText(),/^1\/8/);

  // 9. Reload keeps it; reset clears it.
  await page.reload({waitUntil:"load"});await enter(page);
  await page.locator(".ch").first().click();
  assert.equal(await page.locator(".lesson-path li.is-done").count(),3,"lesson progress survives a reload");
  assert.equal(await page.locator("#main .word-check .option:disabled").count(),9);
  await page.locator('#tabs [data-tab="progress"]').click();
  await page.locator("details summary",{hasText:"Reset"}).click();
  await page.locator("[data-action=reset]").click();
  await page.locator(".ch").first().click();
  assert.equal(await page.locator(".lesson-path li.is-done").count(),0,"reset clears lesson progress");
  assert.equal(await page.locator("#main .word-check .option:disabled").count(),0);

  // 10. Phone width: no sideways scrolling with the path bar and a word check on screen.
  const phone=await browser.newPage({viewport:{width:390,height:800}});
  phone.on("pageerror",e=>errors.push(e.message));
  await phone.goto(root,{waitUntil:"load"});await enter(phone);
  assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),"no sideways scrolling at 390 px");
  assert.equal(await phone.locator(".lesson-path li").count(),3);
  assert.deepEqual(errors,[]);
  console.log("PASS guided lessons: path bar, word checks in the story, chapter word check, review of earlier words, progress, reload and reset.");
 }finally{
  if(browser)await browser.close();
  await close();
 }
})().catch(error=>{console.error(error);process.exitCode=1});
