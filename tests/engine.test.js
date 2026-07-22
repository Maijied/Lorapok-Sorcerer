const test = require("node:test");
const assert = require("node:assert/strict");
const generic = require("../src/js/engine/rules/generic.js");
const sites = require("../src/js/engine/rules/sites.js");
const dom = require("../src/js/engine/rules/dom.js");
const engine = require("../src/js/engine/core.js");
const verify = require("../src/js/engine/verify.js");

function transformed(url, hostname) {
  const rule = sites.rules.find((item) => item.match.test(hostname));
  assert.ok(rule, `missing rule for ${hostname}`);
  const values = rule.transform(url);
  assert.ok(values.length, `rule did not transform ${url}`);
  return values[0];
}

test("generic rules strip resize query and path variants", () => {
  assert.equal(generic.normalize("https://cdn.test/photo.jpg?w=640&h=480&q=70"), "https://cdn.test/photo.jpg");
  assert.equal(generic.normalize("https://cdn.test/thumbs/photo-150x150@2x.jpg"), "https://cdn.test/photo.jpg");
  assert.equal(generic.isMediaUrl("https://cdn.test/assets/abcdef"), true);
  assert.deepEqual(generic.candidates("https://cdn.test/x.jpg?width=320"), ["https://cdn.test/x.jpg"]);
});

test("srcset parser ranks width and density descriptors", () => {
  const values = dom.parseSrcset("small.jpg 320w, retina.jpg 2x, large.jpg 1200w", "https://example.test/");
  assert.equal(values[0].url, "https://example.test/large.jpg");
  assert.equal(values[1].url, "https://example.test/small.jpg");
  assert.equal(values.at(-1).url, "https://example.test/retina.jpg");
});

