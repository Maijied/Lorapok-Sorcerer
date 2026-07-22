#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
MODE="${1:-}"
node - "$MODE" <<'NODE'
const fs = require("fs");
const mode = process.argv[2];
const packagePath = "package.json";
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const match = String(pkg.version).match(/^(\d+)\.(\d+)\.(\d+)([-+].*)?$/);
if (!match) throw new Error(`Unsupported current version: ${pkg.version}`);
let [major, minor, patch] = match.slice(1, 4).map(Number);
if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(mode)) pkg.version = mode;
else if (mode === "major") pkg.version = `${major + 1}.0.0`;
else if (mode === "minor") pkg.version = `${major}.${minor + 1}.0`;
else if (mode === "patch") pkg.version = `${major}.${minor}.${patch + 1}`;
else throw new Error("Usage: scripts/version.sh <x.y.z[-prerelease]|major|minor|patch>");
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
if (fs.existsSync("package-lock.json")) {
  const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
  lock.version = pkg.version;
  if (lock.packages?.[""]) lock.packages[""].version = pkg.version;
  fs.writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
}
for (const path of ["manifests/firefox.json", "manifests/chromium.json", "src/manifest.json"]) {
  const manifest = JSON.parse(fs.readFileSync(path, "utf8"));
  manifest.version = pkg.version;
  fs.writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
}
fs.writeFileSync("site/version.json", JSON.stringify({ version: pkg.version }) + "\n");
console.log(`Synchronized version ${pkg.version}`);
NODE
