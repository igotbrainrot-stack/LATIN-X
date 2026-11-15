#!/usr/bin/env node
"use strict";
/* Builds the single-file Windows installer with Inno Setup 6.
 *
 *   node scripts/build-windows-exe.cjs [--out dist] [--label 20261111] [--require]
 *
 * Stages the payload (scripts/build-stage.cjs), then runs ISCC.exe on
 * packaging/windows/tablinum-setup.iss with the names and version from
 * packaging/manifest.json. The .exe carries the staged program folder and runs the
 * existing install-windows.ps1, so it installs exactly as the Setup ZIP does.
 *
 * Inno Setup is a Windows program. Where ISCC.exe is not found this prints how to
 * get it and exits 0, or exits 1 with --require (used in CI). Set the ISCC
 * environment variable to point at ISCC.exe if it is somewhere unusual. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {spawnSync}=require("node:child_process");
const {MANIFEST}=require("./build-release.cjs");
const {stage,version}=require("./build-stage.cjs");
const root=path.resolve(__dirname,"..");
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>0&&process.argv[i+1]?process.argv[i+1]:fallback};

function findIscc(){
 const candidates=[process.env.ISCC,
  ...["ProgramFiles(x86)","ProgramFiles","LOCALAPPDATA"].map(k=>process.env[k]).filter(Boolean)
   .flatMap(base=>[path.join(base,"Inno Setup 6","ISCC.exe"),path.join(base,"Programs","Inno Setup 6","ISCC.exe")])].filter(Boolean);
 for(const c of candidates)if(fs.existsSync(c))return c;
 for(const name of ["ISCC.exe","iscc"])if(spawnSync(name,["/?"],{stdio:"ignore"}).error===undefined)return name;
 return null;
}
function defines(label,out,stageTop){
 return {AppName:MANIFEST.product.name,AppPublisher:MANIFEST.product.publisher,AppVersion:version(label),
  ProgramVersion:require(path.join(root,"package.json")).version,RepoRoot:root,StageDir:stageTop,OutputDir:out,
  OutputName:MANIFEST.windows.exeName.replace("{label}",label).replace(/\.exe$/i,""),IconFile:path.join(root,...MANIFEST.icons.ico.split("/"))};
}
function build(options={}){
 const label=options.label||arg("--label",MANIFEST.product.label);
 const out=path.resolve(root,options.out||arg("--out","dist"));
 const required=options.require||process.argv.includes("--require");
 const iscc=findIscc();
 if(!iscc){
  const message="Inno Setup 6 (ISCC.exe) was not found, so the Windows .exe was not built. Install it on Windows from https://jrsoftware.org/isdl.php (or: winget install JRSoftware.InnoSetup), then run this again.";
  if(required)throw Error(message);
  console.log(message);return null;
 }
 fs.mkdirSync(out,{recursive:true});
 const staged=stage({label});
 const d=defines(label,out,staged.top);
 const args=Object.keys(d).map(k=>"/D"+k+"="+d[k]).concat(["/Q",path.join(root,...MANIFEST.windows.exeScript.split("/"))]);
 const run=spawnSync(iscc,args,{stdio:"inherit"});
 if(run.status!==0)throw Error("ISCC failed with code "+run.status);
 const file=path.join(out,d.OutputName+".exe"),buf=fs.readFileSync(file);
 console.log(path.basename(file).padEnd(40)+(buf.length/1048576).toFixed(2)+" MB  sha256 "+crypto.createHash("sha256").update(buf).digest("hex"));
 return file;
}
if(require.main===module){try{build()}catch(error){console.error(error.message);process.exit(1)}}
module.exports={build,defines,findIscc};
