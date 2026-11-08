# Private owner audio retrieval. Only the four original Runway-generated v3 MP3s.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $folder
$source = Join-Path $folder 'PRIVATE_MIRIAM_ALIAS_V3_RUNWAY_LINKS.json'
$manifestPath = Join-Path $root 'docs/audio/miriam-alias-v3-2026-11-07.json'
$links = Get-Content -LiteralPath $source -Raw -Encoding UTF8 | ConvertFrom-Json
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$count = 0
$failures = 0
foreach($clip in $links.clips) {
  $file = Join-Path $folder $clip.filename
  Write-Host ('Downloading ' + $clip.filename)
  try {
    if ((Test-Path -LiteralPath $file) -and (Get-Item -LiteralPath $file).Length -gt 300) {
      Write-Host '  Already present; verifying existing bytes'
    } else {
      $temp = $file + '.partial'
      if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
      Invoke-WebRequest -Uri $clip.url -OutFile $temp -UseBasicParsing -TimeoutSec 35
      if ((Get-Item -LiteralPath $temp).Length -lt 300) {throw 'Not a plausible MP3 (too short)'}
      $header = [IO.File]::ReadAllBytes($temp)
      if (!(($header[0] -eq 73 -and $header[1] -eq 68 -and $header[2] -eq 51) -or ($header[0] -eq 255 -and ($header[1] -band 224) -eq 224))) {throw 'Unexpected downloaded file header'}
      Move-Item -LiteralPath $temp -Destination $file -Force
    }
    $hash = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant()
    $entry = $manifest.items | Where-Object { $_.filename -eq $clip.filename } | Select-Object -First 1
    if ($null -eq $entry) { throw 'Missing manifest record' }
    $entry.sha256=$hash
    $entry.status='downloaded_locally_unreviewed'
    $count++
    Write-Host ('  Saved; SHA256 '+$hash)
  } catch {
    $failures++
    Write-Warning ($clip.filename + ': ' + $_.Exception.Message)
  }
}
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host ("Download result: $count of $($links.clips.Count) complete; $failures failed")
if($failures -gt 0) { Write-Host 'Temporary Runway links may have expired; recover URLs using existing task IDs, not fresh generation'; exit 1 }
Write-Host 'Now open Start Miriam Alias Review v3.cmd to hear the four new samples offline.'
