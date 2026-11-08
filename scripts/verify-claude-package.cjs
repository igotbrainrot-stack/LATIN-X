"use strict";
/* Verifies that the full Claude handoff contains the runnable app and its
 * review sources, and has not silently promoted any human approval. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const required=[
 "PHASE8_MUSIC_CHARACTER_CLAUDE_HANDOVER.md","Art Review.html","Start Art Review.cmd",
 "docs/art/PILOT_SCENE_PROMPTS.md","app/58-music-score.js","app/64-art-scenes.js",
 "content/illustrations.js","scripts/build-illustrations.cjs","assets/art/b01/README.md",
 "tests/phase7-music-score.test.cjs","tests/phase8-art-gates.test.cjs","tests/phase8-art-browser.test.cjs",
 ".github/workflows/phase8-music-art.yml",
 "PHASE7B_CLAUDE_HANDOVER.md","docs/claude/PHASE6_REVIEW_FOR_GPT.md",
 "app/70-user-media.js","tests/phase6-claude-fixes.test.cjs",
 "tests/phase7b-user-media.test.cjs","tests/phase7b-browser.test.cjs",
 ".github/workflows/phase7b-reviewed.yml",
 "curriculum/illustrations.json","scripts/check-illustrations.cjs","tests/illustrations-plan.test.cjs",
 "PHASE7A_CLAUDE_HANDOVER.md","content/music.js","curriculum/music.json",
 "app/60-audio-ambience.js","tests/phase7a-audio.test.cjs","tests/phase7a-browser.test.cjs",
 ".github/workflows/phase7a-music-sfx.yml",
 "PHASE6_CLAUDE_HANDOVER.md","docs/claude/PHASE5_REVIEW_FOR_GPT.md",
 "docs/owner/AUDIO_AND_ART_REQUIREMENTS.md","vendor/ts-fsrs.umd.js","vendor/ts-fsrs.LICENSE",
 "vendor/ts-fsrs-manifest.json","app/55-review-deck.js",
 "tests/phase6-fsrs.test.cjs","tests/phase6-browser.test.cjs","scripts/vendor-fsrs.cjs",
 "PHASE5_CLAUDE_HANDOVER.md","docs/claude/PHASE4_IMPORT_REVIEW_FOR_GPT.md",
 "app/50-exercises.js","scripts/lib/exercise-distractors.cjs","scripts/check-claude-pilot.py",
 "tests/exercise-engine.test.cjs","tests/phase5-keyboard-browser.test.cjs",
 ".github/workflows/phase5-exercises.yml",
 "PHASE4_PILOT_CLAUDE_HANDOVER.md","docs/pilot/CLAUDE_PILOT_B01_C001_C008.md",
 "docs/pilot/PILOT_NOTE_FOR_GPT.md","docs/claude/PHASE3C_REVIEW_FOR_GPT.md",
 "scripts/import-claude-pilot.cjs","scripts/pilot-metrics.cjs",
 "scripts/lib/pilot-grammar.cjs","tests/pilot-text.test.cjs",
 "tests/phase3c-review.test.cjs","tests/phase3c-review-browser.test.cjs",
 "reports/pilot-metrics.md","lessons/b01/c001.json","lessons/b01/c008.json",
 "index.html","app/20-state-v5.js","content/migration-maps.js","scripts/render-migration-maps.cjs","tests/migration.test.cjs","tests/phase3c-browser.test.cjs",".github/workflows/phase3c-state-migration.yml","PHASE3C_CLAUDE_HANDOVER.md","docs/claude/PHASE3B_REVIEW_FOR_GPT.md","app/30-content-loader.js","tests/content-loader.test.cjs","tests/phase3b-browser.test.cjs","PHASE3B_CLAUDE_HANDOVER.md","docs/claude/PHASE3A_REVIEW_FOR_GPT.md","app/legacy-runtime.js","archive/index-v04-inline-phase3a-baseline.html",
 "tests/phase3a-relocation.test.cjs","PHASE3A_CLAUDE_HANDOVER.md","Start Tablinum.cmd","Vocabulary Review.html",
 "scripts/compile-content.cjs","scripts/legacy-to-lesson.cjs",
 "scripts/render-paradigm-samples.cjs","docs/owner/PARADIGM_SAMPLES.md",
 "PHASE2_RECONCILED_HANDBACK.md","GPT_HANDOVER_NEXT_PHASES.md",
 "lessons/legacy/ch01.json","lessons/legacy/ch08.json",
 "content/catalogue.js","content/lexicon.js","content/legacy/ch01.js","content/legacy/ch08.js",
 "tests/compiler.test.cjs","curriculum/recurrence-thresholds.json",
 "Create Claude Review Package.cmd",".github/workflows/claude-package.yml",
 "Start Vocabulary Review.cmd","Validate Vocabulary CSV.cmd",
 "archive/index-v02-original.html","package.json",
 "scripts/registry-review-sheet.cjs","scripts/lib/review-workflow.cjs",
 "scripts/lib/grammar.cjs","scripts/lib/paradigms.cjs",
 "curriculum/vocabulary-budgets-130.json",
 "curriculum/vocabulary-introductions-130.json",
 "curriculum/grammar-features.json",
 "curriculum/lexicon/lexemes.json",
 "curriculum/lexicon/review-sheets/legacy-candidates.csv",
 "curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv",
 "curriculum/CURRICULUM_130_MASTER_PLAN.md",
 "CLAUDE_IMPLEMENTATION_ROADMAP.md",
 "PHASE2_REVIEW_RESTORATION_HANDBACK.md",
 "tests/smoke.test.cjs","tests/file-url-smoke.cjs",
 "tests/review-file-url.test.cjs","tests/grammar-gate.test.cjs",
 "tests/paradigms.test.cjs","tests/offline-vocabulary-review.test.cjs",
 ".github/workflows/phase2-review-restoration.yml",
 "CLAUDE_REVIEW_PACKAGE/00_START_HERE.md",
 "CLAUDE_REVIEW_PACKAGE/01_REVIEW_PROMPT.md",
 "CLAUDE_REVIEW_PACKAGE/02_IMPLEMENTATION_MATRIX.md",
 "CLAUDE_REVIEW_PACKAGE/03_TESTING_AND_DELIVERY.md",
 "CLAUDE_REVIEW_PACKAGE/04_PREVIOUS_PHASE2_COMPILER_HANDOVER.md",
 "CLAUDE_REVIEW_PACKAGE/05_CLAUDE_PHASE2_FIXES_ORIGINAL.md"
];
for(const name of required){
 const file=path.join(root,name);
 assert(fs.existsSync(file)&&fs.statSync(file).isFile(),"Missing full-package file: "+name);
 assert(fs.statSync(file).size>0,"Empty full-package file: "+name);
}
const plan=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-budgets-130.json"),"utf8"));
assert.equal(plan.chapters.length,130);
const registry=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/lexemes.json"),"utf8"));
assert.equal(registry.lexemes.length,0,"Do not claim human lexical approvals");
const ledger=JSON.parse(fs.readFileSync(path.join(root,"curriculum/vocabulary-introductions-130.json"),"utf8"));
assert.equal(ledger.introduced_lexemes.length,0,"Do not fabricate new course introductions");
const {parseCsv}=require("./lib/review-csv.cjs");
const {HEADERS}=require("./lib/review-workflow.cjs");
const source=path.join(root,"curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv");
const doc=parseCsv(fs.readFileSync(source,"utf8"));
assert.deepEqual(doc.headers,HEADERS);
assert.equal(doc.records.length,128);
assert.equal(new Set(doc.records.map(x=>x.candidate_id)).size,128);
for(const row of doc.records){
 for(const field of ["decision","reviewer","reviewed_at","macron_reviewed"]){
  assert.equal(row[field],"","No owner signatures or approvals allowed in draft: "+row.candidate_id+"."+field);
 }
}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert(html.includes('<script src="app/legacy-runtime.js"></script>'),"Expected local classic script");
assert(html.includes('<script src="content/catalogue.js"></script>'),"Compiled content catalogue must load locally");
assert(html.includes('<script src="app/30-content-loader.js"></script>'),"Offline chapter loader must be available");
assert(html.indexOf('<script src="content/catalogue.js"></script>')<html.indexOf('<script src="app/legacy-runtime.js"></script>'),"Catalogue must load before runtime");
const runtime=fs.readFileSync(path.join(root,"app/legacy-runtime.js"),"utf8");
assert(runtime.includes("const L="),"Original 8-chapter runtime data missing");
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
for(const task of ["test","test:lexemes","test:review","test:grammar","test:paradigms","test:file","test:review-browser"])
 assert(typeof pkg.scripts[task]==="string","Missing test script "+task);
console.log("PASS: full Claude review source package has "+required.length+" required nonempty files.");
console.log("PASS: 8-chapter offline source, 130 planned chapters, 128 unsigned Claude candidates and zero approved new lessons.");
console.log("PASS: reconciled Phase 2 compiler and reviewed-source catalogue are included alongside the owner-review tools.");
