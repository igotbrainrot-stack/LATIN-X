"use strict";
/* Main legacy reader should preview reviewed Book I pictures by subject, not by
 * chapter number. Never publish unsigned lessons or modify saved state. */
const assert=require('node:assert/strict');
const manifest=require('../curriculum/illustrations.json');
globalThis.TablinumIllustrationsData=manifest;
const art=require('../app/64-art-scenes.js');
const expected=['b01-c001','b01-c002','b01-c004','b01-c003','b01-c006','b01-c007','b01-c008','b01-c005'];
assert.deepEqual(Array.from({length:8},(_,i)=>art.legacyArtTopic(i)?.bookId),expected);
assert.equal(art.legacyArtTopic(-1),null);
assert.equal(art.legacyArtTopic(8),null);
assert.equal(art.legacyArtTopic('0'),null);
for(let i=0;i<8;i++){
 const item=art.legacyArtTopic(i),scenes=manifest.scenes.filter(c=>c.id.startsWith(item.bookId+'-scene'));
 assert(scenes.length>=1&&scenes.every(art.approved),`Preview must use only owner-approved art: legacy ${i+1}`);
}
function fakeDoc(i){
 let injected=null;
 const old={outerHTML:'<div class="scene"><svg>Original SVG fallback</svg></div>',closest:()=>null,
   replaceWith(n){injected=n;}};
 const selected=Number.isInteger(i)?{dataset:{ch:String(i)}}:null;
 const nav={querySelector:()=>selected};
 const main={querySelector(q){return q==='[data-art-scene]'&&injected?injected:null|| (q==='.scene'&&!injected?old:null)}};
 const doc={getElementById(id){return id==='main'?main:id==='chapters'?nav:null;},createElement(tag){assert.equal(tag,'section');return {setAttribute(k,v){this[k]=v;}}}};
 return {doc,get injected(){return injected}};
}
for(let i=0;i<8;i++){
 const t=fakeDoc(i);
 assert.equal(art.decorateLegacyReader(t.doc),true,`Legacy ${i+1} art should render`);
 assert(t.injected.innerHTML.includes('assets/art/b01/'),`No rendered picture on legacy ${i+1}`);
 assert(t.injected.innerHTML.includes('Approved Book I artwork'));
 assert(t.injected.innerHTML.includes('Original SVG fallback'),`Image load failure must preserve SVG fallback ${i+1}`);
 assert.equal(art.decorateLegacyReader(t.doc),false,'Do not rewrap an already decorated reader');
 const pictureCount=(t.injected.innerHTML.match(/data-art-image=/g)||[]).length;
 assert.equal(pictureCount,i===6?2:1,`Unexpected picture count on legacy ${i+1}`);
}
assert(fakeDoc(7).doc);
const custom=fakeDoc(null);assert.equal(art.decorateLegacyReader(custom.doc),false,'Custom imported text must not receive unrelated picture');
const unsigned=manifest.scenes.find(s=>s.id==='b01-c006-scene');const oldStatus=unsigned.status;
unsigned.status='planned_owner_unapproved';
try{assert.equal(art.decorateLegacyReader(fakeDoc(4).doc),false,'Unsigned art must never replace the fallback');}
finally{unsigned.status=oldStatus}
assert(art.legacyArtTopic(7).related,'Crās must be labelled as a related scene, not an exact illustration');
const oldProgram=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','app/legacy-runtime.js'),'utf8');
assert(oldProgram.includes('const picture=globalThis.TablinumArtScenes?.renderChapter(activeCourse?.id,fallbackScene)||fallbackScene;'),'Legacy course renderer must remain untouched');
console.log('PASS main-reader artwork preview: all eight topics mapped to nine approved WebPs, two weather pictures, related-scene warning, SVG fallback and unsigned gate.');
