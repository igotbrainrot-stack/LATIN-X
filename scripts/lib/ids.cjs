"use strict";
const ID=/^(?:legacy-ch\d{2}|b0[1-3]-c\d{3})(?:-(?:l\d+|s\d{3}|q\d{3}|sp\d{3}))?$/;
function requireId(id,where){if(typeof id!=="string"||!ID.test(id))throw Error(`${where}: invalid stable ID ${JSON.stringify(id)}`);return id}
function expectedCourseId(n){return `b0${n<=50?1:n<=90?2:3}-c${String(n).padStart(3,"0")}`}
function addId(id,where,seen,retired){requireId(id,where);if(retired.has(id))throw Error(`${where}: retired ID reused ${id}`);if(seen.has(id))throw Error(`${where}: duplicate ID ${id} (first ${seen.get(id)})`);seen.set(id,where)}
function fnv32(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(16).padStart(8,"0")}
module.exports={ID,requireId,expectedCourseId,addId,fnv32};
