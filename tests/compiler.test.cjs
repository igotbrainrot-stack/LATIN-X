"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {compile,writeOrCheck}=require('../scripts/compile-content.cjs');
const {generate}=require('../scripts/legacy-to-lesson.cjs');
const {scaffold}=require('../scripts/new-lesson-draft.cjs');
const {tokenize}=require('../scripts/lib/tokens.cjs');
const {readLegacySource}=require('../scripts/lib/extract-legacy.cjs');
const root=path.resolve(__dirname,'..');
const clone=x=>JSON.parse(JSON.stringify(x));
const examples=generate();assert.equal(examples.length,8);
const original=readLegacySource(root);
assert.equal(examples.reduce((a,l)=>a+l.sentences.length,0),67);
for(const [i,l] of examples.entries())assert.equal(JSON.stringify(l),JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'lessons/legacy',`ch${String(i+1).padStart(2,'0')}.json`),'utf8'))));
const originalLedger=JSON.parse(fs.readFileSync(path.join(root,'curriculum/vocabulary-introductions-130.json'),'utf8'));
assert.equal(originalLedger.introduced_lexemes.length,0);
const built=compile();assert.equal(built.stats.legacy,8);assert.equal(built.stats.introduced,0);assert.equal(built.stats.approved,0);
const chapterOne=JSON.parse(fs.readFileSync(path.join(root,'lessons/b01/c001.json'),'utf8'));
assert.equal(chapterOne.status,'draft');assert.equal(chapterOne.id,'b01-c001');assert.equal(chapterOne.segments.length,2);
assert(chapterOne.segments[0].sentences.length>0,'Chapter 1 must contain original Claude manuscript lines');
assert.equal(scaffold(130,require('../curriculum/vocabulary-budgets-130.json')).id,'b03-c130');
assert.equal(built.stats.draft,8,'All eight Claude manuscript chapters remain drafts, not approved learner chapters');
writeOrCheck(built,root,true);
assert.equal(built.outputs.get('curriculum/vocabulary-introductions-130.json'),fs.readFileSync(path.join(root,'curriculum/vocabulary-introductions-130.json'),'utf8'));
// Each signed "review" in the following fixture is synthetic and kept ONLY in memory.
const sign={reviewed_by:'Fixture Reviewer',reviewed_at:'2026-11-05',review_tier:'latinist',candidate_id:'fixture-only'};
const lexical=(id,head,pos,forms)=>({id,head,pos,status:'approved',senses:[{sense_id:'fixture',gloss_en:'TEST FIXTURE ONLY'}],homograph_of:[],
 sources:[{source_id:'fixture',locator:'unit-test',license_id:'MIT-test'}],macron_authority:'fixture only',macron_reviewed:true,
 reviewed_by:'Fixture Reviewer',reviewed_at:'2026-11-05',review_tier:'latinist',review_records:[sign],forms,
 ...(pos==='noun'?{declension:3,gender:'f',principal_parts:'arbor, arboris'}:{conjugation:'irregular',principal_parts:'sum, esse, fuī'})});
const verbMorph='Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act',nounMorph='Case=Nom|Number=Sing';
const registry={schema:'tablinum-lexemes-v1',lexemes:[
 lexical('lx-est-be','sum','verb',[{surface:'Est',morph:verbMorph,reviewed:true},{surface:'est',morph:verbMorph,reviewed:true}]),
 lexical('lx-arbor-tree','arbor','noun',[{surface:'arbor',morph:nounMorph,reviewed:true}])
]};
function sentence(n){const id=`b01-c001-s${String(n).padStart(3,'0')}`,text_la='Est arbor est arbor est arbor.';
 return {id,text_la,en:'SYNTHETIC SOFTWARE TEST — NOT COURSE LATIN',tokens:tokenize(text_la).map((w,i)=>({t:w.t,lx:i%2?'lx-arbor-tree':'lx-est-be',morph:i%2?nounMorph:verbMorph}))};}
const lesson={schema:'tablinum-lesson-v1',id:'b01-c001',chapter:1,book:1,is_review:false,title:'In hortō',subtitle_la:'TEST ONLY',status:'approved',
 review:{latin:{by:'Fixture Reviewer',at:'2026-11-05',tier:'latinist'},pedagogy:{by:'Fixture Editor',at:'2026-11-05'}},
 budget_ref:'curriculum/vocabulary-budgets-130.json#1',new_lexemes_declared:['lx-est-be','lx-arbor-tree'],
 grammar_new:['n.nom.sg','v.sum.pres.3sg'],target_running_tokens:[250,360],lesson_segments:2,
 segments:[{id:'b01-c001-l1',sentences:Array.from({length:25},(_,i)=>sentence(i+1))},
 {id:'b01-c001-l2',sentences:Array.from({length:25},(_,i)=>sentence(i+26))}],exercises:[],speaking:[]};
