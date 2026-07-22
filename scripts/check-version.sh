#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
node <<'NODE'
const fs = require("fs");
const expected = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
const paths = ["manifests/firefox.json", "manifests/chromium.json", "src/manifest.json"];
const values = paths.map((path) => [path, JSON.parse(fs.readFileSync(path, "utf8")).version]);
values.push(["site/version.json", JSON.parse(fs.readFileSync("site/version.json", "utf8")).version]);
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
values.push(["package-lock.json", lock.version]);
if (lock.packages?.[""]) values.push(["package-lock.json#packages[\"\"]", lock.packages[""].version]);
const mismatches = values.filter(([, version]) => version !== expected);
if (mismatches.length) {
  console.error(`Version mismatch: package.json=${expected}`);
  mismatches.forEach(([path, version]) => console.error(`  ${path}=${version}`));
  process.exit(1);
}
console.log(`Version consistency OK: ${expected}`);
NODE
