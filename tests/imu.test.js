const test = require("node:test");
const assert = require("node:assert/strict");
const imu = require("../src/js/lib/imu.js");

test("IMU resolves a Twitter thumbnail into original candidates", async () => {
  const results = await imu.resolve("https://pbs.twimg.com/media/lorapok.jpg?name=small", { iterations: 5 });
  assert.ok(results.some((result) => result.url.includes("name=orig")));
});

test("IMU request adapter exposes an XHR-like response", async () => {
  let loaded;
  const originalFetch = global.fetch;
  global.fetch = async () => new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain" }
  });
  imu.requestAdapter({
    url: "https://example.test/data",
    onload: (response) => { loaded = response; }
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  global.fetch = originalFetch;
  assert.equal(loaded.status, 200);
  assert.equal(loaded.responseText, "ok");
  assert.equal(loaded.getResponseHeader("content-type"), "text/plain");
});
