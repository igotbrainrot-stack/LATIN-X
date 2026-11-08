/* Score compiler: rhythmic notes, rests, four nonidentical original variations
 * and independently voiced quiet tonic/fifth drone. No music networking.
 * Historical Seikilos melody is kept intact; only synthesized accompaniment
 * is a modern, interpretative choice (the ancient instrument is not attested). */
(function(root){
"use strict";
function frequency(midi){return 440*Math.pow(2,(midi-69)/12)}
function degreeMidi(piece,degree){
 if(!Number.isFinite(degree)||!Array.isArray(piece.scale)||!piece.scale.length)return NaN;
 const size=piece.scale.length,octave=Math.floor(degree/size),index=((degree%size)+size)%size;
 return piece.rootMidi+piece.scale[index]+12*octave;
}
function compile(piece){
 if(!piece||!Number.isFinite(piece.stepSeconds)||piece.stepSeconds<=0||
    !Number.isInteger(piece.cycles)||piece.cycles<1||piece.cycles>16)
  throw Error("Invalid music source");
 const original=piece.kind==="original",historical=piece.kind==="ancient-public-domain";
 if(!original&&!historical)throw Error("Unsupported provenance for music score");
 if(original&&(!Array.isArray(piece.degrees)||piece.degrees.length!==piece.durations?.length))
  throw Error("Original score durations must match every note");
 if(historical&&(!Array.isArray(piece.notes)||!piece.notes.length))throw Error("Ancient score has no notes");
 const out=[],summaries=[],beat=piece.stepSeconds,rest=Number(piece.restBeats)||0;
 let cursor=0;
 const tones=original?piece.degrees.map((degree,i)=>({degree,beats:piece.durations[i]})):piece.notes;
 for(let cycle=0;cycle<piece.cycles;cycle++){
  const variant=historical?"source":(["plain","ornament","sparse","answer"][cycle%4]);
  const start=cursor,indices=[];
  for(let j=0;j<tones.length;j++){
   const item=tones[j],pitches=historical?item.midi:degreeMidi(piece,item.degree);
   const beats=Number(item.beats);
   if(!Number.isFinite(beats)||beats<=0||!Number.isFinite(pitches))throw Error("Invalid note "+j);
   let shouldPlay=true;
   if(original&&variant==="sparse"&&j%2===1&&j!==tones.length-1)shouldPlay=false;
   const midi=historical?pitches:pitches+(variant==="answer"&&j%8===6&&j!==tones.length-1?12:0);
   if(shouldPlay){
    out.push({at:cursor,seconds:Math.min(beats*beat*0.93,2.2),midi,
     role:"melody",gain:variant==="sparse"?0.18:0.23,cycle,sourceIndex:j});
    indices.push(j);
   }
   if(original&&variant==="ornament"&&j%7===3&&beats>=1.5&&j!==tones.length-1){
    out.push({at:cursor+beats*beat*0.65,seconds:Math.min(.32,beats*beat*.3),
     midi:degreeMidi(piece,item.degree+1),role:"ornament",gain:.075,cycle,sourceIndex:j});
   }
   cursor+=beats*beat;
  }
  // Real silence between phrases, not a musical note encoded as pitch zero.
  cursor+=rest*beat;
  summaries.push({cycle,variant,start,end:cursor,played:indices.length,
   lastSourceIndex:indices.at(-1)});
 }
 // Slowly re-plucked tonic + fifth, about 30% of a melody string's gain.
 // Historical accompaniment is a contemporary interpretation; not claimed as
 // an original ancient instrumentation choice.
 const tonic=historical?52:piece.rootMidi-12;
 for(let t=0;t<cursor;t+=6*beat){
  out.push({at:t,seconds:Math.min(3.1,5.5*beat),midi:tonic,
   role:"drone",gain:.062});
  out.push({at:t+beat*.05,seconds:Math.min(3.1,5.5*beat),midi:tonic+7,
   role:"drone",gain:.050});
 }
 out.sort((a,b)=>a.at-b.at|| (a.role==="drone"?1:-1));
 return Object.freeze({events:out,totalSeconds:cursor,summaries,pieceId:piece.id,
  finalMelody:out.filter(x=>x.role==="melody").at(-1)});
}
const api=Object.freeze({compile,frequency,degreeMidi});
root.TablinumMusicScore=api;
if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(globalThis);
