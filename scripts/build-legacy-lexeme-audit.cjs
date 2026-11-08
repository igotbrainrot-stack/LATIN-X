"use strict";
/**
 * Offline, deterministic glossary-to-token audit of the eight ORIGINAL Tablinum
 * lessons. No additional npm packages. Generates candidate evidence ONLY.
 *
 * node scripts/build-legacy-lexeme-audit.cjs
 * node scripts/build-legacy-lexeme-audit.cjs --check
 *
 * The existing app is deliberately untouched. Do not use the candidate count
 * as the 1,500/3,000 reviewed-lexeme count: there is NO morphological or
 * authoritative dictionary verification here.
 */
const fs=require("node:fs");
const path=require("node:path");
const {extractArray,readLegacySource}=require("./lib/extract-legacy.cjs");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const appPath=path.join(root,"index.html");
const outputPath=path.join(root,"curriculum","lexicon","legacy-token-audit.json");
const idMapPath=path.join(root,"curriculum","lexicon","legacy-id-map.json");

const source=readLegacySource(root);
const L=extractArray(source,"const L=","\n];\n\nconst shared=");
const shared=extractArray(source,"const shared=",";\nfunction norm(",0);
assert.equal(L.length,8,"Legacy lesson count must remain 8; do not silently map plan chapters");
assert.equal(shared.length>10,true);
const normalize=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const slug=s=>normalize(s).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"unknown";
const id3=n=>String(n).padStart(3,"0");
const fnv32=s=>{
 let h=2166136261;
 for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
 return (h>>>0).toString(16).padStart(8,"0");
};
const entries=new Map();
const properNames=new Set(["livia","titus","marcus","flavia"]);
const normalizeExact=s=>String(s).normalize("NFC").toLowerCase();
function register(entry,sourceId){
  assert(Array.isArray(entry)&&entry.length>=2,"Malformed glossary row "+sourceId);
  const [head,gloss,extra=""]=entry;
  assert(typeof head==="string"&&typeof gloss==="string");
  const provisionalId="legacy-lex-"+slug(head)+"-"+fnv32(gloss);
  let record=entries.get(provisionalId);
  if(!record){
    record={
      candidate_id:provisionalId,
      headword_as_in_app:head,
      original_gloss:gloss,
      editorial_status:"unverified_provisional_glossary_headword",
      is_proper_name:properNames.has(normalize(head)),
      source_rows:[],
      documented_forms:[],
      note:"Candidate from app glossary, not independently lemmatized or reviewed."
    };
    entries.set(provisionalId,record);
  }
  record.source_rows.push(sourceId);
  for(const w of [head,...String(extra||"").split(/\s+/)]){
    if(w&&!record.documented_forms.includes(w))record.documented_forms.push(w);
  }
}
shared.forEach((row,i)=>register(row,"shared-v"+id3(i+1)));
for(const [i,chapter]of L.entries()){
  chapter.v.forEach((row,k)=>register(row,"legacy-ch"+String(i+1).padStart(2,"0")+"-v"+id3(k+1)));
}
const sortedEntries=[...entries.values()].sort((a,b)=>a.candidate_id<b.candidate_id?-1:a.candidate_id>b.candidate_id?1:0);
const candidateById=new Map(sortedEntries.map(x=>[x.candidate_id,x]));
const indexes=new Map();
for(const entry of sortedEntries){
 for(const form of entry.documented_forms){
  const key=normalize(form);
  if(!indexes.has(key))indexes.set(key,new Set());
  indexes.get(key).add(entry.candidate_id);
 }
}
const wordRe=/[\p{L}\p{M}]+/gu;
const chapters=[];
const allTokens=[];
const summary={sentences:0,questions:0,tokens:0,proper_name_tokens:0,unresolved_tokens:0,ambiguous_tokens:0,macron_review_tokens:0,matched_glossary_tokens:0,unique_surfaces:0,provisional_headword_candidates:sortedEntries.filter(x=>!x.is_proper_name).length,verified_introductions:0};
const surfaces=new Set();
for(const [i,ch]of L.entries()){
 const chapterId="legacy-ch"+String(i+1).padStart(2,"0");
 const chapterRecord={
  legacy_chapter_id:chapterId,
  legacy_chapter_index:i,
  title_as_in_app:ch.name,
  proposed_course_id:null,
  id_note:"Stable legacy ID only. Do not equate with future 130-chapter syllabus or rewrite saved numeric progress automatically.",
  sentences:[],
  question_ids:ch.q.map((q,qIndex)=>chapterId+"-q"+id3(qIndex+1)),
  stats:{tokens:0,matched:0,unresolved:0,ambiguous:0,proper_names:0,macron_review:0}
 };
 summary.questions+=ch.q.length;summary.sentences+=ch.sent.length;
 for(const [j,sentence]of ch.sent.entries()){
  const sentenceId=chapterId+"-s"+id3(j+1);
  const latin=sentence[0];
  const tokens=[...(latin.match(wordRe)||[])].map((word,k)=>{
   const tokenId=sentenceId+"-t"+id3(k+1);
   const candidateIds=[...(indexes.get(normalize(word))||[])].sort();
   const proper=properNames.has(normalize(word))||candidateIds.some(id=>candidateById.get(id)?.is_proper_name);
   const exactFound=candidateIds.some(id=>candidateById.get(id).documented_forms.some(f=>normalizeExact(f)===normalizeExact(word)));
   const macronReview=!proper&&candidateIds.length>0&&!exactFound;
   const status=proper?"proper_name_not_counted":candidateIds.length===0?"unresolved_manual_review":candidateIds.length>1?"ambiguous_glossary_candidates":"glossary_match_unverified";
   const record={
    token_id:tokenId,
    sentence_id:sentenceId,
    word_position:k+1,
    surface:word,
    folded_surface:normalize(word),
    source_candidate_ids:proper?[]:candidateIds,
    status,
    macron_or_inflection_review:macronReview,
    lexeme_id:null,
    reviewer_approved:false
   };
   summary.tokens++;chapterRecord.stats.tokens++;surfaces.add(record.folded_surface);
   if(proper){summary.proper_name_tokens++;chapterRecord.stats.proper_names++;}
   else if(!candidateIds.length){summary.unresolved_tokens++;chapterRecord.stats.unresolved++;}
   else if(candidateIds.length>1){summary.ambiguous_tokens++;chapterRecord.stats.ambiguous++;}
   else {summary.matched_glossary_tokens++;chapterRecord.stats.matched++;}
   if(macronReview){summary.macron_review_tokens++;chapterRecord.stats.macron_review++;}
   allTokens.push(record);
   return record;
  });
  chapterRecord.sentences.push({sentence_id:sentenceId,legacy_sentence_index:j,latin_text:latin,english_translation_in_legacy_app:sentence[1],tokens});
 }
 chapters.push(chapterRecord);
}
summary.unique_surfaces=surfaces.size;
assert.equal(summary.sentences,67);
assert.equal(summary.questions,24);
assert.equal(chapters.length,8);
assert.equal(allTokens.length,summary.tokens);
assert.equal(allTokens.filter(x=>x.status==="glossary_match_unverified").length,summary.matched_glossary_tokens);
assert.equal(allTokens.filter(x=>x.reviewer_approved===true).length,0);
const result={
 schema_version:"tablinum-legacy-lexical-audit-v1",
 mode:"read_only_provisional_candidate_analysis",
 source:"index.html / embedded L and shared glossary arrays",
 provenance:"Existing original Tablinum app source. No external dictionary or copyrighted textbook text included.",
 non_goal:"No automatic merger between legacy chapters and 130-chapter planned course; do not mutate user progress or count provisional matches as verified introductions.",
 id_policy:{
  legacy_chapter:"legacy-ch01 through legacy-ch08",
  legacy_sentence:"legacy-ch01-s001 etc, one-based ordinal frozen to this snapshot",
  legacy_question:"legacy-ch01-q001 etc, one-based ordinal frozen to this snapshot",
  legacy_token:"legacy-ch01-s001-t001 etc, one-based word token",
  future_course:"b01-c001 etc (different namespace); require explicit human-reviewed migration mapping"
 },
 glossary_candidates:sortedEntries,
 chapters,
 summary,
 recognition_caveats:[
  "The 67 legacy Latin sentences and 24 questions remain as originally authored; the app is not reauthored here.",
  "Glossary matching ignores macrons to find candidates and may conflate homographs. Never assign a reviewed lexeme ID automatically.",
  "Some glossary heads are inflected, not dictionary lemmas. They are provisional candidates only.",
  "Provisional headword candidates are not unique reviewed lemmas and cannot satisfy the 1,500/3,000 completion gates.",
  "Original eight lessons are not identical to Chapters I–VIII in the future 130-chapter syllabus.",
  "Proper names are excluded from the planned common-lexeme target.",
  "No token is independently checked for morphology, meaning, historical nuance, source licence or pronunciation."
 ]
};
const idMap={
 schema_version:"tablinum-legacy-id-map-v1",
 source:"Unmodified index.html (v0.4.2 Manuscript Edition)",
 local_storage_key:"tablinum-source-review-v02",
 storage_schema_version:4,
 status:"snapshot_read_only_not_applied",
 format_note:"Numeric progress keys must remain compatible with old backups. A new course ID can only be mapped with explicit human review and a tested migration.",
 legacy_chapters:chapters.map(ch=>{
  const id=ch.legacy_chapter_id,index=ch.legacy_chapter_index;
  const original=L[index];
  return{
   legacy_id:id,
   original_zero_based_index:index,
   title:ch.title_as_in_app,
   latin_sentence_fingerprint_fnv32:fnv32(ch.sentences.map(s=>s.latin_text).join("\n")),
   planned_new_course_chapter_id:null,
   migration_review_status:"unmapped_do_not_guess",
   old_storage_keys:{
    chapter_selection_value:index,
    notes_and_cloze_and_confidence:String(index),
    answers_and_correct:ch.question_ids.map((q,k)=>({id:q,old_key:index+":"+k,question_text:original.q[k][0]})),
    hint_levels:ch.sentences.map((s,k)=>({sentence_id:s.sentence_id,old_key:index+":"+k}))
   }
  };
 }),
 custom_import_id:"legacy-imported-custom",
 custom_import_note:"The old ch='custom' identifier and its per-import hint keys MUST NOT be mapped onto a new standard chapter. Existing custom text remains user's local content.",
 migration_checks:[
  "Never change original numeric progress keys just because planned curriculum now uses the same chapter number.",
  "Before renumbering, identify exact original chapter/sentence/question fingerprints.",
  "Do not rewrite user backup or localStorage during audit generation.",
  "Preserve unknown fields and the ability to restore a v0.4.2 backup in a migration test.",
  "Require a one-time tested migration with backup/export before any change to the runnable app."
 ]
};
const serialized=JSON.stringify(result,null,2)+"\n";
const serializedIds=JSON.stringify(idMap,null,2)+"\n";
if(process.argv.includes("--check")){
 assert(fs.existsSync(outputPath)&&fs.existsSync(idMapPath),"Missing snapshots; run build without --check");
 assert.equal(fs.readFileSync(outputPath,"utf8"),serialized,"Lexical audit stale: regenerate with node scripts/build-legacy-lexeme-audit.cjs");
 assert.equal(fs.readFileSync(idMapPath,"utf8"),serializedIds,"Legacy ID map stale: regenerate with node scripts/build-legacy-lexeme-audit.cjs");
 console.log("PASS: deterministic lexical evidence AND stable ID map match current index.html; 8 legacy chapters, 67 sentences, 24 questions.");
}else{
 fs.mkdirSync(path.dirname(outputPath),{recursive:true});
 fs.writeFileSync(outputPath,serialized,"utf8");
 fs.writeFileSync(idMapPath,serializedIds,"utf8");
 console.log("WROTE: curriculum/lexicon/legacy-token-audit.json and legacy-id-map.json");
}
console.log(JSON.stringify(summary,null,2));
console.log("VERIFIED NEW-COURSE INTRODUCTIONS: 0 (never claim candidate matches as mastered Latin).");
