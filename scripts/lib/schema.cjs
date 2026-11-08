"use strict";
/** Phase 1: fail-closed, dependency-free lexical review schema checks.
 * No module in here promotes an unreviewed glossary candidate to a lexeme.
 */
const assert=require("node:assert/strict");
const LEXEME_ID=/^lx-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const CANDIDATE_ID=/^legacy-lex-[a-z0-9-]+-[0-9a-f]{8}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const HEAD=/^[A-Za-zĀāĒēĪīŌōŪūȲȳÆæŒœ]+(?:[ -][A-Za-zĀāĒēĪīŌōŪūȲȳÆæŒœ]+)*$/u;
const POS=new Set(["noun","verb","adj","adv","pron","prep","conj","interj","num","particle","proper_name"]);
const STATUSES=new Set(["draft","in_review","approved","rejected"]);
function requireString(value,label,{allowEmpty=false}={}){
 assert(typeof value==="string"&&(allowEmpty||value.trim().length>0),label+" must be a nonempty string");
 return value;
}
function validDate(d){
 if(typeof d!=="string"||!DATE.test(d))return false;
 const n=new Date(d+"T00:00:00.000Z");
 return !Number.isNaN(n.getTime())&&n.toISOString().slice(0,10)===d;
}
function normalizeLegacyKey(raw){
 // Exact v0.4.2 app's norm(): preserve its admittedly lossy folding;
 // do not use this folded key as the identity of a Latin lexeme.
 return String(raw||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g," ");
}
function validHead(head,label){
 requireString(head,label);
 assert(HEAD.test(head),label+" must use Latin letters and precomposed āēīōūȳ, not unreviewed diacritics");
 assert(head===head.normalize("NFC"),label+" must be NFC");
}
function safeObject(o,label){
 assert(o&&typeof o==="object"&&!Array.isArray(o),label+" must be an object");
 for(const key of Object.keys(o)){
  assert(!["__proto__","constructor","prototype"].includes(key),label+" has dangerous key");
 }
}
function validateRegistry(doc){
 safeObject(doc,"lexeme registry");
 assert.equal(doc.schema,"tablinum-lexemes-v1");
 assert(Array.isArray(doc.lexemes),"registry lexemes array missing");
 const byId=new Map();
 for(const [i,e]of doc.lexemes.entries()){
  const p="lexemes["+i+"]";
  safeObject(e,p);
  requireString(e.id,p+".id");assert(LEXEME_ID.test(e.id),p+".id invalid");
  assert(!byId.has(e.id),"duplicate immutable lexeme ID "+e.id);
  assert(STATUSES.has(e.status),p+".status invalid");
  validHead(e.head,p+".head");
  assert(POS.has(e.pos),p+".pos must be explicit POS (not unknown)");
  assert(Array.isArray(e.senses)&&e.senses.length>0,p+" must have sense");
  const senseIds=new Set();
  for(const sense of e.senses){
   safeObject(sense,p+".sense");
   requireString(sense.sense_id,p+".sense_id");
   requireString(sense.gloss_en,p+".gloss_en");
   assert(!senseIds.has(sense.sense_id),p+" duplicate sense");
   senseIds.add(sense.sense_id);
   if(sense.gloss_la!==null&&sense.gloss_la!==undefined)requireString(sense.gloss_la,p+".gloss_la");
  }
  assert(Array.isArray(e.homograph_of),p+" homograph_of must be array");
  for(const target of e.homograph_of)assert(LEXEME_ID.test(target)&&target!==e.id,p+" invalid homograph target");
  assert(new Set(e.homograph_of).size===e.homograph_of.length,p+" duplicate homograph references");
  assert(Array.isArray(e.sources)&&e.sources.length>0,p+" must have documented provenance");
  for(const source of e.sources){
   safeObject(source,p+".source");
   requireString(source.source_id,p+".source_id");
   requireString(source.locator,p+".source locator");
   requireString(source.license_id,p+".source license_id");
  }
  if(e.status==="approved"){
   requireString(e.reviewed_by,p+".reviewed_by");
   assert(validDate(e.reviewed_at),p+".reviewed_at must be valid YYYY-MM-DD");
   requireString(e.macron_authority,p+".macron_authority");
   assert(e.macron_reviewed===true,p+".macron_reviewed must be true");
   assert(["owner","latinist"].includes(e.review_tier),p+".review_tier must be owner or latinist");
   if(e.review_tier==="owner"){
    requireString(e.drafted_by,p+".drafted_by for owner tier");
    assert(e.drafted_by!==e.reviewed_by,p+".drafted_by must differ from owner reviewer");
   }else if(e.drafted_by!==undefined&&e.drafted_by!==null){
    requireString(e.drafted_by,p+".drafted_by");
   }
   assert(Array.isArray(e.review_records)&&e.review_records.length>0,p+".review_records required");
   const signatures=new Set();
   for(const sign of e.review_records){
    safeObject(sign,p+".review record");
    requireString(sign.reviewed_by,p+".review record reviewer");
    assert(validDate(sign.reviewed_at),p+".review record date invalid");
    assert(["owner","latinist"].includes(sign.review_tier),p+".review record tier invalid");
    if(sign.review_tier==="owner"){
     requireString(sign.drafted_by,p+".owner record drafter");
     assert(sign.drafted_by!==sign.reviewed_by,p+".owner record drafter must differ from signer");
    }
    if(sign.second_reviewed_by){
     requireString(sign.second_reviewed_by,p+".record second reviewer");
     assert(sign.second_reviewed_by!==sign.reviewed_by,p+".record second reviewer must be independent");
    }
    const signature=sign.reviewed_by+"|"+sign.reviewed_at+"|"+sign.candidate_id;
    assert(!signatures.has(signature),p+" duplicate signature");
    signatures.add(signature);
   }
   assert(e.review_records.some(r=>r.reviewed_by===e.reviewed_by&&r.review_tier===e.review_tier),
     p+" primary signature must be among review records");

   if(e.second_reviewed_by!==null&&e.second_reviewed_by!==undefined){
    requireString(e.second_reviewed_by,p+".second_reviewed_by");
    assert(e.second_reviewed_by!==e.reviewed_by,p+" independent reviewer must differ from primary reviewer");
   }
   assert(!e.id.startsWith("lx-cand-"),p+" cannot approve a provisional ID");
   if(e.pos==="noun"){
    assert([1,2,3,4,5,"indeclinable"].includes(e.declension),p+".declension missing");
    assert(["m","f","n","common"].includes(e.gender),p+".gender missing");
    requireString(e.principal_parts,p+".principal_parts missing noun genitive");
   }
   if(e.pos==="verb"){
    requireString(e.principal_parts,p+".principal_parts required");
    assert([1,2,3,3.5,4,"irregular","defective"].includes(e.conjugation),p+".conjugation required");
   }
   if(e.pos==="adj")requireString(e.principal_parts,p+".adjective paradigm required");
   if(e.pos==="proper_name")requireString(e.principal_parts,p+".proper noun declension required");
  }else{
   if(e.reviewed_at!==null&&e.reviewed_at!==undefined)assert(validDate(e.reviewed_at),p+".reviewed_at invalid");
  }
  byId.set(e.id,e);
 }
 for(const e of doc.lexemes){
  for(const h of e.homograph_of){
   assert(byId.has(h),"homograph "+h+" does not exist");
   assert(byId.get(h).homograph_of.includes(e.id),"homograph links must be symmetric: "+e.id+" vs "+h);
  }
 }
 return byId;
}
function validateCandidateMap(doc,audit,registry){
 safeObject(doc,"candidate map");
 assert.equal(doc.schema,"tablinum-legacy-candidate-map-v1");
 assert(Array.isArray(doc.candidates),"candidate map candidates missing");
 const expected=new Map(audit.glossary_candidates.map(c=>[c.candidate_id,c]));
 assert.equal(doc.candidates.length,expected.size,"candidate map must include all glossary entries, including proper names");
 const seen=new Set();
 for(const [i,row]of doc.candidates.entries()){
  const p="candidate["+i+"]";
  safeObject(row,p);
  assert(CANDIDATE_ID.test(row.candidate_id)&&expected.has(row.candidate_id),p+" unknown candidate");
  assert(!seen.has(row.candidate_id),p+" duplicated");seen.add(row.candidate_id);
  const source=expected.get(row.candidate_id);
  assert.equal(row.head_as_in_app,source.headword_as_in_app,p+" source head changed");
  assert.equal(row.original_gloss,source.original_gloss,p+" source meaning changed");
  assert.equal(row.is_proper_name,source.is_proper_name,p+" proper-name classification changed");
  assert(["pending","needs_review","approved","rejected"].includes(row.review_state),p+" invalid state");
  if(row.review_state==="approved"){
   assert(row.approved_lexeme_id&&registry.has(row.approved_lexeme_id),p+" approved ID missing from registry");
   assert.equal(registry.get(row.approved_lexeme_id).status,"approved",p+" referenced lexeme not approved");
   assert.equal(registry.get(row.approved_lexeme_id).pos==="proper_name",row.is_proper_name,p+" proper name mismatch");
   requireString(row.reviewed_by,p+".reviewed_by");
   assert(validDate(row.reviewed_at),p+" approval date invalid");
  }else{
   assert(row.approved_lexeme_id===null,p+" cannot map pending/rejected to approved lexeme");
  }
  if(row.review_state==="rejected"){
   requireString(row.reviewed_by,p+" rejection reviewer missing");
   assert(validDate(row.reviewed_at),p+" rejection date invalid");
   requireString(row.notes,p+" rejection reason missing");
  }
 }
 return new Map(doc.candidates.map(x=>[x.candidate_id,x]));
}
function validateVocabMap(doc,candidateMap,registry){
 safeObject(doc,"legacy vocab map");
 assert.equal(doc.schema,"tablinum-legacy-vocab-map-v1");
 assert(Array.isArray(doc.keys),"vocab map keys missing");
 const keys=new Map();
 for(const row of doc.keys){
  safeObject(row,"vocab key");
  assert(row.key===normalizeLegacyKey(row.key)&&row.key.length>0,"legacy vocab key not normalised");
  assert(!keys.has(row.key),"duplicate legacy normalized key");
  assert(Array.isArray(row.candidate_ids)&&row.candidate_ids.length>=1,"missing candidates for "+row.key);
  assert(new Set(row.candidate_ids).size===row.candidate_ids.length,"duplicate candidates for "+row.key);
  assert(candidateMap.has(row.first_match_candidate_id),"first-match ID not found");
  assert(row.candidate_ids.includes(row.first_match_candidate_id),"first match missing from "+row.key);
  for(const id of row.candidate_ids)assert(candidateMap.has(id),"unknown candidate "+id);
  const active=row.candidate_ids.filter(id=>candidateMap.get(id).review_state!=="rejected");
  const approved=new Set(active.map(id=>candidateMap.get(id).approved_lexeme_id));
  // Every non-rejected candidate must agree on the same reviewed lexeme ID.
  const canUse=active.length>0&&approved.size===1&&!approved.has(null);
  if(canUse){
   const [id]=approved;assert(registry.has(id)&&registry.get(id).status==="approved","unapproved vocab map "+row.key);
   assert.equal(row.approved_lexeme_id,id,"wrong reviewed ID for "+row.key);
   assert.equal(row.status,"approved","wrong status for "+row.key);
  }else{
   assert.equal(row.approved_lexeme_id,null,"ambiguous/unreviewed key falsely approved "+row.key);
   assert(["ambiguous","unresolved"].includes(row.status),"invalid pending status for "+row.key);
  }
  keys.set(row.key,row);
 }
 return keys;
}
module.exports={normalizeLegacyKey,validDate,validHead,validateRegistry,validateCandidateMap,validateVocabMap,LEXEME_ID};
