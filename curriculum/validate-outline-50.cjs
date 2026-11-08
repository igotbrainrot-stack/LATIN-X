"use strict";
/* Run: node curriculum/validate-outline-50.cjs
   Content-outline validation only: no app runtime changes. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const plan=fs.readFileSync(path.join(__dirname,"CHAPTER_OUTLINE_50_DRAFT.md"),"utf8");
const audit=JSON.parse(fs.readFileSync(path.join(__dirname,"dcc-seed-audit-50.json"),"utf8"));
const rows=audit.chapters;
assert.equal(rows.length,50,"Exactly 50 chapter plans");
assert.equal(audit.course_chapters,50);
assert.equal(audit.teaching_chapters,38);
assert.equal(audit.review_chapters.length,12);
assert.equal(audit.new_lemma_ceiling,15);
assert.equal(audit.maximum_new_lemmas,570);
const review=[5,9,13,17,21,25,29,33,37,41,45,49];
assert.deepEqual(audit.review_chapters,review);
const firstSeen=new Set();
for (const [i,c] of rows.entries()){
 assert.equal(c.chapter,i+1);
 assert(c.title&&c.story&&c.grammar_focus&&c.editor_note);
 assert.equal(c.review,c.grammar_focus.startsWith("REVIEW:"));
 assert.equal(c.approx_new_word_cap,c.review?0:15);
 assert(c.core_seeds.length<=15);
 if(c.review)assert.equal(c.core_seeds.length,0,"Review adds no new DCC seed lemmas");
 for(const s of c.core_seeds){
  assert(s.lesson_form&&s.dcc_headword&&Number.isInteger(s.headword_source_line));
  assert(!firstSeen.has(s.lesson_form.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()),"Duplicate 'new' DCC lemma "+s.lesson_form);
  firstSeen.add(s.lesson_form.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase());
 }
}
assert.equal(firstSeen.size,audit.distinct_dcc_seed_lemmas);
assert(/Accusative direct objects/.test(rows[2].grammar_focus),"Chapter III accusative first");
assert(/Dative recipient/.test(rows[3].grammar_focus),"Chapter IV dative second");
const grammar=rows.filter(c=>!c.review).map(c=>c.grammar_focus.toLowerCase()).join(" | ");
for (const required of ["ablative","first-person","second-person","plural","adjective agreement","infinitive","pronouns","indirect statement","ablative absolute","deponent","comparative","4th-declension","5th-declension","subjunctive"]){
 assert(grammar.includes(required), "Missing expected grammar coverage: "+required);
}
const male=rows.flatMap(c=>[...c.core_seeds,...c.reused_core_seeds]).find(w=>w.lesson_form==="fīlius");
assert(male&&male.dcc_headword.includes("fīlia")&&male.dcc_headword.includes("fīlius"),"Combined headword alias missing");
assert(!rows.some(c=>c.core_seeds.some(w=>w.lesson_form==="edō"||w.lesson_form==="ēdō")),"Eating versus bring-forth homograph conflation");
assert(audit.manual_review_flags.some(s=>s.includes("magnus")),"Source macron discrepancy not flagged");
const tableRows=plan.split("\n").filter(l=>/^\|\s*\d{2}\s*\|/.test(l));
assert.equal(tableRows.length,50,"50 Markdown table rows must exist");
assert(fs.readFileSync(path.join(root,"index.html"),"utf8").includes('const L=['),"Runnable app must be retained");
console.log("PASS — 50 chapters, 38 teaching + 12 reviews, 15-lemma cap, grammar coverage, fīlius DCC alias, corrected homograph handling.");
console.log("NOT TESTED — linguistic quality, pronunciation, learner mastery, pictures, real browser/audio. This is an approval draft.");
