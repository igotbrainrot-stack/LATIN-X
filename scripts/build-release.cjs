#!/usr/bin/env node
"use strict";
/* Builds the learner release packages from this source tree. No dependencies:
 * Node 22+ only (uses zlib.crc32), so it runs the same on Windows 11 and Linux.
 *
 *   node scripts/build-release.cjs [--out dist] [--label 0.4.2-polish.20261108]
 *
 * Produces in --out:
 *   Tablinum-<label>-windows.zip   reader + Windows launchers (CRLF .cmd)
 *   Tablinum-<label>-linux.tar.gz  reader + Linux menu-entry installer (0755 scripts)
 *   Tablinum-<label>-source.zip    the clean source tree (git-tracked files, plus the
 *                                  local approved narration MP3s, which Git ignores)
 *   SHA256SUMS.txt
 *
 * Learner packages contain only runtime files (see RUNTIME below). Historical
 * handovers, audition tools, tests and build scripts stay in the source package.
 * Every package unpacks into a single top-level "Tablinum" folder. */
const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib"),crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");

const root=path.resolve(__dirname,"..");
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>0&&process.argv[i+1]?process.argv[i+1]:fallback};
const TOP="Tablinum";

/* Runtime set: pages, their scripts/styles/assets and every file a page links to. */
const RUNTIME={
 files:["index.html","Picture Practice.html","Art Review.html","ATTRIBUTION.md","curriculum/music.json"],
 dirs:["app","content","vendor","assets","audio/narration"],
 // generated or private material that must never ship
 exclude:[/(^|\/)PRIVATE_/i,/LOCAL_INSTALL_RECORD\.json$/,/(^|\/)\.DS_Store$/,/(^|\/)Thumbs\.db$/]
};
const PLATFORM={
 windows:[
  ["launchers/Tablinum.html","Tablinum.html"],
  ["Start Tablinum.cmd","Start Tablinum.cmd"],
  ["Start Picture Practice.cmd","Start Picture Practice.cmd"],
  ["Install Approved Narration.cmd","Install Approved Narration.cmd"],
  ["scripts/install-narration.cjs","scripts/install-narration.cjs"],
  ["launchers/README-windows.txt","README.txt"]
 ],
 linux:[
  ["launchers/Tablinum.html","Tablinum.html"],
  ["launchers/linux/install-launcher.sh","linux/install-launcher.sh"],
  ["launchers/linux/uninstall-launcher.sh","linux/uninstall-launcher.sh"],
  ["launchers/README-linux.txt","README.txt"]
 ]
};

const posix=p=>p.split(path.sep).join("/");
function walk(rel){
 const abs=path.join(root,rel);
 if(!fs.existsSync(abs))throw Error("Missing runtime path: "+rel);
 if(fs.statSync(abs).isFile())return [rel];
 return fs.readdirSync(abs,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))
  .flatMap(d=>walk(posix(path.join(rel,d.name))));
}
function runtimeFiles(){
 const list=[...RUNTIME.files,...RUNTIME.dirs.flatMap(walk)].filter(f=>!RUNTIME.exclude.some(r=>r.test(f)));
 return [...new Set(list)];
}
function textFor(src,dest,platform){
 let buf=fs.readFileSync(path.join(root,src));
 if(/\.(cmd|bat)$/i.test(dest))buf=Buffer.from(buf.toString("utf8").replace(/\r?\n/g,"\r\n"));
 else if(platform==="linux"&&/\.sh$/.test(dest))buf=Buffer.from(buf.toString("utf8").replace(/\r\n/g,"\n"));
 else if(platform==="windows"&&/README\.txt$/.test(dest))buf=Buffer.from(buf.toString("utf8").replace(/\r?\n/g,"\r\n"));
 return buf;
}
function entriesFor(platform){
 const entries=runtimeFiles().map(f=>({name:f,data:fs.readFileSync(path.join(root,f)),mode:0o644}));
 for(const [src,dest] of PLATFORM[platform]){
  entries.push({name:dest,data:textFor(src,dest,platform),mode:/\.sh$/.test(dest)?0o755:0o644});
 }
 return entries;
}
function sourceEntries(){
 let tracked;
 try{tracked=execFileSync("git",["ls-files","-z"],{cwd:root}).toString("utf8").split("\0").filter(Boolean)}
 catch(e){throw Error("The source package is built from Git-tracked files; run inside the repository.")}
 // Git-ignored but part of the program or of the owner's audit trail (the tests verify them):
 // approved narration, the original audition MP3s and the owner's own review record.
 // PRIVATE_* signed-link files are never packaged (see RUNTIME.exclude).
 const optional=p=>fs.existsSync(path.join(root,p))?walk(p):[];
 const audio=[...optional("audio/narration"),...optional("assets/audio/roman"),...optional("audio-audition")].filter(f=>/\.mp3$/i.test(f))
  .concat(fs.existsSync(path.join(root,"docs/audio/owner-original-review-2026-11-07.json"))?["docs/audio/owner-original-review-2026-11-07.json"]:[]);
 const names=[...new Set([...tracked,...audio])].filter(f=>fs.existsSync(path.join(root,f))&&!RUNTIME.exclude.some(r=>r.test(f))).sort();
 return names.map(f=>{const abs=path.join(root,f);return {name:f,data:fs.readFileSync(abs),mode:(fs.statSync(abs).mode&0o111)?0o755:0o644}});
}

