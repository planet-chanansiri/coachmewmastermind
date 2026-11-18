#!/bin/sh
# Regenerate assets/data.js from the source JSON (run after editing the JSON).
cd "$(dirname "$0")/.."
{ printf 'window.QUIZ_DATA = '; cat data/Cosmic_Identity_Developer_Source_16Q_V3_Brand_Story.json; printf ';\n'; } > assets/data.js
echo "assets/data.js updated"
