@echo off
setlocal
set "LATIN_X_PACKAGE_ROOT=%~dp0"
set "LATIN_X_PACKAGE_DEST=%~dp0..\LATIN_X_CLAUDE_REVIEW_FULL_20261106.zip"
where powershell >nul 2>nul || (echo Windows PowerShell is required to create the review ZIP.& pause & exit /b 1)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; $root=$env:LATIN_X_PACKAGE_ROOT; $zip=$env:LATIN_X_PACKAGE_DEST; if ([IO.File]::Exists($zip)) {[IO.File]::Delete($zip)}; [IO.Compression.ZipFile]::CreateFromDirectory($root,$zip,[IO.Compression.CompressionLevel]::Optimal,$true); $check=[IO.Compression.ZipFile]::OpenRead($zip); try { if (-not ($check.Entries.FullName -match 'index.html')) {throw 'index.html missing from archive'}; if (-not ($check.Entries.FullName -match 'CLAUDE_REVIEW_PACKAGE/00_START_HERE.md')) {throw 'Claude instructions missing'}; Write-Host ('Created complete Claude review ZIP: '+$zip); Write-Host ('ZIP entries: '+$check.Entries.Count) } finally { $check.Dispose() }"
if errorlevel 1 (echo ZIP creation failed.& pause & exit /b 1)
pause
