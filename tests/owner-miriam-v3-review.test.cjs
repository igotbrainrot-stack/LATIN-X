"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p));
const review=JSON.parse(read('docs/audio/owner-miriam-ipa-v2-review-2026-11-07.json'));
const trials=JSON.parse(read('docs/audio/miriam-alias-v3-2026-11-07.json'));
const privateReview=path.join(root,'docs/audio/owner-original-review-2026-11-07.json');
const original=fs.existsSync(privateReview)?JSON.parse(read('docs/audio/owner-original-review-2026-11-07.json')):null;
if(original){
 assert.equal(original.reviews.filter(r=>r.voice_name==='Eleanor'&&r.decision==='reject').length,17);
 assert.equal(original.reviews.filter(r=>r.voice_name==='Miriam'&&r.decision==='accept').length,12);
 assert.equal(original.reviews.filter(r=>r.voice_name==='Miriam'&&r.decision==='reject').length,5);
}
const historic=JSON.parse(read('docs/audio/audition-2026-11.json'));
const historicByFile=new Map(historic.clips.map(clip=>[clip.recording_file,clip]));
assert.equal(review.ipa_trials.length,5);
assert.equal(review.ipa_trials.find(x=>x.sentence_id==='test-villa').decision,'accept');
assert.equal(review.ipa_trials.find(x=>x.sentence_id==='legacy-ch01-s007').decision,null);
assert.equal(trials.items.length,4);
assert.equal(trials.voice,'Miriam');assert.equal(trials.model,'eleven_v3');assert.equal(trials.speed,0.9);
const expected=['legacy-ch01-s007','legacy-ch01-s009','test-aqua','test-quoque'];
assert.deepEqual(trials.items.map(x=>x.id),expected);
for(const t of trials.items){
  assert.equal(t.sha256,null,'new v3 MP3 must not claim verified or approved before byte retrieval');
  assert.equal(t.owner_v3_decision,null);
  assert.equal(t.status,'generated_in_runway_original_binary_not_downloaded');
  assert(/^[0-9a-f-]{36}$/.test(t.task));
  assert(t.alias!==t.display);
  assert(t.original_v1_verified_sha256||t.v1sha);
  const originalPath='audio-audition/'+t.v1filename;
  const pinned=historicByFile.get(originalPath);
  assert(pinned,'Historical original must remain in the committed audition manifest: '+originalPath);
  assert.equal(pinned.sha256,t.v1sha,'Private original SHA-256 pin must match committed history');
  if(fs.existsSync(path.join(root,originalPath))){
   const b=read(originalPath);
   assert.equal(crypto.createHash('sha256').update(b).digest('hex'),t.v1sha);
  }
}
assert(!read('docs/audio/miriam-alias-v3-2026-11-07.json').toString().includes('_jwt='),'no owner-private signed links in public manifest');
const html=read('Miriam Alias Review v3.html').toString();
assert.equal((html.match(/<article class="card" data-clip=/g)||[]).length,4);
assert.equal((html.match(/data:audio\/mpeg;base64,/g)||[]).length,4);
assert.equal((html.match(/src="audio-audition\//g)||[]).length,4);
assert(html.includes('Export my round-3 review JSON'));
assert(html.includes('KWO-kweh') && html.includes('Kwo Kee'));
assert(!html.includes('_jwt='),'private signed URLs must stay out of HTML');
assert(fs.existsSync(path.join(root,'Start Tablinum.cmd')) && fs.existsSync(path.join(root,'Start Miriam Alias Review v3.cmd')));
console.log('PASS owner Miriam v3: four unapproved retries, historical SHA-256 pins validated; private originals verified when present');
