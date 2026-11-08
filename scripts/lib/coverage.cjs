"use strict";
function checkCoverage(lesson,introduced,errors,warnings){
 let running=0,readingSentences=0,novel=0;const segmentRows=[];
 for(const seg of lesson.segments){let total=0,newTokens=0;const alreadyIntroduced=new Set(); // NEW-lexeme density counts each lexeme once per segment.
  for(const sent of seg.sentences){const tok=sent.tokens;total+=tok.length;readingSentences++;
   for(const t of tok){if(introduced.has(t.lx)&&!t.gloss_only&&!alreadyIntroduced.has(t.lx)){newTokens++;alreadyIntroduced.add(t.lx)}if(!t.lx&&!t.gloss_only&&!t.margin_gloss&&!t.proper_name)errors.push(`${lesson.id}/${sent.id}: untagged or unglossed reading token ${t.t}`)}
  }
  const density=total?newTokens/total:0,limit=lesson.book===1?.08:lesson.book===2?.10:.12;
  if(density>limit+1e-9)errors.push(`${lesson.id}/${seg.id}: newly introduced word density ${(100*density).toFixed(1)}% exceeds ${(100*limit).toFixed(0)}%`);
  segmentRows.push({segment:seg.id,words:total,new_word_tokens:newTokens,new_density_percent:+(density*100).toFixed(1)});
  running+=total;novel+=newTokens;
 }
 const target=lesson.target_running_tokens;
 if(Array.isArray(target)&&target.length===2){const [lo,hi]=target;
  if(running<lo*.9||running>hi*1.1)errors.push(`${lesson.id}: ${running} reading tokens outside stage target ${lo}–${hi} (10% tolerance)`);
  else if(running<lo||running>hi)warnings.push(`${lesson.id}: ${running} reading tokens just outside target ${lo}–${hi}`);
 }
 if(lesson.segments.length!==lesson.lesson_segments)errors.push(`${lesson.id}: expected ${lesson.lesson_segments} reading segments, got ${lesson.segments.length}`);
 const cap=lesson.chapter<=10?7:lesson.chapter<=50?10:lesson.chapter<=90?14:18;
 const mean=running/Math.max(1,readingSentences);
 if(mean>cap)errors.push(`${lesson.id}: mean sentence length ${mean.toFixed(1)} exceeds stage cap ${cap}`);
 return {reading_tokens:running,mean_sentence_length:+mean.toFixed(1),novel_tokens:novel,segments:segmentRows};
}
module.exports={checkCoverage};
