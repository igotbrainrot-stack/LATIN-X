"use strict";
/* Regression suite for the November 2026 interface redesign, run on a real file:// page.
 * It covers what the redesign added or moved: Home, the reading display settings and
 * their storage, themes, Words (review + glossary), Settings, the audio strip states,
 * the Sound popover, keyboard entry, and layout at phone/tablet/desktop widths.
 * It does not judge Latin, audio quality or visual taste. */
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
const {toSettings}=require("./helpers/open-reader.cjs");
const url=pathToFileURL(path.resolve(__dirname,"..","index.html")).href;
const KEY="tablinum-state-v5",OLD="tablinum-source-review-v02";
const PRIVATE_ALIASES=/Līwia|Liiwia|Lii-wia|Lee-wee-ah|Kwoh-kweh/;
const stored=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||"null"),KEY);
const overflow=page=>page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
const lum=c=>{const v=c.match(/\d+(\.\d+)?/g).slice(0,3).map(n=>Number(n)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};
async function enter(page){
 if(await page.locator("#lx-welcome:not([hidden])").count()){await page.locator("#lx-welcome-skip").check();await page.locator("#lx-welcome-enter").click();}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const errors=[],network=[];
 const watch=page=>{page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
  page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url())})};
 try{
  const context=await browser.newContext({viewport:{width:1366,height:800},colorScheme:"light"});
  const page=await context.newPage();watch(page);
  await page.goto(url);

  // 1. First run: the course guide, then Home. A new learner is not nagged about backups.
  assert.equal(await page.locator("#lx-welcome:not([hidden])").count(),1,"first launch shows the course guide");
  await enter(page);
  await page.locator("#main .home-head").waitFor();
  assert.match(await page.locator("#main h1").first().innerText(),/Welcome to Tablinum/);
  assert.equal(await page.locator('#tabs [data-tab="home"][aria-current="page"]').count(),1);
  assert.equal((await page.locator("#appStatus").innerText()).trim(),"","no backup reminder for a profile with no progress");
  assert(await page.locator(".dock").isHidden(),"the audio strip belongs to the reader only");
  assert(await page.locator("#chapters").isHidden()&&await page.locator("#help").isHidden(),"Home uses the full width");
  assert.equal(await page.locator(".lesson-card").count(),8,"all eight lessons are offered on Home");
  assert.equal(await page.evaluate(()=>document.querySelectorAll("h1").length-document.querySelectorAll("#lx-welcome h1").length),1,"one page heading");
  const fonts=await page.evaluate(async()=>{const ok=async f=>{const faces=await document.fonts.load(f,"aā");return faces.length>0&&faces.every(x=>x.status==="loaded")};
   return [await ok('16px "Tablinum Book"'),await ok('600 16px "Tablinum Sans"')]});
  assert.deepEqual(fonts,[true,true],"both bundled typefaces load from file://");

  // 2. Keyboard: the first Tab stop is the skip link, and it lands in the main content.
  await page.reload();await page.locator("#main .home-head").waitFor();
  assert.equal(await page.locator("#lx-welcome:not([hidden])").count(),0,"the guide stays away once dismissed with the box ticked");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(()=>document.activeElement.className),"skip-link");
  const ring=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle);
  assert.notEqual(ring,"none","keyboard focus is visible");

  // 3. Continue learning opens the reader on the right lesson.
  await page.locator(".home-hero .btn.primary, .hero-body .btn.primary").first().click();
  await page.locator("#main .sentence").first().waitFor();
  assert.equal(await page.locator(".sentence").count(),9);
  assert.equal(await page.locator('#tabs [data-tab="read"][aria-current="page"]').count(),1);
  assert(await page.locator(".dock").isVisible());
  assert.equal(await page.evaluate(()=>document.querySelectorAll("#main h1").length),1,"one heading in the reader");

  // 4. Reading display: size, line spacing and focus mode apply at once and are saved additively.
  const size=()=>page.locator(".sentence .words").first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const base=await size();
  await page.locator('[data-action="textLarger"]').click();
  await page.locator('[data-action="textLarger"]').click();
  assert(await size()>base,"larger text is larger");
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.readerSize),"4");
  assert(await page.locator('[data-action="textLarger"]').isDisabled(),"the largest size disables the control");
  assert.equal(await overflow(page)<=1,true,"largest text does not scroll sideways on a laptop");
  await page.locator('[data-action="textSmaller"]').click();
  await page.locator('[data-action="lineSpacing"]').click();
  await page.locator('[data-action="focusMode"]').first().click();
  assert(await page.locator("#chapters").isHidden()&&await page.locator("#help").isHidden(),"focus mode hides the side panels");
  let state=await stored(page);
  assert.deepEqual(state.ui.display,{theme:"system",size:3,leading:2,focus:true});
  assert.equal(state.schema,"tablinum-state-v5");assert.equal(state.version,5,"no storage version change");
  assert.equal(state.ui.tab,"read","Home and Settings are never stored as the saved section");
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),OLD),null,"the retired v4 key is never written");
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>({...document.documentElement.dataset})),{theme:"system",readerSize:"3",readerLeading:"2",focus:"on"},"display settings survive a reload");
  await page.locator('#tabs [data-tab="read"]').click();
  await page.locator('[data-action="focusMode"]').first().click();
  assert(await page.locator("#chapters").isVisible(),"leaving focus mode brings the lesson list back");

  // 5. Selected and playing are different states; playing never moves the selection on.
  await page.locator(".sentence").nth(2).locator(".word").first().click();
  assert.equal(await page.locator(".sentence.is-playing").count(),0,"choosing a word does not start audio");
  assert.equal(await page.locator(".dock").getAttribute("data-playing"),"false");
  const play=page.locator('.dock [data-action="play"]');
  assert(await play.isVisible()&&await play.isEnabled(),"Play is always offered on the reader");
  assert.match(await page.locator("#audioMode").innerText(),/Arjun — approved recording/,"Chapter I names its approved narrator");
  await page.locator(".sentence").nth(1).locator(".listen").click();
  await page.locator(".sentence.is-playing").waitFor({timeout:8000});
  assert.equal(await page.locator(".sentence.is-playing").count(),1);
  assert.equal(await page.locator(".dock").getAttribute("data-playing"),"true");
  assert.match(await page.locator("#audioState").innerText(),/Sentence 2 of 9 · playing/i);
  assert.equal(await page.locator(".sentence").nth(1).locator(".listen").getAttribute("aria-pressed"),"true");
  await page.locator(".sentence.is-playing").waitFor({state:"detached",timeout:20000});
  await page.waitForTimeout(700);
  assert.equal(await page.locator(".sentence.is-playing").count(),0,"playback stops after one sentence: no automatic advance");
  assert.match(await page.locator("#audioState").innerText(),/Sentence 2 of 9$/i);
  await page.locator('#chapters [data-ch="1"]').click();
  // The label follows the chapter change after the previous clip has finished stopping, so wait for it.
  await page.waitForFunction(()=>/awaiting|pending|not yet/i.test(document.querySelector("#audioMode")?.innerText||""),null,{timeout:5000}).catch(()=>{});
  assert.match(await page.locator("#audioMode").innerText(),/awaiting|pending|not yet/i,"Chapter II recordings are labelled as awaiting the owner's approval");
  assert.equal(await page.locator(".dock").getAttribute("data-source"),"pending");
  await page.locator('#chapters [data-ch="0"]').click();

  // 6. Words: the glossary searches Latin and English, opens a word and leads back to the story.
  await page.locator(".sentence").first().locator(".word").nth(2).click();
  await page.locator("#help [data-gloss-open]").click();
  assert.equal(await page.locator('#tabs [data-tab="review"][aria-current="page"]').count(),1);
  assert.equal(await page.locator(".gloss-detail").count(),1,"the chosen word opens in the glossary");
  const total=await page.evaluate(()=>globalThis.TablinumCompiledContent?0:0);void total;
  await page.locator("#glossarySearch").fill("tree");
  await page.waitForTimeout(150);
  assert.equal(await page.locator("[data-gloss]").count(),1,"English search finds arbor");
  assert.equal(await page.evaluate(()=>document.activeElement.id),"glossarySearch","typing keeps the focus in the search box");
  await page.locator("#glossarySearch").fill("ARB");await page.waitForTimeout(150);
  await page.locator("[data-gloss]").first().click();
  assert.match(await page.locator(".gloss-detail").innerText(),/In the stories/i);
  await page.locator(".gloss-detail [data-goto]").first().click();
  await page.locator("#main .sentence").first().waitFor();
  assert.equal(await page.locator('#tabs [data-tab="read"][aria-current="page"]').count(),1,"an occurrence opens its sentence in the reader");
  await page.locator('#tabs [data-tab="review"]').click();
  await page.locator("[data-words='glossary']").first().click();
  await page.locator("#glossarySearch").fill("zzzz");await page.waitForTimeout(150);
  assert.equal(await page.locator("[data-gloss]").count(),0);
  assert.match(await page.locator("#main").innerText(),/No words match/i,"an empty search says so");

  // 7. Settings: theme, switches, the data tools; dark is a designed theme, not an inversion.
  await toSettings(page);
  assert.equal(await page.locator('.appbar [data-tab="settings"][aria-current="page"]').count()+await page.locator('.appbar [data-tab="settings"].active').count()>0,true);
  for(const control of ['[data-action="export"]',"#restoreFile",'[data-action="exportRecordings"]','[data-action="reset"]',"#backupDays",'[data-set-theme="dark"]','[data-action="macrons"]'])
   assert.equal(await page.locator("#main "+control).count(),1,"Settings offers "+control);
  await page.locator('[data-set-theme="dark"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),"dark");
  const dark=await page.evaluate(()=>({bg:getComputedStyle(document.documentElement).backgroundColor,ink:getComputedStyle(document.body).color}));
  assert(lum(dark.bg)<0.03&&lum(dark.ink)>0.6,"dark theme: dark page, light text "+JSON.stringify(dark));
  assert.equal(await page.locator('[data-set-theme="dark"]').getAttribute("aria-pressed"),"true");
  assert.equal((await stored(page)).ui.display.theme,"dark");
  await page.reload();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),"dark","the theme survives a reload");
  await toSettings(page);
  await page.locator('[data-set-theme="light"]').click();
  const light=await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor);
  assert(lum(light)>0.8,"light theme restored");

  // 8. The backup carries the display settings; an older backup without them still restores.
  const [download]=await Promise.all([page.waitForEvent("download"),page.locator('[data-action="export"]').click()]);
  const envelope=JSON.parse(require("node:fs").readFileSync(await download.path(),"utf8"));
  assert.equal(envelope.version,5);
  assert.deepEqual(envelope.state.ui.display,{theme:"light",size:3,leading:2,focus:false});
  page.on("dialog",d=>d.accept());
  const older=JSON.parse(JSON.stringify(envelope));delete older.state.ui.display;
  await page.locator("#restoreFile").setInputFiles({name:"older.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(older),"utf8")});
  await page.waitForFunction(()=>/restored/i.test(document.getElementById("appStatus").textContent));
  assert.deepEqual(await page.evaluate(()=>({...document.documentElement.dataset})),{theme:"system",readerSize:"2",readerLeading:"1",focus:"off"},"a backup from before the redesign restores, with the standard display");
  assert.equal((await stored(page)).ui.display,undefined,"restoring an older backup does not invent settings in the saved profile");
  const other=JSON.parse(JSON.stringify(envelope));other.state.ui.display={theme:"dark",size:1,leading:0,focus:false};
  await page.locator("#restoreFile").setInputFiles({name:"other.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(other),"utf8")});
  await page.waitForFunction(()=>document.documentElement.dataset.readerSize==="1");
  assert.deepEqual(await page.evaluate(()=>({...document.documentElement.dataset})),{theme:"dark",readerSize:"1",readerLeading:"0",focus:"off"},"a backup that carries display settings applies them");
  // Damaged display values fall back to defaults instead of breaking the page.
  await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.ui.display={theme:"neon",size:99,leading:-1,focus:"yes"};localStorage.setItem(k,JSON.stringify(s))},KEY);
  await page.reload();
  assert.deepEqual(await page.evaluate(()=>({...document.documentElement.dataset})),{theme:"system",readerSize:"2",readerLeading:"1",focus:"off"});
  await page.locator("#main .home-head").waitFor();

  // 9. Sound popover: closed at rest, opens from its button, closes with Escape and returns focus.
  assert.equal(await page.locator("#ambience-controls").isVisible(),false);
  await page.locator("#sound-button").click();
  assert(await page.locator("#music-toggle").isVisible()&&await page.locator("#music-next").isVisible());
  assert.match(await page.locator("#music-track").innerText(),/Track [1-3] of 3|Music is off/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#ambience-controls").isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),"sound-button");

  // 10. Private narration aliases never reach the learner, in any section.
  for(const tab of ["home","read","quiz","review","progress"]){
   await page.locator('#tabs [data-tab="'+tab+'"]').click();
   const text=await page.evaluate(()=>document.body.innerText+" "+[...document.querySelectorAll("[title],[aria-label],[alt]")].map(e=>(e.title||"")+" "+(e.getAttribute("aria-label")||"")+" "+(e.getAttribute("alt")||"")).join(" "));
   assert(!PRIVATE_ALIASES.test(text),"private pronunciation alias visible on "+tab);
   if(tab==="read")assert(/Līvia/.test(text),"the learner-facing spelling Līvia is shown");
  }
  await context.close();

  // 11. Layout: no sideways scrolling and no clipped controls from a small phone to a wide desktop.
  for(const [label,width,height] of [["small phone",320,640],["phone",390,844],["tablet",768,1024],["laptop",1366,768],["desktop",1920,1080]]){
   const ctx=await browser.newContext({viewport:{width,height},colorScheme:label==="phone"?"dark":"light"});
   const p=await ctx.newPage();watch(p);
   await p.goto(url);await enter(p);
   const check=async view=>{
    const o=await overflow(p);assert(o<=1,label+" "+view+" scrolls sideways by "+o+"px");
    const clipped=await p.evaluate(()=>[...document.querySelectorAll("#tabs button, .appbar-tools button, #main .btn, #main .option, .dock .btn")]
     .filter(el=>el.offsetParent!==null&&(el.getBoundingClientRect().right>innerWidth+1||el.getBoundingClientRect().left<-1)).map(el=>(el.innerText||el.getAttribute("aria-label")||"").slice(0,30)));
    assert.deepEqual(clipped,[],label+" "+view+": controls outside the window");
   };
   await check("home");
   for(const tab of ["read","quiz","review","progress"]){
    await p.locator('#tabs [data-tab="'+tab+'"]').click();await check(tab);
    if(tab==="read"){
     await p.locator(".sentence .word").nth(1).click();await check("read+word");
     const fit=await p.evaluate(()=>{const d=document.querySelector(".dock").getBoundingClientRect();return [...document.querySelectorAll(".dock .btn")].filter(b=>b.offsetParent!==null).every(b=>{const r=b.getBoundingClientRect();return r.left>=d.left-1&&r.right<=d.right+1&&b.scrollWidth<=b.clientWidth+1})});
     assert(fit,label+": the audio buttons fit inside the strip without cut-off labels");
    }
    if(tab==="review"){await p.locator("[data-words='glossary']").first().click();await check("glossary");}
   }
   await toSettings(p);await check("settings");
   if(width<=390){
    const targets=await p.evaluate(()=>[...document.querySelectorAll("#tabs button, .appbar-tools > button, #sound-button")].map(el=>{const r=el.getBoundingClientRect();return Math.min(r.width,r.height)}));
    assert(Math.min(...targets)>=40,label+": navigation targets are at least 40px, found "+Math.min(...targets));
   }
   if(label==="phone")assert(lum(await p.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor))<0.03,"System setting follows a dark computer");
   await ctx.close();
  }

  // 12. Reduced motion: nothing animates on Home or in Settings either.
  const calmCtx=await browser.newContext({viewport:{width:1366,height:800},reducedMotion:"reduce"});
  const calm=await calmCtx.newPage();watch(calm);
  await calm.goto(url);await enter(calm);
  const worst=()=>calm.evaluate(()=>{const secs=v=>v.split(",").map(x=>x.trim().endsWith("ms")?parseFloat(x)/1000:parseFloat(x));let w=0;
   for(const el of document.querySelectorAll("body, body *")){const s=getComputedStyle(el);w=Math.max(w,...secs(s.animationDuration),...secs(s.transitionDuration))}return w});
  assert(await worst()<=0.001,"Home respects reduced motion");
  await toSettings(calm);assert(await worst()<=0.001,"Settings respects reduced motion");
  await calmCtx.close();

  assert.deepEqual(errors,[],"no page or console errors");
  assert.deepEqual(network,[],"no network requests");
  console.log("PASS redesign: Home first run, skip link, continue learning, reading display saved additively and restored from old and new backups, selected vs playing, no auto-advance, honest narrator labels, glossary, Settings and themes, Sound popover, private aliases hidden, 5 viewport widths, reduced motion, zero network.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