const options=(l=lesson,r=registry)=>({lessons:[{path:'lessons/b01/c001.json',data:l}],registry:r,legacyHTML:null});
const r=compile(options());assert.equal(r.stats.approved,1);assert.equal(r.stats.introduced,2);
const entry=JSON.parse(r.outputs.get('curriculum/vocabulary-introductions-130.json'));
assert.equal(entry.introduced_lexemes.length,2);assert.equal(entry.introduced_lexemes[0].sentence_id,'b01-c001-s001');
assert.equal(entry.introduced_lexemes[0].review_tier,'latinist');
assert(r.outputs.get('reports/recurrence.md').includes('PENDING_UNWRITTEN_CHAPTERS'),'Unwritten followup is never a PASS');
function rejects(mutator,pattern,reg=registry){const item=clone(lesson);mutator(item);assert.throws(()=>compile(options(item,reg)),pattern)}
rejects(l=>l.segments[0].sentences[0].tokens[0].t='Hortus',/token 1 surface mismatch/);
rejects(l=>l.segments[0].sentences[1].id=l.segments[0].sentences[0].id,/duplicate ID/);
rejects(l=>l.segments[0].sentences[0].tokens[0].lx='lx-fake-fake',/unapproved lexeme/);
rejects(l=>l.new_lexemes_declared=['lx-est-be'],/new_lexemes_declared/);
rejects(l=>l.grammar_new=['n.gen.sg'],/belongs to another chapter/);
rejects(l=>l.review.latin.at=null,/requires genuine signed Latin review/);
rejects(l=>l.segments[0].sentences[0].tokens[0].morph='Case=Nom|Number=Sing',/no reviewed surface\+morphology/);
rejects(l=>{for(const s of l.segments[0].sentences.slice(1))s.tokens.forEach(t=>{t.lx='lx-arbor-tree';t.morph=nounMorph})},/no reviewed surface\+morphology/);
rejects(l=>l.segments[0].sentences[0].tokens[0].lx='lx-another',/unapproved lexeme/);
rejects(l=>l.segments[0].sentences[0].preview=['v.subj.pres'],/grammar preview needs an explicit Latin margin gloss/);
rejects(l=>l.segments[0].sentences[0].tokens[0].morph='Mood=Sub|Tense=Pres',/no reviewed surface\+morphology|feature v.subj.pres/);
// Drafts may contain unresolved lx suggestions; they must never be emitted or counted.
const draft=clone(lesson);draft.status='draft';draft.review={latin:{by:null,at:null},pedagogy:{by:null,at:null}};
draft.segments[0].sentences[0].tokens[0].lx='lx-unreviewed-fixture';
const d=compile(options(draft,{schema:'tablinum-lexemes-v1',lexemes:[]}));
assert.equal(d.stats.draft,1);assert.equal(d.stats.introduced,0);
assert(!d.outputs.has('content/b01/c001.js'),'Unreviewed draft must never emit a browser chapter');
assert.equal(JSON.parse(d.outputs.get('curriculum/vocabulary-introductions-130.json')).introduced_lexemes.length,0);
assert.deepEqual([...compile(options()).outputs.entries()],[...r.outputs.entries()],'Compiling identical source must be byte-deterministic');
assert.throws(()=>compile({...options(),retired:{schema:'tablinum-retired-ids-v1',ids:['b01-c001-s001']}}),/retired ID reused/);
rejects(l=>{l.exercises=[{id:'b01-c001-q001',prompt_la:'Est arbor.',tokens:[{t:'Est',lx:'lx-est-be',morph:verbMorph},{t:'arbor',lx:'lx-new-exercise',morph:nounMorph}]}]},/exercise-only or unapproved word/);
rejects(l=>l.segments[0].sentences[0].tokens[1].proper_name=true,/incorrectly marked as a proper name/);
assert.throws(()=>compile({lessons:[{path:'lessons/legacy/ch01.json',data:{...clone(examples[0]),legacy_source:{...clone(examples[0].legacy_source),name:'Tampered'}}}],legacyHTML:original}),/original legacy lesson changed/);

// Strict integrated compiler negative tests, not just helper-unit assertions.
rejects(l=>{
 l.segments[0].sentences[0].tokens[0].morph='Mood=Sub|Number=Sing|Person=3|Tense=Pres|Voice=Act';
},/not introduced until chapter 50|grammar feature v\.subj\.pres\.act/);
rejects(l=>{
 l.segments[0].sentences[0].tokens[0].morph='Mood=Ind|Number=Sing|Person=3|Tense=Future|Voice=Pass';
},/unmapped morphology/);
rejects(l=>{
 l.segments[0].sentences[0].tokens[0].morph='VerbalUnknown=true';
},/unmapped morphology/);
const chapter3=clone(lesson),plan3=require('../curriculum/vocabulary-budgets-130.json').chapters[2];
chapter3.chapter=3;chapter3.id='b01-c003';chapter3.title=plan3.title;
chapter3.budget_ref='curriculum/vocabulary-budgets-130.json#3';
chapter3.grammar_new=[];chapter3.new_lexemes_declared=['lx-est-be','lx-arbor-tree'];
for(let ix=0;ix<chapter3.segments.length;ix++){
 const seg=chapter3.segments[ix];seg.id='b01-c003-l'+String(ix+1);
 for(let j=0;j<seg.sentences.length;j++)seg.sentences[j].id='b01-c003-s'+String(ix*25+j+1).padStart(3,'0');
}
chapter3.segments[0].sentences[0].tokens[0].morph='Mood=Ind|Number=Sing|Person=3|Tense=Imp|Voice=Act';
assert.throws(()=>compile(options(chapter3)),/unmapped morphology|not introduced until chapter 22|not introduced until chapter 23/,
 'Chapter 3 with imperfect verb must not compile');
const badPattern=clone(registry);
badPattern.lexemes.find(x=>x.id==='lx-arbor-tree').forms_policy='regular';
assert.throws(()=>compile(options(lesson,badPattern)),/no owner-approved paradigm table/,
 'Unsigned generated regular forms must not certify approved lessons');
console.log('PASS: Phase 2 old-lesson roundtrip, deterministic output, signed synthetic checks, draft exclusion, retired IDs, exercise-only vocabulary guard, grammar/form checks.');
