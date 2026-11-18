#!/bin/sh
# usage: tools/t/deathsheet.sh crumple,knees,...  → $OUT/dsheet-<kind>.png (6 frames, side view)
cd "$(dirname "$0")/../.." && OUT=${OUT:-shots}; TIMES=${TIMES:-0.15,0.35,0.55,0.8,1.2,2.4}
OUT=$OUT KIND=$1 TIMES=$TIMES W=560 H=420 node tools/shot.mjs tools/t/deathkinds.js | (grep -v "KHR\|GPU stall" || true)
for k in $(echo $1 | tr , ' '); do (cd $OUT && node "$OLDPWD/tools/sheet.mjs" dsheet-$k.png $(for t in $(echo $TIMES | tr , ' '); do printf "death-$k-$t.png "; done)); done
