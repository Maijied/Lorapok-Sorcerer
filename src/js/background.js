/* global browser, LorapokDiscord, LorapokStorage, LoraMediaFinder, LoraMediaFinderVerify, LoraMediaFinderVersion */
const MENU_ROOT = "lorapok-root";
const CHANNEL_PREFIX = "lorapok-channel-";
const MAX_BYTES = 10 * 1024 * 1024;
function state() {
  return browser.storage.local.get(LorapokStorage.defaults).then(LorapokStorage.normalize);
}
function notice(title, message) {
  browser.notifications.create({ type: "basic", title, message,
    iconUrl: browser.runtime.getURL("icons/icon-48.png") }).catch(() => {});
}
function rebuildMenus() {
  return state().then((data) => browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({ id: MENU_ROOT, title: "Send to A2B", contexts: ["image", "selection", "link"] });
    data.channels.filter((channel) => channel.enabled).forEach((channel) => browser.contextMenus.create({
      id: CHANNEL_PREFIX + channel.id, parentId: MENU_ROOT, title: channel.name,
      contexts: ["image", "selection", "link"]
    }));
  })).catch((error) => console.error("Menu rebuild failed", error));
}
async function collect(info, tab) {
  if (info.mediaType === "image") {
    try {
      const options = typeof info.frameId === "number" ? { frameId: info.frameId } : undefined;
      const result = await browser.tabs.sendMessage(tab.id,
        { type: "collect-candidates", targetElementId: info.targetElementId }, options);
      if (result?.candidates?.length) return result.candidates;
    } catch (error) {}
    return [{ url: info.srcUrl, score: 1, reason: "Context image" }];
  }
  if (info.linkUrl) return [{ url: info.linkUrl, score: 1, reason: "Link" }];
  return [{ url: info.selectionText, score: 1, reason: "Selected text" }];
}
async function prepare(request) {
  const expanded = LoraMediaFinder.resolve(request.candidates);
  const candidates = await LoraMediaFinderVerify.verify(expanded);
  candidates.forEach((candidate) => {
    candidate.loraMediaFinder = Boolean(candidate.rule || candidate.reason?.includes("rule"));
  });
  return { ...request, candidates, selected: candidates[0] || request.candidates[0] };
}
async function upload(channel, request) {
  if (!request.selected?.url) throw new Error("No media candidate");
  try {
    const response = await fetch(request.selected.url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    if (blob.size > MAX_BYTES) throw new Error("File exceeds 10 MB");
    const form = new FormData();
    form.append("payload_json", JSON.stringify(LorapokDiscord.payloadFor(request.note, request.pageUrl)));
    form.append("files[0]", blob, LorapokDiscord.filenameFromUrl(request.selected.url, blob.type));
    const sent = await fetch(channel.url, { method: "POST", body: form });
    if (!sent.ok) throw new Error("Upload failed");
  } catch (error) {
    const fallback = await fetch(channel.url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: request.selected.url }) });
    if (!fallback.ok) throw error;
  }
  const recent = (await state()).recent;
  recent.unshift({
    at: Date.now(),
    channel: channel.name,
    text: request.note || request.selected.url,
    thumbnail: /^(?:image|video)\//i.test(request.selected.type || "") ? request.selected.url : ""
  });
  await browser.storage.local.set({ recent: recent.slice(0, 50) });
  notice("Lorapok Sorcerer", "Sent to " + channel.name);
}
async function openPreview(request) {
  const prepared = await prepare(request);
  const id = "preview-" + Date.now();
  await browser.storage.local.set({ ["preview_" + id]: prepared });
  await browser.windows.create({ url: browser.runtime.getURL("preview.html") + "?id=" + id,
    type: "popup", width: 620, height: 760 });
}
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === "preview-send") {
    const data = await state();
    const channel = data.channels.find((item) => item.id === message.channelId);
    if (channel) await upload(channel, message.request);
    return { ok: true };
  }
  if (message.type === "test-webhook") {
    const sent = await fetch(message.url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Lorapok Sorcerer test signal ✦" }) });
    if (!sent.ok) throw new Error("Test failed");
    return { ok: true };
  }
  if (message.type === "popup-send") {
    const data = await state();
    const channel = data.channels.find((item) => item.id === message.channelId);
    if (!channel) throw new Error("Select a channel");
    await upload(channel, { selected: { url: message.text }, note: message.text, pageUrl: "" });
    return { ok: true };
  }
  return undefined;
});
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!String(info.menuItemId).startsWith(CHANNEL_PREFIX)) return;
  const data = await state();
  const channel = data.channels.find((item) => CHANNEL_PREFIX + item.id === info.menuItemId && item.enabled);
  if (!channel) return;
  const request = { candidates: await collect(info, tab), pageUrl: info.pageUrl || "", note: info.selectionText || "" };
  if (data.settings.quickSend && info.mediaType === "image") await upload(channel, await prepare(request));
  else { request.channelId = channel.id; await openPreview(request); }
});
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.channels || changes.settings)) rebuildMenus();
});
browser.runtime.onInstalled.addListener(rebuildMenus);
browser.runtime.onStartup.addListener(rebuildMenus);
rebuildMenus();
