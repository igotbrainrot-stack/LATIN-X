"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {tokenize}=require("./lib/tokens.cjs");
const root=path.resolve(__dirname,"..");
const romans=["I","II","III","IV","V","VI","VII","VIII"];
function generate(markdown,plans){
 const result=[],lines=markdown.split(/\r?\n/);
 let ch=null,mode="";
 function close(){if(!ch)return;const p=plans.chapters[ch.chapter-1];assert(p&&p.chapter===ch.chapter);
  ch.title=p.title;ch.is_review=p.review;ch.budget_ref="curriculum/vocabulary-budgets-130.json#"+ch.chapter;
  ch.lesson_segments=p.lesson_segments;ch.target_running_tokens=p.target_running_tokens;
  assert.equal(ch.segments.length,p.lesson_segments);
  assert.equal(ch.exercises.length,6);
  ch.reading_sentence_count=ch.segments.reduce((n,x)=>n+x.sentences.length,0);
  ch.reading_token_count=ch.segments.reduce((n,x)=>n+x.sentences.reduce((k,y)=>k+y.tokens.length,0),0);
  ch.notes_for_reviewer="UNSIGNED DRAFT. All lexical and grammar annotations remain unverified. Proposed word budget: "+p.budget_new_lemmas+"\n"+ch.reviewer_notes.join("\n");
  result.push(ch);
 }
 for(let i=0;i<lines.length;i++){
  const line=lines[i],trim=line.trim();
  const h=/^# Caput (I|II|III|IV|V|VI|VII|VIII) — (.+)$/.exec(line);
  if(h){close();const chapter=romans.indexOf(h[1])+1,id="b01-c"+String(chapter).padStart(3,"0");
   ch={schema:"tablinum-lesson-v1",id,chapter,book:1,status:"draft",drafted_by:"claude-draft-2026-11-05",
     manuscript_title:h[2],source_manuscript:"docs/pilot/CLAUDE_PILOT_B01_C001_C008.md",source_line:i+1,
     review:{latin:{by:null,at:null,tier:null},pedagogy:{by:null,at:null}},new_lexemes_declared:[],grammar_new:[],
     proposed_new_lemmas_raw:null,proposed_grammar_raw:null,proposed_margin_raw:null,
     reviewer_notes:[],segments:[],exercises:[],speaking:[]};
   mode="front";continue;
  }
  if(!ch)continue;
  const seg=/^## Lēctiō (\d+) — (.+)$/.exec(line);
  if(seg){const n=Number(seg[1]);assert.equal(n,ch.segments.length+1);
   ch.segments.push({id:ch.id+"-l"+n,title_la:"Lēctiō "+n+" — "+seg[2],source_line:i+1,sentences:[]});
   mode="reading";continue;
  }
  if(/^## Quaestiōnēs/.test(line)){mode="questions";continue}
  if(/^## Loquere/.test(line)){mode="speaking";continue}
  if(/^## /.test(line)||/^---/.test(line)){mode="other";continue}
  if(line.startsWith("> ")){ch.reviewer_notes.push(line);mode="notes";continue}
  if(line.startsWith("**Grammar")){ch.proposed_grammar_raw=line;continue}
  if(line.startsWith("**New ")){ch.proposed_new_lemmas_raw=line;continue}
  if(line.startsWith("**Margin:")){ch.proposed_margin_raw=line;continue}
  if(!trim)continue;
  if(mode==="reading"){
   const item=ch.segments.at(-1),n=1+ch.segments.reduce((k,x)=>k+x.sentences.length,0);
   assert(item,"Reading text outside lesson");
   item.sentences.push({id:ch.id+"-s"+String(n).padStart(3,"0"),text_la:line,source_line:i+1,
     annotation_status:"draft_unverified",tokens:tokenize(line).map(t=>({...t,lx:null,morph:null,annotation_status:"draft_unverified"}))});
  }
  if(mode==="questions"){
   const q=/^(\d+)\.\s+(.+)$/.exec(line);if(!q)continue;
   const at=q[2].indexOf(" — ");
   ch.exercises.push({id:ch.id+"-q"+String(ch.exercises.length+1).padStart(3,"0"),
     type:"proposed_ungraded",status:"proposed_ungraded",source_line:i+1,text_original:line,
     prompt_text:at<0?q[2]:q[2].slice(0,at),model_answer_raw:at<0?null:q[2].slice(at+3),
     reviewed_by:null,reviewed_at:null,scoring_enabled:false});
  }
  if(mode==="speaking"&&line.startsWith("- ")){
   ch.speaking.push({id:ch.id+"-sp"+String(ch.speaking.length+1).padStart(3,"0"),
     type:"proposed_ungraded",status:"proposed_ungraded",source_line:i+1,text_original:line,
     prompt_text:line.slice(2),reviewed_by:null,reviewed_at:null,scoring_enabled:false});
  }
 }
 close();assert.equal(result.length,8);return result;
}
// Independent unsigned picture prompts are appended without editing Claude's six
// manuscript questions or pretending the source manuscript contains these rows.
function withPictureExercises(rows){
 const picture=JSON.parse(fs.readFileSync(path.join(root,"curriculum/picture-exercises-b01.json"),"utf8"));
 assert.equal(picture.schema,"tablinum-picture-exercises-draft-v1");
 for(const chapter of rows){
  const extras=picture.chapters[chapter.id];
  assert(Array.isArray(extras),"Missing picture prompts for "+chapter.id);
  assert(extras.every(ex=>ex.type==="pic"&&ex.status==="proposed_ungraded"&&ex.scoring_enabled===false&&
   ex.review?.by===null&&ex.review?.at===null),"Picture drafts must remain unsigned");
  chapter.exercises.push(...extras);
 }
 return rows;
}
function main(){const text=fs.readFileSync(path.join(root,"docs/pilot/CLAUDE_PILOT_B01_C001_C008.md"),"utf8");
 const plans=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
 const check=process.argv.includes("--check"),rows=withPictureExercises(generate(text,plans));
 for(const chapter of rows){const dst=path.join(root,"lessons/b01/c"+String(chapter.chapter).padStart(3,"0")+".json");
  const out=JSON.stringify(chapter,null,2)+"\n";
  if(check){assert(fs.existsSync(dst),"Missing manuscript-derived draft "+dst);assert.equal(fs.readFileSync(dst,"utf8"),out,"Stale lesson "+chapter.id)}
  else{fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,out)}
  console.log(chapter.id+": "+chapter.reading_sentence_count+" reading lines, "+chapter.reading_token_count+" tokens, "+chapter.segments.length+" segments");
 }
}
if(require.main===module){try{main()}catch(e){console.error(e);process.exitCode=1}}
module.exports={generate,withPictureExercises};
