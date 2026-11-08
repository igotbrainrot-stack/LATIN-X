@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0audio-audition\DOWNLOAD_MIRIAM_ALIAS_V4.ps1"
pause
