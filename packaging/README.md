# Packaging

Everything needed to turn the repository into something a learner installs lives here
and in five scripts. Nothing in this folder is loaded by the program at run time.

## One description, several installers

```
packaging/manifest.json          what ships, names, versions, install locations
        |
scripts/build-release.cjs        reads the manifest: runtimeFiles()
scripts/build-easy-install.cjs   setupEntries(): the Setup tree (installers + program/)
        |
        +-- npm run build:setup              dist/Tablinum-Setup-<label>.zip
        +-- npm run build:stage              dist/stage/Tablinum/ + dist/stage/payload.json
        +-- npm run build:linux-installers   dist/Tablinum-Setup-<label>.run
        |                                    dist/tablinum_<version>_all.deb
        +-- npm run build:windows-exe        dist/Tablinum-Setup-<label>.exe  (needs Inno Setup 6)
```

`npm run build:installers` runs the ZIP, Linux and Windows builders in turn.
`dist/` is ignored by Git. No installer is committed.

| Path | Role |
| --- | --- |
| `manifest.json` | Single source of truth: product name, id, publisher, release label, runtime files and folders, exclusions, the 78-file media manifest, icons, Setup file names, Windows and Linux install locations, output names. Change a value here and every builder follows. |
| `easy-install/` | The installer logic from PR #19, unchanged: `install-windows.ps1`, the Windows `.cmd`, the Linux Mint `.sh`, the no-install page and the readme. |
| `windows/tablinum-setup.iss` | Inno Setup 6 definition of the single `.exe`. |
| `linux/run-header.sh` | Shell header of the single-file `.run` installer. |
| `linux/deb/` | Templates for the `.deb`: `control.in`, `tablinum.desktop.in`, `tablinum.sh.in`. |

## What each installer does

| File | For | Installs to | Admin rights | How it works |
| --- | --- | --- | --- | --- |
| `Tablinum-Setup-<label>.zip` | Windows and Linux Mint | per user | no | Extract, double-click the installer for your system. |
| `Tablinum-Setup-<label>.exe` | Windows | `%LOCALAPPDATA%\Tablinum` | no | Unpacks `program/` to a temporary folder and runs `install-windows.ps1`. Same shortcuts, same "Installed apps" entry and same removal as the ZIP. `/VERYSILENT /SUPPRESSMSGBOXES` for no questions, `/NOLAUNCH` to not open the program. Exit code 1 if the script fails. |
| `Tablinum-Setup-<label>.run` | Linux | `~/.local/share/tablinum` | no | Checks its own SHA-256, unpacks to a temporary folder and runs `Install Tablinum (Linux Mint).sh` with the same options (`--no-launch`, `--quiet`, `--uninstall`). `--extract DIR` only unpacks. |
| `tablinum_<version>_all.deb` | Debian, Ubuntu, Mint, all users | `/opt/tablinum` | yes (it is a system package) | Adds `/usr/bin/tablinum`, a menu entry and icons. Removed with the system package manager. |

The `.exe` and `.run` are carriers for the existing installers, so there is one install
routine per system to maintain and test, not two.

## Things to know before shipping

- **The `.exe` is not code-signed.** Windows SmartScreen will show "Windows protected
  your PC" until it is signed with a code-signing certificate. Signing needs a
  certificate the owner buys; add `SignTool=` to the `.iss` when there is one. Never
  commit a certificate or its password.
- **Progress is tied to the folder the program is opened from.** A browser keeps saved
  progress per `file://` location. The `.exe`, `.run` and ZIP all install to the same
  per-user folder, so they share progress with each other. The `.deb` installs to
  `/opt/tablinum`, a different location, so a learner who moves from a per-user install
  to the `.deb` should export a backup in Settings first and restore it afterwards.
- **Version and label.** The program version comes from `package.json` (the owner sets
  it). The release label is `product.label` in the manifest. Both appear in file names
  and in "Installed apps".
- **Inno Setup** is a Windows program. `build-windows-exe.cjs` prints how to get it and
  exits without error when it is absent, or fails with `--require`. On Linux the `.exe`
  is built by the `installers` workflow on `windows-latest`.
- **The `.deb`** is built only where `dpkg-deb` exists (Debian, Ubuntu, Mint, the CI
  runner). It is not signed and is not in any package repository.

## Checks

- `npm run test:packaging` (also part of `npm test`): the builders read the manifest,
  the staged folder equals the Setup ZIP tree byte for byte, the `.iss` defaults match
  the manifest, template placeholders are all filled, the `.run` unpacks to the same
  tree and refuses a damaged copy, no private file is in the runtime set.
- `.github/workflows/installers.yml`: builds the `.run` and `.deb` on `ubuntu-latest`
  and installs, reinstalls and removes them; builds the `.exe` on `windows-latest` with
  Inno Setup and installs it silently, checks 78 media files, shortcuts and the
  uninstall entry, reinstalls, removes, and checks it refuses a folder it did not create.
- `.github/workflows/easy-install.yml` still tests the ZIP as before.

## Adding another installer later

Read `dist/stage/payload.json` (every file with size and SHA-256) and pack
`dist/stage/Tablinum/`. Add its names to `manifest.json`, a builder script beside the
others, a section in `tests/packaging-layout.test.cjs` and a job in `installers.yml`.
