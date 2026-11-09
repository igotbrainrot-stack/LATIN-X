"use strict";
const assert=require("node:assert/strict"),path=require("node:path");
const {chromium}=require("playwright"),{pathToFileURL}=require("node:url");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const old=JSON.stringify({version:4,ch:0,vocab:{hortus:{head:"hortus",meaning:"garden",days:1,due:0,reps:3}}});
  await page.addInitScript(raw=>{localStorage.setItem("tablinum-source-review-v02",raw)},old);
  const url=pathToFileURL(path.resolve(__dirname,"..","index.html")).href;
  await page.goto(url);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  try{await page.locator(".sentence").first().waitFor({timeout:5000})}
  catch(e){
   const snapshot=await page.evaluate(()=>({body:document.body?.innerText?.slice(0,1400),
    fsrs:typeof globalThis.FSRS,deck:typeof globalThis.TablinumReviewDeck,
    status:document.getElementById("appStatus")?.textContent||""}));
   throw Error("Phase6 browser boot failed: "+JSON.stringify({errors,snapshot}));
  }
  await page.locator('#tabs [data-tab="review"]').click();
  assert.match(await page.locator("#main").textContent(),/Offline FSRS/);
  assert.match(await page.locator("#main").textContent(),/Verbum vetus/);
  await page.locator('[data-action="revealCard"]').click();
  await page.locator('[data-rating="good"]').click();
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert(state.deck.legacyCards.hortus.fsrs,"Pinned library must create real FSRS card");
  assert.equal(state.deck.cards["hortus:recog"],undefined);
  assert.equal(state.deck.log.length,1);
  assert.equal(await page.evaluate(()=>localStorage.getItem("tablinum-source-review-v02")),old);
  await page.reload();await page.locator('#tabs [data-tab="review"]').waitFor();
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(state.deck.log.length,1,"Review history must survive file:// reload");
  assert(state.deck.legacyCards.hortus.fsrs);
  await page.locator('#tabs [data-tab="read"]').click();
  await page.evaluate(()=>{
   const l={id:"lx-hortus-garden",head:"hortus",status:"approved",first_chapter:1,
    senses:[{gloss_la:"locus arborum",gloss_en:"garden"}]};
   globalThis.TablinumCompiledContent.lexicon.lexemes.push(l);
   const c={schema:"tablinum-lesson-v1",id:"b01-c001",chapter:1,book:1,title:"Synthetic FSRS test",
    status:"approved",legacy:false,new_lexemes_declared:[l.id],
    segments:[{sentences:[{id:"b01-c001-s001",text_la:"Hortus magnus est.",tokens:[{t:"Hortus",lx:l.id}]}]}],
    exercises:[
     {id:"b01-c001-q001",type:"tf",prompt_la:"Vērum an falsum?",answer:false,status:"approved",review:{by:"SYNTHETIC BROWSER TEST",at:"2026-11-05"}},
     {id:"b01-c001-q002",type:"order",prompt_la:"Ordinem pōne.",items:["s002","s001","s003"],
      labels:{s001:"Prīmum",s002:"Deinde",s003:"Postrēmum"},answer:["s001","s002","s003"],
      status:"approved",review:{by:"SYNTHETIC BROWSER TEST",at:"2026-11-05"}}
    ],speaking:[]};
   const t=globalThis.Tablinum;t.catalogue.set(c.id,{id:c.id,chapter:1,legacy:false,script:"content/b01/c001.js",
      title:c.title,source_hash:"0".repeat(64)});
   t.registerChapter(c);
  });
  await page.locator('#tabs [data-tab="progress"]').click();
  await page.locator('[data-course="b01-c001"]').click();
  await page.locator('[data-action="courseFinished"]').click();
  state=await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")));
  assert.equal(Object.keys(state.deck.cards).length,1,"Only approved synthetic lexeme gets a card");
  assert.equal(state.deck.cards["lx-hortus-garden:recog"].sourceHighlight,"Hortus");
  assert.equal(state.exposure["lx-hortus-garden"].seen,1,
    "Marking the only/final sentence as read must count approved-word exposure once");
  await page.locator('#tabs [data-tab="quiz"]').click();
  assert.match(await page.locator("#main").textContent(),/Vērum/);
  assert.match(await page.locator("#main").textContent(),/Falsum/);
  await page.locator('[data-ex-choice="b01-c001-q001"][data-ex-value="false"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")).questions["b01-c001-q001"].correct),true);
  await page.locator('[data-ex-order-shift="b01-c001-q002"][data-order-index="0"][data-order-delta="1"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator('[data-ex-order-id="b01-c001-q002"]').first().getAttribute("data-order-index"),"0");
  await page.locator('[data-ex-order-submit="b01-c001-q002"]').focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("tablinum-state-v5")).questions["b01-c001-q002"].correct),true);
  await page.locator('#tabs [data-tab="progress"]').click();
  const summary=await page.locator("#main").textContent();
  assert.match(summary,/Introduced \(approved\)/);assert.match(summary,/Encountered/);
  assert.match(summary,/Recognised/);assert.match(summary,/Productive/);
  assert.deepEqual(errors,[]);
  console.log("PASS Phase6 Windows file://: FSRS migration and reload, no promoted unsigned words, synthetic approved story card, Vērum/Falsum, keyboard order and 4 counters.");
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
