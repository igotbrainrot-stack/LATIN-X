"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
(async()=>{
 const inserted=[],status={textContent:""},document={
  head:{appendChild(script){inserted.push(script)}},
  createElement(tag){assert.equal(tag,"script");return {src:"",async:false,remove(){}}},
  getElementById(id){return id==="appStatus"?status:null}
 };
 const ctx={document,console};
 vm.runInNewContext(read("content/catalogue.js"),ctx,{filename:"content/catalogue.js"});
 vm.runInNewContext(read("app/30-content-loader.js"),ctx,{filename:"app/30-content-loader.js"});
 const t=ctx.Tablinum;
 assert.equal(t.catalogue.size,8);
 assert.equal(t.chapters.size,0,"Chapters not silently fetched");
 await assert.rejects(t.loadChapter("../../bad.js"),/Unknown or unpublished chapter/);
 const a=t.loadChapter("legacy-ch01"),b=t.loadChapter("legacy-ch01");
 assert.strictEqual(a,b,"Concurrent requests must share one script injection");
 assert.equal(inserted.length,1);
 assert.equal(inserted[0].src,"content/legacy/ch01.js");
 vm.runInNewContext(read("content/legacy/ch01.js"),ctx,{filename:"content/legacy/ch01.js"});
 inserted[0].onload();
 const chapter=await a;
 assert.equal(chapter.id,"legacy-ch01");
 assert.equal(chapter.legacy_source.sent.length,9);
 assert.equal(t.legacySourceAt(0).sent.length,9);
 assert.equal(t.chapters.size,1);
 const cached=await t.loadChapter("legacy-ch01");
 assert.strictEqual(cached,chapter);
 assert.equal(inserted.length,1,"Cached chapter cannot trigger a second network request");
 assert.throws(()=>t.registerChapter({...chapter,id:"legacy-ch99"}),/Unlisted chapter/);
 assert.throws(()=>t.registerChapter({...chapter,id:"legacy-ch02",status:"approved"}),/Invalid compiled chapter/);
 const absent=t.loadChapter("legacy-ch02");
 assert.equal(inserted[1].src,"content/legacy/ch02.js");
 inserted[1].onerror();
 await assert.rejects(absent,/Missing content file content\/legacy\/ch02.js/);
 assert(status.textContent.includes("Re-extract the complete Tablinum ZIP"));
 assert(t.errors.some(x=>x.includes("ch02.js")));
 const fallback=t.legacySourceAt(1);
 assert.equal(fallback.unavailable,true);
 assert.equal(fallback.sent.length,0);
 assert(fallback.sub.includes("content/legacy/ch02.js"));
 assert(!t.chapters.has("legacy-ch02"),"A missing chapter must never become an approved or cached fake lesson");
 const empty={document,console};
 vm.runInNewContext(read("app/30-content-loader.js"),empty);
 assert(empty.Tablinum.errors.some(m=>m.includes("content/catalogue.js")));
 console.log("PASS Phase3b: catalogued on-demand script loads, dedup, rejection, missing-file guidance and no false approval.");
})().catch(error=>{console.error(error);process.exitCode=1});
