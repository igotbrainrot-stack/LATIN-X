#!/usr/bin/env node
"use strict";
/* Builds the single-file Linux installers from the same payload as the Setup ZIP.
 *
 *   node scripts/build-linux-installers.cjs [--out dist] [--label 20261111] [--only run|deb]
 *
 *   Tablinum-Setup-<label>.run   per-user, no password. A shell header followed by a
 *                                tar.gz of the Setup folder; it runs the existing
 *                                "Install Tablinum (Linux Mint).sh", so it installs to
 *                                ~/.local/share/tablinum exactly as the ZIP does.
 *   tablinum_<version>_all.deb   system-wide, for all users (needs an administrator
 *                                password). Installs to /opt/tablinum with a menu
 *                                entry. Built only where dpkg-deb is available.
 *
 * Names, paths and the file set come from packaging/manifest.json. */
const fs=require("node:fs"),path=require("node:path"),os=require("node:os"),crypto=require("node:crypto");
const {execFileSync,spawnSync}=require("node:child_process");
const {MANIFEST,runtimeFiles,tarGz}=require("./build-release.cjs");
const {setupEntries}=require("./build-easy-install.cjs");
const {version}=require("./build-stage.cjs");
const root=path.resolve(__dirname,"..");
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>0&&process.argv[i+1]?process.argv[i+1]:fallback};
const report=(file,buf)=>console.log(path.basename(file).padEnd(40)+(buf.length/1048576).toFixed(2)+" MB  sha256 "+crypto.createHash("sha256").update(buf).digest("hex"));
const fill=(text,values)=>text.replace(/@([A-Z0-9_]+)@/g,(m,k)=>{if(!(k in values))throw Error("Unknown placeholder "+m);return String(values[k])});

function buildRun(label,out){
 const archive=tarGz(setupEntries(label));
 const template=fs.readFileSync(path.join(root,MANIFEST.linux.runHeader),"utf8").replace(/\r\n/g,"\n");
 if(!template.endsWith("\n"))throw Error("run-header.sh must end with a newline");
 const header=fill(template,{SHA256:crypto.createHash("sha256").update(archive).digest("hex"),
  PAYLOAD_LINE:template.split("\n").length,TOP:MANIFEST.setupPackage.top,LINUX_INSTALLER:MANIFEST.setupPackage.linuxInstaller});
 if(header.split("\n").length!==template.split("\n").length)throw Error("Placeholders must not add lines to the header");
 const buf=Buffer.concat([Buffer.from(header,"utf8"),archive]);
 const file=path.join(out,MANIFEST.linux.runName.replace("{label}",label));
 fs.writeFileSync(file,buf);fs.chmodSync(file,0o755);report(file,buf);
 return file;
}

function hasDpkgDeb(){return spawnSync("dpkg-deb",["--version"],{stdio:"ignore"}).status===0}
function buildDeb(label,out){
 const deb=MANIFEST.linux.deb;
 if(!hasDpkgDeb()){console.log("dpkg-deb is not available here: skipping the .deb (build it on Debian, Ubuntu or Linux Mint).");return null}
 const tree=fs.mkdtempSync(path.join(os.tmpdir(),"tablinum-deb-"));
 try{
  const put=(rel,data,mode=0o644)=>{const abs=path.join(tree,...rel.split("/"));fs.mkdirSync(path.dirname(abs),{recursive:true,mode:0o755});fs.writeFileSync(abs,data);fs.chmodSync(abs,mode)};
  const read=f=>fs.readFileSync(path.join(root,f));
  const tpl=f=>fs.readFileSync(path.join(root,deb.template,f),"utf8").replace(/\r\n/g,"\n");
  const install=deb.installDir.replace(/^\//,"");
  let bytes=0;
  for(const f of runtimeFiles()){const data=read(f);bytes+=data.length;put(install+"/"+f,data)}
  const values={PACKAGE:deb.package,VERSION:version(label),SECTION:deb.section,ARCH:deb.architecture,DEPENDS:deb.depends,
   MAINTAINER:deb.maintainer,SUMMARY:MANIFEST.product.summary,INSTALLED_KB:Math.ceil(bytes/1024),INSTALL_DIR:deb.installDir,ENTRY:MANIFEST.runtime.entry};
  put("usr/bin/"+deb.package,fill(tpl("tablinum.sh.in"),values),0o755);
  put("usr/share/applications/"+deb.package+".desktop",fill(tpl("tablinum.desktop.in"),values));
  put("usr/share/icons/hicolor/256x256/apps/"+deb.package+".png",read(MANIFEST.icons.png256));
  put("usr/share/icons/hicolor/48x48/apps/"+deb.package+".png",read(MANIFEST.icons.png48));
  put("usr/share/icons/hicolor/scalable/apps/"+deb.package+".svg",read(MANIFEST.icons.svg));
  put("usr/share/doc/"+deb.package+"/copyright",read("ATTRIBUTION.md"));
  put("DEBIAN/control",fill(tpl("control.in"),values));
  // Directories must be 0755 whatever the builder's umask is.
  (function fix(dir){fs.chmodSync(dir,0o755);for(const d of fs.readdirSync(dir,{withFileTypes:true}))if(d.isDirectory())fix(path.join(dir,d.name))})(tree);
  const file=path.join(out,deb.debName.replace("{version}",version(label)));
  execFileSync("dpkg-deb",["--root-owner-group","-Zgzip","--build",tree,file],{stdio:["ignore","ignore","inherit"]});
  report(file,fs.readFileSync(file));
  return file;
 }finally{fs.rmSync(tree,{recursive:true,force:true})}
}

function build(options={}){
 const label=options.label||arg("--label",MANIFEST.product.label);
 const out=path.resolve(root,options.out||arg("--out","dist"));
 const only=options.only||arg("--only","");
 fs.mkdirSync(out,{recursive:true});
 return {run:only==="deb"?null:buildRun(label,out),deb:only==="run"?null:buildDeb(label,out)};
}
if(require.main===module)build();
module.exports={build,buildRun,buildDeb,hasDpkgDeb};
