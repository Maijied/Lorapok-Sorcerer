/* global browser */

const MENU_ID = "a2b-send-to";
const CHANNEL_PREFIX = "a2b-channel-";
const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

function getChannels() {
  return browser.storage.local.get({ channels: [] }).then((data) => data.channels);
}

function notify(title, message) {
  if (!browser.notifications) {
    return;
  }
  browser.notifications.create({
    type: "basic",
    title,
    message,
    iconUrl: browser.runtime.getURL("icons/icon-48.png")
  }).catch(() => {});
}

function isWebhookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "discord.com" || url.hostname === "discordapp.com") &&
      /^\/api\/webhooks\/[^/]+\/[^/]+/.test(url.pathname);
  } catch (error) {
    return false;
  }
}

function rebuildMenus() {
  return getChannels().then((channels) => {
    return browser.contextMenus.removeAll().then(() => {
      browser.contextMenus.create({
        id: MENU_ID,
        title: "Send to A2B",
        contexts: ["image"]
      });
      channels.filter((channel) => channel.enabled && isWebhookUrl(channel.url))
        .forEach((channel) => {
          browser.contextMenus.create({
            id: CHANNEL_PREFIX + channel.id,
            parentId: MENU_ID,
            title: channel.name,
            contexts: ["image"]
          });
        });
    });
  }).catch((error) => {
    console.error("Unable to rebuild context menus", error);
  });
}

function filenameFromUrl(imageUrl, contentType) {
  let name = "image";
  try {
    const pathname = new URL(imageUrl).pathname;
    const lastPart = pathname.substring(pathname.lastIndexOf("/") + 1);
    if (lastPart) {
      name = decodeURIComponent(lastPart).replace(/[^\w.-]/g, "_");
    }
  } catch (error) {
    // Use the generic filename below for malformed URLs.
  }
  if (!/\.[a-z0-9]{2,5}$/i.test(name)) {
    const typeExtension = {
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif"
    }[contentType];
    name += "." + (typeExtension || "bin");
  }
  return name;
}

async function sendImage(channel, imageUrl, pageUrl) {
  const payload = {
    content: pageUrl ? "Source: " + pageUrl : undefined
  };
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Image request returned " + response.status);
    }
    const blob = await response.blob();
    if (blob.size > MAX_UPLOAD_SIZE) {
      throw new Error("Image is larger than 8 MB");
    }
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(payload));
    formData.append("files[0]", blob, filenameFromUrl(imageUrl, blob.type));
    const upload = await fetch(channel.url, { method: "POST", body: formData });
    if (!upload.ok) {
      throw new Error("Discord upload returned " + upload.status);
    }
    notify("A2B Media Sender", "Image sent to " + channel.name);
  } catch (error) {
    console.warn("Upload failed; sending image URL instead", error);
    try {
      const fallback = await fetch(channel.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: imageUrl })
      });
      if (!fallback.ok) {
        throw new Error("Discord fallback returned " + fallback.status);
      }
      notify("A2B Media Sender", "Upload failed; image URL sent to " + channel.name);
    } catch (fallbackError) {
      console.error("Fallback send failed", fallbackError);
      notify("A2B Media Sender", "Could not send image to " + channel.name);
    }
  }
}

browser.runtime.onInstalled.addListener(rebuildMenus);
browser.runtime.onStartup.addListener(rebuildMenus);
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.channels) {
    rebuildMenus();
  }
});
browser.contextMenus.onClicked.addListener((info) => {
  if (!info.menuItemId.startsWith(CHANNEL_PREFIX) || !info.srcUrl) {
    return;
  }
  const channelId = info.menuItemId.substring(CHANNEL_PREFIX.length);
  getChannels().then((channels) => {
    const channel = channels.find((item) => item.id === channelId && item.enabled);
    if (channel) {
      sendImage(channel, info.srcUrl, info.pageUrl);
    }
  });
});
rebuildMenus();
