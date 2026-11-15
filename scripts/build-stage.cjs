#!/usr/bin/env node
"use strict";
/* Stages the exact installer payload as plain files, so any installer tool
 * (Inno Setup for the Windows .exe, the Linux .run and .deb builders, or a tool
 * chosen later) packs the same, already-checked folder.
 *
 *   node scripts/build-stage.cjs [--out dist/stage] [--label 20261111]
 *
 * Produces:
 *   <out>/Tablinum/                 same tree as the Setup ZIP
 *     Install Tablinum (Windows).cmd
 *     Install Tablinum (Linux Mint).sh
 *     Open without installing.html
 *     READ ME FIRST.txt
 *     program/                      the runtime, with all owner media
 *   <out>/payload.json              name, version, label and every file with size and SHA-256
 *
 * The file set comes from packaging/manifest.json through build-release.cjs and
 * build-easy-install.cjs; nothing is listed twice. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {MANIFEST}=require("./build-release.cjs");
const {setupEntries}=require("./build-easy-install.cjs");
const root=path.resolve(__dirname,"..");
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>0&&process.argv[i+1]?process.argv[i+1]:fallback};

function version(label){return require(path.join(root,"package.json")).version+"-"+label}
function stage(options={}){
 const label=options.label||arg("--label",MANIFEST.product.label);
 const out=path.resolve(root,options.out||arg("--out",MANIFEST.stage.dir));
 const top=path.join(out,MANIFEST.setupPackage.top);
 // Only ever clear a folder this script made (it holds payload.json) or an empty one.
 if(fs.existsSync(out)&&fs.readdirSync(out).length&&!fs.existsSync(path.join(out,MANIFEST.stage.payloadIndex)))
  throw Error("Refusing to clear "+out+": it is not a stage folder made by this script.");
 fs.rmSync(out,{recursive:true,force:true});
 const entries=setupEntries(label),files=[];
 for(const e of entries){
  const abs=path.join(top,...e.name.split("/"));
  fs.mkdirSync(path.dirname(abs),{recursive:true});
  fs.writeFileSync(abs,e.data);
  try{fs.chmodSync(abs,e.mode)}catch(error){/* mode bits do not exist on Windows */}
  files.push({path:e.name,bytes:e.data.length,mode:(e.mode||0o644).toString(8),sha256:crypto.createHash("sha256").update(e.data).digest("hex")});
 }
 const media=files.filter(f=>/\.mp3$/i.test(f.path)).length;
 if(media!==MANIFEST.runtime.mediaCount)throw Error("Stage needs "+MANIFEST.runtime.mediaCount+" media files; found "+media);
 const index={product:MANIFEST.product.name,id:MANIFEST.product.id,publisher:MANIFEST.product.publisher,summary:MANIFEST.product.summary,
  version:version(label),programVersion:require(path.join(root,"package.json")).version,label,
  top:MANIFEST.setupPackage.top,programDir:MANIFEST.setupPackage.programDir,entry:MANIFEST.runtime.entry,
  mediaFiles:media,fileCount:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),files};
 fs.writeFileSync(path.join(out,MANIFEST.stage.payloadIndex),JSON.stringify(index,null,1)+"\n");
 return {out,top,index};
}
if(require.main===module){
 const {out,index}=stage();
 console.log("Staged "+index.fileCount+" files ("+(index.bytes/1048576).toFixed(2)+" MB, "+index.mediaFiles+" media) in "+path.relative(root,out)||out);
}
module.exports={stage,version};
