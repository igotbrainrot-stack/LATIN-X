"use strict";
/* Phase 1 owner's signed review policy — all approvals here are TEST FIXTURES.
 * The committed production registry remains empty until owner has signed it.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),lex=path.join(root,"curriculum","lexicon");
const {extractArray,readLegacySource}=require("../scripts/lib/extract-legacy.cjs");
const {validateRegistry}=require("../scripts/lib/schema.cjs");
const {HEADERS,reviewRows,reviewImport}=require("../scripts/lib/review-workflow.cjs");
const {writeCsv,parseCsv}=require("../scripts/lib/review-csv.cjs");
const read=p=>JSON.parse(fs.readFileSync(path.join(lex,p),"utf8"));
const audit=read("legacy-token-audit.json"),registry=read("lexemes.json"),cand=read("legacy-candidate-map.json");
const html=readLegacySource(root);
const lessons=extractArray(html,"const L=","\n];\n\nconst shared=");
const shared=extractArray(html,"const shared=",";\nfunction norm(",0);
const blankRows=()=>reviewRows(audit,cand,null,registry);
const fill=(r,id,head,sense,meaning,source,reviewer,date,notes="")=>Object.assign(r,{
 proposed_id:id,proposed_lemma:head,pos:"prep",sense_id:sense,gloss_en:meaning,
 source_id:"synthetic-original",source_locator:source,license_id:"synthetic-test",
 macron_authority:"synthetic human review (TEST ONLY)",macron_reviewed:"yes",
 review_tier:"owner",drafted_by:"claude-draft-2026-11-05",decision:"approve",
 reviewer,reviewed_at:date,notes
});
const rows=blankRows(),ad=rows.filter(r=>r.legacy_head==="ad");
assert.equal(ad.length,2);
fill(ad[0],"lx-ad-toward","ad","toward","toward",ad[0].source_rows,"Owner A","2026-11-05","row A");
fill(ad[1],"lx-ad-toward","ad","toward","toward",ad[1].source_rows,"Owner B","2026-11-06","row B");
const first=reviewImport(rows,audit,registry,cand,lessons,shared);
assert.equal(first.summary.approved_candidates,2);
assert.equal(first.summary.unique_approved_lexemes,1);
const merged=first.registry.lexemes[0];
assert.equal(merged.id,"lx-ad-toward");
assert.equal(merged.review_tier,"owner");
assert.equal(merged.review_records.length,2);
assert.equal(merged.candidate_ids.length,2);
assert(merged.notes.includes("row A")&&merged.notes.includes("row B"));
assert.equal(first.vocab.keys.find(r=>r.key==="ad").approved_lexeme_id,"lx-ad-toward");
// A signed rejected duplicate should not block a different APPROVED candidate.
const rejectRows=blankRows(),adReject=rejectRows.filter(r=>r.legacy_head==="ad");
fill(adReject[0],"lx-ad-toward","ad","toward","toward",adReject[0].source_rows,"Owner","2026-11-05");
Object.assign(adReject[1],{decision:"reject",reviewer:"Owner",reviewed_at:"2026-11-05",
 notes:"Duplicate noncanonical glossary row; no independent lexeme"});
const rejected=reviewImport(rejectRows,audit,registry,cand,lessons,shared);
assert.equal(rejected.vocab.keys.find(r=>r.key==="ad").approved_lexeme_id,"lx-ad-toward");
assert.equal(rejected.candidates.candidates.find(x=>x.candidate_id===adReject[1].candidate_id).review_state,"rejected");
// Sense aggregation: two different senses of one lexeme are legal and preserve source identities.
const rows2=blankRows(),om=rows2.filter(r=>["omnis","omnēs"].includes(r.legacy_head));
assert.equal(om.length,2);
for(const [i,r]of om.entries()){
 fill(r,"lx-omnis-all","omnis",i?"collective":"general",i?"everyone":"all",r.source_rows,"Owner",
 "2026-11-05","different source "+i);
 r.pos="adj";r.principal_parts="omnis, omne";
}
const multi=reviewImport(rows2,audit,registry,cand,lessons,shared);
assert.equal(multi.registry.lexemes.length,1);
assert.deepEqual(multi.registry.lexemes[0].senses.map(x=>x.sense_id).sort(),["collective","general"]);
assert.equal(multi.registry.lexemes[0].review_records.length,2);
assert.equal(multi.vocab.keys.find(r=>r.key==="omnes").approved_lexeme_id,"lx-omnis-all");
// Later Latinist sign-off upgrades existing lexeme without changing stable ID.
const upgradedRows=reviewRows(audit,first.candidates,null,first.registry);
const upgrade=upgradedRows.find(r=>r.candidate_id===ad[0].candidate_id);
assert(upgrade);
Object.assign(upgrade,{review_tier:"latinist",drafted_by:"",reviewer:"Latinist A",
 reviewed_at:"2026-11-07",second_reviewer:"Latinist B"});
const upgraded=reviewImport(upgradedRows,audit,first.registry,first.candidates,lessons,shared);
assert.equal(upgraded.registry.lexemes[0].id,"lx-ad-toward");
assert.equal(upgraded.registry.lexemes[0].review_tier,"latinist");
assert.equal(upgraded.registry.lexemes[0].review_records.length,3);
assert(upgraded.registry.lexemes[0].review_records.some(r=>r.review_tier==="owner"));
assert(upgraded.registry.lexemes[0].review_records.some(r=>r.review_tier==="latinist"));
// Owner tier must have an independent drafter, but no unrelated Latinist signer.
const noDrafter=blankRows(),row=noDrafter.find(r=>r.legacy_head==="an");
fill(row,"lx-an-question","an","question","whether",row.source_rows,"Owner","2026-11-05");
row.drafted_by="Owner";
assert.throws(()=>reviewImport(noDrafter,audit,registry,cand,lessons,shared),/drafted_by different/);
row.drafted_by="";
assert.throws(()=>reviewImport(noDrafter,audit,registry,cand,lessons,shared),/drafted_by different/);
row.drafted_by="Claude draft";
row.review_tier="";
assert.throws(()=>reviewImport(noDrafter,audit,registry,cand,lessons,shared),/review_tier/);
// A lexeme cannot claim Latinist review under a nonexistent witness field.
const forged=structuredClone(first.registry);
forged.lexemes[0].review_tier="latinist";
forged.lexemes[0].reviewed_by="Latinist nobody";
assert.throws(()=>validateRegistry(forged),/primary signature/);
// Existing 30-column Claude draft layout remains valid for preview.
const current=parseCsv(fs.readFileSync(path.join(lex,"review-sheets","legacy-candidates.csv"),"utf8"));
assert.deepEqual(current.headers,HEADERS);
const oldHeaders=HEADERS.filter(x=>!["review_tier","drafted_by"].includes(x));
const oldCsv=writeCsv(oldHeaders,current.records.map(x=>Object.fromEntries(oldHeaders.map(h=>[h,x[h]]))));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"tablinum-phase1-"));
try{
 const file=path.join(tmp,"legacy-candidates-claude-draft.csv");fs.writeFileSync(file,oldCsv,"utf8");
 const run=(arg)=>cp.execFileSync(process.execPath,["scripts/registry-review-sheet.cjs",arg,file],{cwd:root,encoding:"utf8",stdio:["ignore","pipe","pipe"]});
 assert(run("--check-sheet").includes("PASS:"));
 assert(run("--dry-run").includes("PASS:"));
 assert.throws(()=>run("--import"),/Command failed/);
 // Re-export DCC hints from a Claude draft's proposed lemma, never by importing it.
 const proposed=parseCsv(oldCsv);
 const habere=proposed.records.find(r=>r.legacy_head==="habēre");
 assert(habere);habere.proposed_lemma="habeō";
 const proposedPath=path.join(tmp,"claude-proposals.csv");
 fs.writeFileSync(proposedPath,writeCsv(oldHeaders,proposed.records),"utf8");
 const dccPath=path.join(tmp,"local-core-list.csv");
 fs.writeFileSync(dccPath,'"Headword","Frequency Rank"\r\n"habeō habēre habuī habitum","61"\r\n',"utf8");
 const suggested=path.join(tmp,"enriched-current-sheet.csv");
 cp.execFileSync(process.execPath,["scripts/registry-review-sheet.cjs","--export",
  suggested,"--from-draft",proposedPath,"--dcc",dccPath],{cwd:root,stdio:"pipe"});
 const expanded=parseCsv(fs.readFileSync(suggested,"utf8"));
 assert.deepEqual(expanded.headers,HEADERS);
 const enriched=expanded.records.find(r=>r.candidate_id===habere.candidate_id);
 assert.equal(enriched.proposed_lemma,"habeō");
 assert(enriched.dcc_headword_hint.startsWith("habeō"));
 assert.equal(enriched.decision,"");
 assert.equal(enriched.reviewer,"");
 assert.equal(enriched.review_tier,"");
 assert.equal(enriched.drafted_by,"");

 // Even a current-sheet export with no decisions cannot be imported.
 const currentFile=path.join(tmp,"current.csv");
 fs.writeFileSync(currentFile,writeCsv(HEADERS,current.records),"utf8");
 assert.throws(()=>cp.execFileSync(process.execPath,
  ["scripts/registry-review-sheet.cjs","--import",currentFile],
  {cwd:root,stdio:"pipe"}),/Command failed/);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
// The context/exercise/cloze audit derives source IDs and flags precisely the missing words.
const extras=read("legacy-extra-streams.json");
assert.equal(extras.total_records,184,"Two approved cloze and five short-answer alternatives remain unsigned audit records");
assert(extras.records.every(x=>x.tokens.every(t=>Array.isArray(t.source_candidate_ids))));
assert.deepEqual([...new Set(extras.unglossed_tokens.map(t=>t.surface.toLowerCase()))].sort(),
 ["faciet","facit","quandō"]);
assert.equal(extras.unglossed_tokens.length,5);
// DCC's first-person citation matches proposed_lemma despite legacy infinitive head.
const dcc=parseCsv('"Headword","Frequency Rank"\r\n"habeō habēre habuī habitum","61"\r\n');
const cRows=blankRows(),hab=cRows.find(r=>r.legacy_head==="habēre");
assert(hab);hab.proposed_lemma="habeō";
const hinted=reviewRows(audit,{...cand,candidates:cand.candidates.map(x=>
 x.candidate_id===hab.candidate_id?{...x,proposed_lemma:"habeō"}:x)},dcc,registry);
assert(hinted.find(r=>r.candidate_id===hab.candidate_id).dcc_headword_hint.startsWith("habeō"));
assert.equal(registry.lexemes.length,0,"No fixture approval can write to repository");
console.log("PASS: owner signatures, multi-row merge, multi-sense, Latinist upgrade, and immutable lexeme IDs.");
console.log("PASS: legacy Claude draft check/dry-run accepted; unsigned import fails closed.");
console.log("PASS: candidate-tagged extra streams identify five occurrences of three unglossed Latin forms.");
