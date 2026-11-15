/* Phase 5 — original Latin exercise registry. Offline classic script and Node CommonJS.
 * NEVER turn proposed/ungraded material into scored questions by default. */
(function(root){
"use strict";
const TYPES=Object.freeze(["mc","short","tf","wh","order","pic","retell","ending","cloze","define","table","listen-pic","listen-mc","dictate","shadow"]);
const TYPE_SET=new Set(TYPES),LISTENING=new Set(["listen-pic","listen-mc","dictate","shadow"]);
function norm(value,{macronsOptional=true}={}){
 let s=String(value??"").normalize("NFC").toLocaleLowerCase("und").trim();
 if(macronsOptional)s=s.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 return s.replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();
}
function escapeHTML(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function approved(ex){return !!ex&&ex.status==="approved"&&ex.scoring_enabled!==false&&
 !!ex.review&&typeof ex.review.by==="string"&&ex.review.by.trim().length>0&&
 /^\d{4}-\d\d-\d\d$/.test(ex.review.at||"");}
function visible(ex,chapter){return !!chapter&&chapter.status==="approved"&&
 ex&&TYPE_SET.has(ex.type)&&(!LISTENING.has(ex.type)||
 (chapter.audio_verified===true&&ex.audio?.verified===true&&typeof ex.audio?.src==="string"))}
function gradable(ex,chapter){
 return visible(ex,chapter)&&approved(ex)&&!["retell","shadow"].includes(ex.type);
}
function registry(){return TYPES.map(type=>({type,requiresHumanReview:true,
 listening:LISTENING.has(type),gradable:!["retell","shadow"].includes(type)}))}
function stringOptions(ex){return Array.isArray(ex.options)?ex.options.map(o=>typeof o==="string"?o:o?.value).filter(x=>typeof x==="string"):[]}
function valid(ex){
 const errors=[];
 if(!ex||typeof ex!=="object"||!TYPE_SET.has(ex.type))return ["unknown exercise type"];
 if(!/^b0[1-3]-c\d{3}-q\d{3}$/.test(ex.id||""))errors.push("invalid stable exercise ID");
 if(typeof ex.prompt_la!=="string"||!ex.prompt_la.trim())errors.push("missing Latin prompt");
 if(ex.status!=="approved")errors.push("exercise is not approved");
 if(!approved(ex))errors.push("missing genuine exercise reviewer signature");
 if(["mc","cloze","define","listen-mc"].includes(ex.type)&&stringOptions(ex).length<2)errors.push("at least two choices required");
 if(["mc","cloze","define","listen-mc","short","wh","ending","table","dictate"].includes(ex.type)&&
  (!Array.isArray(ex.accept)||!ex.accept.length||ex.accept.some(v=>typeof v!=="string")))errors.push("reviewed accepted answers required");
 if(["tf","order","pic","listen-pic"].includes(ex.type)&&ex.answer===undefined)errors.push("reviewed correct answer required");
 if(ex.evidence!==undefined&&!/^b0[1-3]-c\d{3}-s\d{3}$/.test(ex.evidence))errors.push("evidence needs a stable sentence ID");
 return errors;
}
function normalChoicesMatch(ex,response){
 const accepts=Array.isArray(ex.accept)?ex.accept:[];
 return accepts.some(a=>norm(a)===norm(response));
}
function grade(ex,response,chapter){
 if(!visible(ex,chapter))return {status:"unavailable",correct:null,reason:"Chapter unpublished or recorded audio missing"};
 if(!gradable(ex,chapter))return {status:"ungraded",correct:null,reason:"Human-approved answer key required"};
 const errs=valid(ex);if(errs.length)return {status:"ungraded",correct:null,reason:errs.join("; ")};
 let correct=false,partial=0;
 switch(ex.type){
  case"mc":case"short":case"wh":case"ending":case"cloze":case"define":case"listen-mc":
  case"table":case"dictate": correct=normalChoicesMatch(ex,response);break;
  case"tf":correct=typeof response==="boolean"&&response===ex.answer;break;
  case"pic":case"listen-pic":correct=typeof response==="string"&&response===ex.answer;break;
  case"order":{
   const expected=Array.isArray(ex.answer)?ex.answer:[];
   const got=Array.isArray(response)?response:typeof response==="string"?response.split(",").map(x=>x.trim()):[];
   partial=expected.length?expected.filter((v,i)=>got[i]===v).length/expected.length:0;
   correct=expected.length>=3&&expected.length<=6&&expected.length===got.length&&partial===1;
   break;
  }
 }
 return {status:"graded",correct,evidence:correct?ex.evidence||null:null,
  ...(ex.type==="order"?{partial}:{}),reviewed:true};
}
function legacyNorm(x){
 return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g," ");
}
function legacyAdapter(chapterIndex,questionIndex,q){
 if(!Number.isInteger(chapterIndex)||chapterIndex<0||chapterIndex>7||
    !Number.isInteger(questionIndex)||questionIndex<0||!Array.isArray(q))throw Error("Invalid legacy question");
 return Object.freeze({id:"legacy-ch"+String(chapterIndex+1).padStart(2,"0")+"-q"+String(questionIndex+1).padStart(3,"0"),
  source:"unchanged-legacy-unreviewed",type:q[1]?"mc":"short",prompt_la:q[0],
  options:q[1]||null,accept:Array.isArray(q[2])?q[2]:[q[2]],
  model:q[3],status:"legacy_unreviewed",legacyTuple:q});
}
function gradeLegacy(q,value){
 if(!Array.isArray(q))return false;
 const accepted=[...(Array.isArray(q[2])?q[2]:[q[2]]),q[3]].filter(x=>typeof x==="string");
 const given=legacyNorm(value);
 if(accepted.some(a=>legacyNorm(a)===given))return true;
 /* Latin word order is free in these short clauses, so the same words of an accepted
  * answer in another order are also accepted (Magna est arbor = Arbor magna est).
  * Every word must still match an accepted answer; macrons stay optional, as before. */
 const bag=x=>legacyNorm(x).split(" ").sort().join(" ");
 return given.includes(" ")&&accepted.some(a=>bag(a)===bag(given));
}
root.TablinumExercises=Object.freeze({TYPES,registry,norm,escapeHTML,approved,visible,gradable,valid,grade,gradeLegacy,legacyAdapter});
if(typeof module!=="undefined"&&module.exports)module.exports=root.TablinumExercises;
})(globalThis);
