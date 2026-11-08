/* Tablinum Phase 6 — local-first FSRS deck, pinned ts-fsrs 5.4.2 MIT.
 * Preserve unsigned legacy cards without promoting them to real lexeme IDs.
 * Can be run on file:// via vendor/ts-fsrs.umd.js without npm/network. */
(function(root){
"use strict";
const lib=root.FSRS||(typeof require==="function"?require("../vendor/ts-fsrs.umd.js"):null);
if(!lib||typeof lib.fsrs!=="function"||typeof lib.createEmptyCard!=="function")throw Error("Pinned local ts-fsrs 5.4.2 UMD is missing");
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const dict=()=>Object.create(null);
const nowISO=now=>new Date(now).toISOString();
const deep=x=>JSON.parse(JSON.stringify(x));
const safe=o=>o&&typeof o==="object"&&!Array.isArray(o)?o:{};
const RATE={again:lib.Rating.Again,hard:lib.Rating.Hard,good:lib.Rating.Good,easy:lib.Rating.Easy};
function setUp(state){
 if(!state||state.schema!=="tablinum-state-v5")throw Error("FSRS requires saved v5 state");
 if(!state.deck)state.deck={cards:dict(),legacyCards:dict(),log:[]};
 state.deck.cards=safe(state.deck.cards);state.deck.legacyCards=safe(state.deck.legacyCards);
 if(!Array.isArray(state.deck.log))state.deck.log=[];
 if(!state.deck.settings)state.deck.settings={retention:0.9,newDaily:15,reviewDaily:150};
 if(!state.exposure)state.exposure=dict();
 if(!state.speakingUse)state.speakingUse=dict();
 return state;
}
function scheduler(state){
 const settings=setUp(state).deck.settings;
 const r=Number(settings.retention);
 return lib.fsrs({request_retention:Number.isFinite(r)&&r>=0.7&&r<=0.99?r:0.9,enable_fuzz:false});
}
function hydrate(record,now){
 const raw=safe(record);
 const card=raw.fsrs?safe(raw.fsrs):null;
 if(!card){
  // Preserve the owner's prior interval without fabricating historic ratings.
  // A previously-reviewed legacy card is not a brand-new card on first FSRS use.
  const days=Number(raw.days),reps=Number(raw.reps);
  if(Number.isFinite(days)&&days>=1&&Number.isFinite(reps)&&reps>0){
   const dueMillis=Number(raw.due),due=new Date(Number.isFinite(dueMillis)&&dueMillis>0?dueMillis:now);
   const reviewAt=new Date(due.getTime()-Math.max(1,days)*86400000);
   return {...lib.createEmptyCard(new Date(now)),state:lib.State.Review,
    stability:Math.max(1,days),difficulty:5,due,last_review:reviewAt,
    scheduled_days:Math.max(1,Math.round(days)),reps:Math.round(reps),lapses:0};
  }
  return lib.createEmptyCard(new Date(now));
 }
 const c={...card};
 for(const key of ["due","last_review"])if(c[key])c[key]=new Date(c[key]);
 if(!Number.isFinite(c.stability)||!Number.isFinite(c.difficulty))return lib.createEmptyCard(new Date(now));
 return c;
}
function addLog(state,item){
 state.deck.log.push(item);
 if(state.deck.log.length>500)state.deck.log.splice(0,state.deck.log.length-500);
}
function localDateKey(value){
 const d=new Date(value);
 if(!Number.isFinite(d.getTime()))return null;
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function kindOf(card){
 return card?.fsrs
  ? (Number(card.fsrs.state)===lib.State.New?"new":"review")
  : (Number(card?.reps)>0?"review":"new");
}
function limits(state,now){
 const x=setUp(state),settings=x.deck.settings||{},day=localDateKey(now);
 const newDaily=Number.isInteger(Number(settings.newDaily))?Math.max(0,Math.min(500,Number(settings.newDaily))):15;
 const reviewDaily=Number.isInteger(Number(settings.reviewDaily))?Math.max(0,Math.min(1000,Number(settings.reviewDaily))):150;
 const consumed={new:0,review:0};
 for(const row of x.deck.log){
  if(localDateKey(row.at)!==day)continue;
  consumed[row.kind==="new"?"new":"review"]++;
 }
 return {new:Math.max(0,newDaily-consumed.new),review:Math.max(0,reviewDaily-consumed.review),consumed,day};
}
function dueQueue(state,now=Date.now()){
 const available=limits(state,now),rows=[];
 for(const group of ["cards","legacyCards"]){
  for(const [key,item]of Object.entries(state.deck[group])){
   if(Number(item.due||0)>now)continue;
   const kind=kindOf(item);
   rows.push({group,key,item,kind});
  }
 }
 rows.sort((a,b)=>Number(a.item.due||0)-Number(b.item.due||0)||
  a.group.localeCompare(b.group)||a.key.localeCompare(b.key));
 const remaining={new:available.new,review:available.review};
 return rows.filter(row=>{if(remaining[row.kind]<=0)return false;remaining[row.kind]--;return true});
}
function rate(state,key,rating,now=Date.now(),group="legacyCards"){
 setUp(state);
 if(!own(RATE,rating))throw Error("Unknown review grade "+rating);
 if(!["legacyCards","cards"].includes(group))throw Error("Unsupported deck");
 const item=state.deck[group][key];
 if(!item)throw Error("Unknown review card "+key);
 if(group==="cards"&&(!item.lexemeId||!item.direction))throw Error("No approved lexeme ID or direction");
 const kind=kindOf(item),allow=dueQueue(state,now).some(row=>row.group===group&&row.key===key);
 if(!allow)throw Error("Review is not due or today's "+kind+" limit was reached");
 const original=hydrate(item,now);
 const outcome=scheduler(state).next(original,new Date(now),RATE[rating]);
 const fsrs=deep(outcome.card),log=deep(outcome.log);
 const due=new Date(outcome.card.due).getTime();
 if(!Number.isFinite(due))throw Error("FSRS returned invalid due date");
 const next={...item,fsrs, due,days:Math.max(1/1440,(due-now)/86400000),reps:(Number(item.reps)||0)+1};
 state.deck[group][key]=next;
 addLog(state,{key,group,kind,rating,at:nowISO(now),due:nowISO(due),log});
 return next;
}
function seenSentence(state,chapter,sentence,session){
 setUp(state);
 if(chapter?.status!=="approved"||!Array.isArray(sentence?.tokens))return 0;
 const sessionSet=session||new Set(),countKey=chapter.id+"|"+sentence.id;
 if(sessionSet.has(countKey))return 0;
 sessionSet.add(countKey);
 const published=root.TablinumCompiledContent?.lexicon?.lexemes||[];
 const approved=new Set(published.filter(x=>x.status==="approved").map(x=>x.id));
 let added=0,seen=new Set();
 for(const token of sentence.tokens){
  if(!approved.has(token.lx)||seen.has(token.lx))continue;
  seen.add(token.lx);
  const x=state.exposure[token.lx]||{seen:0};
  x.seen=(Number(x.seen)||0)+1;
  state.exposure[token.lx]=x;added++;
 }
 return added;
}
function createApprovedCards(state,chapter,lexicon,completed=false,now=Date.now()){
 setUp(state);
 if(!completed||chapter?.status!=="approved"||chapter.legacy===true)return 0;
 const records=Array.isArray(lexicon?.lexemes)?lexicon.lexemes:[];
 const byId=new Map(records.filter(x=>x.status==="approved"&&typeof x.id==="string").map(x=>[x.id,x]));
 const text=(chapter.segments||[]).flatMap(seg=>seg.sentences||[]);
 let count=0;
 for(const lexId of chapter.new_lexemes_declared||[]){
  const lex=byId.get(lexId);if(!lex||lex.first_chapter>chapter.chapter)continue;
  const sentence=text.find(s=>s.tokens?.some(t=>t.lx===lexId));
  if(!sentence)continue;
  const directions=["recog"];
  if(chapter.audio_verified===true&&sentence.audio?.verified===true)directions.push("listen");
  if(chapter.book>=2)directions.push("prod");
  for(const direction of directions){
   const key=lexId+":"+direction;
   if(own(state.deck.cards,key))continue;
   state.deck.cards[key]={
    lexemeId:lexId,direction,head:lex.head,sentenceId:sentence.id,
    sourceText:sentence.text_la,sourceHighlight:sentence.tokens.find(t=>t.lx===lexId)?.t||lex.head,chapterId:chapter.id,
    meaning:lex.senses?.[0]?.gloss_la||lex.senses?.[0]?.gloss_en||"",
    fsrs:deep(lib.createEmptyCard(new Date(now))),due:now,
    reps:0,days:0,reviewedLexeme:true
   };
   count++;
  }
 }
 return count;
}
function dueCards(state,now=Date.now(),group="cards"){
 return dueQueue(state,now).filter(row=>row.group===group).map(row=>[row.key,row.item]);
}
function metrics(state,approvedLexicon=[],furthestChapter=0){
 setUp(state);
 const ls=Array.isArray(approvedLexicon)?approvedLexicon:[];
 const legit=ls.filter(l=>l.status==="approved"&&typeof l.id==="string");
 const seen=new Set(legit.map(l=>l.id));
 const introduced=legit.filter(l=>Number.isInteger(l.first_chapter)&&l.first_chapter<=furthestChapter).length;
 const encountered=legit.filter(l=>Number(state.exposure[l.id]?.seen||0)>0).length;
 const recognised=new Set(),productive=new Set();
 for(const c of Object.values(state.deck.cards)){
  if(!seen.has(c.lexemeId)||c.fsrs?.state!==lib.State.Review||Number(c.fsrs.stability)<21)continue;
  if(c.direction==="recog")recognised.add(c.lexemeId);
  if(c.direction==="prod")productive.add(c.lexemeId);
 }
 for(const [id,usage]of Object.entries(state.speakingUse))if(seen.has(id)&&Number(usage)>=2)productive.add(id);
 return {introduced,encountered,recognised:recognised.size,productive:productive.size,
  legacySaved:Object.keys(state.deck.legacyCards).length,due:dueCards(state).length};
}
root.TablinumReviewDeck=Object.freeze({VERSION:"ts-fsrs@5.4.2",RATE,setUp,rate,dueCards,
 seenSentence,createApprovedCards,metrics,hydrate,dueQueue,limits,kindOf});
if(typeof module!=="undefined"&&module.exports)module.exports=root.TablinumReviewDeck;
})(globalThis);
