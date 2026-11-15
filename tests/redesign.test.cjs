"use strict";
/* Static contract for the November 2026 interface redesign. Browser behaviour is in
 * tests/redesign-browser.test.cjs; this file guards the things that must stay true of
 * the source: one token set, identical dark blocks, offline assets, additive storage,
 * no private narration aliases in learner-facing files, old stylesheets really gone. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const tokens=read("app/styles/lx-tokens.css"),app=read("app/styles/lx-app.css"),fonts=read("app/styles/tablinum-fonts.css");
const html=read("index.html"),runtime=read("app/legacy-runtime.js"),state=read("app/20-state-v5.js");

// 1. Dark theme is written twice (system preference and explicit choice): the two blocks must not drift.
const body=re=>{const m=tokens.match(re);assert(m,"dark block missing: "+re);return m[1].replace(/\s+/g," ").trim()};
const auto=body(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n\s*\}\s*\n\}/);
const forced=body(/\n:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/);
assert.equal(auto,forced,"the system-dark and chosen-dark token blocks differ");
const names=block=>[...block.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]);
const lightNames=new Set(names(tokens.match(/:root\s*\{([\s\S]*?)\n\}/)[1]));
for(const n of names(forced))assert(lightNames.has(n),"dark theme sets a token the light theme does not define: "+n);
for(const n of ["--bg","--surface","--surface-2","--ink","--ink-2","--ink-3","--line","--primary","--on-primary","--accent","--good","--bad","--focus"])
 assert(names(forced).includes(n),"dark theme must redefine "+n);

const scripted=runtime+read("app/57-play.js")+read("app/64-art-scenes.js"); // custom properties set per element from script
// 2. Components use tokens: no raw hex colours outside the token file.
const rawHex=(app.replace(/\/\*[\s\S]*?\*\//g,"").match(/#[0-9a-fA-F]{3,8}\b/g)||[]);
assert.deepEqual(rawHex,[],"lx-app.css must take every colour from lx-tokens.css");
for(const used of new Set([...app.matchAll(/var\((--[\w-]+)/g)].map(m=>m[1])))
 assert(lightNames.has(used)||new RegExp(used.replace(/-/g,"\\-")+"\\s*:").test(app)||scripted.includes(used+":")||scripted.includes('"'+used+'"'),"lx-app.css uses an undefined token "+used);

// 3. Offline only: bundled fonts exist, are licensed, and nothing points at a network.
for(const sheet of [tokens,app,fonts]){assert(!/@import|https?:\/\//i.test(sheet),"no remote CSS");}
for(const m of fonts.matchAll(/url\("([^"]+)"\)/g)){
 const file=path.join(root,"app/styles",m[1]);assert(fs.existsSync(file),"font file missing: "+m[1]);
 assert(fs.statSync(file).size>10000,"font file looks truncated: "+m[1]);
}
assert(/font-family:\s*"Tablinum Sans"/.test(fonts)&&/font-family:\s*"Tablinum Book"/.test(fonts),"exactly the two bundled families");
assert.deepEqual([...new Set([...fonts.matchAll(/font-family:\s*"([^"]+)"/g)].map(m=>m[1]))].sort(),["Tablinum Book","Tablinum Sans"]);
assert(/SIL OPEN FONT LICENSE/i.test(read("assets/fonts/source-sans-3/OFL.txt")),"Source Sans 3 ships with its licence");
assert(/Source Sans 3/.test(read("docs/LICENCE_REGISTER.md")),"the licence register lists the interface typeface");
assert(!/<link[^>]+href="https?:|<script[^>]+src="https?:/.test(html),"index.html loads nothing remote");
assert(!/\bfetch\(|type="module"|\bimport\(/.test(html+runtime),"no fetch, modules or dynamic import in the file:// runtime");

// 4. The four retired stylesheets are gone and nothing still links them.
for(const old of ["app/styles/tablinum-polish.css","app/styles/tablinum-modern.css","app/styles/tablinum-play.css","app/welcome/welcome.css"]){
 assert(!fs.existsSync(path.join(root,old)),"retired stylesheet still present: "+old);
 for(const page of ["index.html","Picture Practice.html","Art Review.html","launchers/Tablinum.html"])
  if(fs.existsSync(path.join(root,page)))assert(!read(page).includes(path.basename(old)),page+" still links "+old);
}

// 5. Storage: same key, same schema and version; display settings are an additive ui field.
assert(state.includes('"tablinum-state-v5"'),"the saved-progress key is unchanged");
assert(!/localStorage\.setItem\(\s*["']tablinum-source-review-v02/.test(runtime+state),"the retired v4 key is never written");
assert(/v5State\.ui\.display=\{\.\.\.displayPrefs\(\),\.\.\.patch\}/.test(runtime),"display settings live in ui.display");
assert(!/overlay[^;\n]*S\.tab=|S\.tab=["'](home|settings)["']/.test(runtime),"Home and Settings are not persisted as the saved section");
const api=require("../app/20-state-v5.js");
if(api&&typeof api.createEmpty==="function"){
 const s=api.createEmpty();s.ui.display={theme:"dark",size:4,leading:0,focus:true};
 if(typeof api.validV5==="function")assert(api.validV5(s),"a profile with display settings is a valid v5 profile");
}

// 6. Private narration respellings never appear in learner-facing files.
const alias=/Līwia|Liiwia|Lii-wia|Lee-wee-ah|Kwoh-kweh/;
for(const f of ["index.html","Picture Practice.html","app/legacy-runtime.js","app/62-narration.js","app/60-audio-ambience.js","app/57-play.js","app/64-art-scenes.js","app/65-picture-practice.js","app/welcome/welcome.js","content/narration.js"])
 assert(!alias.test(read(f)),"private pronunciation alias in learner-facing file "+f);

// 7. Approved audio is byte-identical to the pinned manifest (the redesign must not touch media).
const manifest=JSON.parse(read("docs/audio/ARJUN_OFFLINE_MEDIA_CHECKSUMS_20261110.json")).files;
assert.equal(manifest.length,78,"78 pinned media files");
for(const m of manifest){
 const digest=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,m.path))).digest("hex");
 assert.equal(digest,m.sha256,"media changed: "+m.path);
}

// 8. The shell keeps its landmarks and the reader keeps its honest audio labels.
for(const need of ['class="skip-link" href="#main"','<header class="appbar">','<nav id="tabs" aria-label="Study sections">','<main id="main"></main>','id="sound-button"','aria-expanded="false"','data-tab="settings"'])
 assert(html.includes(need),"shell markup missing: "+need);
assert(/Browser voice/.test(html)&&/browser voice/i.test(runtime),"the synthetic voice is always named as such");
assert(!/autoAdvance|setTimeout\([^)]*forward\(/.test(runtime),"no automatic sentence advance");
console.log("PASS redesign contract: identical dark blocks, token-only colours, bundled licensed fonts, retired CSS removed, additive ui.display, v4 key untouched, no private aliases, 78 media files byte-identical, shell landmarks.");
