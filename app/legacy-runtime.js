
(function(){
"use strict";
const L=Array.from({length:8},(_,index)=>globalThis.Tablinum.legacySourceAt(index));

const shared=[["in","in",""],["et","and",""],["haec","this (feminine)",""],["hic","this (masculine)",""],["quis","who",""],["quid","what",""],["ubi","where",""],["quō","where to",""],["cui","to whom",""],["cuius","whose",""],["an","or (in a question)",""],["est","is",""],["sunt","are",""],["sed","but",""],["nōn","not",""],["quoque","also",""],["cum","with",""],["ad","to, toward",""],["ē","from",""],["sub","under",""],["habet","has",""],["habēmus","we have",""],["nunc","now",""],["omnēs","everyone",""],["prope","near",""],["homō","person","hominēs"],["māter","mother","mātrem mātrī"],["pater","father","patrem patrī"],["grātiās","thanks",""],["agere","to do, drive; express thanks","agō"],["respondēre","to answer","respondet"],["nōlī","do not (singular command)",""],["timēre","to fear",""],["parāre","to prepare","parāmus"],["rosa","rose","rosās"],["sē","himself/herself/themselves",""],["Titus","Titus","Titō Titum"],["Mārcus","Marcus","Mārcum"],["quam","whom/which (feminine accusative)",""],["per","through",""]];
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g,"").trim().replace(/\s+/g," ")}
const dict=Object.create(null);
for(const w of [...shared,...L.flatMap(c=>c.v)]){
 for(const form of [w[0],...String(w[2]||"").split(/\s+/)]){
  if(form&&!Object.prototype.hasOwnProperty.call(dict,norm(form)))dict[norm(form)]={head:w[0],meaning:w[1]};
 }
}
// Only compiler-published, actually approved new lexemes may enter the lookup.
// Never promote the 128 unsigned legacy candidates or proposed paradigms.
const publishedLexicon=globalThis.TablinumCompiledContent&&globalThis.TablinumCompiledContent.lexicon;
if(publishedLexicon&&publishedLexicon.schema==="tablinum-content-lexicon-v1"&&Array.isArray(publishedLexicon.lexemes)){
 for(const lexeme of publishedLexicon.lexemes){
  if(lexeme.status!=="approved"||!lexeme.head)continue;
  const meaning=lexeme.senses&&lexeme.senses[0]&&lexeme.senses[0].gloss_en||"See the chapter context.";
  for(const surface of [lexeme.head,...(Array.isArray(lexeme.forms)?lexeme.forms.filter(f=>f.reviewed===true).map(f=>f.surface):[])]){
   if(surface&&!Object.prototype.hasOwnProperty.call(dict,norm(surface)))dict[norm(surface)]={head:lexeme.head,meaning};
  }
 }
}
const guidedCloze=[
 {text:"Arbor magna est. In hortō est ____ magna.",answers:["arbor"],clue:"Arbor est magna; puella parva est.",proof:"In hortō est arbor magna."},
 {text:"Līvia soror ____ est.",answers:["Titī"],clue:"Quis est frāter Līviae?",proof:"Līvia soror Titī est."},
 {text:"Līvia rosam mātrī ____.",answers:["dat"],clue:"Quid Līvia facit?",proof:"Līvia rosam mātrī dat."},
 {text:"Titus pānem ____.",answers:["edit"],clue:"Quid Titus facit?",proof:"Titus pānem edit."},
 {text:"Mārcus duo māla ____.",answers:["emit","habet"],clue:"Quid in forō Mārcus facit?",proof:"Mārcus duo māla emit."},
 {text:"Canis in viā ____.",answers:["currit","est"],clue:"Canis nōn sedet.",proof:"Canis in viā currit."},
 {text:"Herī pluvia ____.",answers:["erat"],clue:"Herī, nōn hodiē.",proof:"Herī pluvia erat."},
 {text:"Crās familia amīcum ____.",answers:["vīsitābit"],clue:"Quid familia crās faciet?",proof:"Crās familia amīcum vīsitābit."}
];
// Contextual hints reuse story material; do not introduce unreviewed Latin.
function contextualClue(chapter,sentenceIndex){
 if(sentenceIndex===0)return chapter.context||chapter.sent[0]?.[0]||"";
 return chapter.sent[sentenceIndex-1]?.[0]||chapter.context||"";
}
const key="tablinum-source-review-v02";
const tabsList=["read","quiz","review","library","progress"];
const base={version:4,ch:0,tab:"read",sel:0,macrons:true,guided:true,translations:{},answers:{},correct:{},vocab:{},notes:{},custom:"",customSentences:[],hintLevels:{},clozeAnswers:{},clozeCorrect:{},readingConfidence:{},singleSentence:false};
function objectOrEmpty(x){return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}
function safeMap(o,accept,limit=2500){
 const map=Object.create(null);let n=0;
 for(const [k,v] of Object.entries(objectOrEmpty(o))){
  n++; // Phase 3c: never silently discard later notes/cards from older profiles.
  if(k==="__proto__"||k==="constructor"||k==="prototype"||k.length>80)continue;
  const checked=accept(v,k);
  if(checked!==undefined)map[k]=checked;
 }
 return map;
}
function isFiniteNum(x){return typeof x==="number"&&Number.isFinite(x)}
function normalizeState(input){
 const x=objectOrEmpty(input),o={...base};
 o.custom=typeof x.custom==="string"?x.custom:"";
 o.customSentences=Array.isArray(x.customSentences)?x.customSentences.filter(z=>typeof z==="string"&&z.trim()):[];
 o.ch=x.ch==="custom"&&o.custom?"custom":Number.isInteger(x.ch)&&x.ch>=0&&x.ch<L.length?x.ch:0;
 o.tab=tabsList.includes(x.tab)?x.tab:"read";
 const n=o.ch==="custom"?(o.customSentences.length||splitSentences(o.custom).length):L[o.ch].sent.length;
 o.sel=Number.isInteger(x.sel)?(globalThis.Tablinum?.errors?.length?Math.max(x.sel,0):Math.min(Math.max(x.sel,0),Math.max(n-1,0))):0;
 o.macrons=typeof x.macrons==="boolean"?x.macrons:true;
 o.guided=typeof x.guided==="boolean"?x.guided:true;
 o.singleSentence=x.singleSentence===true;
 o.translations=safeMap(x.translations,v=>typeof v==="boolean"?v:undefined);
 o.answers=safeMap(x.answers,v=>typeof v==="string"?v:undefined);
 o.correct=safeMap(x.correct,v=>v===true?true:undefined);
 o.notes=safeMap(x.notes,v=>typeof v==="string"?v:undefined);
 o.hintLevels=safeMap(x.hintLevels,v=>Number.isInteger(v)&&v>=0&&v<=3?v:undefined);
 o.clozeAnswers=safeMap(x.clozeAnswers,v=>typeof v==="string"?v:undefined);
 o.clozeCorrect=safeMap(x.clozeCorrect,v=>v===true?true:undefined);
 o.readingConfidence=safeMap(x.readingConfidence,v=>["difficult","developing","confident"].includes(v)?v:undefined);
 o.vocab=safeMap(x.vocab,v=>{
  if(!v||typeof v!=="object"||Array.isArray(v))return;
  return {head:typeof v.head==="string"?v.head:"",meaning:typeof v.meaning==="string"?v.meaning:"",
   days:isFiniteNum(v.days)&&v.days>0&&v.days<=10000?v.days:1,due:isFiniteNum(v.due)&&v.due>=0?v.due:Date.now(),
   reps:Number.isInteger(v.reps)&&v.reps>=0?v.reps:0};
 },10000);
 return o;
}
function splitSentences(input){
 const text=String(input||"").replace(/\r/g,"");
 const protectedText=text.replace(/\b([A-Z])\.\s+(?=[A-Z])/g,"$1\uFFF0 ");
 return protectedText.replace(/([.!?])\s+/g,"$1\n").split(/\n+/).map(v=>v.replace(/\uFFF0/g,".").trim()).filter(Boolean).slice(0,300);
}
const stateApi=globalThis.TablinumStateV5,maps=globalThis.TablinumMigrationMaps;
if(!stateApi||!maps)throw Error("Migration scripts are missing; re-extract the complete Tablinum ZIP.");
const legacyIdMap=maps.legacy_id_map,legacyVocabMap=maps.legacy_vocab_map;
let storage;try{storage=globalThis.localStorage}catch(e){storage={getItem(){throw e},setItem(){throw e}}}
const boot=stateApi.bootstrap(storage,legacyIdMap,legacyVocabMap,globalThis.Tablinum.errors.length===0);
let storageMode=boot.mode,v5State=boot.state,warning=boot.warning;
if(!warning&&storageMode==="ready"){
 const backup=v5State.backup||{},last=Date.parse(backup.lastExportAt||"");
 const days=Number.isInteger(backup.backupReminderDays)&&backup.backupReminderDays>0?backup.backupReminderDays:30;
 if(!Number.isFinite(last)||Date.now()-last>=days*86400000)warning="It is time to export a progress backup.";
}
let S=normalizeState(stateApi.legacyView(v5State,legacyIdMap));
/* Guided lessons: answers to word checks. Kept beside the v5 fields, so it is saved,
 * exported and restored with them. */
