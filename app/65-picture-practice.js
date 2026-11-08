/* Additive Book I picture practice. The pilot chapter and every new prompt remain
 * UNSIGNED. This page never turns a draft into an approved lesson or grade.
 * Scripts, images and data use local file:// paths only. */
(function(root){
"use strict";
const source=root.TablinumPicturePracticeData||{chapters:[]};
const art=root.TablinumArtScenes,engine=root.TablinumExercises,stateApi=root.TablinumStateV5;
function esc(x){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
const chapters=source.chapters||[];
const byId=id=>chapters.find(c=>c.id===id);
// A signed item can be graded; a draft chapter/key may be *selected*, never scored.
function evaluate(ex,region,chapter,storage,point=null){
 if(!engine||!ex||typeof region!=="string"||!chapter||!art?.approved)return {status:"ungraded",correct:null};
 const scene=art.manifest.scenes.find(s=>s.id===ex.scene_id);
 if(!scene||!art.approved(scene)||!scene.required_region_ids.includes(region))return {status:"ungraded",correct:null};
 // A pointer click can fall inside several approved polygons. Highlight the
 // smallest one, but grade against the ANSWER polygon rather than that highlight.
 // Keyboard region buttons have no point and retain exact region-key grading.
 const validPoint=point&&Number.isFinite(point.x)&&Number.isFinite(point.y)&&
  point.x>=0&&point.x<=100&&point.y>=0&&point.y<=100;
 const answeredByClick=validPoint&&art.regionAt(scene.id,point.x,point.y)===region&&
  art.regionHit(scene.polygons?.[ex.answer],point.x,point.y);
 const gradedRegion=answeredByClick?ex.answer:region;
 const result=engine.grade(ex,gradedRegion,chapter);
 if(result.status!=="graded")return {status:"ungraded",correct:null};
 // Never bootstrap or write to the historical v4 key, even when v5 is absent.
 if(!stateApi||!storage)return {...result,saved:false};
 try{
  const raw=storage.getItem(stateApi.V5);
  if(raw===null)return {...result,saved:false};
  const state=JSON.parse(raw);
  if(state.schema!=="tablinum-state-v5"||state.version!==5||!state.questions||typeof state.questions!=="object")return {...result,saved:false};
  const previous=state.questions[ex.id]||{};
  state.questions[ex.id]={...previous,answer:gradedRegion,
   correct:previous.correct===true||result.correct===true,
   attempts:(Number(previous.attempts)||0)+1,graded_by:"picture-reviewed-exercise",evidence:ex.evidence||null};
  const saved=stateApi.persist(storage,state);
  return {...result,saved:!!saved.ok};
 }catch(error){return {...result,saved:false}}
}
function mount(){
 if(typeof document==="undefined"||!document.getElementById("picture-root"))return;
 if(!art||!engine||!chapters.length){document.getElementById("picture-root").textContent="Picture practice source is unavailable; re-extract the complete ZIP.";return}
 let chapter=chapters[0],activeId=chapter.exercises[0].id;
 const chapterHost=document.getElementById("picture-chapters"),main=document.getElementById("picture-root"),feedback=document.getElementById("picture-feedback");
 const any=()=>chapter.exercises.find(e=>e.id===activeId)||chapter.exercises[0];
 function render(){
  chapterHost.innerHTML=chapters.map(c=>'<button type="button" data-picture-chapter="'+esc(c.id)+'" aria-current="'+(c.id===chapter.id?'page':'false')+'">'+esc(c.chapter)+'. '+esc(c.title)+'</button>').join("");
  const intro='<h2>Caput '+chapter.chapter+' — '+esc(chapter.title)+'</h2><p class="notice">Original Latin picture prompts are awaiting Claude’s review and the owner’s sign-off. Choosing a region is practice only; <strong>no grades or saved answers</strong> are created.</p>';
  const figures=art.renderChapter(chapter.id,'<div class="notice">Approved image unavailable. Restore the full ZIP.</div>');
  const questions=chapter.exercises.map((ex,i)=>'<button type="button" class="question-link" data-picture-ex="'+esc(ex.id)+'" aria-pressed="'+(ex.id===activeId)+'"><span>'+(i+1)+'.</span> <span lang="la">'+esc(ex.prompt_la)+'</span></button>').join("");
  main.innerHTML=intro+'<div class="practice-grid"><section aria-label="Chapter illustration"><p class="intro">Click an object in the illustration, or choose its named region button underneath. Selection is not grading.</p>'+figures+'</section><section class="question-panel" aria-label="Original Latin picture questions"><h3>Quaestiōnēs pictae</h3><div class="question-list">'+questions+'</div><div class="selected-prompt" id="current-picture-question" lang="la">'+esc(any().prompt_la)+'</div><p class="mini">The currently selected question applies to '+esc(any().scene_id)+'.</p></section></div>';
  feedback.textContent="Select a region to practise. Every answer key is unsigned; no score will be saved.";
 }
 document.addEventListener("click",e=>{
  const ch=e.target.closest?.("[data-picture-chapter]");
  if(ch){const target=byId(ch.dataset.pictureChapter);if(target){chapter=target;activeId=chapter.exercises[0].id;render();}return}
  const item=e.target.closest?.("[data-picture-ex]");
  if(item&&chapter.exercises.some(ex=>ex.id===item.dataset.pictureEx)){
   activeId=item.dataset.pictureEx;
   main.querySelectorAll("[data-picture-ex]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.pictureEx===activeId)));
   main.querySelector("#current-picture-question").textContent=any().prompt_la;
   feedback.textContent="Choose the region for this prompt. Review and grading remain disabled.";
  }
 });
 document.addEventListener("tablinum:picture-region",e=>{
  const ex=any(),selected=e.detail;
  if(!main.contains(document.querySelector('[data-art-scene="'+selected.sceneId+'"]')))return;
  if(selected.sceneId!==ex.scene_id){feedback.textContent="Choose a region in the scene named by the selected question.";return}
  // This production course has *draft* status; evaluate() intentionally fails closed.
  let storage=null;try{storage=root.localStorage}catch(error){}
  const result=evaluate(ex,selected.regionId,chapter,storage,selected.point);
  feedback.textContent=result.status==="graded"?
   (result.correct?"Rectē! Reviewed answer.":"Nōndum. Try again.")+(result.saved?" Saved in v5.":" Could not save progress."):
   "Region selected: "+selected.regionId+". This answer key is unsigned; no score or saved answer was created.";
 });
 render();
}
const api=Object.freeze({evaluate,byId,chapters,mount});
root.TablinumPicturePractice=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
}
})(globalThis);
