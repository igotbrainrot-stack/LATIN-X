"use strict";
/* Checks the one-click Setup package without installing it: layout, line endings,
 * executable bit, all 78 owner media files, and that the installers point at the
 * paths the package really contains. The install runs themselves are in
 * .github/workflows/easy-install.yml (Linux and windows-latest). */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {setupEntries}=require("../scripts/build-easy-install.cjs");

const entries=setupEntries("test");
const byName=new Map(entries.map(e=>[e.name,e]));
const top=[...new Set(entries.map(e=>e.name.split("/")[0]))].sort();
assert.deepEqual(top,["Install Tablinum (Linux Mint).sh","Install Tablinum (Windows).cmd","Open without installing.html","READ ME FIRST.txt","program"],"top folder holds only the installers, the no-install page, the readme and program/");

const cmd=byName.get("Install Tablinum (Windows).cmd").data.toString("utf8");
assert.ok(!/[^\r]\n/.test(cmd),"Windows installer uses CRLF");
assert.match(cmd,/program\\install\\install-windows\.ps1/);
const sh=byName.get("Install Tablinum (Linux Mint).sh");
assert.equal(sh.mode,0o755,"Linux installer is executable");
assert.ok(!sh.data.includes("\r"),"Linux installer uses LF");
assert.ok(sh.data.toString().startsWith("#!/bin/sh\n"));
assert.ok(!byName.get("READ ME FIRST.txt").data.toString().replace(/\r\n/g,"").includes("\n"),"readme uses CRLF");

const ps1=byName.get("program/install/install-windows.ps1").data;
assert.deepEqual([...ps1.subarray(0,3)],[0xef,0xbb,0xbf],"PowerShell script has a UTF-8 BOM");
for(const p of ["assets\\icons\\tablinum.ico","install\\package.json","index.html"])assert.ok(ps1.includes(p),"install-windows.ps1 refers to "+p);
for(const p of ["program/assets/icons/tablinum.ico","program/assets/icons/tablinum-256.png","program/index.html","program/install/package.json"])assert.ok(byName.has(p),p+" ships");
assert.equal(JSON.parse(byName.get("program/install/package.json").data).name,"Tablinum");
assert.match(byName.get("Open without installing.html").data.toString(),/program\/index\.html/);

const mp3=entries.filter(e=>/\.mp3$/i.test(e.name));
assert.equal(mp3.length,78,"all 78 owner media files ship");
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"..","docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json"),"utf8"));
for(const f of manifest.files)assert.ok(byName.has("program/"+f.path),"missing "+f.path);
assert.ok(!entries.some(e=>/(^|\/)(tests|scripts|docs|node_modules)\//.test(e.name.replace(/^program\//,""))),"no developer folders in program/");
console.log("easy-install package: "+entries.length+" files, "+mp3.length+" media files, layout ok");
