"use strict";
const assert=require("node:assert/strict");
const FSRS=require("../vendor/ts-fsrs.umd.js");
require("../content/migration-maps.js");
const deck=require("../app/55-review-deck.js");
const stateApi=require("../app/20-state-v5.js");
const maps=globalThis.TablinumMigrationMaps;
const state=stateApi.migrateV4toV5({version:4,ch:0,vocab:{"hortus":{head:"hortus",meaning:"garden",days:1,due:0,reps:4}}},maps.legacy_id_map,maps.legacy_vocab_map);
assert.equal(deck.VERSION,"ts-fsrs@5.4.2");
assert.equal(Object.keys(state.deck.legacyCards).length,1);
deck.setUp(state);assert.equal(state.deck.settings.retention,0.9);
const old=state.deck.legacyCards.hortus;
const rated=deck.rate(state,"hortus","good",Date.parse("2026-11-05T12:00:00.000Z"),"legacyCards");
assert(rated.fsrs&&rated.fsrs.stability>=0);
assert.equal(rated.reps,5);
assert.equal(state.deck.log.length,1);
assert.equal(state.deck.cards["hortus:recog"],undefined,"Unsigned card MUST NOT become approved");
const v4=stateApi.legacyView(state,maps.legacy_id_map);
const updated=stateApi.updateFromLegacy(state,v4,maps.legacy_id_map,maps.legacy_vocab_map);
assert.deepEqual(updated.deck.legacyCards.hortus.fsrs,rated.fsrs,"Preserve genuine FSRS metadata through old UI");
assert.deepEqual(updated.deck.log,state.deck.log,"Preserve full FSRS log");
const restored=JSON.parse(JSON.stringify(updated));
const scheduled=deck.rate(restored,"hortus","hard",restored.deck.legacyCards.hortus.due+60000,"legacyCards");
assert(scheduled.due>0);
assert.equal(restored.deck.log.length,2);
assert.equal(restored.deck.legacyCards.hortus.fsrs.state!==undefined,true);
assert.throws(()=>deck.rate(restored,"hortus","not-a-rating"),/Unknown review grade/);
const approvedLex={id:"lx-hortus-garden",head:"hortus",status:"approved",first_chapter:1,
 senses:[{gloss_la:"locus arborum",gloss_en:"garden"}]};
const newChapter={id:"b01-c001",chapter:1,book:1,status:"approved",new_lexemes_declared:[approvedLex.id],
 segments:[{sentences:[{id:"b01-c001-s001",text_la:"Hortus magnus est.",tokens:[{t:"Hortus",lx:approvedLex.id}]}]}]};
assert.equal(deck.createApprovedCards(restored,{...newChapter,status:"draft"},{lexemes:[approvedLex]},true),0,"Draft cannot add cards");
assert.equal(deck.createApprovedCards(restored,newChapter,{lexemes:[{...approvedLex,status:"draft"}]},true),0,"Unapproved lexeme cannot add");
assert.equal(deck.createApprovedCards(restored,newChapter,{lexemes:[approvedLex]},false),0,"Viewing a lesson is not completing it");
assert.equal(deck.createApprovedCards(restored,newChapter,{lexemes:[approvedLex]},true),1);
assert.equal(deck.createApprovedCards(restored,newChapter,{lexemes:[approvedLex]},true),0,"Idempotent card creation");
const item=restored.deck.cards["lx-hortus-garden:recog"];
assert(item&&item.sentenceId==="b01-c001-s001"&&item.sourceText==="Hortus magnus est.");
assert.equal(item.sourceHighlight,"Hortus");
const exposures=new Set(),sentence=newChapter.segments[0].sentences[0];
globalThis.TablinumCompiledContent={lexicon:{lexemes:[approvedLex]}};
assert.equal(deck.seenSentence(restored,newChapter,sentence,exposures),1);
assert.equal(deck.seenSentence(restored,newChapter,sentence,exposures),0,"Once per sentence per session");
assert.equal(deck.seenSentence(restored,{...newChapter,status:"draft"},sentence,new Set()),0);
assert.equal(restored.exposure[approvedLex.id].seen,1);
let m=deck.metrics(restored,[approvedLex],1);
assert.deepEqual([m.introduced,m.encountered,m.recognised,m.productive],[1,1,0,0]);
item.fsrs.state=FSRS.State.Review;item.fsrs.stability=21.3;
m=deck.metrics(restored,[approvedLex],1);assert.equal(m.recognised,1);assert.equal(m.productive,0);
restored.speakingUse[approvedLex.id]=2;
assert.equal(deck.metrics(restored,[approvedLex],1).productive,1);
assert.equal(deck.metrics(restored,[approvedLex],0).introduced,0);
assert.equal(deck.metrics(restored,[{...approvedLex,status:"draft"}],1).encountered,0);
restored.deck.settings.reviewDaily=1000;
for(let i=0;i<503;i++){
  const timestamp=Date.parse("2035-01-01T12:00:00.000Z")+i*60000; // always after the synthetic prior review
  restored.deck.legacyCards.hortus.due=timestamp; // synthetic fixture: every review is now due
  deck.rate(restored,"hortus","again",timestamp,"legacyCards");
}
assert.equal(restored.deck.log.length,500);
console.log("PASS Phase6: pinned FSRS, unsigned legacy card preserved, exact reviewer-only creation, session exposure, independent counters, log bound and old v5 roundtrip.");