test("site rules cover major media hosts", () => {
  assert.match(transformed("https://pbs.twimg.com/media/a.jpg?name=small", "pbs.twimg.com"), /name=orig/);
  assert.equal(
    transformed("https://pbs.twimg.com/media/XXX?format=jpg&name=small", "pbs.twimg.com"),
    "https://pbs.twimg.com/media/XXX?format=jpg&name=orig"
  );
  assert.match(transformed("https://pbs.twimg.com/media/without-extension?name=small", "pbs.twimg.com"), /format=jpg/);
  assert.match(transformed("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a/Cat.jpg/320px-Cat.jpg", "upload.wikimedia.org"), /commons\/a\/a\/Cat\.jpg$/);
  assert.match(transformed("https://i.pinimg.com/474x/a/b/c.jpg", "i.pinimg.com"), /originals/);
  assert.doesNotMatch(transformed("https://scontent.fbcdn.net/a.jpg?stp=dst-jpg&_nc_sid=x", "scontent.fbcdn.net"), /stp=/);
  assert.match(transformed("https://lh3.googleusercontent.com/a=w640-h480", "lh3.googleusercontent.com"), /=s0/);
  assert.match(transformed("https://i.imgur.com/photo_s.jpg", "i.imgur.com"), /photo\.jpg$/);
  assert.match(transformed("https://preview.redd.it/photo.jpg?width=640", "preview.redd.it"), /i\.redd\.it\/photo\.jpg$/);
  assert.match(transformed("https://live.staticflickr.com/1/a_m.jpg", "live.staticflickr.com"), /a_o\.jpg$/);
  assert.match(transformed("https://media.tumblr.com/photo_500.jpg", "media.tumblr.com"), /photo_1280\.jpg$/);
  assert.match(transformed("https://i.ytimg.com/vi/id/hqdefault.jpg", "i.ytimg.com"), /maxresdefault\.jpg$/);
  assert.doesNotMatch(transformed("https://avatars.githubusercontent.com/u/1?s=96", "avatars.githubusercontent.com"), /[?&]s=/);
  assert.match(transformed("https://www.gravatar.com/avatar/hash?s=80", "www.gravatar.com"), /s=2048/);
  assert.doesNotMatch(transformed("https://images.unsplash.com/photo.jpg?w=400&q=70", "images.unsplash.com"), /[?&](w|q)=/);
  assert.doesNotMatch(transformed("https://files.wordpress.com/photo-300x200.jpg?w=300", "files.wordpress.com"), /300x200|[?&]w=/);
  assert.match(transformed("https://miro.medium.com/max/800/photo.jpg", "miro.medium.com"), /original/);
  assert.match(transformed("https://cdn.discordapp.com/attachments/a.jpg?size=256", "cdn.discordapp.com"), /size=4096/);
  assert.doesNotMatch(transformed("https://wixmp.com/v1/fill/w_500/photo.jpg", "wixmp.com"), /\/v1\/fill/);
  assert.doesNotMatch(transformed("https://cdn.shopify.com/photo_400x400.jpg", "cdn.shopify.com"), /400x400/);
  assert.doesNotMatch(transformed("https://static.wixstatic.com/media/v1/fill/w_200/photo.jpg", "static.wixstatic.com"), /\/v1\/fill/);
  assert.doesNotMatch(transformed("https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/photo.jpg", "res.cloudinary.com"), /w_400/);
  assert.match(transformed("https://static-cdn.jtvnw.net/twitch-video-thumb-640x360.jpg", "static-cdn.jtvnw.net"), /1920x1080/);
  assert.doesNotMatch(transformed("https://steamusercontent.com/image.jpg?width=200", "steamusercontent.com"), /width=/);
  assert.match(transformed("https://cdna.artstation.com/medium/photo.jpg", "cdna.artstation.com"), /4k/);
  assert.match(transformed("https://i.ibb.co/abc/photo_s.jpg", "i.ibb.co"), /photo\.jpg$/);
  assert.doesNotMatch(transformed("https://foo.b-cdn.net/photo.jpg?width=200", "foo.b-cdn.net"), /width=/);
  assert.doesNotMatch(transformed("https://foo.kxcdn.com/photo.jpg?w=200", "foo.kxcdn.com"), /[?&]w=/);
  assert.doesNotMatch(transformed("https://foo.imgix.net/photo.jpg?w=200&auto=format", "foo.imgix.net"), /[?&](w|auto)=/);
  assert.doesNotMatch(transformed("https://foo.cloudfront.net/small/photo.jpg", "foo.cloudfront.net"), /\/small\//);
});

test("core normalizes, expands, scores, and deduplicates candidates", () => {
  const values = engine.resolve([
    { url: "https://pbs.twimg.com/media/a.jpg?name=small", score: 10 },
    { url: "https://pbs.twimg.com/media/a.jpg?name=orig", score: 2 }
  ]);
  assert.equal(values.length, 2);
  assert.match(values[0].url, /name=orig/);
  assert.ok(values[0].score > values[1].score);
  assert.equal(engine.dedupe([{ url: "a" }, { url: "a" }]).length, 1);
});

test("verification accepts media, records size, and rejects other content", async () => {
  const fetchFn = async (url) => ({
    ok: !url.includes("bad"),
    headers: { get: (name) => name === "content-type" ? (url.includes("text") ? "text/plain" : "image/jpeg") : null },
    blob: async () => new Blob(["12345"], { type: "image/jpeg" })
  });
  const values = await verify.verify([
    { url: "https://ok.test/a", score: 2 },
    { url: "https://text.test/a", score: 10 },
    { url: "https://bad.test/a", score: 20 }
  ], { fetchFn });
  assert.equal(values.length, 1);
  assert.equal(values[0].size, 5);
  assert.equal(values[0].verified, true);
});

test("DOM extraction includes lazy, metadata, JSON-LD, background, and picture candidates", () => {
  const image = {
    currentSrc: "https://cdn.test/current.jpg",
    src: "https://cdn.test/base.jpg",
    getAttribute: (key) => ({ srcset: "small.jpg 320w, large.jpg 1200w", "data-full": "/full.jpg" }[key] || null),
    closest: (selector) => selector === "picture" ? { querySelectorAll: () => [] } : { href: "https://cdn.test/wrapped.jpg" }
  };
  const doc = {
    baseURI: "https://example.test/page",
    querySelectorAll: (selector) => selector.includes("meta") ? [
      { content: "https://cdn.test/og.jpg" }
    ] : [{ textContent: JSON.stringify({ image: "https://cdn.test/jsonld.jpg" }) }],
  };
  const target = { closest: () => image };
  const values = dom.collect(target, doc);
  assert.ok(values.some((item) => item.reason === "Lazy-load data-full"));
  assert.ok(values.some((item) => item.reason === "Image srcset"));
  assert.ok(values.some((item) => item.reason === "Page metadata"));
  assert.ok(values.some((item) => item.reason === "JSON-LD image"));
});
