"use strict";
/* Windows file:// browser test: the actual nine approved WebPs, SVG fallback,
 * image/polygon selection, buttons and immutable unsigned progress. */
const assert=require("node:assert/strict"),path=require("node:path"),{pathToFileURL}=require("node:url");
const {chromium,firefox}=require("playwright");
const manifest=require("../curriculum/illustrations.json");
(async()=>{
 const selected=process.env.TABLINUM_BROWSER_NAME||"chromium";
 const browser=await(selected==="firefox"?firefox:chromium).launch({headless:true,...(["chrome","msedge"].includes(selected)?{channel:selected}:{})});
 const context=await browser.newContext({viewport:{width:1350,height:900}}),page=await context.newPage(),errors=[],network=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
 try{
  const root=path.resolve(__dirname,"..");
  await page.goto(pathToFileURL(path.join(root,"Picture Practice.html")).href);
  if(await page.locator("#lx-welcome:not([hidden])").count()){
   await page.locator("#lx-welcome-skip").check();
   await page.locator("#lx-welcome-enter").click();
  }
  await page.locator('[data-picture-chapter="b01-c001"]').waitFor();
  assert.equal(await page.locator('[data-picture-chapter]').count(),8);
  const v4='{"keep":"original-v4"}',snapshot='{"keep":"v4-snapshot"}',v5='{"preserved":"do-not-change"}';
  await page.evaluate(({v4,snapshot,v5})=>{
   localStorage.setItem("tablinum-source-review-v02",v4);
   localStorage.setItem("tablinum-v4-snapshot",snapshot);
   localStorage.setItem("tablinum-state-v5",v5);
  },{v4,snapshot,v5});
  for(let chapter=1;chapter<=8;chapter++){
   await page.locator(`[data-picture-chapter="b01-c${String(chapter).padStart(3,"0")}"]`).click();
   const scenes=manifest.scenes.filter(s=>s.chapter===chapter);
   assert.equal(await page.locator('img[data-art-image]').count(),scenes.length,`Chapter ${chapter} must show all approved scenes`);
   for(const s of scenes){
    const figure=page.locator(`[data-art-scene="${s.id}"]`).first(),image=figure.locator('img[data-art-image]');
    await page.waitForFunction(id=>{const i=document.querySelector(`[data-art-image="${id}"]`);return i?.complete&&i.naturalWidth>0&&i.style.display!=="none"},s.id);
    await image.scrollIntoViewIfNeeded();
    assert((await image.getAttribute("src")).endsWith('.webp'));
    assert.equal(await figure.locator('.art-fallback').isHidden(),true);
    assert.equal(await figure.locator('[data-art-region]').count(),s.required_region_ids.length);
    assert.equal(await figure.locator('[data-art-regions]').isVisible(),true,"Overlay follows image load");
    // Click inside a real manifest polygon; verify the image surface is interactive.
    const pos=await page.evaluate(id=>{
     const scene=window.TablinumArtScenes.manifest.scenes.find(x=>x.id===id),api=window.TablinumArtScenes;
     const target=scene.required_region_ids[0];
     for(let y=2;y<98;y+=.5)for(let x=2;x<98;x+=.5)
      // Pick a point well inside the polygon, not on an edge, so pixel rounding cannot miss it.
      if([[0,0],[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]].every(([dx,dy])=>api.regionAt(id,x+dx,y+dy)===target))return {x,y,target};
     throw Error("No distinct hit point for "+id+" / "+target);
    },s.id);
    const box=await image.boundingBox();assert(box);
    await page.mouse.click(box.x+box.width*pos.x/100,box.y+box.height*pos.y/100);
    assert.equal(await figure.locator(`[data-art-region="${pos.target}"]`).getAttribute('aria-pressed'),"true");
    assert.equal(await figure.locator(`[data-art-poly="${pos.target}"]`).getAttribute('stroke'),"none","No hard polygon edge");
    assert.equal(await figure.locator(`[data-art-glow="${pos.target}"]`).getAttribute('opacity'),"0.76","Selected artwork has broad glow");
    // A click outside every polygon must not change the current selected region.
    const outside=await page.evaluate(id=>{
     const api=window.TablinumArtScenes;
     for(let y=1;y<100;y++)for(let x=1;x<100;x++)if(api.regionAt(id,x,y)===null)return{x,y};
     return null;
    },s.id);
    if(outside){
     await page.mouse.click(box.x+box.width*outside.x/100,box.y+box.height*outside.y/100);
     assert.equal(await figure.locator(`[data-art-region="${pos.target}"]`).getAttribute('aria-pressed'),"true","Outside polygon cannot change selection");
    }
    const choice=figure.locator(`[data-art-region="${s.required_region_ids.at(-1)}"]`);
    await choice.focus();await page.keyboard.press('Enter');
    assert.equal(await choice.getAttribute('aria-pressed'),"true","Keyboard region buttons must select/hilight polygons");
    assert.equal(await figure.locator(`[data-art-poly="${s.required_region_ids.at(-1)}"]`).getAttribute('stroke'),"none");
    assert.equal(await figure.locator(`[data-art-inner-glow="${s.required_region_ids.at(-1)}"]`).getAttribute('opacity'),"0.43","Keyboard selection also glows");
   }
  }
  // Chapter VIII storm overlap: preserve the smallest-region visual highlight,
  // but the exact click coordinate must grade against the expected polygon.
  await page.locator('[data-picture-chapter="b01-c008"]').click();
  const stormId="b01-c008-scene-storm",stormFigure=page.locator(`[data-art-scene="${stormId}"]`).first();
  const stormImage=stormFigure.locator('img[data-art-image]');
  await stormImage.scrollIntoViewIfNeeded();
  await page.evaluate(()=>{
   window.__stormSelections=[];
   document.addEventListener('tablinum:picture-region',e=>window.__stormSelections.push(e.detail));
  });
  for(const {answer,x,y,highlight}of [
   {answer:"fenestra",x:25,y:25,highlight:"ventus"},
   {answer:"ventus",x:30,y:32,highlight:"arbor"}
  ]){
   const bounds=await stormImage.boundingBox();assert(bounds);
   await page.mouse.click(bounds.x+bounds.width*x/100,bounds.y+bounds.height*y/100);
   const clicked=await page.evaluate(()=>window.__stormSelections.at(-1));
   assert.equal(clicked.sceneId,stormId);
   assert.equal(clicked.regionId,highlight,"Visual highlight must remain the smallest containing polygon");
   assert(Math.abs(clicked.point.x-x)<0.3&&Math.abs(clicked.point.y-y)<0.3,"Real pixel click coordinates must be retained");
   const graded=await page.evaluate(({answer,clicked})=>{
    const practice=window.TablinumPicturePractice;
    const original=practice.chapters.find(c=>c.id==='b01-c008').exercises.find(e=>e.scene_id===clicked.sceneId&&e.answer===answer);
    const signed={...original,status:'approved',scoring_enabled:true,review:{by:'SYNTHETIC BROWSER TEST ONLY',at:'2026-11-07'}};
    return {
     pointer:practice.evaluate(signed,clicked.regionId,{id:'b01-c008',status:'approved'},null,clicked.point),
     keyboard:practice.evaluate(signed,clicked.regionId,{id:'b01-c008',status:'approved'},null),
     unsigned:practice.evaluate(original,clicked.regionId,{id:'b01-c008',status:'draft'},localStorage,clicked.point)
    };
   },{answer,clicked});
   assert.equal(graded.pointer.correct,true,`Overlapping click on ${answer} should score against answer polygon`);
   assert.equal(graded.keyboard.correct,false,"Keyboard/smallest-region result remains an exact region selection");
   assert.equal(graded.unsigned.status,'ungraded',"Unsigned questions must stay ungraded");
  }
  const after=await page.evaluate(()=>({v4:localStorage.getItem("tablinum-source-review-v02"),snapshot:localStorage.getItem("tablinum-v4-snapshot"),v5:localStorage.getItem("tablinum-state-v5")}));
  assert.deepEqual(after,{v4,snapshot,v5},"Unsigned picture selections must never alter v4/snapshot/v5 progress");
  assert.deepEqual(network,[],"Picture practice must run offline on file://");
  assert.deepEqual(errors,[],"No browser exceptions");
  console.log(`PASS Phase8 picture practice Windows file:// ${selected}: all 9 approved WebPs load offline, inside/outside polygon clicks, overlapping storm answer grading, keyboard button highlighting, immutable unreviewed v5.`);
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
