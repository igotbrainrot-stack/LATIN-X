"use strict";
/** Tablinum Phase 1 preparation/validation, Node 22, no packages.
 * --init creates files ONLY if not present; --refresh only regenerates derived
 * source index maps; --check verifies byte-for-byte deterministic outputs.
 * No command approves a lexeme, changes the learner app or edits course ledger.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {extractArray,readLegacySource}=require("./lib/extract-legacy.cjs");
const {effectiveLessons,effectiveCloze,effectiveShared}=require("./lib/legacy-errata.cjs");
const {validateRegistry,validateCandidateMap,validateVocabMap}=require("./lib/schema.cjs");
const {initialCandidateMap,emptyRegistry,buildVocabMap,buildExtraStreams,serialise}=require("./lib/phase1-legacy.cjs");
const root=path.resolve(__dirname,"..");
const lex=path.join(root,"curriculum","lexicon");
const locations={
 audit:path.join(lex,"legacy-token-audit.json"),
 registry:path.join(lex,"lexemes.json"),
 candidates:path.join(lex,"legacy-candidate-map.json"),
 vocab:path.join(lex,"legacy-vocab-map.json"),
 extra:path.join(lex,"legacy-extra-streams.json"),
 ledger:path.join(root,"curriculum","vocabulary-introductions-130.json")
};
const args=process.argv.slice(2);
assert(args.length===1&&["--init","--refresh","--check"].includes(args[0]),
 "Usage: node scripts/build-phase1-registry.cjs --init|--refresh|--check");
const index=readLegacySource(root);
const chapters=effectiveLessons(extractArray(index,"const L=","\n];\n\nconst shared="));
const shared=effectiveShared(extractArray(index,"const shared=",";\nfunction norm(",0));
const cloze=effectiveCloze(extractArray(index,"const guidedCloze=","\n];\n// Contextual hints"));
const audit=JSON.parse(fs.readFileSync(locations.audit,"utf8"));
assert.equal(chapters.length,8);
assert.equal(audit.glossary_candidates.length,128);
assert.equal(cloze.length,8);
function load(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function writeNew(p,obj){
 assert(!fs.existsSync(p),"Refusing to overwrite "+path.relative(root,p));
 fs.mkdirSync(path.dirname(p),{recursive:true});
 fs.writeFileSync(p,serialise(obj),"utf8");
 console.log("CREATED "+path.relative(root,p));
}
if(args[0]==="--init"){
 writeNew(locations.registry,emptyRegistry());
 writeNew(locations.candidates,initialCandidateMap(audit));
}
const registry=load(locations.registry);
const candidateDoc=load(locations.candidates);
const approved=validateRegistry(registry);
const candidates=validateCandidateMap(candidateDoc,audit,approved);
const vocab=buildVocabMap(chapters,shared,audit,candidateDoc);
const extras=buildExtraStreams(chapters,cloze,audit);
const vocabKeys=validateVocabMap(vocab,candidates,approved);
assert.equal(vocabKeys.size,vocab.total_keys);
assert(extras.records.every(r=>r.counted_as_new_introduction===false));
const ledger=load(locations.ledger);
assert(Array.isArray(ledger.introduced_lexemes),"Existing verified course ledger malformed");
assert.equal(ledger.introduced_lexemes.length,0,
 "Phase 1 must not claim an introduced new-course lexeme from legacy candidates");
if(args[0]==="--init"){
 writeNew(locations.vocab,vocab);
 writeNew(locations.extra,extras);
}else if(args[0]==="--refresh"){
 // Do not overwrite human decisions, only source-derived read-only indexes.
 const writes=[[locations.vocab,vocab],[locations.extra,extras]];
 for(const [p,obj] of writes){
  const tmp=p+".phase1-tmp";
  fs.writeFileSync(tmp,serialise(obj),"utf8");
  fs.renameSync(tmp,p);
  console.log("UPDATED "+path.relative(root,p));
 }
}else{
 assert.equal(fs.readFileSync(locations.vocab,"utf8"),serialise(vocab),
 "Vocab key map stale: run --refresh (do NOT edit review decisions)");
 assert.equal(fs.readFileSync(locations.extra,"utf8"),serialise(extras),
 "Context/exercise/cloze audit stale: run --refresh");
 validateVocabMap(load(locations.vocab),candidates,approved);
 console.log("PASS: exact legacy vocab keys, collision and source stream snapshots are current.");
}
console.log(JSON.stringify({
 candidates:audit.glossary_candidates.length,
 reviewed_lexemes:[...approved.values()].filter(x=>x.status==="approved").length,
 vocab_keys:vocab.total_keys,
 approved_vocab_keys:vocab.approved_keys,
 ambiguous_vocab_keys:vocab.ambiguous_keys,
 non_intro_stream_records:extras.total_records,
 verified_course_introductions:ledger.introduced_lexemes.length
},null,2));
