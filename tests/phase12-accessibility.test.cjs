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
// Premium redesign (Nov 2026): CSS lives in bundled stylesheets; one global :focus-visible
// rule covers every control, with a field-specific ring for inputs.
const css=["app/styles/lx-tokens.css","app/styles/lx-app.css"].map(f=>fs.readFileSync(path.join(root,f),"utf8")).join("\n");
assert(/(^|\n):focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus\)/.test(css),"Visible keyboard focus on every control");
for(const selector of ["textarea:focus-visible","select:focus-visible",".word:focus-visible"])
 assert(css.includes(selector),"Visible keyboard focus: "+selector);
for(const rule of css.match(/[^{}]+\{[^{}]*outline:\s*(?:none|0)\b[^{}]*\}/g)||[])
 assert(/:focus:not\(:focus-visible\)/.test(rule)||/box-shadow:/.test(rule),"A rule drops the focus outline without a replacement ring: "+rule.trim().slice(0,80));
assert(css.includes('prefers-reduced-motion: reduce'));
assert(html.includes('class="skip-link" href="#main"'),"Skip link to the main content");
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
const tokens=fs.readFileSync(path.join(root,"app/styles/lx-tokens.css"),"utf8");
const light=tokens.match(/:root\s*\{([\s\S]*?)\n\}/)[1];
const dark=tokens.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)[1];
function lum(c){const v=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255)
 .map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
 return .2126*v[0]+.7152*v[1]+.0722*v[2]}
function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
let pairs=0;
for(const [theme,block] of [["light",light],["dark",dark]]){
 const get=name=>{const m=block.match(new RegExp("--"+name+":\\s*(#[0-9a-fA-F]{6})"));assert(m,theme+" theme lacks --"+name);return m[1]};
 const check=(fg,bg,min)=>{const ratio=contrast(get(fg),get(bg));pairs++;
  assert(ratio>=min,`${theme}: ${fg} on ${bg} fails WCAG AA (${ratio.toFixed(2)}:1, needs ${min}:1)`)};
 for(const bg of ["bg","surface","surface-2"])for(const fg of ["ink","ink-2","ink-3","accent","good","bad"])check(fg,bg,4.5);
 check("ink","surface-3",4.5);check("ink-2","surface-3",4.5);
 check("on-primary","primary",4.5);check("ink","accent-soft",4.5);check("good","good-soft",4.5);check("bad","bad-soft",4.5);
 // Non-text: focus ring and control borders against the page (WCAG 1.4.11)
 check("focus","bg",3);check("focus","surface",3);
}
console.log("PASS Phase 12 static A11y: landmarks, skip link, input labels, Latin lang, results, focus, reduced motion and "+pairs+" light/dark palette contrasts at WCAG AA.");
