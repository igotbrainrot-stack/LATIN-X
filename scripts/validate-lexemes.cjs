"use strict";
/* Phase 1 verification is NOT linguistic approval; it enforces integrity
 * and reports precisely how much human lexical review remains.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {extractArray,readLegacySource}=require("./lib/extract-legacy.cjs");
const {effectiveLessons,effectiveCloze,effectiveShared}=require("./lib/legacy-errata.cjs");
const {validateRegistry,validateCandidateMap,validateVocabMap,normalizeLegacyKey}=require("./lib/schema.cjs");
const {buildVocabMap,buildExtraStreams,serialise}=require("./lib/phase1-legacy.cjs");
const root=path.resolve(__dirname,"..");
const l=path.join(root,"curriculum","lexicon");
const load=p=>JSON.parse(fs.readFileSync(path.join(l,p),"utf8"));
const source=readLegacySource(root);
const chapters=effectiveLessons(extractArray(source,"const L=","\n];\n\nconst shared="));
const globalGlossary=effectiveShared(extractArray(source,"const shared=",";\nfunction norm(",0));
const guidedCloze=effectiveCloze(extractArray(source,"const guidedCloze=","\n];\n// Contextual hints"));
const audit=load("legacy-token-audit.json");
const registry=load("lexemes.json");
const candidateDoc=load("legacy-candidate-map.json");
const vocabDoc=load("legacy-vocab-map.json");
const extras=load("legacy-extra-streams.json");
const lexemes=validateRegistry(registry);
const candidates=validateCandidateMap(candidateDoc,audit,lexemes);
const keys=validateVocabMap(vocabDoc,candidates,lexemes);
assert.equal(audit.glossary_candidates.length,128);
assert.equal(candidateDoc.candidates.length,128);
const currentVocab=buildVocabMap(chapters,globalGlossary,audit,candidateDoc);
const currentExtras=buildExtraStreams(chapters,guidedCloze,audit);
assert.equal(serialise(vocabDoc),serialise(currentVocab),"Vocab map must reflect exactly the current app first-wins dictionary");
assert.equal(serialise(extras),serialise(currentExtras),"Additional text streams must match the eight legacy chapters");
assert.equal(vocabDoc.total_keys,keys.size);
assert.equal(extras.total_records,184);
assert.equal(extras.verified_introductions,0);
assert(extras.records.every(r=>r.counted_as_new_introduction===false&&r.tokens.every(t=>t.lexeme_id===null)));
const reviewed=[...lexemes.values()].filter(x=>x.status==="approved");
const approvedKeys=vocabDoc.keys.filter(x=>x.status==="approved");
const ownerTier=reviewed.filter(x=>x.review_tier==="owner");
const latinistTier=reviewed.filter(x=>x.review_tier==="latinist");
assert.equal(ownerTier.length+latinistTier.length,reviewed.length,"Every approved lexeme needs an explicit review tier");

const unresolved=candidateDoc.candidates.filter(x=>["pending","needs_review"].includes(x.review_state));
const rejected=candidateDoc.candidates.filter(x=>x.review_state==="rejected");
const pendingCollisions=vocabDoc.keys.filter(x=>x.status==="ambiguous");
const ledger=JSON.parse(fs.readFileSync(path.join(root,"curriculum","vocabulary-introductions-130.json"),"utf8"));
assert.equal(ledger.introduced_lexemes.length,0,"Course completion gate must not count old app glossary entries");
for(const row of audit.chapters.flatMap(c=>c.sentences.flatMap(s=>s.tokens))){
 if(row.status==="proper_name_not_counted")continue;
 for(const candidate of row.source_candidate_ids)assert(candidates.has(candidate));
}
assert(keys.has(normalizeLegacyKey("habet")));
assert(keys.has(normalizeLegacyKey("omnēs")));
assert(keys.has(normalizeLegacyKey("ad")));
const result={
 legacy_chapters:chapters.length,
 glossary_candidates:audit.glossary_candidates.length,
 reviewed_lexemes:reviewed.length,
 owner_reviewed_not_checked_by_latinist:ownerTier.length,
 latinist_verified_lexemes:latinistTier.length,
 pending_candidate_reviews:unresolved.length,
 signed_rejections:rejected.length,
 legacy_vocabulary_keys:keys.size,
 approved_legacy_vocabulary_keys:approvedKeys.length,
 ambiguous_legacy_dictionary_keys:pendingCollisions.map(x=>x.key),
 context_exercise_cloze_records:extras.total_records,
 certified_new_course_introductions:ledger.introduced_lexemes.length
};
console.log("PASS: Phase 1 source integrity, signed-review mapping policy, all 204 legacy vocabulary keys and 184 non-introduction streams.");
console.log(JSON.stringify(result,null,2));
if(process.argv.includes("--require-review-ready")){
 assert.equal(unresolved.length,0,"Human review still needed for "+unresolved.length+" glossary candidates");
 assert.equal(pendingCollisions.length,0,"Dictionary homographs remain unresolved");
 assert.equal(approvedKeys.length,keys.size,"Every original dictionary key must map to reviewed Latin");
 const allReadingTokens=audit.chapters.flatMap(c=>c.sentences.flatMap(s=>s.tokens));
 for(const t of allReadingTokens){
  if(t.status==="proper_name_not_counted")continue;
  assert(t.source_candidate_ids.some(id=>candidates.get(id).approved_lexeme_id),
    "Reading token "+t.token_id+" needs a reviewed lexeme or explicit excluded name");
 }

 // Owner-tier is valid with a documented separate drafter, but MUST remain
 // labelled "not checked by a Latinist". Independent spot checks only apply
 // to lexemes *claimed* to be Latinist-reviewed.
 for(const e of ownerTier)assert(e.drafted_by&&e.drafted_by!==e.reviewed_by,
   "Owner review requires a separate named drafter: "+e.id);
 if(latinistTier.length){
  const independentlyChecked=latinistTier.filter(x=>x.second_reviewed_by&&x.second_reviewed_by!==x.reviewed_by);
  assert(independentlyChecked.length>=Math.min(20,latinistTier.length),
    "Latinist-tier entries require up to 20 independent second-reviewer signoffs");
 }
 console.log("PASS: Phase 1 ready at recorded review tiers (owner entries NOT checked by a Latinist).");
}else{
 console.log("PENDING: owner-signed lexical decisions or qualified Latinist reviews are still required; no unsigned candidate is approved.");
}
