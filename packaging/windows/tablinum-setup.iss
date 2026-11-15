; Tablinum Setup for Windows as one .exe (Inno Setup 6).
;
; Build it with    node scripts/build-windows-exe.cjs
; which stages the files (scripts/build-stage.cjs) and then runs the Inno Setup
; compiler (ISCC.exe) on this file. By hand, after staging:
;     ISCC packaging\windows\tablinum-setup.iss
;
; This is a carrier, not a second installer. It unpacks the staged "program" folder
; into a temporary folder and runs program\install\install-windows.ps1, the same
; script the Setup ZIP uses. So the .exe and the ZIP install to the same place
; (%LOCALAPPDATA%\Tablinum), create the same shortcuts and the same "Installed apps"
; entry, and are removed the same way. Nothing here needs administrator rights.
;
; Command line:  /SILENT or /VERYSILENT   no questions and no message boxes
;                /NOLAUNCH                do not open Tablinum afterwards
; The exit code is 0 on success and 1 when the install script reports a failure.
;
; The values below are defaults. build-windows-exe.cjs passes the real ones from
; packaging/manifest.json with /D, and tests/packaging-layout.test.cjs checks that
; these defaults have not drifted from the manifest.

#ifndef AppName
  #define AppName "Tablinum"
#endif
#ifndef AppPublisher
  #define AppPublisher "LATIN X"
#endif
#ifndef AppVersion
  #define AppVersion "0.5.0-20261111"
#endif
#ifndef ProgramVersion
  #define ProgramVersion "0.5.0"
#endif
#ifndef RepoRoot
  #define RepoRoot AddBackslash(SourcePath) + "..\.."
#endif
#ifndef StageDir
  #define StageDir RepoRoot + "\dist\stage\Tablinum"
#endif
#ifndef OutputDir
  #define OutputDir RepoRoot + "\dist"
#endif
#ifndef OutputName
  #define OutputName "Tablinum-Setup-20261111"
#endif
#ifndef IconFile
  #define IconFile RepoRoot + "\assets\icons\tablinum.ico"
#endif

[Setup]
AppId={{7B0E4C0B-6E0B-4B63-9C55-7A1D5E2C4F11}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
VersionInfoVersion={#ProgramVersion}
VersionInfoDescription={#AppName} Setup
PrivilegesRequired=lowest
CreateAppDir=no
Uninstallable=no
DisableProgramGroupPage=yes
DisableFinishedPage=yes
DisableReadyPage=yes
WizardStyle=modern
SetupIconFile={#IconFile}
OutputDir={#OutputDir}
OutputBaseFilename={#OutputName}
Compression=lzma2
SolidCompression=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Messages]
WelcomeLabel2=This will install [name/ver] for you only, in your own user folder.%n%nNo administrator rights and no internet connection are needed. Your saved progress is not changed.
StatusExtractFiles=Unpacking Tablinum...

[Files]
Source: "{#StageDir}\program\*"; DestDir: "{tmp}\Tablinum\program"; Flags: recursesubdirs createallsubdirs ignoreversion

[Code]
var
  InstallFailed: Boolean;

function HasSwitch(const Name: String): Boolean;
var
  I: Integer;
begin
  Result := False;
  for I := 1 to ParamCount do
    if CompareText(ParamStr(I), Name) = 0 then
      Result := True;
end;

{ The 64-bit PowerShell where there is one, so the uninstall command that the script
  registers is the same one the Setup ZIP registers. }
function PowerShellPath: String;
begin
  Result := ExpandConstant('{win}\Sysnative\WindowsPowerShell\v1.0\powershell.exe');
  if not (IsWin64 and FileExists(Result)) then
    Result := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  Script, Params: String;
  ResultCode: Integer;
begin
  if CurStep <> ssPostInstall then
    exit;
  Script := ExpandConstant('{tmp}\Tablinum\program\install\install-windows.ps1');
  Params := '-NoProfile -ExecutionPolicy Bypass -File "' + Script + '"';
  { The script shows its own result message and opens Tablinum, unless told not to. }
  if WizardSilent then
    Params := Params + ' -Quiet';
  if HasSwitch('/NOLAUNCH') then
    Params := Params + ' -NoLaunch';
  WizardForm.StatusLabel.Caption := 'Installing Tablinum...';
  if not Exec(PowerShellPath, Params, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    InstallFailed := True;
    if not WizardSilent then
      MsgBox('Tablinum Setup could not start Windows PowerShell, which it needs to finish installing.', mbError, MB_OK);
  end
  else if ResultCode <> 0 then
    InstallFailed := True;
end;

function GetCustomSetupExitCode: Integer;
begin
  if InstallFailed then
    Result := 1
  else
    Result := 0;
end;
