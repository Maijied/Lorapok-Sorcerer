# Lorapok Sorcerer

**Lorapok Sorcerer** is a Lorapok Labs Firefox WebExtension that resolves
original/full-resolution images and sends them to Discord webhooks.

## Features

- Right-click images, selected text, or links and choose **Send to A2B**.
- Finds high-resolution `srcset`, `<picture>`, lazy-load, linked, metadata, and
  de-thumbnailed image candidates.
- Opens a branded preview window by default, with candidate switching, image
  details, note/links, and channel selection.
- Uploads media as a Discord multipart attachment. Files over 10 MB or failed
  downloads fall back to a URL-only message.
- Toolbar popup for sending text or URLs.
- Options for multiple webhooks, per-channel enablement, test messages, and
  quick-send mode.

## Temporary Firefox install

1. In Discord, open **Channel Settings → Integrations → Webhooks**, create a
   webhook, and copy its URL.
2. Run `npm install` in this repository.
3. Open `about:debugging` in Firefox, choose **This Firefox**, click **Load
   Temporary Add-on**, and select `src/manifest.json`.
4. Open the extension settings, add the webhook, and enable it.

## Build and test

```sh
npm ci
./scripts/test.sh
./scripts/build.sh
```

The build output is placed in `dist/lorapok-sorcerer-2.0.0.zip` with
`manifest.json` at the archive root. The extension is plain JavaScript and
Manifest V2; no bundler is required.

## Development

Pure URL rules, srcset parsing, Discord payload, and storage helpers are
covered by Node's built-in `node:test` runner. CI runs lint, tests, JavaScript
syntax checks, and the packaged build on pushes and pull requests.
