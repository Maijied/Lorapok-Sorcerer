# Installation

## Firefox

For local development, open `about:debugging`, choose **This Firefox**, click
**Load Temporary Add-on**, and select `src/manifest.json`.

For a packaged install, build the Firefox archive:

```sh
npm ci
./scripts/build.sh firefox
```

Submit the resulting `dist/lorapok-sorcerer-firefox-2.0.0.zip` to AMO, or
install a signed AMO release.

## Chrome, Brave, Edge, and Opera

Build the Chromium MV3 archive:

```sh
npm ci
./scripts/build.sh chromium
```

For local testing, enable Developer mode in the browser's extension page and
choose **Load unpacked**, selecting a temporary Chromium build directory. The
archive is `dist/lorapok-sorcerer-chromium-2.0.0.zip`.

Create a Discord webhook from **Channel Settings → Integrations → Webhooks**,
then add it from Lorapok Sorcerer's Options page.
