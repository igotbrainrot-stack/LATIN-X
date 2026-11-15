/* Tablinum word checks: questions on word knowledge built from the existing chapter
 * vocabulary, asked while reading and again at the end of a chapter.
 *
 * Nothing here writes Latin. A check shows a sentence the learner has just read, names
 * one word in it, and asks for its meaning from the glossary; or gives a meaning and
 * asks which Latin word carries it. Wrong choices are other glossary entries, filtered
 * so that no wrong choice could also be right (same word family, shared English word,
 * or a listed near-synonym). Everything is deterministic: the same chapter, word and
 * attempt always produce the same question, so a re-render never reshuffles it.
 *
 * Pure functions only; the runtime owns storage and display. */
(function(root){
"use strict";
const PASS=0.8,TEST_OWN=6,TEST_REVIEW=2,SLOT_EVERY=3;
const plain=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z ]/g," ").trim().replace(/\s+/g," ");
const object=x=>x&&typeof x==="object"&&!Array.isArray(x)?x:{};
/* English words that carry no meaning of their own in a gloss. */
const FILLER=new Set(["to","a","an","the","of","be","will","was","is","are","we","in","question"]);
/* Glosses a beginner could reasonably confuse; never offered against each other. */
const NEAR=[["house","home"],["see","watch","look"],["carry","bring"],["now","already"],["live","stay"],["eat","dine"],["toward","where"],["happy","laugh"]];
const stem=w=>{const s=w.replace(/(ing|ed|s)$/,"");return s.length>=3?s:w;};
function keys(meaning){
 const out=new Set(plain(meaning).split(" ").filter(w=>w&&!FILLER.has(w)).map(stem));
 for(const group of NEAR)if(group.some(g=>out.has(g)))group.forEach(g=>out.add(g));
 return out;
}
function meaningsOverlap(a,b){
 const x=keys(a),y=keys(b);
 if(!x.size||!y.size)return true; // a gloss with no content word cannot be told apart safely
 for(const k of x)if(y.has(k))return true;
 return false;
}
/* Seeded shuffle (mulberry32 over an FNV-1a hash of the seed text). */
function rng(seed){
 let h=2166136261;for(const c of String(seed)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}
 let a=h>>>0;
 return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
}
function shuffle(list,seed){
 const out=list.slice(),next=rng(seed);
 for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
 return out;
}
const tokens=text=>String(text||"").match(/[\p{L}\p{M}]+/gu)||[];
/* The word family of a glossary entry, so that est / sunt / erat are never offered
 * against each other. Uses the dictionary entry recorded in the form notes when present. */
function family(entry,formNotes){
 const note=object(formNotes)[String(entry.head).normalize("NFC").toLowerCase()];
 return note&&note.of?note.of:"head:"+plain(entry.head);
}
/* Testable vocabulary of one chapter: its own word list, without proper names. */
function chapterWords(chapters,index,formNotes){
 const c=chapters[index];if(!c||!Array.isArray(c.v))return [];
 const seen=new Set(),out=[];
 for(const w of c.v){
  const head=String(w[0]||""),meaning=String(w[1]||"");
  if(!head||!meaning||plain(head)===plain(meaning)||seen.has(plain(head)))continue;
  seen.add(plain(head));
  const forms=[head,...String(w[2]||"").split(/\s+/).filter(Boolean)];
  const entry={head,meaning,forms,chapter:index};
  entry.family=family(entry,formNotes);
  /* First sentence of the chapter in which a form of the word appears. */
  entry.sentence=-1;
  const wanted=new Set(forms.map(plain));
  (c.sent||[]).some(([latin],i)=>{
   const hit=tokens(latin).find(t=>wanted.has(plain(t)));
   if(hit){entry.sentence=i;entry.surface=hit;return true}
   return false;
  });
  out.push(entry);
 }
 return out;
}
/* Entries that may stand as wrong choices beside `entry`, nearest chapters first. */
function distractors(chapters,entry,formNotes,seed){
 const order=[entry.chapter];
 for(let d=1;d<chapters.length;d++){if(entry.chapter-d>=0)order.push(entry.chapter-d);if(entry.chapter+d<chapters.length)order.push(entry.chapter+d)}
 const chosen=[];
 for(const index of order){
  for(const other of shuffle(chapterWords(chapters,index,formNotes),seed+"|d|"+index)){
   if(other.family===entry.family||plain(other.head)===plain(entry.head))continue;
   if([entry,...chosen].some(x=>meaningsOverlap(x.meaning,other.meaning)||x.family===other.family))continue;
   chosen.push(other);
   if(chosen.length===2)return chosen;
  }
 }
 return chosen;
}
/* One question. kind "meaning": Latin word shown, choose its meaning.
 * kind "latin": meaning shown, choose the Latin word. */
