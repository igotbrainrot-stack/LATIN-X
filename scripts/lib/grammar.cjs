"use strict";
/**
 * Fail-closed Phase 2 grammar gate.
 *
 * Morph IDs are explicit editorial tags, never inferred from a loose regex.
 * A lexeme-linked token without a mapped feature is an error, not permission.
 * The curriculum/grammar-features.json rows are editorial planning metadata,
 * NOT owner/Linguist-approved morphology or evidence of completed teaching.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const defaultMap=path.resolve(__dirname,"../../curriculum/grammar-features.json");
function loadGrammarFeatures(filename=defaultMap){
 const doc=JSON.parse(fs.readFileSync(filename,"utf8"));
 assert.equal(doc.schema,"tablinum.strict-grammar-features.v1","Unsupported grammar feature schema");
 assert(Array.isArray(doc.features)&&doc.features.length>100,"Expected complete grammar catalogue");
 const seen=new Set();
 for(const [i,f] of doc.features.entries()){
  const location="feature "+(i+1);
  assert(typeof f.id==="string"&&/^[a-z][a-z0-9.]+$/.test(f.id),location+" invalid morph ID");
  assert(f.first_chapter===null||(Number.isInteger(f.first_chapter)&&f.first_chapter>=1&&f.first_chapter<=130),location+" invalid first_chapter");
  if(f.conjugations)assert(Array.isArray(f.conjugations)&&f.conjugations.length>0,location+" bad conjugation filter");
  const signature=f.id+"|"+JSON.stringify(f.conjugations||null);
  assert(!seen.has(signature),location+" duplicate feature "+signature);
  seen.add(signature);
 }
 return doc;
}
function normalizeMorph(token,lexeme=null){
 const raw=token.morph;
 if(typeof raw==="string"&&!raw.includes("="))return raw.trim();
 if(!raw||typeof raw!=="object"&&typeof raw!=="string")return "";
 let m;
 if(typeof raw==="string"){
  m={};for(const part of raw.split("|")){const ix=part.indexOf("=");if(ix<1)return "";m[part.slice(0,ix)]=part.slice(ix+1)}
 }else m=raw;
 const pos=String(token.pos||lexeme?.pos||m.POS||m.UPOS||"").toLowerCase();
 const ca=({nom:"nom",gen:"gen",dat:"dat",acc:"acc",abl:"abl",voc:"voc"})[String(m.Case||"").toLowerCase()];
 const nu=({sing:"sg",plur:"pl",plural:"pl"})[String(m.Number||"").toLowerCase()];
 if(["noun","propn","proper_name"].includes(pos))return ca&&nu?"n."+ca+"."+nu:"";
 if(["adj","adjective"].includes(pos))return ca&&nu?"adj."+ca+"."+nu:"";
 if(["pron","pronoun"].includes(pos)){
  const name=String(lexeme?.head||token.lemma||"").toLowerCase();
  const knownPronouns={"is":"is","ea":"is","id":"is","hic":"hic","haec":"hic","hoc":"hic","ille":"ille","illa":"ille","illud":"ille","quī":"relative","quae":"relative","quod":"relative","ego":"ego","tū":"tu","nōs":"nos","vōs":"vos"};
  const family=token.pronoun_family||(m.PronType==="Rel"?"relative":knownPronouns[name]);
  return ca&&family?"pron."+family+"."+ca:"";
 }
 if(["verb","aux"].includes(pos)){
  const tense=({pres:"pres",imp:"impf",impf:"impf",past:"impf",perf:"perf",pqp:"plup",plup:"plup",fut:"fut",futperf:"futperf"})[String(m.Tense||"").toLowerCase()];
  const voice=({act:"act",pass:"pass"})[String(m.Voice||"").toLowerCase()];
  const num=nu,person=String(m.Person||"");
  const mood=({ind:"ind",sub:"subj",imp:"imp"})[String(m.Mood||"").toLowerCase()];
  const vf=String(m.VerbForm||"").toLowerCase();
  if(vf==="inf")return tense&&voice?"v.inf."+tense+"."+voice:"";
  if(vf==="part")return tense&&voice?"v.part."+tense+"."+voice:"";
  if(vf==="ger")return "v.gerund";
  if(vf==="sup")return "v.supine";
  if(vf==="gdv")return "v.gerundive";
  if(mood==="imp")return num&&voice?"v.imp.pres."+voice+"."+num:"";
  if(mood==="subj")return tense&&voice?"v.subj."+tense+"."+voice:"";
  if(mood==="ind"&&tense&&voice&&person&&num){
   if((lexeme?.head==="sum"||token.lemma==="sum"||token.lx==="lx-sum-be")&&voice==="act"&&(tense==="pres"||tense==="impf"))
    return "v.sum."+tense+"."+person+num;
   return "v.ind."+tense+"."+voice+"."+person+num;
  }
 }
 return ""; // No guessing: caller rejects unknown UD feature bundles.
}
function grammarIssue(morph,token){
 return "unmapped morphology "+String(morph||"(missing)")+" for "+String(token.surface||token.t||token.text||token.token_id||"(unnamed token)");
}
function validateGrammarToken(token,chapter,features=loadGrammarFeatures(),previews=[],lexeme=null){
 assert(Number.isInteger(chapter)&&chapter>=1&&chapter<=130,"Invalid chapter");
 if(!token||token.lx===null||token.lx===undefined||token.lx==="")return {status:"untagged"};
 const morph=normalizeMorph(token,lexeme);
 if(!morph)throw Error(grammarIssue(morph,token));
 const candidates=features.features.filter(function(f){
  if(f.id!==morph)return false;
  if(f.conjugations&&!f.conjugations.includes(String(token.conjugation||"")))return false;
  if(f.lemma&&f.lemma!==token.lemma)return false;
  return true;
 });
 // A preview must name this exact token and morphology, explain the exception,
 // and be attached to this chapter. Blanket "allow all" is not a preview.
 const preview=previews.find(p=>p&&p.chapter===chapter&&p.morph===morph&&
  p.token_id===token.token_id&&typeof p.reason==="string"&&p.reason.trim().length>=12&&
  typeof p.reviewed_by==="string"&&p.reviewed_by.trim());
 if(!candidates.length){
  if(preview)return {status:"manual_preview",reason:preview.reason};
  throw Error(grammarIssue(morph,token));
 }
 const available=candidates.find(f=>f.first_chapter!==null&&f.first_chapter<=chapter);
 if(available)return {status:"introduced",feature:available.id,introduced_chapter:available.first_chapter};
 if(preview)return {status:"manual_preview",reason:preview.reason};
 const earliest=Math.min(...candidates.filter(f=>f.first_chapter!==null).map(f=>f.first_chapter));
 const suffix=Number.isFinite(earliest)?"not introduced until chapter "+earliest:"not introduced in planned syllabus";
 throw Error("grammar feature "+morph+" for "+String(token.surface||token.token_id)+" "+suffix+" (chapter "+chapter+")");
}
function validateLessonGrammar(lesson,features=loadGrammarFeatures()){
 assert(lesson&&Number.isInteger(lesson.chapter),"Lesson needs numeric chapter");
 const previews=lesson.manual_previews||[];
 const stats={tagged:0,introduced:0,manual_previews:0,untagged:0};
 for(const s of lesson.sentences||[]){
  for(const token of s.tokens||[]){
   try{
    const outcome=validateGrammarToken(token,lesson.chapter,features,previews);
    const key=outcome.status==="manual_preview"?"manual_previews":outcome.status;
    if(key==="untagged")stats.untagged++;
    else{stats.tagged++;stats[key]++}
   }catch(err){throw Error("chapter "+lesson.chapter+" sentence "+String(s.id||s.sentence_id||"?")+": "+err.message)}
  }
 }
 return stats;
}

/**
 * Compiler adapter: fail closed on ALL lexeme-linked reading tokens, including
 * unknown UD bundles, premature features and uncertain conjugation.
 * The grammar rule catalogue remains PROVISIONAL until human review.
 * Clauses and preview exceptions must be specific and carry Latin marginalia.
 */
