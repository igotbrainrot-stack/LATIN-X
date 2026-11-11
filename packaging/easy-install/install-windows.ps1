# Tablinum Setup for Windows. Started by "Install Tablinum (Windows).cmd".
#
# Copies the program to %LOCALAPPDATA%\Tablinum, creates a desktop icon and Start menu
# entries, registers an uninstaller under "Installed apps", and opens Tablinum.
# Everything is per user: no administrator rights, no downloads, nothing outside the
# user's own profile. Run with -Uninstall to remove it again.
param(
  [switch]$Uninstall,
  [switch]$NoLaunch,
  [switch]$Quiet,
  [string]$InstallDir
)
$ErrorActionPreference = 'Stop'
$Marker = 'tablinum-install.json'
$RegKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Tablinum'
if (-not $InstallDir) { $InstallDir = Join-Path $env:LOCALAPPDATA 'Tablinum' }
$Desktop = [Environment]::GetFolderPath('Desktop')
$Programs = [Environment]::GetFolderPath('Programs')
$Links = @(
  (Join-Path $Desktop 'Tablinum.lnk'),
  (Join-Path $Programs 'Tablinum.lnk'),
  (Join-Path $Programs 'Uninstall Tablinum.lnk')
)

function Say([string]$Text, [string]$Icon = 'Information') {
  Write-Host ''
  Write-Host "  $Text"
  if ($Quiet) { return }
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [void][System.Windows.Forms.MessageBox]::Show($Text, 'Tablinum Setup', 'OK', $Icon)
  } catch { }
}
function New-Link([string]$Path, [string]$Target, [string]$Arguments, [string]$Icon, [string]$Description) {
  $shell = New-Object -ComObject WScript.Shell
  $link = $shell.CreateShortcut($Path)
  $link.TargetPath = $Target
  if ($Arguments) { $link.Arguments = $Arguments }
  $link.WorkingDirectory = $InstallDir
  $link.IconLocation = $Icon
  $link.Description = $Description
  $link.Save()
}

try {
  if ($Uninstall) {
    Set-Location $env:TEMP
    foreach ($l in $Links) { if (Test-Path -LiteralPath $l) { Remove-Item -LiteralPath $l -Force } }
    if (Test-Path $RegKey) { Remove-Item $RegKey -Recurse -Force }
    if (Test-Path -LiteralPath (Join-Path $InstallDir $Marker)) {
      Remove-Item -LiteralPath $InstallDir -Recurse -Force
    }
    Say 'Tablinum has been removed. Your saved progress stays in your web browser.'
    exit 0
  }

  $Source = Split-Path -Parent $PSScriptRoot
  if (-not (Test-Path -LiteralPath (Join-Path $Source 'index.html'))) {
    throw 'The program folder is incomplete. Extract the whole ZIP and run Setup again.'
  }
  $SourceFull = [IO.Path]::GetFullPath($Source).TrimEnd('\')
  $DestFull = [IO.Path]::GetFullPath($InstallDir).TrimEnd('\')
  if ($SourceFull -ieq $DestFull) { throw 'Setup is already running from the installed copy.' }
  if ((Test-Path -LiteralPath $InstallDir) -and
      -not (Test-Path -LiteralPath (Join-Path $InstallDir $Marker)) -and
      (Get-ChildItem -LiteralPath $InstallDir -Force | Select-Object -First 1)) {
    throw "The folder $InstallDir already exists and was not created by Tablinum Setup. Nothing was changed."
  }

  Write-Host ''
  Write-Host '  Installing Tablinum...'
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  # /MIR makes the installed copy match this package exactly, so an update also removes old files.
  & robocopy.exe $Source $InstallDir /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "Copying the program failed (robocopy code $LASTEXITCODE)." }
  $global:LASTEXITCODE = 0

  $Index = Join-Path $InstallDir 'index.html'
  if (-not (Test-Path -LiteralPath $Index)) { throw 'The program was not copied correctly.' }
  $Audio = @(Get-ChildItem -LiteralPath $InstallDir -Recurse -Filter *.mp3 -File).Count
  $Version = 'unknown'
  $Info = Join-Path $InstallDir 'install\package.json'
  if (Test-Path -LiteralPath $Info) { $Version = (Get-Content -LiteralPath $Info -Raw | ConvertFrom-Json).version }
  @{ name = 'Tablinum'; version = $Version; audioFiles = $Audio; installedBy = 'Tablinum Setup' } |
    ConvertTo-Json | Set-Content -LiteralPath (Join-Path $InstallDir $Marker) -Encoding ASCII

  $Icon = Join-Path $InstallDir 'assets\icons\tablinum.ico'
  $Script = Join-Path $InstallDir 'install\install-windows.ps1'
  $PowerShell = Join-Path $PSHOME 'powershell.exe'
  $RemoveArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$Script`" -Uninstall"
  New-Link $Links[0] $Index '' $Icon 'Tablinum Latin reading course'
  New-Link $Links[1] $Index '' $Icon 'Tablinum Latin reading course'
  New-Link $Links[2] $PowerShell $RemoveArgs $Icon 'Remove Tablinum from this computer'

  New-Item -Path $RegKey -Force | Out-Null
  Set-ItemProperty $RegKey -Name DisplayName -Value 'Tablinum'
  Set-ItemProperty $RegKey -Name DisplayVersion -Value $Version
  Set-ItemProperty $RegKey -Name Publisher -Value 'LATIN X'
  Set-ItemProperty $RegKey -Name InstallLocation -Value $InstallDir
  Set-ItemProperty $RegKey -Name DisplayIcon -Value $Icon
  Set-ItemProperty $RegKey -Name UninstallString -Value "`"$PowerShell`" $RemoveArgs"
  Set-ItemProperty $RegKey -Name NoModify -Value 1 -Type DWord
  Set-ItemProperty $RegKey -Name NoRepair -Value 1 -Type DWord

  if (-not $NoLaunch) { Start-Process -FilePath $Index }
  Say "Tablinum is installed, with $Audio recordings and music tracks. Open it from the Tablinum icon on your desktop or from the Start menu."
  exit 0
} catch {
  Say ("Tablinum Setup could not finish: " + $_.Exception.Message) 'Error'
  exit 1
}
