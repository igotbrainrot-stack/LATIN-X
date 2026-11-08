"use strict";
const assert=require("node:assert/strict");
const {validDate,validHead,LEXEME_ID,validateRegistry,validateCandidateMap,validateVocabMap}=require("./schema.cjs");
const {buildVocabMap}=require("./phase1-legacy.cjs");
const HEADERS=[
 "priority","candidate_id","legacy_head","legacy_gloss","legacy_forms","source_rows",
 "ambiguous_sentence_tokens","dcc_headword_hint","dcc_rank_hint",
 "proposed_lemma","proposed_id","pos","principal_parts","conjugation","declension","gender",
 "sense_id","gloss_en","gloss_la","source_id","source_locator","license_id",
 "macron_authority","macron_reviewed","homograph_of","review_tier","drafted_by","decision","reviewer","reviewed_at",
 "second_reviewer","notes"
];
const clean=s=>String(s||"").normalize("NFC").trim();
function parseRank(v){
 if(!v)return null;
 const n=Number(v);
 return Number.isInteger(n)&&n>0?n:null;
}
function dccHints(csvDoc){
 const index=new Map();
 if(!csvDoc)return index;
 assert(csvDoc.headers.includes("Headword")&&csvDoc.headers.includes("Frequency Rank"),
  "DCC CSV must include Headword and Frequency Rank");
 for(const r of csvDoc.records){
  const full=clean(r.Headword);
  // DCC sometimes groups distinct lemmas in one semicolon-separated row.
  for(const part of full.split(";")){
   const head=part.trim().split(/\s+/)[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
   if(!head)continue;
   if(!index.has(head))index.set(head,[]);
   index.get(head).push({headword:full,rank:parseRank(r["Frequency Rank"])});
  }
 }
 return index;
}
function reviewRows(audit,candidateMap,coreCsv=null,registryDoc=null){
 const known=new Map((registryDoc?.lexemes||[]).map(x=>[x.id,x]));
 const mapped=new Map(candidateMap.candidates.map(x=>[x.candidate_id,x]));
 const ambiguous=new Map();
 for(const c of audit.chapters){
  for(const s of c.sentences){
   for(const token of s.tokens){
    if(token.status==="ambiguous_glossary_candidates"){
     for(const id of token.source_candidate_ids){
      if(!ambiguous.has(id))ambiguous.set(id,[]);
      ambiguous.get(id).push(token.token_id+" ("+token.surface+")");
     }
    }
   }
 }
 }
 const hints=dccHints(coreCsv);
 const rows=audit.glossary_candidates.map(c=>{
  const m=mapped.get(c.candidate_id);assert(m);
  const approved=m.approved_lexeme_id?known.get(m.approved_lexeme_id):null;
  const folded=w=>String(w||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const byProposal=hints.get(folded(m.proposed_lemma));
  const choices=byProposal?.length?byProposal:(hints.get(folded(c.headword_as_in_app))||[]);
  const unique=choices.length===1?choices[0]:null;
  const flagged=ambiguous.get(c.candidate_id)||[];
  return {
   priority:flagged.length?"P0 ambiguous token":"P1 candidate",
   candidate_id:c.candidate_id,
   legacy_head:c.headword_as_in_app,legacy_gloss:c.original_gloss,
   legacy_forms:c.documented_forms.join(" "),source_rows:c.source_rows.join(";"),
   ambiguous_sentence_tokens:flagged.join(";"),
   dcc_headword_hint:unique?.headword||"",dcc_rank_hint:unique?.rank||"",
   proposed_lemma:approved?.head||m.proposed_lemma||unique?.headword?.split(" ")[0]||"",
   proposed_id:approved?.id||m.proposed_id||"",
   pos:approved?.pos||"",principal_parts:approved?.principal_parts||"",conjugation:approved?.conjugation||"",
   declension:approved?.declension||"",gender:approved?.gender||"",
   sense_id:m.sense_id||approved?.senses?.[0]?.sense_id||"",
   gloss_en:approved?.senses?.find(x=>x.sense_id===(m.sense_id||approved?.senses?.[0]?.sense_id))?.gloss_en||c.original_gloss,
   gloss_la:approved?.senses?.find(x=>x.sense_id===(m.sense_id||approved?.senses?.[0]?.sense_id))?.gloss_la||"",
   source_id:approved?.sources?.[0]?.source_id||"",source_locator:approved?.sources?.[0]?.locator||"",
   license_id:approved?.sources?.[0]?.license_id||"",
   macron_authority:approved?.macron_authority||"",macron_reviewed:approved?.macron_reviewed?"yes":"",
   homograph_of:approved?.homograph_of?.join(";")||"",
   review_tier:m.review_tier||approved?.review_tier||"",
   drafted_by:m.drafted_by||approved?.drafted_by||"",
   decision:m.review_state==="approved"?"approve":m.review_state==="rejected"?"reject":"",
   reviewer:m.reviewed_by||"",reviewed_at:m.reviewed_at||"",
   second_reviewer:approved?.second_reviewed_by||"",notes:m.notes||""
  };
 });
 rows.sort((a,b)=>a.priority.localeCompare(b.priority)||a.legacy_head.localeCompare(b.legacy_head,"la")||a.candidate_id.localeCompare(b.candidate_id));
 return rows;
}
function requireField(row,key,at){
 const s=clean(row[key]);assert(s,at+" missing "+key);return s;
}
function readLexeme(row,at,candidate){
 const id=requireField(row,"proposed_id",at);
 assert(LEXEME_ID.test(id)&&!id.startsWith("lx-cand-"),at+" needs stable sense-aware ID, not provisional placeholder");
 const head=requireField(row,"proposed_lemma",at);validHead(head,at+".lemma");
 const pos=requireField(row,"pos",at);
 const sourceId=requireField(row,"source_id",at);
 const locator=requireField(row,"source_locator",at);
 const license=requireField(row,"license_id",at);
 const reviewer=requireField(row,"reviewer",at);
 const reviewTier=requireField(row,"review_tier",at);
 assert(["owner","latinist"].includes(reviewTier),at+" review_tier must be owner or latinist");
 const draftedBy=clean(row.drafted_by)||null;
 if(reviewTier==="owner"){
  assert(draftedBy&&draftedBy!==reviewer,at+" owner-tier approval requires drafted_by different from reviewer");
 }
 const atDate=requireField(row,"reviewed_at",at);
 assert(validDate(atDate),at+" reviewer date must be a valid YYYY-MM-DD date");
 const macronAuthority=requireField(row,"macron_authority",at);
 assert(clean(row.macron_reviewed).toLowerCase()==="yes",at+" needs explicit macron_reviewed=yes");
 const senseId=requireField(row,"sense_id",at);
 const gloss=requireField(row,"gloss_en",at);
 const homographIds=clean(row.homograph_of)?row.homograph_of.split(";").map(clean):[];
 const principal=clean(row.principal_parts)||null;
 const rawConj=clean(row.conjugation);
 const conjugation=/^[1234]$/.test(rawConj)?Number(rawConj):
 rawConj==="3.5"?3.5:rawConj||null;
 const rawDecl=clean(row.declension);
 const declension=/^[12345]$/.test(rawDecl)?Number(rawDecl):rawDecl||null;
 return {
  id,head,pos,principal_parts:principal,conjugation,declension,
  gender:clean(row.gender)||null,
  senses:[{sense_id:senseId,gloss_en:gloss,gloss_la:clean(row.gloss_la)||null}],
  forms_policy:"reviewed_manual",forms:[],
  homograph_of:homographIds,
  sources:[{source_id:sourceId,locator,license_id:license}],
  macron_authority:macronAuthority,macron_reviewed:true,
  status:"approved",reviewed_by:reviewer,reviewed_at:atDate,
  review_tier:reviewTier,drafted_by:draftedBy,
  review_records:[{candidate_id:candidate.candidate_id,reviewed_by:reviewer,reviewed_at:atDate,review_tier:reviewTier,drafted_by:draftedBy,
   sense_id:senseId,notes:clean(row.notes)||"",second_reviewed_by:clean(row.second_reviewer)||null}],
  candidate_ids:[candidate.candidate_id],
  notes:clean(row.notes)||"",
  second_reviewed_by:clean(row.second_reviewer)||null
 };
}
function reviewImport(records,audit,registryDoc,mapDoc,chapters,shared){
 assert.equal(records.length,audit.glossary_candidates.length,"Review sheet must include all 128 candidate IDs exactly once");
 const source=new Map(audit.glossary_candidates.map(c=>[c.candidate_id,c]));
 const decisions=new Map(mapDoc.candidates.map(c=>[c.candidate_id,c]));
 const oldRegistry=validateRegistry(registryDoc);
 const pendingRegistry=new Map([...oldRegistry.entries()].map(([id,x])=>[id,{...x,candidate_ids:[...(x.candidate_ids||[])]}]));
 const nextMap={...mapDoc,candidates:mapDoc.candidates.map(x=>({...x}))};
 const nextById=new Map(nextMap.candidates.map(x=>[x.candidate_id,x]));
 const seen=new Set();
 const summary={approved_candidates:0,rejected_candidates:0,pending_candidates:0,unique_approved_lexemes:0,ambiguous_keys_pending:0};
 for(const [i,row]of records.entries()){
  const at="Review CSV row "+(i+2)+" "+row.candidate_id;
  for(const h of HEADERS)assert(Object.prototype.hasOwnProperty.call(row,h),at+" missing CSV column "+h);
  const id=requireField(row,"candidate_id",at);
  assert(source.has(id),at+" unknown source ID");
  assert(!seen.has(id),at+" duplicated candidate ID");
  seen.add(id);
  const c=source.get(id),m=nextById.get(id);
  assert.equal(row.legacy_head,c.headword_as_in_app,at+" original glossary head changed");
  assert.equal(row.legacy_gloss,c.original_gloss,at+" original glossary gloss changed");
  const decision=clean(row.decision).toLowerCase();
  assert(["","defer","needs_review","approve","reject"].includes(decision),at+" invalid decision");
  if(m.review_state==="approved"){
   assert(decision==="approve"&&clean(row.proposed_id)===m.approved_lexeme_id,
    at+" may not silently remap or downgrade an approved lexeme");
  }
  if(m.review_state==="rejected"){
   assert(decision==="reject",at+" may not silently reinstate a rejected candidate");
  }
  if(decision==="approve"){
   const approved=readLexeme(row,at,c);
   assert.equal(approved.pos==="proper_name",c.is_proper_name,at+" proper-name status mismatch");
   const existing=pendingRegistry.get(approved.id);
   if(existing){
    // Only lexical identity must agree. Different sources, senses and signatures
    // are legitimate evidence for the SAME stable lexeme ID.
    const core=x=>JSON.stringify(Object.fromEntries(
      ["head","pos","principal_parts","conjugation","declension","gender","homograph_of"]
       .map(k=>[k,k==="homograph_of"?[...x[k]].sort():x[k]])));
    assert.equal(core(existing),core(approved),at+" conflicting lexical identity for "+approved.id);
    for(const sense of approved.senses){
      const old=existing.senses.find(x=>x.sense_id===sense.sense_id);
      if(old)assert.deepEqual(old,sense,at+" conflicting definition for sense "+sense.sense_id);
      else existing.senses.push(sense);
    }
    for(const source of approved.sources){
      if(!existing.sources.some(x=>x.source_id===source.source_id&&x.locator===source.locator&&x.license_id===source.license_id))
       existing.sources.push(source);
    }
    if(!existing.candidate_ids.includes(id))existing.candidate_ids.push(id);
    const sig=approved.review_records[0];
    if(!existing.review_records.some(x=>x.candidate_id===sig.candidate_id&&x.reviewed_by===sig.reviewed_by&&x.reviewed_at===sig.reviewed_at))
     existing.review_records.push(sig);
    if(approved.notes && !existing.notes.split(" | ").includes(approved.notes))
     existing.notes=existing.notes?existing.notes+" | "+approved.notes:approved.notes;
    // A later qualified review upgrades the tier WITHOUT changing the ID.
    if(approved.review_tier==="latinist"){
      existing.review_tier="latinist";existing.reviewed_by=approved.reviewed_by;
      existing.reviewed_at=approved.reviewed_at;
      existing.macron_authority=approved.macron_authority;
      existing.second_reviewed_by=approved.second_reviewed_by;
    }
   }else pendingRegistry.set(approved.id,approved);
   m.review_state="approved";m.approved_lexeme_id=approved.id;
   m.proposed_id=approved.id;m.proposed_lemma=approved.head;
   m.reviewed_by=approved.reviewed_by;m.reviewed_at=approved.reviewed_at;
   m.review_tier=approved.review_tier;m.drafted_by=approved.drafted_by;
   m.sense_id=approved.senses[0].sense_id;
   m.notes=approved.notes;
   summary.approved_candidates++;
  }else if(decision==="reject"){
   requireField(row,"reviewer",at);requireField(row,"reviewed_at",at);
   assert(validDate(row.reviewed_at),at+" invalid date");
   const reason=requireField(row,"notes",at);
   m.review_state="rejected";m.approved_lexeme_id=null;
   m.reviewed_by=clean(row.reviewer);m.reviewed_at=clean(row.reviewed_at);
   m.notes=reason;
   summary.rejected_candidates++;
  }else{
   m.review_state=decision==="needs_review"?"needs_review":"pending";
   m.approved_lexeme_id=null;
   m.proposed_id=clean(row.proposed_id)||null;
   m.proposed_lemma=clean(row.proposed_lemma)||m.proposed_lemma;
   m.notes=clean(row.notes);
   summary.pending_candidates++;
  }
 }
 const nextRegistry={...registryDoc,lexemes:[...pendingRegistry.values()].sort((a,b)=>a.id.localeCompare(b.id,"en"))};
 const approved=validateRegistry(nextRegistry);
 const mapping=validateCandidateMap(nextMap,audit,approved);
 const vocab=buildVocabMap(chapters,shared,audit,nextMap);
 validateVocabMap(vocab,mapping,approved);
 summary.unique_approved_lexemes=[...approved.values()].filter(x=>x.status==="approved").length;
 summary.ambiguous_keys_pending=vocab.ambiguous_keys;
 return {registry:nextRegistry,candidates:nextMap,vocab,summary};
}
module.exports={HEADERS,reviewRows,reviewImport,dccHints};
