"use strict";
/* LATIN-X Restored Classical Latin v1 (LATIN-X-RCL-v1): word-level phonology.
 *
 * Input is a word as the course prints it, with macrons for long vowels.
 * Output is syllables, syllable weight, stress and a broad phonemic transcription.
 * The rules follow pronunciation/CLASSICAL_PRONUNCIATION_STANDARD.md, which cites
 * Allen & Greenough (A&G) section by section. The code does not decide vowel
 * length: that comes from the printed macrons, checked separately in
 * pronunciation/QUANTITY_LEXICON.tsv. Words the rules cannot handle are listed in
 * pronunciation/EXCEPTIONS.json with an explicit analysis and a status.
 */
const path=require("node:path");
const EXCEPTIONS=require(path.join(__dirname,"../../pronunciation/EXCEPTIONS.json"));

const LONG={"ā":"a","ē":"e","ī":"i","ō":"o","ū":"u","ȳ":"y"};
const SHORT_VOWELS="aeiouy";
const STOPS=new Set(["p","b","t","d","k","g","pʰ","tʰ","kʰ"]);
const LIQUIDS=new Set(["l","r"]);
const VELARS=new Set(["k","g","kʷ","gʷ","kʰ"]);
/* Default diphthongs (A&G §2; §603.b). ei, eu and ui are diphthongs only in the
 * words listed in EXCEPTIONS.json, because elsewhere they are two syllables
 * (de-us, fu-it, me-ī). */
const DIPHTHONGS=new Set(["ae","au","oe"]);
/* Words that end in -que but are not host + enclitic (A&G §12.a). */
const QUE_NOT_ENCLITIC=new Set(["quoque","denique","undique","utique","itaque","usque","quisque","atque","neque"]);

const plain=s=>s.normalize("NFC").toLowerCase().replace(/[āēīōūȳ]/g,c=>LONG[c]);
const isVowelChar=c=>SHORT_VOWELS.includes(c)||c in LONG;

/* Split a lowercase NFC word into segments: {t:"V",ipa,long,diph} or {t:"C",ipa}. */
function segment(w){
 const s=[];const n=w.length;
 const at=i=>i<n?w[i]:"";
 for(let i=0;i<n;i++){
  const c=w[i],nx=at(i+1);
  if(c==="q"&&nx==="u"){s.push({t:"C",ipa:"kʷ"});i++;continue;}               // A&G §5 n.2
  if(c==="g"&&nx==="u"&&at(i-1)==="n"&&isVowelChar(at(i+2))){s.push({t:"C",ipa:"gʷ"});i++;continue;}
  if((c==="p"||c==="t"||c==="c")&&nx==="h"){s.push({t:"C",ipa:(c==="c"?"k":c)+"ʰ"});i++;continue;} // A&G §4
  if(c==="r"&&nx==="h"){s.push({t:"C",ipa:"r"});i++;continue;}
  if(c==="x"){s.push({t:"C",ipa:"k"},{t:"C",ipa:"s"});continue;}               // A&G §4: x = cs
  if(c==="z"){s.push({t:"C",ipa:"d"},{t:"C",ipa:"z"});continue;}               // z = dz
  if(c==="h"){s.push({t:"H",ipa:"h"});continue;}                               // h is a breathing
  if(c==="v"||c==="w"){s.push({t:"C",ipa:"w"});continue;}
  if(c==="j"){s.push({t:"C",ipa:"j"});continue;}
  if(c==="c"||c==="k"){s.push({t:"C",ipa:"k"});continue;}
  if(c==="g"){s.push({t:"C",ipa:"g"});continue;}
  if(c==="i"&&isVowelChar(nx)){
   const prev=s.length?s[s.length-1]:null;
   if(!prev){s.push({t:"C",ipa:"j"});continue;}                                // word-initial i + vowel: iam
   if(prev.t==="V"){s.push({t:"C",ipa:"j"},{t:"C",ipa:"j"});continue;}         // intervocalic i is double: cuius (A&G §11.d)
  }
  if(isVowelChar(c)){
   const base=LONG[c]||c,long=c in LONG;
   if(!long&&DIPHTHONGS.has(base+nx)){s.push({t:"V",ipa:base+nx+"̯",long:true,diph:true});i++;continue;}
   s.push({t:"V",ipa:base,long});continue;
  }
  if(/[a-z]/.test(c)){s.push({t:"C",ipa:c});continue;}
 }
 return s;
}

/* Divide segments into syllables (A&G §7): one consonant goes with the following
 * vowel; of two or more, the last goes with the following vowel, except that a
 * stop + l/r pair begins the next syllable together (prose default; A&G §603.f
 * calls such syllables "common" in verse). h never closes a syllable. */
