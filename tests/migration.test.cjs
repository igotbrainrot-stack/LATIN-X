"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const api=require("../app/20-state-v5.js");require("../content/migration-maps.js");
const {legacy_id_map:ids,legacy_vocab_map:vocab}=globalThis.TablinumMigrationMaps;
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures",p),"utf8"));
const plain=x=>JSON.parse(JSON.stringify(x));
const samples=["v4/empty.json","v4/midcourse.json","v4/custom.json","v4/hostile.json","v4/at-caps.json"];
for(const file of samples){
 const raw=read(file),result=api.migrateV4toV5(raw,ids,vocab),view=api.legacyView(result,ids);
 assert.equal(result.version,5);assert.equal(result.schema,"tablinum-state-v5");
 assert.deepEqual(plain(api.migrateV4toV5(result,ids,vocab)),plain(result));
 if(file.includes("hostile")){assert.equal({}.polluted,undefined);continue}
 for(const field of ["notes","hintLevels","vocab"]){
  assert.equal(Object.keys(view[field]).length,Object.keys(raw[field]||{}).length,file+" "+field);
 }
 for(const [k,v]of Object.entries(raw.correct||{}))if(v===true)assert.equal(view.correct[k],true,file+" "+k);
 if(file.includes("at-caps"))assert.equal(Object.keys(view.notes).length,120);
 if(file.includes("midcourse")){assert.equal(result.ui.chapterId,"legacy-ch04");assert.equal(result.ui.sel,"legacy-ch04-s004");assert.equal(Object.keys(result.deck.legacyCards).length,30)}
 if(file.includes("custom"))assert.equal(result.ui.sel,"custom:2");
}
function storage(data={},quota=Infinity){
 const values=new Map(Object.entries(data)),writes=[];
 return{getItem:k=>values.has(k)?values.get(k):null,setItem(k,v){
  if(v.length*2>quota){const e=new Error("Quota");e.name="QuotaExceededError";throw e}
  values.set(k,v);writes.push(k);
 },writes,values};
}
const original=JSON.stringify(read("v4/midcourse.json")),store=storage({[api.V4]:original});
const result=api.bootstrap(store,ids,vocab,true);
assert.equal(result.mode,"ready");
assert.equal(store.getItem(api.V4),original);
assert.equal(store.getItem(api.SNAPSHOT),original);
const reread=storage(Object.fromEntries(store.values));
assert.equal(api.bootstrap(reread,ids,vocab,true).mode,"ready");
assert.equal(reread.writes.length,0);
const missing=storage({[api.V4]:original});
assert.equal(api.bootstrap(missing,ids,vocab,false).mode,"content_missing");assert.equal(missing.writes.length,0);
const corrupt=storage({[api.V4]:original,[api.V5]:"not JSON"});
assert.equal(api.bootstrap(corrupt,ids,vocab,true).mode,"blocked");assert.equal(corrupt.writes.length,0);
assert.equal(api.bootstrap({getItem(){throw Error("denied")}},ids,vocab,true).mode,"memory");
const malformed=storage({[api.V4]:original,[api.V5]:JSON.stringify({schema:"tablinum-state-v5",version:5,ui:{chapterId:"legacy-ch01"},chapters:{},deck:{}})});
assert.equal(api.bootstrap(malformed,ids,vocab,true).mode,"blocked","Incomplete v5 record must not be accepted");
assert.equal(malformed.writes.length,0,"Malformed v5 must not be overwritten");
assert.throws(()=>api.parseBackup({app:"tablinum",version:5,state:{schema:"tablinum-state-v5",version:5,ui:{},deck:{}}},ids,vocab),/Invalid v5 backup/);
const older=api.parseBackup(read("backups/v2-envelope.json"),ids,vocab,x=>x);
assert.equal(older.questions["legacy-ch02-q001"].correct,true);
const exported=api.backupEnvelope(result.state,"2026-11-06");
const restored=api.parseBackup(exported,ids,vocab);
assert.deepEqual(plain(restored),plain(result.state));
const again=api.backupEnvelope(restored,"2026-11-07");
delete exported.exportedAt;delete again.exportedAt;assert.deepEqual(exported,again);
const log=api.migrateV4toV5({},ids,vocab);log.deck.log=Array.from({length:650},(_,n)=>({n,description:"record"}));
const budget=JSON.stringify(log).length*2-100;
assert.equal(api.persist(storage({},budget),log).state.deck.log.length,500);
assert.equal(api.persist(storage({},4),log).state.deck.log.length,650);
console.log("PASS Phase 3c: 5 v4 fixtures, 120 notes, v2/v5 backups, immutable v4, snapshot, missing content, idempotency and storage quota.");
