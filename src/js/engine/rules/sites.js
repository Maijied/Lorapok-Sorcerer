(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinderSites = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function parse(value) { try { return new URL(value); } catch (error) { return null; } }
  function pathVariant(url, expression, replacement) {
    const parsed = parse(url); if (!parsed) return [];
    const next = parsed.pathname.replace(expression, replacement);
    return next === parsed.pathname ? [] : [new URL(next, parsed.origin).href.replace(parsed.origin, parsed.origin)];
  }
  function queryVariant(url, keys, values) {
    const parsed = parse(url); if (!parsed) return [];
    keys.forEach((key) => parsed.searchParams.delete(key));
    if (values) Object.entries(values).forEach(([key, value]) => parsed.searchParams.set(key, value));
    return [parsed.href];
  }
  function suffixVariant(url, expression, replacement) {
    const parsed = parse(url); if (!parsed) return [];
    const next = parsed.pathname.replace(expression, replacement);
    return next === parsed.pathname ? [] : [new URL(next, parsed.origin).href + parsed.search];
  }
  function twitterVariant(url) {
    const parsed = parse(url); if (!parsed) return [];
    parsed.searchParams.set("format", parsed.searchParams.get("format") || "jpg");
    parsed.searchParams.set("name", "orig");
    return [parsed.href];
  }
  const rules = [
    { name: "Twitter / X", match: /(?:^|\.)twimg\.com$/i, transform: twitterVariant },
    { name: "Wikipedia / Wikimedia", match: /(?:^|\.)wikimedia\.org$|(?:^|\.)wikipedia\.org$/i, transform: (url) => {
      const parsed = parse(url); if (!parsed) return [];
      const match = parsed.pathname.match(/^(.*)\/thumb\/(.+)\/[^/]+$/i);
      return match ? [parsed.origin + match[1] + "/" + match[2]] : [];
    }},
    { name: "Pinterest", match: /(?:^|\.)pinimg\.com$/i, transform: (url) => pathVariant(url, /\/(?:236x|474x|564x|736x|750x)\//i, "/originals/") },
    { name: "Instagram / Facebook CDN", match: /(?:^|\.)fbcdn\.net$|(?:^|\.)instagram\.com$/i, transform: (url) => queryVariant(url, ["stp", "se", "efg", "ccb", "_nc_cat", "_nc_sid"]) },
    { name: "Googleusercontent / Blogspot", match: /(?:^|\.)googleusercontent\.com$|(?:^|\.)bp\.blogspot\.com$/i, transform: (url) => {
      const parsed = parse(url); if (!parsed) return [];
      parsed.pathname = parsed.pathname.replace(/=s\d+(?:-w\d+)?(?:-h\d+)?(?:-[a-z]+)?$/i, "=s0")
        .replace(/=w\d+(?:-h\d+)?$/i, "=s0");
      return [parsed.href];
    }},
    { name: "Imgur", match: /(?:^|\.)imgur\.com$/i, transform: (url) => suffixVariant(url, /_[sbtmlh](?=\.[a-z0-9]+$)/i, "") },
    { name: "Reddit", match: /(?:^|\.)preview\.redd\.it$|(?:^|\.)i\.redd\.it$/i, transform: (url) => {
      const parsed = parse(url); if (!parsed) return [];
      parsed.hostname = parsed.hostname.replace(/^preview\./i, "i.");
      parsed.search = "";
      return [parsed.href];
    }},
    { name: "Flickr", match: /(?:^|\.)staticflickr\.com$|(?:^|\.)flickr\.com$/i, transform: (url) => suffixVariant(url, /_[tmnwcbo](?=\.[a-z0-9]+$)/i, "_o") },
    { name: "Tumblr", match: /(?:^|\.)tumblr\.com$|(?:^|\.)media\.tumblr\.com$/i, transform: (url) => suffixVariant(url, /_(?:250|400|500|540|1280)(?=\.[a-z0-9]+$)/i, "_1280") },
    { name: "YouTube thumbnails", match: /(?:^|\.)ytimg\.com$/i, transform: (url) => {
      const parsed = parse(url); if (!parsed) return [];
      parsed.pathname = parsed.pathname.replace(/\/(?:default|hqdefault|mqdefault|sddefault)\.jpg$/i, "/maxresdefault.jpg");
      return [parsed.href];
    }},
    { name: "GitHub avatars", match: /(?:^|\.)githubusercontent\.com$|(?:^|\.)github\.com$/i, transform: (url) => queryVariant(url, ["s"]) },
    { name: "Gravatar", match: /(?:^|\.)gravatar\.com$/i, transform: (url) => queryVariant(url, ["s"], { s: "2048" }) },
    { name: "Unsplash", match: /(?:^|\.)images\.unsplash\.com$/i, transform: (url) => queryVariant(url, ["w", "h", "q", "fit", "fm", "crop"]) },
    { name: "WordPress media", match: /(?:^|\.)files\.wordpress\.com$|(?:^|\.)wp\.com$/i, transform: (url) => {
      const parsed = parse(url); if (!parsed) return [];
      parsed.searchParams.delete("w"); parsed.searchParams.delete("h");
      parsed.pathname = parsed.pathname.replace(/-\d{2,5}x\d{2,5}(?=\.[a-z0-9]+$)/i, "");
      return [parsed.href];
    }},
    { name: "Medium / Miro", match: /(?:^|\.)miro\.medium\.com$|(?:^|\.)miro\.com$/i, transform: (url) => suffixVariant(url, /\/(?:max|small|medium|large)\/\d+(?=\/|$)/i, "/original") },
    { name: "Discord CDN", match: /(?:^|\.)cdn\.discordapp\.com$|(?:^|\.)media\.discordapp\.net$/i, transform: (url) => queryVariant(url, ["size"], { size: "4096" }) },
    { name: "DeviantArt / WixMP", match: /(?:^|\.)wixmp\.com$|(?:^|\.)deviantart\.com$/i, transform: (url) => pathVariant(url, /\/v1\/(?:fit|fill)\//i, "/") },
    { name: "Shopify", match: /(?:^|\.)shopify\.com$|(?:^|\.)myshopify\.com$/i, transform: (url) => suffixVariant(url, /_\d+x\d*(?=\.[a-z0-9]+$)/i, "") },
    { name: "Wix static", match: /(?:^|\.)wixstatic\.com$/i, transform: (url) => pathVariant(url, /\/v1\/(?:fill|fit)\/[^/]+\//i, "/") },
    { name: "Cloudinary", match: /(?:^|\.)cloudinary\.com$/i, transform: (url) => pathVariant(url, /\/(?:w_\d+,?h?_\d*,?c?_[a-z]+|w_\d+|h_\d+|c_[a-z]+)(?=\/)/i, "") },
    { name: "Twitch", match: /(?:^|\.)twitchcdn\.net$|(?:^|\.)jtvnw\.net$/i, transform: (url) => pathVariant(url, /-\d+x\d+(?=\.[a-z0-9]+$)/i, "-1920x1080") },
    { name: "Steam", match: /(?:^|\.)steamusercontent\.com$|(?:^|\.)steamstatic\.com$/i, transform: (url) => queryVariant(url, ["size", "width", "height"]) },
    { name: "ArtStation", match: /(?:^|\.)artstation\.com$/i, transform: (url) => pathVariant(url, /\/(?:small|medium|large)\//i, "/4k/") },
    { name: "ImgBB", match: /(?:^|\.)ibb\.co$|(?:^|\.)imgbb\.com$/i, transform: (url) => suffixVariant(url, /_[a-z](?=\.[a-z0-9]+$)/i, "") },
    { name: "Bunny CDN", match: /(?:^|\.)b-cdn\.net$/i, transform: (url) => queryVariant(url, ["width", "height", "quality", "format"]) },
    { name: "KeyCDN", match: /(?:^|\.)kxcdn\.com$/i, transform: (url) => queryVariant(url, ["w", "h", "quality"]) },
    { name: "Imgix", match: /(?:^|\.)imgix\.net$/i, transform: (url) => queryVariant(url, ["w", "h", "q", "fit", "crop", "auto"]) },
    { name: "CloudFront image paths", match: /(?:^|\.)cloudfront\.net$/i, transform: (url) => pathVariant(url, /\/(?:small|medium|large|thumbnail)\//i, "/") }
  ];
  function matching(url) {
    const parsed = parse(url);
    return parsed ? rules.filter((rule) => rule.match.test(parsed.hostname)) : [];
  }
  return { rules, matching };
}));
