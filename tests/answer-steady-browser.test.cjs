"use strict";
/* Pressing an answer must not move the page. Each answer re-renders the view; before the
 * fix the entrance animation re-ran on every render (the whole page faded in and rose
 * 10px), and a change in height above the pressed card pushed it down the screen. */
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of [1366,420]){
   const page=await browser.newPage({viewport:{width,height:800}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(pathToFileURL(path.resolve(__dirname,"..","index.html")).href);
   await page.waitForTimeout(800);
   if(await page.locator("#lx-welcome:not([hidden])").count())await page.locator("#lx-welcome-enter").click();
   await page.locator(".sentence").first().waitFor();
   await page.waitForTimeout(600);
   const press=async(label,selector)=>{
    const button=page.locator(selector).first();
    const question=await button.evaluate(b=>{const card=b.closest("section");window.scrollBy(0,card.getBoundingClientRect().top-350);return card.querySelector(".question").textContent});
    await page.waitForTimeout(300);
    const before=await page.evaluate(()=>scrollY);
    await button.click();
    for(const wait of [0,120,600]){
     await page.waitForTimeout(wait);
     const now=await page.evaluate(q=>{const card=[...document.querySelectorAll("section.word-check")].find(s=>s.querySelector(".question")?.textContent===q);
      return {top:Math.round(card.getBoundingClientRect().top),entering:document.getElementById("main").classList.contains("view-enter")}},question);
     assert.ok(Math.abs(now.top-350)<=2,label+" at "+width+"px: the answered card moved to "+now.top+" (was 350) after "+wait+" ms");
     assert.equal(now.entering,false,label+": the page entrance animation re-ran after an answer");
    }
    return before;
   };
   let n=0;
   while(await page.locator("button[data-wc]:not([disabled])").count()){await press("story word check "+(++n),"button[data-wc]:not([disabled])");
    const wreath=page.locator(".play-dialog[open] .play-foot .btn, dialog[open] [data-g=close]");if(await wreath.count())await page.keyboard.press("Escape");}
   assert.ok(n>=2,"chapter I has word checks in the story");
   await page.locator("#tabs [data-tab='quiz']").click();await page.waitForTimeout(600);
   await page.locator("[data-action=startWordTest]").first().click();await page.waitForTimeout(600);
   for(let k=1;k<=4;k++)await press("chapter word check "+k,"button[data-wt]:not([disabled])");
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log("Answers keep the page still: story and chapter word checks, desktop and phone width.");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
