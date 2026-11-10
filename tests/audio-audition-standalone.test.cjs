'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const page=fs.readFileSync(path.join(root,'Audio Audition.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/audio/audition-2026-11.json'),'utf8'));
const m=page.match(/window\.LATIN_X_EMBEDDED_AUDIO=(\{[^\n]+\});/);
assert(m,'Standalone page must embed audio data object');
const embedded=JSON.parse(m[1]);
assert.equal(manifest.clips.length,34,'Expected exactly 34 received Runway MP3s');
assert.equal(Object.keys(embedded).length,34,'All 34 source clips should be embedded');
assert(!page.includes('<script src="docs/audio/audition-data-2026-11.js">'),'Audition must not depend on a sibling JS file');
for(const clip of manifest.clips){
 const url=embedded[clip.clip_id];
 assert(url&&url.startsWith('data:audio/mpeg;base64,'),'Missing directly playable MP3 source: '+clip.clip_id);
 const bytes=Buffer.from(url.slice('data:audio/mpeg;base64,'.length),'base64');
 // Historical standalone auditions embed the original MP3 bytes. The private
 // source MP3s are deliberately not committed; clean CI must validate the
 // embedded bytes against the committed SHA256 rather than require missing files.
 const original=path.join(root,clip.recording_file);
 if(fs.existsSync(original)){
  const file=fs.readFileSync(original);
  assert.equal(Buffer.compare(bytes,file),0,'Embedded and original bytes must match when the private original is present: '+clip.clip_id);
 }
 assert(bytes.length>1000,'Embedded recording must contain real audio bytes: '+clip.clip_id);
 assert(bytes.subarray(0,3).toString('latin1')==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224),
  'Embedded recording must contain an MP3 header: '+clip.clip_id);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256,'SHA-256 mismatch: '+clip.clip_id);
 assert.equal(clip.pronunciation_approved,false,'Unreviewed audio must remain unapproved');
}
assert(page.includes('id="test-audio"'),'Visible user-triggered sound diagnostic required');
assert(page.includes("audio.src=window.LATIN_X_EMBEDDED_AUDIO[clip.clip_id]"),'Every playback control must use embedded audio');
assert(fs.existsSync(path.join(root,'Start Audio Audition.cmd')),'Windows audition launcher required');
console.log('Standalone Runway audition PASS: 34 embedded MP3s validated against pinned SHA-256; optional private originals compared when present');
