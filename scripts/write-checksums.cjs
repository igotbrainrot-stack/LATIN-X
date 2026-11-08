#!/usr/bin/env node
"use strict";
/* Regenerates SHA256SUMS.txt for the source tree (sha256sum -c compatible).
 * Covers Git-tracked files plus the Git-ignored local narration MP3s; skips
 * generated folders. Run after any change:  node scripts/write-checksums.cjs */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {sourceEntries}=require("./build-release.cjs");
const root=path.resolve(__dirname,"..");
const lines=sourceEntries().filter(e=>e.name!=="SHA256SUMS.txt")
 .map(e=>crypto.createHash("sha256").update(e.data).digest("hex")+"  "+e.name);
fs.writeFileSync(path.join(root,"SHA256SUMS.txt"),lines.join("\n")+"\n");
console.log("SHA256SUMS.txt: "+lines.length+" files");
