#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
npx web-ext lint --source-dir src
rm -rf dist
mkdir -p dist
npx web-ext build --source-dir src --artifacts-dir dist --overwrite-dest --filename "lorapok-sorcerer-${npm_package_version:-2.0.0}.zip"
echo "Built $(find dist -maxdepth 1 -name '*.zip' -print -quit)"
