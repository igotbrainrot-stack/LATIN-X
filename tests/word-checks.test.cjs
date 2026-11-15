"use strict";
/* Word checks: every generated question over the eight chapters is well formed, has one
   right answer and no second defensible one, and is the same on every run. */
const assert=require("node:assert/strict");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
for(const f of ["content/catalogue.js","content/lexicon.js","content/form-notes.js",...Array.from({length:8},(_,i)=>"content/legacy/ch"+String(i+1).padStart(2,"0")+".js"),"content/migration-maps.js","app/20-state-v5.js","app/30-content-loader.js"])require(path.join(root,f));
const WC=require(path.join(root,"app/56-word-checks.js"));
const L=Array.from({length:8},(_,i)=>globalThis.Tablinum.legacySourceAt(i)),FN=globalThis.TablinumFormNotes.forms;
const plain=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const byHead=new Map();L.forEach((c,i)=>WC.chapterWords(L,i,FN).forEach(w=>{if(!byHead.has(w.head))byHead.set(w.head,w)}));
const byMeaning=m=>[...byHead.values()].filter(w=>w.meaning===m);

function checkItem(item,label){
 assert.equal(item.options.length,3,label+": three options");
 assert.equal(new Set(item.options).size,3,label+": options differ");
 assert.equal(item.options.filter(o=>o===item.answer).length,1,label+": one right answer");
 const entries=item.options.map(o=>item.kind==="latin"?byHead.get(o):byMeaning(o)[0]);
 assert(entries.every(Boolean),label+": every option is a glossary entry");
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){
  assert(!WC.meaningsOverlap(entries[a].meaning,entries[b].meaning),label+": "+entries[a].meaning+" / "+entries[b].meaning+" could both be right");
  assert.notEqual(entries[a].family,entries[b].family,label+": two forms of one word");
 }
}

// Overlap rules.
assert(WC.meaningsOverlap("to bring","will carry"));
assert(WC.meaningsOverlap("house","home"));
assert(WC.meaningsOverlap("to see","to watch"));
assert(WC.meaningsOverlap("we will dine","to dine"));
assert(!WC.meaningsOverlap("girl","garden"));
assert(WC.meaningsOverlap("to be","girl"),"a gloss with no content word is never offered");

let inlineCount=0,testCount=0;
const learning=WC.normalise({});
L.forEach((c,i)=>{
 // Every word of a chapter's list occurs in its story, so a check can show it in context.
 for(const w of WC.chapterWords(L,i,FN))assert(w.sentence>=0,"chapter "+(i+1)+": "+w.head+" does not occur in the story");
 const inline=WC.inlineChecks(L,i,FN);
 assert(inline.length>=3,"chapter "+(i+1)+" has word checks in the story");
 assert.equal(new Set(inline.map(x=>x.head)).size,inline.length,"no word is checked twice in one story");
 assert.equal(inline[inline.length-1].after,c.sent.length-1,"the last check follows the last sentence");
 for(const item of inline){
  assert(item.sentence<=item.after,"a word is checked only after it has been read");
  assert(c.sent[item.sentence][0].split(/[^\p{L}\p{M}]+/u).some(t=>plain(t)===plain(item.surface)),"the marked word is in its sentence");
  checkItem(item,"chapter "+(i+1)+" inline "+item.head);inlineCount++;
 }
 assert.deepEqual(WC.inlineChecks(L,i,FN),inline,"inline checks are deterministic");
 // Three attempts of the chapter test.
 for(let attempt=1;attempt<=3;attempt++){
  WC.startTest(learning,L,i,FN);
  const items=WC.testItems(learning,L,i,FN);
  assert(items.length>=5&&items.length<=8,"chapter "+(i+1)+" test has "+items.length+" questions");
  assert.equal(new Set(items.map(x=>x.head)).size,items.length);
  assert(items.some(x=>x.kind==="meaning")&&items.some(x=>x.kind==="latin"),"both directions are asked");
  if(i>0)assert(items.some(x=>x.chapter<i),"chapter "+(i+1)+" test reviews an earlier word");
  for(const item of items){checkItem(item,"chapter "+(i+1)+" test "+item.key);testCount++}
  assert.deepEqual(WC.testItems(learning,L,i,FN),items,"a test is the same when rebuilt");
 }
});

// Scoring: first answer only, missed words come back, pass mark.
const s=WC.normalise({});
const first=WC.inlineChecks(L,0,FN)[0];
const wrong=first.options.find(o=>o!==first.answer);
assert.equal(WC.answerInline(s,L,0,first.head,wrong,FN).ok,false);
assert.equal(WC.answerInline(s,L,0,first.head,first.answer,FN),null,"an inline check takes one answer");
assert.equal(s.words[first.head].last,"wrong");
WC.startTest(s,L,0,FN);
let items=WC.testItems(s,L,0,FN);
assert(items.some(x=>x.head===first.head),"a word missed while reading is in the chapter test");
items.forEach((item,n)=>WC.answerTest(s,L,0,item.key,n===0?item.options.find(o=>o!==item.answer):item.answer,FN));
let sum=WC.summary(s,L,0,FN);
assert(sum.testFinished&&sum.testRight===items.length-1);
assert.equal(sum.testPassed,(items.length-1)/items.length>=WC.PASS);
assert.equal(WC.answerTest(s,L,0,items[0].key,items[0].answer,FN),null,"a test question takes one answer");
const missed=items[0].head;
WC.startTest(s,L,0,FN);
items=WC.testItems(s,L,0,FN);
assert(items.some(x=>x.head===missed),"a word missed in a test is asked in the next attempt");
items.forEach(item=>WC.answerTest(s,L,0,item.key,item.answer,FN));
sum=WC.summary(s,L,0,FN);
assert(sum.testPassed&&sum.best===1);
WC.startTest(s,L,0,FN);
assert.equal(WC.summary(s,L,0,FN).best,1,"a new attempt keeps the best score");
const rows=WC.knowledge(s,L,FN);
assert.equal(new Set(rows.map(r=>r.head)).size,rows.length);
assert(rows.some(r=>r.status==="known")&&rows.some(r=>r.status==="new"));

// Stored state is cleaned on the way in and survives a JSON round trip.
assert.deepEqual(WC.normalise(JSON.parse(JSON.stringify(s))),WC.normalise(s));
const dirty=WC.normalise({chapters:{x:{inline:{a:{value:5}},test:{attempt:-2,items:[{kind:"bad",head:"x"},null],answers:"no",best:7}}},words:{w:{right:-3,wrong:"2",last:"?"}}});
assert.deepEqual(dirty.chapters.x,{inline:{},test:{attempt:0,items:[],answers:{},best:1}});
assert.deepEqual(dirty.words.w,{right:0,wrong:2,last:"right"});
assert.deepEqual(WC.normalise(null),{version:1,chapters:{},words:{}});
console.log("PASS word checks: "+inlineCount+" checks in the stories and "+testCount+" test questions over three attempts; one right answer each, no overlapping choices.");
