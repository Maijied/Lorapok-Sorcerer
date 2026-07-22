# Image Max URL attribution

This directory vendors the stable `userscript_smaller.user.js` build from
[Image Max URL](https://github.com/qsniyg/maxurl) by qsniyg, licensed under
the Apache License 2.0.

The vendored build has one local integration modification: it exposes the
resolver as `globalThis.LorapokMaximage` so the extension's MV2 background page
and MV3 service worker can call it without a bundler. The resolver is wrapped
by `src/js/lib/imu.js`, which supplies the extension request adapter and
Promise API.

The complete upstream license is retained in `LICENSE.txt`.
