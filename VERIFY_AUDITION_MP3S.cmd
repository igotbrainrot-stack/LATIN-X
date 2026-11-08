@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0audio-audition\VERIFY_AUDITION_MP3S.ps1"
if errorlevel 1 (echo Audio verification FAILED. & pause & exit /b 1)
pause
