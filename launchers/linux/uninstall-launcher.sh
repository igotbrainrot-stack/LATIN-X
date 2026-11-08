#!/bin/sh
# Tablinum — remove the menu entry and desktop icon created by install-launcher.sh.
# Your learning progress lives in the browser and is NOT touched.
set -eu
apps="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
rm -f "$apps/tablinum.desktop"
desktop_dir=""
if command -v xdg-user-dir >/dev/null 2>&1; then desktop_dir=$(xdg-user-dir DESKTOP 2>/dev/null || true); fi
[ -n "$desktop_dir" ] || desktop_dir="$HOME/Desktop"
rm -f "$desktop_dir/tablinum.desktop"
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$apps" >/dev/null 2>&1 || true
printf '%s\n' "Tablinum launcher removed."
