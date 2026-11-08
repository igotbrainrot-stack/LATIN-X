#!/bin/sh
# Tablinum — add a menu entry (and a desktop icon) on Linux Mint / any XDG desktop.
# Double-click this file and choose "Run" (no terminal is needed), or run it once
# from a terminal. It only writes two small .desktop files in your home folder.
# Re-run it after moving the Tablinum folder. Remove with uninstall-launcher.sh.
set -eu

here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
app=$(CDPATH= cd -- "$here/.." && pwd)

say() {
  if command -v zenity >/dev/null 2>&1 && [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then
    zenity --info --title="Tablinum" --text="$1" --no-wrap 2>/dev/null || true
  elif command -v notify-send >/dev/null 2>&1; then
    notify-send "Tablinum" "$1" 2>/dev/null || true
  fi
  printf '%s\n' "$1"
}

if [ ! -f "$app/index.html" ]; then
  say "Tablinum could not find index.html next to the linux folder. Extract the whole package and try again."
  exit 1
fi

# Desktop Entry quoting: inside a quoted Exec argument, \ " ` $ need a backslash,
# and every backslash is doubled again because Exec is also an escaped string.
# A literal % must be written %%. Paths with spaces are handled by the quotes.
exec_quote() {
  printf '%s' "$1" | sed -e 's/\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e 's/`/\\\\`/g' -e 's/\$/\\\\$/g' -e 's/%/%%/g'
}
# Other string keys (Icon, Path): only backslash, newline and tab are escaped.
str_quote() { printf '%s' "$1" | sed -e 's/\\/\\\\/g'; }

target="$app/index.html"
icon="$app/assets/icons/tablinum-256.png"
apps="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mkdir -p "$apps"
entry="$apps/tablinum.desktop"

cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Tablinum
GenericName=Latin reader
Comment=Offline Latin reading course (Prima Via)
Exec=xdg-open "$(exec_quote "$target")"
Icon=$(str_quote "$icon")
Terminal=false
Categories=Education;Languages;
Keywords=Latin;reader;course;
StartupNotify=false
DESKTOP
chmod 755 "$entry"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$apps" >/dev/null 2>&1 || true

desktop_dir=""
if command -v xdg-user-dir >/dev/null 2>&1; then desktop_dir=$(xdg-user-dir DESKTOP 2>/dev/null || true); fi
[ -n "$desktop_dir" ] || desktop_dir="$HOME/Desktop"
if [ -d "$desktop_dir" ] && [ "$desktop_dir" != "$HOME" ]; then
  cp "$entry" "$desktop_dir/tablinum.desktop"
  chmod 755 "$desktop_dir/tablinum.desktop"
  # Nemo/Nautilus only launch desktop icons that are marked trusted.
  command -v gio >/dev/null 2>&1 && gio set "$desktop_dir/tablinum.desktop" metadata::trusted true 2>/dev/null || true
fi

say "Tablinum is now in your applications menu (Education) and on your desktop."