function checkGrammar(lesson,features,errors,registry=new Map()){
 const catalogue={schema:"tablinum.strict-grammar-features.v1",features};
 const counters=new Map(),previews=new Set();
 for(const seg of lesson.segments||[])for(const sentence of seg.sentences||[]){
  const at=lesson.id+"/"+sentence.id;
  const preview=Array.isArray(sentence.preview)?sentence.preview:[];
  if(sentence.preview!==undefined&&!Array.isArray(sentence.preview))errors.push(at+": preview must be array");
  if(preview.length){
   previews.add(sentence.id);
   const latinNote=Array.isArray(sentence.margin)&&sentence.margin.some(m=>m.type==="grammar"&&typeof m.gloss_la==="string"&&m.gloss_la.trim());
   if(!latinNote)errors.push(at+": grammar preview needs an explicit Latin margin gloss");
  }
  const validPreviews=preview.filter(p=>{
   if(!p||typeof p!=="object"||!p.token_id||!p.morph||!p.reason||!p.reviewed_by){
    errors.push(at+": grammar preview must identify exact token/morph and human reviewer");return false;
   }
   return true;
  }).map(p=>({...p,chapter:lesson.chapter}));
  for(const id of sentence.features||[]){
   const found=features.find(f=>f.id===id&&f.manual===true);
   if(!found){errors.push(at+": unmapped manual clause feature "+id);continue}
   if(found.first_chapter===null||found.first_chapter>lesson.chapter)errors.push(at+": clause "+id+" not introduced until chapter "+found.first_chapter);
   if(lesson.grammar_new.includes(id))counters.set(id,(counters.get(id)||0)+1);
  }
  for(let i=0;i<(sentence.tokens||[]).length;i++){
   const t=sentence.tokens[i];if(!t.lx)continue;
   const lx=registry.get(t.lx)||null;
   const token={...t,surface:t.t,token_id:t.token_id||sentence.id+"-t"+String(i+1).padStart(3,"0"),
    pos:t.pos||lx?.pos||null,lemma:t.lemma||lx?.head||null,conjugation:t.conjugation||lx?.conjugation||null};
   try{
    const result=validateGrammarToken(token,lesson.chapter,catalogue,validPreviews,lx);
    if(result.feature&&lesson.grammar_new.includes(result.feature))counters.set(result.feature,(counters.get(result.feature)||0)+1);
   }catch(e){errors.push(at+": "+e.message)}
  }
 }
 if(previews.size>2)errors.push(lesson.id+": more than two grammar-preview sentences");
 for(const id of lesson.grammar_new||[]){
  const matches=features.filter(f=>f.id===id);
  if(!matches.length){errors.push(lesson.id+": unknown grammar_new "+id);continue}
  if(!matches.some(f=>f.first_chapter===lesson.chapter))errors.push(lesson.id+": grammar_new "+id+" belongs to another chapter");
  if((counters.get(id)||0)<10)errors.push(lesson.id+": grammar_new "+id+" has only "+(counters.get(id)||0)+" tagged exposures; minimum 10");
 }
 return {preview_sentences:previews.size,grammar_new_exposures:Object.fromEntries(counters)};
}

module.exports={loadGrammarFeatures,validateGrammarToken,validateLessonGrammar,checkGrammar,grammarIssue,normalizeMorph};
