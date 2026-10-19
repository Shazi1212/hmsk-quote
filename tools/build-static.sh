#!/usr/bin/env bash
# Build a static, browser-only copy of the app (no server, data in localStorage).
#   tools/build-static.sh OUTDIR [CONFIG.js]
# OUTDIR gets index.html + assets; CONFIG.js replaces config.js (default: public/config.js).
# All URLs inside the app are relative, so OUTDIR can be served from any sub-path (e.g. /apps/quote/).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:?usage: tools/build-static.sh OUTDIR [CONFIG.js]}"
CFG="${2:-public/config.js}"
mkdir -p "$OUT/assets"
for f in index.html app.css app.js i18n.js rules.js render.js xrechnung.js demo.js quote.js; do cp "public/$f" "$OUT/$f"; done
cp public/assets/icon.svg "$OUT/assets/icon.svg"
cp "$CFG" "$OUT/config.js"
echo "Static build written to $OUT"
