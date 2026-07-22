(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LorapokUrlRules = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function safeUrl(value, base) {
    try { return new URL(value, base); } catch (error) { return null; }
  }
  function cleanUrl(value, base) {
    const parsed = safeUrl(value, base);
    if (!parsed) return value;
    const host = parsed.hostname.toLowerCase();
    let path = parsed.pathname;
    if (host.includes("twimg.com")) parsed.searchParams.set("name", "orig");
    if (host.includes("wikipedia.org") || host.includes("wikimedia.org")) {
      if (!path.includes("/thumb/")) return parsed.href;
      const parts = path.split("/thumb/");
      const tail = parts[1].split("/");
      parsed.pathname = parts[0] + "/" + tail.slice(0, -1).join("/");
    }
    if (host.includes("pinimg.com")) parsed.pathname = path.replace(/\/(?:236x|474x|564x|736x)\//, "/originals/");
    if (host.includes("googleusercontent.com")) parsed.pathname = path.replace(/=s\d+$/, "=s0").replace(/=w\d+$/, "=s0");
    ["w", "width", "h", "height", "resize", "size", "s"].forEach((key) => parsed.searchParams.delete(key));
    return parsed.href;
  }
  function isLikelyImageUrl(value) {
    const parsed = safeUrl(value);
    if (!parsed) return false;
    return /\.(?:png|jpe?g|webp|gif|avif|svg|bmp|jfif)(?:$|[?#])/i.test(parsed.pathname) ||
      /(?:image|img|media|photo|picture|original)/i.test(parsed.pathname);
  }
  return { cleanUrl, isLikelyImageUrl };
}));
