"use strict";
/* Phase 1 evidence tests: negative tests MUST reject unsafe approvals.
 * A "Test reviewer" exists only in this in-memory fixture, never in user data.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {extractArray,readLegacySource}=require("../scripts/lib/extract-legacy.cjs");
const {validateRegistry,validateCandidateMap,validateVocabMap}=require("../scripts/lib/schema.cjs");
const {reviewRows,reviewImport,dccHints,HEADERS}=require("../scripts/lib/review-workflow.cjs");
const {writeCsv,parseCsv}=require("../scripts/lib/review-csv.cjs");
const root=path.resolve(__dirname,"..");
const loc=path.join(root,"curriculum","lexicon");
const load=p=>JSON.parse(fs.readFileSync(path.join(loc,p),"utf8"));
const a=load("legacy-token-audit.json");
const reg=load("lexemes.json");
const cm=load("legacy-candidate-map.json");
const vm=load("legacy-vocab-map.json");
const extra=load("legacy-extra-streams.json");
const source=readLegacySource(root);
const lessons=extractArray(source,"const L=","\n];\n\nconst shared=");
const shared=extractArray(source,"const shared=",";\nfunction norm(",0);
const validated=validateRegistry(reg);
const candidates=validateCandidateMap(cm,a,validated);
const keys=validateVocabMap(vm,candidates,validated);
assert.equal(a.glossary_candidates.length,128);
assert.equal(a.summary.provisional_headword_candidates,124);
assert.equal(a.summary.ambiguous_tokens,9);
assert.equal(validated.size,0);
assert.equal(candidates.size,128);
assert.equal(keys.size,204);
assert.equal(vm.ambiguous_keys,3);
assert.equal(vm.approved_keys,0);
assert.equal(extra.total_records,177);
assert.deepEqual([...new Set(extra.unglossed_tokens.map(t=>t.surface.toLowerCase()))].sort(),["faciet","facit","quandō"]);
assert.equal(extra.unglossed_tokens.length,5);
assert(extra.records.every(r=>r.tokens.every(t=>Array.isArray(t.source_candidate_ids))));
assert(extra.records.every(r=>r.counted_as_new_introduction===false));
const sheet=parseCsv(fs.readFileSync(path.join(loc,"review-sheets","legacy-candidates.csv"),"utf8"));
assert.deepEqual(sheet.headers,HEADERS);
assert.equal(sheet.records.length,128);
assert.equal(new Set(sheet.records.map(x=>x.candidate_id)).size,128);
const flagged=sheet.records.filter(x=>x.priority==="P0 ambiguous token");
assert.equal(flagged.length,6,"Nine ambiguous tokens involve six candidate rows");
assert(flagged.every(x=>x.ambiguous_sentence_tokens));
assert.equal(sheet.records[0].priority,"P0 ambiguous token");
// Full CSV roundtrip including commas, quoted fields, CRLF and hostile formula
const example={...sheet.records[0],notes:'A \n "quoted" note, with comma'};
example.gloss_en="=HYPERLINK('http://bad')";
const rt=parseCsv(writeCsv(HEADERS,[example]));
assert.equal(rt.records[0].notes,example.notes);
assert.equal(rt.records[0].gloss_en,"'"+example.gloss_en,"Spreadsheet formula must be escaped");
// Synthetic *approved* metadata fixture in memory only.
const makeRow=()=>{
 const rows=reviewRows(a,cm,null,reg);
 const choice=rows.find(x=>x.legacy_head==="an"&&x.legacy_gloss.includes("question"));
 assert(choice,"Expected unique conjunction candidate 'an'");
 Object.assign(choice,{
  proposed_lemma:"an",proposed_id:"lx-an-question-particle",
  pos:"particle",principal_parts:"",sense_id:"question-alternative",
  gloss_en:"or (in a question)",source_id:"original-tablinum",
  source_locator:"index.html#shared",license_id:"original-tablinum",
  macron_authority:"Human-checked original Latin source",
  macron_reviewed:"yes",decision:"approve",reviewer:"Synthetic Test Reviewer",
  reviewed_at:"2026-11-05",review_tier:"owner",drafted_by:"claude-synthetic-test",notes:"fixture only - never commit as approved"
 });
 return {rows,choice};
};
const {rows,choice}=makeRow();
const approved=reviewImport(rows,a,reg,cm,lessons,shared);
assert.equal(approved.summary.approved_candidates,1);
assert.equal(approved.summary.unique_approved_lexemes,1);
assert.equal(approved.vocab.keys.find(x=>x.key==="an").approved_lexeme_id,"lx-an-question-particle");
assert.equal(approved.vocab.approved_keys,1);
assert.equal(reg.lexemes.length,0,"Fixture must not change actual registry");
const noReviewer=makeRow();noReviewer.choice.reviewer="";
assert.throws(()=>reviewImport(noReviewer.rows,a,reg,cm,lessons,shared),/reviewer/i);
const noMacronReview=makeRow();noMacronReview.choice.macron_reviewed="";
assert.throws(()=>reviewImport(noMacronReview.rows,a,reg,cm,lessons,shared),/macron/i);
const badQuantity=makeRow();badQuantity.choice.proposed_lemma="án";
assert.throws(()=>reviewImport(badQuantity.rows,a,reg,cm,lessons,shared),/Latin letters/i);
const withoutSense=makeRow();withoutSense.choice.sense_id="";
assert.throws(()=>reviewImport(withoutSense.rows,a,reg,cm,lessons,shared),/sense_id/i);
const unknownId=makeRow();unknownId.choice.proposed_id="wrong";
assert.throws(()=>reviewImport(unknownId.rows,a,reg,cm,lessons,shared),/stable sense-aware ID/i);
const duplicate=makeRow();duplicate.rows[1].candidate_id=duplicate.rows[0].candidate_id;
assert.throws(()=>reviewImport(duplicate.rows,a,reg,cm,lessons,shared),/duplicated candidate ID/i);
const proper=makeRow();proper.choice.candidate_id=a.glossary_candidates.find(x=>x.is_proper_name).candidate_id;
assert.throws(()=>reviewImport(proper.rows,a,reg,cm,lessons,shared),/original glossary head changed|duplicated candidate ID/i);
// Homograph symmetry and morphology requirements.
const noun={
 id:"lx-rosa-flower",head:"rosa",pos:"noun",principal_parts:"rosa, rosae",
 declension:1,gender:"f",
 senses:[{sense_id:"flower",gloss_en:"rose",gloss_la:null}],
 homograph_of:[],sources:[{source_id:"original-tablinum",locator:"index.html",license_id:"original-tablinum"}],
 macron_authority:"Synthetic review",macron_reviewed:true,
 status:"approved",reviewed_by:"Synthetic Test Reviewer",reviewed_at:"2026-11-05",
 review_tier:"owner",drafted_by:"claude-synthetic-test",
 review_records:[{candidate_id:"synthetic",reviewed_by:"Synthetic Test Reviewer",
 reviewed_at:"2026-11-05",review_tier:"owner",drafted_by:"claude-synthetic-test"}]
};
validateRegistry({schema:"tablinum-lexemes-v1",lexemes:[noun]});
assert.throws(()=>validateRegistry({schema:"tablinum-lexemes-v1",
 lexemes:[{...noun,second_reviewed_by:"Synthetic Test Reviewer"}]}),/independent reviewer/);
validateRegistry({schema:"tablinum-lexemes-v1",
 lexemes:[{...noun,second_reviewed_by:"Independent Synthetic Tester"}]});
assert.throws(()=>validateRegistry({schema:"tablinum-lexemes-v1",lexemes:[{...noun,reviewed_by:""}]}),/reviewed_by/);
assert.throws(()=>validateRegistry({schema:"tablinum-lexemes-v1",lexemes:[{...noun,declension:null}]}),/declension/);
assert.throws(()=>validateRegistry({schema:"tablinum-lexemes-v1",lexemes:[{...noun,homograph_of:["lx-other-rose"]}]}),/does not exist/);
assert.throws(()=>validateRegistry({schema:"tablinum-lexemes-v1",lexemes:[noun,noun]}),/duplicate immutable/);
// Same surface 'ad' from two legacy glossary senses may never be auto-approved from one decision.
const adRows=reviewRows(a,cm,null,reg);
const aRow=adRows.find(x=>x.legacy_head==="ad");
Object.assign(aRow,{proposed_lemma:"ad",proposed_id:"lx-ad-toward",pos:"prep",
 sense_id:"toward",gloss_en:"toward",source_id:"original-tablinum",
 source_locator:"index.html#shared",license_id:"original-tablinum",
 macron_authority:"Synthetic",macron_reviewed:"yes",decision:"approve",
 reviewer:"Synthetic Test Reviewer",reviewed_at:"2026-11-05",review_tier:"owner",drafted_by:"claude-synthetic-test"});
const adResult=reviewImport(adRows,a,reg,cm,lessons,shared);
const adKey=adResult.vocab.keys.find(x=>x.key==="ad");
assert.equal(adKey.status,"ambiguous");
assert.equal(adKey.approved_lexeme_id,null,"Partially resolved ambiguity must not be promoted");
// Never fill new-course ledger from legacy lesson data.
const ledger=JSON.parse(fs.readFileSync(path.join(root,"curriculum","vocabulary-introductions-130.json"),"utf8"));
assert.equal(ledger.introduced_lexemes.length,0);
console.log("PASS: 128 review candidates / 204 glossary keys / 177 extra streams, with 9 source ambiguity tokens.");
console.log("PASS: signed synthetic approval, no-macron/no-reviewer rejection, morphology checks, CSV injection guard and ambiguous homograph gate.");
console.log("PENDING: actual Latinist review and independently vetted lemma entry; no real approval claimed.");
