"use strict";
/* Runs on Windows/Chromium with file://, not a dev server. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const {chromium}=require("playwright");
const {parseCsv}=require("../scripts/lib/review-csv.cjs");
(async()=>{
 const root=path.resolve(__dirname,"..");
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true});
 const page=await context.newPage();
 try{
  await page.goto(pathToFileURL(path.join(root,"Vocabulary Review.html")).href);
  assert((await page.title()).includes("Vocabulary Review"));
  await page.setInputFiles("#file",path.join(root,"curriculum/lexicon/review-sheets/legacy-candidates-claude-draft-32col.csv"));
  await page.waitForFunction(()=>document.querySelector("#total").textContent==="128");
  assert.equal(await page.locator("#approved").textContent(),"0");
  assert.equal(await page.locator("#pending").textContent(),"128");
  assert.equal(await page.locator("#itemList button").count(),128);
  await page.locator('select[name="decision"]').selectOption("approve");
  await page.locator("#save").click();
  assert.match(await page.locator("#status").textContent(),/Approval requires/);
  assert.equal(await page.locator("#approved").textContent(),"0");
  await page.locator('select[name="decision"]').selectOption("needs_review");
  await page.locator("#save").click();
  assert.equal(await page.locator("#pending").textContent(),"128");
  const [download]=await Promise.all([page.waitForEvent("download"),page.locator("#download").click()]);
  assert.equal(download.suggestedFilename(),"vocabulary-owner-reviewed.csv");
  const text=fs.readFileSync(await download.path(),"utf8").replace(/^\uFEFF/,"");
  const parsed=parseCsv(text);
  assert.equal(parsed.records.length,128);
  assert.equal(parsed.records[0].decision,"needs_review");
  assert(parsed.records.every(r=>r.reviewer===""&&r.macron_reviewed===""));
  console.log("PASS: offline file:// editor loads unsigned Claude queue, blocks false approval and exports 32-column CSV");
 }finally{await context.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
