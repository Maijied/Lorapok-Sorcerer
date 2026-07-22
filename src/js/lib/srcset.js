(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LorapokSrcset = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function parseSrcset(value, base) {
    if (!value) return [];
    return value.split(",").map((part, index) => {
      const bits = part.trim().split(/\s+/);
      if (!bits[0]) return null;
      const descriptor = bits[1] || "";
      const score = descriptor.endsWith("w") ? parseFloat(descriptor) :
        descriptor.endsWith("x") ? parseFloat(descriptor) * 100 : index;
      try { return { url: new URL(bits[0], base).href, score: Number.isFinite(score) ? score : index }; }
      catch (error) { return null; }
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }
  return { parseSrcset, largest: (value, base) => parseSrcset(value, base)[0] };
}));
