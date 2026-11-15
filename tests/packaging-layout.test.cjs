"use strict";
/* Checks that every installer is built from one description of the product.
 *
 * packaging/manifest.json names what ships and where it goes. This test checks that
 * the builders read it, that the staged folder is the Setup ZIP tree byte for byte,
 * that the Windows .exe definition and the Linux templates point at files and values
 * that exist, and that the single-file Linux installer unpacks to the same tree.
 * The installs themselves run in .github/workflows/installers.yml. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),os=require("node:os"),crypto=require("node:crypto");
const {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");
const M=JSON.parse(fs.readFileSync(path.join(root,"packaging/manifest.json"),"utf8"));
const release=require("../scripts/build-release.cjs");
const {setupEntries}=require("../scripts/build-easy-install.cjs");
const {stage,version}=require("../scripts/build-stage.cjs");
const linux=require("../scripts/build-linux-installers.cjs");
const winexe=require("../scripts/build-windows-exe.cjs");
const pkg=require("../package.json");
const exists=rel=>fs.existsSync(path.join(root,...rel.split("/")));
const text=rel=>fs.readFileSync(path.join(root,...rel.split("/")),"utf8");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"tablinum-layout-"));

try{
 // 1. The manifest is what the builders use, and everything it names exists.
 assert.deepEqual(release.MANIFEST,M,"build-release.cjs exports the manifest it read");
 assert.deepEqual(release.RUNTIME.files,M.runtime.files);
 assert.deepEqual(release.RUNTIME.dirs,M.runtime.dirs);
 assert.equal(release.TOP,M.setupPackage.top);
 assert.equal(M.runtime.exclude.length,M.runtime.excludeFlags.length,"one flag string per exclude pattern");
 for(const f of [...M.runtime.files,...M.runtime.dirs,M.runtime.mediaManifest,...Object.values(M.icons),M.setupPackage.source,
  M.windows.exeScript,M.linux.runHeader,M.linux.deb.template])assert.ok(exists(f),f+" exists");
 for(const k of ["windowsInstaller","windowsScript","linuxInstaller","portablePage","readme"])
  assert.ok(exists(M.setupPackage.source+"/"+M.setupPackage[k]),"setup package source has "+M.setupPackage[k]);
 assert.equal(M.windows.requiresAdmin,false,"the Windows install stays per user");
 for(const src of ["scripts/build-easy-install.cjs","scripts/build-stage.cjs","scripts/build-linux-installers.cjs","scripts/build-windows-exe.cjs"]){
  const s=text(src);
  assert.match(s,/MANIFEST/,src+" reads the manifest");
  assert.ok(!/["']20261111["']/.test(s),src+" does not hard-code the release label");
 }
 const files=release.runtimeFiles();
 assert.ok(files.includes(M.runtime.entry));
 assert.equal(files.filter(f=>/\.mp3$/i.test(f)).length,M.runtime.mediaCount);
 for(const f of files)for(let i=0;i<M.runtime.exclude.length;i++)
  assert.ok(!new RegExp(M.runtime.exclude[i],M.runtime.excludeFlags[i]).test(f),"excluded file is not shipped: "+f);
 assert.ok(!files.some(f=>/PRIVATE|signed|\.env$/i.test(f)),"no private material in the runtime");

 // 2. The staged folder is the Setup ZIP tree, byte for byte, and payload.json describes it.
 const label=M.product.label,entries=setupEntries(label);
 const staged=stage({label,out:path.join(tmp,"stage")});
 const onDisk=[];
 (function walk(dir,rel){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const r=rel?rel+"/"+d.name:d.name;d.isDirectory()?walk(path.join(dir,d.name),r):onDisk.push(r)}})(staged.top,"");
 assert.deepEqual(onDisk.sort(),entries.map(e=>e.name).sort(),"stage holds exactly the Setup files");
 for(const e of entries)assert.equal(sha(fs.readFileSync(path.join(staged.top,...e.name.split("/")))),sha(e.data),e.name+" is staged unchanged");
 const index=JSON.parse(fs.readFileSync(path.join(staged.out,M.stage.payloadIndex),"utf8"));
 assert.equal(index.version,pkg.version+"-"+label);
 assert.equal(index.version,version(label));
 assert.equal(index.fileCount,entries.length);
 assert.equal(index.mediaFiles,M.runtime.mediaCount);
 assert.deepEqual(index.files.map(f=>f.sha256),entries.map(e=>sha(e.data)));
 if(process.platform!=="win32")assert.ok(fs.statSync(path.join(staged.top,M.setupPackage.linuxInstaller)).mode&0o100,"Linux installer is executable in the stage");
 // The stage step never clears a folder it did not make.
 const foreign=path.join(tmp,"mine");fs.mkdirSync(foreign);fs.writeFileSync(path.join(foreign,"keep.txt"),"keep");
 assert.throws(()=>stage({label,out:foreign}),/Refusing to clear/);
 assert.ok(fs.existsSync(path.join(foreign,"keep.txt")));

 // 3. Windows .exe definition: a per-user carrier for the existing install script.
 const iss=text(M.windows.exeScript);
 assert.match(iss,/^PrivilegesRequired=lowest$/m,"no administrator rights");
 assert.match(iss,/^Uninstallable=no$/m,"removal stays with install-windows.ps1, as for the ZIP");
 assert.match(iss,/^CreateAppDir=no$/m);
 assert.ok(iss.includes("program\\install\\"+M.setupPackage.windowsScript),"the .exe runs the same PowerShell script as the ZIP");
 assert.ok(iss.includes("{#StageDir}\\"+M.setupPackage.programDir+"\\*"),"the .exe packs the staged program folder");
 assert.ok(!/https?:\/\//.test(iss.replace(/^;.*$/gm,"")),"no download at install time");
 const issDefault=name=>{const m=iss.match(new RegExp('#define '+name+' "([^"]*)"'));assert.ok(m,"default for "+name);return m[1]};
 const defines=winexe.defines(label,"OUT","STAGE");
 for(const k of ["AppName","AppPublisher","AppVersion","ProgramVersion","OutputName"])assert.equal(issDefault(k),defines[k],".iss default "+k+" matches the manifest");
 for(const k of Object.keys(defines))assert.ok(iss.includes("#ifndef "+k),".iss accepts /D"+k);
 assert.equal(defines.OutputName+".exe",M.windows.exeName.replace("{label}",label));
 const ps1=text(M.setupPackage.source+"/"+M.setupPackage.windowsScript);
 assert.ok(ps1.includes("Join-Path $env:LOCALAPPDATA '"+M.product.name+"'")&&M.windows.installDir==="%LOCALAPPDATA%\\"+M.product.name,"manifest install folder matches the script");
 assert.ok(ps1.includes(M.windows.uninstallKey.replace(/^HKCU\\/,"HKCU:\\")),"manifest uninstall key matches the script");
 for(const flag of ["-Quiet","-NoLaunch"])assert.ok(iss.includes(flag)&&new RegExp("\\[switch\\]\\$"+flag.slice(1)).test(ps1),flag+" is passed through to the script");

 // 4. Linux templates: every placeholder is one the builder fills, and paths match the manifest.
 const header=text(M.linux.runHeader);
 assert.ok(header.startsWith("#!/bin/sh\n")&&!header.includes("\r")&&header.endsWith("\n"));
 assert.deepEqual([...new Set(header.match(/@[A-Z0-9_]+@/g))].sort(),["@LINUX_INSTALLER@","@PAYLOAD_LINE@","@SHA256@","@TOP@"]);
 const debValues=["PACKAGE","VERSION","SECTION","ARCH","DEPENDS","MAINTAINER","SUMMARY","INSTALLED_KB","INSTALL_DIR","ENTRY"];
 for(const f of fs.readdirSync(path.join(root,M.linux.deb.template))){
  const t=text(M.linux.deb.template+"/"+f);
  assert.ok(!t.includes("\r"),f+" uses LF");
  for(const p of t.match(/@[A-Z0-9_]+@/g)||[])assert.ok(debValues.includes(p.slice(1,-1)),f+" placeholder "+p+" is filled by the builder");
 }
 const mint=text(M.setupPackage.source+"/"+M.setupPackage.linuxInstaller);
 assert.ok(mint.includes("/"+M.product.id)&&M.linux.userInstallDir==="~/.local/share/"+M.product.id,"manifest user folder matches the Mint installer");
 assert.notEqual(M.linux.deb.installDir,M.linux.userInstallDir,"the system package does not share the per-user folder");

 // 5. The single-file Linux installer carries the same tree and refuses a damaged copy.
 if(process.platform!=="win32"){
  const run=linux.buildRun(label,tmp);
  assert.equal(path.basename(run),M.linux.runName.replace("{label}",label));
  assert.ok(fs.statSync(run).mode&0o100,".run is executable");
  const dest=path.join(tmp,"unpacked");
  const r=spawnSync("sh",[run,"--extract",dest],{encoding:"utf8"});
  assert.equal(r.status,0,r.stderr);
  for(const e of entries)assert.equal(sha(fs.readFileSync(path.join(dest,M.setupPackage.top,...e.name.split("/")))),sha(e.data),e.name+" unpacks unchanged from the .run");
  const bytes=fs.readFileSync(run);bytes[bytes.length-2000]^=0xff;
  const bad=path.join(tmp,"damaged.run");fs.writeFileSync(bad,bytes);
  const b=spawnSync("sh",[bad,"--extract",path.join(tmp,"never")],{encoding:"utf8"});
  assert.notEqual(b.status,0,"a damaged .run stops");
  assert.match(b.stderr,/damaged or incomplete/);
  assert.ok(!fs.existsSync(path.join(tmp,"never")),"a damaged .run unpacks nothing");
 }

 // 6. Build output never enters Git, and the npm scripts exist.
 assert.match(text(".gitignore"),/^\/dist\/$/m);
 for(const s of ["build:stage","build:setup","build:linux-installers","build:windows-exe","build:installers","test:packaging"])assert.ok(pkg.scripts[s],"npm run "+s);
 assert.ok(pkg.scripts.test.includes("tests/packaging-layout.test.cjs"),"npm test runs this check");
 console.log("PASS packaging layout: manifest, stage, Windows .exe definition, Linux .run and .deb templates agree ("+entries.length+" files, "+M.runtime.mediaCount+" media)");
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
