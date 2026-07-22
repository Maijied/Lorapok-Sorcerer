#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
npx web-ext lint --source-dir src
node --test
find src -name '*.js' -print0 | xargs -0 -n1 node --check
echo "All Lorapok Sorcerer checks passed."
