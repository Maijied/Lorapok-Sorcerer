const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("../src/js/lib/url-rules.js");
test("de-thumbnails Twitter images", () => assert.equal(rules.cleanUrl("https://pbs.twimg.com/media/x.jpg?name=small"), "https://pbs.twimg.com/media/x.jpg?name=orig"));
test("de-thumbnails Wikipedia", () => assert.equal(rules.cleanUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Cat.jpg/320px-Cat.jpg"), "https://upload.wikimedia.org/wikipedia/commons/a/a1/Cat.jpg"));
test("de-thumbnails Pinterest and Google", () => {
  assert.match(rules.cleanUrl("https://i.pinimg.com/474x/a/b/c.jpg"), /\/originals\/a\/b\/c\.jpg$/);
  assert.match(rules.cleanUrl("https://lh3.googleusercontent.com/a=w640"), /=s0$/);
});
