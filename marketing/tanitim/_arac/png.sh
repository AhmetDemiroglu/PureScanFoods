#!/bin/zsh
# SVG slaytlari 2160x2700 PNG'ye cevirir (headless Chrome). Kullanim: png.sh
D="${0:A:h:h}"
mkdir -p "$D/png"
for f in "$D"/0*.svg; do
  n="${f:t:r}"; out="$D/png/$n.png"; rm -f "$out"
  P="$(mktemp -d "${TMPDIR:-/tmp}/ps-chrome.XXXXXX")"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size=1080,1350 --user-data-dir="$P" --screenshot="$out" "file://$f" >/dev/null 2>&1 &
  for i in {1..60}; do [ -s "$out" ] && break; sleep 0.5; done
  sleep 0.7; pkill -f "user-data-dir=$P" 2>/dev/null; rm -rf "$P"
  [ -s "$out" ] && echo "PNG: $out" || echo "URETILEMEDI: $n"
done
