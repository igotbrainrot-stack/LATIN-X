"use strict";
/* Synthetic long-used profile; never use an owner's real progress in a public test. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const api=require("../app/20-state-v5.js");
require("../content/migration-maps.js");
const {legacy_id_map:ids,legacy_vocab_map:vocab}=globalThis.TablinumMigrationMaps;
const original=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures/v4/midcourse.json"),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const raw=clone(original);
// Realistic multi-year use: extensive reading notes, imported text and vocabulary,
// repetitive reviews, custom sentence corrections and superseded fields.
raw.notes={};
for(let i=0;i<160;i++)raw.notes[String(i)]=`Personal Latin notes ${i}: ā ē ī ō ū ȳ; review again. `+"nōn ".repeat(22);
raw.vocab={};
for(let i=0;i<820;i++)raw.vocab["word"+i]={head:"Verbum "+i,meaning:"sense "+i,
 days:1+(i%120),due:1690000000000+i*86400000,reps:i%40};
raw.custom="Rōma in Italiā est. Līvia in hortō sedet. ".repeat(85);
raw.customSentences=Array.from({length:100},(_,i)=>`Sententia ${i}.`);
raw.hintLevels={};raw.translations={};
for(let i=0;i<8;i++)for(let j=0;j<8;j++){
 raw.hintLevels[i+":"+j]=j%4;
 raw.translations[i+":"+j]=j%2===0;
}
raw.correct={...original.correct};raw.answers={...original.answers};
raw.readingConfidence={"0":"confident","7":"developing"};
raw.clozeAnswers={"0":"arbor","7":"vīsitābit"};raw.clozeCorrect={"0":true};
raw.extraFutureUserField={"don't discard":"nihil perit","nested":{"a":42}};
const rawString=JSON.stringify(raw);const archive=new Map([[api.V4,rawString]]);
const writes=[];
const storage={getItem:k=>archive.has(k)?archive.get(k):null,
 setItem(k,v){writes.push(k);archive.set(k,v)}};
const out=api.bootstrap(storage,ids,vocab,true);
assert.equal(out.mode,"ready");
assert.equal(archive.get(api.V4),rawString,"v4 must remain byte-identical");
assert.equal(archive.get(api.SNAPSHOT),rawString,"snapshot must preserve exact original bytes");
assert.deepEqual(writes,[api.SNAPSHOT,api.V5]);
assert.equal(Object.keys(out.state.deck.legacyCards).length,820,"no artificial legacy vocabulary cap");
assert.equal(Object.keys(out.state.migratedFrom.unknown).some(k=>k==="extraFutureUserField"),true);
const projected=api.legacyView(out.state,ids);
assert.deepEqual(clone(projected.notes),raw.notes,"all 160 notes, including unknown chapter keys, must survive");
assert.equal(Object.keys(projected.vocab).length,820);
assert.equal(projected.custom,raw.custom);
assert.deepEqual(projected.customSentences,raw.customSentences);
const exported=api.backupEnvelope(out.state,"2026-11-06T00:00:00.000Z");
const restored=api.parseBackup(exported,ids,vocab);
assert.deepEqual(restored,out.state,"export/import must be lossless");
const roundtrip=api.legacyView(restored,ids);
assert.deepEqual(clone(roundtrip.notes),raw.notes);
assert.equal(api.bootstrap(storage,ids,vocab,true).mode,"ready");
assert.deepEqual(writes,[api.SNAPSHOT,api.V5],"reopen must not write or re-migrate");
const v5Bytes=archive.get(api.V5);
const corruptStorage={getItem(k){return k===api.V5?"{broken":archive.get(k)},setItem(){throw Error("must not write")}};
assert.equal(api.bootstrap(corruptStorage,ids,vocab,true).mode,"blocked","broken v5 should fail closed");
assert.equal(archive.get(api.V5),v5Bytes,"failure must not mutate backup or good v5");
console.log("PASS Phase 12: 160 detailed notes, 820 legacy cards, imported sentences, non-mapped keys, v4 byte lock, snapshot, reopen and v5 backup roundtrip.");