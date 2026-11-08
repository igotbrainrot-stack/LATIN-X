@echo off
setlocal
cd /d "%~dp0"
set "SHEET=%~1"
if not defined SHEET set "SHEET=%~dp0curriculum\lexicon\review-sheets\legacy-candidates-claude-draft-32col.csv"
where node >nul 2>nul || (echo Node.js 22 or newer is required.& pause & exit /b 1)
node scripts\registry-review-sheet.cjs --check-sheet "%SHEET%"
if errorlevel 1 (echo CSV structural validation failed.& pause & exit /b 1)
node scripts\registry-review-sheet.cjs --dry-run "%SHEET%"
if errorlevel 1 (echo CSV review preview failed.& pause & exit /b 1)
echo.
echo Validation passed. No files were imported or approved.
pause
