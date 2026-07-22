(function (root, factory) {
  const generic = root.LoraMediaFinderGeneric ||
    (typeof require === "function" ? require("./rules/generic.js") : null);
  const sites = root.LoraMediaFinderSites ||
    (typeof require === "function" ? require("./rules/sites.js") : null);
  const api = factory(generic, sites);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinder = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (generic, sites) {
  "use strict";
  function normalizeCandidate(value) {
    const item = typeof value === "string" ? { url: value } : { ...(value || {}) };
    const url = generic.normalize(item.url);
    return url ? { ...item, url } : null;
  }
  function dedupe(values) {
    const seen = new Set();
    return values.filter((item) => item && !seen.has(item.url) && seen.add(item.url));
  }
  function score(candidate, index) {
    const mediaBonus = generic.isMediaUrl(candidate.url) ? 20 : 0;
    return (candidate.score || 0) + mediaBonus - index / 1000;
  }
  function resolve(input) {
    const initial = (input || []).map(normalizeCandidate).filter(Boolean);
    const expanded = [];
    initial.forEach((candidate, index) => {
      expanded.push({ ...candidate, score: score(candidate, index) });
      sites.matching(candidate.url).forEach((rule) => {
        (rule.transform(candidate.url) || []).forEach((url) => {
          const normalized = normalizeCandidate(url);
          if (normalized) expanded.push({ ...normalized, score: (candidate.score || 0) + 400, reason: rule.name + " rule", rule: rule.name });
        });
      });
      generic.candidates(candidate.url).forEach((url) => {
        const normalized = normalizeCandidate(url);
        if (normalized) expanded.push({ ...normalized, score: (candidate.score || 0) + 250, reason: "Generic size rule", rule: "generic" });
      });
    });
    return dedupe(expanded).sort((a, b) => b.score - a.score);
  }
  return { normalizeCandidate, resolve, dedupe, score };
}));
