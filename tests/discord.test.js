const test = require("node:test");
const assert = require("node:assert/strict");
const discord = require("../src/js/lib/discord.js");
test("validates Discord webhook URLs", () => {
  assert.equal(discord.validWebhookUrl("https://discord.com/api/webhooks/123/token"), true);
  assert.equal(discord.validWebhookUrl("https://example.com/api/webhooks/123/token"), false);
});
test("keeps media extension and builds embed payload", () => {
  assert.equal(discord.filenameFromUrl("https://example.test/animation.gif?x=1", "image/gif"), "animation.gif");
  const payload = discord.payloadFor("hello https://example.test", "https://source.test/page");
  assert.equal(payload.embeds[0].description, "hello https://example.test");
  assert.equal(payload.embeds[0].fields[0].value, "https://source.test/page");
});