function buildItem(chapters,entry,kind,formNotes,seed){
 const wrong=distractors(chapters,entry,formNotes,seed);
 if(wrong.length<2)return null;
 const pick=x=>kind==="latin"?x.head:x.meaning;
 return {key:kind+":"+entry.head,kind,head:entry.head,meaning:entry.meaning,chapter:entry.chapter,
  sentence:entry.sentence,surface:entry.surface||entry.head,answer:pick(entry),
  options:shuffle([entry,...wrong].map(pick),seed+"|o")};
}
/* Checks placed inside the reading: after every third sentence and after the last one,
 * on a word that has already appeared and has not been asked yet. */
function inlineChecks(chapters,index,formNotes){
 const c=chapters[index];if(!c||!Array.isArray(c.sent))return [];
 const words=chapterWords(chapters,index,formNotes).filter(w=>w.sentence>=0).sort((a,b)=>a.sentence-b.sentence);
 const last=c.sent.length-1,slots=[];
 for(let s=SLOT_EVERY-1;s<last;s+=SLOT_EVERY)slots.push(s);
 if(last>=0)slots.push(last);
 const used=new Set(),out=[];
 for(const after of slots){
  /* Prefer the most recently met word, so the check follows what was just read. */
  const ready=words.filter(w=>w.sentence<=after&&!used.has(w.head));
  for(const word of ready.reverse()){
   const item=buildItem(chapters,word,"meaning",formNotes,"inline|"+index+"|"+word.head);
   if(!item)continue;
   used.add(word.head);out.push({...item,after});break;
  }
 }
 return out;
}
function normalise(value){
 const x=object(value),out={version:1,chapters:{},words:{}};
 for(const [id,ch]of Object.entries(object(x.chapters))){
  const c=object(ch),test=object(c.test);
  out.chapters[id]={inline:{},test:{attempt:Number.isInteger(test.attempt)&&test.attempt>0?test.attempt:0,
   items:Array.isArray(test.items)?test.items.filter(i=>i&&typeof i.head==="string"&&(i.kind==="meaning"||i.kind==="latin")).slice(0,20).map(i=>({kind:i.kind,head:i.head})):[],
   answers:{},best:Number.isFinite(test.best)?Math.max(0,Math.min(1,test.best)):0}};
  for(const [k,a]of Object.entries(object(c.inline)))if(a&&typeof a.value==="string")out.chapters[id].inline[k]={value:a.value.slice(0,200),ok:a.ok===true};
  for(const [k,a]of Object.entries(object(test.answers)))if(a&&typeof a.value==="string")out.chapters[id].test.answers[k]={value:a.value.slice(0,200),ok:a.ok===true};
 }
 for(const [head,w]of Object.entries(object(x.words))){
  const r=object(w);
  out.words[head]={right:Math.max(0,Number(r.right)|0),wrong:Math.max(0,Number(r.wrong)|0),last:r.last==="wrong"?"wrong":"right"};
 }
 return out;
}
const chapterId=index=>"legacy-ch"+String(index+1).padStart(2,"0");
function chapterState(learning,index){
 const id=chapterId(index);
 return learning.chapters[id]||(learning.chapters[id]={inline:{},test:{attempt:0,items:[],answers:{},best:0}});
}
function note(learning,head,ok){
 const w=learning.words[head]||(learning.words[head]={right:0,wrong:0,last:"right"});
 if(ok)w.right++;else w.wrong++;
 w.last=ok?"right":"wrong";
}
/* Record an answer to a check inside the reading. First answer only. */
function answerInline(learning,chapters,index,head,value,formNotes){
 const item=inlineChecks(chapters,index,formNotes).find(i=>i.head===head),state=chapterState(learning,index);
 if(!item||state.inline[head])return null;
 const ok=value===item.answer;
 state.inline[head]={value:String(value),ok};note(learning,head,ok);
 return {ok,item};
}
/* Choose the words of a chapter test: words missed while reading first, then words not
 * yet asked, then the rest; plus words from earlier chapters, missed ones first. */
