"use strict";
/* Only the 130-row Markdown outline table is generated; all editorial prose stays intact. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const plan=JSON.parse(fs.readFileSync(path.join(root,'curriculum/vocabulary-budgets-130.json'),'utf8'));
const filename=path.join(root,'curriculum/CURRICULUM_130_MASTER_PLAN.md');
const source=fs.readFileSync(filename,'utf8');
const start=source.indexOf('| Chapter | Original story / title |');
if(start<0)throw Error('Cannot find canonical plan table header');
const after=source.slice(start),lines=after.split('\n');let endIndex=0;
for(let i=2;i<lines.length;i++){if(!/^\|/.test(lines[i])){endIndex=i;break}}
if(!endIndex)throw Error('No end of plan table');
const oldTable=lines.slice(0,endIndex).join('\n');
const esc=s=>String(s).replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
const header=['| Chapter | Original story / title | Story situation | Grammar or review focus | New lemma budget | Cumulative target |','|---:|---|---|---|---:|---:|'];
const table=[...header,...plan.chapters.map(c=>`| ${String(c.chapter).padStart(3,'0')} | ${esc(c.title)} | ${esc(c.story)} | ${esc(c.grammar_focus)} | ${c.budget_new_lemmas} | ${c.cumulative_target} |`)].join('\n');
if(process.argv.includes('--check')){
 if(oldTable!==table){let mismatch=oldTable.split('\n').findIndex((l,i)=>l!==table.split('\n')[i]);throw Error(`130-chapter outline drift at table line ${mismatch+1}; run node scripts/render-plan.cjs`)}
 console.log('PASS: 130-row curriculum table exactly matches the source JSON; editorial prose unchanged.');
}else{
 fs.writeFileSync(filename,source.slice(0,start)+table+source.slice(start+oldTable.length));
 console.log('Updated only the 130-row Markdown outline table from curriculum/vocabulary-budgets-130.json');
}
