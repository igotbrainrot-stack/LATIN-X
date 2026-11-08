"use strict";
/* Phase 1 read-only derivations. They NEVER turn a proposal into an approval. */
const assert=require("node:assert/strict");
const {normalizeLegacyKey}=require("./schema.cjs");
const tokenise=s=>String(s).match(/[\p{L}\p{M}]+/gu)||[];
const serialise=o=>JSON.stringify(o,null,2)+"\n";
function initialCandidateMap(audit){
 return {
  schema:"tablinum-legacy-candidate-map-v1",
  status:"pending_human_lexical_review",
  notes:"An app glossary entry is NOT a reviewed dictionary lemma. Approval requires an explicit signed CSV decision.",
  candidates:audit.glossary_candidates.map(c=>({
   candidate_id:c.candidate_id,
   head_as_in_app:c.headword_as_in_app,
   original_gloss:c.original_gloss,
   is_proper_name:c.is_proper_name,
   proposed_lemma:c.headword_as_in_app,
   proposed_id:null,
   review_state:"pending",
   approved_lexeme_id:null,
   reviewed_by:null,
   reviewed_at:null,
   notes:""
  }))
 };
}
function emptyRegistry(){
 return {
  schema:"tablinum-lexemes-v1",
  status:"human_review_required",
  conventions:{
   verb_head:"first-person present indicative active (deponent: passive form)",
   id_policy:"immutable, stable, sense-disambiguated lx-<lemma>-<meaning> identifier, never an inflected form",
   macrons:"reviewed Latin quantity, not automatic accent normalisation"
  },
  lexemes:[],
  note:"Do not move any unreviewed legacy glossary entry here as approved. These 128 entries remain in the candidate review map."
 };
}
function buildVocabMap(chapters,shared,audit,candidateMap){
 const bySource=new Map();
 for(const candidate of audit.glossary_candidates){
  for(const source of candidate.source_rows){
   assert(!bySource.has(source),"Duplicate source row "+source);
   bySource.set(source,candidate.candidate_id);
  }
 }
 const map=new Map();
 function add(row,source){
  const candidate=bySource.get(source);
  assert(candidate,"Missing glossary candidate for "+source);
  for(const original of [row[0],...String(row[2]||"").split(/\s+/)]){
   const key=normalizeLegacyKey(original);
   if(!key)continue;
   if(!map.has(key))map.set(key,{key,first_match_candidate_id:candidate,candidate_ids:[],form_examples:[]});
   const entry=map.get(key);
   if(!entry.candidate_ids.includes(candidate))entry.candidate_ids.push(candidate);
   if(!entry.form_examples.includes(original))entry.form_examples.push(original);
  }
 }
 shared.forEach((entry,i)=>add(entry,"shared-v"+String(i+1).padStart(3,"0")));
 chapters.forEach((c,ch)=>c.v.forEach((entry,i)=>add(entry,"legacy-ch"+String(ch+1).padStart(2,"0")+"-v"+String(i+1).padStart(3,"0"))));
 const decisions=new Map(candidateMap.candidates.map(x=>[x.candidate_id,x]));
 const keys=[...map.values()].sort((a,b)=>a.key.localeCompare(b.key,"en")).map(row=>{
  // A reviewed rejection is not an alternative lexeme. Keep its source
  // provenance, but do not let it block a separately approved candidate.
  const active=row.candidate_ids.filter(id=>decisions.get(id)?.review_state!=="rejected");
  const approved=active.map(id=>decisions.get(id)?.approved_lexeme_id||null);
  const unique=new Set(approved);
  const assigned=active.length>0&&unique.size===1&&!unique.has(null)?approved[0]:null;
  return {...row,status:assigned?"approved":row.candidate_ids.length>1?"ambiguous":"unresolved",approved_lexeme_id:assigned};
 });
 return{
  schema:"tablinum-legacy-vocab-map-v1",
  source:"Original v0.4.2 dict() first-wins normalised forms; collisions are not silently approved",
  total_keys:keys.length,
  approved_keys:keys.filter(x=>x.status==="approved").length,
  ambiguous_keys:keys.filter(x=>x.status==="ambiguous").length,
  keys
 };
}
function buildExtraStreams(chapters,cloze,audit){
 assert(audit?.glossary_candidates?.length===128,"Explicit audited glossary required for exercise token linking");
 const lookup=new Map();
 for(const candidate of audit.glossary_candidates){
  for(const form of candidate.documented_forms){
   const key=normalizeLegacyKey(form);
   if(!lookup.has(key))lookup.set(key,[]);
   if(!lookup.get(key).includes(candidate.candidate_id))lookup.get(key).push(candidate.candidate_id);
  }
 }
 const properIds=new Set(audit.glossary_candidates.filter(x=>x.is_proper_name).map(x=>x.candidate_id));
 assert.equal(chapters.length,8);
 assert.equal(cloze.length,8);
 const records=[];
 function add(ch,stream,part,ref,text){
  if(typeof text!=="string"||!text.trim())return;
  const tokens=tokenise(text).map((surface,index)=>({
   token_id:ref+"-t"+String(index+1).padStart(3,"0"),
   ordinal:index+1,surface,
   source_candidate_ids:(lookup.get(normalizeLegacyKey(surface))||[]).slice(),
   candidate_match_status:(lookup.get(normalizeLegacyKey(surface))||[]).length===0
     ?"unglossed_requires_review"
     :(lookup.get(normalizeLegacyKey(surface))||[]).every(id=>properIds.has(id))
       ?"proper_name_candidate"
       :(lookup.get(normalizeLegacyKey(surface))||[]).length>1
         ?"ambiguous_candidates":"single_glossary_candidate",
   lexeme_id:null,
   linguistic_status:"unreviewed",
   counted_as_new_introduction:false
  }));
  records.push({chapter_id:"legacy-ch"+String(ch+1).padStart(2,"0"),
   stream,part,ref,raw_text:text,contains_latin:"requires_review",
   counted_as_new_introduction:false,tokens});
 }
 chapters.forEach((c,i)=>{
  const ch="legacy-ch"+String(i+1).padStart(2,"0");
  add(i,"context","context",ch+"-context",c.context);
  // Grammar explanation is predominantly English; intentionally NOT treated as Latin lexical text.
  c.q.forEach((q,j)=>{
   const qid=ch+"-q"+String(j+1).padStart(3,"0");
   add(i,"exercise","prompt",qid+"-prompt",q[0]);
   if(Array.isArray(q[1]))q[1].forEach((x,k)=>add(i,"exercise","choice",qid+"-choice"+String(k+1).padStart(2,"0"),x));
   if(Array.isArray(q[2]))q[2].forEach((x,k)=>add(i,"exercise","answer",qid+"-answer"+String(k+1).padStart(2,"0"),x));
   else add(i,"exercise","answer",qid+"-answer",q[2]);
   add(i,"exercise","model",qid+"-model",q[3]);
  });
  const cl=cloze[i];
  add(i,"cloze","text",ch+"-cloze-text",cl.text);
  add(i,"cloze","clue",ch+"-cloze-clue",cl.clue);
  add(i,"cloze","proof",ch+"-cloze-proof",cl.proof);
  cl.answers.forEach((a,k)=>add(i,"cloze","answer",ch+"-cloze-answer"+String(k+1).padStart(2,"0"),a));
 });
 return{
  schema:"tablinum-legacy-extra-streams-v1",
  source:"index.html / chapter.context, chapter.q, guidedCloze; original order",
  policy:"Exercises, contexts and cloze are NEVER first-introduction evidence. Text may be mixed English/Latin; all tokens require language and morphology review.",
  verified_introductions:0,
  total_records:records.length,
  by_stream:Object.fromEntries(["context","exercise","cloze"].map(k=>[k,records.filter(r=>r.stream===k).length])),
  unglossed_tokens:[...new Map(records.flatMap(r=>r.tokens.filter(t=>t.candidate_match_status==="unglossed_requires_review")
    .map(t=>[t.token_id,{token_id:t.token_id,surface:t.surface,stream:r.stream,ref:r.ref}]))).values()],
  records
 };
}
module.exports={initialCandidateMap,emptyRegistry,buildVocabMap,buildExtraStreams,serialise};
