"use strict";
/* Phase 1 editorial CSV workflow. This runs locally, with no internet.
 * Review decisions must be explicit and signed; no DCC match auto-approves.
 *
 * node scripts/registry-review-sheet.cjs --export [file] [--dcc path/to/local.csv]
 * node scripts/registry-review-sheet.cjs --dry-run [file]
 * node scripts/registry-review-sheet.cjs --import [file]
 * node scripts/registry-review-sheet.cjs --check-sheet [file]
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {extractArray,readLegacySource}=require("./lib/extract-legacy.cjs");
const {parseCsv,writeCsv}=require("./lib/review-csv.cjs");
const {HEADERS,reviewRows,reviewImport}=require("./lib/review-workflow.cjs");
const {validateRegistry,validateCandidateMap,validateVocabMap}=require("./lib/schema.cjs");
const {serialise}=require("./lib/phase1-legacy.cjs");
const root=path.resolve(__dirname,"..");
const dirname=path.join(root,"curriculum","lexicon");
const files={
 source:path.join(root,"index.html"),
 audit:path.join(dirname,"legacy-token-audit.json"),
 candidates:path.join(dirname,"legacy-candidate-map.json"),
 registry:path.join(dirname,"lexemes.json"),
 vocab:path.join(dirname,"legacy-vocab-map.json"),
 ledger:path.join(root,"curriculum","vocabulary-introductions-130.json"),
 sheet:path.join(dirname,"review-sheets","legacy-candidates-claude-draft-32col.csv")
};
const mode=process.argv[2];
assert(["--export","--dry-run","--import","--check-sheet"].includes(mode),
 "Usage: node scripts/registry-review-sheet.cjs --export|--dry-run|--import|--check-sheet [sheet.csv] [--dcc local-DCC.csv]");
const rest=process.argv.slice(3);
const dccFlag=rest.indexOf("--dcc");
const dccPath=dccFlag>=0?rest[dccFlag+1]:null;
const fromDraftFlag=rest.indexOf("--from-draft");
const draftPath=fromDraftFlag>=0?rest[fromDraftFlag+1]:null;
assert(fromDraftFlag<0||(draftPath&&draftPath!=="--from-draft"),
  "--from-draft requires an existing CSV path");
if(draftPath)assert(mode==="--export","--from-draft is only supported with --export");
assert(dccFlag<0||(dccPath&&dccPath!=="--dcc"),"--dcc requires local CSV path");
const target=rest[0]&&rest[0]!=="--dcc"&&rest[0]!=="--from-draft"?path.resolve(rest[0]):files.sheet;
const audit=JSON.parse(fs.readFileSync(files.audit,"utf8"));
const candidates=JSON.parse(fs.readFileSync(files.candidates,"utf8"));
const registry=JSON.parse(fs.readFileSync(files.registry,"utf8"));
const src=readLegacySource(root);
const lessons=extractArray(src,"const L=","\n];\n\nconst shared=");
const shared=extractArray(src,"const shared=",";\nfunction norm(",0);
validateCandidateMap(candidates,audit,validateRegistry(registry));
const cleanRow=r=>Object.fromEntries(HEADERS.map(h=>[h,r[h]||""]));
if(mode==="--export"){
 const core=dccPath?parseCsv(fs.readFileSync(dccPath,"utf8")):null;
 let proposedMap=candidates,sourceDraft=null;
 if(draftPath){
  const parsed=parseCsv(fs.readFileSync(draftPath,"utf8"));
  const originalHeaders=HEADERS.filter(x=>x!=="review_tier"&&x!=="drafted_by");
  assert(JSON.stringify(parsed.headers)===JSON.stringify(HEADERS)||
    JSON.stringify(parsed.headers)===JSON.stringify(originalHeaders),
    "Draft CSV must have original 30 or current 32 columns in order");
  assert.equal(parsed.records.length,128,"Draft must contain all 128 candidates");
  sourceDraft=new Map(parsed.records.map(x=>[x.candidate_id,x]));
  assert.equal(sourceDraft.size,128,"Duplicate draft candidate IDs");
  const originals=new Map(audit.glossary_candidates.map(x=>[x.candidate_id,x]));
  for(const [id,row]of sourceDraft){
   assert(originals.has(id),"Draft contains unknown candidate "+id);
   assert.equal(row.legacy_head,originals.get(id).headword_as_in_app,"Draft headword was altered");
   assert.equal(row.legacy_gloss,originals.get(id).original_gloss,"Draft original gloss was altered");
  }
  assert.notEqual(path.resolve(draftPath),path.resolve(target),"Refusing to overwrite source Claude draft");
  proposedMap={...candidates,candidates:candidates.candidates.map(x=>{
   const row=sourceDraft.get(x.candidate_id);
   return {...x,proposed_lemma:row.proposed_lemma||x.proposed_lemma};
  })};
 }
 const rows=reviewRows(audit,proposedMap,core,registry).map(row=>{
  const draft=sourceDraft?.get(row.candidate_id);
  if(draft){
   for(const key of HEADERS){
    if(["priority","candidate_id","legacy_head","legacy_gloss","legacy_forms",
     "source_rows","ambiguous_sentence_tokens","dcc_headword_hint","dcc_rank_hint"].includes(key))continue;
    if(draft[key]!==undefined)row[key]=draft[key];
   }
  }
  return cleanRow(row);
 });
 assert.equal(rows.length,128);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,writeCsv(HEADERS,rows),"utf8");
 console.log("CREATED "+target+" ("+rows.length+" review rows; 9 ambiguous sentence tokens flagged)");
 console.log(dccPath?"DCC hints matched against draft proposed_lemma first, then legacy_head; not verified morphology.":"No DCC file provided; source-rank hints left blank.");
 if(sourceDraft)console.log("DRAFT RE-EXPORT: copied proposals, never auto-signed or imported into lexemes.json.");
 process.exit(0);
}
const sheet=parseCsv(fs.readFileSync(target,"utf8"));
// Claude's original draft used the previous 30-column sheet. Accept it for
// structural checks and non-writing draft preview; never silently sign it.
const legacyHeaders=HEADERS.filter(x=>x!=="review_tier"&&x!=="drafted_by");
const oldDraft=JSON.stringify(sheet.headers)===JSON.stringify(legacyHeaders);
assert(oldDraft||JSON.stringify(sheet.headers)===JSON.stringify(HEADERS),
  "Unsupported CSV column layout; expected current 32-column sheet or legacy Claude 30-column draft.");
const rows=sheet.records.map(row=>{
 const full=Object.fromEntries(HEADERS.map(h=>[h,row[h]??""]));
 return full;
});
const ids=new Set(rows.map(r=>r.candidate_id));
assert.equal(ids.size,128,"Missing/duplicate candidate IDs");
assert.equal(sheet.records.length,128);
if(mode==="--check-sheet"){
 const expected=new Set(audit.glossary_candidates.map(c=>c.candidate_id));
 for(const id of ids)assert(expected.has(id),"Unknown candidate "+id);
 console.log("PASS: "+sheet.records.length+" unique source-traceable review rows; "+(oldDraft?"legacy draft 30-column":"current signed-capable 32-column")+" format.");
 if(oldDraft)console.log("DRAFT ONLY: add review_tier and drafted_by columns before signed owner import.");
 process.exit(0);
}
if(mode==="--import"){
 assert(!oldDraft,"Original 30-column draft must add review_tier and drafted_by before signed import");
 for(const [i,row]of rows.entries()){
  assert(["approve","reject"].includes(row.decision.toLowerCase().trim()),
    "Import row "+(i+2)+" missing final approve/reject decision");
  assert(row.reviewer.trim()&&row.reviewed_at.trim(),
    "Import row "+(i+2)+" needs owner/Latinist signature and date");
  if(row.decision.toLowerCase().trim()==="approve"){
   for(const required of ["review_tier","source_id","source_locator","license_id","macron_authority"]){
    assert(row[required].trim(),"Import row "+(i+2)+" missing "+required);
   }
   assert(row.macron_reviewed.toLowerCase().trim()==="yes",
     "Import row "+(i+2)+" must have macron_reviewed=yes");
  }
 }
}
const unsigned=rows.filter(row=>row.decision.toLowerCase().trim()==="approve"&&
 (!row.reviewer.trim()||!row.reviewed_at.trim()||!row.review_tier.trim()||
  !row.macron_authority.trim()||row.macron_reviewed.toLowerCase().trim()!=="yes"));
if(mode==="--dry-run"&&unsigned.length){
 console.log("DRAFT PREVIEW: "+unsigned.length+" proposed approvals are unsigned/incomplete.");
 console.log("No unverified proposals will be approved. Sign the owner-tier columns, then re-run --dry-run.");
}
const safePreview=mode==="--dry-run"
 ?rows.map(row=>unsigned.includes(row)?{...row,decision:"needs_review"}:row)
 :rows;
const result=reviewImport(safePreview,audit,registry,candidates,lessons,shared);
const ledger=JSON.parse(fs.readFileSync(files.ledger,"utf8"));
assert.equal(ledger.introduced_lexemes.length,0,"Do not import from legacy data into the new-course introduction ledger");
console.log(JSON.stringify(result.summary,null,2));
if(mode==="--dry-run"){
 console.log("PASS: signed review sheet can be imported, but NO files were changed.");
 process.exit(0);
}
// All schemas and cross-links validated in memory above. Stage three destination
// files, keep originals for rollback if an IO failure interrupts the rename set.
const destinations=[
 [files.registry,serialise(result.registry)],
 [files.candidates,serialise(result.candidates)],
 [files.vocab,serialise(result.vocab)]
];
const backups=[];
try{
 for(const [dest,text]of destinations){
  const tmp=dest+".phase1-tmp";
  fs.writeFileSync(tmp,text,"utf8");
  backups.push({dest,old:fs.readFileSync(dest,"utf8"),tmp});
 }
 for(const {dest,tmp}of backups)fs.renameSync(tmp,dest);
}catch(e){
 for(const {dest,old,tmp}of backups){
  if(fs.existsSync(tmp))fs.unlinkSync(tmp);
  fs.writeFileSync(dest,old,"utf8");
 }
 throw e;
}
console.log("IMPORTED: signed review decisions; registry and legacy vocabulary indexes updated.");
console.log("The 130-chapter verified introduction ledger and existing application were NOT changed.");