function startTest(learning,chapters,index,formNotes){
 const state=chapterState(learning,index),attempt=state.test.attempt+1,seed="test|"+index+"|"+attempt;
 /* 0: latest answer wrong; 1: never asked; 2: latest answer right. */
 const rank=w=>{const r=learning.words[w.head];return r?(r.last==="wrong"?0:2):1};
 const askable=w=>!!buildItem(chapters,w,"meaning",formNotes,seed+"|"+w.head);
 const own=shuffle(chapterWords(chapters,index,formNotes),seed).filter(askable).sort((a,b)=>rank(a)-rank(b)).slice(0,TEST_OWN);
 const earlier=[];
 for(let i=0;i<index;i++)earlier.push(...chapterWords(chapters,i,formNotes));
 const missed=w=>learning.words[w.head]&&learning.words[w.head].last==="wrong"?0:1;
 const review=shuffle(earlier,seed+"|r").filter(askable).sort((a,b)=>missed(a)-missed(b)).slice(0,TEST_REVIEW);
 const items=[];
 shuffle([...own,...review],seed+"|order").forEach((w,n)=>{
  const kind=(n+attempt)%2?"latin":"meaning";
  if(buildItem(chapters,w,kind,formNotes,seed+"|"+w.head))items.push({kind,head:w.head});
 });
 state.test={attempt,items,answers:{},best:state.test.best||0};
 return state.test;
}
/* The questions of the current attempt, rebuilt from what was stored. */
function testItems(learning,chapters,index,formNotes){
 const state=chapterState(learning,index),seed="test|"+index+"|"+state.test.attempt;
 const all=[];for(let i=0;i<=index;i++)all.push(...chapterWords(chapters,i,formNotes));
 return state.test.items.map(i=>{
  const w=all.find(x=>x.head===i.head);
  return w?buildItem(chapters,w,i.kind,formNotes,seed+"|"+w.head):null;
 }).filter(Boolean);
}
function answerTest(learning,chapters,index,key,value,formNotes){
 const state=chapterState(learning,index),items=testItems(learning,chapters,index,formNotes);
 const item=items.find(i=>i.key===key);
 if(!item||state.test.answers[key])return null;
 const ok=value===item.answer;
 state.test.answers[key]={value:String(value),ok};note(learning,item.head,ok);
 if(items.every(i=>state.test.answers[i.key])){
  const score=items.filter(i=>state.test.answers[i.key].ok).length/items.length;
  state.test.best=Math.max(state.test.best||0,score);
 }
 return {ok,item};
}
/* Where a learner stands in one chapter. */
function summary(learning,chapters,index,formNotes){
 const state=chapterState(learning,index),inline=inlineChecks(chapters,index,formNotes),items=testItems(learning,chapters,index,formNotes);
 const answered=items.filter(i=>state.test.answers[i.key]).length,right=items.filter(i=>state.test.answers[i.key]&&state.test.answers[i.key].ok).length;
 return {inlineTotal:inline.length,inlineDone:inline.filter(i=>state.inline[i.head]).length,
  testStarted:state.test.attempt>0,testTotal:items.length,testAnswered:answered,testRight:right,
  testFinished:items.length>0&&answered===items.length,best:state.test.best||0,testPassed:(state.test.best||0)>=PASS,attempt:state.test.attempt};
}
/* Word knowledge across the course: known, to revisit, or not yet met. */
function knowledge(learning,chapters,formNotes){
 const rows=[],seen=new Set();
 chapters.forEach((c,i)=>chapterWords(chapters,i,formNotes).forEach(w=>{
  if(seen.has(w.head))return; // a word listed again in a later chapter counts once
  seen.add(w.head);
  const r=learning.words[w.head];
  rows.push({head:w.head,meaning:w.meaning,chapter:i,status:!r?"new":r.last==="wrong"?"revisit":"known",right:r?r.right:0,wrong:r?r.wrong:0});
 }));
 return rows;
}
root.TablinumWordChecks=Object.freeze({PASS,meaningsOverlap,chapterWords,inlineChecks,buildItem,normalise,chapterId,
 answerInline,startTest,testItems,answerTest,summary,knowledge,shuffle});
if(typeof module!=="undefined"&&module.exports)module.exports=root.TablinumWordChecks;
})(globalThis);
