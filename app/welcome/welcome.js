/* LATIN X self-contained course introduction. No networking. */
(function(){
"use strict";
const modal=document.getElementById("lx-welcome"),enter=document.getElementById("lx-welcome-enter");
if(!modal||!enter)return;
const key="latin-x-welcome-skip-v1";let oldFocus=null;
function readSkip(){try{return localStorage.getItem(key)==="yes"}catch(e){return false}}
function saveSkip(){try{localStorage.setItem(key,document.getElementById("lx-welcome-skip")?.checked?"yes":"no")}catch(e){}}
function show(){oldFocus=document.activeElement;modal.hidden=false;document.body.classList.add("lx-welcome-open");enter.focus({preventScroll:true})}
function close(){saveSkip();modal.hidden=true;document.body.classList.remove("lx-welcome-open");const target=oldFocus?.isConnected?oldFocus:document.querySelector("#tabs button");target?.focus?.({preventScroll:true})}
enter.addEventListener("click",close);
modal.addEventListener("keydown",e=>{
 if(e.key==="Escape"){e.preventDefault();close();return}
 if(e.key!=="Tab")return;
 const items=Array.from(modal.querySelectorAll("button:not([disabled]),input:not([disabled]),[tabindex='0']")).filter(x=>!x.hidden);
 if(!items.length)return;
 if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items[items.length-1].focus()}
 else if(!e.shiftKey&&document.activeElement===items[items.length-1]){e.preventDefault();items[0].focus()}
});
const header=document.querySelector("header");
if(header){const btn=document.createElement("button");btn.id="lx-guide-button";btn.type="button";btn.textContent="? Course guide";btn.setAttribute("aria-label","Open course introduction");btn.addEventListener("click",show);header.appendChild(btn)}
const skip=document.getElementById("lx-welcome-skip");if(skip)skip.checked=readSkip();
if(readSkip())modal.hidden=true;else show();
})();
