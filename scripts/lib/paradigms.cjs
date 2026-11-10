"use strict";
/* Editorial proposal engine: generated forms never count as approved until
 * a pattern sample has been inspected and signed by the human reviewer. */
const assert=require("node:assert/strict");
const cases=["nom","gen","dat","acc","abl","voc"],numbers=["sg","pl"],persons=["1sg","2sg","3sg","1pl","2pl","3pl"];
const form=(surface,morph,extra={})=>({surface:surface.normalize("NFC"),morph,...extra});
function cut(word,end,label){assert(typeof word==="string"&&word.endsWith(end)&&word.length>end.length,label+" must end in "+end);return word.slice(0,-end.length)}
const nounRules={
 "noun-1":{sg:["a","ae","ae","am","ā","a"],pl:["ae","ārum","īs","ās","īs","ae"]},
 "noun-2-m":{sg:[null,"ī","ō","um","ō",null],pl:["ī","ōrum","īs","ōs","īs","ī"]},
 "noun-2-n":{sg:[null,"ī","ō",null,"ō",null],pl:["a","ōrum","īs","a","īs","a"]},
 "noun-3":{sg:[null,"is","ī","em","e",null],pl:["ēs","um","ibus","ēs","ibus","ēs"]},
 "noun-3-n":{sg:[null,"is","ī",null,"e",null],pl:["a","um","ibus","a","ibus","a"]},
 "noun-3-i":{sg:[null,"is","ī","em","e",null],pl:["ēs","ium","ibus","ēs","ibus","ēs"]},
 "noun-3-i-n":{sg:[null,"is","ī",null,"ī",null],pl:["ia","ium","ibus","ia","ibus","ia"]},
 "noun-4":{sg:[null,"ūs","uī","um","ū",null],pl:["ūs","uum","ibus","ūs","ibus","ūs"]},
 "noun-4-n":{sg:[null,"ūs","ū",null,"ū",null],pl:["ua","uum","ibus","ua","ibus","ua"]},
 "noun-5":{sg:[null,"ī","ī","m","",null],pl:["s","rum","bus","s","bus","s"]}
};
function nounPattern(x){
 if(x.pattern)return x.pattern;
 const d=String(x.declension),n=["n","neuter"].includes(x.gender);
 if(d==="1")return "noun-1";
 if(d==="2")return n?"noun-2-n":"noun-2-m";
 if(d==="3")return x.i_stem?(n?"noun-3-i-n":"noun-3-i"):(n?"noun-3-n":"noun-3");
 if(d==="4")return n?"noun-4-n":"noun-4";
 if(d==="5")return "noun-5";
 throw Error("No regular noun pattern for declension "+d);
}
function generateNounForms(x){
 const p=nounPattern(x),rule=nounRules[p];assert(rule,"Unsupported noun pattern "+p);
 const head=String(x.head||x.nominative||"").normalize("NFC"),gen=String(x.genitive||"").normalize("NFC");
 const end=p==="noun-1"?"ae":p.startsWith("noun-2")?"ī":p.startsWith("noun-3")?"is":p.startsWith("noun-4")?"ūs":"ī";
 const stem=cut(gen,end,"genitive");if(x.stem)assert.equal(x.stem,stem);
 if(p==="noun-5"&&!stem.endsWith("ē")&&!stem.endsWith("e"))throw Error("5th-declension stem must end in e or ē");
 const result=[];
 for(const num of numbers)for(let i=0;i<cases.length;i++){
  const cas=cases[i],ending=rule[num][i];
  // The genitive identifies short-vowel forms (rēī is not interchangeable
  // with reī); fifth-declension long ē returns in the plural and ablative.
  const endingStem=p==="noun-5"&&stem.endsWith("e")&&(num==="pl"||cas==="abl")?stem.slice(0,-1)+"ē":stem;
  let surface=ending===null?head:endingStem+ending;
  if(p==="noun-5"&&num==="sg"&&cas==="acc"&&stem.endsWith("ē"))
   surface=stem.slice(0,-1)+"e"+"m";
  if(p==="noun-3-i"&&num==="sg"&&cas==="abl"&&x.abl_i===true)
   surface=stem+"ī";
  if(num==="sg"&&cas==="voc"&&p==="noun-2-m")
   surface=head.endsWith("ius")
    ?head.slice(0,-3)+(x.adjective===true?"ie":"ī")
    :head.endsWith("us")?head.slice(0,-2)+"e":head;
  result.push(form(surface,"n."+cas+"."+num,{number:num,case:cas,pattern:p}));
  // Optional documented ablative variant for suitable nouns only; the
  // default is -e. Never change the neuter or adjective i-stem endings.
  if(p==="noun-3-i"&&num==="sg"&&cas==="abl"&&x.abl_both===true)
   result.push(form(stem+(x.abl_i===true?"e":"ī"),"n.abl.sg",{number:num,case:cas,pattern:p}));
 }
 return result;
}
function generateAdjectiveForms(x){
 const p=String(x.pattern);
 let variants;
 if(p==="adj-12"){
  const m=x.head,f=x.feminine,n=x.neuter;assert(m&&f&&n,"First/second adjective needs three nominatives");
  variants=[{head:m,genitive:x.genitive_m||m.replace(/us$/,"ī"),pattern:"noun-2-m",gender:"m",adjective:true},
   {head:f,genitive:x.genitive_f||f.replace(/a$/,"ae"),pattern:"noun-1",gender:"f"},
   {head:n,genitive:x.genitive_n||n.replace(/um$/,"ī"),pattern:"noun-2-n",gender:"n"}];
 }else if(["adj-3-one","adj-3-two","adj-3-three"].includes(p)){
  assert(x.genitive,"Third-declension adjective requires genitive");
  variants=[{head:x.head,genitive:x.genitive,pattern:"noun-3-i",gender:"m",abl_i:true},
   {head:x.feminine||x.head,genitive:x.genitive,pattern:"noun-3-i",gender:"f",abl_i:true},
   {head:x.neuter||x.head,genitive:x.genitive,pattern:"noun-3-i-n",gender:"n"}];
 }else throw Error("Unsupported adjective pattern "+p);
 return variants.flatMap(v=>generateNounForms(v).map(y=>({...y,morph:y.morph.replace(/^n\./,"adj."),gender:v.gender,pattern:p})));
}
const verbRules={
 "1":{inf:"āre",pres:["ō","ās","at","āmus","ātis","ant"],impf:["ābam","ābās","ābat","ābāmus","ābātis","ābant"],fut:["ābō","ābis","ābit","ābimus","ābitis","ābunt"],pass:["or","āris","ātur","āmur","āminī","antur"],passImpf:["ābar","ābāris","ābātur","ābāmur","ābāminī","ābantur"],passFut:["ābor","āberis","ābitur","ābimur","ābiminī","ābuntur"],ger:"and"},
 "2":{inf:"ēre",pres:["eō","ēs","et","ēmus","ētis","ent"],impf:["ēbam","ēbās","ēbat","ēbāmus","ēbātis","ēbant"],fut:["ēbō","ēbis","ēbit","ēbimus","ēbitis","ēbunt"],pass:["eor","ēris","ētur","ēmur","ēminī","entur"],passImpf:["ēbar","ēbāris","ēbātur","ēbāmur","ēbāminī","ēbantur"],passFut:["ēbor","ēberis","ēbitur","ēbimur","ēbiminī","ēbuntur"],ger:"end"},
 "3":{inf:"ere",pres:["ō","is","it","imus","itis","unt"],impf:["ēbam","ēbās","ēbat","ēbāmus","ēbātis","ēbant"],fut:["am","ēs","et","ēmus","ētis","ent"],pass:["or","eris","itur","imur","iminī","untur"],passImpf:["ēbar","ēbāris","ēbātur","ēbāmur","ēbāminī","ēbantur"],passFut:["ar","ēris","ētur","ēmur","ēminī","entur"],ger:"end"},
 "3io":{inf:"ere",pres:["iō","is","it","imus","itis","iunt"],impf:["iēbam","iēbās","iēbat","iēbāmus","iēbātis","iēbant"],fut:["iam","iēs","iet","iēmus","iētis","ient"],pass:["ior","eris","itur","imur","iminī","iuntur"],passImpf:["iēbar","iēbāris","iēbātur","iēbāmur","iēbāminī","iēbantur"],passFut:["iar","iēris","iētur","iēmur","iēminī","ientur"],ger:"iend"},
 "4":{inf:"īre",pres:["iō","īs","it","īmus","ītis","iunt"],impf:["iēbam","iēbās","iēbat","iēbāmus","iēbātis","iēbant"],fut:["iam","iēs","iet","iēmus","iētis","ient"],pass:["ior","īris","ītur","īmur","īminī","iuntur"],passImpf:["iēbar","iēbāris","iēbātur","iēbāmur","iēbāminī","iēbantur"],passFut:["iar","iēris","iētur","iēmur","iēminī","ientur"],ger:"iend"}
};
function generateVerbForms(x){
 const conj=String(x.conjugation)==="3.5"?"3io":String(x.conjugation),p=verbRules[conj];assert(p,"Unsupported regular conjugation "+conj);
 const pp=typeof x.principal_parts==="string"?x.principal_parts.split(",").map(s=>s.trim()):x.principal_parts;
 assert(Array.isArray(pp)&&pp.length>=4,"Regular verb needs 4 principal parts");
 const [pres,inf,perf,supine]=pp,base=cut(inf,p.inf,"infinitive"),out=[];
 function series(suffixes,tense,voice){suffixes.forEach((s,i)=>out.push(form(base+s,"v.ind."+tense+"."+voice+"."+persons[i],{pattern:"verb-"+conj,conjugation:conj})))}
 series(p.pres,"pres","act");series(p.impf,"impf","act");series(p.fut,"fut","act");
 series(p.pass,"pres","pass");series(p.passImpf,"impf","pass");series(p.passFut,"fut","pass");
 const ps=cut(perf,"ī","perfect");
 for(const [tense,endings] of [["perf",["ī","istī","it","imus","istis","ērunt"]],["plup",["eram","erās","erat","erāmus","erātis","erant"]],["futperf",["erō","eris","erit","erimus","eritis","erint"]]]){
  endings.forEach((s,i)=>out.push(form(ps+s,"v.ind."+tense+".act."+persons[i],{pattern:"verb-"+conj,conjugation:conj})));
 }
 out.push(form(inf,"v.inf.pres.act",{pattern:"verb-"+conj}));
 out.push(form(conj==="3"||conj==="3io"?base+"ī":inf.slice(0,-1)+"ī","v.inf.pres.pass",{pattern:"verb-"+conj}));
 out.push(form(ps+"isse","v.inf.perf.act",{pattern:"verb-"+conj}));
 const ss=cut(supine,"um","supine"),ger=base+p.ger;
 out.push(form(supine,"v.supine",{pattern:"verb-"+conj}));
 out.push(form(ss+"ūrus esse","v.inf.fut.act",{pattern:"verb-"+conj}));
 for(const [s,m] of [["ī","gen"],["ō","dat"],["um","acc"],["ō","abl"]])out.push(form(ger+s,"v.gerund."+m,{pattern:"verb-"+conj}));
 out.push(form(ger+"us","v.gerundive.nom.sg",{pattern:"verb-"+conj}));
 assert(out.some(z=>z.surface===pres),"Principal part does not match generated present");
 return out;
}
function generateForms(x){
 if(x.forms_policy==="irregular")return (x.forms||[]).map(f=>form(f.surface||f.form,f.morph,{reviewed:f.reviewed===true,pattern:"irregular"}));
 if(x.pos==="noun"||x.pos==="proper_name")return generateNounForms(x);
 if(x.pos==="adj"||x.pos==="adjective")return generateAdjectiveForms(x);
 if(x.pos==="verb")return generateVerbForms(x);
 throw Error("Cannot generate "+String(x.pos)+" without signed irregular list");
}
function checkForm(token,lexeme,approvedPatterns={}){
 const surface=String(token.t||token.surface||"").normalize("NFC"),morph=String(token.morph||"");
 const m=generateForms(lexeme).find(f=>f.surface===surface&&f.morph===morph&&(!f.gender||!token.gender||f.gender===token.gender));
 if(!m)return {ok:false,reason:"unrecognised_surface_or_morph"};
 if(m.pattern==="irregular")return m.reviewed?{ok:true,pattern:"irregular"}:{ok:false,reason:"irregular_form_not_reviewed"};
 const review=approvedPatterns[m.pattern];
 if(!review||review.reviewed!==true||!review.reviewer||!review.reviewed_at)return {ok:false,reason:"pattern_not_reviewed",pattern:m.pattern};
 return {ok:true,pattern:m.pattern};
}
module.exports={generateNounForms,generateAdjectiveForms,generateVerbForms,generateForms,checkForm,nounPattern};
