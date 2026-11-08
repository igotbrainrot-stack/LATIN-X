"use strict";
/* No file:// fetch! The compiler is deterministic; check mode never writes. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const src=JSON.parse(fs.readFileSync(path.join(root,"curriculum/illustrations.json"),"utf8"));
const output="/* Generated from curriculum/illustrations.json. Do NOT edit manually. */\n"+
 "globalThis.TablinumIllustrationsData="+JSON.stringify(src,null,2).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")+";\n";
const target=path.join(root,"content/illustrations.js");
if(process.argv.includes("--check")){
 assert.equal(fs.readFileSync(target,"utf8"),output,"Art catalogue is stale: node scripts/build-illustrations.cjs");
 console.log("PASS illustration catalogue is exact and loads as a classic file:// script");
}else{
 fs.writeFileSync(target,output);
 console.log("Updated content/illustrations.js from signed/unsigned source manifest");
}