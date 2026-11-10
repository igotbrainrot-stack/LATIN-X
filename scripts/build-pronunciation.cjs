#!/usr/bin/env node
"use strict";
/* Builds the pronunciation lexicon and the listening sheet from the course text.
 *   node scripts/build-pronunciation.cjs          write both files
 *   node scripts/build-pronunciation.cjs --check  fail if either file is stale
 * Inputs: the course text (scripts/lib/latin-corpus.cjs), the rules
 * (scripts/lib/latin-phonology.cjs), source evidence produced by
 * pronunciation/tools/collatinus_stem_check.py, and hand notes in
 * pronunciation/QUANTITY_NOTES.json. */
const fs=require("node:fs"),path=require("node:path");
const C=require("./lib/latin-corpus.cjs");
const P=require("./lib/latin-phonology.cjs");
const root=C.root;
const rel=f=>path.join(root,f);
const evidence=JSON.parse(fs.readFileSync(rel("pronunciation/data/quantity_evidence.json"),"utf8")).forms;
const notes=JSON.parse(fs.readFileSync(rel("pronunciation/QUANTITY_NOTES.json"),"utf8")).entries;
const ev=new Map(evidence.map(e=>[e.form,e]));
const noteFor=form=>notes.find(n=>n.forms.includes(form));
const LONGV=/[āēīōūȳ]/;

/* Regular verb endings by Collatinus paradigm model, with vowel lengths as A&G
 * gives them (§168 tense signs, §167 shortening before final -m, -t, -nt,
 * paradigms §§184–188, eō §203). A printed ending that matches one of these
 * (ignoring macrons) has its ending vowels confirmed or flagged. */
const E1=["āre","ābam","ābās","ābat","ābāmus","ābātis","ābant","ābō","ābis","ābit","ābimus","ābitis","ābunt","āmus","ātis","ās","at","ant","ō"];
const E2=["ēre","ēbam","ēbās","ēbat","ēbāmus","ēbātis","ēbant","ēbō","ēbit","ēbimus","ēbunt","ēmus","ētis","ēs","et","ent","eō","ē"];
const E3=["ere","ēbam","ēbās","ēbat","ēbāmus","ēbātis","ēbant","ēmus","ētis","it","unt","imus","itis","is","ō","am","e","endō","endī","endum"];
const E3I=["ere","iō","it","iunt","imus","itis","is","iēbam","iēbat","iēbant","iēmus","iet","ient","iam","e","iendī","iendō"];
const E4=["īre","iō","īs","it","īmus","ītis","iunt","iēbam","iēbat","iēbant","iēmus","iet","ient","iam","ī"];
const EEO=["īre","ībō","ībis","ībit","ībimus","ībitis","ībunt","ībam","ībat","īmus","ītis","īs","it","eunt","eō","ī"];
const VERB_ENDINGS={amo:E1,moneo:E2,lego:E3,dico:E3,capio:E3I,facio:E3I,audio:E4,eo:EEO};
function endingCheck(form,models){
 const w=form.normalize("NFC").toLowerCase().replace(/(?<=[^aeiouyāēīōū])ne$/,""),pw=P.plain(w);
 // Only when every analysis of the form is a regular verb: a homograph noun or
 // adjective (Mārcus/marceō, quis/queō) would otherwise borrow a verb ending.
 const verbal=models.filter(m=>m!=="inv");
 if(!verbal.length||verbal.some(m=>!VERB_ENDINGS[m]))return null;
 const hits=[];
 for(const m of verbal){
  const list=VERB_ENDINGS[m];if(!list)continue;
  const end=list.filter(e=>pw.endsWith(P.plain(e))&&(pw.length>e.length||m==="eo")).sort((a,b)=>b.length-a.length)[0];
  if(end)hits.push(end);
 }
 if(!hits.length)return null;
 const end=hits[0];
 if(hits.some(h=>h!==end))return null; // homographs from different verbs (emere: emō / ēmereō)
 const start=w.length-end.length,confirmed=[],conflicts=[];
 for(let k=0;k<end.length;k++){
  const e=end[k],c=w[start+k];if(!/[aeiouyāēīōūȳ]/.test(e))continue;
  if(LONGV.test(e)===LONGV.test(c))confirmed.push(start+k);else conflicts.push(c+" in -"+end);
 }
 return {ending:end,confirmed,conflicts};
}

/* Rule confirmations that need no dictionary: a vowel directly before another
 * vowel is short (A&G §603.a), and a vowel before ns or nf is long (§603.d). */
function ruleCheck(form,slots){
 const w=form.normalize("NFC").toLowerCase(),confirmed=[],conflicts=[];
 for(const s of slots){
  if(s.diph)continue;
  const next=w[s.index+1]||"";
  if(/[aeiouyāēīōū]/.test(next)&&!s.consonantalNext){
   if(!s.long)confirmed.push(s.index);else conflicts.push(s.letter+" before a vowel (A&G §603.a)");
  }
  if(/^n[sf]/.test(w.slice(s.index+1))){
   if(s.long)confirmed.push(s.index);else conflicts.push(s.letter+" before n"+w[s.index+2]+" (A&G §603.d)");
  }
 }
 return {confirmed,conflicts};
}