const WC=globalThis.TablinumWordChecks;
let learning=WC?WC.normalise(v5State.learning):null;
function save(){
 if(globalThis.Tablinum.errors.length){
  warning="Chapter file missing. Stored progress has NOT been changed. Re-extract the complete ZIP.";
  return false;
 }
 if(storageMode==="blocked"||storageMode==="content_missing"){
  warning="Existing storage could not be safely upgraded. Restore a backup or explicitly re-migrate.";
  return false;
 }
 v5State=stateApi.updateFromLegacy(v5State,S,legacyIdMap,legacyVocabMap);
 if(learning)v5State.learning=learning;
 if(activeCourse){
  v5State.ui.chapterId=activeCourse.id;
  v5State.ui.sel=activeCourse.id+"-s"+String(S.sel+1).padStart(3,"0");
 }
 const result=stateApi.persist(storage,v5State);
 v5State=result.state;
 if(!result.ok){storageMode="memory";warning=result.warning;return false}
 storageMode="ready";
 if(result.warning)warning=result.warning;
 return true;
}
const ambience=globalThis.TablinumAmbience;
if(ambience)ambience.configure(v5State.ui.audio,settings=>{v5State.ui.audio=settings;save()});
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const spell=s=>S.macrons?String(s):String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const audio=new Audio();
const mediaByChapter=new Map();
const userMedia=globalThis.TablinumUserMedia;
const narration=globalThis.TablinumNarration; // owner-approved whole-sentence MP3s, optional
let narrationTake=null;
let compareSound=null,compareURL=null;
function currentSentenceId(){
 if(activeCourse)return activeCourse.id+"-s"+String(S.sel+1).padStart(3,"0");
 if(S.ch==="custom")return "custom-s"+String(S.sel+1).padStart(3,"0");
 return "legacy-ch"+String(Number(S.ch)+1).padStart(2,"0")+"-s"+String(S.sel+1).padStart(3,"0");
}
function currentTimingChapter(){
 if(activeCourse)return activeCourse;
 const id=S.ch==="custom"?"custom":"legacy-ch"+String(Number(S.ch)+1).padStart(2,"0");
 return {id,segments:[{sentences:current().sent.map((x,i)=>({id:id+"-s"+String(i+1).padStart(3,"0")}))}]};
}
function exportLocalBlob(name,blob){
 const link=document.createElement("a"),url=URL.createObjectURL(blob);
 link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function stopCompare(){
 if(compareSound){compareSound.pause();compareSound.removeAttribute("src");compareSound=null}
 if(compareURL){URL.revokeObjectURL(compareURL);compareURL=null}
 if(ambience)ambience.duck(!audio.paused||readingIndex!==null);
}
async function compareRecording(){
 if(!userMedia)return updateBanner("Local recording module is unavailable.");
 const rec=await userMedia.getRecording(chapterKey(),currentSentenceId());
 if(!rec?.blob)return updateBanner("No speaking practice saved for this sentence.");
 stopCompare();compareURL=URL.createObjectURL(rec.blob);compareSound=new Audio(compareURL);
 compareSound.onended=stopCompare;compareSound.onerror=()=>{stopCompare();updateBanner("Cannot play this recording format in your browser.")};
 if(ambience)ambience.duck(true);
 try{await compareSound.play()}catch(e){stopCompare();updateBanner("Speaking playback was blocked; use the Play button again.")}
}
let chosenWord="",reviewKey=null,reviewReveal=false,readingIndex=null,spokenVoice="",speechRequest=0,voicePaused=false,boundaryFrame=0;
const exposureSession=new Set();
let activeCourse=null,courseRequest=0; // Phase 3b: approved course chapter is ephemeral until v5 migration.
function chapterKey(){return activeCourse?activeCourse.id:String(S.ch)}
function current(){
 if(activeCourse){
  const c=activeCourse;
  return {name:c.title,sub:c.subtitle_la||"Original Latin course",scene:"book",
   context:c.subtitle_la||"",explain:"Published original Latin chapter; exercise engine is coming in Phase 5.",
   sent:(c.segments||[]).flatMap(seg=>(seg.sentences||[]).map(item=>[item.text_la,item.en||""])),
   q:[],v:[],courseChapter:c.chapter};
 }
 if(S.ch==="custom"){
  const pieces=S.customSentences.length?S.customSentences:splitSentences(S.custom);
  return{name:"Textus meus",sub:"My imported reading",scene:"book",context:"Textus tuus",explain:"Imported texts have not been checked or annotated.",sent:pieces.map(z=>[z,""]),q:[],v:[]};
 }
 return L[S.ch];
}
function media(){return mediaByChapter.get(chapterKey())}
function timed(){
 const m=media();return !!m&&m.ranges.length===current().sent.length&&m.ranges.length>0;
}
function mode(){return !media()?"voice":timed()?"timed":"untimed"}
/* `fresh` names the thing that has just changed (an answered question, a revealed card, a new
 * view), so the stylesheet can animate it once instead of on every re-render. */
let fresh="",lastView="",transientText="";
/* Restart a one-shot CSS animation class on an element. */
function replay(el,cls,on=true){
 if(!el||!el.classList||typeof el.classList.remove!=="function")return;
 el.classList.remove(cls);void el.offsetWidth;if(on)el.classList.add(cls);
}
function updateBanner(msg){
 if(msg){warning=msg;transientText=msg}
 const el=$("appStatus");if(!el)return;
 const text=warning||"";
 if(el.textContent!==text||msg){
  el.textContent=text;
  replay(el,"is-new",!!text);
 }
}
function clearVoice(){
 if(ambience)ambience.duck(!audio.paused);
 speechRequest++;readingIndex=null;voicePaused=false;
 if(narration)narration.stop();narrationTake=null;
 if("speechSynthesis" in window)try{speechSynthesis.cancel()}catch(e){}
}
function stopBoundaryMonitor(){
 if(boundaryFrame&&typeof cancelAnimationFrame==="function")cancelAnimationFrame(boundaryFrame);
 boundaryFrame=0;
}
function startBoundaryMonitor(){
 stopBoundaryMonitor();
 if(!S.singleSentence||!timed()||typeof requestAnimationFrame!=="function")return;
 const chapter=chapterKey(),interval=media()?.ranges[S.sel];
 if(!interval)return;
 const boundary=interval.end;
 function tick(){
  boundaryFrame=0;
  if(chapter!==chapterKey()||audio.paused||!S.singleSentence||!timed())return;
  // Approximately one animation-frame tolerance; exact audio sample accuracy is NOT claimed.
  if(audio.currentTime>=boundary-0.025){audio.pause();return}
  boundaryFrame=requestAnimationFrame(tick);
 }
 boundaryFrame=requestAnimationFrame(tick);
}
function stopAudio(){stopBoundaryMonitor();audio.pause()}
function useChapterAudio(){
 stopAudio();audio.removeAttribute("src");audio.load();
 const key=chapterKey(),m=media();if(m){audio.src=m.url;audio.load();}
 updateDock();
 if(!m&&userMedia){
  userMedia.getAudio(key).then(rec=>{
   if(!rec?.blob||chapterKey()!==key||mediaByChapter.has(key))return;
   mediaByChapter.set(key,{url:URL.createObjectURL(rec.blob),name:rec.name||"Local recording",ranges:[]});
   return userMedia.getTiming(key).then(timing=>{
    if(timing?.timing?.ranges){
     try{mediaByChapter.get(key).ranges=validateRanges(timing.timing.ranges,current().sent.length,NaN)}
     catch(e){updateBanner("Stored timing intervals failed validation; audio remains untimed.")}
    }
   }).then(()=>{if(chapterKey()===key){useChapterAudio();render()}});
  }).catch(()=>{});
 }
}
function setChapter(id){
 if(id==="custom"&&!S.custom)return;
 courseRequest++;activeCourse=null;
 clearVoice();
 S.ch=id==="custom"?"custom":Math.min(L.length-1,Math.max(0,Number(id)||0));
 S.sel=0;S.tab="read";chosenWord="";
 useChapterAudio();save();render();
}
function setCourseChapter(id){
 const entry=globalThis.Tablinum.catalogue.get(id);
 if(!entry||entry.legacy)return updateBanner("Unknown or unpublished Latin chapter "+id);
 const request=++courseRequest;
 clearVoice();stopAudio();updateBanner("Legō… Loading local Latin chapter "+id);
 globalThis.Tablinum.loadChapter(id).then(chapter=>{
  if(request!==courseRequest)return;
  activeCourse=chapter;chosenWord="";S.sel=0;S.tab="read";warning="";
  useChapterAudio();save();render();
 }).catch(error=>{
  if(request!==courseRequest)return;
  const message=error.message||"Chapter file is missing.";
  updateBanner(message);
  $("main").innerHTML='<div class="note" role="alert">'+esc(message)+'</div><p>Re-extract the full Tablinum ZIP to restore missing content files.</p>';
 });
}
function switchTab(id){
 if(!tabsList.includes(id))return;
 if(warning&&warning===transientText)warning=""; // a passing message does not follow the learner to another section
 clearVoice();S.tab=id;save();render();
}
function stableFocus(){
 const el=document.activeElement;
 if(!el||!el.dataset)return null;
 // A typed answer re-renders the page; keep the caret in the same answer field.
 if(typeof el.id==="string"&&/^(answer-\d+|clozeInput|exercise-.+)$/.test(el.id))return{id:el.id};
 const props=["tab","ch","course","action","hint","guided","choice","check","clozeCheck","confidence","sentence","word","save","rating"];
 for(const p of props)if(el.dataset[p]!==undefined)return{p,v:el.dataset[p],sentence:el.closest?.("[data-sentence-container]")?.dataset.sentenceContainer??null,wordIndex:el.dataset.wordIndex??null,hint:!!el.closest?.(".hint-words")};
 return null;
}
function restoreFocus(record){
 if(!record)return;
 if(record.id){const field=$(record.id);if(field&&!field.disabled&&field.focus)field.focus({preventScroll:true});return}
 const elements=document.querySelectorAll("[data-"+record.p.replace(/[A-Z]/g,z=>"-"+z.toLowerCase())+"]");
 for(const e of elements)if(e.dataset[record.p]===record.v&&(record.sentence===null||e.closest?.("[data-sentence-container]")?.dataset.sentenceContainer===record.sentence)&&(record.wordIndex===null||e.dataset.wordIndex===record.wordIndex)&&(!record.hint||!!e.closest?.(".hint-words"))){e.focus({preventScroll:true});return}
}
function scene(type){
const bg='<rect width="600" height="245" fill="#e7f0e1"/><circle cx="492" cy="57" r="32" fill="#f0d28c"/><path d="M0 180Q135 151 300 178T600 168V245H0" fill="#c3dbb5"/><path d="M0 216Q230 190 600 205V245H0" fill="#a3c397"/>';
const tree='<rect x="112" y="87" width="23" height="123" rx="6" fill="#92775f"/><circle cx="125" cy="75" r="56" fill="#79ac7c"/><circle cx="98" cy="94" r="34" fill="#88ba89"/><circle cx="158" cy="86" r="37" fill="#669b70"/>';
const human=(x,y,c,s=1)=>`<g transform="translate(${x},${y}) scale(${s})"><circle cy="-43" r="15" fill="#d8a481"/><path d="M-16 -23H16L25 44H-25Z" fill="${c}"/><path d="M-11 45L-13 67M11 45L13 67" stroke="#595c59" stroke-width="8" stroke-linecap="round"/><path d="M-15 -7L-28 24M15 -7L28 24" stroke="#d8a481" stroke-width="7" stroke-linecap="round"/></g>`;
const house='<path d="M181 88L319 24 456 88" fill="none" stroke="#aa8064" stroke-width="14"/><rect x="194" y="84" width="252" height="113" fill="#e4c5a1" stroke="#c3997a" stroke-width="3"/><rect x="302" y="126" width="44" height="71" fill="#836349"/><rect x="222" y="111" width="36" height="37" fill="#8badab"/><rect x="385" y="111" width="36" height="37" fill="#8badab"/>';
let art="";
switch(type){
case"garden":art=tree+human(335,158,"#aa738a")+ '<text x="131" y="235" fill="#365c46" font-size="17" text-anchor="middle">arbor</text>';break;
case"family":art=house+human(104,160,"#7593a7",.8)+human(178,157,"#b27985",.8)+human(477,161,"#b79f62",.8)+human(544,162,"#879b81",.72);break;
case"gift":art=tree+human(317,164,"#b27985",.91)+human(447,164,"#6e9ca7",.89)+'<circle cx="385" cy="131" r="13" fill="#b95b69"/><path d="M371 134Q380 147 400 150" stroke="#538360" stroke-width="5" fill="none"/>';break;
case"table":art='<rect x="102" y="143" width="394" height="23" rx="8" fill="#a77e57"/><path d="M121 164V223M481 164V223" stroke="#94724e" stroke-width="16"/><ellipse cx="300" cy="135" rx="82" ry="15" fill="#dfc78c"/><ellipse cx="300" cy="135" rx="48" ry="8" fill="#ac8655"/>'+human(120,132,"#a87782",.75)+human(488,132,"#7298a7",.75);break;
case"market":art='<rect x="97" y="106" width="410" height="100" fill="#e0c6a3"/><path d="M87 106L123 65H475L513 106Z" fill="#c27962"/><path d="M133 66V106M221 66V106M309 66V106M397 66V106" stroke="#f1dfbe" stroke-width="20"/><rect x="136" y="143" width="321" height="20" fill="#9e7653"/><circle cx="232" cy="135" r="13" fill="#bdc975"/><circle cx="278" cy="135" r="13" fill="#c47764"/><circle cx="324" cy="135" r="13" fill="#c47764"/>';break;
case"dog":art=human(445,161,"#a87782",.88)+'<ellipse cx="187" cy="177" rx="54" ry="29" fill="#bd946c"/><circle cx="227" cy="152" r="25" fill="#bd946c"/><path d="M228 130L253 110 248 148" fill="#997453"/><path d="M146 176Q103 141 101 154" fill="none" stroke="#bd946c" stroke-width="12"/><path d="M159 190V220M206 190V220" stroke="#917153" stroke-width="11"/>';break;
case"rain":art=house+Array.from({length:27},(_,i)=>`<path d="M${(i*77)%560+15} ${(i*47)%155+5}l-10 20" stroke="#7c9ba6" stroke-width="3"/>`).join("");break;
case"journey":art=tree+'<path d="M229 245Q280 160 362 184T495 130" fill="none" stroke="#d7c1a0" stroke-width="47"/>'+human(345,145,"#ad7385",.8)+human(413,143,"#7596a8",.79);break;
default:art=tree+'<path d="M255 112Q303 92 307 131Q363 90 414 112V202Q345 180 307 208Q274 183 255 202Z" fill="#fff9eb" stroke="#91765d" stroke-width="3"/>';break
}
return `<div class="scene"><svg viewBox="0 0 600 245" role="img" aria-label="${esc(current().context)}">${type==="rain"?bg.replace(/<circle[^>]*\/>/,""):bg}${art}</svg><div class="caption">${esc(current().context)}</div></div>`
}

function renderWords(t){
 const words=spell(t).match(/[\p{L}\p{M}]+|[^\p{L}\p{M}]+/gu)||[];
 let first=true,wordIndex=0;
 return words.map(w=>{
  if(!/^[\p{L}\p{M}]/u.test(w))return esc(w);
  const tabbable=first;first=false;
  return '<button class="word'+(chosenWord&&norm(w)===norm(chosenWord)?" is-chosen":"")+'" lang="la" tabindex="'+(tabbable?0:-1)+'" data-word="'+esc(w)+'" data-word-index="'+(wordIndex++)+'" aria-label="Look up '+esc(w)+'">'+esc(w)+'</button>';
 }).join("");
}
function correctAnswer(q,response){
 return globalThis.TablinumExercises.gradeLegacy(q,response);
}
function tabs(){
 const list=[["read","Lēctiō","Read"],["quiz","Exercitia","Practise"],["review","Memoria","Review"],["progress","Prōgressus","Progress"]];
 $("tabs").innerHTML=list.map(([id,n,en])=>'<button class="'+(S.tab===id?"active":"")+'" data-tab="'+id+'" aria-current="'+(S.tab===id?"page":"false")+'"><span lang="la">'+n+'</span><small>'+en+"</small></button>").join("");
 const layout=document.querySelector(".layout");if(layout&&layout.dataset)layout.dataset.tab=S.tab;
 /* Share of a chapter's questions answered correctly, for the progress mark in the chapter list. */
 const chapterDone=(c,i)=>{
  if(WC){const p=lessonSteps(i);return p.fraction}
  return c.q&&c.q.length?c.q.filter((q,j)=>S.correct[i+":"+j]).length/c.q.length:0;
 };
 $("chapters").innerHTML='<div class="mini" style="margin:5px 9px 14px">Liber prīmus</div>'+L.map((c,i)=>'<button class="ch '+(S.ch===i&&!activeCourse?"active":"")+(chapterDone(c,i)>=1?" is-done":"")+'" data-ch="'+i+'" aria-current="'+(S.ch===i&&!activeCourse?"true":"false")+'"><strong>'+(i+1)+'</strong><span><strong>'+esc(c.name)+'</strong><small>'+esc(c.sub)+'</small></span><i class="ch-progress" aria-hidden="true" style="--p:'+chapterDone(c,i).toFixed(3)+'"></i>'+(chapterDone(c,i)>=1?'<span class="sr-only"> (lesson complete)</span>':"")+'</button>').join("")+(S.custom?'<button class="ch '+(S.ch==="custom"&&!activeCourse?"active":"")+'" data-ch="custom">✧ Textus meus</button>':"")+
 [...globalThis.Tablinum.catalogue.values()].filter(entry=>!entry.legacy).map(entry=>
 '<button class="ch '+(activeCourse&&activeCourse.id===entry.id?"active":"")+'" data-course="'+esc(entry.id)+'"><strong>'+esc(String(entry.chapter||"•"))+'</strong><span><strong>'+esc(entry.title)+'</strong><small>Original course · approved</small></span></button>').join("");
 updateDock();
}
function updateDock(){
 const m=mode(),take=narrationTake||currentNarrationTake(),state=narration&&take?narration.known(take):"none";
 if(state==="unknown"&&!narration.playing()){const sid=currentSentenceId();narration.probe(take).then(()=>{if(currentSentenceId()===sid)updateDock()})}
 const installed=m==="voice"&&take&&state==="installed";
 const voice=take?.voice||narration?.meta?.voice||"recorded voice";
 const approved=installed&&take.owner_listening==="pass";
 const pending=installed&&take.owner_listening==="pending";
 $("audioMode").textContent=m==="voice"&&narration?.labelFor?narration.labelFor(take,installed):(installed?voice+" — local recording":m==="voice"?"Browser voice — not "+voice:m==="timed"?"Imported audio — timing supplied":"Imported audio — unsynchronized");
 $("audioNote").textContent=installed?(approved?"Owner-accepted listening take ":pending?"New take awaiting owner listening review ":"Local recording ")+take.clip_id+" (not Latinist-verified). Whole sentence; no word timing.":m==="voice"?(take&&state==="missing"?voice+" recording "+take.clip_id+" is not in this copy. ":"")+"Device voice: "+(spokenVoice||"system default (unverified)"):m==="timed"?"Selected sentence has supplied intervals; not acoustically verified.":"Sentence selection does not seek. Play resumes at current position.";
 const playBtn=document.querySelector(".dock [data-action='play']");
 if(playBtn){playBtn.hidden=m==="voice";playBtn.textContent=m==="timed"?"▶ Play selected sentence":"▶ Play recording"}
 const pauseBtn=document.querySelector(".dock [data-action='pause']");
 if(pauseBtn)pauseBtn.textContent=m==="voice"?"■ Stop voice":"Ⅱ Pause";
 let takeBtn=document.querySelector(".dock [data-action='narrationTake']");
 if(!takeBtn&&narration&&pauseBtn&&pauseBtn.insertAdjacentHTML){
  // Built at runtime: index.html stays byte-locked to the archived v0.4.2 layout.
  pauseBtn.insertAdjacentHTML("afterend",'<button class="btn" data-action="narrationTake" aria-pressed="false" title="Switch between the two owner-accepted takes" hidden>Alt take</button>');
  takeBtn=document.querySelector(".dock [data-action='narrationTake']");
 }
 if(takeBtn){
  const line=current().sent[S.sel],sid=currentSentenceId();
  const show=approved&&!!line&&narration.hasAlternative(sid,line[0]);
  takeBtn.hidden=!show;
  // Phone layout is a fixed 4-column grid; widen it only while the fifth button shows.
  if(takeBtn.parentElement?.style)takeBtn.parentElement.style.gridTemplateColumns=show?"repeat(5,minmax(0,1fr))":"";
  if(show)takeBtn.setAttribute("aria-pressed",narration.usingAlternative(sid)?"true":"false");
 }
}
function wordButton(){
 const t=narration&&chosenWord?narration.wordTake(chosenWord):null;
 if(!t||narration.known(t)==="missing")return "";
 if(narration.known(t)==="unknown"){const w=chosenWord;narration.probe(t).then(()=>{if(chosenWord===w)help()});return ""}
 return '<button class="btn" data-action="hearWord" aria-label="Hear '+esc(t.voice||"recorded voice") +' say '+esc(t.canonical_text)+'">▶ '+esc(t.voice||"Voice")+'</button>';
}
function hearWord(){
 const t=narration&&chosenWord?narration.wordTake(chosenWord):null;if(!t)return;
 clearVoice();const id=++speechRequest;
 narration.playWord(chosenWord,{
  onstart:()=>{if(ambience)ambience.duck(true)},
  onend:()=>{if(id===speechRequest&&ambience)ambience.duck(!audio.paused)},
  onmissing:(take,blocked)=>{if(id!==speechRequest)return;if(ambience)ambience.duck(!audio.paused);
   updateBanner(blocked?"The browser blocked playback. Click the word again.":(take.voice||"Recorded voice")+" recording of "+take.canonical_text+" ("+take.clip_id+") is not in this copy of the program.");help()}
 });
}
function isSaved(entry){return Object.prototype.hasOwnProperty.call(S.vocab,norm(entry.head))}
function saveButton(entry,cls,label,extra=""){
 return isSaved(entry)?'<button class="'+cls+'" disabled'+extra+'>Saved ✓</button>':'<button class="'+cls+'" data-save="'+esc(norm(entry.head))+'"'+extra+'>'+label+'</button>';
}
/* Possible grammatical forms of a clicked word, from content/form-notes.js (draft data).
 * With macrons hidden, forms that differ only by a macron (mēnsa, mēnsā) are listed together. */
const formNotes=globalThis.TablinumFormNotes?.forms||{},formNotesPlain=Object.create(null);
for(const [k,v]of Object.entries(formNotes))(formNotesPlain[norm(k)]??=[]).push(v);
function formNote(word){
 const exact=formNotes[String(word).normalize("NFC").toLowerCase()],all=exact?[exact]:(formNotesPlain[norm(word)]||[]);
 if(!all.length)return "";
 const draft=' <span class="subtle">Draft note, not yet reviewed.</span>';
 if(all.every(x=>x.inv))return '<small class="form-note" style="display:block;margin-top:4px">This word does not change its form ('+esc(all[0].inv)+').</small>';
 const is=[...new Set(all.flatMap(x=>x.is||[]))],of=all.find(x=>x.of).of;
 return '<small class="form-note" style="display:block;margin-top:4px">Form of <span lang="la">'+esc(spell(of))+'</span>: '+(is.length===1?esc(is[0])+'.':'one of '+esc(is.join("; "))+'. The sentence shows which.')+draft+'</small>';
}
function help(){
 const w=Object.prototype.hasOwnProperty.call(dict,norm(chosenWord))?dict[norm(chosenWord)]:undefined;
 $("help").innerHTML='<div class="mini">Dux discendī</div><h3>Learn through context</h3><p class="subtle" style="font-size:12px">Read Latin first, then choose how much guidance you need.</p><div class="mini" style="margin-top:18px">Verbum ēlēctum</div><div class="panel">'+(chosenWord?'<h3 lang="la">'+esc(spell(chosenWord))+'</h3>'+(w?'<p>'+esc(w.meaning)+'</p><small>Headword: <span lang="la">'+esc(spell(w.head))+'</span></small>'+formNote(chosenWord)+'<div class="tools">'+saveButton(w,"btn primary","Save vocabulary")+wordButton()+'</div>':'<small>This word is not in the starter glossary.</small>'+(wordButton()?'<div class="tools">'+wordButton()+'</div>':"")):'<small>Click a Latin word to look it up.</small>')+'</div><div class="tools"><button class="btn" data-action="macrons">'+(S.macrons?"Āā Macrons":"Aa No macrons")+'</button><button class="btn" data-action="guide">'+(S.guided?"Guidance on":"Guidance off")+'</button></div>'+(S.guided?'<details><summary>Explain the grammar</summary><p style="font-size:12px">'+esc(current().explain)+'</p></details>':"")+'<div class="mini" style="margin-top:19px">Notae meae</div><textarea class="field" id="notes" placeholder="Personal notes..." maxlength="5000">'+esc(S.notes[chapterKey()]||"")+'</textarea><small>Notes are stored locally when browser storage is available.</small>';
}
function guidedHint(i,level){
 const c=current(),s=c.sent[i];if(!s||level<=0)return"";
 if(level===1)return S.ch==="custom"?(i>0?c.sent[i-1][0]:c.sent[0]?.[0]||""):contextualClue(c,i);
 if(level===2){
  const words=s[0].match(/[\p{L}\p{M}]+/gu)||[],items=[],used=new Set();
  const skip=new Set(["in","est","et","ad","hic","haec","nōn","non","sunt","quoque","cum","sed"]);
  for(const word of words){
   const k=norm(word),d=dict[k];
   if(!d||skip.has(k)||used.has(norm(d.head))||["livia","titus","marcus","flavia"].includes(norm(d.head)))continue;
   used.add(norm(d.head));items.push(d.head+": "+d.meaning);if(items.length===4)break;
  }
  return items.length?items.join(" · "):"Select an unfamiliar word for a definition.";
 }
 return s[1]||"No checked English gloss exists for this imported text.";
}
function inlineGloss(){
 const d=dict[norm(chosenWord)];
 return chosenWord?'<div class="help" aria-live="polite"><strong lang="la">'+esc(spell(chosenWord))+'</strong> · '+esc(d?.meaning||"Not in starter glossary.")+(d?saveButton(d,"link","Save word",' style="margin-left:10px"'):"")+'</div>':"";
}
function reader(c=current()){
 if(c.unavailable)return '<h1>Chapter unavailable</h1><div class="note" role="alert">'+esc(c.sub)+'</div><p>Restore the missing local content file from the full Tablinum ZIP; no progress has been erased.</p>';
const fallbackScene=scene(c.scene);
 const picture=globalThis.TablinumArtScenes?.renderChapter(activeCourse?.id,fallbackScene)||fallbackScene;
let h='<div class="mini">Lēctiō '+esc(activeCourse?activeCourse.chapter:S.ch==="custom"?"propria":S.ch+1)+'</div><h1>'+esc(c.name)+'</h1><div class="subtle">'+esc(c.sub)+'</div>'+lessonPath("read")+picture;

 h+='<div class="note">Read Latin first. Click a sentence to hear it; ask for clues when needed.</div><div class="tools"><button class="btn primary" '+(mode()==="voice"?"hidden ":"")+'data-action="play">'+(mode()==="voice"?"▶ Listen":mode()==="timed"?"▶ Play timed sentence":"▶ Play recording (untimed)")+'</button><button class="btn" data-tab="quiz">Exercises →</button></div>';
 c.sent.forEach(([latin,en],i)=>{
  const k=chapterKey()+":"+i,level=S.hintLevels[k]||0,selected=S.sel===i;
  h+='<article class="sentence '+(selected?"selected":"")+'" data-sentence-container="'+i+'" aria-current="'+(selected?"true":"false")+'"><div class="mini">Sententia '+(i+1)+'</div><div class="words" lang="la" data-sentence="'+i+'">'+renderWords(latin)+'</div><div class="tools"><button class="link" data-sentence="'+i+'">▶ Listen to sentence</button><button class="btn" '+(S.guided?"":"hidden ")+'data-guided="'+i+'">'+(level===0?"Latin clue":level===1?"Word clues":level===2?"English meaning":"Hide hints")+' ('+level+'/3)</button></div>';
  if(S.guided&&level>0)h+='<div class="help"><strong>'+(level===1?"Previously in the story":level===2?"Important words":"Optional English")+'</strong><div>'+(level===1?'<span lang="la" class="hint-words">'+renderWords(guidedHint(i,level))+'</span>':esc(guidedHint(i,level)))+'</div></div>';
  if(selected)h+=inlineGloss();h+='</article>';
  h+=inlineWordChecks(i);
 });
 h+='<div class="panel"><div class="mini">Vōx mea · Listen and compare</div><div class="tools"><button class="btn" data-action="recordSpeak">🎙 Record this sentence</button><button class="btn" data-action="stopSpeak">■ Stop recording</button><button class="btn" data-action="compareSpeak">▶ Compare my voice</button></div><small>No grading, speech transcription or fabricated pronunciation assessment. Microphone permission is optional.</small></div>';
 if(S.ch!=="custom")h+='<div class="panel"><div class="mini">Quam bene intellegis?</div><p class="subtle">Did you understand the story? Self-assessment, not a grade.</p><div class="tools">'+[["difficult","Need support"],["developing","Getting there"],["confident","Understood"]].map(([value,label])=>'<button class="btn '+(S.readingConfidence[chapterKey()]===value?"primary":"")+'" data-confidence="'+value+'">'+label+'</button>').join("")+'</div></div>';
 if(activeCourse&&activeCourse.status==="approved"){
  h+='<div class="tools"><button class="btn" data-action="courseFinished">Mark approved chapter read · add reviewed lexemes</button></div>';
 }
  h+='<div class="tools"><button class="btn" data-action="prevChapter"'+(S.ch===0?" disabled":"")+'>← '+(S.ch==="custom"?"First chapter":"Previous chapter")+'</button><button class="btn primary" data-tab="quiz">Check understanding →</button>'+(S.ch==="custom"?"":'<button class="btn" data-action="nextChapter"'+(S.ch>=L.length-1?" disabled":"")+'>Next chapter →</button>')+'</div>';
 return h;
}
function answer(index,value){
 const q=current().q[index];if(!q)return;
 const k=chapterKey()+":"+index;
 if(S.correct[k])return;
 S.answers[k]=String(value||"").slice(0,500);
 if(correctAnswer(q,value))S.correct[k]=true;else miss("q:"+k);
 if(ambience)ambience.sound(S.correct[k]?"correct":"wrong");
 fresh="q:"+k;save();render();updateBanner(S.correct[k]?"Rēctē! Correct.":"Not quite. Relege sententiam.");
}
// Phase 5: only explicitly signed, compiled course exercises can be graded.
// Legacy questions retain their exact previous IDs and the original UI.
const revealedCourseAnswers=new Set();
// Legacy questions: after three misses in this session the learner may read the
// model answer. It is never recorded as correct and nothing extra is stored.
const missCounts=new Map(),shownModels=new Set(),MISSES_BEFORE_MODEL=3;
function miss(k){missCounts.set(k,(missCounts.get(k)||0)+1)}
function modelHelp(k,text,label){
 if(shownModels.has(k))return '<div class="help model-answer"><strong>'+label+'</strong><div lang="la">'+esc(spell(text))+'</div><small>Shown for study; type it yourself to complete the exercise.</small></div>';
 return (missCounts.get(k)||0)>=MISSES_BEFORE_MODEL?'<div class="tools"><button class="btn" data-show-model="'+esc(k)+'">Show the answer</button></div>':"";
}
const courseOrderDrafts=new Map();
function getOrder(ex){
 if(courseOrderDrafts.has(ex.id))return courseOrderDrafts.get(ex.id);
 const items=Array.isArray(ex.items)?ex.items:Array.isArray(ex.options)?ex.options:[];
 const vals=items.map(x=>typeof x==="string"?x:x?.id).filter(x=>typeof x==="string");
 if(vals.length<3||vals.length>6||new Set(vals).size!==vals.length)return [];
 courseOrderDrafts.set(ex.id,vals);return vals;
}
function moveOrder(id,index,delta){
 const ex=activeCourse?.exercises?.find(x=>x.id===id);
 if(!ex||ex.type!=="order"||!globalThis.TablinumExercises.gradable(ex,activeCourse))return;
 const list=getOrder(ex),other=index+delta;
 if(index<0||other<0||other>=list.length)return;
 [list[index],list[other]]=[list[other],list[index]];
 courseOrderDrafts.set(id,list);render();
}

function courseAnswer(id,value){
 if(!activeCourse||activeCourse.status!=="approved")return;
 const ex=(activeCourse.exercises||[]).find(q=>q.id===id);
 if(!ex)return;
 const out=globalThis.TablinumExercises.grade(ex,value,activeCourse);
 if(out.status!=="graded")return updateBanner("This exercise does not have an approved answer key.");
 const old=v5State.questions[id]||{};
 v5State.questions[id]={...old,answer:String(value??""),correct:old.correct===true||out.correct===true,
  attempts:(Number(old.attempts)||0)+1,graded_by:"phase5-reviewed-exercise",evidence:out.evidence||null};
 if(ambience)ambience.sound(out.correct?"correct":"wrong");
 save();render();updateBanner(out.correct?"Rēctē! Bene respondistī. (Correct.)":"Nōndum. Relege narrātiōnem. (Not yet; reread the story.)");
}
function courseQuiz(){
 const api=globalThis.TablinumExercises,ch=activeCourse;
 let html='<div class="mini">Intellege et respondē</div><h1>Exercitia</h1>';
 if(!api||!ch||ch.status!=="approved")return html+'<div class="note">No approved exercise keys. Automatic grading is disabled.</div>';
 const published=(ch.exercises||[]).filter(ex=>api.visible(ex,ch));
 if(!published.length)return html+'<div class="note">No reviewed automatic answer keys for this chapter. Automatic grading is disabled.</div>';
 html+='<p class="subtle">Exercises are checked only when their own answer keys were signed. Speech and unverified audio are never scored.</p>';
 for(const ex of published){
  const rec=v5State.questions[ex.id]||{},scored=api.gradable(ex,ch),done=rec.correct===true;
  html+='<section class="quiz"><div class="mini">'+esc(ex.type)+' · '+esc(ex.id)+'</div>';
  html+='<div class="question" lang="la">'+esc(ex.prompt_la||"")+'</div>';
  if(!scored){
   html+='<div class="note">Unreviewed or self-check prompt — no automatic score.</div>';
   if(ex.type==="retell"){
    html+='<button class="btn" data-ex-reveal="'+esc(ex.id)+'">Show model for self-check</button>';
    if(revealedCourseAnswers.has(ex.id))html+='<p class="subtle" lang="la">'+esc(ex.model||"No approved model supplied.")+'</p>';
   }
   html+='</section>';continue;
  }
  let choices=Array.isArray(ex.options)?ex.options.map(x=>typeof x==="string"?x:x.value):[];
  if(ex.type==="tf")choices=["true","false"];
  if(["mc","tf","pic","define","cloze","listen-mc","listen-pic"].includes(ex.type)&&choices.length){
   for(const choice of choices){
    const label=ex.type==="tf"?(choice==="true"?"Vērum":"Falsum"):choice;
    const selected=rec.answer===String(choice);
    html+='<button class="option" lang="la" data-ex-choice="'+esc(ex.id)+'" data-ex-value="'+esc(choice)+'" aria-pressed="'+(selected?"true":"false")+'" '+(done?"disabled":"")+'>'+esc(label)+'</button>';
   }
  }else if(ex.type==="order"){
   const vals=getOrder(ex);
   if(!vals.length){
    html+='<p class="note">This reviewed order exercise has no valid 3–6 event cards.</p>';
   }else{
    const labels=ex.labels||{};
    html+='<ol class="order-cards" data-order-list="'+esc(ex.id)+'">';
    vals.forEach((id,i)=>{
     const label=typeof labels[id]==="string"?labels[id]:id;
     html+='<li class="order-card" draggable="'+(!done)+'" data-ex-order-id="'+esc(ex.id)+'" data-order-index="'+i+'"><span lang="la">'+esc(label)+'</span><span class="tools"><button class="btn" type="button" aria-label="Move '+esc(label)+' up" data-ex-order-shift="'+esc(ex.id)+'" data-order-index="'+i+'" data-order-delta="-1" '+(done||i===0?"disabled":"")+' >↑</button><button class="btn" type="button" aria-label="Move '+esc(label)+' down" data-ex-order-shift="'+esc(ex.id)+'" data-order-index="'+i+'" data-order-delta="1" '+(done||i===vals.length-1?"disabled":"")+' >↓</button></span></li>';
    });
    html+='</ol><p class="subtle">Drag to rearrange, or use the arrow buttons and keyboard ↑/↓. Then check the sequence.</p>';
    if(!done)html+='<button class="btn primary" data-ex-order-submit="'+esc(ex.id)+'">Check order</button>';
   }
  }else{
   html+='<div class="tools"><input class="field" lang="la" id="exercise-'+esc(ex.id)+'" aria-label="Latin answer" value="'+esc(rec.answer||"")+'" '+(done?"disabled":"")+'><button class="btn primary" data-ex-check="'+esc(ex.id)+'" '+(done?"disabled":"")+'>Check</button></div>';
  }
  if(rec.attempts){
   html+='<p role="status" class="'+(done?"good":"bad")+'">'+(done?"Rēctē! Verified answer.":"Nōndum. Try again.")+'</p>';
   if(done&&ex.evidence)html+='<button class="btn" data-ex-evidence="'+esc(ex.evidence)+'">Read evidence sentence</button>';
  }
  html+='</section>';
 }
 return html+'<div class="tools"><button class="btn" data-tab="read">Read the chapter again</button></div>';
}
/* ---- Guided lessons ---------------------------------------------------------------
 * A lesson has three steps: read the story (with a word check every few sentences),
 * answer the questions on the story, and take the chapter word check. The path bar
 * always names the next step. Only the eight chapters of Liber prīmus take part. */
function lessonOn(){return !!WC&&!activeCourse&&S.ch!=="custom"}
function lessonSteps(i){
 const c=L[i],s=WC.summary(learning,L,i,formNotes);
 const qTotal=c.q.length+(guidedCloze[i]?1:0);
 const qDone=c.q.filter((q,j)=>S.correct[i+":"+j]).length+(guidedCloze[i]&&S.clozeCorrect[String(i)]?1:0);
 const read=s.inlineTotal===0||s.inlineDone>=s.inlineTotal,questions=qDone>=qTotal,words=s.testPassed||s.testTotal===0&&s.testStarted;
 const fraction=((s.inlineTotal?s.inlineDone/s.inlineTotal:1)+(qTotal?qDone/qTotal:1)+(words?1:0))/3;
 return {s,qDone,qTotal,read,questions,words,complete:read&&questions&&words,fraction,
  next:!read?"read":!questions?"questions":!words?"words":"next"};
}
function lessonPath(where){
 if(!lessonOn())return "";
 const i=S.ch,p=lessonSteps(i),s=p.s,last=i>=L.length-1;
 const steps=[
  ["read","Read the story",p.read,s.inlineDone+" of "+s.inlineTotal+" word checks"],
  ["questions","Answer the questions",p.questions,p.qDone+" of "+p.qTotal+" correct"],
  ["words","Chapter word check",p.words,p.words?"Passed, best "+Math.round(s.best*100)+"%":s.testStarted?"Best so far "+Math.round(s.best*100)+"%":"Not started"]];
 const advice={
  read:where==="read"?"Read the story below. A short word check follows every few sentences.":"Go back to the story and finish its word checks.",
  questions:"Answer the questions on the story.",
  words:"Take the chapter word check to finish this lesson.",
  next:last?"Liber prīmus complete — review or revisit earlier lessons.":"Lesson complete. Go on to the next chapter."}[p.next];
 const here=where==="read"&&p.next==="read";
 const label={read:"Continue reading",questions:"Go to the questions →",words:s.testStarted&&!s.testFinished?"Continue the word check →":"Start the word check →",next:"Next chapter →"}[p.next];
 return '<nav class="lesson-path" aria-label="Steps of this lesson"><ol>'+steps.map(([id,name,done,detail],n)=>
  '<li class="'+(done?"is-done":"")+(p.next===id?" is-current":"")+'"><button data-path="'+id+'"'+(p.next===id?' aria-current="step"':"")+'><b aria-hidden="true">'+(done?"✓":n+1)+'</b><span><strong>'+name+'</strong><small>'+esc(detail)+'</small></span>'+(done?'<span class="sr-only"> (done)</span>':"")+'</button></li>').join("")+
  '</ol><p class="lesson-next"><span><strong>'+(p.next==="next"?"Done.":"Next step.")+'</strong> '+esc(advice)+'</span>'+(here||p.next==="next"&&last?"":'<button class="btn primary" data-path="'+p.next+'">'+label+'</button>')+'</p></nav>';
}
function markWord(text,surface){
 let done=false;
 return (spell(text).match(/[\p{L}\p{M}]+|[^\p{L}\p{M}]+/gu)||[]).map(w=>!done&&norm(w)===norm(surface)?(done=true,"<mark>"+esc(w)+"</mark>"):esc(w)).join("");
}
function wordQuestion(item){
 if(item.kind==="latin")return 'Which Latin word means “'+esc(item.meaning)+'”?';
 const same=norm(item.surface)===norm(item.head);
 return (same?"":'<span lang="la"><strong>'+esc(spell(item.surface))+'</strong></span> is a form of <span lang="la">'+esc(spell(item.head))+'</span>. ')+'What does <strong lang="la">'+esc(spell(item.head))+'</strong> mean?';
}
function wordOptions(item,given,attr){
 return item.options.map(o=>{
  const cls=given?(o===item.answer?"is-correct":o===given.value?"is-wrong":""):"";
  return '<button class="option '+cls+'" '+attr+' data-value="'+esc(o)+'" aria-pressed="'+(given&&o===given.value?"true":"false")+'" '+(given?"disabled":"")+(item.kind==="latin"?' lang="la"':"")+'>'+esc(item.kind==="latin"?spell(o):o)+'</button>';
 }).join("");
}
function wordFeedback(item,given,later){
 if(!given)return "";
 const fact='<span lang="la">'+esc(spell(item.head))+'</span> means “'+esc(item.meaning)+'”.';
 return '<div role="status" class="'+(given.ok?"good":"bad")+'">'+(given.ok?"Rēctē! ":"Nōndum. ")+fact+(given.ok?"":" "+later)+'</div>';
}
/* Word checks placed in the story after sentence `after`. */
function inlineWordChecks(after){
 if(!lessonOn())return "";
 const i=S.ch,c=L[i],state=learning.chapters[WC.chapterId(i)]||{inline:{}};
 return WC.inlineChecks(L,i,formNotes).filter(item=>item.after===after).map(item=>{
  const given=state.inline[item.head];
  return '<section class="quiz word-check'+(given?given.ok?" is-complete":" is-missed":"")+'"'+(fresh==="wc:"+item.head?' data-fresh="'+(given&&given.ok?"good":"bad")+'"':"")+' data-word-check="'+esc(item.head)+'"><div class="mini">Word check · from the story so far</div>'+
   '<p class="wc-context" lang="la">'+markWord(c.sent[item.sentence][0],item.surface)+'</p><div class="question">'+wordQuestion(item)+'</div>'+
   wordOptions(item,given,'data-wc="'+esc(item.head)+'"')+wordFeedback(item,given,"It will come back in the chapter word check.")+'</section>';
 }).join("");
}
function wordCheckAnswer(head,value){
 if(!lessonOn())return;
 const result=WC.answerInline(learning,L,S.ch,head,value,formNotes);if(!result)return;
 if(ambience)ambience.sound(result.ok?"correct":"wrong");
 fresh="wc:"+head;save();render();
 const p=lessonSteps(S.ch);
 updateBanner(result.ok?(p.read?"Rēctē! Story read. Next: the questions.":"Rēctē! Read on."):"Not this time. The word will come back later.");
}
/* The chapter word check, at the end of Exercitia. */
function wordTest(){
 if(!lessonOn())return "";
 const i=S.ch,s=WC.summary(learning,L,i,formNotes),state=learning.chapters[WC.chapterId(i)];
 let h='<section class="panel word-test" id="wordTest"><div class="mini">Step 3 of the lesson</div><h2>Chapter word check</h2>';
 if(!s.testStarted)return h+'<p>A short test on the words of this chapter, with a few from earlier chapters. Words you missed while reading are asked first. '+Math.round(WC.PASS*100)+'% completes the lesson, and you can try again as often as you like.</p><div class="tools"><button class="btn primary" data-action="startWordTest">Start the word check</button></div></section>';
 const items=WC.testItems(learning,L,i,formNotes);
 h+='<p class="subtle">Question '+Math.min(s.testAnswered+1,s.testTotal)+' of '+s.testTotal+' · attempt '+s.attempt+'. Each question takes one answer.</p>';
 items.forEach((item,n)=>{
  const given=state.test.answers[item.key];
  h+='<section class="quiz word-check'+(given?given.ok?" is-complete":" is-missed":"")+'"'+(fresh==="wt:"+item.key?' data-fresh="'+(given&&given.ok?"good":"bad")+'"':"")+'><div class="mini">'+(n+1)+' / '+items.length+(item.chapter!==i?" · from chapter "+(item.chapter+1):"")+'</div><div class="question">'+wordQuestion({...item,surface:item.head})+'</div>'+
   wordOptions(item,given,'data-wt="'+esc(item.key)+'"')+wordFeedback(item,given,"")+'</section>';
 });
 if(s.testFinished){
  const need=Math.ceil(WC.PASS*s.testTotal-1e-9),passed=s.testRight>=need,missed=items.filter(item=>!state.test.answers[item.key].ok);
  h+='<div class="word-result '+(passed?"good":"bad")+'" role="status" id="wordResult"><strong>'+s.testRight+' of '+s.testTotal+' correct.</strong> '+(passed?"This word check is passed.":"You need "+need+" to pass. Look at the words below, read the story again if it helps, then try a new set.")+'</div>';
  if(missed.length)h+='<div class="help"><strong>Words to look at again</strong><ul class="word-list">'+missed.map(item=>'<li><span lang="la">'+esc(spell(item.head))+'</span> · '+esc(item.meaning)+'</li>').join("")+'</ul></div>';
  h+='<div class="tools"><button class="btn'+(passed?"":" primary")+'" data-action="startWordTest">'+(passed?"Try another set":"Try again with a new set")+'</button></div>';
 }
 return h+'</section>';
}
function startWordTest(){
 if(!lessonOn())return;
 WC.startTest(learning,L,S.ch,formNotes);
 S.tab="quiz";save();render();showElement("wordTest");
}
function wordTestAnswer(key,value){
 if(!lessonOn())return;
 const result=WC.answerTest(learning,L,S.ch,key,value,formNotes);if(!result)return;
 if(ambience)ambience.sound(result.ok?"correct":"wrong");
 fresh="wt:"+key;save();render();
 const s=WC.summary(learning,L,S.ch,formNotes);
 updateBanner(s.testFinished?s.testRight+" of "+s.testTotal+" correct.":result.ok?"Rēctē!":"Not this time.");
}
function showElement(id){const el=typeof id==="string"?$(id):id;if(el&&typeof el.scrollIntoView==="function")el.scrollIntoView({block:"start"})}
function goPath(step){
 if(!lessonOn())return;
 if(step==="next"){if(S.ch<L.length-1)setChapter(S.ch+1);return}
 if(step==="read"){
  if(S.tab!=="read")switchTab("read");
  const open=WC.inlineChecks(L,S.ch,formNotes).find(item=>!(learning.chapters[WC.chapterId(S.ch)]||{inline:{}}).inline[item.head]);
  if(open)showElement(document.querySelector('[data-sentence-container="'+Math.max(0,open.after-2)+'"]'));
  return;
 }
 if(S.tab!=="quiz")switchTab("quiz");
 if(step==="words"){
  const s=WC.summary(learning,L,S.ch,formNotes);
  if(!s.testStarted||s.testFinished&&!s.testPassed)return startWordTest();
  showElement("wordTest");
 }
}
/* Prōgressus: where to carry on, and what the word checks have shown so far. */
function continueLearning(){
 if(!WC)return "";
 const i=L.findIndex((c,n)=>!lessonSteps(n).complete);
 if(i<0)return '<div class="panel continue"><h2>Continue learning</h2><p>All eight lessons are complete. Revisit any chapter from the course map.</p></div>';
 const p=lessonSteps(i),what={read:"read the story",questions:"answer the questions on the story",words:"take the chapter word check"}[p.next];
 return '<div class="panel continue"><h2>Continue learning</h2><p>Chapter '+(i+1)+', <span lang="la">'+esc(L[i].name)+'</span>: next, '+what+'.</p><div class="tools"><button class="btn primary" data-ch="'+i+'">Open chapter '+(i+1)+' →</button></div></div>';
}
function wordKnowledge(){
 if(!WC)return "";
 const rows=WC.knowledge(learning,L,formNotes),count=k=>rows.filter(r=>r.status===k).length,revisit=rows.filter(r=>r.status==="revisit");
 return '<div class="panel word-knowledge"><h2>Word knowledge</h2><p class="subtle">From the word checks in the stories and at the end of each chapter. A word counts as known when your latest answer on it was right.</p><div class="stats"><div class="stat"><b>'+count("known")+'</b><small>Known</small></div><div class="stat"><b>'+count("revisit")+'</b><small>To revisit</small></div><div class="stat"><b>'+count("new")+'</b><small>Not yet tested</small></div></div>'+
  (revisit.length?'<strong>Words to revisit</strong><ul class="word-list">'+revisit.map(r=>'<li><span lang="la">'+esc(spell(r.head))+'</span> · '+esc(r.meaning)+' <button class="link" data-ch="'+r.chapter+'">chapter '+(r.chapter+1)+'</button></li>').join("")+'</ul><small>They are asked again in the next chapter word check you take.</small>':"")+'</div>';
}
function quiz(c=current()){if(activeCourse)return courseQuiz();let h='<div class="mini">Intellege et respondē</div><h1>Exercitia</h1>'+lessonPath("quiz")+'<p class="subtle">Use the story as evidence. Short answers accept the expected word or the full model sentence.</p>';
 if(!c.q.length)return h+'<div class="note">No reviewed automatic answer keys for this chapter. Automatic grading is disabled.</div>';
 c.q.forEach((q,i)=>{
  const k=chapterKey()+":"+i,correct=!!S.correct[k],value=S.answers[k]||"";
  h+='<section class="quiz'+(correct?" is-complete":"")+'"'+(fresh==="q:"+k?' data-fresh="'+(correct?"good":"bad")+'"':"")+'><div class="mini">'+(q[1]?"Elige":"Scribe")+' · '+(i+1)+' / '+c.q.length+'</div><div class="question" lang="la">'+esc(spell(q[0]))+'</div>';
  if(q[1])h+=q[1].map(o=>'<button class="option '+(correct&&correctAnswer(q,o)?"is-correct":!correct&&o===value?"is-wrong":"")+'" data-choice="'+i+'" data-value="'+esc(o)+'" aria-pressed="'+(o===value?"true":"false")+'" '+(correct?"disabled":"")+' lang="la">'+esc(spell(o))+'</button>').join("");
  else h+='<div class="tools"><input class="field" id="answer-'+i+'" lang="la" aria-label="Latin answer" value="'+esc(value)+'" '+(correct?"disabled":"")+' placeholder="Respondē Latīnē…"><button class="btn primary" data-check="'+i+'" '+(correct?"disabled":"")+'>Check</button></div>';
  if(value||correct)h+='<div role="status" class="'+(correct?"good":"bad")+'">'+esc(correct?"Rēctē! "+q[3]:"Nōndum. Re-read the relevant sentence and try again.")+'</div>';
  if(!correct)h+=modelHelp("q:"+k,q[3],"Model answer");
  h+='</section>';
 });
 const i=Number(S.ch),item=guidedCloze[i],key=chapterKey();
 if(item){
  const complete=!!S.clozeCorrect[key],value=S.clozeAnswers[key]||"";
  h+='<section class="quiz'+(complete?" is-complete":"")+'"'+(fresh==="c:"+key?' data-fresh="'+(complete?"good":"bad")+'"':"")+'><div class="mini">Verbum dēest · Guided completion</div><div class="question" lang="la">'+esc(spell(item.text))+'</div><div class="tools"><input class="field" lang="la" id="clozeInput" aria-label="Missing Latin word" value="'+esc(value)+'" '+(complete?"disabled":"")+'><button class="btn primary" data-action="clozeCheck" '+(complete?"disabled":"")+'>Check</button></div>';
  if(complete||value)h+='<div role="status" class="'+(complete?"good":"bad")+'">'+esc(complete?"Rēctē! "+item.proof:"Nōndum. "+item.clue)+'</div>';
  if(!complete)h+=modelHelp("c:"+key,item.proof,"Complete sentence");
  h+='</section>';
 }
 h+=wordTest();
 return h+'<div class="tools"><button class="btn" data-tab="read">Read again</button>'+(S.ch===L.length-1?'<span class="note">Liber prīmus complete — review or revisit earlier lessons.</span>':'<button class="btn primary" data-action="nextChapter">Next chapter →</button>')+'</div>';
}
function clozeCheck(){
 if(S.ch==="custom")return;const item=guidedCloze[S.ch],value=String($("clozeInput")?.value||"").slice(0,300);
 const k=chapterKey();if(S.clozeCorrect[k])return;
 S.clozeAnswers[k]=value;if(item.answers.some(v=>norm(v)===norm(value)))S.clozeCorrect[k]=true;else miss("c:"+k);
 if(ambience)ambience.sound(S.clozeCorrect[k]?"correct":"wrong");
 fresh="c:"+k;save();render();updateBanner(S.clozeCorrect[k]?"Rēctē! Correct cloze.":"Try again with the story as a clue.");
}
function dueEntries(){return Object.entries(S.vocab).filter(([,v])=>v&&v.due<=Date.now())}
function highlightReviewSentence(card){
 const text=String(card.sourceText||""),surface=String(card.sourceHighlight||card.head||"");
 const at=surface?text.toLowerCase().indexOf(surface.toLowerCase()):-1;
 return at<0?esc(text):esc(text.slice(0,at))+'<mark lang="la">'+esc(text.slice(at,at+surface.length))+'</mark>'+esc(text.slice(at+surface.length));
}
function reviewItems(){
 const deck=globalThis.TablinumReviewDeck;deck.setUp(v5State);
 return [
  ...deck.dueCards(v5State,Date.now(),"cards").map(([key,v])=>({key,group:"cards",v})),
  ...deck.dueCards(v5State,Date.now(),"legacyCards").map(([key,v])=>({key,group:"legacyCards",v}))
 ];
}
const RATINGS=["again","hard","good","easy"];
/* Says why nothing is due: either the daily limit is holding cards back, or the
 * next card is scheduled for a later time. */
function reviewIdleMessage(){
 const now=Date.now(),all=[...Object.values(v5State.deck.cards),...Object.values(v5State.deck.legacyCards)];
 const ready=all.filter(c=>Number(c.due||0)<=now).length;
 if(ready)return "Satis hodiē! Today's review limit is reached. "+ready+" more "+(ready===1?"card is":"cards are")+" ready and will appear tomorrow.";
 const next=Math.min(...all.map(c=>Number(c.due||0)).filter(d=>d>now));
 if(!Number.isFinite(next))return "Omnia bene! No reviews are due.";
 const days=Math.round((new Date(next).setHours(0,0,0,0)-new Date(now).setHours(0,0,0,0))/864e5);
 return "Omnia bene! No reviews are due. Next review: "+(days<=0?"later today":days===1?"tomorrow":"in "+days+" days")+".";
}
/* Words the learner saved by hand, with a way to take one out again. */
function savedWordsList(){
 const rows=Object.entries(S.vocab).filter(([,v])=>v).sort(([a],[b])=>a.localeCompare(b));
 if(!rows.length)return "";
 return '<details class="panel" id="savedWords"'+(savedWordsOpen?" open":"")+'><summary>Verba servāta · Saved words ('+rows.length+')</summary><ul style="list-style:none;padding:0;margin:8px 0 0">'+
  rows.map(([k,v])=>'<li style="display:flex;gap:10px;align-items:baseline;justify-content:space-between;padding:5px 0;border-bottom:1px solid #dfe7db"><span><strong lang="la">'+esc(spell(v.head||k))+'</strong> · '+esc(v.meaning||"")+'</span><button class="link" data-unsave="'+esc(k)+'" aria-label="Remove '+esc(v.head||k)+' from saved words">Remove</button></li>').join("")+'</ul></details>';
}
let savedWordsOpen=false;
function review(){
 const deck=globalThis.TablinumReviewDeck,items=reviewItems();
 const total=Object.keys(v5State.deck.cards).length+Object.keys(v5State.deck.legacyCards).length;
 let h='<div class="mini">Memoria</div><h1>Memoria: verba repetenda</h1><p class="subtle">Offline FSRS scheduling. Reviewed course words are separated from unsigned legacy free cards.</p>';
 h+='<div class="stats"><div class="stat"><b>'+total+'</b><small>Servāta · Saved</small></div><div class="stat"><b>'+items.length+'</b><small>Hodiē · Due</small></div><div class="stat"><b>'+(total-items.length)+'</b><small>Posteā · Later</small></div></div>';
 if(!total)return h+'<div class="panel">Ēlige verbum Latīnum in lēctiōne. Select a Latin word in a lesson, then save it. Original and new-course words retain distinct approval statuses.</div>';
 if(!items.length)return h+'<div class="panel">'+reviewIdleMessage()+'</div>'+savedWordsList();
 const entry=items.find(x=>x.group+"|"+x.key===reviewKey)||items[0];
 reviewKey=entry.group+"|"+entry.key;
 const item=entry.v;
 h+='<div class="panel review-card" style="text-align:center;padding:25px"><div class="mini">'+(entry.group==="legacyCards"?"Verbum vetus · Not owner-reviewed":"Verbum recognitum · "+esc(item.direction))+'</div>';
 h+='<h1 lang="la">'+esc(spell(item.head||entry.key))+'</h1>';
 if(item.sourceText)h+='<p lang="la">'+highlightReviewSentence(item)+'</p>';
 h+=reviewReveal?'<h2 class="review-meaning">'+esc(item.meaning||"No gloss available")+'</h2><div class="tools" style="justify-content:center">'+RATINGS.map((x,i)=>'<button class="btn '+(x==="good"?"primary":"")+'" data-rating="'+x+'" aria-keyshortcuts="'+(i+1)+'">'+(i+1)+' · '+x[0].toUpperCase()+x.slice(1)+'</button>').join("")+'</div><small>Keys 1 to 4 rate the card.</small>':'<button class="btn primary" data-action="revealCard" aria-keyshortcuts="Space">Ostende significātiōnem · Reveal</button><br><small>Space or Enter reveals the meaning.</small>';
 return h+'</div>'+savedWordsList();
}
function storageLabel(status){
 return status==="persistent"?"Recording storage: kept by the browser until you remove it."
  :status==="temporary"?"Recording storage: temporary. The browser may clear recordings, so export the ones you want to keep."
  :status==="not_checked"?"Recording storage: not checked yet. It is checked when you make your first recording."
  :"Recording storage: not available in this browser.";
}
function progress(chapters=L){
 const total=chapters.reduce((n,c)=>n+c.q.length,0),done=Object.values(S.correct).filter(Boolean).length,finished=chapters.filter((c,i)=>WC&&chapters===L?lessonSteps(i).complete:c.q.every((q,j)=>S.correct[i+":"+j])).length;
 const lexemes=globalThis.TablinumCompiledContent?.lexicon?.lexemes||[];
 const completed=Object.keys(v5State.completedCourse||{}).filter(k=>v5State.completedCourse[k]===true);
 const reached=completed.reduce((n,k)=>Math.max(n,globalThis.Tablinum.catalogue.get(k)?.chapter||0),0);
 const indicators=globalThis.TablinumReviewDeck.metrics(v5State,lexemes,reached);
 let h='<div class="mini">Prōgressus</div><h1>Learning progress</h1><div class="stats"><div class="stat"><b>'+finished+'/'+chapters.length+'</b><small>Finished lessons</small></div><div class="stat"><b>'+done+'/'+total+'</b><small>Original questions</small></div><div class="stat"><b>'+Object.keys(S.vocab).length+'</b><small>Saved words</small></div></div>'+(chapters===L?continueLearning()+wordKnowledge():"")+'<div class="panel"><h2>Guided progress</h2><p>'+Object.values(S.clozeCorrect).filter(Boolean).length+'/'+guidedCloze.length+' contextual cloze exercises</p><p>'+Object.keys(S.readingConfidence).length+'/'+chapters.length+' self-assessed lessons</p></div>'+(lexemes.some(l=>l.status==="approved")?'<h2>Verba discenda · Four separate measures</h2><div class="stats">'+
 '<div class="stat"><b>'+indicators.introduced+'</b><small>Introduced (approved)</small></div>'+
 '<div class="stat"><b>'+indicators.encountered+'</b><small>Encountered</small></div>'+
 '<div class="stat"><b>'+indicators.recognised+'</b><small>Recognised</small></div>'+
 '<div class="stat"><b>'+indicators.productive+'</b><small>Productive</small></div>'+
 '</div>':'')+'<p class="subtle">Legacy saved words: '+indicators.legacySaved+' (not automatically owner-approved).</p><p class="subtle">Mūsica ex fontibus Graecīs et Rōmānīs īnspīrāta est; reconstrūctiō incerta est. Music inspired by ancient Greek and Roman sources; reconstruction is uncertain. Source details: <a href="curriculum/music.json">music provenance</a>.</p><h2>Course map</h2>';
 chapters.forEach((c,i)=>{const n=c.q.filter((q,j)=>S.correct[i+":"+j]).length;h+='<div style="padding:8px 0;border-bottom:1px solid #dfe7db"><button class="link" data-ch="'+i+'">'+(i+1)+". "+esc(c.name)+'</button><small style="float:right">'+n+'/'+c.q.length+'</small><div class="bar"><div style="width:'+(n/c.q.length*100)+'%"></div></div></div>'});
 if(storageMode==="blocked")h+='<div class="note" role="alert">'+esc(boot.warning||'Saved progress needs recovery; your old data has not been overwritten.')+' <button class="btn" data-action="remigrateV4">Re-migrate from original v4</button> or restore a backup below.</div>';
 h+='<div class="panel"><h2>Vōx mea · Your recordings</h2><p class="subtle">Practice recordings from Lēctiō stay on this computer and are not part of the backup below. Export them separately.</p><div class="tools"><button class="btn" data-action="exportRecordings">Export my recordings ZIP</button>'+(S.custom?'<button class="btn" data-action="clearText">Remove imported text</button>':'')+(media()?'<button class="btn" data-action="clearAudio">Remove local audio for this chapter</button>':'')+'</div><small>'+esc(storageLabel(userMedia?.status?.()))+'</small></div>';
 h+='<div class="panel"><h2>Backup and recovery</h2><p class="subtle">Audio is not stored in backups. Restored fields are validated. Backups from this version and from older versions (v0.2 and v4) can be restored.</p><div class="tools"><button class="btn primary" data-action="export">Export backup JSON</button></div><label for="restoreFile">Restore a JSON backup (under 12 MB)</label><input class="field" type="file" id="restoreFile" accept=".json,application/json"><details><summary>Reset exercise and vocabulary progress</summary><button class="btn" data-action="reset">Reset progress (keep notes and imported text)</button></details></div>';
 return h;
}
function syncAudioElement(){
 const el=$("audioSeek");if(!el)return;
 el.max=Number.isFinite(audio.duration)&&audio.duration>0?String(audio.duration):"0";
 el.value=String(Number.isFinite(audio.currentTime)?audio.currentTime:0);
}
/* A new section or chapter starts at its top. Without this the window kept its old scroll
 * offset, so the new page appeared part-way down, or jumped when it was shorter. The page
 * only ever moves up, to where the new view begins directly under the section tabs. */
function settleView(main){
 const bar=$("tabs");
 if(!bar||typeof main.getBoundingClientRect!=="function"||typeof globalThis.scrollTo!=="function")return;
 const stuck=globalThis.getComputedStyle?.(bar).position==="sticky"?bar.offsetHeight:0;
 const top=Math.max(0,Math.round(main.getBoundingClientRect().top+globalThis.scrollY-stuck));
 if(globalThis.scrollY>top)globalThis.scrollTo(0,top);
}
function render(){
 if(S.tab==="library")S.tab="read"; // Bibliothēca removed (Nov 2026); a saved library tab opens the reader
 const old=stableFocus(),chapter=current();tabs();help();
 const main=$("main"),view=S.tab+"|"+(activeCourse?activeCourse.id:S.ch);
 main.innerHTML=S.tab==="read"?reader(chapter):S.tab==="quiz"?quiz(chapter):S.tab==="review"?review():progress(L);
 if(main.dataset)main.dataset.fresh=fresh;
 const helpEl=$("help");if(helpEl&&helpEl.dataset)helpEl.dataset.fresh=fresh;
 if(view!==lastView){replay(main,"view-enter");if(lastView)settleView(main)}
 lastView=view;fresh="";
 const dock=document.querySelector(".dock");if(dock)dock.hidden=S.tab!=="read";
 syncAudioElement();restoreFocus(old);updateBanner();
}
function updateSentenceHighlight(){
 if(chosenWord){chosenWord="";for(const gloss of document.querySelectorAll(".sentence .help[aria-live]"))gloss.remove();const panel=$("help")?.querySelector?.(".panel");if(panel)panel.innerHTML="<small>Click a Latin word to look it up.</small>"}
 const rows=document.querySelectorAll("[data-sentence-container]");
 for(const el of rows){const selected=Number(el.dataset.sentenceContainer)===S.sel;el.classList.toggle("selected",selected);el.setAttribute("aria-current",selected?"true":"false")}
}
function selectSentence(i,activate=false){
 if(activeCourse&&activeCourse.status==="approved"){
  const prev=activeCourse.segments.flatMap(seg=>seg.sentences||[])[S.sel];
  if(prev)globalThis.TablinumReviewDeck.seenSentence(v5State,activeCourse,prev,exposureSession);
 }
 const count=current().sent.length,previous=S.sel;
 const selected=Math.max(0,Math.min(Number(i)||0,Math.max(count-1,0)));
 // One sentence per click. Selecting a different sentence stops current speech.
 if(selected!==previous){clearVoice();if(!audio.paused)audio.pause()}
 S.sel=selected;
 if(timed()){
  const target=media().ranges[S.sel];if(target)audio.currentTime=target.start;
 }
 save();updateSentenceHighlight();updateDock();
 if(!audio.paused)startBoundaryMonitor();
 if(activate){if(mode()==="voice")speak();else if(mode()==="timed")play();}
}
function availableVoice(){
 const list=typeof speechSynthesis==="undefined"?[]:speechSynthesis.getVoices();
 const voice=list.find(v=>(v.lang||"").toLowerCase().startsWith("la"));
 return voice||null;
}
function currentNarrationTake(){
 if(!narration||mode()!=="voice")return null;
 const line=current().sent[S.sel];
 return line?narration.take(currentSentenceId(),line[0]):null;
}
function speak(){
 const line=current().sent[S.sel];if(!line)return;
 clearVoice();const id=++speechRequest;
 if(narration&&narration.play(currentSentenceId(),line[0],{
  onstart:take=>{narrationTake=take;readingIndex=S.sel;if(ambience)ambience.duck(true);updateDock()},
  onend:()=>{if(id!==speechRequest)return;narrationTake=null;readingIndex=null;if(ambience)ambience.duck(!audio.paused);updateDock()},
  onmissing:(take,blocked)=>{
   if(id!==speechRequest)return;narrationTake=null;
   if(blocked){readingIndex=null;if(ambience)ambience.duck(!audio.paused);updateDock();return updateBanner("The browser blocked playback. Click the sentence again to hear it.")}
   updateBanner((take.voice||"Recorded voice")+" recording ("+take.clip_id+") is not in this copy, so the browser voice is reading this sentence.");
   speakWithBrowser(line,id);
  }
 }))return;
 const missingTake=narration?narration.take(currentSentenceId(),line[0]):null;
 if(missingTake)updateBanner((missingTake.voice||"Recorded voice")+" recording ("+missingTake.clip_id+") is not in this copy, so the browser voice is reading this sentence.");
 speakWithBrowser(line,id);
}
/* Click-to-play only: completing a sentence never advances or starts another. */
function speakWithBrowser(line,id){
 if(!("speechSynthesis" in window)){readingIndex=null;if(ambience)ambience.duck(!audio.paused);return updateBanner("Browser voice unavailable.")}
 const utterance=new SpeechSynthesisUtterance(line[0]),v=availableVoice();
 utterance.lang="la";utterance.rate=.82;
 if(v)utterance.voice=v;
 spokenVoice=v?v.name:"system default (not Latin-verified)";
 if(ambience)ambience.duck(true);
 updateDock();
 utterance.onend=()=>{if(id!==speechRequest)return;readingIndex=null;if(ambience)ambience.duck(!audio.paused)};
 utterance.onerror=()=>{if(id===speechRequest){if(ambience)ambience.duck(!audio.paused);updateBanner("Browser voice could not read this sentence.")}};
 readingIndex=S.sel;speechSynthesis.speak(utterance);
}
function play(){
 if(!current().sent.length)return updateBanner("No readable sentences in this chapter. Restore the missing content file.");
 if(mode()==="voice"){updateBanner("Click the sentence you want to hear.");return}
 if(timed()&&media().ranges[S.sel])audio.currentTime=media().ranges[S.sel].start;
 audio.play().then(()=>startBoundaryMonitor()).catch(()=>updateBanner("Audio could not start. Check the attached file."));
}
function rating(which){
 if(!reviewKey)return;
 const divider=reviewKey.indexOf("|");if(divider<0)return;
 const group=reviewKey.slice(0,divider),key=reviewKey.slice(divider+1);
 try{
  const next=globalThis.TablinumReviewDeck.rate(v5State,key,which,Date.now(),group);
  if(group==="legacyCards"&&S.vocab[key]){
   S.vocab[key].days=next.days;S.vocab[key].due=next.due;S.vocab[key].reps=next.reps;
  }
  reviewReveal=false;reviewKey=null;save();render();
 }catch(error){updateBanner("Review could not be scheduled; export a backup. "+error.message)}
}
function download(name,content){
 const blob=new Blob([content],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function loadText(file,handler,limit){
 if(file.size>limit){updateBanner("File too large. Maximum size is "+Math.round(limit/1024)+" KB.");return}
 const reader=new FileReader();reader.onload=()=>{try{handler(String(reader.result||""))}catch(e){updateBanner("Import failed: "+(e.message||"Invalid file."))}};reader.onerror=()=>updateBanner("Unable to read the selected file.");reader.readAsText(file);
}
function validateRanges(raw,expected,duration){
 if(!Array.isArray(raw)||raw.length!==expected||expected===0)throw Error("Need one timing interval per sentence.");
 let end=-1;const out=[];
 for(const item of raw){
  if(!item||typeof item!=="object"||!isFiniteNum(item.start)||!isFiniteNum(item.end)||item.start<0||item.end<=item.start||item.start<end)throw Error("Invalid, overlapping or unordered intervals.");
  end=item.end;out.push({start:item.start,end:item.end});
 }
 if(isFiniteNum(duration)&&duration>0&&end>duration+.5)throw Error("Timing intervals exceed recording duration.");
 return out;
}
function attachRanges(input){
 const m=media();if(!m)throw Error("Attach audio to this chapter before adding timings.");
 const obj=JSON.parse(input),raw=Array.isArray(obj)?obj:obj&&obj.intervals;
 // The duration may not yet be known; validate it again after loadedmetadata.
 const resolved=obj?.schema==="tablinum-timing-v2"?
  userMedia.validateTimingV2(obj,currentTimingChapter(),Number.isFinite(audio.duration)?audio.duration:NaN).ranges:
  validateRanges(raw,current().sent.length,Number.isFinite(audio.duration)?audio.duration:NaN);
 m.ranges=resolved;
 if(userMedia)userMedia.saveTiming(chapterKey(),{ranges:resolved,source:obj?.schema==="tablinum-timing-v2"?"v2":"legacy_intervals",verified:false})
  .catch(()=>{});
 updateBanner("Supplied timing intervals are unverified. No automatic acoustic alignment was invented.");render();
}
function restoreBackup(content){
 const next=stateApi.parseBackup(content,legacyIdMap,legacyVocabMap,normalizeState);
 if(!confirm("Restore this backup? Your current v5 progress will be replaced. The original v4 data and snapshot will NOT change."))return;
 if(globalThis.Tablinum.errors.length)throw Error("Restore is paused until missing chapter files are repaired.");
 clearVoice();stopAudio();activeCourse=null;courseRequest++;
 v5State=next;S=normalizeState(stateApi.legacyView(v5State,legacyIdMap));
 if(WC)learning=WC.normalise(v5State.learning);
 storageMode="ready";
 const result=stateApi.persist(storage,v5State);
 v5State=result.state;
 useChapterAudio();render();
 updateBanner(result.ok?"Backup restored as v5. Original v4 data was preserved.":result.warning);
}
let draggingOrder=null;
document.addEventListener("dragstart",event=>{
 const li=event.target.closest?.("[data-ex-order-id]");
 if(!li)return;
 draggingOrder={id:li.dataset.exOrderId,index:Number(li.dataset.orderIndex)};
 if(event.dataTransfer)event.dataTransfer.setData("text/plain",String(draggingOrder.index));
});
document.addEventListener("dragover",event=>{
 if(draggingOrder&&event.target.closest?.('[data-ex-order-id="'+draggingOrder.id+'"]'))event.preventDefault();
});
document.addEventListener("drop",event=>{
 const li=event.target.closest?.("[data-ex-order-id]");
 if(!draggingOrder||!li||li.dataset.exOrderId!==draggingOrder.id)return;
 event.preventDefault();
 const dest=Number(li.dataset.orderIndex),source=draggingOrder.index,id=draggingOrder.id;
 draggingOrder=null;
 if(dest===source)return;
 const ex=activeCourse?.exercises?.find(q=>q.id===id);
 const items=ex?getOrder(ex):[];if(!items.length)return;
 const item=items.splice(source,1)[0];items.splice(dest,0,item);courseOrderDrafts.set(id,items);render();
});
document.addEventListener("dragend",()=>{draggingOrder=null});
document.addEventListener("keydown",event=>{
 if(!["ArrowUp","ArrowDown"].includes(event.key))return;
 const btn=event.target.closest?.("[data-ex-order-shift]");
 if(!btn)return;
 event.preventDefault();
 moveOrder(btn.dataset.exOrderShift,Number(btn.dataset.orderIndex),event.key==="ArrowUp"?-1:1);
});
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.audioMusic!==undefined){if(ambience)ambience.set({music:!v5State.ui.audio.music});return}
 if(b.dataset.audioSfx!==undefined){if(ambience)ambience.set({sfx:!v5State.ui.audio.sfx});return}
 const scoring=b.dataset.exChoice!==undefined||b.dataset.exCheck!==undefined||
  b.dataset.choice!==undefined||b.dataset.check!==undefined||b.dataset.rating!==undefined||
  b.dataset.action==="clozeCheck"||b.dataset.action==="courseFinished"||b.dataset.wc!==undefined||b.dataset.wt!==undefined;
 if(ambience&&!scoring)ambience.sound("tick");
 if(b.dataset.path){goPath(b.dataset.path);return}
 if(b.dataset.wc!==undefined){wordCheckAnswer(b.dataset.wc,b.dataset.value);return}
 if(b.dataset.wt!==undefined){wordTestAnswer(b.dataset.wt,b.dataset.value);return}
 if(b.dataset.tab){switchTab(b.dataset.tab);return}
 if(b.dataset.ch){setChapter(b.dataset.ch==="custom"?"custom":Number(b.dataset.ch));return}
 if(b.dataset.course){setCourseChapter(b.dataset.course);return}
 if(b.dataset.word){chosenWord=b.dataset.word;const container=b.closest("[data-sentence-container]");if(container&&Number(container.dataset.sentenceContainer)!==S.sel){clearVoice();if(!audio.paused)audio.pause();S.sel=Number(container.dataset.sentenceContainer)}fresh="word";save();render();return}
 if(b.dataset.sentence!==undefined){selectSentence(Number(b.dataset.sentence),true);return}
 if(b.dataset.guided!==undefined){if(!S.guided)return;
  if(activeCourse&&activeCourse.status==="approved"){
   const line=activeCourse.segments.flatMap(seg=>seg.sentences||[])[Number(b.dataset.guided)];
   if(line)globalThis.TablinumReviewDeck.seenSentence(v5State,activeCourse,line,exposureSession);
  }
  const k=chapterKey()+":"+b.dataset.guided;S.hintLevels[k]=((Number(S.hintLevels[k])||0)+1)%4;save();render();return}
 if(b.dataset.confidence){S.readingConfidence[chapterKey()]=b.dataset.confidence;save();render();return}
 if(b.dataset.save){const w=Object.prototype.hasOwnProperty.call(dict,b.dataset.save)?dict[b.dataset.save]:undefined;if(w){S.vocab[b.dataset.save]??={head:w.head,meaning:w.meaning,days:1,due:Date.now(),reps:0};const stored=save();render();updateBanner(stored?"Saved "+spell(w.head)+" to Memoria.":undefined)}return}
 if(b.dataset.unsave!==undefined){
  const k=b.dataset.unsave;
  if(Object.prototype.hasOwnProperty.call(S.vocab,k)&&confirm("Remove "+(S.vocab[k].head||k)+" from your saved words? Its review history will be deleted.")){
   const head=S.vocab[k].head||k;delete S.vocab[k];savedWordsOpen=true;reviewKey=null;reviewReveal=false;save();render();updateBanner("Removed "+spell(head)+" from Memoria.");
  }
  return;
 }
 if(b.dataset.exOrderShift!==undefined){moveOrder(b.dataset.exOrderShift,Number(b.dataset.orderIndex),Number(b.dataset.orderDelta));return}
 if(b.dataset.exOrderSubmit!==undefined){
  const ex=activeCourse?.exercises?.find(q=>q.id===b.dataset.exOrderSubmit);
  if(ex&&ex.type==="order")courseAnswer(ex.id,getOrder(ex));return;
 }
  if(b.dataset.exChoice!==undefined){
  const ex=activeCourse?.exercises?.find(q=>q.id===b.dataset.exChoice);
  const val=ex?.type==="tf"?b.dataset.exValue==="true":b.dataset.exValue;
  courseAnswer(b.dataset.exChoice,val);return;
 }
 if(b.dataset.exCheck!==undefined){
  courseAnswer(b.dataset.exCheck,$("exercise-"+b.dataset.exCheck)?.value||"");return;
 }
 if(b.dataset.exEvidence){
  if(activeCourse){
   const list=activeCourse.segments.flatMap(seg=>seg.sentences||[]);
   const at=list.findIndex(s=>s.id===b.dataset.exEvidence);
   if(at>=0){S.sel=at;S.tab="read";save();render()}
  }
  return;
 }
 if(b.dataset.showModel!==undefined){shownModels.add(b.dataset.showModel);render();return}
 if(b.dataset.exReveal){revealedCourseAnswers.add(b.dataset.exReveal);render();return}
 if(b.dataset.choice!==undefined){answer(Number(b.dataset.choice),b.dataset.value);return}
 if(b.dataset.check!==undefined){answer(Number(b.dataset.check),$("answer-"+b.dataset.check)?.value||"");return}
 if(b.dataset.rating){rating(b.dataset.rating);return}
 switch(b.dataset.action){
 case"macrons":S.macrons=!S.macrons;save();render();break;
 case"guide":S.guided=!S.guided;save();render();break;
 case"play":play();break;
 case"pause":if(mode()==="voice")clearVoice();else audio.pause();break;
 case"hearWord":hearWord();break;
 case"narrationTake":if(narration){const sid=currentSentenceId();narration.setAlternative(sid,!narration.usingAlternative(sid));clearVoice();updateDock();updateBanner("Alternative take selected. Click the sentence to listen.")}break;
 case"previous":selectSentence(S.sel-1);break;
 case"forward":selectSentence(S.sel+1);break;
 case"nextChapter":if(S.ch!=="custom")setChapter(Math.min(L.length-1,S.ch+1));break;
  case"prevChapter":setChapter(S.ch==="custom"?0:Math.max(0,S.ch-1));break;
 case"nextChapter":setChapter(Math.min(L.length-1,Number(S.ch||0)+1));break;
 case"courseFinished":{
  if(!activeCourse||activeCourse.status!=="approved")break;
  // The last visible line has no 'navigate away' event; count it now.
  const currentLine=activeCourse.segments.flatMap(seg=>seg.sentences||[])[S.sel];
  if(currentLine)globalThis.TablinumReviewDeck.seenSentence(v5State,activeCourse,currentLine,exposureSession);
  v5State.completedCourse||={};v5State.completedCourse[activeCourse.id]=true;
  const added=globalThis.TablinumReviewDeck.createApprovedCards(v5State,activeCourse,
   globalThis.TablinumCompiledContent?.lexicon||{},true,Date.now());
  if(ambience)ambience.sound("complete");
  save();render();updateBanner("Lēctiō lēcta. "+added+" reviewed cards added.");break;
 }
  case"revealCard":reviewReveal=true;fresh="reveal";render();break;
 case"clozeCheck":clozeCheck();break;
 case"importText":{
  const t=String($("customText")?.value||"");if(!t.trim())return updateBanner("Paste some Latin text first.");
  S.custom=t.slice(0,20000);S.customSentences=splitSentences(S.custom);for(const k of Object.keys(S.hintLevels))if(k.startsWith("custom:"))delete S.hintLevels[k];save();setChapter("custom");break;
 }
 case"clearText":
  if(confirm("Clear your imported Latin text?")){S.custom="";S.customSentences=[];if(S.ch==="custom")S.ch=0;save();render()}break;
 case"saveSegments":{
  const segments=String($("customSegments")?.value||"").split(/\r?\n/).map(v=>v.trim()).filter(Boolean).slice(0,300);
  if(!segments.length)return updateBanner("Add at least one nonempty segment.");
  S.customSentences=segments.map(x=>x.slice(0,1000));S.sel=Math.min(S.sel,S.customSentences.length-1);save();render();updateBanner("Sentence boundaries saved.");break;
 }
 case"clearAudio":{
  const key=chapterKey(),m=media();if(m){URL.revokeObjectURL(m.url);mediaByChapter.delete(key)}
  if(userMedia){userMedia.remove("chapter:"+key);userMedia.remove("timing:"+key)}
  useChapterAudio();render();break;
 }
 case"recordSpeak":{
  if(!userMedia)return updateBanner("Local recording module unavailable.");
  userMedia.startRecording(chapterKey(),currentSentenceId(),ambience)
   .then(()=>updateBanner("Recordātiō incepta. Recording started; no scoring."))
   .catch(e=>updateBanner("Microphone unavailable: "+e.message));break;
 }
 case"stopSpeak":{
  if(!userMedia||!userMedia.isRecording())return updateBanner("No recording is in progress.");
  userMedia.stopRecording(ambience)
   .then(x=>updateBanner(x.stored==="persistent"?"Speaking practice saved locally.":"Speaking practice is temporary. Export your recordings ZIP."))
   .catch(e=>updateBanner("Recording could not be saved: "+e.message));break;
 }
 case"compareSpeak":compareRecording().catch(e=>updateBanner("Speaking playback unavailable: "+e.message));break;
 case"exportRecordings":{
  if(userMedia)userMedia.exportRecordings()
   .then(zip=>{exportLocalBlob("tablinum-my-speaking-recordings.zip",zip);updateBanner("Personal recordings ZIP exported.");})
   .catch(e=>updateBanner("Cannot export recordings: "+e.message));break;
 }
 case"singleSentence":S.singleSentence=!S.singleSentence;save();if(S.singleSentence&&!audio.paused)startBoundaryMonitor();else stopBoundaryMonitor();render();break;
 case"export":{
  const now=new Date();
  if(!v5State.backup)v5State.backup={lastExportAt:null,backupReminderDays:30};
  const last=v5State.backup.lastExportAt;
  if(!last||Date.now()-Date.parse(last)>86400000)v5State.backup.lastExportAt=now.toISOString();
  const persisted=save();
  download("tablinum-backup-"+now.toISOString().slice(0,10)+".json",JSON.stringify(stateApi.backupEnvelope(v5State,now.toISOString()),null,2));
  warning="";updateBanner(persisted?"v5 backup exported. Keep it somewhere safe.":"Backup exported, but browser storage is unavailable; preserve the downloaded file.");
  break;
 }
 case"remigrateV4":{
  if(!confirm("Re-migrate from the original v4 profile? This will replace the current v5 state but keep the original v4 key and snapshot unchanged."))break;
  try{
   const raw=storage.getItem(stateApi.V4);
   if(!raw){updateBanner("No original v4 profile was found. Restore a backup instead.");break}
   let decoded;
   try{
    decoded=JSON.parse(raw);
    if(!decoded||typeof decoded!=="object"||Array.isArray(decoded))throw Error("Invalid v4 profile");
   }catch(error){
    updateBanner("Original v4 data is unreadable; restore a backup. Nothing was overwritten.");
    break;
   }
   const converted=stateApi.migrateV4toV5(decoded,legacyIdMap,legacyVocabMap);
   if(storage.getItem(stateApi.SNAPSHOT)===null)storage.setItem(stateApi.SNAPSHOT,raw);
   const result=stateApi.persist(storage,converted);
   if(result.ok){
    storageMode="ready";v5State=result.state;S=normalizeState(stateApi.legacyView(v5State,legacyIdMap));
    activeCourse=null;courseRequest++;render();
    updateBanner("v5 was rebuilt from the unchanged original v4 data. Export a backup now.");
   }else updateBanner(result.warning);
  }catch(error){
   updateBanner("Cannot access or preserve local storage. No migration was written; restore a backup or export your current data.");
  }
  break;
 }
 case"startWordTest":startWordTest();break;
 case"reset":if(confirm("Reset completed exercises, hints, confidence and saved vocabulary? Keep notes and text?")){S.correct={};S.answers={};S.vocab={};S.clozeAnswers={};S.clozeCorrect={};S.hintLevels={};S.readingConfidence={};if(WC)learning=WC.normalise({});save();render()}break;
 }
});
document.addEventListener("change",e=>{
 const t=e.target,file=t.files?.[0];if(!file)return;
 if(t.id==="textFile")loadText(file,content=>{S.custom=content.slice(0,20000);S.customSentences=splitSentences(S.custom);for(const k of Object.keys(S.hintLevels))if(k.startsWith("custom:"))delete S.hintLevels[k];save();render();if(content.length>20000)updateBanner("Imported text was shortened to 20,000 characters.")},1024*1024);
 if(t.id==="timingFile")loadText(file,attachRanges,1024*1024);
 if(t.id==="restoreFile")loadText(file,restoreBackup,12*1024*1024);
 if(t.id==="audioFile"){
  const key=chapterKey(),prior=mediaByChapter.get(key);if(prior)URL.revokeObjectURL(prior.url);
  mediaByChapter.set(key,{url:URL.createObjectURL(file),name:file.name,ranges:[]});useChapterAudio();render();
  if(userMedia)userMedia.saveAudio(key,file)
   .then(x=>updateBanner(x.stored==="persistent"?"Audio saved on this device (not in progress backup).":"Audio attached for this session only; export original file."))
   .catch(e=>updateBanner("Audio can play now but storage failed: "+e.message));
 }
});
document.addEventListener("input",e=>{
 if(e.target.id==="music-volume"){if(ambience)ambience.set({musicVolume:Number(e.target.value)});return}
 if(e.target.id==="sfx-volume"){if(ambience)ambience.set({sfxVolume:Number(e.target.value)});return}
 if(e.target.id==="notes"){S.notes[chapterKey()]=e.target.value.slice(0,5000);save()}else if(e.target.id==="audioSeek"&&Number.isFinite(Number(e.target.value))){audio.currentTime=Number(e.target.value)}});
