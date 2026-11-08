"use strict";
/* Supply-chain locked vendoring. Run after npm install --no-save ts-fsrs@5.4.2.
 * Exact published source version is verified before copying; bundle is stored
 * locally and never obtained at browser runtime. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const pkgDir=path.join(root,"node_modules","ts-fsrs");
const pkg=JSON.parse(fs.readFileSync(path.join(pkgDir,"package.json"),"utf8"));
assert.equal(pkg.name,"ts-fsrs");assert.equal(pkg.version,"5.4.2");
const src=fs.readFileSync(path.join(pkgDir,"dist","index.umd.js"));
const lic=fs.readFileSync(path.join(pkgDir,"LICENSE"),"utf8");
assert(lic.includes("MIT License"),"ts-fsrs MIT License text missing");
assert(src.length>10000,"Missing published UMD artifact");
const vendor=path.join(root,"vendor"),target=path.join(vendor,"ts-fsrs.umd.js");
const manifest={name:"ts-fsrs",version:"5.4.2",license:"MIT",source:"https://www.npmjs.com/package/ts-fsrs/v/5.4.2",
 umd:"vendor/ts-fsrs.umd.js",sha256:crypto.createHash("sha256").update(src).digest("hex")};
const expected=JSON.stringify(manifest,null,2)+"\n";
if(process.argv.includes("--check")){
 assert.equal(fs.readFileSync(target).compare(src),0,"Vendored UMD does not match exact published npm package");
 assert.equal(fs.readFileSync(path.join(vendor,"ts-fsrs.LICENSE"),"utf8"),lic);
 assert.equal(fs.readFileSync(path.join(vendor,"ts-fsrs-manifest.json"),"utf8"),expected);
 console.log("PASS ts-fsrs 5.4.2 vendored exact source and MIT license, SHA256 "+manifest.sha256);
}else{
 fs.mkdirSync(vendor,{recursive:true});
 fs.writeFileSync(target,src);fs.writeFileSync(path.join(vendor,"ts-fsrs.LICENSE"),lic);
 fs.writeFileSync(path.join(vendor,"ts-fsrs-manifest.json"),expected);
 console.log("VENDORED ts-fsrs 5.4.2 SHA256 "+manifest.sha256);
}
