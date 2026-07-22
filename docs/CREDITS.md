# Credits

## Image Max URL

Original-image resolution is powered by
[Image Max URL](https://github.com/qsniyg/maxurl) by qsniyg, licensed under
the Apache License 2.0. The stable `userscript_smaller.user.js` build is
vendored under `src/vendor/maxurl/`.

The local integration adds a `globalThis.LorapokMaximage` export and wraps the
engine with `src/js/lib/imu.js`. The upstream `LICENSE.txt` and integration
notice are included alongside the vendor source.

## Browser polyfill

`browser-polyfill.min.js` is provided by
[webextension-polyfill](https://github.com/mozilla/webextension-polyfill),
licensed under the Mozilla Public License 2.0.
