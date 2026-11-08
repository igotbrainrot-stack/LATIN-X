"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const audit=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/legacy-token-audit.json"),"utf8"));
const ids=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/legacy-id-map.json"),"utf8"));
const course=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
const introduced=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-introductions-130.json"),"utf8"));
assert.equal(audit.schema_version,"tablinum-legacy-lexical-audit-v1");
assert.equal(ids.schema_version,"tablinum-legacy-id-map-v1");
assert.equal(audit.summary.sentences,67);
assert.equal(audit.summary.questions,24);
assert.equal(audit.summary.tokens,255);
assert.equal(audit.summary.verified_introductions,0);
assert.equal(ids.legacy_chapters.length,8);
const names=new Set(),tokenIds=new Set(),sentences=new Set(),questions=new Set();
for(const [i,chapter] of audit.chapters.entries()){
 const expected="legacy-ch"+String(i+1).padStart(2,"0");
 assert.equal(chapter.legacy_chapter_id,expected);
 assert.equal(chapter.legacy_chapter_index,i);
 assert.equal(chapter.proposed_course_id,null);
 const idChapter=ids.legacy_chapters[i];
 assert.equal(idChapter.legacy_id,expected);
 assert.equal(idChapter.original_zero_based_index,i);
 assert.equal(idChapter.planned_new_course_chapter_id,null);
 assert.equal(idChapter.migration_review_status,"unmapped_do_not_guess");
 assert.equal(idChapter.old_storage_keys.chapter_selection_value,i);
 assert.equal(idChapter.old_storage_keys.notes_and_cloze_and_confidence,String(i));
 assert.equal(chapter.question_ids.length,3);
 for(const [j,q] of chapter.question_ids.entries()){
  assert(!questions.has(q));questions.add(q);
  assert.equal(q,expected+"-q"+String(j+1).padStart(3,"0"));
  assert.equal(idChapter.old_storage_keys.answers_and_correct[j].old_key,i+":"+j);
  assert.equal(idChapter.old_storage_keys.answers_and_correct[j].id,q);
 }
 for(const [k,s] of chapter.sentences.entries()){
  assert(!sentences.has(s.sentence_id));sentences.add(s.sentence_id);
  assert.equal(s.sentence_id,expected+"-s"+String(k+1).padStart(3,"0"));
  assert.equal(idChapter.old_storage_keys.hint_levels[k].old_key,i+":"+k);
  for(const [wordIndex,t] of s.tokens.entries()){
   assert.equal(t.word_position,wordIndex+1);
   assert.equal(t.sentence_id,s.sentence_id);
   assert(t.token_id.endsWith("-t"+String(wordIndex+1).padStart(3,"0")));
   assert(!tokenIds.has(t.token_id));tokenIds.add(t.token_id);
   assert.equal(t.lexeme_id,null);
   assert.equal(t.reviewer_approved,false);
   if(t.status==="proper_name_not_counted")assert.equal(t.source_candidate_ids.length,0);
   if(t.status==="unresolved_manual_review")assert.equal(t.source_candidate_ids.length,0);
   if(t.status==="ambiguous_glossary_candidates")assert(t.source_candidate_ids.length>1);
  }
 }
}
assert.equal(questions.size,24);
assert.equal(sentences.size,67);
assert.equal(tokenIds.size,255);
assert.equal(audit.glossary_candidates.length,128);
assert.equal(audit.summary.proper_name_tokens,48);
assert.equal(audit.summary.ambiguous_tokens,9);
assert.equal(audit.summary.unresolved_tokens,0);
assert.equal(audit.summary.matched_glossary_tokens,198);
assert.equal(ids.local_storage_key,"tablinum-source-review-v02");
assert.equal(ids.storage_schema_version,4);
assert.deepEqual(course.cumulative_milestones.map(x=>x.cumulative),[500,1532,3036]);
assert.equal(introduced.introduced_lexemes.length,0,"Do NOT populate verified ledger from provisional matches");
console.log("PASS: 8 stable legacy chapter IDs, 67 sentence IDs, 24 question IDs, 255 token IDs and numeric saved-state key compatibility.");
console.log("PASS: glossary candidate audit properly separates 9 ambiguous forms, 48 proper-name tokens and ZERO verified introductions.");
console.log("NOT TESTED: morphology, senses, macrons, Latinist sign-off, actual migration or browser/audio.");
