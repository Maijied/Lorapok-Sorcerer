(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LorapokDiscord = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function validWebhookUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === "discord.com" || url.hostname === "discordapp.com") &&
        /^\/api\/webhooks\/[^/]+\/[^/]+/.test(url.pathname);
    } catch (error) { return false; }
  }
  function filenameFromUrl(value, contentType) {
    let name = "lorapok-image";
    try {
      const path = new URL(value).pathname;
      const part = path.substring(path.lastIndexOf("/") + 1);
      if (part) name = decodeURIComponent(part).replace(/[^\w.-]/g, "_");
    } catch (error) {}
    if (!/\.[a-z0-9]{2,8}$/i.test(name)) {
      const extensions = { "image/gif": "gif", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
        "image/avif": "avif", "image/svg+xml": "svg", "image/bmp": "bmp" };
      name += "." + (extensions[contentType] || "bin");
    }
    return name;
  }
  function payloadFor(note, sourceUrl) {
    const embed = { description: note || "Sent with Lorapok Sorcerer" };
    if (sourceUrl) embed.fields = [{ name: "Source page", value: sourceUrl }];
    return { embeds: [embed] };
  }
  return { validWebhookUrl, filenameFromUrl, payloadFor };
}));