document.addEventListener("keydown",e=>{
 if(S.tab==="review"&&reviewKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest?.("input,textarea,select,[contenteditable]")){
  /* Space and Enter keep their normal job on a focused control, except on the Memoria tab itself,
   * where focus rests after the learner opens the tab. */
  const control=e.target.closest?.("button,a,summary"),free=!control||control.dataset?.tab==="review";
  if(!reviewReveal&&free&&(e.key===" "||e.key==="Enter")&&document.querySelector("[data-action='revealCard']")){e.preventDefault();reviewReveal=true;fresh="reveal";render();return}
  if(reviewReveal&&/^[1-4]$/.test(e.key)&&document.querySelector("[data-rating]")){e.preventDefault();rating(RATINGS[Number(e.key)-1]);return}
 }
 if(e.key==="Enter"&&e.target.id?.startsWith("answer-")){e.preventDefault();answer(Number(e.target.id.slice(7)),e.target.value)}
 if(e.key==="Enter"&&e.target.id==="clozeInput"){e.preventDefault();clozeCheck()}
 if((e.key==="ArrowLeft"||e.key==="ArrowRight")&&e.target.matches?.(".word")){
  const group=e.target.closest(".words, .hint-words");if(!group)return;
  const buttons=[...group.querySelectorAll(".word")];const n=buttons.indexOf(e.target);if(n<0)return;
  e.preventDefault();e.target.tabIndex=-1;const next=buttons[(n+(e.key==="ArrowLeft"?-1:1)+buttons.length)%buttons.length];next.tabIndex=0;next.focus();
 }
});
audio.addEventListener("timeupdate",()=>{
 const seek=$("audioSeek");if(seek&&Number.isFinite(audio.currentTime)&&document.activeElement!==seek)seek.value=String(audio.currentTime);
 if(mode()!=="timed")return;
 const ranges=media().ranges,clock=audio.currentTime;
 if(S.singleSentence&&ranges[S.sel]&&clock>=ranges[S.sel].end-0.025){audio.pause();return}
 const i=ranges.findIndex(t=>clock>=t.start&&clock<t.end);
 if(i>=0&&i!==S.sel){S.sel=i;save();updateSentenceHighlight()}

});
audio.addEventListener("play",()=>{startBoundaryMonitor();if(ambience)ambience.duck(true)});
audio.addEventListener("pause",()=>{stopBoundaryMonitor();if(ambience)ambience.duck(readingIndex!==null)});
audio.addEventListener("ended",()=>{stopBoundaryMonitor();if(ambience)ambience.duck(readingIndex!==null)});
audio.addEventListener("loadedmetadata",()=>{
 syncAudioElement();
 const m=media();if(!m||!m.ranges.length)return;
 try{validateRanges(m.ranges,current().sent.length,audio.duration)}
 catch(e){m.ranges=[];updateBanner("Audio timings rejected after duration check: "+e.message);render()}
});
if("speechSynthesis" in window)speechSynthesis.addEventListener?.("voiceschanged",()=>updateDock());
window.TablinumAudit={currentChapter:()=>current(),normalizeState,correctAnswer,splitSentences,validateRanges,chapterCount:()=>L.length,questions:()=>L.reduce((n,c)=>n+c.q.length,0),cloze:()=>guidedCloze.length,knownWords:()=>Object.keys(dict).length,contextualClue,lessonAt:i=>L[i]};
const statusBar=document.createElement("div");statusBar.id="appStatus";statusBar.setAttribute("role","status");statusBar.setAttribute("aria-live","polite");statusBar.className="app-status";document.body.insertBefore(statusBar,document.querySelector("footer"));
render();
if(globalThis.Tablinum.errors.length)updateBanner(globalThis.Tablinum.errors.join(" "));
else if(v5State.ui.chapterId&&/^b0[1-3]-c\d{3}$/.test(v5State.ui.chapterId)&&globalThis.Tablinum.catalogue.has(v5State.ui.chapterId))setCourseChapter(v5State.ui.chapterId);

})();
