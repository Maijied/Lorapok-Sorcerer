#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "Linting Firefox build output"
bash scripts/build.sh firefox
node --test
find src/js -type f -name '*.js' ! -path 'src/vendor/*' -print0 | xargs -0 -n1 node --check
echo "All Lorapok Sorcerer checks passed."
