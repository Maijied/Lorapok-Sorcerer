(function (root) {
  const api = {
    ENGINE_NAME: "LoraMediaFinder Engine",
    ENGINE_VERSION: "1.0.0"
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LoraMediaFinderVersion = api;
}(typeof globalThis !== "undefined" ? globalThis : this));
