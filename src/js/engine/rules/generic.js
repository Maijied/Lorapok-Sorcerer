(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinderGeneric = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const RESIZE_QUERY = /^(?:w|h|width|height|size|resize|quality|q|fit|crop|dpr|format)$/i;
  const MEDIA_EXT = /\.(?:png|jpe?g|webp|gif|avif|svg|bmp|jfif|tiff?|ico|mp4|webm|mov)(?:$|[?#])/i;

  function parse(value, base) {
    try { return new URL(value, base || undefined); } catch (error) { return null; }
  }
  function cleanQuery(url) {
    [...url.searchParams.keys()].forEach((key) => {
      if (RESIZE_QUERY.test(key)) url.searchParams.delete(key);
    });
    return url;
  }
  function cleanPath(path) {
    let result = path
      .replace(/\/(?:resized|resize|thumbs?|thumbnail|small|medium|large)\/(?=\w)/ig, "/")
      .replace(/\/s\/(?:\d+x\d+|\d+)(?=\/|$)/ig, "/")
      .replace(/(?:[-_]\d{2,5}x\d{2,5})(?:@2x)?(?=\.[a-z0-9]+$)/i, "")
      .replace(/@2x(?=\.[a-z0-9]+$)/i, "");
    return result || path;
  }
  function normalize(value, base) {
    const url = parse(value, base);
    if (!url || !/^https?:$/i.test(url.protocol)) return null;
    cleanQuery(url);
    url.pathname = cleanPath(url.pathname);
    return url.href;
  }
  function candidates(value, base) {
    const url = parse(value, base);
    if (!url || !/^https?:$/i.test(url.protocol)) return [];
    const original = url.href;
    const cleaned = normalize(original);
    return cleaned && cleaned !== original ? [cleaned] : [];
  }
  function isMediaUrl(value) {
    const url = parse(value);
    return Boolean(url && (MEDIA_EXT.test(url.pathname) ||
      /(?:image|img|media|photo|picture|avatar|upload|content|original)/i.test(url.pathname) ||
      (!/[.][a-z0-9]{2,8}$/i.test(url.pathname) && url.pathname.split("/").filter(Boolean).length > 1)));
  }
  return { normalize, candidates, isMediaUrl, parseSrcsetResizeQuery: cleanQuery };
}));