/* Vowel letters of a form with their syllable and whether that syllable is open. */
function vowelSlots(form){
 const w=form.normalize("NFC").toLowerCase(),a=P.analyseWord(form),out=[];
 // Map vowels to syllables by counting nuclei left to right on the analysed syllables.
 let syl=0,seen=0;const nuclei=a.syllables.map(s=>(s.match(/[aeiouyɛɪɔʊʏ]ː?(?:[eiu]̯)?/g)||[]).length);
 for(let i=0;i<w.length;i++){
  const c=w[i];if(!/[aeiouyāēīōūȳ]/.test(c))continue;
  const plainC=P.plain(c);
  const prev=out.length?out[out.length-1]:null;
  if(prev&&prev.index===i-1&&["ae","au","oe"].includes(P.plain(w[i-1])+plainC)&&!LONGV.test(w[i-1])){prev.diph=true;continue;}
  if(c==="i"&&/[aeiouyāēīōū]/.test(w[i+1]||"")&&(i===0||/[aeiouyāēīōū]/.test(w[i-1]))&&!a.exception)continue; // consonantal i
  if(c==="u"&&i>0&&(w[i-1]==="q"||(w[i-1]==="g"&&w[i-2]==="n"&&/[aeiouyāēīōū]/.test(w[i+1]||""))))continue;
  while(syl<nuclei.length&&seen>=nuclei[syl]){syl++;seen=0;}
  seen++;
  const s=a.syllables[syl]||"";
  const nx=w[i+1]||"",nx2=w[i+2]||"";
  const consonantalNext=(nx==="i"&&/[aeiouyāēīōū]/.test(nx2)&&!a.exception)||["ae","au","oe"].includes(P.plain(c)+nx);
  out.push({index:i,letter:c,long:LONGV.test(c),syllable:syl,open:/[aeiouyɛɪɔʊʏː̯]$/.test(s),consonantalNext});
 }
 return {analysis:a,slots:out};
}

function lexiconRows(){
 const words=C.words(),rows=[];
 for(const [form,records] of [...words].sort((x,y)=>x[0].localeCompare(y[0],"la"))){
  const e=ev.get(form)||{lemmas:[],lewis_short:{verdict:"missing",confirmed:[],other_stems:[]},collatinus:{verdict:"missing",confirmed:[],other_stems:[]}};
  const {analysis:a,slots}=vowelSlots(form);
  const ls=e.lewis_short,co=e.collatinus,n=noteFor(form);
  const endc=endingCheck(form,e.models||[]),rule=ruleCheck(form,slots);
  const confirmed=new Set([...ls.confirmed,...co.confirmed,...rule.confirmed,...(endc&&endc.confirmed||[])]);
  const conflicts=[...rule.conflicts,...(endc?endc.conflicts||[endc.conflict]:[])].filter(Boolean);
  const unchecked=slots.filter(s=>!s.diph&&!confirmed.has(s.index)&&!(n&&n.status!=="UNKNOWN"));
  const hidden=slots.filter(s=>s.long&&!s.open&&!confirmed.has(s.index));
  let status;
  if(n)status=n.status;
  else if(conflicts.length)status="AMBIGUOUS";
  else if(ls.verdict==="agree"||ls.verdict==="agree_other_stem_differs")status=co.verdict==="disagree"?"AMBIGUOUS":"VERIFIED";
  else if(co.verdict==="agree"||co.verdict==="agree_other_stem_differs")status="SUPPORTED";
  else if(confirmed.size)status="SUPPORTED";
  else status="UNKNOWN";
  const n3=a.syllables.length>=3,pen=a.syllables.length-2;
  const stressRisk=n3&&!a.exception&&slots.some(s=>s.syllable===pen&&s.open&&!s.diph&&unchecked.includes(s));
  rows.push({form,lemma:e.lemmas.join(" "),status,
   syllables:a.syllables.join("."),stress:a.stress+1,ipa:a.ipa,
   lewis_short:ls.verdict,collatinus:co.verdict,
   rules:[endc&&endc.ending?"ending -"+endc.ending:"",rule.confirmed.length?"A&G §603":""].filter(Boolean).join("; "),
   vowels_confirmed:slots.filter(x=>!x.diph&&confirmed.has(x.index)).length+"/"+slots.filter(x=>!x.diph).length,
   conflicts:conflicts.join("; "),
   unchecked_open_vowels:unchecked.filter(s=>s.open).map(s=>s.letter+"@"+(s.syllable+1)).join(" "),
   hidden_long_vowels:hidden.map(s=>s.letter+"@"+(s.syllable+1)).join(" "),
   stress_depends_on_unchecked_vowel:stressRisk?"yes":"",
   other_readings:[...new Set([...ls.other_stems,...co.other_stems])].slice(0,3).join(" | "),
   note:n?n.note+(n.source?" ["+n.source+"]":""):"",
   spoken:[...records].some(r=>r.startsWith("narration."))?"yes":"",
   records:records.size});
 }
 return rows;
}

