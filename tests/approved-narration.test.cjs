"use strict";
/* Canonical source, owner review, byte integrity and click-to-play narration locks.
 * Private audio files are expected in a proper release build, never in public Git. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(read("content/narration.js"),sandbox,{filename:"content/narration.js"});
const catalogue=JSON.parse(JSON.stringify(sandbox.TablinumNarrationCatalogue));
assert.equal(catalogue.voice,"Arjun");
assert.equal(catalogue.base_path,"audio/narration/arjun/");
assert.equal(catalogue.sentences.length,67);
assert.equal(catalogue.words.length,8);
const expected=JSON.parse(read("docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json"));
assert.equal(expected.files.length,78);
const ids=new Set(),names=new Set();
for(const [i,entry] of catalogue.sentences.entries()){
 assert(!ids.has(entry.sentence_id),"No duplicate sentence IDs");ids.add(entry.sentence_id);
 assert(entry.sentence_id.startsWith("legacy-ch"));
 const ch=Number(entry.sentence_id.slice(9,11));
 assert(ch>=1&&ch<=8);
 const from=JSON.parse(read("lessons/legacy/ch"+String(ch).padStart(2,"0")+".json"));
 const number=Number(entry.sentence_id.slice(-3))-1;
 assert.equal(entry.canonical_text,from.legacy_source.sent[number][0],"Canonical sentence text unchanged");
 assert.equal(entry.takes.length,1);
 const take=entry.takes[0];
 assert.equal(take.voice,"Arjun");
 assert.equal(take.owner_listening,ch===1?"pass":"pending","Never approve unheard sentences");
 assert(take.file.endsWith(".mp3"));names.add(catalogue.base_path+take.file);
}
for(const word of catalogue.words){
 assert(word.canonical_text&&word.file);
 if(word.canonical_text==="laeta"){
  assert.equal(word.voice,"Miriam","Missing Arjun laeta word uses explicit Miriam fallback");
  assert.equal(word.owner_listening,"fallback");
 }else{assert.equal(word.voice,"Arjun");assert.equal(word.owner_listening,"pass")}
 names.add(catalogue.base_path+word.file);
}
assert.equal(names.size,75);
for(const file of expected.files){
 assert(file.sha256.match(/^[0-9a-f]{64}$/)&&file.bytes>1000);
 assert(file.path.startsWith("assets/audio/roman/")||names.has(file.path),"Unexpected release audio path: "+file.path);
 const full=path.join(root,file.path);
 assert(fs.existsSync(full),"Release missing verified file: "+file.path);
 const bytes=fs.readFileSync(full);
 assert.equal(bytes.length,file.bytes,file.path+" file size");
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),file.sha256,file.path+" SHA256");
 assert(bytes.subarray(0,3).toString("latin1")==="ID3"||(bytes[0]===255&&(bytes[1]&224)===224),file.path+" valid MP3");
}
const runtime=read("app/legacy-runtime.js");
assert(runtime.includes('const approved=installed&&take.owner_listening==="pass"'));
assert(runtime.includes('const pending=installed&&take.owner_listening==="pending"'));
assert(runtime.includes('New take awaiting owner listening review'),'Dock note names pending takes');
assert(read('app/62-narration.js').includes(' — new recording, awaiting your review'),'Pending takes get their own label');
assert(runtime.includes('if(activate){if(mode()==="voice")speak()'));
assert(runtime.includes('onend:()=>{if(id!==speechRequest)return;narrationTake=null;readingIndex=null;'));
assert(!runtime.includes("Clip end advances to sentence 2"));
const html=read("index.html");
assert(html.includes('src="app/welcome/welcome.js"'));
assert(html.includes('src="app/62-narration.js"'));
assert(!read("content/narration.js").includes(["_","jwt","="].join(""))&&!read("content/narration.js").includes(["cloudfront","net"].join(".")),"No private signed media URL");
const played=[],ended=[];
class AudioMock{
 constructor(){this.handlers={};this.paused=true;played.push(this)}
 addEventListener(n,cb){(this.handlers[n]||=[]).push(cb)}
 play(){this.paused=false;return Promise.resolve()}
 pause(){this.paused=true}
 removeAttribute(){this.src=""}
 load(){}
 emit(n){for(const cb of this.handlers[n]||[])cb()}
}
const sb={Audio:AudioMock,CustomEvent:class{constructor(name,obj){this.type=name;this.detail=obj.detail}},document:{dispatchEvent:event=>ended.push(event)},Promise};
sb.globalThis=sb;
vm.runInNewContext(read("content/narration.js"),sb);
vm.runInNewContext(read("app/62-narration.js"),sb);
const N=sb.TablinumNarration;
assert.equal(N.take("legacy-ch01-s001","not the real text"),null,"Never narrate mismatched lesson text");
let endedCount=0;
assert.equal(N.play("legacy-ch01-s001","Hic est hortus.",{onend:()=>endedCount++}),true);
const clip=played.at(-1);
assert.equal(clip.src,"audio/narration/arjun/s001-arjun.mp3");
clip.emit("ended");clip.emit("ended");
assert.equal(endedCount,1,"One completion event, no automatic next play");
assert.equal(played.length,1,"No automatic next sentence");
assert.equal(ended.length,1);
assert.equal(N.take("legacy-ch02-s001","Haec est vīlla familiae.").owner_listening,"pending");
assert.equal(N.wordTake("laeta").voice,"Miriam");
assert.equal(N.wordTake("villa").voice,"Arjun");
console.log("PASS Arjun: 67 canonical sentence recordings, 8 words, honest review labels, 78 verified files, click-only playback.");
