"use strict";
const assert=require("node:assert/strict");
const api=require("../app/20-state-v5.js");require("../content/migration-maps.js");
const ids=globalThis.TablinumMigrationMaps.legacy_id_map;
const fake={keys:[{key:"amo",status:"approved",approved_lexeme_id:"lx-amo-love"}]};
const original={version:4,ch:0,vocab:{amo:{head:"amō",meaning:"love",days:5,due:123456,reps:6}}};
const v5=api.migrateV4toV5(original,ids,fake);
assert.equal(Object.keys(v5.deck.cards).length,1);
assert.equal(Object.keys(v5.deck.legacyCards).length,0);
const view=api.legacyView(v5,ids);
const saved=api.updateFromLegacy(v5,view,ids,fake);
assert.equal(Object.keys(saved.deck.cards).length,1);
assert.equal(Object.keys(saved.deck.legacyCards).length,0,"Approved card must never duplicate into legacyCards");
const removed=api.updateFromLegacy(saved,{...view,vocab:{}},ids,fake);
assert.equal(Object.keys(removed.deck.cards).length,0);
assert.equal(Object.keys(removed.deck.legacyCards).length,0);
for(const [name,code]of [["QuotaExceededError",0],["NS_ERROR_DOM_QUOTA_REACHED",0],["UnknownError",22]]){
 const large=api.migrateV4toV5({},ids,null);
 large.deck.log=Array.from({length:650},(_,i)=>({i}));
 const threshold=JSON.stringify(large).length*2-50;
 const storage={setItem(k,s){if(s.length*2>=threshold){const e=Error("storage full");e.name=name;e.code=code;throw e}},getItem(){return null}};
 const r=api.persist(storage,large);
 assert.equal(r.ok,true,"500-item retry must work for "+name);
 assert.equal(r.state.deck.log.length,500);
}
console.log("PASS Claude Phase3c review fixes: approved-card identity, reset deletion, Firefox quota and code 22.");
