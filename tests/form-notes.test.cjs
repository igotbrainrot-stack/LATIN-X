"use strict";
/* Form notes (possible grammatical forms of each glossary word) and word-order tolerant grading. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const root=path.resolve(__dirname,"..");
execFileSync(process.execPath,[path.join(root,"scripts/build-form-notes.cjs"),"--check"],{stdio:"pipe"});
require(path.join(root,"content/form-notes.js"));
const notes=globalThis.TablinumFormNotes;
assert.equal(notes.status,"drafted_by_claude_not_reviewed","form notes must stay labelled as unreviewed until signed off");
const f=notes.forms;
// Every glossary form has a note, and none is empty.
const audit=JSON.parse(fs.readFileSync(path.join(root,"curriculum/lexicon/legacy-token-audit.json"),"utf8"));
for(const g of audit.glossary_candidates)for(const s of [g.headword_as_in_app,...g.documented_forms]){
 const n=f[s.normalize("NFC").toLowerCase()];
 assert(n,"no form note for "+s);
 assert(n.inv||(Array.isArray(n.is)&&n.is.length&&n.of),"empty form note for "+s);
}
// Spot checks. Ambiguous endings list every reading; the script never picks one.
assert.deepEqual(f["mātrī"].is,["dative singular"]);
assert.deepEqual(f["vīllae"].is,["genitive singular","dative singular","nominative plural"]);
assert.deepEqual(f["mēnsa"].is,["nominative singular"]);
assert.deepEqual(f["mēnsā"].is,["ablative singular"]);
assert.deepEqual(f["hortō"].is,["dative singular","ablative singular"]);
assert.deepEqual(f["mārce"].is,["vocative singular"]);
assert.deepEqual(f["it"].is,["3rd person singular, present"]);
assert.deepEqual(f["portābit"].is,["3rd person singular, future"]);
assert.deepEqual(f["dīxit"].is,["3rd person singular, perfect"]);
assert.deepEqual(f["bibit"].is,["3rd person singular, present","3rd person singular, perfect"]);
assert.deepEqual(f["in"],{inv:"preposition"});
// The app loads the file.
assert(fs.readFileSync(path.join(root,"index.html"),"utf8").includes('<script src="content/form-notes.js"></script>'));

// Grading: the words of an accepted answer in another order are accepted; other words are not.
const E=require(path.join(root,"app/50-exercises.js"));
const q=["Arbor magna est an parva?",null,["magna","magna est","arbor est magna"],"Arbor magna est."];
for(const ok of ["magna","Arbor magna est.","Magna est arbor","est magna","arbor magna est"])assert(E.gradeLegacy(q,ok),"should accept: "+ok);
for(const bad of ["parva","arbor parva est","magna arbor","est","arbor magna est est","arborem magna est"])assert(!E.gradeLegacy(q,bad),"should reject: "+bad);
console.log("PASS form notes: "+Object.keys(f).length+" forms current and labelled unreviewed; word-order grading checked.");
