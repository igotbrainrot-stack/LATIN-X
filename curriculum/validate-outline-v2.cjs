"use strict";
/* Structural guardrails for Claude's curriculum review fixes.
   node curriculum/validate-outline-v2.cjs
   This cannot prove natural Latin accuracy or actual vocabulary acquisition. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const dir=__dirname;
const data=JSON.parse(fs.readFileSync(path.join(dir,"vocabulary-budgets-130.json"),"utf8"));
const audit=JSON.parse(fs.readFileSync(path.join(dir,"dcc-seed-audit-50.json"),"utf8"));
const master=fs.readFileSync(path.join(dir,"CURRICULUM_130_MASTER_PLAN.md"),"utf8");
const c=n=>data.chapters[n-1];
const has=(n,x)=>assert(c(n).grammar_focus.toLowerCase().includes(x.toLowerCase()),"Ch "+n+" must cover "+x);
const title=(n,x)=>assert.equal(c(n).title,x,"Ch "+n+" title mismatch");
const sum=x=>x.reduce((a,b)=>a+b,0);
assert.equal(data.chapters.length,130);
assert.deepEqual(data.books.map(x=>x.target),[500,1032,1504]);
assert.deepEqual(data.cumulative_milestones.map(x=>x.cumulative),[500,1532,3036]);
assert.equal(audit.planned_new_lemmas_foundation,500);
assert.equal(audit.maximum_new_lemmas,570);
assert.equal(sum(audit.chapters.map(x=>x.v2_target_budget)),500);
assert.equal(c(1).budget_new_lemmas,6);
assert(/glossed-only/i.test(data.authentic_excerpt_gloss_policy),"Excerpt-only vocabulary must not be counted as introduced");
assert(/600-word/.test(data.book_iii_admission),"Book III entry needs actual reading and speaking checks");
const sourceSeeds=new Map();
for(const c0 of data.chapters){
 for(const word of c0.source_seed_lemmas){
  const lemma=word.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  assert(!sourceSeeds.has(lemma),"Duplicate first-introduction seed: "+word+" previously Ch "+sourceSeeds.get(lemma));
  sourceSeeds.set(lemma,c0.chapter);
 }
}
assert.deepEqual(c(35).source_seed_lemmas,["omnis","celer"]);
assert.deepEqual(c(36).source_seed_lemmas,["quī","ostendō"]);
assert.deepEqual(c(48).source_seed_lemmas,["manus","exercitus","frūctus","senātus","gradus"]);
assert.deepEqual(c(56).source_seed_lemmas,["rēs","spēs","fidēs","faciēs","aciēs"]);
for(let i=1;i<=50;i++){
 const t=c(i);
 assert(t.budget_new_lemmas<=15);
 assert(t.source_seed_lemmas.length<=t.budget_new_lemmas,"Ch "+i+" has too many selected DCC seed candidates");
}
for(let i=1;i<=10;i++){
 const {target_running_tokens:t,lesson_segments:parts}=c(i);
 assert(t[0]>=250&&t[1]<=450&&parts>=2&&parts<=3,"Ch "+i+" must be 250–450 words, 2–3 lectiones");
}
assert(c(50).target_running_tokens[0]>=600);
assert(c(51).target_running_tokens[0]<=850,"Book II on-ramp must be gentle");
// P1 grammar dependencies repaired in the actual chapter sequence.
has(34,"3rd-declension"); has(35,"third-declension adjective");has(36,"relative clauses");
has(38,"passive");has(39,"passive");has(40,"participle");has(43,"future active participle");
has(44,"deponent");has(46,"comparative");has(47,"superlative");
has(48,"fourth-declension");has(50,"ut / nē");has(50,"present subjunctive");
has(51,"ablative of means");has(52,"ablative of cause");has(54,"vocative");
has(56,"fifth-declension");has(58,"adverbs");has(59,"imperfect passive");
has(61,"future passive");has(62,"impersonal");has(64,"pluperfect passive");
has(67,"primary-sequence");has(68,"primary/secondary sequence");
has(71,"demonstratives");has(72,"relative pronouns");has(73,"ablative absolute");
has(74,"cum + imperfect");has(76,"fear clauses");has(78,"imperfect subjunctive");
has(79,"pluperfect subjunctive");has(88,"irregular verbs");has(107,"supine");
assert(c(43).chapter<c(73).chapter);
assert(!/ablative absolute/i.test(c(43).grammar_focus));
assert(!/sequor|sequitur/i.test(c(40).story),"Deponent introduced before chapter 44");
assert(!c(40).source_seed_lemmas.some(v=>/sequor/i.test(v)));
assert(!/vēnisset|venisset/.test(c(74).title),"Chapter 74 must not use pluperfect subjunctive taught at 79");
has(99,"consolidation");
title(18,"Venī hūc!"); title(20,"Is librum habet");
title(28,"Epistula iam vēnerat");title(54,"Mercātōrēs, audīte!");
title(62,"Cōnsilium medicī");title(63,"Sī pluit");
title(75,"Recēnsiō XVII — Diēs fēstus");
title(81,"Nūntius dīxit eum venīre");
title(84,"Audīvit iānuam aperīrī");
title(88,"Volō īre, sed nōn possum");
title(91,"Fābula dē fonte");title(93,"Līs dē agrō");
title(96,"In thermīs");title(103,"Epistula senātōris");
title(112,"Rēs parvae, magnae cūrae");title(119,"Cōnsilium acceptum");
assert(!data.chapters.some(x=>/Agerī dēspōnsī|In thermae|Quō meliore viā\?/.test(x.title)));
assert.equal(data.chapters.filter(x=>x.review).length,28,"All review chapters remain unchanged");
assert.equal(sum(data.chapters.map(x=>x.budget_new_lemmas)),3036);
for(const c0 of data.chapters){
 const row="| "+String(c0.chapter).padStart(3,"0")+" | "+c0.title+" | "+c0.story+" | "+c0.grammar_focus+" | "+c0.budget_new_lemmas+" | "+c0.cumulative_target+" |";
 assert(master.includes(row),"Master markdown out of sync at chapter "+c0.chapter);
}
assert(master.includes("250–450"),"Master must acknowledge raised early reading targets");
console.log("PASS: Claude outline v2 grammar dependencies, Latin title corrections, early 250–450-word targets, 500-vs-570 budgets, and synced 130-row master plan.");
console.log("NOT TESTED: expert Latin accuracy, reading or speaking competence, real prose repetition, audio, illustrations.");
