@echo off
rem Tablinum Setup for Windows. Double-click this file.
rem It copies Tablinum to your user folder, adds a desktop icon and a Start menu
rem entry, and opens the program. No administrator rights and no internet are needed.
setlocal
title Tablinum Setup
if not exist "%~dp0program\index.html" goto :notextracted
if not exist "%~dp0program\install\install-windows.ps1" goto :notextracted
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0program\install\install-windows.ps1" %*
if errorlevel 1 goto :failed
exit /b 0

:notextracted
echo.
echo   Tablinum Setup cannot find its files.
echo.
echo   This usually means the ZIP has not been extracted yet.
echo   Close this window, right-click the ZIP file, choose "Extract All...",
echo   then open the extracted folder and double-click this file again.
echo.
pause
exit /b 1

:failed
echo.
echo   Tablinum Setup did not finish. The reason is shown above.
echo   You can still use Tablinum without installing: double-click
echo   "Open without installing.html" in this folder.
echo.
pause
exit /b 1
