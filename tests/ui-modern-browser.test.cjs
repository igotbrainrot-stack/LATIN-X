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
/* Interface modernisation: navigation stays in reach, one-shot animation markers, messages,
   reduced motion, and no sideways scrolling on a phone. */
(async()=>{
 await listen();
 const root="http://127.0.0.1:"+server.address().port;
 let browser;const errors=[];
 const enter=async page=>{
  if(await page.locator("#lx-welcome:not([hidden])").count()){await page.locator("#lx-welcome-skip").check();await page.locator("#lx-welcome-enter").click();}
 };
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:1366,height:800}});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(root,{waitUntil:"load"});await enter(page);
  assert(await page.evaluate(()=>[...document.styleSheets].some(s=>(s.href||"").endsWith("app/styles/tablinum-modern.css"))),"modern stylesheet must load");

  // Tabs carry an English label and stay at the top of the window while reading.
  assert.deepEqual(await page.locator("#tabs button small").allInnerTexts(),["Read","Practise","Review","Progress"]);
  await page.locator(".sentence").nth(6).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0,600);await page.waitForTimeout(300);
  const tabsTop=await page.locator("#tabs").evaluate(el=>Math.round(el.getBoundingClientRect().top));
  assert.equal(tabsTop,0,"section tabs must stay at the top of the window");
  // The word panel follows the reader, so a looked-up word is visible without scrolling back.
  await page.locator(".sentence").nth(6).locator(".word").first().click();
  const panel=await page.locator("#help .panel").evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight});
  assert(panel,"the word panel must be in view after choosing a word far down the page");
  assert(await page.locator(".word.is-chosen").count()>0,"the chosen word is marked");
  assert.equal(await page.locator("#help").getAttribute("data-fresh"),"word");
  // A later re-render must not replay the entrance animation.
  await page.locator("[data-action='macrons']").click();
  assert.equal(await page.locator("#help").getAttribute("data-fresh"),"");

  // Exercises: the answered question is marked once; messages show and then step aside.
  await page.locator("#tabs [data-tab='quiz']").click();
  assert.equal(await page.locator(".layout").getAttribute("data-tab"),"quiz");
  const wrong=page.locator("#main [data-choice='0']").nth(1);
  await wrong.click();
  assert.equal(await page.locator(".quiz[data-fresh]").count(),1,"only the question just answered is animated");
  const status=page.locator("#appStatus");
  assert.match(await status.innerText(),/Not quite/);
  assert.equal(await status.evaluate(el=>getComputedStyle(el).position),"fixed");
  await page.locator("#main [data-choice='1']").first().click();
  assert.equal(await page.locator(".quiz[data-fresh]").count(),1);
  assert.equal(await page.locator(".quiz").first().getAttribute("data-fresh"),null,"an earlier question must not animate again");
  // A passing message does not follow the learner to another section.
  await page.locator("#tabs [data-tab='progress']").click();
  assert.equal(await status.innerText(),"");
  assert(await page.locator("#help").isHidden(),"the word panel is not shown on Prōgressus");
  assert(await page.locator(".ch-progress").count()>=8,"each chapter shows its progress mark");

  // Reduced motion: no animation or transition takes time.
  const calm=await browser.newPage({viewport:{width:1366,height:800},reducedMotion:"reduce"});
  calm.on("pageerror",e=>errors.push(e.message));
  await calm.goto(root,{waitUntil:"load"});await enter(calm);
  const motion=await calm.evaluate(()=>{
   const secs=v=>v.split(",").map(x=>x.trim().endsWith("ms")?parseFloat(x)/1000:parseFloat(x));
   let worst=0;
   for(const el of document.querySelectorAll("body, body *")){const s=getComputedStyle(el);
    worst=Math.max(worst,...secs(s.animationDuration),...secs(s.transitionDuration));}
   return worst;
  });
  assert(motion<=0.001,"reduced motion must switch animation off, found "+motion+"s");

  // Phone: nothing scrolls sideways on any section.
  // A new section starts at its top: from part-way down a page, every other section opens
  // with its heading directly under the tabs, and going back and forth does not move it.
  // The clicks are sent at the pointer position, so the test tool does not scroll the page itself.
  const press=async selector=>{const box=await page.evaluate(q=>{const r=document.querySelector(q).getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},selector);await page.mouse.click(box[0],box[1])};
  const place=()=>page.evaluate(()=>({tabs:Math.round(document.querySelector("#tabs").getBoundingClientRect().bottom),main:Math.round(document.querySelector("#main").getBoundingClientRect().top)}));
  await press("#tabs [data-tab='read']");
  await page.evaluate(()=>scrollTo(0,900));
  for(const tab of ["quiz","review","progress","read","quiz"]){
   await press("#tabs [data-tab='"+tab+"']");
   const at=await place();
   assert.equal(at.main,at.tabs,tab+" must open at its top, directly under the tabs: "+JSON.stringify(at));
  }
  await page.evaluate(()=>scrollTo(0,0));
  await press("#tabs [data-tab='review']");
  assert.equal(await page.evaluate(()=>scrollY),0,"a section change at the top of the page does not scroll");
  await press("#tabs [data-tab='read']");
  const phone=await browser.newPage({viewport:{width:360,height:740}});
  phone.on("pageerror",e=>errors.push(e.message));
  await phone.goto(root,{waitUntil:"load"});await enter(phone);
  for(const tab of ["read","quiz","review","progress"]){
   await phone.locator("#tabs [data-tab='"+tab+"']").click();
   const s=await phone.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:innerWidth}));
   assert(s.scroll<=s.view+1,tab+" scrolls sideways on a phone: "+JSON.stringify(s));
   assert(await phone.locator("#tabs [data-tab='progress']").isVisible(),"all four tabs fit on a phone");
  }
  assert.deepEqual(errors,[]);
  console.log("PASS interface modernisation: sticky navigation, word panel in view, one-shot markers, messages, reduced motion, phone layout.");
 }finally{if(browser)await browser.close();await close();}
})().catch(e=>{console.error(e);process.exit(1)});
