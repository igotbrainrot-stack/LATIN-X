# One-click Setup package (Windows and Linux Mint)

`npm run build:setup` writes `dist/Tablinum-Setup-20261111.zip`. It unpacks to one
`Tablinum` folder that holds only:

| File | Use |
| --- | --- |
| `Install Tablinum (Windows).cmd` | Double-click on Windows. Copies the program to `%LOCALAPPDATA%\Tablinum`, adds a desktop icon, Start menu entries ("Tablinum", "Uninstall Tablinum") and an entry under Settings > Apps > Installed apps, then opens Tablinum. |
| `Install Tablinum (Linux Mint).sh` | Double-click on Linux Mint and choose Run. Copies the program to `~/.local/share/tablinum`, adds an applications menu entry (Education, with a "Remove Tablinum" right-click action) and a trusted desktop icon, then opens Tablinum. Running it again offers to reinstall or remove. |
| `Open without installing.html` | Runs Tablinum straight from the extracted folder. |
| `READ ME FIRST.txt` | Plain steps, including the Windows SmartScreen "More info > Run anyway" step and the Mint "Allow executing file as program" fallback. |
| `program/` | The runtime with all 78 owner media files, plus `install/install-windows.ps1` and `install/package.json`. |

Both installers are per user. They need no administrator password, no internet
connection and no extra software: Tablinum runs in the browser already on the
computer, and every recording is inside `program/`. Each installer writes a marker
file and refuses to replace a folder it did not create. An install copies into a
fresh folder first, so a failed copy never leaves half a program.

Sources live in `packaging/easy-install/`. The builder sets CRLF on the `.cmd` and
readme, LF and mode 0755 on the `.sh`, and a UTF-8 BOM on the PowerShell script.

## Checks

- `npm run test:easy-install` checks the layout, line endings, executable bit and
  that all 78 media files ship.
- `.github/workflows/easy-install.yml` installs, reinstalls and removes the package on
  `ubuntu-latest` (with `desktop-file-validate`) and on `windows-latest` (shortcuts,
  uninstall registry entry, 78 media files, refusal of a foreign folder).

Not verified: a real Windows PC with SmartScreen, and a real Linux Mint Cinnamon
desktop (the zenity dialogs and Nemo's trusted desktop icon). The CI runners have no
desktop session, so the installers run there with `-Quiet` / `--quiet`.
