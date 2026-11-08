"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
require("../content/music.js");
const score=require("../app/58-music-score.js");
const root=path.resolve(__dirname,".."),pieces=globalThis.TablinumMusic.pieces;
const metadata=JSON.parse(fs.readFileSync(path.join(root,"curriculum/music.json"),"utf8"));
assert.equal(pieces.length,4,"Three original melodies plus public-domain Seikilos");
assert(metadata.sources.some(x=>x.url?.includes("samlinger.natmus.dk")));
assert(metadata.sources.some(x=>x.url?.includes("Seikilos_score.png")));
for(const p of pieces){
 const performance=score.compile(p),melody=performance.events.filter(e=>e.role==="melody"),
  drone=performance.events.filter(e=>e.role==="drone");
 assert(performance.totalSeconds>=120&&performance.totalSeconds<=240,p.id+": total 2–4 minutes");
 assert(melody.length>30,p.id+": audible melody");
 assert(drone.length>25,p.id+": slowly re-plucked tonic/fifth drone");
 assert(performance.events.every(e=>Number.isFinite(e.at)&&e.at>=0&&Number.isFinite(e.midi)
  &&Number.isFinite(score.frequency(e.midi))&&Number.isFinite(e.seconds)&&e.seconds>0),
  p.id+": no NaN, negative time or invalid note");
 assert(performance.summaries.every(c=>c.lastSourceIndex===(p.degrees||p.notes).length-1),
  p.id+": last note of each phrase always plays");
 assert(performance.summaries[0].start===0,p.id+": first event starts at zero");
 assert(performance.summaries.every(c=>c.end>c.start),p.id+": positive duration with rests");
 assert(Math.max(...drone.map(e=>e.gain))<=.23*.32,"Drone should be about 30% of melody gain");
 if(p.kind==="original"){
  assert.deepEqual(performance.summaries.slice(0,4).map(x=>x.variant),
   ["plain","ornament","sparse","answer"],"Four distinct cycle variations");
  assert(melody.some(e=>e.cycle===2),"Sparse variant remains audible");
  for(let cycle=0;cycle<p.cycles;cycle++){
   const segment=melody.filter(e=>e.cycle===cycle);
   assert(segment.length>0&&segment.at(-1).midi===p.rootMidi,
    p.id+" cycle "+cycle+": final tonic must sound");
  }
  const counts=performance.summaries.map(x=>x.played);
  assert(new Set(counts).size>1,"Sparse performance must differ in note count");
  assert(performance.events.some(e=>e.role==="ornament"));
 }else{
  assert.equal(p.id,"seikilos-epitaph");
  assert.equal(p.notes.length,37);
  assert.equal(p.notes.reduce((sum,x)=>sum+x.beats,0),48,"Eight bars of 6/8 transcription");
  assert(p.notes[0].midi===69&&p.notes.at(-1).midi===64,"Source first A4 and final E4");
  assert.equal(performance.finalMelody.midi,64,"Historical final E must sound");
  assert.equal(melody.length,p.notes.length*p.cycles,"Never ornament or skip ancient pitch line");
  assert(performance.summaries.every(x=>x.variant==="source"));
 }
}
console.log("PASS Phase7 music: 4 source-attributed 2–4 min pieces, varied rhythms/drone, Seikilos 37 notes/48 pulses, no dropped final tonic.");
