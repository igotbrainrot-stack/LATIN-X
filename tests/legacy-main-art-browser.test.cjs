"use strict";
/* Windows local file:// reader integration: the old lessons' SVG artwork should be
 * replaced by approved Book I visual PREVIEWS, never by unsigned lessons. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium,firefox}=require('playwright');
(async()=>{
 const name=process.env.TABLINUM_BROWSER_NAME||'chromium';
 const browser=await (name==='firefox'?firefox:chromium).launch({headless:true,...(['chrome','msedge'].includes(name)?{channel:name}:{})});
 const context=await browser.newContext({viewport:{width:1365,height:930}});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/i.test(r.url()))external.push(r.url());});
 const bookIds=['b01-c001','b01-c002','b01-c004','b01-c003','b01-c006','b01-c007','b01-c008','b01-c005'];
 try{
  const url=pathToFileURL(path.join(__dirname,'..','index.html')).href;
  await page.goto(url);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  for(let i=0;i<8;i++){
   await page.locator(`button.ch[data-ch="${i}"]`).click();
   const marker=page.locator(`[data-legacy-art-preview="${bookIds[i]}"]`);
   await marker.waitFor({state:'attached'});
   assert.equal(await page.locator('[data-legacy-art-preview]').count(),1,`Legacy ${i+1} must have one picture preview`);
   const images=marker.locator('img[data-art-image]');
   assert.equal(await images.count(),i===6?2:1,`Wrong number of matching approved images: legacy ${i+1}`);
   const alt=await marker.textContent();
   assert(alt.includes('Approved Book I artwork'));
   if(i===7)assert(alt.includes('related illustration (not a literal depiction'), 'Crās is only a related evening image');
   for(let j=0;j<await images.count();j++){
    const img=images.nth(j);
    await page.waitForFunction(({id,idx})=>{
     const el=document.querySelectorAll(`[data-legacy-art-preview="${id}"] img[data-art-image]`)[idx];
     return el?.complete&&el.naturalWidth>0&&el.style.display!=='none';
    },{id:bookIds[i],idx:j});
    assert((await img.getAttribute('src')).endsWith('.webp'));
    assert.equal(await img.isVisible(),true);
    assert.equal(await marker.locator('.art-fallback').nth(j).isHidden(),true,'Basic SVG must be hidden on successful WebP load');
   }
   assert(await page.locator('.sentence').count()>0,'Legacy story text must remain available');
  }
  // A keyboard region selection may highlight but must not grade or write progress.
  await page.locator('button.ch[data-ch="2"]').click();
  await page.locator('[data-legacy-art-preview="b01-c004"]').waitFor();
  const before=await page.evaluate(()=>({v4:localStorage.getItem('tablinum-source-review-v02'),snapshot:localStorage.getItem('tablinum-v4-snapshot'),v5:localStorage.getItem('tablinum-state-v5')}));
  const first=page.locator('[data-legacy-art-preview] button[data-art-region]').first();
  await first.focus();await page.keyboard.press('Enter');
  assert.equal(await first.getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.TablinumArtSelection?.scored),false);
  const after=await page.evaluate(()=>({v4:localStorage.getItem('tablinum-source-review-v02'),snapshot:localStorage.getItem('tablinum-v4-snapshot'),v5:localStorage.getItem('tablinum-state-v5')}));
  assert.deepEqual(after,before,'Illustration preview must not change saved progress');
  // Missing/corrupt image should unhide the ORIGINAL SVG rather than breaking reading.
  const image=page.locator('[data-legacy-art-preview="b01-c004"] img[data-art-image]').first();
  await image.evaluate(el=>el.src='assets/art/b01/not-present-art.webp');
  await page.waitForFunction(()=>!document.querySelector('[data-legacy-art-preview="b01-c004"] .art-fallback')?.hidden);
  assert.equal(await page.locator('[data-legacy-art-preview="b01-c004"] .art-fallback .scene svg').isVisible(),true);
  assert.deepEqual(external,[],'No network requests are allowed in the offline program');
  assert.deepEqual(errors,[],'Unexpected browser script error');
  console.log(`PASS main reader ${name} file://: legacy topics 1–8 display nine owner-approved WebPs, SVG fallback on errors, preserved original Latin and learner progress.`);
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
