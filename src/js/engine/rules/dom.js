(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinderDom = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function parseSrcset(value, base) {
    if (!value) return [];
    return value.split(",").map((part, index) => {
      const bits = part.trim().split(/\s+/); if (!bits[0]) return null;
      const descriptor = bits[1] || "";
      const score = /w$/i.test(descriptor) ? parseFloat(descriptor) :
        /x$/i.test(descriptor) ? parseFloat(descriptor) * 100 : index;
      try { return { url: new URL(bits[0], base).href, score: Number.isFinite(score) ? score : index }; }
      catch (error) { return null; }
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }
  function styleUrl(value) {
    const match = String(value || "").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return match ? match[1] : "";
  }
  function collect(target, doc) {
    const candidates = [];
    const add = (url, score, reason) => {
      if (!url || candidates.some((item) => item.url === url)) return;
      candidates.push({ url, score, reason });
    };
    const element = target && target.closest ? target.closest("img, picture, a, [style]") : target;
    const image = element?.matches?.("img") || element?.getAttribute ? element :
      element?.querySelector?.("img") || element?.closest?.("picture")?.querySelector?.("img");
    if (image) {
      add(image.currentSrc || image.src, 500, "Rendered image");
      add(image.src, 450, "Image source");
      ["data-src", "data-original", "data-full", "data-zoom-image", "data-large_image", "data-lazy-src", "data-url"].forEach((key, index) => add(image.getAttribute(key), 800 - index * 10, "Lazy-load " + key));
      parseSrcset(image.getAttribute("srcset"), doc.baseURI).forEach((item) => add(item.url, 900 + item.score, "Image srcset"));
      image.closest("picture")?.querySelectorAll("source[srcset]").forEach((source) =>
        parseSrcset(source.getAttribute("srcset"), doc.baseURI).forEach((item) => add(item.url, 950 + item.score, "Picture source")));
      add(image.closest("a")?.href, 1000, "Wrapping link");
    } else {
      add(element?.closest?.("a")?.href, 700, "Link");
      add(styleUrl(element?.style?.backgroundImage), 650, "Background image");
    }
    doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:url"]').forEach((meta) => add(meta.content, 300, "Page metadata"));
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      try {
        const value = JSON.parse(script.textContent);
        const values = Array.isArray(value) ? value : [value];
        values.forEach((item) => {
          const images = Array.isArray(item.image) ? item.image : [item.image];
          images.forEach((imageValue) => add(typeof imageValue === "string" ? imageValue : imageValue?.url, 350, "JSON-LD image"));
        });
      } catch (error) {}
    });
    return candidates.sort((a, b) => b.score - a.score);
  }
  return { parseSrcset, collect, styleUrl };
}));
