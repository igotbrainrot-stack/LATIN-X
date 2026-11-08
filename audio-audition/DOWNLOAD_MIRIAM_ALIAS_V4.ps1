# Local owner-only downloader for 3 existing Runway Miriam v4-ITERATION MP3 tasks.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $dir
$links = Get-Content -LiteralPath (Join-Path $dir 'PRIVATE_MIRIAM_ALIAS_V4_RUNWAY_LINKS.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$manifestPath = Join-Path $root 'docs/audio/miriam-alias-v4-2026-11-07.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$ok=0; $failed=0
foreach ($clip in $links.clips) {
  $target = Join-Path $dir $clip.filename
  $temp = $target + '.partial'
  Write-Host ('Getting original Runway task ' + $clip.task_id + ' -> ' + $clip.filename)
  try {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
    if (!(Test-Path -LiteralPath $target) -or (Get-Item -LiteralPath $target).Length -lt 300) {
      Invoke-WebRequest -UseBasicParsing -Uri $clip.url -OutFile $temp -TimeoutSec 45
      $f = Get-Item -LiteralPath $temp
      if ($f.Length -lt 300) { throw 'Not a plausible audio file: too short' }
      $bytes = [IO.File]::ReadAllBytes($temp)
      if (!(($bytes[0] -eq 73 -and $bytes[1] -eq 68 -and $bytes[2] -eq 51) -or ($bytes[0] -eq 255 -and ($bytes[1] -band 224) -eq 224))) { throw 'Downloaded data did not start as an MP3' }
      Move-Item -LiteralPath $temp -Destination $target -Force
    }
    $hash=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
    $rec=$manifest.clips | Where-Object { $_.filename -eq $clip.filename } | Select-Object -First 1
    if (!$rec) {throw 'Manifest has no match for this file'}
    $rec.sha256=$hash; $rec.status='downloaded_owner_review_PENDING'
    Write-Host ('  SHA-256 '+$hash)
    $ok++
  } catch {
    $failed++
    Write-Warning ($clip.filename + ': ' + $_.Exception.Message)
  }
}
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host ('Complete: '+$ok+' of '+$links.clips.Count+'; '+$failed+' errors')
if ($failed -gt 0) { Write-Host 'If the links expired, recover original Runway task IDs. Do not regenerate or spend credits.'; exit 1 }
Write-Host 'Open Start Miriam Review v4.cmd now.'
