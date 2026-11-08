"use strict";
/* Offline/static safety-net, not a substitute for a human screen-reader audit. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"app/legacy-runtime.js"),"utf8");
const a11y=fs.readFileSync(path.join(root,"app/80-accessibility.js"),"utf8");
const art=fs.readFileSync(path.join(root,"app/64-art-scenes.js"),"utf8");
assert(html.includes('<html lang="en">'));
assert(a11y.includes('["chapters","Chapter navigation"]'));
assert(a11y.includes('["help","Learning guidance and personal notes"]'));
assert(html.includes('<main id="main"></main>'));
assert(html.includes('<script src="app/80-accessibility.js"></script>'));
for(const [field,label] of Object.entries({notes:"Personal notes for this chapter",
 customText:"Your Latin text",customSegments:"Corrected Latin sentence boundaries"})){
 assert(a11y.includes(`["${field}","${label}"]`),field+" must have an explicit, dynamically restored label");
}
assert(app.includes('role="status"'),"answer results must be announced");
assert(app.includes('setAttribute("aria-live","polite")'),"status updates need a live region");
assert(app.includes('lang="la"'),"Latin passages require language identification");
assert(art.includes('alt="'),"published images require a text alternative");
for(const selector of ["button:focus-visible","input:focus-visible","textarea:focus-visible","a:focus-visible"])
 assert(html.includes(selector),"Visible keyboard focus: "+selector);
assert(html.includes('prefers-reduced-motion: reduce'));
// DOM stubs exercise the additive label upgrade without launching a browser.
const {enhance}=require("../app/80-accessibility.js");
const appended=[],landmarks={};
const fields={notes:{id:"notes"},customText:{id:"customText"},customSegments:{id:"customSegments"}};
for(const [id,label]of [["chapters",""],["help",""]])landmarks[id]={getAttribute:()=>null,setAttribute:(k,v)=>{landmarks[id].label=v}};
for(const [id,el]of Object.entries(fields))el.parentNode={insertBefore:(node,before)=>appended.push([node.getAttribute("for"),node.textContent,before.id])};
const fake={getElementById:id=>fields[id]||landmarks[id]||null,
 querySelector:()=>null,createElement:()=>{const props={};return {setAttribute:(k,v)=>props[k]=v,getAttribute:k=>props[k],set textContent(t){this.text=t},get textContent(){return this.text}}}};
enhance(fake);assert.equal(appended.length,3);
assert.equal(landmarks.chapters.label,"Chapter navigation");
const css=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];assert(css);
const get=name=>css.match(new RegExp("--"+name+":\\s*(#[0-9a-fA-F]{6})"))?.[1];
function lum(c){const v=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255)
 .map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
 return .2126*v[0]+.7152*v[1]+.0722*v[2]}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
for(const fg of ["ink","ink-soft","ink-muted","ochre","olive","burgundy","good-ink","bad-ink"]){
 const ground=fg==="good-ink"?"good-paper":fg==="bad-ink"?"bad-paper":"parchment";
 const ratio=contrast(get(fg),get(ground));
 assert(ratio>=4.5,`Body text ${fg} / ${ground} fails WCAG AA: ${ratio.toFixed(2)}:1`);
}
console.log("PASS Phase 12 static A11y: landmarks, input labels, Latin lang, results, focus, reduced motion and 8 manuscript palette contrasts >= 4.5:1.");