/* global browser, LorapokDiscord, LorapokStorage */
const form = document.getElementById("channel-form");
const idField = document.getElementById("channel-id");
const nameField = document.getElementById("channel-name");
const urlField = document.getElementById("webhook-url");
const errorField = document.getElementById("form-error");
const list = document.getElementById("channel-list");
const emptyState = document.getElementById("empty-state");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const quickSend = document.getElementById("quick-send");
const toast = document.getElementById("toast");
const extensionVersion = document.getElementById("extension-version");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
let channels = [];
let recent = [];
let toastTimer;
extensionVersion.textContent = browser.runtime.getManifest().version;
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      const visible = (tab === "channels" && (panel.id === "channels-panel" || panel.id === "channel-list-panel")) ||
        panel.id === tab + "-panel";
      panel.classList.toggle("active", visible);
    });
  });
});
function showToast(message) {
  toast.textContent = message; toast.classList.add("visible"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
}
function save() { return browser.storage.local.set({ channels, settings: { quickSend: quickSend.checked } }); }
function resetForm() { form.reset(); idField.value = ""; saveButton.textContent = "Add channel"; cancelButton.classList.add("hidden"); errorField.textContent = ""; }
function render() {
  list.textContent = ""; emptyState.hidden = channels.length > 0;
  channels.forEach((channel) => {
    const item = document.createElement("div"); item.className = "channel";
    const details = document.createElement("div"); details.className = "channel-details";
    const avatar = document.createElement("div"); avatar.className = "channel-avatar"; avatar.textContent = channel.name.slice(0, 1);
    const copy = document.createElement("div"); const title = document.createElement("div"); title.className = "channel-name"; title.textContent = channel.name;
    const url = document.createElement("div"); url.className = "channel-url"; url.textContent = channel.url; details.append(title, url);
    copy.append(title, url); details.append(avatar, copy);
    const actions = document.createElement("div"); actions.className = "channel-actions";
    const label = document.createElement("label"); label.className = "toggle"; const toggle = document.createElement("input"); toggle.type = "checkbox"; toggle.checked = channel.enabled;
    toggle.addEventListener("change", () => { channel.enabled = toggle.checked; save(); }); label.append(toggle, document.createTextNode("Enabled"));
    const test = document.createElement("button"); test.className = "secondary"; test.textContent = "Test"; test.onclick = () => browser.runtime.sendMessage({ type: "test-webhook", url: channel.url }).then(() => showToast("Test signal sent")).catch(() => showToast("Test failed"));
    const edit = document.createElement("button"); edit.textContent = "Edit"; edit.onclick = () => { idField.value = channel.id; nameField.value = channel.name; urlField.value = channel.url; saveButton.textContent = "Save changes"; cancelButton.classList.remove("hidden"); nameField.focus(); };
    const del = document.createElement("button"); del.className = "danger"; del.textContent = "Delete"; del.onclick = () => { if (confirm("Delete " + channel.name + "?")) { channels = channels.filter((entry) => entry.id !== channel.id); save().then(() => { render(); showToast("Channel deleted"); }); } };
    actions.append(label, test, edit, del); item.append(details, actions); list.append(item);
  });
}
function renderHistory() {
  historyList.textContent = ""; historyEmpty.hidden = recent.length > 0;
  recent.forEach((entry) => {
    const item = document.createElement("div"); item.className = "history-item";
    const thumb = document.createElement("div"); thumb.className = "history-thumb";
    if (entry.thumbnail) { const image = document.createElement("img"); image.src = entry.thumbnail; image.alt = ""; thumb.append(image); } else thumb.textContent = "✦";
    const copy = document.createElement("div"); copy.className = "history-copy";
    const title = document.createElement("strong"); title.textContent = entry.channel || "Discord";
    const text = document.createElement("span"); text.textContent = entry.text || "Media signal";
    copy.append(title, text);
    const time = document.createElement("time"); time.className = "history-time"; time.dateTime = new Date(entry.at).toISOString(); time.textContent = new Date(entry.at).toLocaleString();
    item.append(thumb, copy, time); historyList.append(item);
  });
}
form.onsubmit = (event) => {
  event.preventDefault(); errorField.textContent = ""; const name = nameField.value.trim(); const url = urlField.value.trim();
  if (!name) { errorField.textContent = "Enter a channel name."; return; }
  if (!LorapokDiscord.validWebhookUrl(url)) { errorField.textContent = "Enter a valid discord.com or discordapp.com webhook URL."; return; }
  if (idField.value) channels = channels.map((channel) => channel.id === idField.value ? { ...channel, name, url } : channel);
  else channels.push(LorapokStorage.makeChannel(name, url));
  save().then(() => { render(); resetForm(); showToast("Channel saved"); });
};
cancelButton.onclick = resetForm;
quickSend.onchange = save;
urlField.addEventListener("input", () => {
  urlField.classList.toggle("valid", LorapokDiscord.validWebhookUrl(urlField.value.trim()));
  urlField.classList.toggle("invalid", urlField.value.length > 0 && !LorapokDiscord.validWebhookUrl(urlField.value.trim()));
});
browser.storage.local.get(LorapokStorage.defaults).then((data) => {
  const normalized = LorapokStorage.normalize(data); channels = normalized.channels; recent = normalized.recent;
  quickSend.checked = normalized.settings.quickSend; render(); renderHistory();
});
