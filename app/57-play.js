/* Tablinum play layer: three small word games in a side card, and the flourishes that
 * answer the learner's actions (a burst of laurel leaves, a light along the top edge,
 * a wreath when a lesson is finished).
 *
 * The games write no Latin. Every word and meaning comes from the chapter word lists
 * through TablinumWordChecks, with the same rule that no wrong choice could also be right.
 * Games are play: they never change lesson progress or word knowledge. Only a best score
 * per game is kept, under its own storage key.
 *
 * The card is one persistent element. The runtime rebuilds its side panels on every
 * render, so it hands the card back with mount() each time; game state lives in the
 * dialog, which belongs to <body> and is never rebuilt. */
(function(root){
"use strict";
const doc=root.document,WC=root.TablinumWordChecks;
const off={mount(){},burst(){},edge(){},celebrate(){},close(){},ready:false};
if(!doc||!doc.body||typeof doc.createElement!=="function"||!WC){root.TablinumPlay=off;return}

const KEY="tablinum-play-v1",PAIRS=6,SPELL_ROUNDS=6,QUICK_SECONDS=40;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const calm=()=>!!root.matchMedia&&root.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sound=name=>{try{root.TablinumAmbience&&root.TablinumAmbience.sound(name)}catch(e){}};
function mix(list){const out=list.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function bests(){try{const v=JSON.parse(root.localStorage.getItem(KEY)||"{}");return v&&typeof v==="object"?v:{}}catch(e){return {}}}
function keepBest(game,value,lower){
 const all=bests(),old=Number(all[game]);
 const better=!Number.isFinite(old)||(lower?value<old:value>old);
 if(better){all[game]=value;try{root.localStorage.setItem(KEY,JSON.stringify(all))}catch(e){}}
 return better;
}

let ctx={chapters:[],upto:0,formNotes:{},spell:s=>s,onNext:null};
/* Words the learner has reached: the word lists of chapters 1 to the current one. */
function pool(){
 const seen=new Set(),out=[];
 for(let i=0;i<=ctx.upto&&i<ctx.chapters.length;i++)for(const w of WC.chapterWords(ctx.chapters,i,ctx.formNotes)){
  /* A gloss with no content word ("to be") is reported as overlapping everything; such
     words are never asked, here or in the word checks. */
  if(seen.has(w.head)||WC.meaningsOverlap(w.meaning,"zzzz"))continue;
  seen.add(w.head);out.push(w);
 }
 return out;
}
/* A set of words in which no two meanings could be confused. */
function distinct(words,count){
 const out=[];
 for(const w of mix(words)){
  if(out.some(x=>x.family===w.family||WC.meaningsOverlap(x.meaning,w.meaning)))continue;
  out.push(w);if(out.length===count)break;
 }
 return out;
}

/* ---- The side card ------------------------------------------------------------- */
const GAMES=[
 {id:"pairs",name:"Pairs",line:"Match each word to its meaning",icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="9" height="13" rx="1.5"/><rect x="12" y="7" width="9" height="13" rx="1.5"/></svg>'},
 {id:"spell",name:"Letter tiles",line:"Build the word from its letters",icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="8" width="6" height="8" rx="1"/><rect x="9" y="8" width="6" height="8" rx="1"/><rect x="15.5" y="8" width="6" height="8" rx="1"/></svg>'},
 {id:"quick",name:"Quick fire",line:QUICK_SECONDS+" seconds, as many as you can",icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"/><path d="M12 13V8.5M9.5 3h5"/></svg>'}];
const card=doc.createElement("section");
card.className="play-card";card.setAttribute("aria-label","Word games");
function bestText(id,b){
 const v=Number(b[id]);if(!Number.isFinite(v))return "";
 return id==="pairs"?"Best: "+v+" turns":id==="spell"?"Best: "+v+" of "+SPELL_ROUNDS:"Best: "+v;
}
function drawCard(){
 const b=bests(),n=pool().length,enough=n>=8;
 card.innerHTML='<div class="mini">Word games</div><p class="play-note">'+(enough?"A short break with the words of chapter"+(ctx.upto>0?"s 1 to "+(ctx.upto+1):" 1")+".":"Read a little further to unlock the games.")+'</p>'+
  GAMES.map(g=>'<button type="button" class="play-open" data-play="'+g.id+'"'+(enough?"":" disabled")+'>'+g.icon+'<span><strong>'+g.name+'</strong><small>'+(bestText(g.id,b)||g.line)+'</small></span></button>').join("");
}
card.addEventListener("click",event=>{
 const b=event.target.closest("[data-play]");if(!b||b.disabled)return;
 event.stopPropagation();sound("tick");open(b.dataset.play);
});

/* ---- The dialog ---------------------------------------------------------------- */
const dialog=doc.createElement("dialog");
dialog.className="play-dialog";dialog.setAttribute("aria-labelledby","playTitle");
doc.body.appendChild(dialog);
let game=null,timers=[];
const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);return t};
function stopTimers(){timers.forEach(clearTimeout);timers=[];if(game&&game.tick){clearInterval(game.tick);game.tick=null}}
function frame(title,body,foot){
 dialog.innerHTML='<div class="play-head"><h2 id="playTitle">'+title+'</h2><button type="button" class="play-close" data-g="close" aria-label="Close">✕</button></div><div class="play-body">'+body+'</div>'+(foot?'<div class="play-foot">'+foot+'</div>':"")+'<div class="sr-only" role="status" aria-live="polite" id="playLive"></div>';
}
function say(text){const el=dialog.querySelector("#playLive");if(el)el.textContent=text}
function show(){if(!dialog.open){if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}}
function close(){stopTimers();game=null;if(dialog.open&&typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");drawCard()}
dialog.addEventListener("close",()=>{stopTimers();game=null;drawCard()});
dialog.addEventListener("cancel",()=>{stopTimers()});
/* Keys and clicks inside the dialog stay inside it: the runtime's own shortcuts
   (1 to 4, Space) must not act on the page underneath. */
dialog.addEventListener("keydown",event=>{event.stopPropagation()});
dialog.addEventListener("click",event=>{
 event.stopPropagation();
 if(event.target===dialog){close();return} // the dimmed surround
 const b=event.target.closest("button");if(!b||b.disabled)return;
 const g=b.dataset.g;
 if(g==="close"){sound("tick");close();return}
 if(g==="again"){sound("tick");open(b.dataset.id);return}
 if(g==="next"){const go=ctx.onNext;close();if(go)go();return}
 if(game&&game.click)game.click(b);
});
function open(id){
 stopTimers();
 const words=pool();
 if(words.length<8)return;
 game=id==="pairs"?pairs(words):id==="spell"?spell(words):quick(words);
 show();game.draw();
}
function result(id,title,lines,isBest){
 stopTimers();
 frame(title,'<div class="play-result">'+wreath(true)+'<p class="play-score">'+lines[0]+'</p>'+(lines[1]?'<p class="subtle">'+lines[1]+'</p>':"")+(isBest?'<p class="play-best">A new best.</p>':"")+'</div>',
  '<button type="button" class="btn primary" data-g="again" data-id="'+id+'">Play again</button><button type="button" class="btn" data-g="close">Back to the lesson</button>');
 say(lines[0]);
 const first=dialog.querySelector("[data-g=again]");if(first)first.focus();
}

/* ---- Pairs --------------------------------------------------------------------- */
function pairs(words){
 const chosen=distinct(words,PAIRS);
 const cards=mix(chosen.flatMap(w=>[{head:w.head,text:ctx.spell(w.head),latin:true},{head:w.head,text:w.meaning,latin:false}]));
 const state={turns:0,open:[],done:new Set(),lock:false};
 function draw(){
  frame("Pairs",'<p class="play-hint">Turn two cards. A Latin word and its meaning make a pair.</p><div class="pairs-grid">'+cards.map((c,i)=>{
   const up=state.open.includes(i)||state.done.has(i);
   return '<button type="button" class="pair-card'+(up?" is-up":"")+(state.done.has(i)?" is-done":"")+'" data-i="'+i+'" aria-label="'+(up?esc(c.text):"Card "+(i+1)+", face down")+'"'+(state.done.has(i)?" disabled":"")+'><span class="pair-back" aria-hidden="true">✦</span><span class="pair-face"'+(c.latin?' lang="la"':"")+'>'+esc(c.text)+'</span></button>';
  }).join("")+'</div>','<span class="play-count">Turns: <b>'+state.turns+'</b></span><span class="play-count">Pairs: <b>'+state.done.size/2+' / '+chosen.length+'</b></span>');
 }
 function flip(i,up){
  const el=dialog.querySelector('.pair-card[data-i="'+i+'"]');if(!el)return null;
  el.classList.toggle("is-up",up);el.setAttribute("aria-label",up?cards[i].text:"Card "+(i+1)+", face down");return el;
 }
 function counts(){const c=dialog.querySelectorAll(".play-count b");if(c[0])c[0].textContent=state.turns;if(c[1])c[1].textContent=state.done.size/2+" / "+chosen.length}
 function click(b){
  if(b.dataset.i===undefined||state.lock)return;
  const i=Number(b.dataset.i);
  if(state.done.has(i)||state.open.includes(i))return;
  sound("tick");flip(i,true);state.open.push(i);say(cards[i].text);
  if(state.open.length<2)return;
  const [a,z]=state.open;state.turns++;
  if(cards[a].head===cards[z].head&&cards[a].latin!==cards[z].latin){
   state.done.add(a);state.done.add(z);state.open=[];sound("correct");
   for(const k of [a,z]){const el=dialog.querySelector('.pair-card[data-i="'+k+'"]');if(el){el.classList.add("is-done");el.disabled=true}}
   burst(dialog.querySelector('.pair-card[data-i="'+z+'"]'));counts();
   if(state.done.size===cards.length)later(()=>result("pairs","Pairs",["All "+chosen.length+" pairs in "+state.turns+" turns.","The fewest possible is "+chosen.length+"."],keepBest("pairs",state.turns,true)),700);
  }else{
   state.lock=true;sound("wrong");counts();
   later(()=>{flip(a,false);flip(z,false);state.open=[];state.lock=false},calm()?1100:900);
  }
 }
 return {draw,click};
}

/* ---- Letter tiles -------------------------------------------------------------- */
function spell(words){
 const fits=w=>{const n=[...ctx.spell(w.head)].length;return n>=3&&n<=9&&!/[\s-]/.test(w.head)};
 const rounds=distinct(words.filter(fits),SPELL_ROUNDS);
 const state={round:0,solved:0,shown:false,tiles:[],picked:[]};
 function deal(){
  const letters=[...ctx.spell(rounds[state.round].head).toLowerCase()];
  let order=mix(letters.map((ch,i)=>({ch,id:i})));
  for(let n=0;n<8&&order.map(t=>t.ch).join("")===letters.join("");n++)order=mix(order);
  state.tiles=order;state.picked=[];state.shown=false;
 }
 function draw(bad){
  const w=rounds[state.round],target=[...ctx.spell(w.head).toLowerCase()];
  frame("Letter tiles",'<p class="play-hint">Word '+(state.round+1)+' of '+rounds.length+'. Tap the letters in order.</p><p class="spell-meaning">'+esc(w.meaning)+'</p>'+
   '<div class="spell-slots'+(bad?" is-bad":"")+'" lang="la" aria-label="Your word">'+target.map((_,i)=>{const t=state.picked[i];return '<button type="button" class="spell-slot'+(t?" is-full":"")+'" data-slot="'+i+'"'+(t?' aria-label="Remove '+esc(t.ch)+'"':' disabled aria-label="Empty"')+'>'+(t?esc(t.ch):"")+'</button>'}).join("")+'</div>'+
   '<div class="spell-tiles" lang="la">'+state.tiles.map(t=>'<button type="button" class="spell-tile" data-tile="'+t.id+'"'+(state.picked.includes(t)?" disabled":"")+'>'+esc(t.ch)+'</button>').join("")+'</div>',
   '<span class="play-count">Solved: <b>'+state.solved+'</b></span><button type="button" class="btn" data-g2="clear">Clear</button><button type="button" class="btn" data-g2="show">Show the word</button>');
  const next=dialog.querySelector(".spell-tile:not(:disabled)");if(next)next.focus();
 }
 function advance(){
  state.round++;
  if(state.round>=rounds.length)return result("spell","Letter tiles",[state.solved+" of "+rounds.length+" words built without help."],keepBest("spell",state.solved,false));
  deal();draw();
 }
 function click(b){
  const w=rounds[state.round],target=ctx.spell(w.head).toLowerCase();
  if(b.dataset.g2==="clear"){sound("tick");state.picked=[];return draw()}
  if(b.dataset.g2==="show"){
   sound("tick");state.shown=true;
   frame("Letter tiles",'<p class="play-hint">Word '+(state.round+1)+' of '+rounds.length+'.</p><p class="spell-meaning">'+esc(w.meaning)+'</p><p class="spell-answer" lang="la">'+esc(ctx.spell(w.head))+'</p>','<button type="button" class="btn primary" data-g2="next">Next word</button>');
   const n=dialog.querySelector("[data-g2=next]");if(n)n.focus();return;
  }
  if(b.dataset.g2==="next")return advance();
  if(b.dataset.slot!==undefined){sound("tick");state.picked.splice(Number(b.dataset.slot),1);return draw()}
  if(b.dataset.tile===undefined)return;
  const tile=state.tiles.find(t=>String(t.id)===b.dataset.tile);if(!tile||state.picked.includes(tile))return;
  state.picked.push(tile);sound("tick");
  if(state.picked.length<state.tiles.length)return draw();
  if(state.picked.map(t=>t.ch).join("")===target){
   state.solved++;sound("correct");draw();say("Right: "+w.head);
   const slots=dialog.querySelector(".spell-slots");if(slots){slots.classList.add("is-good");burst(slots)}
   dialog.querySelectorAll(".spell-slot,.spell-tile,[data-g2]").forEach(x=>{x.disabled=true});
   later(advance,calm()?900:1100);
  }else{sound("wrong");state.picked=[];draw(true);say("Not that order. Try again.")}
 }
 deal();
 return {draw:()=>draw(),click};
}

/* ---- Quick fire ---------------------------------------------------------------- */
function quick(words){
 const state={score:0,asked:0,left:QUICK_SECONDS,item:null,lock:false,last:"",started:false};
 function pick(){
  for(let n=0;n<20;n++){
   const w=words[Math.floor(Math.random()*words.length)];if(w.head===state.last)continue;
   const item=WC.buildItem(ctx.chapters,w,Math.random()<.5?"meaning":"latin",ctx.formNotes,"quick|"+Math.random());
   if(item){state.last=w.head;return item}
  }
  return null;
 }
 function draw(){
  if(!state.started){
   frame("Quick fire",'<p class="play-hint">'+QUICK_SECONDS+' seconds. Each question takes one answer, then the next one comes. Wrong answers cost nothing but time.</p>','<button type="button" class="btn primary" data-g2="start">Start</button>');
   const s=dialog.querySelector("[data-g2=start]");if(s)s.focus();return;
  }
  const item=state.item,latin=item.kind==="latin";
  frame("Quick fire",'<div class="quick-bar" aria-hidden="true"><i style="animation-duration:'+QUICK_SECONDS+'s;animation-delay:-'+(QUICK_SECONDS-state.left)+'s"></i></div>'+
   '<p class="quick-ask">'+(latin?'Which word means <strong>'+esc(item.meaning)+'</strong>?':'<strong lang="la">'+esc(ctx.spell(item.head))+'</strong>')+'</p>'+
   '<div class="quick-options">'+item.options.map((o,i)=>'<button type="button" class="quick-option" data-q="'+i+'"'+(latin?' lang="la"':"")+'>'+esc(latin?ctx.spell(o):o)+'</button>').join("")+'</div>',
   '<span class="play-count">Score: <b>'+state.score+'</b></span><span class="play-count" id="quickLeft">'+state.left+' s</span>');
  const first=dialog.querySelector(".quick-option");if(first)first.focus();
 }
 function finish(){result("quick","Quick fire",[state.score+" right in "+QUICK_SECONDS+" seconds.",state.asked?state.asked+" answered.":""],keepBest("quick",state.score,false))}
 function nextItem(){state.item=pick();state.lock=false;if(!state.item)return finish();draw()}
 function click(b){
  if(b.dataset.g2==="start"){
   sound("tick");state.started=true;state.left=QUICK_SECONDS;
   game.tick=setInterval(()=>{state.left--;const el=dialog.querySelector("#quickLeft");if(el)el.textContent=Math.max(0,state.left)+" s";if(state.left<=0){clearInterval(game.tick);game.tick=null;finish()}},1000);
   return nextItem();
  }
  if(b.dataset.q===undefined||state.lock||!state.item)return;
  const item=state.item,choice=item.options[Number(b.dataset.q)],ok=choice===item.answer;
  state.lock=true;state.asked++;
  dialog.querySelectorAll(".quick-option").forEach((el,i)=>{el.disabled=true;if(item.options[i]===item.answer)el.classList.add("is-correct")});
  if(ok){state.score++;sound("correct");burst(b)}else{b.classList.add("is-wrong");sound("wrong")}
  const c=dialog.querySelector(".play-count b");if(c)c.textContent=state.score;
  later(()=>{if(state.left>0)nextItem()},ok?350:1100);
 }
 return {draw,click,tick:null};
}

/* ---- Flourishes ---------------------------------------------------------------- */
/* A laurel wreath: two branches of leaves, drawn leaf by leaf. */
function wreath(small){
 let leaves="";
 for(let i=0;i<10;i++){
  const deg=262-i*15,t=deg*Math.PI/180,x=50+38*Math.cos(t),y=52-38*Math.sin(t),turn=180-deg-(i%2?40:14);
  const leaf=(px,r)=>'<path class="wreath-leaf" style="animation-delay:'+(i*55)+'ms" transform="translate('+px.toFixed(1)+' '+y.toFixed(1)+') rotate('+r.toFixed(0)+')" d="M0 0C3.4 -5 3.4 -11 0 -15C-3.4 -11 -3.4 -5 0 0Z"/>';
  leaves+=leaf(x,turn)+leaf(100-x,-turn);
 }
 return '<svg class="wreath'+(small?" is-small":"")+'" viewBox="0 0 100 100" aria-hidden="true"><path class="wreath-stem" d="M45 89.6A38 38 0 0 1 28 21M55 89.6A38 38 0 0 0 72 21"/>'+leaves+'</svg>';
}
/* Laurel leaves thrown out from an element that was just answered correctly. */
function burst(el){
 if(!el||calm()||typeof el.getBoundingClientRect!=="function")return;
 const r=el.getBoundingClientRect();if(!r.width)return;
 const box=doc.createElement("div");box.className="leaf-burst";box.setAttribute("aria-hidden","true");
 const host=dialog.open?dialog:doc.body;
 box.style.left=(r.left+Math.min(r.width/2,120))+"px";box.style.top=(r.top+r.height/2)+"px";
 for(let i=0;i<10;i++){
  const leaf=doc.createElement("i"),angle=(-160+i*14+Math.random()*10)*Math.PI/180,far=46+Math.random()*44;
  leaf.style.setProperty("--dx",(Math.cos(angle)*far).toFixed(0)+"px");
  leaf.style.setProperty("--dy",(Math.sin(angle)*far).toFixed(0)+"px");
  leaf.style.setProperty("--turn",(Math.random()*240-120).toFixed(0)+"deg");
  leaf.style.animationDelay=(i*18)+"ms";
  box.appendChild(leaf);
 }
 host.appendChild(box);setTimeout(()=>box.remove(),1300);
}
/* A light that runs along the top edge of the page: gold for right, a dull red for wrong. */
function edge(kind){
 const el=doc.querySelector(".codex");if(!el||!el.classList)return;
 el.classList.remove("edge-good","edge-bad");void el.offsetWidth;
 el.classList.add(kind==="good"?"edge-good":"edge-bad");
}
/* Shown once, when the third step of a lesson is completed. */
function celebrate(info){
 stopTimers();game=null;ctx.onNext=info.onNext||null;
 frame("Lesson "+info.number+" complete",'<div class="play-result is-lesson">'+wreath(false)+'<p class="play-score" lang="la">'+esc(info.name)+'</p><p>You read the story, answered the questions and passed the word check'+(Number.isFinite(info.best)?" with "+Math.round(info.best*100)+"%":"")+'.</p>'+(Number.isFinite(info.known)?'<p class="subtle">Words known so far: '+info.known+'.</p>':"")+'</div>',
  (info.last?"":'<button type="button" class="btn primary" data-g="next">Next chapter →</button>')+'<button type="button" class="btn" data-g="close">Stay on this chapter</button>');
 show();say("Lesson "+info.number+" complete.");
 const first=dialog.querySelector(".play-foot .btn");if(first)first.focus();
}
function mount(host,options){
 if(options)ctx={...ctx,...options};
 if(!host||typeof host.appendChild!=="function")return;
 if(card.parentNode!==host||host.lastElementChild!==card)host.appendChild(card);
 drawCard();
}
root.TablinumPlay=Object.freeze({mount,burst,edge,celebrate,close,ready:true});
})(typeof globalThis!=="undefined"?globalThis:this);
