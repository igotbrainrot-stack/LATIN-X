/* Reviewed course illustrations, offline classic-script file URL safe.
 * A review status without actual owner signature NEVER displays a draft image.
 * Native SVG remains as accessible fallback for load/missing-file errors. */
(function(root){
"use strict";
const data=root.TablinumIllustrationsData||{scenes:[]};
function esc(x){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function approved(c){
 if(!c||c.status!=="approved"||!c.approval?.by||!c.approval?.at||
  !/^\d{4}-\d\d-\d\d$/.test(c.approval.at)||typeof c.alt_la_draft!=="string"||
  !c.alt_la_draft.trim()||!c.alt_en_draft?.trim()||!c.tool?.trim()||
  !c.generation_prompt?.trim()||!c.licence_status?.trim()||!c.provenance)return false;
 if(!/^assets\/art\/b01\/[a-z0-9-]+\.webp$/.test(c.asset||"")||
  !/^assets\/art\/b01\/[a-z0-9-]+-thumb\.webp$/.test(c.thumbnail||""))return false;
 return (c.required_region_ids||[]).length>0&&(c.required_region_ids||[]).every(k=>{
  const p=c.polygons?.[k];return Array.isArray(p)&&p.length>=3&&p.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&n>=0&&n<=100));
 });
}
function regionHit(poly,x,y){
 if(!Array.isArray(poly)||poly.length<3)return false;
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j],cross=(a[1]>y)!==(b[1]>y)&&
    x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0];
  if(cross)inside=!inside;
 }
 return inside;
}
// Choose the smallest containing reviewed polygon so a garden/background region
// cannot swallow a smaller object. Coordinates use the approved 0–100% manifest.
function polygonArea(p){let area=0;for(let i=0;i<p.length;i++){const n=p[(i+1)%p.length];area+=p[i][0]*n[1]-n[0]*p[i][1]}return Math.abs(area)/2}
function regionAt(sceneId,x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>100||y>100)return null;
 const scene=(data.scenes||[]).find(s=>s.id===sceneId&&approved(s));
 if(!scene)return null;
 const hits=(scene.required_region_ids||[]).filter(id=>regionHit(scene.polygons?.[id],x,y));
 hits.sort((a,b)=>polygonArea(scene.polygons[a])-polygonArea(scene.polygons[b]));
 return hits[0]||null;
}
function imagePoint(img,clientX,clientY){
 if(!img||typeof img.getBoundingClientRect!=="function")return null;
 const r=img.getBoundingClientRect();
 if(!r.width||!r.height)return null;
 const x=(clientX-r.left)/r.width*100,y=(clientY-r.top)/r.height*100;
 return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=100&&y>=0&&y<=100?{x,y}:null;
}
function imageRegionAt(img,clientX,clientY){
 const point=imagePoint(img,clientX,clientY);
 return point?regionAt(img.dataset.artImage,point.x,point.y):null;
}
// A click carries its actual image coordinates for future reviewed grading;
// region is still the smallest overlapping polygon for UI highlight and buttons.
function select(scene,region,point=null){
 root.TablinumArtSelection={scene_id:scene,region_id:region,at:new Date().toISOString(),scored:false};
 if(typeof document!=="undefined"&&typeof root.CustomEvent==="function"){
  document.dispatchEvent(new root.CustomEvent("tablinum:picture-region",{detail:{sceneId:scene,regionId:region,point,scored:false}}));
  for(const b of document.querySelectorAll("[data-art-region]"))
   b.setAttribute("aria-pressed",String(b.dataset.artScene===scene&&b.dataset.artRegion===region));
  // Real blurred colour masks, not drop-shadows of an almost transparent fill.
  // The SVG polygons are only geometric masks: no hard stroke is ever drawn.
  // A broad, diffuse gold wash and a quieter inner bloom blend with the
  // watercolor. There is never a visible polygon outline. The original hit
  // coordinates, graded answer, and all selection semantics remain unchanged.
  for(const glow of document.querySelectorAll("[data-art-glow]")){
   const chosen=glow.closest("[data-art-regions]")?.dataset.artRegions===scene&&glow.dataset.artGlow===region;
   glow.setAttribute("opacity",chosen?"0.76":"0");
  }
  for(const inner of document.querySelectorAll("[data-art-inner-glow]")){
   const chosen=inner.closest("[data-art-regions]")?.dataset.artRegions===scene&&inner.dataset.artInnerGlow===region;
   inner.setAttribute("opacity",chosen?"0.43":"0");
  }
  for(const poly of document.querySelectorAll("[data-art-poly]")){
   poly.setAttribute("stroke","none");
   poly.setAttribute("fill","none");
   poly.removeAttribute("style");
  }
 }
 return root.TablinumArtSelection;
}
function single(c,svgFallback){
 const attrs="data-art-scene="+JSON.stringify(c.id);
 const shapes=Object.entries(c.polygons).map(([id,p])=>({id,points:p.map(v=>v.join(",")).join(" ")}));
 // The filters use percentage-space radii and extended bounds so bright areas
 // still feather naturally near the image perimeter. The polygons never form
 // a visible border; they only carry diffuse gold through the blur filters.
 const filterId="tablinum-glow-"+c.id;
 const softId="tablinum-glow-core-"+c.id;
 const filters='<defs><filter id="'+esc(filterId)+'" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3.5"/></filter>'+
  '<filter id="'+esc(softId)+'" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.9"/></filter></defs>';
 const outer=shapes.map(x=>'<polygon data-art-glow="'+esc(x.id)+'" points="'+x.points+'" fill="none" stroke="#f4c875" stroke-width="5.8" opacity="0" filter="url(#'+esc(filterId)+')"/>').join("");
 const inner=shapes.map(x=>'<polygon data-art-inner-glow="'+esc(x.id)+'" points="'+x.points+'" fill="none" stroke="#ffe3ab" stroke-width="2.6" opacity="0" filter="url(#'+esc(softId)+')"/>').join("");
 const areas=shapes.map(x=>'<polygon data-art-poly="'+esc(x.id)+'" points="'+x.points+'" stroke="none" fill="none"/>').join("");
 const links=(c.required_region_ids||[]).map(k=>
  '<button type="button" data-art-scene="'+esc(c.id)+'" data-art-region="'+esc(k)+'" aria-pressed="false">'+esc(k)+'</button>').join("");
 return '<figure class="art-figure" '+attrs+' style="position:relative;margin:1rem 0;border:none;background:transparent;padding:0">'+
  '<div class="art-media" style="position:relative">'+
  '<div class="art-fallback">'+svgFallback+'</div>'+
  '<img data-art-image="'+esc(c.id)+'" src="'+esc(c.asset)+'" alt="'+esc(c.alt_la_draft)+' '+esc(c.alt_en_draft)+'" '+
  'style="display:none;max-width:100%;width:100%;height:auto;cursor:crosshair" loading="eager">'+
  '<svg aria-hidden="true" data-art-regions="'+esc(c.id)+'" viewBox="0 0 100 100" preserveAspectRatio="none" style="display:none;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible">'+filters+outer+inner+areas+'</svg>'+ 
  '</div>'+ 
  '<figcaption><span lang="la">'+esc(c.alt_la_draft)+'</span> <small>'+esc(c.alt_en_draft)+'</small>'+
  '<div class="tools">'+links+'</div></figcaption>'+

  '</figure>';
}
function renderChapter(chapterId,svgFallback){
 if(typeof chapterId!=="string")return svgFallback;
 const images=(data.scenes||[]).filter(c=>c.id.startsWith(chapterId+"-scene")&&approved(c));
 if(!images.length)return svgFallback;
 return images.map(c=>single(c,svgFallback)).join("");
}
/* The main (legacy) reader is still the original eight unsigned lessons, while
 * the nine signed picture assets belong to the separately unsigned Book I pilot.
 * Bridge their matching *subjects*, not chapter numbers, as a clearly identified
 * visual preview. No new lesson/exercise approval and no saved-state changes. */
