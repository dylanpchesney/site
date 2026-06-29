#!/bin/zsh
cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  exec python3 cms-server.py
fi

if command -v node >/dev/null 2>&1; then
  exec node cms-server.js
fi

echo "Could not find python3 or node."
echo "On macOS, Python 3 is usually preinstalled. Try: python3 cms-server.py"
exit 1
