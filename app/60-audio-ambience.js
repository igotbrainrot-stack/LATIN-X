/* Phase7a: offline original music and unobtrusive clicks, Web Audio only.
 * Context is created only inside a real user gesture. No request/fetch/audio files. */
(function(root){
"use strict";
const defs={music:true,musicVolume:0.2,sfx:true,sfxVolume:0.4};
const pieces=root.TablinumMusic?.pieces||[];
const score=root.TablinumMusicScore;
if(!score||typeof score.compile!=="function")throw Error("Offline rhythmic music score compiler missing");
let settings={...defs},persist=()=>{},ctx=null,musicBus=null,fxBus=null,timer=null;
let activated=false,narrating=false,recording=false,streams=[],playlist=[],previousPiece=-1,lastTick=0,disabled=false;
function nextTrack(){
 if(!playlist.length){
  playlist=pieces.map((p,i)=>i);
  for(let i=playlist.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[playlist[i],playlist[j]]=[playlist[j],playlist[i]]}
  if(playlist.length>1&&playlist[0]===previousPiece)[playlist[0],playlist[1]]=[playlist[1],playlist[0]];
 }
 previousPiece=playlist.shift();return pieces[previousPiece];
}
const displayed=()=>typeof document==="object"&&!document.hidden;
function clamp(n,def){n=Number(n);return Number.isFinite(n)?Math.min(1,Math.max(0,n)):def}
function normalize(x){return {music:x?.music!==false,musicVolume:clamp(x?.musicVolume,0.2),
 sfx:x?.sfx!==false,sfxVolume:clamp(x?.sfxVolume,0.4)}}
function gain(v,t=0.2){
 if(!ctx||!musicBus)return;
 const target=activated&&!recording&&displayed()&&settings.music?
  Math.max(0,Math.min(0.3,settings.musicVolume))*(narrating?0.1:1):0;
 musicBus.gain.setTargetAtTime(target,ctx.currentTime,t);
}
function seedNoise(n){let x=n|0;return ()=>{x=Math.imul(x^x>>>15,1|x);x^=x+Math.imul(x^x>>>7,61|x);return (((x^x>>>14)>>>0)/4294967296)*2-1}}
function pluck(freq,when,duration,loudness,bus,seed){
 if(!ctx||!bus||!(freq>0)||!Number.isFinite(when))return;
 const sampleRate=ctx.sampleRate||44100,len=Math.floor(sampleRate*Math.max(0.1,Math.min(1.5,duration)));
 const wave=ctx.createBuffer(1,len,sampleRate),data=wave.getChannelData(0),period=Math.max(4,Math.round(sampleRate/freq));
 const ring=new Float32Array(period),rand=seedNoise(seed|0);
 for(let i=0;i<period;i++)ring[i]=rand()*0.65;
 for(let i=0;i<len;i++){const k=i%period,a=ring[k],b=ring[(k+1)%period];
  data[i]=a;ring[k]=(a+b)*0.5*0.994;
 }
 const source=ctx.createBufferSource(),envelope=ctx.createGain();
 source.buffer=wave;source.connect(envelope);envelope.connect(bus);
 const start=Math.max(when,ctx.currentTime+0.004),end=start+len/sampleRate;
 envelope.gain.setValueAtTime(0.0001,start);
 envelope.gain.linearRampToValueAtTime(Math.max(0.0001,loudness),start+0.014);
 envelope.gain.exponentialRampToValueAtTime(0.0001,end);
 source.start(start);source.stop(end+0.01);
 source.onended=()=>{try{source.disconnect();envelope.disconnect()}catch(e){}};
}
function makeStream(at){
 if(!ctx||!pieces.length)return;
 const p=nextTrack(),plan=score.compile(p);
 const ending=at+plan.totalSeconds,bus=ctx.createGain();bus.connect(musicBus);
 bus.gain.setValueAtTime(0,at);
 bus.gain.linearRampToValueAtTime(1,at+4);
 bus.gain.setValueAtTime(1,Math.max(at+4,ending-4));
 bus.gain.linearRampToValueAtTime(0,ending);
 streams.push({p,bus,plan,start:at,end:ending,index:0,total:plan.events.length});
}
function schedule(){
 if(!ctx||ctx.state!=="running"||!settings.music||recording||!displayed())return;
 if(!streams.length)makeStream(ctx.currentTime+0.1);
 const horizon=ctx.currentTime+2.5;
 for(const stream of streams){
  // Every scheduled event uses its actual 0-based score index, including
  // the first and final tonic; there is no i-1 indexing or dropped note.
  while(stream.index<stream.total&&stream.start+stream.plan.events[stream.index].at<horizon){
   const event=stream.plan.events[stream.index++];
   const when=stream.start+event.at;
   pluck(score.frequency(event.midi),when,event.seconds,event.gain,stream.bus,
    1234+stream.index*31+Math.round(event.at*13));
  }
 }
 const last=streams[streams.length-1];
 if(last&&horizon>=last.end-4)makeStream(last.end-4);
 streams=streams.filter(st=>{
  if(ctx.currentTime>st.end+1){try{st.bus.disconnect()}catch(e){}return false}
  return true;
 });
}
function resumeLoop(){
 if(!ctx||disabled)return;
 if(ctx.state==="suspended"){const p=ctx.resume();if(p&&p.catch)p.catch(()=>{});}
 if(!timer)timer=setInterval(schedule,350);
 gain(settings.musicVolume);
}
function stopLoop(){
 if(timer){clearInterval(timer);timer=null}
 gain(0);
}
function activate(){
 if(activated||disabled)return;
 activated=true;
 const Constructor=root.AudioContext||root.webkitAudioContext;
 if(typeof Constructor!=="function"){disabled=true;return}
 try{
  ctx=new Constructor();musicBus=ctx.createGain();fxBus=ctx.createGain();
  musicBus.gain.value=0;fxBus.gain.value=0.3;
  musicBus.connect(ctx.destination);fxBus.connect(ctx.destination);
  if(settings.music)resumeLoop();
 }catch(error){ctx=null;disabled=true}
}
function sound(type="tick"){
 if(!settings.sfx||!ctx||ctx.state!=="running"||recording)return;
 const now=ctx.currentTime;
 if(now-lastTick<0.06)return;lastTick=now;
 const v=settings.sfxVolume*0.12;
 if(type==="correct"){pluck(440,now,0.20,v,fxBus,41);pluck(587.33,now+0.10,0.20,v,fxBus,43)}
 else if(type==="wrong"){pluck(174.61,now,0.19,v*0.7,fxBus,45)}
 else if(type==="complete"){[392,493.88,587.33].forEach((f,i)=>pluck(f,now+i*.09,.21,v,fxBus,60+i))}
 else pluck(330,now,0.073,v*0.6,fxBus,19);
}
function configure(value,save){
 settings=normalize(value);
 if(typeof save==="function")persist=save;
 syncControls();
 if(activated){if(settings.music)resumeLoop();else stopLoop()}
}
function set(patch){
 settings=normalize({...settings,...patch});
 persist(settings);
 configure(settings,persist);
}
function duck(on){narrating=!!on;gain(settings.musicVolume,0.12)}
function setRecording(on){recording=!!on;if(recording)stopLoop();else if(activated&&settings.music)resumeLoop()}
function syncControls(){
 if(typeof document!=="object")return;
 const music=document.getElementById("music-toggle"),sfx=document.getElementById("sfx-toggle");
 if(music){music.textContent=settings.music?"♪ Music on":"♪ Music off";music.setAttribute("aria-pressed",String(settings.music))}
 if(sfx){sfx.textContent=settings.sfx?"Clicks on":"Clicks off";sfx.setAttribute("aria-pressed",String(settings.sfx))}
 const v=document.getElementById("music-volume"),f=document.getElementById("sfx-volume");
 if(v)v.value=String(settings.musicVolume);if(f)f.value=String(settings.sfxVolume);
}
function installControls(){
 if(typeof document!=="object"||!document.querySelector)return;
 const header=document.querySelector("header");if(!header||document.getElementById("music-toggle"))return;
 const div=document.createElement("div");div.id="ambience-controls";
 div.style.cssText="display:flex;align-items:center;flex-wrap:wrap;gap:5px;max-width:510px;font-size:11px";
 div.innerHTML='<button id="music-toggle" type="button" class="btn" data-audio-music aria-label="Toggle background music">♪ Music on</button>'+
 '<label for="music-volume">Music</label><input type="range" id="music-volume" min="0" max="1" step=".05" value=".2" style="width:65px" aria-label="Background music volume">'+
 '<button id="sfx-toggle" type="button" class="btn" data-audio-sfx aria-label="Toggle click sounds">Clicks on</button>'+
 '<label for="sfx-volume">Clicks</label><input type="range" id="sfx-volume" min="0" max="1" step=".05" value=".4" style="width:65px" aria-label="Click sound volume">'+
 '';
 header.appendChild(div);syncControls();
}
if(typeof document==="object"){
 installControls();
 document.addEventListener("pointerdown",activate,{capture:true});
 document.addEventListener("keydown",activate,{capture:true});
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden){stopLoop();if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{})}
  else if(activated&&settings.music)resumeLoop();
 });
}
root.TablinumAmbience=Object.freeze({defaults:defs,configure,set,activate,sound,duck,setRecording,
 debug:()=>({activated,hasAudioContext:!!ctx,playing:!!timer,ducked:narrating,recording,settings:{...settings}})});
})(globalThis);
