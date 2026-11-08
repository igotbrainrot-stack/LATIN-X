/* Additive accessibility support for dynamic legacy UI.
 * No changes to the byte-locked learning content or original reader runtime.
 * This is classic-script code and works entirely offline with file://. */
(function(root){
 "use strict";
 function enhance(doc){
  if(!doc||typeof doc.getElementById!=="function")return;
  const landmarks=[["chapters","Chapter navigation"],["help","Learning guidance and personal notes"]];
  for(const [id,label]of landmarks){
   const el=doc.getElementById(id);
   if(el&&!el.getAttribute("aria-label"))el.setAttribute("aria-label",label);
  }
  // The voice dock sits outside the landmarks; expose it as a named region.
  const dock=doc.querySelector&&doc.querySelector(".dock");
  if(dock&&!dock.getAttribute("role")){dock.setAttribute("role","region");dock.setAttribute("aria-label","Reading voice controls")}
  // The guidance column's h3 follows the page h1 directly; announce it as level 2
  // so the heading outline does not skip a level (visual size unchanged).
  const guide=doc.querySelector&&doc.querySelector("#help > h3:not([aria-level])");
  if(guide)guide.setAttribute("aria-level","2");
  const fields=[["notes","Personal notes for this chapter"],
   ["customText","Your Latin text"],["customSegments","Corrected Latin sentence boundaries"]];
  for(const [id,label]of fields){
   const el=doc.getElementById(id);
   if(!el||doc.querySelector('label[for="'+id+'"]'))continue;
   const node=doc.createElement("label");node.setAttribute("for",id);
   node.textContent=label;
   // Existing HTML is byte-locked; use a per-label visually hidden pattern.
   // Keep a real <label> in the accessibility tree, without shifting the UI.
   node.setAttribute("style","position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap;border:0");
   el.parentNode.insertBefore(node,el);
  }
 }
 if(typeof document!=="undefined"){
  const run=()=>enhance(document);
  run();
  if(typeof MutationObserver!=="undefined"){
   const observer=new MutationObserver(run);
   for(const id of ["main","help"]){
    const host=document.getElementById(id);
    if(host)observer.observe(host,{childList:true,subtree:true});
   }
  }
 }
 if(typeof module!=="undefined"&&module.exports)module.exports={enhance};
})(globalThis);