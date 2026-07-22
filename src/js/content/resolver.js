/* global browser, LoraMediaFinderDom, LoraMediaFinder */
(function () {
  "use strict";
  let lastTarget = null;
  document.addEventListener("contextmenu", (event) => {
    lastTarget = event.target;
  }, true);
  function inspect(target) {
    return LoraMediaFinder.resolve(LoraMediaFinderDom.collect(target, document));
  }
  browser.runtime.onMessage.addListener((message) => {
    if (message.type !== "collect-candidates") return undefined;
    let target = null;
    target = target || lastTarget;
    return Promise.resolve({ candidates: inspect(target) });
  });
}());
