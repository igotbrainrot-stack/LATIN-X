"use strict";
/* Collects every Latin word the course shows or speaks, with the records it
 * comes from. Used by the pronunciation lexicon coverage test and the listening
 * sheet. Read-only. */
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../..");
const readJson=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const WORD=/[A-Za-zāēīōūȳĀĒĪŌŪȲ]+/g;
/* Tokens in Latin fields that are not Latin words: English instructions and
 * bare stems in the pilot's ending exercises (q006), and Roman numerals. */
const IGNORE=new Set(["aqu","dōn","audi","Flāvi","choice","choose","Choose","ending","Ending","plural","picture","or"]);

/* Latin strings in the interface (after LX-007 to LX-014). Each must occur in
 * one of the listed files; tests/latin-pronunciation.test.cjs checks this. */
const UI_LATIN=[
 ["app/legacy-runtime.js",["Legō","Lēctiō","Exercitia","Memoria","Prōgressus","Liber prīmus","Dux discendī","Verbum ēlēctum","Rēctē","Relege sententiam","Bene respondistī","Nōndum","Relege narrātiōnem","Vērum","Falsum","Respondē Latīnē","Servāta","Hodiē","Posteā","Ēlige verbum Latīnum in lēctiōne","Ostende significātiōnem","Mūsica ex fontibus Graecīs et Rōmānīs īnspīrāta est","reconstrūctiō incerta est","Vōx mea","Lēctiō lēcta","Recordātiō incepta","Intellege et respondē","propria","Verbum dēest"]],
 ["index.html",["Prīma Via","Discere legendō","Hortus","Familia","Dōnum","Cēna","Forum","Canis","Tempestās","Crās"]],
 ["app/65-picture-practice.js",["Quaestiōnēs pictae","Caput","Rēctē"]],
 ["content/music.js",["Hortus serēnus","Sub columnīs","Vesper in vīllā"]]
];

function sources(){
 const out=[]; // {record, text, spoken}
 for(let i=1;i<=8;i++){
  const id="ch0"+i,l=readJson("lessons/legacy/"+id+".json"),s=l.legacy_source;
  out.push({record:l.id+".name",text:s.name},{record:l.id+".sub",text:s.sub},{record:l.id+".context",text:s.context});
  for(const x of l.sentences)out.push({record:x.id,text:x.text_la});
  s.v.forEach((v,k)=>out.push({record:l.id+".v"+(k+1),text:v[0]+" "+(v[2]||"")}));
  for(const q of l.questions){const t=q.legacy_source;out.push({record:q.id,text:[t[0],...(t[1]||[]),...[].concat(t[2]),t[3]].join(" ")});}
  const c=l.cloze_source;out.push({record:l.id+".cloze",text:[c.text,...c.answers,c.clue,c.proof].join(" ")});
 }
 require(path.join(root,"content/narration.js"));
 const n=globalThis.TablinumNarrationCatalogue;
 for(const s of n.sentences)out.push({record:"narration."+s.sentence_id,text:s.canonical_text,spoken:true});
 for(const w of n.words)out.push({record:"narration."+w.clip_id,text:w.canonical_text,spoken:true});
 const pe=readJson("curriculum/picture-exercises-b01.json");
 for(const e of Object.values(pe.chapters).flat())out.push({record:"pic."+e.id,text:e.prompt_la});
 for(let c=1;c<=8;c++){
  const b=readJson("lessons/b01/c00"+c+".json");
  out.push({record:b.id+".title",text:b.title});
  for(const seg of b.segments){out.push({record:seg.id,text:seg.title_la});for(const x of seg.sentences)out.push({record:x.id,text:x.text_la});}
  for(const e of b.exercises)out.push({record:e.id,text:e.prompt_la||[e.prompt_text,e.model_answer_raw].filter(Boolean).join(" ")});
 }
 for(const [file,strings] of UI_LATIN)for(const s of strings)out.push({record:"ui:"+file+":"+s,text:s});
 return out.filter(x=>x.text);
}

/* Distinct word forms. Capitalised forms are folded into lower case unless the
 * word only ever appears capitalised (names). */
function words(){
 const seen=new Map();
 for(const s of sources())for(const w of String(s.text).normalize("NFC").match(WORD)||[]){
  if(IGNORE.has(w)||/^[IVXL]+$/.test(w))continue;
  if(!seen.has(w))seen.set(w,new Set());seen.get(w).add(s.record);
 }
 const lowerSet=new Set([...seen.keys()].filter(w=>w===w.toLowerCase()));
 const forms=new Map();
 for(const [w,recs] of seen){
  const key=(w!==w.toLowerCase()&&lowerSet.has(w.toLowerCase()))||/^[A-Z]{2,}$/.test(w)?w.toLowerCase():(w[0]===w[0].toUpperCase()&&!isName(w,seen)?w.toLowerCase():w);
  if(!forms.has(key))forms.set(key,new Set());recs.forEach(r=>forms.get(key).add(r));
 }
 return forms;
}
const NAMES=/^(Titus|Titī|Titō|Titum|Mārc|Līvi|Flāvi|Gā|Rōmān|Latīn|Graec|Tablinum)/;
function isName(w){return NAMES.test(w);}

module.exports={sources,words,UI_LATIN,root};
