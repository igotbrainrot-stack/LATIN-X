#!/bin/sh
# Tablinum Setup for Linux Mint (and other XDG desktops).
# Double-click this file and choose "Run". It copies Tablinum into your home folder,
# adds it to the applications menu (Education) and to the desktop, and opens it.
# No password, no internet and no extra software are needed: Tablinum runs in the web
# browser that is already installed.
#
# Options (for a terminal):  --uninstall   --no-launch   --quiet
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mode=install; launch=1; quiet=0
for a in "$@"; do
  case "$a" in
    --uninstall) mode=uninstall ;;
    --no-launch) launch=0 ;;
    --quiet) quiet=1 ;;
    *) echo "Unknown option: $a" >&2; exit 2 ;;
  esac
done

data="${XDG_DATA_HOME:-$HOME/.local/share}"
dest="$data/tablinum"
apps="$data/applications"
entry="$apps/tablinum.desktop"
marker="$dest/tablinum-install.txt"
desktop_dir=""
if command -v xdg-user-dir >/dev/null 2>&1; then desktop_dir=$(xdg-user-dir DESKTOP 2>/dev/null || true); fi
[ -n "$desktop_dir" ] || desktop_dir="$HOME/Desktop"
desktop_icon="$desktop_dir/tablinum.desktop"

gui() { [ "$quiet" -eq 0 ] && command -v zenity >/dev/null 2>&1 && [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; }
say() {
  printf '%s\n' "$1"
  if gui; then zenity --info --title="Tablinum Setup" --text="$1" --width=380 2>/dev/null || true
  elif [ "$quiet" -eq 0 ] && command -v notify-send >/dev/null 2>&1; then notify-send "Tablinum Setup" "$1" 2>/dev/null || true
  fi
}
fail() {
  printf '%s\n' "$1" >&2
  if gui; then zenity --error --title="Tablinum Setup" --text="$1" --width=380 2>/dev/null || true; fi
  exit 1
}
remove() {
  rm -f "$entry" "$desktop_icon"
  if [ -f "$marker" ]; then rm -rf "$dest"; fi
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$apps" >/dev/null 2>&1 || true
}

if [ "$mode" = uninstall ]; then
  remove
  say "Tablinum has been removed. Your saved progress stays in your web browser."
  exit 0
fi

src="$here/program"
[ -f "$src/index.html" ] || fail "Tablinum Setup cannot find its program folder. Extract the whole ZIP first, then run this file from the extracted folder."
if [ -e "$dest" ] && [ ! -f "$marker" ] && [ -n "$(ls -A "$dest" 2>/dev/null)" ]; then
  fail "The folder $dest already exists and was not created by Tablinum Setup. Nothing was changed."
fi

# Already installed and started by double-click: offer to update or to remove.
if [ -f "$marker" ] && gui; then
  choice=$(zenity --question --title="Tablinum Setup" --width=380 \
    --text="Tablinum is already installed. Install this copy over it, or remove Tablinum?" \
    --ok-label="Install this copy" --cancel-label="Cancel" --extra-button="Remove Tablinum" 2>/dev/null) && choice=install || true
  case "${choice:-}" in
    install) ;;
    "Remove Tablinum") remove; say "Tablinum has been removed. Your saved progress stays in your web browser."; exit 0 ;;
    *) exit 0 ;;
  esac
fi

# Copy to a fresh folder first, then swap, so a failed copy never leaves half a program.
mkdir -p "$data" "$apps"
staging="$data/.tablinum-new.$$"
rm -rf "$staging"
cp -R "$src" "$staging" || { rm -rf "$staging"; fail "Copying Tablinum failed. Check that there is free space in your home folder."; }
[ -f "$staging/index.html" ] || { rm -rf "$staging"; fail "The program was not copied correctly."; }
# Keep a copy of this setup script so the menu entry can offer "Remove Tablinum".
mkdir -p "$staging/install"
cp "$0" "$staging/install/tablinum-setup.sh" && chmod 755 "$staging/install/tablinum-setup.sh"
audio=$(find "$staging" -type f -name '*.mp3' | wc -l | tr -d ' ')
version=$(sed -n 's/.*"version" *: *"\([^"]*\)".*/\1/p' "$staging/install/package.json" 2>/dev/null | head -n 1)
printf 'Tablinum %s\naudio files: %s\ninstalled by Tablinum Setup\n' "${version:-unknown}" "$audio" > "$staging/tablinum-install.txt"
if [ -d "$dest" ]; then rm -rf "$dest"; fi
mv "$staging" "$dest"
chmod -R u+rwX,go+rX "$dest"

# Desktop Entry quoting: inside a quoted Exec argument, \ " ` $ need a backslash,
# and every backslash is doubled again because Exec is also an escaped string.
# A literal % must be written %%. Paths with spaces are handled by the quotes.
exec_quote() {
  printf '%s' "$1" | sed -e 's/\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e 's/`/\\\\`/g' -e 's/\$/\\\\$/g' -e 's/%/%%/g'
}
str_quote() { printf '%s' "$1" | sed -e 's/\\/\\\\/g'; }

target="$dest/index.html"
cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Tablinum
GenericName=Latin reader
Comment=Offline Latin reading course (Prima Via)
Exec=xdg-open "$(exec_quote "$target")"
Icon=$(str_quote "$dest/assets/icons/tablinum-256.png")
Terminal=false
Categories=Education;Languages;
Keywords=Latin;reader;course;
StartupNotify=false
Actions=remove;

[Desktop Action remove]
Name=Remove Tablinum
Exec=sh "$(exec_quote "$dest/install/tablinum-setup.sh")" --uninstall
DESKTOP
chmod 755 "$entry"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$apps" >/dev/null 2>&1 || true

where="in your applications menu (Education)"
if [ -d "$desktop_dir" ] && [ "$desktop_dir" != "$HOME" ]; then
  cp "$entry" "$desktop_icon"
  chmod 755 "$desktop_icon"
  # Nemo and Nautilus only launch desktop icons that are marked trusted.
  command -v gio >/dev/null 2>&1 && gio set "$desktop_icon" metadata::trusted true 2>/dev/null || true
  where="$where and on your desktop"
fi

if [ "$launch" -eq 1 ]; then
  for opener in xdg-open sensible-browser firefox chromium chromium-browser google-chrome; do
    if command -v "$opener" >/dev/null 2>&1; then "$opener" "$target" >/dev/null 2>&1 & break; fi
  done
fi
say "Tablinum is installed, with $audio recordings and music tracks. It is $where."
