"use strict";
/* Conversion is deliberately non-approving: a legacy candidate match is NOT an lx ID. */
const fs=require('node:fs'),path=require('node:path');
const {extractArray,extractLessons,readLegacySource}=require('./lib/extract-legacy.cjs');
const {tokenize,checkTokens}=require('./lib/tokens.cjs');
const {fnv32}=require('./lib/ids.cjs');
const root=path.resolve(__dirname,'..');
const audit=require('../curriculum/lexicon/legacy-token-audit.json');
const idmap=require('../curriculum/lexicon/legacy-id-map.json');
const html=readLegacySource(root);
const lessons=extractLessons(html),clozes=extractArray(html,'const guidedCloze=','\n];\n// Contextual hints');
function make(index){
 const ch=lessons[index],lid=`legacy-ch${String(index+1).padStart(2,'0')}`;
 const sourceAudit=audit.chapters[index];
 if(sourceAudit.legacy_chapter_id!==lid||idmap.legacy_chapters[index].legacy_id!==lid)throw Error('legacy mapping drift '+lid);
 const sentences=ch.sent.map(([text_la,en],j)=>{
  const id=`${lid}-s${String(j+1).padStart(3,'0')}`,aud=sourceAudit.sentences[j];
  if(aud.sentence_id!==id||aud.latin_text!==text_la)throw Error('legacy audit drift '+id);
  const tokens=tokenize(text_la).map((w,k)=>{
   const old=aud.tokens[k];if(!old||old.surface!==w.t)throw Error('legacy token drift '+id);
   return {t:w.t,start:w.start,end:w.end,lx:null,morph:null,legacy_candidate_ids:old.source_candidate_ids,review_status:'unreviewed'};
  });
  const s={id,text_la,en,tokens};checkTokens(s,id,{legacy:true});return s;
 });
 if(fnv32(ch.sent.map(s=>s[0]).join('\n'))!==idmap.legacy_chapters[index].latin_sentence_fingerprint_fnv32)throw Error('legacy fingerprint drift '+lid);
 return {schema:'tablinum-lesson-v1',id:lid,legacy:true,status:'legacy_unreviewed',
  original_zero_based_index:index,legacy_source_fingerprint_fnv32:fnv32(JSON.stringify(ch)),
  title:ch.name,legacy_source:ch,cloze_source:clozes[index],sentences,
  questions:ch.q.map((source,j)=>({id:`${lid}-q${String(j+1).padStart(3,'0')}`,legacy_source:source}))};
}
function generate(){return lessons.map((_,i)=>make(i))}
function main(){const check=process.argv.includes('--check');const dir=path.join(root,'lessons/legacy');if(!check)fs.mkdirSync(dir,{recursive:true});for(const [i,l] of generate().entries()){
 const file=path.join(dir,`ch${String(i+1).padStart(2,'0')}.json`),serialized=JSON.stringify(l,null,2)+'\n';
 if(check){if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==serialized)throw Error('Legacy lesson snapshot mismatch: '+file)}else fs.writeFileSync(file,serialized);
 }console.log(`PASS ${check?'verified':'exported'} ${lessons.length} unchanged legacy chapters; no lexical approvals.`)}
if(require.main===module)main();module.exports={generate};
