#!/usr/bin/env node
"use strict";
/* Builds the one-click Setup package for Windows and Linux Mint.
 *
 *   node scripts/build-easy-install.cjs [--out dist] [--label 20261111]
 *
 * Produces <out>/Tablinum-Setup-<label>.zip, which unpacks to:
 *   Tablinum/
 *     Install Tablinum (Windows).cmd      double-click on Windows (CRLF)
 *     Install Tablinum (Linux Mint).sh    double-click on Linux Mint (LF, 0755)
 *     Open without installing.html        runs the program straight from the folder
 *     READ ME FIRST.txt
 *     program/                            the full runtime with all 78 owner media files
 *       install/install-windows.ps1
 *       install/package.json
 *
 * Nothing is downloaded at install time: the browser that is already on the
 * computer runs Tablinum, and every recording ships inside program/. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {runtimeFiles,zip}=require("./build-release.cjs");

const root=path.resolve(__dirname,"..");
const src=path.join(root,"packaging","easy-install");
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>0&&process.argv[i+1]?process.argv[i+1]:fallback};
const crlf=b=>Buffer.from(b.toString("utf8").replace(/\r?\n/g,"\r\n"));
const lf=b=>Buffer.from(b.toString("utf8").replace(/\r\n/g,"\n"));
const read=f=>fs.readFileSync(path.join(src,f));

function setupEntries(label){
 const version=require(path.join(root,"package.json")).version+"-"+label;
 const media=runtimeFiles().filter(f=>f.toLowerCase().endsWith(".mp3"));
 if(media.length!==78)throw Error("Setup needs all 78 owner media files; found "+media.length+". Run the narration installer first.");
 return [
  {name:"Install Tablinum (Windows).cmd",data:crlf(read("Install Tablinum (Windows).cmd")),mode:0o644},
  {name:"Install Tablinum (Linux Mint).sh",data:lf(read("Install Tablinum (Linux Mint).sh")),mode:0o755},
  {name:"Open without installing.html",data:read("Open without installing.html"),mode:0o644},
  {name:"READ ME FIRST.txt",data:crlf(read("READ ME FIRST.txt")),mode:0o644},
  ...runtimeFiles().map(f=>({name:"program/"+f,data:fs.readFileSync(path.join(root,f)),mode:0o644})),
  // UTF-8 with BOM so Windows PowerShell 5.1 reads any non-ASCII text correctly.
  {name:"program/install/install-windows.ps1",data:Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),crlf(read("install-windows.ps1"))]),mode:0o644},
  {name:"program/install/package.json",data:Buffer.from(JSON.stringify({name:"Tablinum",version},null,1)+"\n"),mode:0o644}
 ];
}

function build(options={}){
 const label=options.label||arg("--label","20261111");
 const out=path.resolve(root,options.out||arg("--out","dist"));
 fs.mkdirSync(out,{recursive:true});
 const buf=zip(setupEntries(label));
 const file=path.join(out,"Tablinum-Setup-"+label+".zip");
 fs.writeFileSync(file,buf);
 console.log(path.basename(file).padEnd(40)+(buf.length/1048576).toFixed(2)+" MB  sha256 "+crypto.createHash("sha256").update(buf).digest("hex"));
 return file;
}
if(require.main===module)build();
module.exports={build,setupEntries};
