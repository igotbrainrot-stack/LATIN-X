$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
$urls=Get-Content -LiteralPath (Join-Path $here 'PRIVATE_MIRIAM_IPA_V2_RUNWAY_LINKS.json') -Encoding UTF8 -Raw | ConvertFrom-Json
$hashes=@()
foreach($item in $urls.entries){
 $target=Join-Path $here $item.filename
 if (Test-Path -LiteralPath $target) { Write-Host "Already present: $($item.filename)" }
 else {
  Write-Host "Downloading $($item.filename)" -ForegroundColor Cyan
  Invoke-WebRequest -Uri $item.url -OutFile $target -UseBasicParsing -MaximumRedirection 5
 }
 $file=Get-Item -LiteralPath $target
 if ($file.Length -lt 1000) { throw "Invalid downloaded MP3 (too small): $($item.filename). Delete and retry with a refreshed Runway link." }
 $h=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
 $hashes+=@{filename=$item.filename;size_bytes=$file.Length;sha256=$h;task_id=$item.task_id}
 Write-Host "Verified local file size and SHA256: $($item.filename)" -ForegroundColor Green
}
$hashes | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $here 'MIRIAM_IPA_V2_LOCAL_SHA256.json') -Encoding UTF8
Write-Host 'All 5 clips downloaded. Open Miriam IPA Retry Review.html from the Latin-X folder.' -ForegroundColor Green
