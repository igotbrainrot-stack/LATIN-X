"use strict";
/* Install owner-approved Miriam MP3s into audio/narration/miriam/ (owner-private, ignored by Git).
 *   node scripts/install-narration.cjs <folder with downloaded mp3s>   copy + verify
 *   node scripts/install-narration.cjs --check                         verify what is installed
 * Verifies non-zero size and a real MP3 header (ID3 tag or MPEG frame sync) and prints SHA-256.
 * Accepts the downloader names too (e.g. quoque-v4-approved.mp3, voiceA__test-villa__v2.mp3).
 * Never downloads, never generates, never invents checksums, never overwrites an installed clip. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const ctx={};vm.runInNewContext(fs.readFileSync(path.join(root,"content/narration.js"),"utf8"),ctx);
const cat=ctx.TablinumNarrationCatalogue,dest=path.join(root,cat.base_path);
const expected=[...cat.sentences.flatMap(s=>s.takes.map(t=>({...t,sentence_id:s.sentence_id,canonical_text:s.canonical_text}))),
 ...cat.words.map(w=>({...w,sentence_id:null}))];
function inspect(file){
 const buf=fs.readFileSync(file);
 if(buf.length<128)return {ok:false,why:"file is empty or too small ("+buf.length+" bytes)"};
 const id3=buf.slice(0,3).toString("latin1")==="ID3",sync=buf[0]===0xff&&(buf[1]&0xe0)===0xe0;
 if(!id3&&!sync)return {ok:false,why:"not an MP3 (no ID3 tag or MPEG frame sync)"};
 return {ok:true,bytes:buf.length,sha256:crypto.createHash("sha256").update(buf).digest("hex")};
}
const args=process.argv.slice(2),check=args.includes("--check"),source=args.find(a=>!a.startsWith("--"));
// Never overwrite an installed clip: an approved file already in place wins.
if(!check&&!source){console.error("Usage: node scripts/install-narration.cjs <folder-with-mp3s> | --check");process.exit(2)}
if(source&&!fs.existsSync(source)){console.error("Folder not found: "+source);process.exit(2)}
fs.mkdirSync(dest,{recursive:true});
const record={schema:"latin-x-narration-local-install-v1",checked_at:new Date().toISOString(),voice:cat.voice,review_status:cat.review_status,clips:[]};
let bad=0,installed=0;
for(const clip of expected){
 const target=path.join(dest,clip.file);
 if(source){
  const names=[clip.file,...(clip.also_named||[])];
  const from=names.map(n=>path.join(source,n)).find(f=>fs.existsSync(f));
  if(from&&!fs.existsSync(target)){
   const r=inspect(from);
   if(!r.ok){console.log("REJECTED "+clip.file+": "+r.why+" (not copied)");bad++;continue}
   fs.copyFileSync(from,target);
  }
 }
 if(!fs.existsSync(target)){console.log("MISSING  "+clip.file+"  ("+(clip.sentence_id?clip.sentence_id+") — reader uses browser voice":"word recording, plays from word lookup)"));record.clips.push({clip_id:clip.clip_id,file:clip.file,installed:false});continue}
 const r=inspect(target);
 if(!r.ok){console.log("INVALID  "+clip.file+": "+r.why);bad++;record.clips.push({clip_id:clip.clip_id,file:clip.file,installed:false,problem:r.why});continue}
 installed++;
 console.log("OK       "+clip.file+"  "+r.bytes+" bytes  sha256 "+r.sha256);
 record.clips.push({clip_id:clip.clip_id,file:clip.file,sentence_id:clip.sentence_id,runway_task_id:clip.runway_task_id,installed:true,bytes:r.bytes,sha256:r.sha256});
}
if(installed&&!check)fs.writeFileSync(path.join(dest,"LOCAL_INSTALL_RECORD.json"),JSON.stringify(record,null,2)+"\n");
console.log(installed+" of "+expected.length+" approved clips installed"+(bad?", "+bad+" rejected/invalid":"")+".");
if(bad)process.exit(1);