function syllabify(segs){
 const nuclei=[];segs.forEach((x,i)=>{if(x.t==="V")nuclei.push(i);});
 if(!nuclei.length)return [];
 const syl=nuclei.map(()=>({onset:[],nucleus:null,coda:[]}));
 segs.slice(0,nuclei[0]).forEach(x=>syl[0].onset.push(x));
 nuclei.forEach((ni,k)=>{
  syl[k].nucleus=segs[ni];
  const end=k+1<nuclei.length?nuclei[k+1]:segs.length;
  const between=segs.slice(ni+1,end);
  if(k+1===nuclei.length){syl[k].coda.push(...between);return;}
  const cons=between.filter(x=>x.t==="C");
  let split; // index in `between` where the next onset starts
  if(cons.length<=1)split=between.findIndex(x=>x.t==="C"||x.t==="H");
  else{
   const last=cons[cons.length-1],prev=cons[cons.length-2];
   const take=(STOPS.has(prev.ipa)&&LIQUIDS.has(last.ipa))?2:1;
   const target=cons[cons.length-take];
   split=between.indexOf(target);
   while(split>0&&between[split-1].t==="H")split--;
  }
  if(split<0)split=between.length;
  syl[k].coda.push(...between.slice(0,split));
  syl[k+1].onset.push(...between.slice(split));
 });
 return syl.map(x=>({
  onset:x.onset,nucleus:x.nucleus,coda:x.coda,
  heavy:x.nucleus.long||x.coda.some(c=>c.t==="C") // A&G §603.e–f
 }));
}

function stressIndex(syls,word){
 const n=syls.length;
 if(n<=2)return 0;                                       // A&G §12
 const p=plain(word);
 if(p.endsWith("que")&&!QUE_NOT_ENCLITIC.has(p))return n-2; // A&G §12.a: syllable before the enclitic
 if(/[^aeiouy]ne$/.test(p))return n-2;                   // -ne after a consonant: estne, habetne
 return syls[n-2].heavy?n-2:n-3;
}

/* Phonetic detail applied to the broad transcription: n before a velar is [ŋ],
 * and g before n is [ŋ] (Allen, Vox Latina ch.1; A&G §4 table). */
/* Vowel quality follows the house convention in docs/audio/CLASSICAL_LATIN_TTS_GUIDE_FOR_GPT.md
 * (after Allen): long vowels tense with ː, short vowels lax. */
const SHORT_Q={a:"a",e:"ɛ",i:"ɪ",o:"ɔ",u:"ʊ",y:"ʏ"};
function sylIpa(x,next){
 const parts=[...x.onset,x.nucleus,...x.coda];
 return parts.map((seg,i)=>{
  if(seg.t==="V")return seg.diph?seg.ipa:(seg.long?seg.ipa+"ː":SHORT_Q[seg.ipa]);
  const after=parts[i+1]||(next&&[...next.onset,next.nucleus][0]);
  if(seg.ipa==="n"&&after&&VELARS.has(after.ipa))return "ŋ";
  if(seg.ipa==="g"&&after&&after.ipa==="n")return "ŋ";
  return seg.ipa.replace("g","ɡ");                       // IPA script g (U+0261)
 }).join("");
}

function analyseWord(word){
 const p=plain(word);
 const ex=EXCEPTIONS.words.find(e=>e.form===p&&(e.printed===undefined||e.printed===word.normalize("NFC").toLowerCase()));
 if(ex){
  const syls=ex.syllables.map((s,i)=>({ipa:s,heavy:ex.weights[i]==="H"}));
  return {word,syllables:ex.syllables.slice(),weights:ex.weights.split(""),stress:ex.stress,
   ipa:"/"+syls.map((s,i)=>(i===ex.stress&&syls.length>1?"ˈ":"")+s.ipa).join(".")+"/",
   status:ex.status,exception:true,note:ex.note};
 }
 const segs=segment(word.normalize("NFC").toLowerCase());
 const syls=syllabify(segs);
 if(!syls.length)return {word,syllables:[],weights:[],stress:-1,ipa:"",exception:false};
 const st=stressIndex(syls,word);
 const ipas=syls.map((x,i)=>sylIpa(x,syls[i+1]));
 return {word,syllables:ipas,weights:syls.map(x=>x.heavy?"H":"L"),stress:st,
  ipa:"/"+ipas.map((s,i)=>(i===st&&syls.length>1?"ˈ":"")+s).join(".")+"/",exception:false};
}

const WORD=/[A-Za-zāēīōūȳĀĒĪŌŪȲ]+/g;
function analyseText(text){return (String(text).match(WORD)||[]).map(analyseWord);}
function transcribe(text){return analyseText(text).map(a=>a.ipa.slice(1,-1)).join(" ");}

module.exports={analyseWord,analyseText,transcribe,plain,STANDARD:"LATIN-X-RCL-v1"};
