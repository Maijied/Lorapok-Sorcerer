#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
TARGET="${1:-all}"
VERSION="${npm_package_version:-2.0.0}"
BUILD_ROOT="$ROOT/.build"
trap 'rm -rf "$BUILD_ROOT"' EXIT

build_target() {
  local target="$1"
  local stage="$BUILD_ROOT/$target"
  local archive="$ROOT/dist/lorapok-sorcerer-${target}-${VERSION}.zip"
  rm -rf "$stage"
  mkdir -p "$stage"
  cp -R src/. "$stage/"
  cp "manifests/${target}.json" "$stage/manifest.json"
  if [[ "$target" == "firefox" ]]; then
    echo "Linting ${target} source"
    npx web-ext lint --source-dir "$stage"
  else
    echo "Skipping web-ext lint for Chromium MV3 (web-ext validates Firefox manifests)"
  fi
  npx web-ext build --source-dir "$stage" --artifacts-dir "$ROOT/dist" --overwrite-dest --filename "$(basename "$archive")"
  echo "Built $archive"
}

case "$TARGET" in
  firefox|chromium)
    rm -rf dist
    mkdir -p dist
    build_target "$TARGET"
    ;;
  all)
    rm -rf dist
    mkdir -p dist
    build_target firefox
    build_target chromium
    ;;
  *)
    echo "Usage: $0 [firefox|chromium|all]" >&2
    exit 2
    ;;
esac
