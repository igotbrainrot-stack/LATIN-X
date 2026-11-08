# Phase 3a review: feature/phase3-runtime-20261105 (head 5fd04dd)

Reviewed by Claude on 2026-11-05. The uploaded zip is byte-identical to the pushed branch.

## Verified as correct
- `archive/index-v04-inline-phase3a-baseline.html` SHA-1 = 9338b8fa92e7ce058c5a87aedd1d59c4a37e3d20 (v0.4.2 baseline intact).
- `app/legacy-runtime.js` equals that file's inline script, byte for byte (51,991 bytes).
- `index.html` equals the baseline with only `<script>...</script>` replaced by `<script src="app/legacy-runtime.js"></script>`. There is no module and no fetch, and file:// is safe.
- `curriculum/lexicon/lexemes.json`: 0 lexemes, status human_review_required.
- Ledger: 0 introductions, `generated_by` and `generated_from_hash` present.
- `grammar-features.json`: 172 features, strict schema; compiler imports `scripts/lib/grammar.cjs`.
- `approved_patterns` is still empty, and the 32-column CSV has 128 rows with no decision or reviewer filled (correctly unsigned).
- All `.cmd` launchers keep CRLF line endings.
- Push run 42046123560 passed. Its Windows job runs the file:// test on Chromium, Edge, Chrome and Firefox, so the handback note "no Firefox run" is out of date.

## Defect (must fix before 3b)
The PR run "Tablinum source checks" (42046214310) FAILS in `browser-smoke`:
`locator('.scene svg') waitFor timeout` at tests/browser-smoke.cjs:26.

Cause: the test's HTTP server answers EVERY path with index.html. Since 3a, the
browser requests `app/legacy-runtime.js`, receives HTML instead, and the app never boots.
The app is fine; the Phase 0 safety-net test is now wrong. Do not delete or skip it.

Fix: serve real files from the repo root with the correct content types, for example:

```js
const root=path.join(__dirname,"..");
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,"http://x").pathname).replace(/^\/+/,"")||"index.html";
 const file=path.resolve(root,rel);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);return res.end();}
 res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
 fs.createReadStream(file).pipe(res);
});
```

Then grep `tests/` for any other server or `setContent` that inlines index.html (for example,
screenshot or visual tests) and apply the same fix. The PR "Tablinum source checks" run must be green.

## Next
After the fix is green, start Phase 3b (classic-script content loader), as GPT_HANDOVER_NEXT_PHASES.md §4 describes, with the two-pass method.

---
**Historical review note.** Phase 3b source changes intentionally supersede the literal Phase 3a inline script equality check. See PHASE3B_CLAUDE_HANDOVER.md for the newer content-equivalence lock.
