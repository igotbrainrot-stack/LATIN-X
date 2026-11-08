/* Author-time only. Deterministic, fail-closed Latin distractor proposals.
 * Generated candidates never imply exercise, lemma or form approval. */
"use strict";
function hash(s){let h=2166136261;for(const char of String(s)){h^=char.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0}
function signature(m){return String(m||"").split("|").sort().join("|")}
function synonyms(a,b){return (a?.near_synonyms||[]).includes(b?.id)||(b?.near_synonyms||[]).includes(a?.id)}
function options({exerciseId,answerLexemeId,answerMorph,chapter,lexemes,evidenceSentence,limit=3}){
 if(!/^b0[1-3]-c\d{3}-q\d{3}$/.test(exerciseId||""))throw Error("Stable exercise ID required");
 if(!Number.isInteger(chapter)||chapter<1||chapter>130)throw Error("Invalid course chapter");
 if(!Array.isArray(lexemes))throw Error("Reviewed lexeme registry needed");
 const target=lexemes.find(l=>l.id===answerLexemeId&&l.status==="approved");
 if(!target)throw Error("Answer lexeme must be approved before suggesting distractors");
 const sameForm=Array.isArray(target.forms)?target.forms.filter(f=>f.reviewed===true&&signature(f.morph)===signature(answerMorph)):[];
 if(!sameForm.length)throw Error("No reviewed matching answer morphology");
 const blocked=new Set((evidenceSentence?.tokens||[]).flatMap(t=>[t.lx,t.t?.toLocaleLowerCase("und")]).filter(Boolean));
 const unique=new Set(sameForm.map(f=>f.surface?.toLocaleLowerCase("und")));
 const candidates=[];
 for(const lex of lexemes){
  if(!lex||lex.id===target.id||lex.status!=="approved"||lex.pos!==target.pos)continue;
  if(lex.first_chapter===null||!Number.isInteger(lex.first_chapter)||lex.first_chapter>chapter)continue;
  if(synonyms(target,lex)||blocked.has(lex.id))continue;
  for(const form of lex.forms||[]){
   if(form.reviewed!==true||signature(form.morph)!==signature(answerMorph))continue;
   const surface=form.surface;
   if(typeof surface!=="string"||!surface||unique.has(surface.toLocaleLowerCase("und"))||blocked.has(surface.toLocaleLowerCase("und")))continue;
   unique.add(surface.toLocaleLowerCase("und"));
   candidates.push({lexeme_id:lex.id,surface,source_chapter:lex.first_chapter,morph:form.morph,reviewed:true});
   break;
  }
 }
 const id=String(exerciseId);
 candidates.sort((a,b)=>{
  const recentA=chapter-a.source_chapter<=10?0:1,recentB=chapter-b.source_chapter<=10?0:1;
  if(recentA!==recentB)return recentA-recentB;
  return hash(id+"|"+a.lexeme_id)-hash(id+"|"+b.lexeme_id)||a.lexeme_id.localeCompare(b.lexeme_id);
 });
 return candidates.slice(0,Math.min(Math.max(0,limit),6));
}
module.exports={options,hash,signature};
