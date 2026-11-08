"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {generate}=require("./import-claude-pilot.cjs");
const root=path.resolve(__dirname,"..");
function report(){
 const src=fs.readFileSync(path.join(root,"docs/pilot/CLAUDE_PILOT_B01_C001_C008.md"),"utf8");
 const plans=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
 const lessons=generate(src,plans);
 const rows=["# Claude Book I pilot — source-derived metrics","","UNSIGNED DRAFT, NOT PUBLISHED.","",
 "| Chapter | Lines | Tokens | Segments | Target | Shortfall |",
 "|---:|---:|---:|---:|---|---:|"];
 for(const l of lessons){
  const [min,max]=plans.chapters[l.chapter-1].target_running_tokens;
  rows.push("| "+l.chapter+" | "+l.reading_sentence_count+" | "+l.reading_token_count+" | "+l.segments.length+" | "+min+"–"+max+" | "+Math.max(0,min-l.reading_token_count)+" |");
 }
 rows.push("","Total reading tokens: "+lessons.reduce((s,l)=>s+l.reading_token_count,0),"",
 "No hours-per-1000-tokens have been measured. Source lines, not punctuation-delimited sentences, are counted.",
 "All lexical, morphological and answer-key approvals are still pending.",
 "Owner decisions: excess proposed lemmas in chapters 2/3/4/7; phrases Pecūnia est pretium, Gāī, Canis! Canis!; below-target length in chapters 3–8.","");
 return rows.join("\n")+"\n";
}
const filename=path.join(root,"reports/pilot-metrics.md");
if(process.argv.includes("--check")){
 assert.equal(fs.readFileSync(filename,"utf8"),report(),"Stale pilot metrics");
 console.log("PASS: manuscript metrics unchanged");
}else{fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,report());console.log("WROTE pilot metrics")}
module.exports={report};
