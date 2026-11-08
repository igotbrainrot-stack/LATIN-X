"use strict";
const assert=require("node:assert/strict");
const FSRS=require("../vendor/ts-fsrs.umd.js");
require("../content/migration-maps.js");
const deck=require("../app/55-review-deck.js");
const stateApi=require("../app/20-state-v5.js");
const map=globalThis.TablinumMigrationMaps.legacy_id_map;
const now=Date.parse("2026-11-05T12:00:00.000Z");
function state(){return stateApi.migrateV4toV5({version:4,ch:0},map)}
function old30(){
 const s=state();deck.setUp(s);
 s.deck.legacyCards["older-word"]={head:"mēnsa",meaning:"table",reps:8,days:30,due:now};
 return s;
}
const seeded=deck.hydrate(old30().deck.legacyCards["older-word"],now);
assert.equal(seeded.state,FSRS.State.Review,"30-day legacy interval must remain a Review state");
assert.equal(seeded.stability,30);
assert.equal(seeded.scheduled_days,30);
assert.equal(seeded.last_review.getTime(),now-30*86400000);
const preserved=old30();
const good=deck.rate(preserved,"older-word","good",now,"legacyCards");
assert(good.due>now+30*86400000,
 "Good first FSRS rating must NOT reset a legacy 30-day Review card to one day: got "+((good.due-now)/86400000)+" days");
assert.equal(good.reps,9);
assert.equal(preserved.deck.log[0].kind,"review");
const failed=old30();
const again=deck.rate(failed,"older-word","again",now,"legacyCards");
assert(again.due<now+30*86400000,"Again should lapse to a shorter schedule");
assert(again.due>now,"Again must still have a future due");
const empty=deck.hydrate({days:30,reps:0,due:now},now);
assert.equal(empty.state,FSRS.State.New,"Unsaved/new unreviewed cards stay New");
const limited=state();deck.setUp(limited);
limited.deck.settings.newDaily=1;limited.deck.settings.reviewDaily=1;
for(const name of ["a","b"])limited.deck.legacyCards["old-"+name]={head:name,meaning:name,reps:3,days:5,due:now};
for(const name of ["a","b"])limited.deck.cards["lx-"+name+":recog"]={
 head:name,meaning:name,lexemeId:"lx-"+name,direction:"recog",due:now,
 fsrs:FSRS.createEmptyCard(new Date(now)),reps:0,days:0
};
assert.equal(deck.dueQueue(limited,now).length,2,"Cap 1 new and 1 review globally, not per deck");
deck.rate(limited,"old-a","hard",now,"legacyCards");
assert.equal(deck.limits(limited,now).review,0);
assert.equal(deck.dueQueue(limited,now).filter(x=>x.kind==="review").length,0);
assert.throws(()=>deck.rate(limited,"old-b","hard",now,"legacyCards"),/limit/);
deck.rate(limited,"lx-a:recog","good",now,"cards");
assert.equal(deck.limits(limited,now).new,0);
assert.equal(deck.dueQueue(limited,now).length,0);
assert.throws(()=>deck.rate(limited,"lx-b:recog","good",now,"cards"),/limit/);
assert.equal(deck.dueQueue(limited,now+86400000).length>=1,true,"Next local day restores budget");
console.log("PASS Claude Phase6 review: 30-day legacy Good >30 days; Again lapses; empty stays New; daily 1+1 caps enforced across both decks.");
