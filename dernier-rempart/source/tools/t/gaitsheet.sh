#!/bin/sh
# usage: tools/t/gaitsheet.sh walk|jog|run|brute  → $OUT/sheet-<kind>.png (8 frames, side view)
cd "$(dirname "$0")/../.." && OUT=${OUT:-shots} GAIT=$1 FRAMES=8 W=480 H=480 node tools/shot.mjs tools/t/gait.js | (grep -v KHR || true) && (cd ${OUT:-shots} && node "$OLDPWD/tools/sheet.mjs" sheet-$1.png $(for i in 0 1 2 3 4 5 6 7; do printf "gait-$1-$i.png "; done))
