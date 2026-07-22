const test = require("node:test");
const assert = require("node:assert/strict");
const srcset = require("../src/js/lib/srcset.js");
test("sorts srcset by width and density", () => {
  const values = srcset.parseSrcset("small.jpg 320w, large.jpg 1200w, retina.jpg 2x", "https://example.test/");
  assert.equal(values[0].url, "https://example.test/large.jpg");
  assert.equal(srcset.largest("a.jpg 1x, b.jpg 3x", "https://example.test/").url, "https://example.test/b.jpg");
});
