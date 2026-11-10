"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {generateForms,generateNounForms,generateVerbForms,checkForm}=require("../scripts/lib/paradigms.cjs");
const file=path.resolve(__dirname,"fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json");
const fixture=JSON.parse(fs.readFileSync(file,"utf8"));
assert.equal(fixture.review_status,"awaiting_owner_verification");
assert.deepEqual(fixture.approved_patterns,[],"No sample pattern signed by owner");
assert(fixture.specimens.length>=15);
for(const specimen of fixture.specimens){
 const generated=generateForms(specimen.lexeme);
 assert(generated.length>=10,"Expected forms for "+specimen.pattern);
 for(const [morph,surface] of specimen.checks){
  assert(generated.some(f=>f.morph===morph&&f.surface===surface),
   "Generator mismatch "+specimen.pattern+" "+surface+" "+morph);
  const proposed=checkForm({t:surface,morph},specimen.lexeme,{});
  assert.equal(proposed.ok,false,"Do not accept unreviewed regular pattern "+specimen.pattern);
  assert.equal(proposed.reason,"pattern_not_reviewed");
  const signed={reviewed:true,reviewer:"synthetic-test-only",reviewed_at:"2026-11-05"};
  assert.equal(checkForm({t:surface,morph},specimen.lexeme,{[specimen.pattern]:signed}).ok,true,
   "Fixture validation only; never saves a signed pattern");
  assert.equal(checkForm({t:surface+"x",morph},specimen.lexeme,{[specimen.pattern]:signed}).ok,false);
 }
}
const irregular={pos:"verb",forms_policy:"irregular",forms:[{surface:"est",morph:"v.sum.pres.3sg",reviewed:false}]};
assert.equal(checkForm({t:"est",morph:"v.sum.pres.3sg"},irregular,{}).reason,"irregular_form_not_reviewed");
assert.throws(()=>generateNounForms({head:"rēs",genitive:"rei",declension:5}),/genitive must end/);
const morph=(lexeme,tag)=>generateForms(lexeme).filter(f=>f.morph===tag).map(f=>f.surface);
assert.deepEqual(morph({head:"diēs",genitive:"diēī",declension:5},"n.acc.sg"),["diem"]);
assert.deepEqual(morph({head:"rēs",genitive:"reī",declension:5},"n.gen.sg"),["reī"]);
assert.deepEqual(morph({head:"rēs",genitive:"reī",declension:5},"n.acc.sg"),["rem"]);
assert.deepEqual(morph({head:"rēs",genitive:"reī",declension:5},"n.abl.sg"),["rē"]);
assert.deepEqual(morph({head:"cīvis",genitive:"cīvis",declension:3,i_stem:true},"n.abl.sg"),["cīve"]);
assert.deepEqual(morph({head:"turris",genitive:"turris",declension:3,i_stem:true,abl_i:true},"n.abl.sg"),["turrī"]);
assert.deepEqual(morph({head:"turris",genitive:"turris",declension:3,i_stem:true,abl_both:true},"n.abl.sg"),["turre","turrī"]);
assert(morph({pos:"adj",pattern:"adj-3-two",head:"fortis",feminine:"fortis",neuter:"forte",genitive:"fortis"},"adj.abl.sg").every(x=>x==="fortī"));
assert.deepEqual(morph({pos:"noun",head:"mare",genitive:"maris",declension:3,i_stem:true,gender:"n"},"n.abl.sg"),["marī"]);
assert(morph({pos:"adj",pattern:"adj-12",head:"pius",feminine:"pia",neuter:"pium"},"adj.voc.sg").includes("pie"));
assert.deepEqual(morph({pos:"noun",head:"fīlius",genitive:"fīliī",declension:2},"n.voc.sg"),["fīlī"]);
assert.throws(()=>generateVerbForms({conjugation:1,principal_parts:"amō, amāre"}),/4 principal parts/);
console.log("PASS: 15 unreviewed regular paradigm patterns, macron-sensitive form checks and approval gates.");
