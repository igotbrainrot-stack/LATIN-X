@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "audio-audition\DOWNLOAD_MIRIAM_ALIAS_V3.ps1"
if errorlevel 1 (echo Some downloads failed. See the output above.)
pause