const legacyArtTopics=Object.freeze([
 {bookId:"b01-c001",description:"Garden"},
 {bookId:"b01-c002",description:"Family"},
 {bookId:"b01-c004",description:"Gifts"},
 {bookId:"b01-c003",description:"Supper"},
 {bookId:"b01-c006",description:"Forum"},
 {bookId:"b01-c007",description:"Dog in the street"},
 {bookId:"b01-c008",description:"Storm and sunshine"},
 {bookId:"b01-c005",description:"Related evening illustration",related:true}
]);
function legacyArtTopic(index){
 return Number.isInteger(index)&&index>=0&&index<legacyArtTopics.length?legacyArtTopics[index]:null;
}
function decorateLegacyReader(doc){
 if(!doc||typeof doc.getElementById!=="function")return false;
 const main=doc.getElementById("main"),nav=doc.getElementById("chapters");
 if(!main||!nav||typeof main.querySelector!=="function"||typeof nav.querySelector!=="function"||main.querySelector("[data-art-scene]"))return false;
 const selected=nav.querySelector("button.ch.active[data-ch]");
 if(!selected||!/^\d$/.test(selected.dataset.ch||""))return false;
 const topic=legacyArtTopic(Number(selected.dataset.ch));
 const old=main.querySelector(".scene");
 if(!topic||!old||old.closest(".art-fallback"))return false;
 const original=old.outerHTML;
 const illustrated=renderChapter(topic.bookId,original);
 if(illustrated===original)return false; // keep original SVG if no reviewed image exists
 const wrapper=doc.createElement("section");
 wrapper.setAttribute("data-legacy-art-preview",topic.bookId);
 wrapper.className="legacy-art-preview";
 wrapper.innerHTML='<p class="subtle" style="margin:9px 0 0;font-size:12px">'+
  '<strong>Approved Book I artwork</strong> · '+esc(topic.description)+
  (topic.related?' · related illustration (not a literal depiction of this chapter)':' · matching subject')+
  '. This is a visual preview alongside the original legacy lesson; its Latin text and grades are unchanged. '+
  '<a href="Picture Practice.html">See all illustrations in Picture Practice</a>.</p>'+
  illustrated;
 old.replaceWith(wrapper);
 return true;
}
function installLegacyReaderArt(doc){
 if(!doc||typeof doc.getElementById!=="function")return;
 const host=doc.getElementById("main");if(!host)return;
 const refresh=()=>decorateLegacyReader(doc);
 if(typeof MutationObserver!=="undefined"){
  const observer=new MutationObserver(refresh);
  observer.observe(host,{childList:true});
 }
 refresh();
}
if(typeof document!=="undefined"){
 installLegacyReaderArt(document);
 document.addEventListener("load",event=>{
  const img=event.target;if(!img?.matches?.("img[data-art-image]"))return;
  img.style.display="block";
  const overlay=img.closest(".art-media")?.querySelector("[data-art-regions]");
  if(overlay)overlay.style.display="block";
  const fallback=img.closest(".art-figure")?.querySelector(".art-fallback");
  if(fallback)fallback.hidden=true;
 },true);
 document.addEventListener("error",event=>{
  const img=event.target;if(!img?.matches?.("img[data-art-image]"))return;
  img.style.display="none";
  const overlay=img.closest(".art-media")?.querySelector("[data-art-regions]");
  if(overlay)overlay.style.display="none";
  const fallback=img.closest(".art-figure")?.querySelector(".art-fallback");
  if(fallback)fallback.hidden=false;
 },true);
 document.addEventListener("click",event=>{
  const btn=event.target.closest?.("[data-art-region]");
  if(btn){select(btn.dataset.artScene,btn.dataset.artRegion);return}
  const img=event.target.closest?.("img[data-art-image]");
  if(!img||img.style.display==="none")return;
  const point=imagePoint(img,event.clientX,event.clientY);
  const region=point?regionAt(img.dataset.artImage,point.x,point.y):null;
  if(region)select(img.dataset.artImage,region,point);
 });
}
const api=Object.freeze({approved,regionHit,regionAt,imageRegionAt,renderChapter,select,legacyArtTopic,decorateLegacyReader,manifest:data});
root.TablinumArtScenes=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(globalThis);
