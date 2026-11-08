@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "audio-audition\DOWNLOAD_MIRIAM_IPA_V2.ps1"
if errorlevel 1 (
 echo Download failed. The temporary signed Runway links may have expired. See CLAUDE_HANDOVER\00_START_HERE_MIRIAM_OWNER_REVIEW.md.
 pause
 exit /b 1
)
pause
