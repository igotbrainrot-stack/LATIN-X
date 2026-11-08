"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const {parseCsv}=require("../scripts/lib/review-csv.cjs");
const {HEADERS}=require("../scripts/lib/review-workflow.cjs");
const sheet=path.join(root,"curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv");
const doc=parseCsv(fs.readFileSync(sheet,"utf8"));
assert.deepEqual(doc.headers,HEADERS);
assert.equal(doc.records.length,128);
assert.equal(new Set(doc.records.map(r=>r.candidate_id)).size,128);
for(const r of doc.records){
 assert.equal(r.decision,"","Claude draft cannot contain an approval decision");
 assert.equal(r.reviewer,"","Claude draft cannot pretend to have a reviewer");
 assert.equal(r.reviewed_at,"","Claude draft cannot contain a signed date");
 assert.equal(r.macron_reviewed,"","Claude draft cannot certify macrons");
 assert.equal(r.review_tier,"owner","Explicit owner tier must not be interpreted as signature");
 assert.equal(r.drafted_by,"claude-draft-2026-11-05");
 assert(/^lx-[a-z0-9-]+$/.test(r.proposed_id),"Stable proposed ID expected");
}
const target=path.join(root,"Vocabulary Review.html");
const html=fs.readFileSync(target,"utf8");
assert(html.includes('type="file"'));
assert(html.includes("FileReader"));
assert(html.includes("Export edited CSV"));
assert(!/https?:\/\/[^ \t"']+\.js/.test(html),"Offline review UI must not load remote scripts");
const cli=fs.readFileSync(path.join(root,"scripts/registry-review-sheet.cjs"),"utf8");
assert(cli.includes('legacy-candidates-claude-draft-32col.csv'));
for(const mode of ["--check-sheet","--dry-run"]){
 cp.execFileSync(process.execPath,["scripts/registry-review-sheet.cjs",mode],{cwd:root,stdio:"pipe",timeout:30000});
}
const registry=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/lexemes.json"),"utf8"));
assert.equal(registry.lexemes.length,0,"Source draft must never auto-approve");
console.log("PASS: 128 unapproved Claude candidates; offline vocabulary review and CLI defaults.");
