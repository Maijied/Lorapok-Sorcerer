(function (root, factory) {
  const api = factory(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LorapokIMU = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";
  let nodeMaximage;
  function getEngine() {
    if (root && root.LorapokMaximage) return root.LorapokMaximage;
    if (typeof require === "function") {
      if (!nodeMaximage) nodeMaximage = require("../../vendor/maxurl/userscript_smaller.user.js");
      return nodeMaximage;
    }
    return null;
  }
  function requestAdapter(request) {
    const method = request.method || "GET";
    const headers = request.headers || {};
    const init = { method, headers, credentials: request.withCredentials === false ? "omit" : "include" };
    if (request.data !== undefined) init.body = request.data;
    const done = (callback, response, responseText) => callback({
      finalUrl: response.url || request.url,
      readyState: 4,
      status: response.status,
      responseText,
      responseHeaders: Array.from(response.headers.entries()).map((entry) => entry.join(": ")).join("\r\n"),
      getResponseHeader: (name) => response.headers.get(name)
    });
    fetch(request.url, init).then((response) => response.text().then((text) => done(request.onload || (() => {}), response, text)))
      .catch((error) => {
        const callback = request.onerror || request.onload;
        if (callback) callback({ finalUrl: request.url, readyState: 4, status: 0, responseText: "", error });
      });
    return { abort: () => {} };
  }
  function resolve(url, options) {
    const engine = getEngine();
    if (!engine) return Promise.resolve([]);
    return new Promise((resolveResult) => {
      let settled = false;
      const finish = (results) => {
        if (settled) return;
        settled = true;
        resolveResult(Array.isArray(results) ? results : []);
      };
      try {
        engine(url, {
          fill_object: true,
          iterations: 50,
          use_cache: true,
          use_api_cache: true,
          exclude_videos: false,
          filter: () => true,
          do_request: requestAdapter,
          ...(options || {}),
          cb: finish
        });
      } catch (error) {
        finish([]);
      }
    });
  }
  return { resolve, requestAdapter };
}));
