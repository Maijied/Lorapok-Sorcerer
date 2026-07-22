# A2B Media Sender

A small Firefox WebExtension for sending images and animated GIFs to Discord
channels through webhooks.

## Setup

1. In Discord, open a channel's **Channel Settings → Integrations → Webhooks**,
   create a webhook, and copy its URL.
2. Load the extension temporarily in Firefox: open `about:debugging`, choose
   **This Firefox**, click **Load Temporary Add-on**, and select this
   directory's `manifest.json`.
3. Open the extension's settings page from the add-ons manager. Add a friendly
   name and webhook URL for each channel, then enable the channels you want in
   the image context menu.
4. Right-click an image on any website, choose **Send to A2B**, and select a
   channel.

For a distributable package, use the included `a2b-media-sender.zip` (or create
one with `npx web-ext build`). The zip must contain `manifest.json` at its root.

Images up to 8 MB are uploaded directly as files. If an image cannot be
fetched or is too large, the extension sends its URL instead.
