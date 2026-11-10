"use strict";
/* LATIN-X-RCL-v1 pronunciation rules, lexicon coverage and listening sheet. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const P=require("../scripts/lib/latin-phonology.cjs");
const C=require("../scripts/lib/latin-corpus.cjs");
const B=require("../scripts/build-pronunciation.cjs");
const root=path.resolve(__dirname,"..");
const strip=s=>s.replace(/[\/.]/g,"");
const syl=w=>P.analyseWord(w).syllables.join("-").replace(/ː|̯|ʰ|ʷ/g,"");
const stressed=w=>{const a=P.analyseWord(w);return a.syllables[a.stress];};

// A&G §7: syllable division (examples from the section).
assert.equal(P.analyseWord("pater").syllables.length,2);
assert.equal(syl("mittō"),"mɪt-to");
assert.equal(syl("tollō"),"tɔl-lo");
assert.equal(syl("dīvidō"),"di-wɪ-do");
assert.equal(syl("dīxit"),"dik-sɪt","A&G §7 Note 1: dīc-sit");
assert.equal(syl("patrem"),"pa-trɛm","stop + liquid begins the syllable");

// A&G §12: stress (examples from the section).
for(const [w,s] of [["Rōma","roː"],["fidēs","fɪ"],["tangō","taŋ"],["amīcus","miː"],["monētur","neː"],
 ["contingit","tɪŋ"],["dominus","dɔ"],["alacris","a"],["dissociābilis","aː"],["deaque","a"],["itaque","ɪ"],
 ["puella","ɛl"],["fēmina","feː"],["Titus","tɪ"],["habetne","bɛt"],["dēnique","deː"]])
 assert.equal(stressed(w),s,"stress of "+w);

// A&G §§2–5, §603: consonants, diphthongs, vowel before vowel.
for(const [w,ipa] of [["cuius","ˈkʊj.jʊs"],["iam","jam"],["aqua","ˈa.kʷa"],["lingua","ˈlɪŋ.ɡʷa"],
 ["Cicerō","ˈkɪ.kɛ.roː"],["pulchra","ˈpʊl.kʰra"],["magnus","ˈmaŋ.nʊs"],["incerta","ɪŋ.ˈkɛr.ta"],
 ["caelum","ˈkae̯.lʊm"],["vīlla","ˈwiːl.la"],["fuit","ˈfʊ.ɪt"],["cui","kui̯"],["deinde","ˈdei̯n.dɛ"],
 ["Gāius","ˈɡaː.ɪ.ʊs"],["Titus","ˈtɪ.tʊs"],["quattuor","ˈkʷat.tʊ.ɔr"]])
 assert.equal(P.analyseWord(w).ipa,"/"+ipa+"/","transcription of "+w);
assert.equal(P.analyseWord("Gāius").status,"AMBIGUOUS");

// The rules reproduce the existing house transcription of Chapter I.
const house=JSON.parse(fs.readFileSync(path.join(root,"docs/audio/latin-ipa-pilot-lexicon.json"),"utf8"));
for(const s of house.sentences)assert.equal(strip(P.transcribe(s.text)),strip(s.ipa),"house IPA "+s.id);
const houseDiffs=Object.entries(house.words).filter(([w,ipa])=>strip(P.analyseWord(w).ipa)!==strip(ipa)).map(([w])=>w);
assert.deepEqual(houseDiffs,["Gāius"],"only Gāius differs from the house draft (EXCEPTIONS.json explains why)");

// Interface strings listed in the corpus are really in the app.
for(const [file,strings] of C.UI_LATIN){
 const text=fs.readFileSync(path.join(root,file),"utf8");
 for(const s of strings)assert(text.includes(s),"UI string not found in "+file+": "+s);
}

// Lexicon and listening sheet are current, complete and honest.
const {execFileSync}=require("node:child_process");
execFileSync(process.execPath,[path.join(root,"scripts/build-pronunciation.cjs"),"--check"],{stdio:"pipe"});
const rows=B.lexiconRows();
const words=C.words();
assert.equal(rows.length,words.size);
for(const w of words.keys())assert(rows.some(r=>r.form===w),"lexicon misses "+w);
for(const r of rows){
 assert(["VERIFIED","SUPPORTED","AMBIGUOUS","UNKNOWN"].includes(r.status),r.form);
 if(r.status==="AMBIGUOUS")assert(r.note,"AMBIGUOUS without a note: "+r.form);
 if(r.conflicts)assert.equal(r.status,"AMBIGUOUS","conflict not surfaced: "+r.form);
 assert.equal(r.stress_depends_on_unchecked_vowel,"","stress depends on an unchecked vowel: "+r.form);
}
const titus=rows.find(r=>r.form==="Titus");
assert.equal(titus.status,"VERIFIED");assert.equal(titus.ipa,"/ˈtɪ.tʊs/");
const notes=JSON.parse(fs.readFileSync(path.join(root,"pronunciation/QUANTITY_NOTES.json"),"utf8")).entries;
for(const n of notes)for(const f of n.forms)assert(words.has(f),"note for a word not in the course: "+f);

require(path.join(root,"content/narration.js"));
const n=globalThis.TablinumNarrationCatalogue;
const clips=[...n.sentences.flatMap(s=>s.takes.map(t=>t.clip_id)),...n.words.map(w=>w.clip_id)];
const sheet=fs.readFileSync(path.join(root,"pronunciation/LISTENING_SHEET.csv"),"utf8").trim().split("\n");
assert.equal(sheet.length-1,clips.length);
assert.deepEqual(sheet.slice(1).map(l=>l.split(",")[0]),clips);

console.log("PASS LATIN-X-RCL-v1: "+rows.length+" forms, "+clips.length+" listening rows, rules match A&G §§7, 12, 603 examples and the Chapter I house IPA.");
