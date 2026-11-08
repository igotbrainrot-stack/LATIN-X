/* Run as: node docs/audio/prepare_latin_pilot.cjs
 * READ-ONLY source-to-speech preparation. Generates JSON on stdout.
 * NO synthesis, network, source edits, punctuation guesses, or pronunciation claims. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname,'../..');
const file = path.join(root,'lessons','legacy','ch01.json');
const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
if(lesson.id !== 'legacy-ch01' || !Array.isArray(lesson.sentences)) throw Error('Unexpected source structure');
const sha256 = txt => crypto.createHash('sha256').update(txt, 'utf8').digest('hex');
const problems = [];
const entries = lesson.sentences.map((s,index)=>{
  if(typeof s.text_la !== 'string' || !s.text_la.trim() || typeof s.id !== 'string') throw Error('Missing Latin source/ID at '+index);
  const displayed=s.text_la;
  const spokenCandidate=displayed.normalize('NFC').replace(/[\u200b-\u200d\u2060\ufeff]/g,'').trim();
  if(/[<>[\]{}*_#@&/=\\]/u.test(spokenCandidate)) problems.push({id:s.id,issue:'Possible markup/abbreviation/IPA delimiter; manual inspection required'});
  if(/[0-9]/u.test(spokenCandidate)) problems.push({id:s.id,issue:'Digit encountered: manual Latin number expansion required; no automatic normalization'});
  if(/[?!;:]/u.test(spokenCandidate)) problems.push({id:s.id,issue:'Check interrogative/other punctuation prosody without adding spoken punctuation words'});
  return {
    sentence_id:s.id,
    display_text:displayed,
    speech_input_baseline:spokenCandidate,
    source_text_sha256:sha256(displayed),
    pronunciation_revision:null,
    model:null,
    voice:null,
    recording_file:null,
    timing_interval:null,
    generated:false,
    pronunciation_approved:false,
    review_notes:null
  };
});
const output={
  status:'RESEARCH_ONLY_NO_AUDIO_GENERATED',
  created_utc:'2026-11-07',
  locale_goal:'Reconstructed Classical Latin; expert review pending',
  chapter_id:lesson.id,
  chapter_review_status:lesson.status,
  source_relative:'lessons/legacy/ch01.json',
  source_sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  disclaimer:'Original display_text is authoritative. No syntax changes, automatic IPA, approval, or fake audio/timing.',
  number_of_sentences:entries.length,
  sentences:entries,
  flag_for_human_review:problems
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
