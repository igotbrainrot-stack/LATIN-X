"use strict";
// Unicode Latin word boundaries; offsets are UTF-16 JS indices into the exact sentence.
function tokenize(text){if(typeof text!=="string")throw Error("text_la must be string");return [...text.matchAll(/\p{L}[\p{L}\p{M}]*/gu)].map(m=>({t:m[0],start:m.index,end:m.index+m[0].length}))}
function checkTokens(sentence,where,{legacy=false}={}){
 const words=tokenize(sentence.text_la);if(!Array.isArray(sentence.tokens))throw Error(`${where}: tokens[] missing`);
 if(words.length!==sentence.tokens.length)throw Error(`${where}: token count mismatch; text=${words.length} tags=${sentence.tokens.length}`);
 for(let i=0;i<words.length;i++){const w=words[i],t=sentence.tokens[i];if(!t||t.t!==w.t)throw Error(`${where}: token ${i+1} surface mismatch: expected ${w.t}, got ${t?.t}`);
 if(legacy){if(t.lx!==null)throw Error(`${where}: unreviewed legacy token cannot be approved as lx`);if(t.start!==w.start||t.end!==w.end)throw Error(`${where}: token offset mismatch`)}
 else if(t.lx!==null&&(typeof t.lx!=="string"||!/^lx-[a-z0-9-]+$/.test(t.lx)))throw Error(`${where}: bad lx on ${w.t}`);
 }
 return words.length;
}
// Morphology is an unordered map of UD key=value pairs, rejecting duplicates.
function parseMorph(s,where){if(typeof s!=="string"||!s.trim())throw Error(`${where}: missing morph features`);const out={};for(const f of s.split("|")){const m=/^([A-Za-z]+)=([A-Za-z0-9][A-Za-z0-9,]*)$/.exec(f);if(!m||Object.hasOwn(out,m[1]))throw Error(`${where}: bad UD morphology ${s}`);out[m[1]]=m[2]}return out}
function morphKey(s){return Object.entries(parseMorph(s,"morph")).sort((a,b)=>a[0].localeCompare(b[0])).map(([a,b])=>`${a}=${b}`).join("|")}
module.exports={tokenize,checkTokens,parseMorph,morphKey};
