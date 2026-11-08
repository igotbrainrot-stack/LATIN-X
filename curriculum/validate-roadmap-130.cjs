"use strict";
/* Tablinum 130-chapter course plan structural/real-vocabulary validator.
   Node 20+, no packages, no browser. Default checks targets, not learner mastery.
   Strict flags (--require-introduced-1500 / --require-introduced-3000)
   fail until approved lexical IDs are evidenced in published lesson passages. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const dir=__dirname,root=path.resolve(dir,"..");
const plan=JSON.parse(fs.readFileSync(path.join(dir,"vocabulary-budgets-130.json"),"utf8"));
const ledger=JSON.parse(fs.readFileSync(path.join(dir,"vocabulary-introductions-130.json"),"utf8"));
const rows=plan.chapters;
const sum=a=>a.reduce((v,x)=>v+x,0);
assert.equal(plan.status,"planned_targets_only_not_introduced");
assert.equal(rows.length,130,"130 chapters, one number each");
assert.deepEqual(plan.books.map(x=>x.target),[500,1032,1504]);
assert.deepEqual(plan.books.map(x=>x.chapters),[50,40,40]);
assert.deepEqual(plan.books.map(x=>x.teaching),[38,32,32]);
assert.deepEqual(plan.books.map(x=>x.reviews),[12,8,8]);
assert.deepEqual(plan.cumulative_milestones,[
 {chapter:50,cumulative:500},
 {chapter:90,cumulative:1532},
 {chapter:130,cumulative:3036}
]);
let total=0, lastNonReview=-1;
const reviewSet=new Set(plan.reviews);
for (const [i,c] of rows.entries()){
 assert.equal(c.chapter,i+1);
 assert.equal(c.book,c.chapter<=50?1:c.chapter<=90?2:3);
 assert(typeof c.title==="string"&&c.title.length>=4); // Short Latin titles such as Cēna are valid
 assert(typeof c.story==="string"&&c.story.length>=25);
 assert(typeof c.grammar_focus==="string"&&c.grammar_focus.length>=8);
 assert(typeof c.communication_task==="string"&&c.communication_task.length>=25);
 assert(Array.isArray(c.target_running_tokens)&&c.target_running_tokens[0]<c.target_running_tokens[1]);
 assert(Number.isInteger(c.lesson_segments)&&c.lesson_segments>=2);
 assert(Number.isInteger(c.budget_new_lemmas)&&c.budget_new_lemmas>=0);
 assert.equal(c.review,reviewSet.has(c.chapter),"review flag matches planned review positions");
 if(c.review){
  assert.equal(c.budget_new_lemmas,0,"review chapters introduce no new lemma budget");
  assert(/^REVIEW:/.test(c.grammar_focus),"review grammar focus must not introduce unseen syntax");
 }else{
  assert(c.budget_new_lemmas>0,"teaching chapters must have a vocabulary target");
  if(c.book===1)assert(c.budget_new_lemmas<=15,"foundation maximum 15 new lemmas");
  if(lastNonReview!==-1)assert(c.chapter-lastNonReview<=2,"long gap in teaching chapters");
  lastNonReview=c.chapter;
 }
 total+=c.budget_new_lemmas;
 assert.equal(c.cumulative_target,total,"chapter cumulative sum");
}
assert.equal(sum(plan.books.map(b=>b.target)),3036);
assert.equal(rows[89].cumulative_target,1532);
assert.equal(rows[129].cumulative_target,3036);
assert(rows[0].budget_new_lemmas<=6,"First chapter should begin especially slowly");
assert(rows[50].budget_new_lemmas<=20,"Developing course starts with a mild increase");
assert(rows[128].budget_new_lemmas>=45,"Advanced story budgets grow with prose complexity");
assert.equal(ledger.schema_version,1);
assert(Array.isArray(ledger.introduced_lexemes));
assert.equal(ledger.generated_by,'scripts/compile-content.cjs',
 'The reviewed introductions ledger must be compiler-generated, never hand-authored');
// Detect a manually edited or stale ledger even when this validator is run alone.
const {compile}=require('../scripts/compile-content.cjs');
const fresh=JSON.parse(compile({root}).outputs.get('curriculum/vocabulary-introductions-130.json'));
assert.equal(ledger.generated_from_hash,fresh.generated_from_hash,
 'Introductions ledger source hash is stale: rerun the compiler');
assert.deepEqual(ledger.introduced_lexemes,fresh.introduced_lexemes,
 'Introductions ledger does not match tagged approved first occurrences');
const known=new Map(),byChapter=new Map();
for(const entry of ledger.introduced_lexemes){
 assert(typeof entry.lexeme_id==="string"&&entry.lexeme_id.length>1,"Stable disambiguated lemma ID required");
 assert(!known.has(entry.lexeme_id),"Duplicate lexeme ID "+entry.lexeme_id);
 for(const key of ["headword","english_gloss","lesson_path","sentence_id","source_reference","reviewed_by","reviewed_at","part_of_speech"]){
  assert(typeof entry[key]==="string"&&entry[key].trim().length>0,"Missing approved "+key+" for "+entry.lexeme_id);
 }
 assert(/^\d{4}-\d\d-\d\d$/.test(entry.reviewed_at),"Reviewer date missing");
 assert(["owner","latinist"].includes(entry.review_tier),
   "Approved new-course word must explicitly identify owner/latinist review tier");
 if(entry.review_tier==="owner"){
  assert(typeof entry.drafted_by==="string"&&entry.drafted_by.trim()&&entry.drafted_by!==entry.reviewed_by,
    "Owner-tier course introduction needs separate drafter and signer");
 }

 assert(Number.isInteger(entry.first_chapter)&&entry.first_chapter>=1&&entry.first_chapter<=130);
 const chapter=rows[entry.first_chapter-1];
 assert(!chapter.review,"A new lexeme may not first occur in review chapter");
 assert(entry.lesson_path.startsWith("lessons/")&&entry.lesson_path.endsWith(".json")&&!entry.lesson_path.includes(".."),"Relative published lesson path required");
 const file=path.join(root,entry.lesson_path);
 assert(fs.existsSync(file),"Actual authored lesson missing: "+entry.lesson_path);
 const lesson=JSON.parse(fs.readFileSync(file,"utf8"));
 assert.equal(lesson.chapter,entry.first_chapter);
 assert(Array.isArray(lesson.sentences),"Lesson must contain approved, tokenized sentences");
 const sentence=lesson.sentences.find(x=>x.id===entry.sentence_id);
 assert(sentence&&typeof sentence.text_la==="string"&&sentence.text_la.trim(),"First contextual Latin sentence missing");
 assert(Array.isArray(sentence.tokens)&&sentence.tokens.some(t=>t.lexeme_id===entry.lexeme_id),"Lemma must occur as a tagged Latin word in its introduction sentence");
 // Proper names do not count. Keep a separate annotation category.
 assert(entry.part_of_speech!=="proper_name","Proper names excluded from vocabulary milestones");
 known.set(entry.lexeme_id,entry);
 byChapter.set(entry.first_chapter,(byChapter.get(entry.first_chapter)||0)+1);
}
for(const [chapter,n] of byChapter.entries()){
 assert(n<=rows[chapter-1].budget_new_lemmas,"Verified new-lemma count exceeds planned chapter allowance at "+chapter);
}
const reached90=[...known.values()].filter(v=>v.first_chapter<=90).length;
const reached130=known.size;
const tierCount=(tier,limit)=>[...known.values()].filter(v=>v.review_tier===tier&&v.first_chapter<=limit).length;
const owner90=tierCount("owner",90),latinist90=tierCount("latinist",90);
const owner130=tierCount("owner",130),latinist130=tierCount("latinist",130);
assert.equal(reached90,owner90+latinist90);
assert.equal(reached130,owner130+latinist130);
const report={plan:"VALID",books:plan.books,planned_by_90:1532,planned_by_130:3036,
 approved_introduced_by_90:reached90,approved_introduced_by_130:reached130,
 owner_reviewed_not_latinist_checked_by_90:owner90,owner_reviewed_not_latinist_checked_by_130:owner130,
 latinist_verified_by_90:latinist90,latinist_verified_by_130:latinist130,
 book_ii_1500_total_approved:reached90>=1500,book_iii_3000_total_approved:reached130>=3000,
 caveat:"Owner-reviewed words are NOT Latinist-verified. Targets are allocations until authored tagged lessons support them."};
console.log("PASS — 130-chapter structure, lexical allocation, reviews, reading tiers, ledger integrity.");
console.log(JSON.stringify(report,null,2));
if(process.argv.includes("--require-introduced-1500")){
 assert(reached90>=1500,"GATE NOT MET: <1,500 total approved words by chapter 90; owner-tier "+owner90+", Latinist-tier "+latinist90+". Owner-tier is NOT Latinist-verified.");
}
if(process.argv.includes("--require-introduced-3000")){
 assert(reached130>=3000,"GATE NOT MET: <3,000 total approved words by chapter 130; owner-tier "+owner130+", Latinist-tier "+latinist130+". Owner-tier is NOT Latinist-verified.");
}

if(process.argv.includes("--require-latinist-1500"))assert(latinist90>=1500,
 "GATE NOT MET: fewer than 1500 Latinist-verified by chapter 90; owner-tier excluded");
if(process.argv.includes("--require-latinist-3000"))assert(latinist130>=3000,
 "GATE NOT MET: fewer than 3000 Latinist-verified by chapter 130; owner-tier excluded");
