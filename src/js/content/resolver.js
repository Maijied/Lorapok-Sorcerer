/* global browser, LorapokUrlRules, LorapokSrcset */
(function () {
  "use strict";
  function add(list, url, score, reason) {
    if (!url) return;
    const cleaned = LorapokUrlRules.cleanUrl(url, document.baseURI);
    if (!list.some((item) => item.url === cleaned)) list.push({ url: cleaned, score, reason });
  }
  function inspect(target) {
    const candidates = [];
    const element = target && target.closest ? target.closest("img, picture, a") : target;
    const image = element && element.matches && element.matches("img") ? element :
      element && element.querySelector ? element.querySelector("img") : null;
    if (image) {
      add(candidates, image.currentSrc || image.src, 500, "Rendered image");
      add(candidates, image.src, 400, "Image source");
      ["data-src", "data-original", "data-full", "data-zoom-image", "data-large_image", "data-lazy-src"].forEach((key, i) => {
        add(candidates, image.getAttribute(key), 800 - i * 10, "Lazy-load " + key);
      });
      LorapokSrcset.parseSrcset(image.getAttribute("srcset"), document.baseURI)
        .forEach((item) => add(candidates, item.url, 900 + item.score, "Image srcset"));
      const picture = image.closest("picture");
      if (picture) picture.querySelectorAll("source[srcset]").forEach((source) => {
        LorapokSrcset.parseSrcset(source.getAttribute("srcset"), document.baseURI)
          .forEach((item) => add(candidates, item.url, 950 + item.score, "Picture source"));
      });
      add(candidates, image.closest("a")?.href, 1000, "Wrapping link");
    } else if (element && element.closest) add(candidates, element.closest("a")?.href, 700, "Link");
    const og = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
    if (og) add(candidates, og.content, 300, "Page metadata");
    return candidates.sort((a, b) => b.score - a.score);
  }
  browser.runtime.onMessage.addListener((message) => {
    if (message.type !== "collect-candidates") return undefined;
    let target = null;
    try { target = browser.menus.getTargetElement(message.targetElementId); } catch (error) {}
    return Promise.resolve({ candidates: inspect(target) });
  });
}());
