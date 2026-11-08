"use strict";
/* Claude curriculum review v3: no lesson text or runtime change. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const dir=__dirname;
const plan=JSON.parse(fs.readFileSync(path.join(dir,"vocabulary-budgets-130.json"),"utf8"));
const md=fs.readFileSync(path.join(dir,"CURRICULUM_130_MASTER_PLAN.md"),"utf8");
const review=fs.readFileSync(path.join(dir,"reviews","TABLINUM_REVIEW_20261105.md"),"utf8");
const c=n=>plan.chapters[n-1];
const include=(n,field,part)=>assert(c(n)[field].includes(part),"Chapter "+n+" "+field+" missing "+part);
assert.equal(plan.version,"2026-11-05-outline-v3");
assert.equal(plan.chapters.length,130);
assert.deepEqual(plan.cumulative_milestones.map(x=>x.cumulative),[500,1532,3036]);
assert.equal(plan.chapters.filter(x=>x.review).length,28);
assert(review.includes("Pronouns are missing (new, P1)"),"Original follow-up review must be archived.");
include(11,"grammar_focus","mē/tē");
include(14,"secondary_focus","meus/mea/meum");
include(14,"secondary_focus","tuus/tua/tuum");
include(15,"secondary_focus","hic/haec/hoc");
include(15,"secondary_focus","ille/illa/illud");
assert(c(15).source_seed_lemmas.includes("hic")&&c(15).source_seed_lemmas.includes("ille"),"Near/far candidate lemmas first introduced in Book I");
include(71,"grammar_focus","consolidated paradigm");
include(16,"grammar_focus","nōs/vōs");
include(20,"grammar_focus","is / ea / id");
include(20,"grammar_focus","eius");
include(20,"lesson_sequence_notes","eum / eam");
include(26,"secondary_focus","sē");
include(26,"secondary_focus","suus");
include(26,"secondary_focus","eius");
assert(c(20).required_instructional_forms.includes("eius"));
assert(c(26).required_instructional_forms.includes("suus"));
assert.equal(c(11).budget_new_lemmas,12);
assert.equal(c(20).budget_new_lemmas,13);
include(18,"grammar_focus","vocative");
include(18,"lesson_sequence_notes","Mārce");
include(18,"lesson_sequence_notes","Tīte");
include(54,"grammar_focus","plural imperatives");
include(54,"grammar_focus","vocative direct-address review");
assert.deepEqual(c(54).required_instructional_forms,["venīte","audīte","portāte"]);
include(42,"grammar_focus","Accusative + infinitive");
include(81,"grammar_focus","eum/eam");
include(81,"grammar_focus","sē");
assert(!c(81).grammar_focus.includes("present infinitive"));
include(82,"grammar_focus","perfect infinitive");
include(83,"grammar_focus","Future active infinitive");
const titles=new Map([
 [76,"Timeō nē nāvis discēdat"],
 [78,"Sī tempus habērem"],
 [85,"Recēnsiō XIX — Rūmōrēs"],
 [94,"Vōx senis"],
 [120,"Recēnsiō XXVI — Cōnsilium"]
]);
for(const [n,t]of titles)assert.equal(c(n).title,t,"Chapter "+n+" title");
const badSeedWords=["tenēo","sedēo","manēo","surgo","scribō","sentīō","laborō"];
const goodSeedWords=["teneō","sedeō","maneō","surgō","scrībō","sentiō","labōrō"];
const allSeeds=plan.chapters.flatMap(x=>x.source_seed_lemmas);
for(const word of badSeedWords)assert(!allSeeds.includes(word),"Incorrect seed spelling: "+word);
for(const word of goodSeedWords)assert(allSeeds.includes(word),"Missing corrected seed: "+word);
assert(plan.pronoun_count_policy.includes("is/eum/eius"));
const oldSeeds=new Set();
for(const chapter of plan.chapters){
 assert(chapter.source_seed_lemmas.length<=chapter.budget_new_lemmas,"Too many seed candidates chapter "+chapter.chapter);
 if(chapter.review)assert.equal(chapter.budget_new_lemmas,0);
 for(const word of chapter.source_seed_lemmas){
  const key=word.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  assert(!oldSeeds.has(key),"Repeated new-lemma seed: "+word);
  oldSeeds.add(key);
 }
 const row="| "+String(chapter.chapter).padStart(3,"0")+" | "+chapter.title+" | "+chapter.story+" | "+chapter.grammar_focus+" | "+chapter.budget_new_lemmas+" | "+chapter.cumulative_target+" |";
 assert(md.includes(row),"Master chapter "+chapter.chapter+" disagrees with JSON");
}
assert(md.includes("secondary")&&md.includes("sē")&&md.includes("suus"),"The master plan must describe the secondary reflexive-forms lesson.");
assert(plan.chapters.slice(0,10).every(x=>x.target_running_tokens[0]>=250&&x.target_running_tokens[1]<=450));
assert.deepEqual(plan.books.map(x=>x.target),[500,1032,1504]);
assert.equal(plan.chapters[129].cumulative_target,3036);
console.log("PASS: v3 pronouns, commands, ACI distinctness, corrected macrons, 130-row plan sync and vocabulary targets.");
console.log("NOT TESTED: authored Latin, actual exposures, oral proficiency, human macron review, migration or browser.");
