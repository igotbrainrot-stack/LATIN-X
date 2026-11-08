"use strict";
/* Offline chapter scaffold, never a claimed lesson or an automatic lexical approval. */
const fs=require('node:fs'),path=require('node:path');
const {expectedCourseId}=require('./lib/ids.cjs');
const root=path.resolve(__dirname,'..');
function scaffold(n,plan){
 if(!Number.isInteger(n)||n<1||n>130)throw Error('Chapter must be an integer from 1 to 130');
 const c=plan.chapters[n-1];if(!c||c.chapter!==n)throw Error('Missing planned chapter '+n);
 const id=expectedCourseId(n);
 return {schema:'tablinum-lesson-v1',id,chapter:n,book:c.book,is_review:c.review,
  title:c.title,subtitle_la:'',status:'draft',
  review:{latin:{by:null,at:null,tier:null},pedagogy:{by:null,at:null}},
  budget_ref:`curriculum/vocabulary-budgets-130.json#${n}`,
  new_lexemes_declared:[],grammar_new:[],target_running_tokens:c.target_running_tokens,
  lesson_segments:c.lesson_segments,
  segments:Array.from({length:c.lesson_segments},(_,i)=>({id:`${id}-l${i+1}`,title_la:`Lēctiō ${i+1}`,sentences:[]})),
  exercises:[],speaking:[],
  notes_for_reviewer:`UNWRITTEN DRAFT. Original story brief: ${c.story}\nGrammar focus to implement and review: ${c.grammar_focus}\nSpeaking goal: ${c.communication_task}\nNew lemma BUDGET (not approved): ${c.budget_new_lemmas}. No forms, signatures or audio have been fabricated.`};
}
function main(){const raw=process.argv.find(x=>/^\d+$/.test(x));if(!raw)throw Error('Usage: node scripts/new-lesson-draft.cjs <chapter 1..130>');const n=Number(raw);
 const plan=JSON.parse(fs.readFileSync(path.join(root,'curriculum/vocabulary-budgets-130.json'),'utf8'));
 const l=scaffold(n,plan),file=path.join(root,'lessons',`b0${l.book}`,`c${String(n).padStart(3,'0')}.json`);
 if(fs.existsSync(file))throw Error('Refusing to overwrite authored lesson: '+file);
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(l,null,2)+'\n');
 console.log('Created UNSIGNED/UNWRITTEN lesson scaffold: '+path.relative(root,file));
}
if(require.main===module){try{main()}catch(e){console.error(e.message);process.exitCode=1}}module.exports={scaffold};