/* ---- minimal ZIP writer (deflate, UTF-8 names, unix modes) ---- */
const DOS_TIME=(()=>{const d=new Date(2026,10,8,12,0,0);return {time:(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date:((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()}})();
function zip(entries){
 const locals=[],centrals=[];let offset=0;
 for(const e of entries){
  const name=Buffer.from(TOP+"/"+e.name,"utf8");
  const raw=e.data,crc=zlib.crc32(raw);
  const deflated=zlib.deflateRawSync(raw,{level:9});
  const stored=deflated.length>=raw.length;const body=stored?raw:deflated;
  const local=Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x0800,6);
  local.writeUInt16LE(stored?0:8,8);local.writeUInt16LE(DOS_TIME.time,10);local.writeUInt16LE(DOS_TIME.date,12);
  local.writeUInt32LE(crc,14);local.writeUInt32LE(body.length,18);local.writeUInt32LE(raw.length,22);
  local.writeUInt16LE(name.length,26);local.writeUInt16LE(0,28);
  locals.push(local,name,body);
  const central=Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE((3<<8)|20,4);central.writeUInt16LE(20,6);
  central.writeUInt16LE(0x0800,8);central.writeUInt16LE(stored?0:8,10);central.writeUInt16LE(DOS_TIME.time,12);
  central.writeUInt16LE(DOS_TIME.date,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(body.length,20);
  central.writeUInt32LE(raw.length,24);central.writeUInt16LE(name.length,28);
  central.writeUInt32LE(((0o100000|e.mode)<<16)>>>0,38);central.writeUInt32LE(offset,42);
  centrals.push(central,name);
  offset+=30+name.length+body.length;
 }
 const cd=Buffer.concat(centrals),end=Buffer.alloc(22);
 end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);
 end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...locals,cd,end]);
}
/* ---- minimal ustar/pax tar.gz writer (keeps 0755 on scripts) ---- */
function tarHeader(name,size,mode,type="0"){
 const h=Buffer.alloc(512);
 const put=(s,o,l)=>Buffer.from(s,"utf8").copy(h,o,0,l);
 const oct=(n,l)=>n.toString(8).padStart(l-1,"0")+"\0";
 put(name,0,100);put(oct(mode,8),100,8);put(oct(0,8),108,8);put(oct(0,8),116,8);
 put(oct(size,12),124,12);put(oct(Math.floor(Date.UTC(2026,10,8,1)/1000),12),136,12);
 h.fill(" ",148,156);put(type,156,1);put("ustar\0",257,6);put("00",263,2);
 let sum=0;for(const b of h)sum+=b;put(sum.toString(8).padStart(6,"0")+"\0 ",148,8);
 return h;
}
const pad=n=>Buffer.alloc((512-(n%512))%512);
function tarGz(entries){
 const parts=[];
 for(const e of entries){
  const name=TOP+"/"+e.name;
  if(Buffer.byteLength(name)>99){ // PAX header carries long or non-ASCII-safe paths
   const rec=s=>{let l=s.length+3;let str;do{str=l+" "+s+"\n";l=Buffer.byteLength(str)}while(Buffer.byteLength(str)!==l);return str};
   const pax=Buffer.from(rec("path="+name),"utf8");
   parts.push(tarHeader("PaxHeader",pax.length,0o644,"x"),pax,pad(pax.length));
  }
  parts.push(tarHeader(name.slice(0,99),e.data.length,e.mode),e.data,pad(e.data.length));
 }
 parts.push(Buffer.alloc(1024));
 return zlib.gzipSync(Buffer.concat(parts),{level:9});
}

function verifyOwnerMedia(){
 const manifest=path.join(root,"docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json");
 if(!fs.existsSync(manifest))throw Error("Missing offline owner-media checksum manifest");
 const files=JSON.parse(fs.readFileSync(manifest,"utf8")).files;
 if(!Array.isArray(files)||files.length!==78)throw Error("Expected exactly 75 narration and 3 music files");
 for(const entry of files){
  if(!/^(audio\\/narration\\/arjun|assets\\/audio\\/roman)\\/[a-z0-9-]+\\.mp3$/.test(entry.path))throw Error("Bad audio path: "+entry.path);
  const p=path.join(root,entry.path);
  if(!fs.existsSync(p))throw Error("Missing offline recording: "+entry.path);
  const data=fs.readFileSync(p);
  if(data.length!==entry.bytes||crypto.createHash("sha256").update(data).digest("hex")!==entry.sha256)throw Error("Audio checksum failure: "+entry.path);
 }
}
function build(options={}){
 verifyOwnerMedia();
 const LABEL=options.label||arg("--label","0.4.2-arjun-offline.20261110");
 const OUT=path.resolve(root,options.out||arg("--out","dist"));
 fs.mkdirSync(OUT,{recursive:true});
 const outputs=[
  ["Tablinum-"+LABEL+"-windows.zip",zip(entriesFor("windows"))],
  ["Tablinum-"+LABEL+"-linux.tar.gz",tarGz(entriesFor("linux"))],
  ["Tablinum-"+LABEL+"-source.zip",zip(sourceEntries())]
 ];
 const sums=[];
 for(const [name,buf] of outputs){
  fs.writeFileSync(path.join(OUT,name),buf);
  sums.push(crypto.createHash("sha256").update(buf).digest("hex")+"  "+name);
  console.log(name.padEnd(48)+(buf.length/1048576).toFixed(2)+" MB");
 }
 fs.writeFileSync(path.join(OUT,"SHA256SUMS.txt"),sums.join("\n")+"\n");
 return outputs.map(([name])=>path.join(OUT,name));
}
if(require.main===module)build();
module.exports={build,runtimeFiles,entriesFor,sourceEntries,zip,tarGz,TOP,RUNTIME};
