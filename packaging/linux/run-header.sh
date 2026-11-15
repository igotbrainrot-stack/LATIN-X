#!/bin/sh
# Tablinum Setup for Linux: one file. Double-click it and choose "Run", or run
#   sh Tablinum-Setup.run            install for the current user and open Tablinum
#   sh Tablinum-Setup.run --uninstall | --no-launch | --quiet
#   sh Tablinum-Setup.run --extract DIR    only unpack the Setup folder into DIR
#
# The file is this short script followed by a gzip-compressed tar archive of the
# Setup folder. It unpacks into a temporary folder and starts the same installer that
# is inside the Setup ZIP ("Install Tablinum (Linux Mint).sh"), so both install the
# program in the same place, in the same way. No password, no internet.
set -eu
self="$0"
sum_expected="@SHA256@"
payload_line=@PAYLOAD_LINE@

fail() { printf '%s\n' "$1" >&2; exit 1; }
command -v tar >/dev/null 2>&1 || fail "Tablinum Setup needs the 'tar' program, which is missing on this computer."
command -v gzip >/dev/null 2>&1 || fail "Tablinum Setup needs the 'gzip' program, which is missing on this computer."

payload() { tail -n +"$payload_line" "$self"; }
if command -v sha256sum >/dev/null 2>&1; then
  sum_actual=$(payload | sha256sum | cut -d' ' -f1)
  [ "$sum_actual" = "$sum_expected" ] || fail "This Setup file is damaged or incomplete (checksum mismatch). Download or copy it again."
fi

if [ "${1:-}" = "--extract" ]; then
  [ -n "${2:-}" ] || fail "Usage: sh $(basename "$self") --extract DIR"
  mkdir -p "$2"
  payload | gzip -dc | tar -xf - -C "$2"
  printf 'Unpacked into %s\n' "$2"
  exit 0
fi

work=$(mktemp -d "${TMPDIR:-/tmp}/tablinum-setup.XXXXXX") || fail "Tablinum Setup could not create a temporary folder."
trap 'rm -rf "$work"' EXIT INT TERM
payload | gzip -dc | tar -xf - -C "$work" || fail "Tablinum Setup could not unpack its files. Check that there is free space."
installer="$work/@TOP@/@LINUX_INSTALLER@"
[ -f "$installer" ] || fail "Tablinum Setup is incomplete: its installer is missing."
sh "$installer" "$@"
status=$?
exit $status
# The archive starts on the next line. Do not edit below this line.
