"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ids=read("curriculum/lexicon/legacy-id-map.json"),vocab=read("curriculum/lexicon/legacy-vocab-map.json");
const payload={legacy_id_map:{schema_version:ids.schema_version,legacy_chapters:ids.legacy_chapters.map(c=>({
 legacy_id:c.legacy_id,original_zero_based_index:c.original_zero_based_index,
 old_storage_keys:{
  answers_and_correct:c.old_storage_keys.answers_and_correct.map(q=>({old_key:q.old_key,id:q.id})),
  hint_levels:c.old_storage_keys.hint_levels.map(q=>({old_key:q.old_key,sentence_id:q.sentence_id}))
 } }))},legacy_vocab_map:{schema:vocab.schema,keys:vocab.keys.map(v=>({key:v.key,status:v.status,approved_lexeme_id:v.approved_lexeme_id}))}};
const text="/* Generated from curriculum/lexicon/legacy-id-map.json and legacy-vocab-map.json. */\n(globalThis.TablinumMigrationMaps ||= "+JSON.stringify(payload)+");\n";
const file=path.join(root,"content","migration-maps.js");
if(process.argv.includes("--check")){
 assert.equal(fs.readFileSync(file,"utf8"),text,"Migration ID maps are stale; regenerate before release");
 console.log("PASS: published offline migration mappings match source: "+payload.legacy_id_map.legacy_chapters.length+" chapters and "+payload.legacy_vocab_map.keys.length+" vocab keys");
}else{fs.writeFileSync(file,text,"utf8");console.log("WROTE "+file)}
