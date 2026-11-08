"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {generateForms}=require("./lib/paradigms.cjs");
const root=path.resolve(__dirname,"..");
const samples=JSON.parse(fs.readFileSync(path.join(root,"tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json"),"utf8"));
assert(samples.review_status==="awaiting_owner_verification");
const escape=(s)=>String(s).replace(/\|/g,"\\|");
const out=[
 "# Tablinum: Regular Latin paradigm samples for OWNER REVIEW",
 "",
 "**Status: PROPOSALS, NOT APPROVED.** These are generated from scripts/lib/paradigms.cjs.",
 "A human must verify every form, case/tense, macron, principal part and exception.",
 "Checking a box in this Markdown does not grant software approval.",
 "",
 "After genuinely reviewing an entire correct pattern table, the actual owner can edit",
 "tests/fixtures/paradigms/REGULAR_PATTERN_SAMPLES.json, adding an entry under approved_patterns",
 "with pattern, reviewed:true, approved_by and approved_at. Do not fabricate a signature.",
 "Owner-reviewed is NOT Latinist-verified.",
 "",
 "These proposal generators are still incomplete for the full Latin system.",
 "In particular subjunctives, several participles, compounds and irregular forms",
 "must be completed and independently checked before a pattern is certified.",
 ""
];
for(const item of samples.specimens){
 const forms=generateForms(item.lexeme);
 out.push("## "+item.pattern,"","- [ ] All forms and macrons checked",
 "- [ ] Pattern coverage complete including relevant exceptions",
 "- Owner reviewer: __________", "- Date (YYYY-MM-DD): __________",
 "- Verified sources/pages: __________",
 "",
 "Lexeme: "+String(item.lexeme.head||item.lexeme.principal_parts),
 "",
 "| Morphological tag | Latin form |", "|---|---|");
 for(const f of forms)out.push("| "+escape(f.morph)+" | "+escape(f.surface)+(f.gender?" ("+f.gender+")":"")+" |");
 out.push("");
}
out.push("## Safety condition","","No generated regular form is approved for a lesson unless",
 "the corresponding pattern has been signed by the real owner.",
 "The compiler rejects unsigned pattern use, however many forms it generates.","");
const text=out.join("\n");
const target=path.join(root,"docs/owner/PARADIGM_SAMPLES.md");
if(process.argv.includes("--check")){
 assert(fs.existsSync(target)&&fs.readFileSync(target,"utf8")===text,"Sample tables outdated; run node scripts/render-paradigm-samples.cjs");
 console.log("PASS: unsigned paradigm sample tables are deterministic");process.exit(0);
}
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text,"utf8");
console.log("GENERATED owner paradigm samples: "+samples.specimens.length+" patterns");