const tsvCell=v=>String(v).replace(/[\t\n]/g," ");
function toTsv(rows){
 const cols=Object.keys(rows[0]);
 return "# LATIN-X-RCL-v1 quantity lexicon. Generated by scripts/build-pronunciation.cjs; edit pronunciation/QUANTITY_NOTES.json, not this file.\n"+
  cols.join("\t")+"\n"+rows.map(r=>cols.map(c=>tsvCell(r[c])).join("\t")).join("\n")+"\n";
}
const csvCell=v=>{v=String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};

/* What to listen for in one take, generated from the analysis of its words. */
function focus(text,lex){
 const items=[];
 const add=s=>{if(!items.includes(s))items.push(s);};
 for(const a of P.analyseText(text)){
  const w=a.word,p=P.plain(w),row=lex.get(w)||lex.get(w.toLowerCase());
  if(/^tit/.test(p))add(w+": short i in Ti- (Tĭtus, LX-001)");
  if(row&&row.status==="AMBIGUOUS")add(w+": disputed ("+row.note.split(".")[0]+")");
  const gem=p.match(/([bcdfglmnprst])\1/);if(gem)add(w+": double "+gem[1]+gem[1]+" held longer");
  if(/[āēīōūȳ]/.test(w))add(w+": long "+[...w.matchAll(/[āēīōūȳ]/g)].map(m=>m[0]).join(", "));
  if(a.syllables.length>=3)add(w+": stress "+a.syllables[a.stress].replace(/[ˈ]/g,""));
  if(/c(?:e|i|y|ae|oe)/.test(p))add(w+": hard c [k] before e/i");
  if(/g(?:e|i|y|ae|oe)/.test(p))add(w+": hard g before e/i");
  if(/^v|[^q]v/.test(p))add(w+": v as [w]");
  const di=p.match(/ae|au|oe/);if(di&&!(row&&row.status==="AMBIGUOUS"))add(w+": "+di[0]+" one syllable ["+di[0]+"̯]");
  if(/qu/.test(p))add(w+": qu as [kʷ]");
  if(/[pct]h/.test(p))add(w+": "+p.match(/[pct]h/)[0]+" aspirated stop, not [f] or [θ]");
  if(/gn/.test(p))add(w+": gn as [ŋn]");
 }
 return items;
}

function listeningRows(lex){
 require(rel("content/narration.js"));
 const n=globalThis.TablinumNarrationCatalogue,rows=[];
 const takes=[...n.sentences.flatMap(s=>s.takes.map(t=>({id:s.sentence_id,text:s.canonical_text,t}))),...n.words.map(w=>({id:w.clip_id,text:w.canonical_text,t:w}))];
 for(const {id,text,t} of takes){
  rows.push({clip_id:t.clip_id,file:t.file,record:id,text,
   target_ipa:"/"+P.transcribe(text)+"/",
   listen_for:focus(text,lex).join("; "),
   owner_listening_now:t.owner_listening||"",
   vowel_length:"",double_consonants:"",stress:"",consonants:"",overall:"",reviewer:"",date:"",comment:""});
 }
 return rows;
}
function toCsv(rows){
 const cols=Object.keys(rows[0]);
 return cols.join(",")+"\n"+rows.map(r=>cols.map(c=>csvCell(r[c])).join(",")).join("\n")+"\n";
}

function build(){
 const lexRows=lexiconRows();
 const lex=new Map(lexRows.map(r=>[r.form,r]));
 return {"pronunciation/QUANTITY_LEXICON.tsv":toTsv(lexRows),"pronunciation/LISTENING_SHEET.csv":toCsv(listeningRows(lex))};
}

if(require.main===module){
 const out=build(),check=process.argv.includes("--check");let stale=0;
 for(const [f,txt] of Object.entries(out)){
  const cur=fs.existsSync(rel(f))?fs.readFileSync(rel(f),"utf8"):"";
  if(check){
   if(f.endsWith("LISTENING_SHEET.csv")&&cur){ // reviewers fill in verdict columns; only the generated columns must match
    const gen=s=>s.split("\n").map(l=>l.split(",").slice(0,2).join(",")).join("\n");
    if(gen(cur)!==gen(txt)){console.error("STALE "+f+" (clip list changed)");stale++;}
   }else if(cur!==txt){console.error("STALE "+f);stale++;}
  }else if(f.endsWith("LISTENING_SHEET.csv")&&cur&&!process.argv.includes("--reset-sheet")){
   console.log("kept "+f+" (has reviewer columns; pass --reset-sheet to regenerate)");
  }else{fs.writeFileSync(rel(f),txt);console.log("wrote "+f);}
 }
 process.exit(stale?1:0);
}
module.exports={build,lexiconRows,vowelSlots};
