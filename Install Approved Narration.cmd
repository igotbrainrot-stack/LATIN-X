@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js 22 or newer is required.& pause & exit /b 1)
set "SRC=%~1"
if not defined SRC set /p "SRC=Folder that holds the downloaded approved MP3s (for example ...\AUDIO_OWNER_PACKAGE\mp3): "
if not defined SRC (echo No folder given.& pause & exit /b 1)
node scripts\install-narration.cjs "%SRC%"
if errorlevel 1 (echo Some files were rejected. Nothing invalid was installed.& pause & exit /b 1)
echo.
echo Approved recordings are installed locally in audio\narration\miriam. They are not uploaded anywhere.
echo Start Tablinum.cmd, open Chapter I and select sentence 7 or 9.
pause
