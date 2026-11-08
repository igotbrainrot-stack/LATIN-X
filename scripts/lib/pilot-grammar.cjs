"use strict";
const {loadGrammarFeatures,validateGrammarToken}=require("./grammar.cjs");
const {tokenize}=require("./tokens.cjs");
const known={
 bibunt:"v.ind.pres.act.3pl",audiunt:"v.ind.pres.act.3pl",
 laetī:"adj.nom.pl",magnī:"adj.nom.pl",parvī:"adj.nom.pl",bonī:"adj.nom.pl"
};
const earlyCase=new Set(["rosam","hortum","pānem","canem","librum","cibum","pōculum"]);
// Third-declension genitive singular has no signed introduction in the
// current Book I pilot outline; fail closed until an editor assigns it.
const thirdGen=new Set(["patris","mātris","frātris","sorōris","arboris","mercātōris","tempestātis"]);
const genitive=new Set(["līviae","tītī","mārcī","flāviae","gāī","gāiī","puerī","vīllae","familiae"]);
const dative=new Set(["mātrī","patrī","mārcō","tītō","gāiō","puerō","mercātōrī","canī","fīliae"]);
const banned=new Set(["sub","ex","per","ego","tū","nōs","vōs"]);
function checkSurface(text,chapter,grammar=loadGrammarFeatures()){
 const byId=new Map(grammar.features.map(f=>[f.id,f]));
 const errors=[];
 for(const word of tokenize(text)){
  const w=word.t.toLowerCase();
  if(banned.has(w)&&chapter<=8)errors.push(w+": prohibited in pilot 1–8");
  if(thirdGen.has(w)&&chapter<=8)errors.push(w+": third-declension genitive is not introduced in the pilot");
  if(genitive.has(w)&&chapter<2)errors.push(w+": genitive singular not taught before Chapter 2");
  if(dative.has(w)&&chapter<4&&!(w==="fīliae"&&chapter>=2))
   errors.push(w+": dative singular not taught before Chapter 4");
  if(earlyCase.has(w)&&chapter<3)errors.push(w+": accusative before chapter 3");
  const feature=known[w]||((w!=="sunt"&&/nt(?:ne)?$/.test(w))?"v.ind.pres.act.3pl":null);
  if(feature){
   const f=byId.get(feature);
   if(!f||f.first_chapter===null||chapter<f.first_chapter)errors.push(w+": "+feature+" first_chapter "+f?.first_chapter);
  }
 }
 return errors;
}
function checkPilot(chapter,grammar=loadGrammarFeatures()){
 const errors=[];
 for(const segment of chapter.segments||[])for(const sentence of segment.sentences||[]){
  errors.push(...checkSurface(sentence.text_la,chapter.chapter,grammar).map(s=>sentence.id+": "+s));
  for(const token of sentence.tokens||[]){
   if(!token.morph)continue;
   try{validateGrammarToken({...token,lx:"draft-test-tag",surface:token.t,pos:token.pos||null,token_id:sentence.id},chapter.chapter,grammar,[],null)}
   catch(e){errors.push(sentence.id+"/"+token.t+": "+e.message)}
  }
 }
 return errors;
}
module.exports={checkSurface,checkPilot};
