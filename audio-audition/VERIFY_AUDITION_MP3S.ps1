# Offline integrity verification only. No network, generation or teaching approval.
$ErrorActionPreference = 'Stop'
$audioDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $audioDir
$manifestPath = Join-Path $root 'docs\audio\audition-2026-11.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$good = 0; $errors = 0
foreach ($clip in $manifest.clips) {
    $name = [IO.Path]::GetFileName([string]$clip.recording_file)
    $path = Join-Path $audioDir $name
    if (-not (Test-Path -LiteralPath $path)) { Write-Warning "Missing: $name"; $errors++; continue }
    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne [string]$clip.sha256) { Write-Warning "Checksum mismatch: $name"; $errors++; continue }
    $good++
}
Write-Host "Verified original Runway MP3s: $good of $(@($manifest.clips).Count); errors: $errors"
if ($errors -gt 0 -or $good -ne 34) { exit 1 }
Write-Host 'Open Audio Audition.html offline. Audio is not approved until you export your review.'
