'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const privateReviewPath=path.join(root,'docs/audio/owner-original-review-2026-11-07.json');
const review=fs.existsSync(privateReviewPath)?JSON.parse(fs.readFileSync(privateReviewPath,'utf8')):null;
const assessment = JSON.parse(fs.readFileSync(path.join(root,'docs/audio/owner-review-assessment-2026-11-07.json'),'utf8'));
const trials = JSON.parse(fs.readFileSync(path.join(root,'docs/audio/miriam-ipa-retries-2026-11-07.json'),'utf8'));
const html = fs.readFileSync(path.join(root,'Audio Audition.html'),'utf8');
const fixes = fs.readFileSync(path.join(root,'Miriam IPA Retry Review.html'),'utf8');
let rejects=null;
if(review){
 assert.equal(review.selected_voice,null,'Historical November 7 review must remain unchanged');
 assert.equal(review.reviews.length,34);
 const decisions=(voice,status)=>review.reviews.filter(c=>c.voice_name===voice&&c.decision===status);
 assert.equal(decisions('Eleanor','reject').length,17);
 assert.equal(decisions('Miriam','accept').length,12);
 assert.equal(decisions('Miriam','reject').length,5);
 rejects=new Set(decisions('Miriam','reject').map(c=>c.sentence_id));
}else{
 // The historical review is intentionally private. Public CI still validates
 // the committed assessment, trial statuses and review UI below.
 console.log('NOTE: private original owner-review JSON is absent in public checkout; historical decisions are not re-verified');
}
assert.equal(assessment.working_voice_candidate_status.includes('NOT an explicit final narrator selection'),true);
assert.equal(trials.retries.length,5);
for(const item of trials.retries){
 if(rejects)assert(rejects.has(item.sentence_id),'Do not create retries for accepted clips');
 assert(item.speech_input.startsWith('/'),'Experimental IPA retries must be declared, not passed off as phonetic guarantees');
 assert.equal(item.owner_decision,'not_reviewed');
 assert.equal(item.sha256,null,'Cannot invent a SHA256 when Runway-hosted binary was not retrieved');
 assert(!fs.existsSync(path.join(root,'audio-audition',item.filename)),'Do not fake missing Runway MP3s');
}
assert(html.includes('OWNER_IMPORTED_REVIEW'),'Owner decisions must initialize the offline standalone page');
assert(html.includes('id="show-eleanor"'),'Rejected Eleanor archive should be hidden unless explicitly revealed');
assert(fixes.includes('id="export"'),'Five new trials must export separate owner verdicts');
// The signed Runway links are private and never packaged (expired, and must not be published).
// Check them only in the owner's working copy, where they exist; a clean source package omits them.
const privateLinks=path.join(root,'audio-audition/PRIVATE_MIRIAM_IPA_V2_RUNWAY_LINKS.json');
if(fs.existsSync(privateLinks))JSON.parse(fs.readFileSync(privateLinks,'utf8'));
else console.log('NOTE: private Runway link file absent (expected in a packaged source copy)');
console.log('Owner Miriam review PASS: committed trial statuses and offline review interface; historical private decisions checked when available');
