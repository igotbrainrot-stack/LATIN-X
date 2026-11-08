"use strict";
/* Release packaging regression (real Chromium, real file://):
 * builds the Windows ZIP and Linux tar.gz into a temp folder whose path contains
 * spaces and non-ASCII characters, extracts them with an independent reader,
 * then opens the windowless launcher page and walks every tab and chapter.
 * Fails on any missing file, page error, network request or clutter in the package. */
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),zlib=require("node:zlib");
const assert=require("node:assert/strict"),{pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
const release=require("../scripts/build-release.cjs");

function readZip(buf){
 const out=new Map();let end=buf.length-22;
 while(end>=0&&buf.readUInt32LE(end)!==0x06054b50)end--;
 assert(end>=0,"ZIP end record missing");
 let p=buf.readUInt32LE(end+16);const count=buf.readUInt16LE(end+10);
 for(let i=0;i<count;i++){
  assert.equal(buf.readUInt32LE(p),0x02014b50);
  const method=buf.readUInt16LE(p+10),crc=buf.readUInt32LE(p+16),csize=buf.readUInt32LE(p+20);
  const nlen=buf.readUInt16LE(p+28),xlen=buf.readUInt16LE(p+30),clen=buf.readUInt16LE(p+32),off=buf.readUInt32LE(p+42);
  const mode=buf.readUInt32LE(p+38)>>>16;
  const name=buf.toString("utf8",p+46,p+46+nlen);
  const lo=off+30+buf.readUInt16LE(off+26)+buf.readUInt16LE(off+28);
  const raw=buf.subarray(lo,lo+csize),data=method===8?zlib.inflateRawSync(raw):raw;
  assert.equal(zlib.crc32(data),crc,"CRC mismatch "+name);
  out.set(name,{data,mode:mode&0o777});p+=46+nlen+xlen+clen;
 }
 return out;
}
function readTarGz(buf){
 const tar=zlib.gunzipSync(buf),out=new Map();let p=0,longName=null;
 while(p+512<=tar.length&&tar[p]!==0){
  const field=(o,l)=>tar.toString("utf8",p+o,p+o+l).replace(/\0.*$/s,"");
  const size=parseInt(field(124,12),8),type=field(156,1),mode=parseInt(field(100,8),8);
  const data=tar.subarray(p+512,p+512+size);
  if(type==="x"){longName=/path=(.*)\n/.exec(data.toString("utf8"))[1]}
  else{out.set(longName||field(0,100),{data,mode});longName=null}
  p+=512+Math.ceil(size/512)*512;
 }
 return out;
}
function extract(entries,dir){
 for(const [name,e] of entries){
  const dest=path.join(dir,name);fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,e.data);if(e.mode&0o111)fs.chmodSync(dest,0o755);
 }
}

(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"tablinum release "));
 const out=path.join(temp,"dist");
 const [winZip,linuxTar]=release.build({out});
 const win=readZip(fs.readFileSync(winZip)),lin=readTarGz(fs.readFileSync(linuxTar));
 const top=release.TOP+"/";
 for(const [label,entries] of [["windows",win],["linux",lin]]){
  const names=[...entries.keys()];
  assert(names.every(n=>n.startsWith(top)),label+": single top-level folder");
  for(const need of ["index.html","Tablinum.html","README.txt","Picture Practice.html","Art Review.html",
   "app/legacy-runtime.js","app/62-narration.js","content/narration.js","vendor/ts-fsrs.umd.js",
   "app/styles/tablinum-polish.css","app/styles/tablinum-fonts.css","assets/fonts/gentium-book-plus/OFL.txt",
   "assets/icons/tablinum.svg","curriculum/music.json"])
   assert(entries.has(top+need),label+": missing "+need);
  const clutter=names.filter(n=>/(^|\/)(tests|scripts\/lib|archive|docs|CLAUDE_|PHASE|GPT_|audio-audition|node_modules|artifacts)|\.md$/.test(n.slice(top.length))&&!/ATTRIBUTION\.md$|assets\/art\/b01\/README\.md$/.test(n));
  assert.deepEqual(clutter,[],label+": historical or development files must not ship");
  assert(!names.some(n=>/PRIVATE_|LOCAL_INSTALL_RECORD/.test(n)),label+": private links must not ship");
  assert(names.filter(n=>/\.mp3$/.test(n)).length>=1,label+": approved narration MP3s ship");
 }
 assert(win.get(top+"Start Tablinum.cmd").data.toString().includes("\r\n"),"Windows .cmd keeps CRLF");
 assert(!lin.has(top+"Start Tablinum.cmd"),"Linux package has no .cmd files");
 assert.equal(lin.get(top+"linux/install-launcher.sh").mode&0o755,0o755,"Linux installer is executable");

 // Extract both into paths with spaces and macrons, then run the real app.
 const browser=await chromium.launch();
 try{
  for(const [label,entries] of [["windows",win],["linux",lin]]){
   const dir=path.join(temp,"Extracted "+label+" Līvia"),errors=[],network=[],failed=[];
   extract(entries,dir);
   const appDir=path.join(dir,release.TOP);
   const page=await browser.newPage({viewport:{width:1280,height:860}});
   page.on("pageerror",e=>errors.push(e.message));
   page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
   page.on("request",r=>{if(!r.url().startsWith("file:")&&!r.url().startsWith("data:")&&!r.url().startsWith("blob:"))network.push(r.url())});
   page.on("requestfailed",r=>failed.push(r.url()));
   await page.goto(pathToFileURL(path.join(appDir,"Tablinum.html")).href);
   await page.waitForURL(/index\.html$/);
   await page.locator(".sentence").first().waitFor();
   const fontOk=await page.evaluate(async()=>{await document.fonts.ready;return document.fonts.check('16px "Tablinum Book"',"ā")});
   assert(fontOk,label+": bundled book face loads from file://");
   for(let ch=0;ch<8;ch++){
    await page.locator('#chapters [data-ch="'+ch+'"]').first().click();
    await page.locator(".sentence").first().waitFor();
   }
   for(const tab of ["quiz","review","progress","read"]){
    await page.locator('#tabs [data-tab="'+tab+'"]').click();await page.waitForTimeout(80);
   }
   await page.goto(pathToFileURL(path.join(appDir,"Picture Practice.html")).href);
   await page.locator("img[data-art-image]").first().waitFor();
   await page.goto(pathToFileURL(path.join(appDir,"Art Review.html")).href);
   await page.waitForLoadState("load");
   // A narration probe for an approved-but-absent take is an expected, labelled fallback.
   const unexpected=failed.filter(u=>!/audio\/narration\/miriam\/(s007-v6[ab]|s009-v5a|word-(quoque-v4|villa-v2|aqua-v3))\.mp3$/.test(decodeURI(u)));
   assert.deepEqual(unexpected,[],label+": every requested file is in the package");
   assert.deepEqual(network,[],label+": no network access");
   assert.deepEqual(errors.filter(e=>!/ERR_FILE_NOT_FOUND/.test(e)),[],label+": no page errors");
   await page.close();
  }
 }finally{await browser.close();fs.rmSync(temp,{recursive:true,force:true})}
 console.log("PASS release: Windows ZIP and Linux tar.gz build, extract into spaced/non-ASCII paths, launch via Tablinum.html, all 8 chapters/4 tabs/picture practice load offline with no missing files, no clutter, CRLF .cmd and 0755 Linux installer.");
})().catch(e=>{console.error(e);process.exit(1)});
