(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LorapokStorage = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const defaults = { channels: [], settings: { quickSend: false }, recent: [] };
  function normalize(data) {
    return { channels: Array.isArray(data.channels) ? data.channels : [],
      settings: { ...defaults.settings, ...(data.settings || {}) },
      recent: Array.isArray(data.recent) ? data.recent : [] };
  }
  function makeChannel(name, url) {
    return { id: "channel-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      name: name.trim(), url: url.trim(), enabled: true };
  }
  return { defaults, normalize, makeChannel };
}));
