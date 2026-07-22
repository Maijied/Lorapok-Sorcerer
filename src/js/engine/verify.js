(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinderVerify = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  async function verify(candidates, options) {
    const config = options || {};
    const fetchFn = config.fetchFn || fetch;
    const maxBytes = config.maxBytes || 10 * 1024 * 1024;
    const checked = [];
    for (const candidate of candidates || []) {
      try {
        const response = await fetchFn(candidate.url);
        const type = response.headers?.get("content-type") || "";
        if (!response.ok || !/^(?:image|video)\//i.test(type)) continue;
        const blob = await response.blob();
        checked.push({ ...candidate, type, size: blob.size, verified: true, oversized: blob.size > maxBytes });
      } catch (error) {}
    }
    return checked.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.size || 0) - (a.size || 0));
  }
  return { verify };
}));
