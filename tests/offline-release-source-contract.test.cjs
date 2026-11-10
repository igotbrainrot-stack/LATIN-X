"use strict";
/* Public-checkout release contract: no owner MP3s or Playwright required.
 * The full tests/release-package.test.cjs separately extracts real packages. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=JSON.parse(read("docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json"));
assert.equal(manifest.files.length,78,"Exactly 78 approved-for-packaging owner files");
const listed=manifest.files.map(x=>x.path);
assert.equal(new Set(listed).size,78,"No duplicate owner media paths");
assert.equal(listed.filter(x=>x.startsWith("audio/narration/arjun/")).length,75);
assert.equal(listed.filter(x=>x.startsWith("assets/audio/roman/")).length,3);
for(const x of manifest.files){
 assert(/^[a-f0-9]{64}$/.test(x.sha256)&&x.bytes>1000,"Manifest SHA256 and sizes required");
 assert(!x.path.includes("..")&&!x.path.includes("\\\\")&&x.path.endsWith(".mp3"));
}
const c={};c.globalThis=c;
vm.runInNewContext(read("content/narration.js"),c);
const cat=c.TablinumNarrationCatalogue;
assert.equal(cat.sentences.length,67);assert.equal(cat.words.length,8);
assert.equal(cat.sentences.filter(x=>x.takes[0].owner_listening==="pass").length,9);
assert.equal(cat.sentences.filter(x=>x.takes[0].owner_listening==="pending").length,58);
assert.equal(cat.words.filter(x=>x.voice==="Miriam"&&x.owner_listening==="fallback").length,1);
const cataloguePaths=[...cat.sentences.flatMap(x=>x.takes.map(t=>cat.base_path+t.file)),...cat.words.map(w=>cat.base_path+w.file)];
assert.equal(cataloguePaths.length,75);
for(const p of cataloguePaths)assert(listed.includes(p),"Audio manifest must include every narrator clip: "+p);
const builder=require("../scripts/build-release.cjs");
const runtime=builder.runtimeFiles();
for(const asset of ["index.html","app/legacy-runtime.js","content/narration.js","app/welcome/welcome.js","app/welcome/welcome.css","app/60-audio-ambience.js"])assert(runtime.includes(asset),"Offline source runtime missing "+asset);
for(const p of runtime.filter(x=>x.endsWith(".mp3")))assert(listed.includes(p),"Orphaned private recording in release: "+p);
for(const p of runtime)assert(!p.includes("PRIVATE_")&&!p.includes("LOCAL_INSTALL_RECORD")&&!p.startsWith("audio-audition/"),"Private or development artifact leaked: "+p);
assert(!runtime.some(p=>p.endsWith("START_LATIN_X.py")||p.includes("INSTALL_THEME.py")),"No patch-on-launch code in learner release");
const launcher=read("launchers/Tablinum.html");
assert(launcher.includes('location.replace("index.html")'),"Launcher opens packaged local reader");
assert(!launcher.includes("github.com")&&!launcher.includes("fetch("),"Launcher must not download source");
const state=read("app/20-state-v5.js");
assert(state.includes("tablinum-state-v5")&&state.includes("tablinum-source-review-v02"),"Preserve learner storage keys");
assert(state.includes('"library"')||state.includes("'library'"),"Preserve legacy library tab save compatibility");
console.log("PASS offline release source contract: 78 media pins, 67+8 catalogue, no orphan media, local launcher and preserved save keys.");
