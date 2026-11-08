"use strict";
/* RFC 4180-compatible string CSV for offline editorial review sheets.
 * No Excel formulas are executed; untrusted CSV fields are unescaped only as data.
 */
const assert=require("node:assert/strict");
function escapeCell(value){
 const s=String(value??"");
 const safe=/^[=+\-@\t\r]/.test(s)?"'"+s:s;
 return '"'+safe.replace(/"/g,'""')+'"';
}
function writeCsv(headers,records){
 assert(Array.isArray(headers)&&headers.length>0);
 return [headers.map(escapeCell).join(","),...records.map(r=>headers.map(h=>escapeCell(r[h])).join(","))].join("\r\n")+"\r\n";
}
function parseCsv(text){
 const rows=[];let row=[],part="",quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){
   if(c==='"'&&text[i+1]==='"'){part+='"';i++;}
   else if(c==='"')quoted=false;
   else part+=c;
  }else if(c==='"'){
   assert.equal(part.length,0,"Malformed CSV stray quote at character "+i);quoted=true;
  }else if(c===","){row.push(part);part="";}
  else if(c==="\r"||c==="\n"){
   if(c==="\r"&&text[i+1]==="\n")i++;
   row.push(part);if(row.some(v=>v!==""))rows.push(row);
   row=[];part="";
  }else part+=c;
 }
 assert(!quoted,"Unclosed quoted CSV field");
 row.push(part);
 if(row.some(v=>v!==""))rows.push(row);
 assert(rows.length>0,"Empty CSV");
 const headers=rows.shift();
 assert(headers.every(Boolean),"CSV header contains blank");
 assert.equal(new Set(headers).size,headers.length,"Duplicate CSV header");
 return {headers,records:rows.map((values,i)=>{
  assert.equal(values.length,headers.length,"CSV row "+(i+2)+" malformed column count");
  return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));
 })};
}
module.exports={writeCsv,parseCsv};
