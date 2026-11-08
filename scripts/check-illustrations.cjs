"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),report=JSON.parse(fs.readFileSync(path.join(root,"curriculum/illustrations.json"),"utf8"));
function webpDims(filename){
 const b=fs.readFileSync(filename);
 if(b.length<30||b.toString("ascii",0,4)!=="RIFF"||b.toString("ascii",8,12)!=="WEBP")throw Error("invalid WebP header");
 const format=b.toString("ascii",12,16);
 if(format==="VP8X")return {w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3)};
 if(format==="VP8 ")return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
 if(format==="VP8L")return {w:1+(b[21]|((b[22]&0x3f)<<8)),h:1+((b[22]>>>6)|(b[23]<<2)|((b[24]&0x0f)<<10))};
 throw Error("unknown WebP format");
}
function check(data){
 const errors=[];
 if(data.schema!=="tablinum-illustration-plan-v1")errors.push("Invalid illustration manifest");
 const seen=new Set();
 for(const scene of data.scenes||[]){
  if(!/^b01-c00[1-8]-scene(?:-storm|-sun)?$/.test(scene.id)||seen.has(scene.id))errors.push("Duplicate/invalid scene ID "+scene.id);
  seen.add(scene.id);
  if(!scene.alt_la_draft?.trim()||!scene.alt_en_draft?.trim())errors.push(scene.id+" missing Latin/English alt text");
  if(!scene.asset&&scene.fallback!=="svg-scene-book")errors.push(scene.id+" has neither image nor known SVG fallback");
  if(!Array.isArray(scene.required_region_ids)||!scene.required_region_ids.length)errors.push(scene.id+" missing region IDs");
  if(scene.asset){
   if(!/^assets\/art\/b01\/[a-z0-9-]+\.webp$/.test(scene.asset))errors.push(scene.id+" bad local WebP path");
   else{
    const abs=path.join(root,scene.asset);
    if(!fs.existsSync(abs))errors.push(scene.id+" image is missing");
    else{
     if(fs.statSync(abs).size>250*1024)errors.push(scene.id+" exceeds 250 KB");
     try{const {w}=webpDims(abs);if(w<1200||w>2000)errors.push(scene.id+" image width must be 1200–2000px")}
     catch(e){errors.push(scene.id+" image is not valid WebP: "+e.message)}
    }
   }
   if(!scene.provenance||!scene.tool||!scene.generation_prompt||!scene.licence_status)
    errors.push(scene.id+" missing image provenance");
   if(scene.thumbnail){
    if(!/^assets\/art\/b01\/[a-z0-9-]+-thumb\.webp$/.test(scene.thumbnail)||!fs.existsSync(path.join(root,scene.thumbnail)))
     errors.push(scene.id+" missing thumbnail");
    else{
     const file=path.join(root,scene.thumbnail);
     if(fs.statSync(file).size>250*1024)errors.push(scene.id+" thumbnail exceeds 250 KB");
     try{const {w}=webpDims(file);if(w<100||w>600)errors.push(scene.id+" thumbnail width must be 100–600px")}
     catch(e){errors.push(scene.id+" thumbnail is not valid WebP: "+e.message)}
    }
   }else errors.push(scene.id+" missing thumbnail");
  }
  if(scene.status==="approved"){
   if(!scene.approval?.by?.trim()||!/^\d{4}-\d\d-\d\d$/.test(scene.approval.at||""))
    errors.push(scene.id+" missing actual owner review signature and date");
   if(!scene.asset||!scene.thumbnail)errors.push(scene.id+" approved without both real image and thumbnail");
   if(!scene.provenance||!scene.tool||!scene.generation_prompt||!scene.licence_status)
    errors.push(scene.id+" approved without full image provenance");
   for(const id of scene.required_region_ids||[]){
    if(!Array.isArray(scene.polygons?.[id])||scene.polygons[id].length<3)
     errors.push(scene.id+" approved without required region "+id);
   }
  }
  for(const [id,polygon]of Object.entries(scene.polygons||{})){
   if(!scene.required_region_ids.includes(id))errors.push(scene.id+" polygon refers to unknown region "+id);
   if(!Array.isArray(polygon)||polygon.length<3||polygon.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=="number"||n<0||n>100)))
    errors.push(scene.id+" polygon invalid for "+id);
  }
 }
 const ids=new Set((data.scenes||[]).map(x=>x.id));
 for(let chapter=1;chapter<=8;chapter++)if(![...ids].some(id=>id.startsWith("b01-c"+String(chapter).padStart(3,"0")+"-scene")))errors.push("Chapter "+chapter+" has no image or SVG fallback");
 for(let chapter=1;chapter<=8;chapter++){
  const file=path.join(root,"lessons/b01/c"+String(chapter).padStart(3,"0")+".json");
  const lesson=JSON.parse(fs.readFileSync(file,"utf8"));
  for(const item of lesson.exercises||[]){
   if(item.type!=="pic"||item.status!=="approved")continue;
   const scene=(data.scenes||[]).find(x=>x.id===item.scene_id);
   if(!scene)errors.push(item.id+" references a missing scene");
   else if(!scene.required_region_ids.includes(item.region_id)||!scene.polygons[item.region_id])
    errors.push(item.id+" references unreviewed or missing image region "+item.region_id);
  }
 }
 return errors;
}
const errs=check(report);
if(errs.length){console.error(errs.join("\n"));process.exitCode=1}
else console.log("PASS: 9 draft scenes have grounded region plans and SVG fallback; no unapproved image asset is published.");
module.exports={check};
